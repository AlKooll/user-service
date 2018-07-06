import axios, { AxiosRequestConfig } from 'axios';
import { Cookie } from 'tough-cookie';
import * as dotenv from 'dotenv';
import { USER_ENDPOINTS } from './user-service.routes';

import { login, createUser, deleteUser } from './environment/auth';
import { testUser } from './mocks/mocks';
import {
  EXPECTED_USER_PROPS,
  UNEXPECTED_USER_PROPS,
  EXPECTED_TOKEN_PROPS,
  UNEXPECTED_TOKEN_PROPS
} from './models/models';
dotenv.config();

let API_URI: string;
switch (process.env.NODE_ENV) {
  case 'development':
    API_URI = process.env.USERS_API_DEV;
    break;
  case 'production':
    API_URI = process.env.USERS_API;
    break;
  case 'test':
    API_URI = process.env.USERS_API_TEST;
    break;
  default:
    API_URI = process.env.USERS_API_DEV;
    break;
}
const DEFAULT_REQUEST_OPTIONS: AxiosRequestConfig = {
  baseURL: API_URI
};

async function setAuthHeader() {
  try {
    const cookie = await login();
    DEFAULT_REQUEST_OPTIONS.withCredentials = true;
    DEFAULT_REQUEST_OPTIONS.headers = {
      Authorization: `Bearer ${cookie.value}`
    };
    return Promise.resolve();
  } catch (e) {
    console.log(e);
  }
}

function removeAuthHeader() {
  DEFAULT_REQUEST_OPTIONS.withCredentials = false;
  DEFAULT_REQUEST_OPTIONS.headers = {};
}

describe('Unauthenticated Routes', () => {
  describe(USER_ENDPOINTS.BASE, () => {
    it('should return welcome message', async done => {
      expect.hasAssertions();
      const response = await axios(DEFAULT_REQUEST_OPTIONS);
      const result = response.data;
      expect(result).toBeDefined();
      done();
    });
  });

  describe(USER_ENDPOINTS.IDENTIFIER_ACTIVE('username'), () => {
    it('should return false', async done => {
      expect.hasAssertions();
      const response = await axios({
        ...DEFAULT_REQUEST_OPTIONS,
        url: USER_ENDPOINTS.IDENTIFIER_ACTIVE(testUser.username)
      });
      const result = response.data;
      const inUse = result.inUse;
      expect(inUse).toBe(false);
      done();
    });
  });

  describe(USER_ENDPOINTS.USERS(), () => {
    it('should return all users', async done => {
      expect.hasAssertions();
      const response = await axios({
        ...DEFAULT_REQUEST_OPTIONS,
        url: USER_ENDPOINTS.USERS()
      });
      const result = response.data;
      expect(result).toContainEqual(
        expect.objectContaining(EXPECTED_USER_PROPS)
      );
      expect(result).not.toContainEqual(
        expect.objectContaining(UNEXPECTED_USER_PROPS)
      );
      done();
    });
    it('should return all users with towson university as organization', async done => {
      const organization = 'towson university';
      expect.hasAssertions();
      const response = await axios({
        ...DEFAULT_REQUEST_OPTIONS,
        url: USER_ENDPOINTS.USERS({ organization })
      });
      const result = response.data;
      expect(result).toContainEqual(
        expect.objectContaining({
          ...EXPECTED_USER_PROPS,
          _organization: expect.stringContaining(organization)
        })
      );
      expect(result).not.toContainEqual(
        expect.objectContaining(UNEXPECTED_USER_PROPS)
      );
      done();
    });
    it('should return no users', async done => {
      const text = 'undefined';
      expect.hasAssertions();
      const response = await axios({
        ...DEFAULT_REQUEST_OPTIONS,
        url: USER_ENDPOINTS.USERS({ text })
      });
      const result = response.data;
      expect(result).toEqual([]);
      done();
    });

    describe('create user', () => {
      it('should create a new user', async done => {
        const response = await createUser();
        const result = response.data;
        expect(result).toEqual(
          expect.objectContaining({
            ...EXPECTED_USER_PROPS,
            _username: testUser.username.toLowerCase(),
            _name: testUser.name.toLowerCase(),
            _email: testUser.email.toLowerCase(),
            _organization: testUser.organization.toLowerCase(),
            _bio: testUser.bio,
            _objects: []
          })
        );
        expect(result).not.toEqual(
          expect.objectContaining(UNEXPECTED_USER_PROPS)
        );
        done();
      });

      it('should not create a new user and throw error for username in use', async done => {
        expect.hasAssertions();
        try {
          await createUser();
        } catch (e) {
          const response = e.response;
          const status = response.status;
          const message = response.data.toLowerCase();
          expect(status).toEqual(400);
          expect(message).toEqual(expect.stringContaining('invalid'));
          expect(message).toEqual(expect.stringContaining('username'));
        }
        done();
      });

      // tslint:disable-next-line:max-line-length
      it('should not create a new user and throw error for username being too short', async done => {
        expect.hasAssertions();
        try {
          await createUser({ ...testUser, username: '2i' });
        } catch (e) {
          const response = e.response;
          const status = response.status;
          const message = response.data.toLowerCase();
          expect(status).toEqual(400);
          expect(message).toEqual(expect.stringContaining('invalid'));
          expect(message).toEqual(expect.stringContaining('username'));
        }
        done();
      });

      it('should not create a new user and throw error for username being too long', async done => {
        expect.hasAssertions();
        try {
          await createUser({
            ...testUser,
            username: 'waaaaaaayyyytooooolong'
          });
        } catch (e) {
          const response = e.response;
          const status = response.status;
          const message = response.data.toLowerCase();
          expect(status).toEqual(400);
          expect(message).toEqual(expect.stringContaining('invalid'));
          expect(message).toEqual(expect.stringContaining('username'));
        }
        done();
      });
    });
  });

  describe(USER_ENDPOINTS.IDENTIFIER_ACTIVE('username'), () => {
    it('should return true', async done => {
      expect.hasAssertions();
      const response = await axios({
        ...DEFAULT_REQUEST_OPTIONS,
        url: USER_ENDPOINTS.IDENTIFIER_ACTIVE(testUser.username)
      });
      const result = response.data;
      const inUse = result.inUse;
      expect(inUse).toBe(true);
      done();
    });
  });

  describe(USER_ENDPOINTS.TOKENS, () => {
    describe('successful login', () => {
      it('should create token for user', async done => {
        expect.hasAssertions();
        const cookie = await login();
        expect(cookie).toBeInstanceOf(Cookie);
        done();
      });
    });

    describe('failed login', () => {
      it('should not create token for user', async done => {
        expect.hasAssertions();
        try {
          const cookie = await login(testUser.username, 'incorrect password');
        } catch (e) {
          e = e.toLowerCase();
          expect(e).toEqual(expect.stringContaining('400'));
          expect(e).toEqual(expect.stringContaining('invalid'));
          expect(e).toEqual(expect.stringContaining('username'));
          expect(e).toEqual(expect.stringContaining('password'));
        }
        done();
      });
    });
  });

  describe(USER_ENDPOINTS.PROFILE('username'), () => {
    it('should return full user', async done => {
      expect.hasAssertions();
      const response = await axios({
        ...DEFAULT_REQUEST_OPTIONS,
        url: USER_ENDPOINTS.PROFILE(testUser.username)
      });
      const result = response.data;
      expect(result).toEqual(expect.objectContaining(EXPECTED_USER_PROPS));
      expect(result).not.toEqual(
        expect.objectContaining(UNEXPECTED_USER_PROPS)
      );
      done();
    });

    it('should not return a user', async done => {
      expect.hasAssertions();
      try {
        await axios({
          ...DEFAULT_REQUEST_OPTIONS,
          url: USER_ENDPOINTS.PROFILE('undefined')
        });
      } catch (e) {
        const response = e.response;
        const status = response.status;
        const message = response.data.toLowerCase();
        expect(status).toEqual(400);
        expect(message).toEqual(expect.stringContaining('no'));
        expect(message).toEqual(expect.stringContaining('user'));
        expect(message).toEqual(expect.stringContaining('username'));
        expect(message).toEqual(expect.stringContaining('email'));
        expect(message).toEqual(expect.stringContaining('exists'));
      }
      done();
    });
  });
});

describe('Authenticated Routes', () => {
  beforeAll(async done => {
    await setAuthHeader();
    done();
  });
  afterAll(done => {
    removeAuthHeader();
    done();
  });

  describe(USER_ENDPOINTS.TOKENS, () => {
    describe('successful validate', () => {
      it(`should return user's token`, async done => {
        expect.hasAssertions();
        const response = await axios({
          ...DEFAULT_REQUEST_OPTIONS,
          url: USER_ENDPOINTS.TOKENS
        });
        const result = response.data;
        expect(result).toEqual(
          expect.objectContaining({
            ...EXPECTED_TOKEN_PROPS,
            username: testUser.username.toLowerCase(),
            name: testUser.name.toLowerCase(),
            email: testUser.email.toLowerCase(),
            organization: testUser.organization.toLowerCase()
          })
        );
        expect(result).not.toEqual(UNEXPECTED_TOKEN_PROPS);
        done();
      });
    });
  });

  describe(USER_ENDPOINTS.TOKEN_REFRESH, () => {
    it('should refresh token for user', async done => {
      expect.hasAssertions();
      const response = await axios({
        ...DEFAULT_REQUEST_OPTIONS,
        url: USER_ENDPOINTS.TOKENS
      });
      const result = response.data;
      expect(result).toEqual(
        expect.objectContaining({
          ...EXPECTED_TOKEN_PROPS,
          username: testUser.username.toLowerCase(),
          name: testUser.name.toLowerCase(),
          email: testUser.email.toLowerCase(),
          organization: testUser.organization.toLowerCase()
        })
      );
      expect(result).not.toEqual(UNEXPECTED_TOKEN_PROPS);
      done();
    });
  });

  describe(USER_ENDPOINTS.USERS(), () => {
    describe('Update user', () => {
      it(`should update user's name and bio`, async done => {
        expect.hasAssertions();
        const newName = 'New Tester';
        const newBio = 'I am the greatest test user of all time.';
        const response = await axios({
          ...DEFAULT_REQUEST_OPTIONS,
          url: USER_ENDPOINTS.USERS(),
          method: 'PATCH',
          data: {
            user: {
              name: newName,
              email: testUser.email,
              organization: testUser.organization,
              bio: newBio
            }
          }
        });
        expect(response.status).toEqual(200);
        done();
      });
    });

    describe(USER_ENDPOINTS.LOGOUT('username'), () => {
      it('should delete token for user', async done => {
        expect.hasAssertions();
        const response = await axios({
          ...DEFAULT_REQUEST_OPTIONS,
          method: 'DELETE',
          url: USER_ENDPOINTS.LOGOUT(testUser.username)
        });
        const status = response.status;
        expect(status).toEqual(200);
        done();
      });
    });
    describe(USER_ENDPOINTS.PASSWORD('password'), () => {
      it('should return true', async done => {
        expect.hasAssertions();
        const response = await axios({
          ...DEFAULT_REQUEST_OPTIONS,
          url: USER_ENDPOINTS.PASSWORD(testUser.password)
        });
        const status = response.data;
        expect(status).toEqual(true);
        done();
      });
    });
    describe(USER_ENDPOINTS.DELETE('username'), () => {
      it('should delete user and logout', async done => {
        expect.hasAssertions();
        const response = await deleteUser(
          DEFAULT_REQUEST_OPTIONS.headers.Authorization
        );
        const status = response.status;
        expect(status).toEqual(200);
        done();
      });
    });
  });
});

describe('Authenticated Routes Without Authorization', () => {
  beforeEach(done => {
    removeAuthHeader();
    done();
  });

  describe(USER_ENDPOINTS.TOKENS, () => {
    describe('failed validate', () => {
      it(`should not return user's token; should receive 401 for invalid token`, async done => {
        expect.hasAssertions();
        try {
          await axios({
            ...DEFAULT_REQUEST_OPTIONS,
            url: USER_ENDPOINTS.TOKENS
          });
        } catch (e) {
          const response = e.response;
          const status = response.status;
          const message = response.data.toLowerCase();
          expect(status).toEqual(401);
          expect(message).toEqual(expect.stringContaining('invalid'));
          expect(message).toEqual(expect.stringContaining('token'));
        }
        done();
      });
    });
  });

  describe(USER_ENDPOINTS.TOKEN_REFRESH, () => {
    it('should not refresh token for user; should receive 401 for invalid token', async done => {
      expect.hasAssertions();
      try {
        await axios({
          ...DEFAULT_REQUEST_OPTIONS,
          url: USER_ENDPOINTS.TOKENS
        });
      } catch (e) {
        const response = e.response;
        const status = response.status;
        const message = response.data.toLowerCase();
        expect(status).toEqual(401);
        expect(message).toEqual(expect.stringContaining('invalid'));
        expect(message).toEqual(expect.stringContaining('token'));
      }
      done();
    });
  });

  describe(USER_ENDPOINTS.USERS(), () => {
    describe('Update user', () => {
      // tslint:disable-next-line:max-line-length
      it(`should not update user's name and bio; should receive 401 for invalid token`, async done => {
        expect.hasAssertions();
        try {
          const newName = 'New Tester';
          const newBio = 'I am the greatest test user of all time.';
          await axios({
            ...DEFAULT_REQUEST_OPTIONS,
            url: USER_ENDPOINTS.USERS(),
            method: 'PATCH',
            data: {
              user: {
                name: newName,
                email: testUser.email,
                organization: testUser.organization,
                bio: newBio
              }
            }
          });
        } catch (e) {
          const response = e.response;
          const status = response.status;
          const message = response.data.toLowerCase();
          expect(status).toEqual(401);
          expect(message).toEqual(expect.stringContaining('invalid'));
          expect(message).toEqual(expect.stringContaining('token'));
        }
        done();
      });
    });

    describe(USER_ENDPOINTS.LOGOUT('username'), () => {
      it('should not delete token for user; should receive 401 for invalid token', async done => {
        expect.hasAssertions();
        try {
          await axios({
            ...DEFAULT_REQUEST_OPTIONS,
            method: 'DELETE',
            url: USER_ENDPOINTS.LOGOUT(testUser.username)
          });
        } catch (e) {
          const response = e.response;
          const status = response.status;
          const message = response.data.toLowerCase();
          expect(status).toEqual(401);
          expect(message).toEqual(expect.stringContaining('invalid'));
          expect(message).toEqual(expect.stringContaining('token'));
        }
        done();
      });
    });
    describe(USER_ENDPOINTS.PASSWORD('password'), () => {
      it('should not return true; should receive 401 for invalid token', async done => {
        expect.hasAssertions();
        try {
          await axios({
            ...DEFAULT_REQUEST_OPTIONS,
            url: USER_ENDPOINTS.PASSWORD(testUser.password)
          });
        } catch (e) {
          const response = e.response;
          const status = response.status;
          const message = response.data.toLowerCase();
          expect(status).toEqual(401);
          expect(message).toEqual(expect.stringContaining('invalid'));
          expect(message).toEqual(expect.stringContaining('token'));
        }
        done();
      });
    });
    describe(USER_ENDPOINTS.DELETE('username'), () => {
      it('should not delete user and logout; should receive 401 for invalid token', async done => {
        expect.hasAssertions();
        try {
          await deleteUser(DEFAULT_REQUEST_OPTIONS.headers.Authorization);
        } catch (e) {
          const response = e.response;
          const status = response.status;
          const message = response.data.toLowerCase();
          expect(status).toEqual(401);
          expect(message).toEqual(expect.stringContaining('invalid'));
          expect(message).toEqual(expect.stringContaining('token'));
        }
        done();
      });
    });
  });
});
