import * as express from 'express';
type Router = express.Router;
import {
  DataStore,
  Responder,
  Mailer,
  HashInterface
} from '../interfaces/interfaces';
import {
  login,
  register,
  logout
} from '../interactors/AuthenticationInteractor';
import { UserResponseFactory, OTACodeManager } from './drivers';
import {
  UserInteractor,
  MailerInteractor,
  OTACodeInteractor
} from '../interactors/interactors';
import { ACCOUNT_ACTIONS } from '../interfaces/Mailer.defaults';
import { REDIRECT_ROUTES } from '../environment/routes';
import { User } from '@cyber4all/clark-entity';
import * as request from 'request';
import { generateToken } from './TokenManager';
import { NotificationManager } from '../MessageService/NotificationManager';
import { sendMessageToSubscribers, sendMessageToAuthor, fetchMessages, deleteMessage } from '../MessageService/MessageInteractor';
const version = require('../package.json').version;

export default class RouteHandler {
  constructor(
    private dataStore: DataStore,
    private hasher: HashInterface,
    private mailer: Mailer,
    private responseFactory: UserResponseFactory
  ) {}

  /**
   * Produces a configured express router
   *
   * @param dataStore the data store that the routes should utilize
   */
  public static buildRouter(
    dataStore: DataStore,
    hasher: HashInterface,
    mailer: Mailer,
    responseFactory: UserResponseFactory,
    notificationManager: NotificationManager
  ) {
    const e = new RouteHandler(dataStore, hasher, mailer, responseFactory);
    const router: Router = express.Router();
    e.setRoutes(router);
    return router;
  }

  private setRoutes(router: Router) {
    // GET: returns welcome message and version number
    // No params necessary
    router.get('/', (req, res) => {
      res.json({
        version,
        message: `Welcome to the Users API v${version}`
      });
    });

    // Register
    // POST: provide JSON object with new user info
    /*
    {
      "username": "string", 
      "firstname": "string", 
      "lastname": "string", 
      "email": "string", 
      "password": "string",
      organization: string
    }
    */
    // Returns either message warning invalid info, or success
    router
      .route('/users')
      .get(async (req, res) => {
        try {
          const query = req.query;
          await UserInteractor.searchUsers(
            this.dataStore,
            this.responseFactory.buildResponder(res),
            query
          );
        } catch (e) {
          this.responseFactory.buildResponder(res).sendOperationError(e);
        }
      })
      .post(async (req, res) => {
        const user = User.instantiate(req.body);
        await register(
          this.dataStore,
          this.responseFactory.buildResponder(res),
          this.hasher,
          user
        );
        try {
          const otaCode = await OTACodeInteractor.generateOTACode(
            this.dataStore,
            ACCOUNT_ACTIONS.VERIFY_EMAIL,
            user.email
          );
          MailerInteractor.sendEmailVerification(
            this.mailer,
            user.email,
            otaCode
          );
        } catch (e) {
          console.log(e);
        }
      })
      .patch(async (req, res) => {
        const responder = this.responseFactory.buildResponder(res);
        try {
          await UserInteractor.editInfo(
            this.dataStore,
            responder,
            req.user.username,
            req.body.user
          );
        } catch (e) {
          responder.sendOperationError(e);
        }
      });
    
    router.post('/learning-objects/:username/:learningObjectName/messages', async (req, res) => {
      // USER_SAVED_OBJECT
      sendMessageToAuthor(
        this.dataStore,
        this.responseFactory.buildResponder(res),
        req.params.username,
        req.params.learningObjectName
      );
    });
    router.post(
      '/learning-objects/:username/:learningObjectName/subscribers/messages',
      async (req, res) => {
        // AUTHOR_UPDATED
        sendMessageToSubscribers(
          this.dataStore,
          this.responseFactory.buildResponder(res),
          req.body.usernames,
          req.params.username,
          req.params.learningObjectName
        );
      }
    );
    router.get('/users/:username/messages', async (req, res) => {
      const userId = req.body.user.id;
      if (req.params.username === req.body.user.username) {
        try {
          const messages = await fetchMessages(this.dataStore, userId);
          res.status(200).json(messages);
        } catch (e) {
          console.error(e);
          res.status(500).send('Error fetching messages');
        }
      } else {
        res.status(401).send('Unauthorized');
      }
      
    });
    router.delete('/users/:username/messages/:id', async (req, res) => {
      const messageId = req.params.id;
      const userId = req.body.user.id;
      const isAuthorized = req.params.username === req.body.user.username;

      if (isAuthorized) {
        try {
          const messages = await deleteMessage(this.dataStore, userId, messageId);
          res.status(200);
        } catch (e) {
          console.error(e);
          res.status(500).send('Error deleting message');
        }
      } else {
        res.status(401).send('Unauthorized');
      }
    });
    // Login
    router.post('/users/tokens', async (req, res) => {
      await login(
        this.dataStore,
        this.responseFactory.buildResponder(res),
        this.hasher,
        req.body.username,
        req.body.password
      );
    });

    router
      .route('/users/tokens')
      // Validate Token
      // Param: Valid token (for testing, get from users/tokens route)
      // if valid, returns OK
      // else, returns "INVALID TOKEN"
      .get(async (req, res) => {
        this.responseFactory.buildResponder(res).sendUser(req['user']);
      });

    router.route('/users/identifiers/active').get(async (req, res) => {
      try {
        await UserInteractor.identifierInUse(
          this.dataStore,
          this.responseFactory.buildResponder(res),
          req.query.username
        );
      } catch (e) {
        console.log(e);
        this.responseFactory.buildResponder(res).sendOperationError(e);
      }
    });
    // refresh token
    router.get('/users/tokens/refresh', async (req, res) => {
      const responder = this.responseFactory.buildResponder(res);
      try {
        const user = await UserInteractor.findUser(
          this.dataStore,
          this.responseFactory.buildResponder(res),
          req.user.username
        );

        if (user) {
          const token = generateToken(user);
          responder.setCookie('presence', token);
          responder.sendUser(user);
        } else {
          responder.sendOperationError('Error: No user found');
        }
      } catch (error) {
        responder.sendOperationError(`Error refreshing token ${error}`);
      }
    });

    router.delete('/users/:username/tokens', async (req, res) => {
      // TODO invalidate JWT here as well as clearing the login cookie
      logout(this.dataStore, this.responseFactory.buildResponder(res));
    });

    router
      .route('/users/ota-codes')
      .post(async (req, res) => {
        try {
          const action = req.query.action;
          const email = req.body.email;
          const responder = this.responseFactory.buildResponder(res);
          const otaCode = await OTACodeInteractor.generateOTACode(
            this.dataStore,
            action,
            email
          );
          switch (action) {
            case ACCOUNT_ACTIONS.VERIFY_EMAIL:
              await MailerInteractor.sendEmailVerification(
                this.mailer,
                email,
                otaCode
              );
              responder.sendOperationSuccess();
              break;
            case ACCOUNT_ACTIONS.RESET_PASSWORD:
              await MailerInteractor.sendPasswordReset(
                this.mailer,
                email,
                otaCode,
                this.dataStore,
                responder
              );
              break;
            default:
              responder.sendOperationError('Invalid action');
          }
        } catch (e) {
          console.log(e);
          this.responseFactory.buildResponder(res).sendOperationError(e);
        }
      })
      .get(async (req, res) => {
        try {
          const otaCode = req.query.otaCode;
          const responder = this.responseFactory.buildResponder(res);
          const decoded = await OTACodeInteractor.decode(
            this.dataStore,
            otaCode
          );
          switch (decoded.action as ACCOUNT_ACTIONS) {
            case ACCOUNT_ACTIONS.VERIFY_EMAIL:
              const user = await UserInteractor.verifyEmail(
                this.dataStore,
                responder,
                decoded.data.email
              );
              // await MailerInteractor.sendWelcomeEmail(this.mailer, user);
              responder.sendObject({ username: user.username });
              break;
            case ACCOUNT_ACTIONS.RESET_PASSWORD:
              responder.redirectTo(REDIRECT_ROUTES.RESET_PASSWORD(otaCode));
              break;
            default:
              responder.sendOperationError('Action invalid');
              break;
          }
        } catch (e) {
          console.log(e);
          this.responseFactory.buildResponder(res).sendOperationError(e);
        }
      })
      .patch(async (req, res) => {
        const responder = this.responseFactory.buildResponder(res);
        try {
          const otaCode = req.query.otaCode;
          const payload = req.body.payload;

          const decoded = await OTACodeInteractor.applyOTACode(
            this.dataStore,
            otaCode
          );

          switch (decoded.action as ACCOUNT_ACTIONS) {
            case ACCOUNT_ACTIONS.VERIFY_EMAIL:
              break;
            case ACCOUNT_ACTIONS.RESET_PASSWORD:
              await UserInteractor.updatePassword(
                this.dataStore,
                this.hasher,
                decoded.data.email,
                payload
              );
              break;
            default:
              responder.sendOperationError('Invalid action.');
              break;
          }
        } catch (e) {
          responder.sendOperationError(e);
        }
      });

    // TODO: Remove account
    // When implemented...
    // provide token, which is then unauthorized, and return success message
    // Need to implement promise rejection catch - error message in console on failure.
    router.delete('/users/:username', async (req, res) => {
      this.responseFactory
        .buildResponder(res)
        .sendOperationError('Cannot delete user accounts at this time');
      throw new Error('Cannot delete user accounts at this time');
    });

    router.get('/validate-captcha', async (req, res) => {
      try {
        const response = await request.post(
          'https://www.google.com/recaptcha/api/siteverify',
          {
            qs: {
              secret: process.env.CAPTCHA_SECRET,
              response: req.query.token
            },
            json: true
          }
        );
        this.responseFactory.buildResponder(res).sendUser(response);
      } catch (e) {
        this.responseFactory
          .buildResponder(res)
          .sendOperationError(`Could not validate captcha. Error: ${e}`);
      }
    });
  }
}
