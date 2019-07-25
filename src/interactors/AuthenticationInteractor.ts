import { DataStore, HashInterface } from './../interfaces/interfaces';
import { TokenManager } from '../drivers/drivers';
import { sanitizeText } from './UserInteractor';
import { AuthUser } from '../shared/typings/auth-user';
import { UserToken } from '../shared/typings/user-token';
import { ResourceError, ResourceErrorReason, handleError } from '../Error';
import { OpenIdToken } from '../CognitoIdentityManager/typings';
import { mapUserDataToAuthUser } from '../shared/functions';

export interface CognitoGateway {
  getOpenIdToken(params: { requester: UserToken }): Promise<OpenIdToken>;
}

/**
 * Attempts user login via datastore and issues JWT access token
 * If credentials valid sends user with token
 * Else sends invalidLogin Response via Responder
 *
 * @export
 * @param {DataStore} dataStore
 * @param {Responder} responder
 * @param {string} username
 * @param {string} password
 */
export async function login(
  dataStore: DataStore,
  hasher: HashInterface,
  username: string,
  password: string,
  cognitoGateway: CognitoGateway
): Promise<{ bearer: string; openId: OpenIdToken; user: AuthUser }> {
  const invalidCredentialsError = new ResourceError(
    'Invalid username or password',
    ResourceErrorReason.BAD_REQUEST
  );
  try {
    const userName = sanitizeText(username);
    const id = await dataStore.findUser(userName);
    if (!id) {
      throw invalidCredentialsError;
    }

    const user = await dataStore.loadUser(id);
    const authenticated = await hasher.verify(password, user.password);
    if (!authenticated) {
      throw invalidCredentialsError;
    }
    const bearer = TokenManager.generateBearerToken(user);
    const requester: UserToken = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      organization: user.organization,
      emailVerified: user.emailVerified,
      accessGroups: user.accessGroups
    };
    const openId = await cognitoGateway.getOpenIdToken({
      requester
    });
    delete user.password;
    return { bearer, openId, user };
  } catch (e) {
    handleError(e);
  }
}

/**
 * Attempt user registration via datastore and issues JWT access token
 * If username is unique sends user with access token
 * Else sends invalidRegistration Response via Responder
 *
 * @export
 * @param {DataStore} datastore
 * @param {Responder} responder
 * @param {User} user
 */
export async function register(
  datastore: DataStore,
  hasher: HashInterface,
  user: AuthUser,
  cognitoGateway: CognitoGateway
): Promise<{ bearer: string; openId: OpenIdToken; user: AuthUser }> {
  try {
    if (!isValidUsername(user.username)) {
      throw new ResourceError(
        'Invalid username provided.',
        ResourceErrorReason.BAD_REQUEST
      );
    }
    if (await datastore.identifierInUse(user.username)) {
      throw new ResourceError(
        'Username is already in use',
        ResourceErrorReason.BAD_REQUEST
      );
    }

    const pwdhash = await hasher.hash(user.password);
    user.password = pwdhash;

    const formattedUser = sanitizeUser(user);
    formattedUser.accessGroups = [];

    const id = await datastore.insertUser(formattedUser);
    user.id = id;

    const bearer = TokenManager.generateBearerToken(user);
    const requester: UserToken = {
      id,
      username: user.username,
      name: user.name,
      email: user.email,
      organization: user.organization,
      emailVerified: user.emailVerified,
      accessGroups: user.accessGroups
    };
    const openId = await cognitoGateway.getOpenIdToken({
      requester
    });
    delete formattedUser.password;
    return {
      bearer,
      openId,
      user: mapUserDataToAuthUser(formattedUser)
    };
  } catch (e) {
    handleError(e);
  }
}

/**
 * Attempts to find the user via username and
 * and checks to see if the provided password is correct.
 *
 * @export
 * @param {DataStore} dataStore
 * @param {Responder} responder
 * @param {string} username
 * @param {string} password
 */
export async function passwordMatch(
  dataStore: DataStore,
  hasher: HashInterface,
  username: string,
  password: string
) {
  try {
    const userName = sanitizeText(username);
    const id = await dataStore.findUser(userName);
    const user = await dataStore.loadUser(id);
    const authenticated = await hasher.verify(password, user.password);
    if (authenticated) {
      return true;
    }
    return false;
  } catch (e) {
    console.log(e);
    return Promise.reject(`Could not perform password match. Error:${e}`);
  }
}

/**
 * Returns latest token and user object
 *
 * @export
 * @param {{
 *   dataStore: DataStore;
 *   requester: UserToken;
 * }} params
 * @returns {Promise<{ bearer: string; openId: OpenIdToken; user: AuthUser }>}
 */
export async function refreshToken({
  dataStore,
  requester,
  cognitoGateway
}: {
  dataStore: DataStore;
  requester: UserToken;
  cognitoGateway: CognitoGateway;
}): Promise<{ bearer: string; openId: OpenIdToken; user: AuthUser }> {
  try {
    const user = await dataStore.loadUser(requester.id);
    const bearer = TokenManager.generateBearerToken(user);
    const newUserToken: UserToken = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      organization: user.organization,
      emailVerified: user.emailVerified,
      accessGroups: user.accessGroups
    };
    const openId = await cognitoGateway.getOpenIdToken({
      requester: newUserToken
    });
    delete user.password;
    return { bearer, openId, user };
  } catch (e) {
    handleError(e);
  }
}

function sanitizeUser(user: AuthUser): AuthUser {
  user.email = sanitizeText(user.email);
  user.name = sanitizeText(user.name);
  user.organization = sanitizeText(user.organization);
  user.bio = sanitizeText(user.bio, false);
  return user;
}

/**
 * Validates that a username meets the defined constraints.
 *
 * Constraints:
 * - 20 characters or less
 * - 3 characters or more
 * @param username the username being validated
 * @returns {boolean} whether or not the username is valid.
 */
export function isValidUsername(username: string): boolean {
  return username.length <= 20 && username.length >= 3;
}
