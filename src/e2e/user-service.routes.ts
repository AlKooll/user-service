import * as querystring from 'querystring';
export const USER_ENDPOINTS = {
  BASE: '/',
  USERS(query?: any) {
    return `/users?${querystring.stringify(query)}`;
  },
  TOKENS: '/users/tokens',
  TOKEN_REFRESH: '/users/tokens/refresh',
  LOGOUT(username: string) {
    return `/users/${username}/tokens`;
  },
  PASSWORD(password: string) {
    return `/users/password?password=${password}`;
  },
  PROFILE(username: string) {
    return `/users/${username}/profile`;
  },
  IDENTIFIER_ACTIVE(username: string) {
    return `/users/identifiers/active?username=${username}`;
  },
  OTA_CODES(query: { otaCode?: string; action?: string }) {
    return `/users/ota-codes?${querystring.stringify(query)}`;
  },
  DELETE(username: string) {
    return `/users/${username}/account`;
  },
  CAPTCHA(token: string) {
    return `/validate-captcha?token=${token}`;
  }
};
