import { getData, setData } from './dataStore';
import { isTokenValid, isuIdValid, getUserId, isUserInDM, isDmIdValid } from './other';
import HTTPError from 'http-errors';
import { notifyJoin } from './notifications';
import { DmId, Dms, DmDetails, Message, Messages, Member } from './interfaces';
const DefaultProfileImage = 'http://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/481px-Cat03.jpg';

/**
  * <Creates a new dm with the uId it is directed to>
  *
  * @param {string} token - token of authorised user
  * @param {number[]} uIds - array of uIds
  * ...
  *@throws {HTTPError} - invalid token, uId does not refer to a valid user, a uId is duplicated
  * @returns {dmId}
*/

function dmCreateV1(token: string, uIds: number[]): DmId {
  // Testing for invalid token
  if (isTokenValid(token) === false) {
    throw HTTPError(403, 'Invalid token');
  }

  // Testing for invalid uId
  for (const uId of uIds) {
    if (isuIdValid(uId) === false) {
      throw HTTPError(400, 'uId does not refer to a valid user');
    }
  }

  // Testing for duplicate uId
  const uIdsSet = new Set(uIds);
  if (uIdsSet.size !== uIds.length) {
    throw HTTPError(400, 'A uId is duplicated');
  }

  const store = getData();

  // Get creator
  const creatorId = getUserId(token);

  // Generate unique dmId
  let dmIdMax = 0;
  for (const DM of store.dms) {
    if (DM.dmId > dmIdMax) {
      dmIdMax = DM.dmId;
    }
  }
  const dmId = dmIdMax + 1;

  // Generate members and name
  const nameArray = [];
  const members = [];
  for (const user of store.users) {
    // Users DM is directed to
    for (const uId of uIds) {
      if (user.authUserId === uId) {
        members.push(
          {
            uId: user.authUserId,
            email: user.email,
            nameFirst: user.nameFirst,
            nameLast: user.nameLast,
            handleStr: user.handleStr,
            profileImgUrl: DefaultProfileImage
          }
        );
        nameArray.push(user.handleStr);
      }
    }
    // Adds DM creator as a member
    if (user.authUserId === creatorId) {
      members.push(
        {
          uId: user.authUserId,
          email: user.email,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          handleStr: user.handleStr,
          profileImgUrl: DefaultProfileImage
        }
      );
      nameArray.push(user.handleStr);
    }
  }

  nameArray.sort();
  let name = '';
  for (const handle of nameArray) {
    name = name + handle;
    if (nameArray[nameArray.length - 1] !== handle) {
      name = name + ', ';
    }
  }

  store.dms.push(
    {
      dmId: dmId,
      name: name,
      creator: creatorId,
      members: members,
      messages: [],
    }
  );

  // Notify Users
  for (const newUser of uIds) {
    notifyJoin(creatorId, newUser, -1, dmId);
  }

  setData(store);

  return {
    dmId: dmId,
  };
}

/**
  * <Returns the array of DMs that the user is a member of.>
  *
  * @param {string} token - token of authorised user
  * ...
  *@throws {HTTPError} - invalid token
  * @returns {array} - dms
*/

function dmListV1 (token: string): Dms {
  // If the token is invalid, then return error
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  const store = getData();
  // Gets the authUserId from token
  const authUserId = getUserId(token);
  const dmsArray = [];

  // scroll through dms and dm.members
  // find the current member
  // push the dmId and dmName into a new list
  for (const dm of store.dms) {
    for (const member of dm.members) {
      if (member.uId === authUserId) {
        const dmList = {
          dmId: dm.dmId,
          name: dm.name,
        };
        dmsArray.push(dmList);
      }
    }
  }

  // return
  return {
    dms: dmsArray,
  };
}

/**
  * <Given a DM with ID dmId that the authorised user is a member of, provides basic details about the DM.>
  *
  * @param {string} token - token of authorised user
  * @param {number} dmId - dmId
  * ...
  *@throws {HTTPError} - invalid token, invalid dmId, authorised user is not a member of this DM
  * @returns {name, members} - name and members
*/

function dmDetailsV1 (token: string, dmId: number): DmDetails {
  // If the token is invalid, then return error
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  const store = getData();
  // Gets the authUserId from token
  const authUserId = getUserId(token);
  let currentDm;

  // Finds the dm (current dm)
  let isValidDm = false;
  for (const dm of store.dms) {
    if (dm.dmId === dmId) {
      isValidDm = true;
      currentDm = dm;
    }
  }

  // If the dm doesnt exist, throw error
  if (isValidDm === false) {
    throw HTTPError(400, 'Invalid dmId');
  }

  // If authUser is not a member of the DM, then return error
  let isMemberOfDm = false;
  for (const member of currentDm.members) {
    if (member.uId === authUserId) {
      isMemberOfDm = true;
    }
  }
  if (isMemberOfDm === false) {
    throw HTTPError(403, 'authUser is not a member of this DM');
  }

  return {
    name: currentDm.name,
    members: currentDm.members,
  };
}

/**
  * <Given a DM with ID dmId that the authorised user is a member of, returns up to 50 messages between index start and "start + 50".>
  *
  * @param {string} token - token of authorised user
  * @param {number} dmId - dmId
  * @param {number} start - starting time
  * ...
  *@throws {HTTPError} - invalid token, invalid dmId, start is greater than total number of messages in channel, user is not a member of the DM
  * @returns {Messages, start, end} - messages, start and end
*/

function dmMessagesV1(token: string, dmId: number, start: number): Messages {
  // checking if token is valid
  if (isTokenValid(token) === false) {
    throw HTTPError(403, 'Invalid token');
  }

  // checking dmId is valid
  if (isDmIdValid(dmId) === false) {
    throw HTTPError(400, 'Invalid dmId');
  }

  const store = getData();
  // Find the currentDm
  const currentDm = store.dms.find(dm => dm.dmId === dmId);

  // Filter out all future messsages in the messages array
  let currentTime = Math.floor((new Date()).getTime() / 1000);
  const returnMessages = currentDm.messages.filter((message: Message) => message.timeSent <= currentTime);

  // checking start is greater than the total number of messages in the channel
  if (start > returnMessages.length) {
    throw HTTPError(400, 'start is greater than total number of messages in channel');
  }

  const uId = getUserId(token);
  // User is not a member of the DM
  if (isUserInDM(uId, dmId) === false) {
    throw HTTPError(403, 'user is not a member of the DM');
  }

  currentTime = Math.floor((new Date()).getTime() / 1000);

  // Success cases
  // return structure for message data
  const messageInformation: Messages = {
    messages: [

    ],
    start: start,
    end: 0,
  };

  // creating array of messages in chronologically order with correct indexing and end values
  for (let i = start; i < returnMessages.length && i - start < 50; i++) {
    messageInformation.messages[i - start] = returnMessages[i];
  }
  if (returnMessages.length - start > 50) {
    messageInformation.end = start + 50;
  } else {
    messageInformation.end = -1;
  }

  return messageInformation;
}

/**
  * <Given a DM with ID dmId, the authorised user is removed as a member of this DM. >
  *
  * @param {string} token - token of authorised user
  * @param {number} dmId - dmId
  * ...
  *@throws {HTTPError} - invalid token, invalid dmId, user is not a member of the DM
  * @returns {}
*/

// Is output error | any?
function dmLeaveV1 (token: string, dmId: number): Record<string, never> {
  const store = getData();

  // If the token is invalid, then return error
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  // Gets the authUserId from token
  const authUserId = getUserId(token);
  // Gets the currentDm
  const currentDm = store.dms.find(dm => dm.dmId === dmId);

  // If the currentDm doesn't exist, throw error
  if (currentDm === undefined) {
    throw HTTPError(400, 'dmId is invalid');
  }

  // If the user is not a member of the dm, throw error
  if (currentDm.members.find((member: Member) => member.uId === authUserId) === undefined) {
    throw HTTPError(403, 'User is not a member of the dm');
  }

  // Remove member from DM
  currentDm.members = currentDm.members.filter((member: Member) => member.uId !== authUserId);

  setData(store);
  return {};
}

/**
  * <Removes an existing DM with ID dmId, so all members are no longer in the DM.>
  *
  * @param {string} token - token of authorised user
  * @param {number} dmId - dmId
  * ...
  *@throws {HTTPError} - invalid token, invalid dmId, user is not a member of the DM, authUser is not original owner
  * @returns {}
*/

function dmRemoveV1 (token: string, dmId: number): Record<string, never> {
  const store = getData();

  // If the token is invalid, then return error
  if (isTokenValid(token) === false) {
    throw HTTPError(403, 'Invalid token');
  }

  // Gets the authUserId from token
  const authUserId = getUserId(token);
  const currentDm = store.dms.find(item => item.dmId === dmId);

  // If the current dm is undefined, return error
  if (currentDm === undefined) {
    throw HTTPError(400, 'Invalid dmId');
  }

  // If the user is not a member of the dm, throw error
  if (currentDm.members.find((member: Member) => member.uId === authUserId) === undefined) {
    throw HTTPError(403, 'User is not a member of the dm');
  }

  // If the authUserId != creator, return error
  if (currentDm.creator !== authUserId) {
    throw HTTPError(403, 'authUser is not original owner');
  }

  // Remove dm
  // currentDm.members = [];
  store.dms = store.dms.filter(dm => dm.dmId !== dmId);

  setData(store);
  return {};
}

export {
  dmCreateV1,
  dmDetailsV1,
  dmMessagesV1,
  dmListV1,
  dmLeaveV1,
  dmRemoveV1
};
