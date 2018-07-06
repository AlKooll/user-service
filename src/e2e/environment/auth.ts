import * as requestPromise from 'request-promise';
import * as dotenv from 'dotenv';
dotenv.config();
import { Cookie } from 'tough-cookie';

import axios from 'axios';
import { testUser } from '../mocks/mocks';
import { USER_ENDPOINTS } from '../user-service.routes';

let USERS_API: string;
switch (process.env.NODE_ENV) {
  case 'development':
    USERS_API = process.env.USERS_API_DEV;
    break;
  case 'production':
    USERS_API = process.env.USERS_API;
    break;
  case 'test':
    USERS_API = process.env.USERS_API_TEST;
    break;
  default:
    USERS_API = process.env.USERS_API_DEV;
    break;
}

export async function login(
  username?: string,
  password?: string
): Promise<Cookie> {
  try {
    const response = await requestPromise({
      uri: `${USERS_API}${USER_ENDPOINTS.TOKENS}`,
      method: 'POST',
      body: {
        username: username ? username : testUser.username,
        password: password ? password : testUser.password
      },
      resolveWithFullResponse: true,
      json: true
    });

    const cookieString = response.headers['set-cookie'][0];
    const cookie = Cookie.parse(cookieString);
    return cookie;
  } catch (e) {
    return Promise.reject(`Could not login. Error: ${e}`);
  }
}

export async function createUser(user?: any) {
  try {
    return axios({
      baseURL: USERS_API,
      url: USER_ENDPOINTS.USERS(),
      method: 'POST',
      data: user ? user : testUser
    });
  } catch (e) {
    return Promise.reject(`Could not create user. Error: ${e}`);
  }
}

export async function deleteUser(token?: string, username?: string) {
  try {
    return axios({
      withCredentials: token ? true : false,
      headers: {
        Authorization: token ? `${token}` : ''
      },
      baseURL: USERS_API,
      method: 'DELETE',
      url: USER_ENDPOINTS.DELETE(username ? username : testUser.username)
    });
  } catch (e) {
    console.log(e);
    return Promise.reject(`Could not delete user. Error: ${e}`);
  }
}
