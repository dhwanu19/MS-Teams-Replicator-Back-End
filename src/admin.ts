import { isTokenValid, isuIdValid, isUserGlobalOwner, numGlobalOwner, getUserId, getPermissionId } from './other';
import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';

/** adminUserRemoveV1
  * <Given a user by their uId, removes them from the Beans.>
  *
  * @param {string} token - token of user calling the command
  * @param {integer} uId - id of user that will be removed
  * ...
  * @throws {HTTPError} - invalid token, Uis is invalid, uId is the only global owner, authorised user is not a global owner
  * @returns {} - returns an empty object
*/

function adminUserRemoveV1(token: string, uId: number): Record<string, never> {
  // Check for invalid token
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  // Check for invalid uId
  if (!isuIdValid(uId)) {
    throw HTTPError(400, 'uId is invalid');
  }

  // Check if uId is only global owner
  if (isUserGlobalOwner(uId) === true && numGlobalOwner() === 1) {
    throw HTTPError(400, 'uId is the only global owner');
  }

  // Check if authorised user is not a global owner
  const authUserId = getUserId(token);
  if (!isUserGlobalOwner(authUserId)) {
    throw HTTPError(403, 'authorised user is not a global owner');
  }

  const store = getData();

  // fetching user data
  const user = store.users.find(user => user.authUserId === uId);

  // removing user from Beans
  user.removed = true;
  user.nameFirst = 'Removed';
  user.nameLast = 'user';

  // removing user from channels and modifying channel messages
  for (const channel of store.channels) {
    for (const member of channel.allMembers) {
      /* istanbul ignore else */
      if (member.uId === uId) {
        channel.allMembers.splice(channel.allMembers.indexOf(member), 1);
      }
    }

    for (const member of channel.ownerMembers) {
      /* istanbul ignore else */
      if (member.uId === uId) {
        channel.ownerMembers.splice(channel.ownerMembers.indexOf(member), 1);
      }
    }

    for (const message of channel.messages) {
      /* istanbul ignore else */
      if (message.uId === uId) {
        message.message = 'Removed user';
      }
    }
  }

  // removing user from dms and modifying dm messages
  for (const dm of store.dms) {
    for (const member of dm.members) {
      /* istanbul ignore else */
      if (member.uId === uId) {
        dm.members.splice(dm.members.indexOf(member), 1);
      }
    }

    for (const message of dm.messages) {
      /* istanbul ignore else */
      if (message.uId === uId) {
        message.message = 'Removed user';
      }
    }
  }

  setData(store);
  return {};
}

/** adminUserpermissionChangeV1
  * <Given a user by their uID, sets their permissions to new permissions described by permissionId.>
  *
  * @param {string} token - token of user calling the command
  * @param {integer} uId - id of user that will have permission changed
  * @param {integer} permissionId - id of users new permission
  * ...
  * @throws {HTTPError} - invalid token, uId is invalid, demoting only global owner to a user, permissionId is invalid, user already has this permissionId, authorised user is not a global owner
  * @returns {} - returns an empty object
*/

function adminUserpermissionChangeV1(token: string, uId: number, permissionId: number): Record<string, never> {
  // Check for invalid token
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  // Check for invalid uId
  if (!isuIdValid(uId)) {
    throw HTTPError(400, 'uId is invalid');
  }

  // Check if demoting only global owner to a user
  if (isUserGlobalOwner(uId) === true && numGlobalOwner() === 1 && permissionId === 2) {
    throw HTTPError(400, 'Demoting only global owner to a user');
  }

  // Check if permissionId is invalid
  if (permissionId !== 1 && permissionId !== 2) {
    throw HTTPError(400, 'permissionId is invalid');
  }

  // Check if uId already has permissionId
  if (getPermissionId(uId) === permissionId) {
    throw HTTPError(400, 'user already has this permissionId');
  }

  // Check if authorised user is a global owner
  const authUserId = getUserId(token);
  if (!isUserGlobalOwner(authUserId)) {
    throw HTTPError(403, 'autherised user is not a global owner');
  }

  const store = getData();

  // Updates the users permissionId
  store.users.find(user => user.authUserId === uId).permissionId = permissionId;
  setData(store);

  return {};
}

export {
  adminUserRemoveV1,
  adminUserpermissionChangeV1,
};
