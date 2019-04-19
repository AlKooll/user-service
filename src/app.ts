import 'dotenv/config';
import * as express from 'express';
import * as http from 'http';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import RouteHandler from './drivers/RouteHandler';
import AuthRouteHandler from './drivers/AuthRouteHandler';
import AdminRouteHandler from './drivers/AdminRouteHandler';
import MongoDriver from './drivers/MongoDriver';
import { SendgridDriver, BcryptDriver } from './drivers/drivers';
import { UserResponseFactory } from './drivers/UserResponseFactory';
import {
  processToken,
  handleProcessTokenError,
  enforceAuthenticatedAccess,
  enforceAdminAccess
} from './middleware';
import { MongoConnectionManager } from './config/mongodb';
import { UserMetaRetriever } from './UserMetaRetriever';
import {
  reportError,
  sentryRequestHandler,
  sentryErrorHandler
} from './shared/SentryConnector';
import { CognitoIdentityManager } from './CognitoIdentityManager';

const HTTP_SERVER_PORT = process.env.PORT || 3000;

const sendgridDriver = new SendgridDriver();
const bcryptDriver = new BcryptDriver(10);
const responseFactory = new UserResponseFactory();

/**
 * Starts the application by
 * Establishing DB connections
 * Initializing modules
 * Initializing express server
 *
 */
async function startApp() {
  try {
    await MongoConnectionManager.establishConnections();
    initModules();
    initExpressServer();
  } catch (e) {
    reportError(e);
  }
}

/**
 * Initializes all Modules for the application
 *
 */
function initModules() {
  UserMetaRetriever.initialize();
  CognitoIdentityManager.initialize();
}

/**
 * Initializes express server
 *
 */
function initExpressServer() {
  const app = express();
  attachConfigHandlers(app);

  /**
   * Public Access Routers
   */
  attachPublicRouters(app);

  /**
   * Authenticated Access Routers
   */
  attachAuthenticatedRouters(app);

  /**
   * Start HTTP Server
   */
  startHttpServer(app);
}

/**
 * Attaches app configuration handlers to Express app
 *
 * @param {Express} app [The express app to attach handlers to]
 */
function attachConfigHandlers(app: express.Express) {
  // These sentry handlers must come first
  app.use(sentryRequestHandler);
  app.use(sentryErrorHandler);
  app.use(logger('dev'));
  app.use(
    bodyParser.urlencoded({
      extended: true
    })
  );
  app.use(bodyParser.json());
  app.use(cors({ origin: true, credentials: true }));
  app.set('trust proxy', true);
  app.use(cookieParser());

  // Attempt to parse token on all requests
  app.use(processToken, handleProcessTokenError);
}

/**
 * Attaches public route handlers to Express app
 *
 * @param {Express} app [The express app to attach handlers to]
 */
function attachPublicRouters(app: express.Express) {
  app.use(
    RouteHandler.buildRouter(
      MongoDriver.getInstance(),
      bcryptDriver,
      sendgridDriver,
      responseFactory
    )
  );
}
/**
 * Attaches route handlers that require authentication to Express app
 *
 * @param {Express} app [The express app to attach handlers to]
 */
function attachAuthenticatedRouters(app: express.Express) {
  app.use(enforceAuthenticatedAccess);
  app.use(
    AuthRouteHandler.buildRouter(
      MongoDriver.getInstance(),
      bcryptDriver,
      responseFactory
    )
  );
  app.use(UserMetaRetriever.expressRouter);
  app.use(CognitoIdentityManager.expressRouter);
  // TODO: Deprecate admin router and middleware in favor of default router with proper authorization logic in interactors
  app.use(enforceAdminAccess);
  app.use(
    '/admin',
    AdminRouteHandler.buildRouter(
      MongoDriver.getInstance(),
      sendgridDriver,
      responseFactory
    )
  );
}

/**
 * Serves Express app via HTTP
 *
 * @param {Express} app [The express app to use as servers request listener]
 */
function startHttpServer(app: express.Express) {
  const server = http.createServer(app);
  server.listen(HTTP_SERVER_PORT, () => {
    console.log(`User Service running on port ${HTTP_SERVER_PORT}`);
  });
}

/**
 * Call start app to run application
 */
startApp();
