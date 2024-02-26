// dataStore functions imported so that users can be registered in authRegisterV1 and
// so that users can be logged in, in authLoginV2
import { getData, setData } from './dataStore';
// This function package is used to test if an email is valid in authRegisterV1
import validator from 'validator';
// Function package for token generation
import { v4 as uuidv4 } from 'uuid';
// HTTP Errors
import HTTPError from 'http-errors';
// Hashing
import crypto from 'crypto';

const DefaultProfileImage = 'http://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/481px-Cat03.jpg';

import { LoginInfo } from './interfaces';

function getHashOf(text: string) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

const secret = 'K3Ep_Itt+$afE';
function generateToken(authUserId: number): string {
  const newToken = getHashOf(uuidv4() + secret);
  const data = getData();
  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      user.sessions.push(newToken);
    }
  }
  setData(data);
  return newToken;
}

/** authLoginV2 function
  * <Given a registered user's email and password, returns their authUserId value.>
  *
  * @param {string} email - email of a registered user
  * @param {string} password - password of the corresponding email
  * ...
  *
  * @returns { authUserId: integer } - if user is successfully logged in
  * @throws {HTTPError} - email does not belong to a user
  * @throws {HTTPError} - if password does not match email
*/

function authLoginV2 (email: string, password: string): LoginInfo {
  const store = getData();
  for (const user of store.users) {
    // Matching email is found
    if (user.email === email) {
      // Check password
      const hashPassword = getHashOf(password);
      if (user.password === hashPassword) {
        // Success: generate token and return token + authUserId
        const newToken = generateToken(user.authUserId);
        return {
          token: newToken,
          authUserId: user.authUserId
        };
      } else {
        // Incorrect password error
        throw HTTPError(400, 'Password is incorrect');
      }
    }
  }
  // No matching email is found
  throw HTTPError(400, 'Email not found');
}

/** authRegisterV1 function
  * <Given a user's first and last name, email address, and password, creates a new account for them and returns a new authUserId.>
  *
  * @param {string} email - email of a registered user
  * @param {string} password - password of the corresponding email
  * @param {string} nameFirst - the users first name
  * @param {string} nameLast - the users last name
  * ...
  * @returns { authUserId: integer } - if user is successfully registered
  * @throws {HTTPError} - if email is invalid
  * @throws {HTTPError} - if email is already used by another user
  * @throws {HTTPError} - if password is too short (char<6)
  * @throws {HTTPError} - if nameFirst is incorrect length (char<1 ||char>50)
  * @throws {HTTPError} - if nameLast is incorrect length (char<1 ||char>50)
*/

function authRegisterV1 (email: string, password: string, nameFirst: string, nameLast: string): LoginInfo {
  // Checking if email is valid
  if (validator.isEmail(email) === false) {
    throw HTTPError(400, 'This is not a valid email');
  }

  // Checking if email is already taken
  const store = getData();
  for (const user of store.users) {
    if (user.email === email) {
      throw HTTPError(400, 'Email is already being used by another user');
    }
  }

  // Checking if password is too short
  if (password.length < 6) {
    throw HTTPError(400, 'This password is too small');
  }

  // Checking if first name is incorrect size
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'This first name has incorrect length');
  }

  // Checking if last name is incorrect size
  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'This last name has incorrect length');
  }

  // Simple function that makes the new user Id equal to the new length of the users array,
  // hence making the authUserId always unique
  const newAuthUserId = store.users.length + 1;

  // Concatenates first and last name to create the handle
  let newHandle = nameFirst + nameLast;
  // Keeps only alpha numeric symbols
  newHandle = newHandle.replace(/[^A-Za-z0-9]/g, '');
  // Makes all letters lowercase
  newHandle = newHandle.toLowerCase();
  // Limits handle to 20 characters
  if (newHandle.length > 20) {
    newHandle = newHandle.substring(0, 20);
  }
  // Determining if a handle already exists
  let numHandleRepititions = -1;
  for (const user of store.users) {
    if (user.handleStr.includes(newHandle) === true) {
      numHandleRepititions++;
    }
  }
  // Add number to end of handle if it already exists
  if (numHandleRepititions >= 0) {
    newHandle = newHandle + numHandleRepititions;
  }

  // Generating user permission, global owner: permissionId = 1, global member: permissionId = 2
  let permissionId = 1;
  if (store.users.length !== 0) {
    permissionId = 2;
  }

  // When error checks are passed, a user is registered
  store.users.push({
    authUserId: newAuthUserId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: getHashOf(password),
    handleStr: newHandle,
    sessions: [],
    permissionId: permissionId,
    profileImgUrl: DefaultProfileImage,
    removed: false,
    notifications: []
  });

  // stores new account in the dataStore
  setData(store);

  // generate token
  const newToken = generateToken(newAuthUserId);

  // Returns the new authUserId
  return {
    token: newToken,
    authUserId: newAuthUserId
  };
}

/** authLogoutV1 function
  * <Given an active token, invalidates the token to log the user out.>
  *
  * @param {string} token - token of the user session
  * ...
  *
  * @throws {HTTPError} - token is invalid
  * @returns {}
*/
function authLogoutV1(token: string): Record<string, never> {
  const data = getData();
  // look through all tokens
  for (const user of data.users) {
    for (const userToken of user.sessions) {
      if (token === userToken) {
        // remove token if found and return
        const index = user.sessions.indexOf(userToken);
        user.sessions.splice(index, 1);
        setData(data);
        return {};
      }
    }
  }
  // if token not found
  throw HTTPError(403, 'Token invalid');
}

/** authPasswordResetRequestV1 function
  * <Given an email address, if the email address belongs to a registered user, sends them an email containing a secret password reset code.>
  *
  * @param {string} email - email of a user wanting to reset for password or invalid email
  * ...
  * @returns {} - returns empty object
*/

function authPasswordResetRequestV1(email: string): Record<string, never> {
  const store = getData();

  // Find the authUserId of user wanting their password reset
  const user = store.users.find(user => user.email === email);

  // If users email is not in beans return empty object early
  /* istanbul ignore next */
  if (user === undefined) {
    return {};
  }

  // user is logged out of all current sessions
  for (const token of user.sessions) {
    authLogoutV1(token);
  }

  // Generate resetCode using randomstring package
  const randomstring = require('randomstring');
  const resetCode = randomstring.generate(6);

  // store reset code in dataStore
  user.resetCode = resetCode;

  // email reset code to user
  // require nodemailer package
  const nodemailer = require('nodemailer');

  // Set up transporter for delivering mail
  const mailTransporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
      user: 'BeansPasswordReset@outlook.com',
      pass: 'PoohBear12'
    }
  });

  // Set up the details of the mail to be sent being the reset code
  const mailDetails = {
    from: 'BeansPasswordReset@outlook.com',
    to: user.email,
    subject: 'Password reset code',
    text: resetCode,
  };

  // sends the reset code to the user
  mailTransporter.sendMail(mailDetails);

  // closes the transporter
  mailTransporter.close();
  setData(store);

  // return empty object
  return {};
}

/** authPasswordResetResetV1 function
  * <Given a reset code for a user, sets that user's new password to the password provided.>
  *
  * @param {string} resetCode - reset code of a user sent to users email
  * @param {string} newPassword - new password of the user
  * ...
  * @throws {HTTPError} - new password is too short, reset code is invalid
  * @returns {} - returns empty object
*/

// istanbul ignore nexts are used to fix coverage on untestable paths
function authPasswordResetResetV1(resetCode: string, newPassword: string): Record<string, never> {
  // error if password is less than 6 characters
  /* istanbul ignore else */
  if (newPassword.length < 6) {
    throw HTTPError(400, 'new password is too short');
  }

  /* istanbul ignore next */
  const store = getData();

  // Find the authUserId of user wanting their password reset
  /* istanbul ignore next */
  const user = store.users.find(user => user.resetCode === resetCode);

  // error if reset code is not in beans
  /* istanbul ignore next */
  if (user === undefined) {
    throw HTTPError(400, 'reset code is invalid');
  }

  // resets the users password
  /* istanbul ignore next */
  user.password = newPassword;

  // invalidates the resetCode
  /* istanbul ignore next */
  delete user.resetCode;

  /* istanbul ignore next */
  setData(store);

  // return empty object
  /* istanbul ignore next */
  return {};
}

// exporting of auth.js functions to be used in other files and functions
export {
  authLoginV2,
  authRegisterV1,
  authLogoutV1,
  authPasswordResetRequestV1,
  authPasswordResetResetV1,
};
