import {
  DataStore,
  Responder,
  HashInterface,
  Mailer
} from './../interfaces/interfaces';
import { TokenManager, OTACodeManager } from '../drivers/drivers';
import { User } from '@cyber4all/clark-entity';
import { ACCOUNT_ACTIONS } from '../interfaces/Mailer.defaults';

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
  responder: Responder,
  hasher: HashInterface,
  username: string,
  password: string
) {
  try {
    let id;

    try {
      id = await dataStore.findUser(username);
    } catch (e) {
      responder.invalidLogin();
      return;
    }

    const user = await dataStore.loadUser(id);
    const authenticated = await hasher.verify(password, user.password);
    delete user.password;

    if (authenticated) {
      const token = TokenManager.generateToken(user);
      responder.setCookie('presence', token);
      responder.sendUser(user);
    } else {
      responder.invalidLogin();
    }
  } catch (e) {
    console.log(e);
    responder.sendOperationError(e);
  }
}

export async function logout(dataStore: DataStore, responder: Responder) {
  responder.removeCookie('presence');
  responder.sendOperationSuccess();
}

/**
 * Attempt user registraction via datastore and issues JWT access token
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
  responder: Responder,
  hasher: HashInterface,
  user: User
) {
  try {
    if (
      isValidUsername(user.username) &&
      isValidPassword(user.password) &&
      !await datastore.identifierInUse(user.username)
    ) {
      const pwdhash = await hasher.hash(user.password);
      user.password = pwdhash;
      const userID = await datastore.insertUser(user);
      const token = TokenManager.generateToken(user);
      delete user.password;
      responder.setCookie('presence', token);
      responder.sendUser(user);
    } else {
      responder.sendOperationError('Invalid username or password provided.', 400);
    }
  } catch (e) {
    console.log(e);
    responder.sendOperationError(e);
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
  responder: Responder,
  hasher: HashInterface,
  username: string,
  password: string
) {
  try {
    let id;
    // User is already logged in, should never return invalid login
    try {
      id = await dataStore.findUser(username);
    } catch (e) {
      responder.invalidLogin();
      return;
    }
    const user = await dataStore.loadUser(id);
    const authenticated = await hasher.verify(password, user.password);
    delete user.password;

    if (authenticated) {
      responder.sendPasswordMatch(true);
    } else {
      responder.sendPasswordMatch(false);
    }
  } catch (e) {
    console.log(e);
    responder.sendOperationError(e);
  }
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
  let flag = false;  //Used to find Errors in the username

  //Checks if username starts with number (also checks if the username is all numbers)
  if (Number(username.substring(0, 1))) {
    flag = true;
  }

  //Goes through unusable symbols
  if(/^[a-zA-Z0-9_]*$/.test(username) == false) {
    flag = true;
  }

  //Goes through unusable keywords
  let unusable = ['undefined', 'null', 'void', 'NaN'];
  unusable.forEach(function(val) {
    if (val === username){
      flag = true;
    }
  });

  return username.length <= 20 && username.length >= 3 && !flag;
}

/**
* Takes a password string and makes sure it is of the correct structure (IE numbers, symbols, etc)
* @param password
*/
export function isValidPassword(password: string) {
 // no need to pass through regex loop if length is bad
 if (password.length < 3) {
   return false;
 }

 // length is OK, let's check for proper structure
 const r: RegExp = /([0-9]{1})|([a-z]){1}|([A-Z]){1}|([!,@#$%^&|~`\]\[\{\}<>.\\_\-+=\(\)/?]{1})/g;
 let match = r.exec(password);

 /**
  * [0] = numbers (we'd like >= 1 here)
  * [1] = lower case letters (we'd like >= 2 here)
  * [2] = upper case letters (we'd like >= 1 here)
  * [3] = symbols (we'd like >= 1 here)
  */
 const CAPTURE_GROUPS = 4; // number of capture groups in regex
 const gate = [1, 2, 1, 1]; // this is an array of required minimum counts for each of the possible capture groups
 const matches = Array(4).fill(0); // this is where we'll store the counts for each group
  // using the exec function, gather all matches and store the total number of matches for each group in matches array
 while (match != null) {
   const groups = match.slice(1, 5); // slice the group indexes out of the returned array (the rest are irrelevent here)
   for (let i = 0; i < CAPTURE_GROUPS; i++) {
     if (typeof groups[i] !== 'undefined') {
       // we've located the group this is matched with, increment the number at the corresponding index in the matches array
       matches[i]++;
       break;
     }
   }

   // continue to next match
   match = r.exec(password);
 }

 // we should now have an Array(4) with each index containing the number of matches from each of the 4 possible groups
 // we'll iterate the gate array, and make sure that for each value, the corresponding value in the matches array is >=
 for (let i = 0; i < CAPTURE_GROUPS; i++) {
   if (gate[i] > matches[i]) {
     return false; // bad password
   }
 }

 return true;
}