// Importing implementation local functions
import { getData, setData } from './dataStore';
import { userProfileV1 } from './users';
import { isTokenValid, isuIdValid, isChannelIdValid, isUserInChannel, isUserOwnerOfChannel, getUserId } from './other';
import HTTPError from 'http-errors';
import { notifyJoin } from './notifications';
import { Message, Messages, Member, ChannelDetails } from './interfaces';

/** channelDetailsV1
  * <Given a channel with ID channelId that the authorised user is a member of, provides basic details about the channel.>
  *
  * @param {string} token - token of user calling the commands
  * @param {integer} channelId - id of channel that we want details of
  * ...
  * @throws {HTTPError} - invalid token, channelId is invalid, member not part of the channel
  * @returns { name: string, isPublic: boolean, ownerMembers: users[], allMembers: users[] }
  * - returns details of the channel if successful
*/

function channelDetailsV1 (token: string, channelId: number): ChannelDetails {
  // Check for invalid token
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  // Check for invalid channelId
  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, 'channelId is invalid');
  }

  // Check channelId valid but user is not a member of the channel
  const authUserId = getUserId(token);
  if (!isUserInChannel(authUserId, channelId)) {
    throw HTTPError(403, 'Member not part of the channel');
  }

  const store = getData();

  // Loop through channels and find channel with corresponding channelId
  const channel = store.channels.find(channel => channel.channelId === channelId);

  // Returns details about the channel
  return {
    name: channel.name,
    isPublic: channel.isPublic,
    ownerMembers: channel.ownerMembers,
    allMembers: channel.allMembers,
  };
}

/**
  * channelJoinV1 function
  * <Given a channelId of a channel that the authorised user can join, adds them to that channel.>
  *
  * @param {string} token - a token of the user.
  * @param {number} channelId - an assigned Id for the channel.
  * ...
  *
  * @throws {HTTPError} - token is invalid, channelId is invalid, user is already a member of the channel, channel is private and user is not a global owner
  * @returns {} - returns an empty object if successful
*/

function channelJoinV1 (token: string, channelId: number): Record<string, never> {
  // Check for invalid token
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  // Check for invalid channelId
  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, 'ChannelId is invalid');
  }

  // Check if user is already a member of the channel
  const authUserId = getUserId(token);
  if (isUserInChannel(authUserId, channelId)) {
    throw HTTPError(400, 'user is already a member of the channel');
  }

  const store = getData();

  // channel is private, user is not a member of the channel, user is not a global owner
  let isPublic = true;
  let globalOwner = true;

  // checks permission Id
  for (const user of store.users) {
    if (authUserId === user.authUserId) {
      if (user.permissionId !== 1) {
        globalOwner = false;
      }
    }
  }

  // Checks isPublic then throws potential error or adds user as a member
  const channel = store.channels.find(channel => channel.channelId === channelId);
  if (channel.isPublic === false) {
    isPublic = false;
  }

  if (isPublic === false && globalOwner === false) {
    throw HTTPError(403, 'Channel is private and user is not a global owner');
  }

  channel.allMembers.push(userProfileV1(token, authUserId).user);

  // stores data
  setData(store);

  // returns an empty object
  return {};
}

/**
  * channelInviteV1 function.
  * <Invites a user with ID 'uId' to join a channel with ID channelId.>
  *
  * @param {string} token - the Id of an authorised user
  * @param {integer} channelId - the Id of a channel
  * @param {integer} uId - the Id of the user being invited to the channel
  * ...
  *
  * @throws {HTTPError} - invalid token, channelId is invalid, uId is invalid, uId is already a member, token user is not a member of this channel
  * @returns {} - returns an empty object if successful
*/

function channelInviteV1(token: string, channelId: number, uId: number): Record<string, never> {
  // Check for invalid token
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  // Check for invalid channelId
  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, 'ChannelId is invalid');
  }

  // Check for invalid uId
  if (!isuIdValid(uId)) {
    throw HTTPError(400, 'uId is invalid');
  }

  // Check if uid is already a member of the channel,
  if (isUserInChannel(uId, channelId)) {
    throw HTTPError(400, 'uId is already a member');
  }

  // Check if authorised user is not a member of the channel,
  const authUserId = getUserId(token);
  if (!isUserInChannel(authUserId, channelId)) {
    throw HTTPError(403, 'Token user is not a member of this Channel');
  }

  const store = getData();

  // If there are no errors, add user to channel
  const channel = store.channels.find(channel => channel.channelId === channelId);
  channel.allMembers.push(userProfileV1(token, uId).user);

  notifyJoin(authUserId, uId, channelId, -1);

  // set the datastore
  setData(store);

  // return an empty object
  return {};
}

/** channelMessagesV1 function
  * <Given a channel with ID channelId that the authorised user is a member of, returns up to 50 messages between index start and "start + 50".>
  *
  * @param {string} token - token of an autherised user
  * @param {number} channelId - channelId of a channel
  * @param {number} start - first index of messages
  * ...
  * @throws {HTTPError} - token is invalid, channel does not exist, start is greater than total number of messages, token user is not a member of this channel
  * @returns { messages: MessagesV2, start: number, end: number } - if messages are successfully returned
*/

function channelMessagesV1(token: string, channelId: number, start: number): Messages {
  // Checking for invalid token
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  // Checking if channelId is invalid
  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, 'channel does not exist');
  }

  const store = getData();

  // Checking if start is greater than total number of messages
  const channel = store.channels.find(channel => channel.channelId === channelId);

  let currentTime = Math.floor((new Date()).getTime() / 1000);
  const returnMessages = channel.messages.filter((message: Message) => message.timeSent <= currentTime);

  if (start > returnMessages.length) {
    throw HTTPError(400, 'start is greater than total number of messages');
  }

  // Check if authorised user is not a member of the channel,
  const authUserId = getUserId(token);
  if (!isUserInChannel(authUserId, channelId)) {
    throw HTTPError(403, 'Token user is not a member of this Channel');
  }

  currentTime = Math.floor((new Date()).getTime() / 1000);

  // return structure for message data
  const messageInformation: Messages = {
    messages: [

    ],
    start: start,
    end: 0,
  };

  // creating array of messages in chronological order with correct indexing and end values
  // build list of 50 messages from start, stopping after 50 messages or when messages run out
  for (let i = start; i < returnMessages.length && i - start < 50; i++) {
    messageInformation.messages[i - start] = returnMessages[i];
  }
  // if 50 messages in list, end is start + 50
  if (returnMessages.length - start > 50) {
    messageInformation.end = start + 50;
  } else {
    // if less than 50 messages in list, start  is -1
    messageInformation.end = -1;
  }

  // returns the message structure
  return messageInformation;
}

/** channelAddownerV1 function
  * <Makes user with user ID uId an owner of the channel.>
  *
  * @param {string} token - token of an authorised user
  * @param {number} channelId - channelId of a channel
  * @param {number} uId - uId of user to be made an owner of the channel
  * ...
  * @throws {HTTPError} - invalid token, channelId does not refer to a valid channel, uId does not refer to a valid user
  * @throws {HTTPError} - uId is not a member of this channel, uId is already a owner of this channel, channelId is validbut authorised user does not have owner permissions
  * @returns {} - returns an empty object if successful
*/

function channelAddownerV1(token: string, channelId: number, uId: number): Record<string, never> {
  // Testing for invalid token
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  // Testing for invalid channelId
  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  // Testing for invalid uId
  if (!isuIdValid(uId)) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }

  // Checking if uId is not a member of the channel
  if (!isUserInChannel(uId, channelId)) {
    throw HTTPError(400, 'uId is not a member of this channel');
  }

  // Checking if user is already an owner of the channel
  if (isUserOwnerOfChannel(uId, channelId)) {
    throw HTTPError(400, 'uId is already an owner of this channel');
  }

  const store = getData();

  // Checking if autherisedUser (token) does not have owner permissions in the channel
  // They either have to be an ownerMember or a global owner
  const autherisedUserId = getUserId(token);
  let autherisedUserHasOwnerPermissions = false;

  // check if authUser is an owner member
  const channel = store.channels.find(channel => channel.channelId === channelId);
  for (const owners of channel.ownerMembers) {
    if (owners.uId === autherisedUserId) {
      autherisedUserHasOwnerPermissions = true;
    }
  }

  // check if authUser is a global owner
  for (const user of store.users) {
    if (user.authUserId === autherisedUserId) {
      if (user.permissionId === 1) {
        autherisedUserHasOwnerPermissions = true;
      }
    }
  }

  // if user is neither a global owner or an owner member return error
  if (!autherisedUserHasOwnerPermissions) {
    throw HTTPError(403, 'channelId is valid but autherised user does not have owner permissions');
  }

  // If error checks all pass, make uId an owner of the channel
  channel.ownerMembers.push(userProfileV1(token, uId).user);

  // set the dataStore
  setData(store);

  // return an empty object
  return {};
}

/** channelRemoveownerV1 function
  * <Removes user with user ID uId as an owner of the channel.>
  *
  * @param {string} token - token of an authorised user
  * @param {number} channelId - channelId of a channel
  * @param {number} uId - uId of user to be removed as an owner of the channel
  * ...
  * @throws {HTTPError} - invalid token, channelId does not refer to a valid channel, uId does not refer to a valid user, uId is not an owner of this channel, uId is the only owner of this channel
  * @throws {HTTPError} - channelId is valid but authorised user does not have owner permissions
  * @returns {} - returns an empty object if successful
*/

function channelRemoveownerV1(token: string, channelId: number, uId: number): Record<string, never> {
  // Testing for invalid token
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  // Testing for invalid channelId
  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  // Testing for invalid uId
  if (!isuIdValid(uId)) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }

  // Checking if user is an owner of the channel
  if (!isUserOwnerOfChannel(uId, channelId)) {
    throw HTTPError(400, 'uId is not an owner of this channel');
  }

  // Checking if user is the only owner of a channel
  const store = getData();
  const channel = store.channels.find(channel => channel.channelId === channelId);
  if (channel.ownerMembers.length === 1) {
    throw HTTPError(400, 'uId is the only owner of this channel');
  }

  // Checking if autherisedUser (token) does not have owner permissions in the channel
  // They either have to be an ownerMember or a global owner
  const autherisedUserId = getUserId(token);
  let autherisedUserHasOwnerPermissions = false;

  // check if authUser is an owner member
  for (const owners of channel.ownerMembers) {
    if (owners.uId === autherisedUserId) {
      autherisedUserHasOwnerPermissions = true;
    }
  }

  // check if authUser is a global owner
  for (const user of store.users) {
    if (user.authUserId === autherisedUserId) {
      if (user.permissionId === 1) {
        autherisedUserHasOwnerPermissions = true;
      }
    }
  }

  // if user is neither a global owner or an owner member return error
  if (!autherisedUserHasOwnerPermissions) {
    throw HTTPError(403, 'channelId is valid but autherised user does not have owner permissions');
  }

  // All errors checked, now removes uId as an owner of the channel
  for (const owner of channel.ownerMembers) {
    if (owner.uId === uId) {
      // Remove uId as an owner
      channel.ownerMembers.splice([channel.ownerMembers.indexOf(owner)], 1);
    }
  }

  // sets the datastore
  setData(store);

  // returns an empty object
  return {};
}

/** channelLeaveV1 function
  * <Given a channel with ID channelId that the authorised user is a member of, removes them as a member of the channel.>
  *
  * @param {string} token - token of an authorised user to be removed from below channel
  * @param {number} channelId - channelId of a channel
  * ...
  * @throws {HTTPError} - invalid token, channelId does not refer to a valid channel, member not part of channel, authorised user is starter of active standup
  * @returns {} - returns an empty object if successful
*/

function channelLeaveV1(token: string, channelId: number): Record<string, never> {
  // Check token is valid
  if (isTokenValid(token) === false) {
    throw HTTPError(403, 'Invalid token');
  }

  // Testing for invalid channelId
  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  // Check channelId valid but user is not a member of the channel
  const authUserId = getUserId(token);
  if (!isUserInChannel(authUserId, channelId)) {
    throw HTTPError(403, 'Member not part of the channel');
  }

  const store = getData();

  // Check if user is the starter of an active standup in the channel
  const currentChannel = store.channels.find(channel => channel.channelId === channelId);
  if ((currentChannel.standup.isActive === true) && (currentChannel.standup.startMember === authUserId)) {
    throw HTTPError(400, 'authorised user is starter of active standup in the channel');
  }

  // If errors checked, removes user as an ownerMember and allMember of a channel
  const channel = store.channels.find(channel => channel.channelId === channelId);
  channel.ownerMembers = channel.ownerMembers.filter((member: Member) => member.uId !== authUserId);
  channel.allMembers = channel.allMembers.filter((member: Member) => member.uId !== authUserId);

  // sets the data store
  setData(store);

  // returns an empty object
  return {};
}

export {
  channelDetailsV1,
  channelJoinV1,
  channelInviteV1,
  channelMessagesV1,
  channelAddownerV1,
  channelRemoveownerV1,
  channelLeaveV1
};
