import * as jwt from 'jsonwebtoken';
import { User } from '@cyber4all/clark-entity';

/**
 * Takes a user object and generates a JWT for the user
 * @param user contains the user's id, username, firstname, lastname, and email
 */
export function generateToken(user: User) {
  const payload = {
    username: user.username,
    name: user.name,
    email: user.email,
    organization: user.organization,
    emailVerified: user.emailVerified
  };
  const options = {
    issuer: process.env.ISSUER,
    expiresIn: 86400,
    audience: user.username
  };
  const token = jwt.sign(payload, process.env.KEY, options);
  return token;
}

export function generateServiceToken() {
  const payload = {
    SERVICE_KEY: process.env.SERVICE_KEY
  };
  const options = {
    issuer: process.env.ISSUER,
    expiresIn: 86400,
    audience: 'https://clark.center'
  };
  return jwt.sign(payload, process.env.KEY, options);
}

/**
 * Accepts a JWT and verifies that the token has been properly issued
 *
 * @param token the JWT as a string
 * @param callback the function to execute after verification
 */
export function verifyJWT(
  token: string,
  res: any,
  callback: Function
): boolean {
  try {
    const decoded = jwt.verify(token, process.env.KEY, {});

    if (typeof callback === 'function') {
      callback(status, decoded);
    }

    return true;
  } catch (error) {
    return false;
  }
}
