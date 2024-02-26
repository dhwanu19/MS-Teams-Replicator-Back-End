import { getData, setData } from './dataStore';
import { getUserId, isTokenValid, isuIdValid } from './other';
import validator from 'validator';
import HTTPError from 'http-errors';
import fs from 'fs';
import request from 'sync-request';
import Jimp from 'jimp/es';
import sizeOf from 'buffer-image-size';
import config from './config.json';

interface User {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  profileImgUrl: string
}

/**
  * Creates a new channel with the given name, that is either a public or private channel.
  * The user who created it automatically joins the channel.
  *
  * @param {number} authUserId - stores userId of the user.
  * @param {number} uId - stores uId of the user.

  * ...
  *
  * @returns {object} - valid authUserId and uId refers to a valid user.
*/
function userProfileV1(token: string, uId: number) {
  // Loop through all the users and if the token does not match anyone's return "Token is invalid".
  if (!isTokenValid(token)) {
    throw HTTPError(
      403, 'Token is invalid'
    );
  }

  // Loop through all the users and if the uId does not match anyone's return "uId doesn't exist".
  if (!isuIdValid(uId)) {
    throw HTTPError(
      400, 'uId is invalid'
    );
  }

  const store = getData();
  // Returning information about the user.
  for (const user of store.users) {
    if (user.authUserId === uId) {
      const userProfile: User = {
        uId: user.authUserId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr,
        profileImgUrl: user.profileImgUrl
      };
      return {
        user: userProfile
      };
    }
  }
}

/**
  * <Updates the authorised user's handle (i.e. display name).>
  *
  * @param {string} token - token of user session
  * @param {string} handelStr - handle string
  * ...
  *
  * @throws {HTTPError} - token is invalid, handle has incorrect length, handle contains non-alphanumeric characters, handle is already taken by user,
  * @returns {} - all works
*/

function userProfileSethandleV1(token: string, handleStr: string): object {
  // is token invalid
  if (isTokenValid(token) === false) {
    throw HTTPError(
      403, 'Token is invalid'
    );
  }

  // is handleStr of incorrect length
  if ((handleStr.length < 3) || (handleStr.length > 20)) {
    throw HTTPError(
      400, 'Handle has incorrect length'
    );
  }

  // Does handleStr contain non-alphanumeric characters
  if (/[^a-zA-Z\d]/.test(handleStr) === true) {
    throw HTTPError(
      400, 'Handle contains non-alphanumeric characters'
    );
  }

  // is handleStr already taken
  const store = getData();
  let handleTaken = false;
  for (const user of store.users) {
    if (user.handleStr === handleStr && user.removed === false) {
      handleTaken = true;
    }
  }
  if (handleTaken === true) {
    throw HTTPError(
      400, 'Handle is already taken by a user'
    );
  }

  // Errors checked, now update the handleStr
  const authUserId = getUserId(token);
  for (const user of store.users) {
    if (user.authUserId === authUserId) {
      user.handleStr = handleStr;
    }
  }

  setData(store);

  return {};
}

/**
  * <Updates the authorised user's first and last name.>
  *
  * @param {string} token - token of user session
  * @param {string} nameFirst - first name string
  * @param {string} nameLast - last name string
  * ...
  *
  * @throws {HTTPError} - token is invalid, nameFirst has incorrect length, nameLast has incorrect length
  * @returns {} - all works
*/

function userProfileSetnameV1(token: string, nameFirst: string, nameLast: string): Record<string, never> {
  // is token invalid
  const store = getData();

  if (isTokenValid(token) === false) {
    throw HTTPError(
      403, 'Token is invalid'
    );
  }

  // is nameFirst of incorrect length
  if ((nameFirst.length < 1) || (nameFirst.length > 50)) {
    throw HTTPError(
      400, 'nameFirst has incorrect length'
    );
  }

  // is nameLast of incorrect length
  if ((nameLast.length < 1) || (nameLast.length > 50)) {
    throw HTTPError(
      400, 'nameLast has incorrect length'
    );
  }

  // Errors checked, now update the name
  const authUserId = getUserId(token);
  for (const user of store.users) {
    if (user.authUserId === authUserId) {
      user.nameFirst = nameFirst;
      user.nameLast = nameLast;
    }
  }

  setData(store);

  return {};
}

/**
  * <Returns an array of all users and their associated details.>
  *
  * @param {string} token - token of user session
  * ...
  *
  * @throws {HTTPError} - token is invalid
  * @returns {users} - all works
*/

function usersAllV1(token:string) {
  const store = getData();
  // is token valid error checking
  if (isTokenValid(token) === false) {
    throw HTTPError(
      403, 'error'
    );
  }

  // implementation
  const usersList = [];
  for (const user of store.users) {
    if (!user.removed) {
      usersList.push({
        uId: user.authUserId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr,
        profileImgUrl: user.profileImgUrl
      });
    }
  }

  return {
    users: usersList
  };
}

/**
  * <Updates the authorised user's email address.>
  *
  * @param {string} token - token of user session
  * @param {string} email - email
  * ...
  *
  * @throws {HTTPError} - token is invalid, email is already taken, invalid email
  * @returns {} - all works
*/
function userProfileSetemailV1(token: string, email: string): Record<string, never> {
  const store = getData();

  // is token invalid
  if (isTokenValid(token) === false) {
    throw HTTPError(
      403, 'Token is invalid'
    );
  }

  // is email already taken
  let emailtaken = false;
  for (const user of store.users) {
    if (user.email === email && user.removed === false) {
      emailtaken = true;
    }
  }
  if (emailtaken === true) {
    throw HTTPError(
      400, 'email is already taken by a user'
    );
  }

  // is email valid
  if (validator.isEmail(email) === false) {
    throw HTTPError(
      400, 'This is not a valid email'
    );
  }

  // Errors checked, now update the email
  const authUserId = getUserId(token);
  for (const user of store.users) {
    if (user.authUserId === authUserId) {
      user.email = email;
    }
  }
  setData(store);

  return {};
}

/**
  * <Given a URL of an image on the internet, crops the image within bounds (xStart, yStart) and (xEnd, yEnd).>
  *
  * @param {string} token - Token of user uploading photo
  * @param {string} imgUrl - imgUrl of photo
  * @param {number} xStart - left most crop boundary
  * @param {number} yStart - upper most crop boundary
  * @param {number} xEnd - right most crop boundary
  * @param {number} yEnd - bottom most crop boundary
  * ...
  *
  * @throws {HTTPError} - invalid token
  * @throws {HTTPError} - xEnd <= xStart or yEnd <= yStart
  * @throws {HTTPError} - imgUrl is not a jpg
  * @throws {HTTPError} - imgUrl link throws an error
  * @throws {HTTPError} - crop dimensions outside the image dimensions
  * @returns {} - everything works
*/

function userProfileUploadphoto(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number): Record<string, never> {
  const data = getData();
  // Error Checking
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid Token');
  }
  if (xEnd <= xStart || yEnd <= yStart) {
    throw HTTPError(400, 'xEnd or yEnd is less than or equal to start location');
  }
  if (!imgUrl.endsWith('.jpg')) {
    throw HTTPError(400, 'Image url is not a JPG file');
  }

  // Check image dimensionsc
  const res = request('GET', imgUrl);
  if (res.statusCode !== 200) {
    throw HTTPError(400, 'URl returned error code');
  }
  const imageBuffer = request('GET', imgUrl).body;
  const buff = Buffer.from(imageBuffer);
  const dimensions = sizeOf(buff);
  const width = dimensions.width;
  const height = dimensions.height;
  // Cropping outside of image bounds error checking
  if (xStart < 0 || yStart < 0 || xEnd > width || yEnd > height) {
    throw HTTPError(400, 'Cropping position outside of image dimensions');
  }

  // Save the image
  const userId = getUserId(token);
  const userProfile = userProfileV1(token, userId).user;
  const handleStr = userProfile.handleStr;
  const folder = '/static';
  const directory = __dirname + folder;
  const filename = `/${handleStr}.jpg`;
  fs.writeFileSync(directory + filename, imageBuffer, 'binary');
  // Set new url
  const serverUrl = `${config.url}:${config.port}${folder}${filename}`;
  userProfile.profileImgUrl = serverUrl;
  for (const datauser of data.users) {
    if (datauser.authUserId === userId) {
      datauser.profileImgUrl = serverUrl;
    }
  }

  // Crop image using Jimp
  Jimp.read(directory + filename).then(image => {
    image.crop(xStart, yStart, xEnd - xStart, yEnd - yStart).write(directory + filename);
  });

  // Edit all dms and channels
  for (const dm of data.dms) {
    for (const member of dm.members) {
      if (member.uId === userId) {
        member.profileImgUrl = serverUrl;
        break;
      }
    }
  }
  for (const channel of data.channels) {
    for (const owner of channel.ownerMembers) {
      if (owner.uId === userId) {
        owner.profileImgUrl = serverUrl;
        break;
      }
    }
    for (const member of channel.allMembers) {
      if (member.uId === userId) {
        member.profileImgUrl = serverUrl;
        break;
      }
    }
  }

  setData(data);
  return {};
}

export {
  userProfileV1,
  userProfileSethandleV1,
  userProfileSetnameV1,
  userProfileSetemailV1,
  usersAllV1,
  userProfileUploadphoto
};
