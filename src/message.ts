import { getData, setData } from './dataStore';
import { isTokenValid, isChannelIdValid, isDmIdValid, isUserInChannel, isUserInDM, getUserId, isUserOwnerOfChannel, getCurrentMessage } from './other';
import HTTPError from 'http-errors';
import { notifyReact, notifyTag } from './notifications';
import { MessageId, Reacts, Message, Member } from './interfaces';

// Helper Functions
const generateMsgId = (channelOrDmId: number): number => {
  return Number(String(channelOrDmId).padStart(5, '0') + String(Date.now()));
};

const messageCheckTags = (senderId: number, message: string, channelId: number, dmId: number) => {
  const data = getData();
  for (const user of data.users) {
    const handle = user.handleStr;
    if (message.includes(`@${handle}`)) {
      notifyTag(senderId, user.authUserId, channelId, dmId, message);
    }
  }
};

/**
  * <Sends a message from the authorised user to the channel specified by channelId.>
  *
  * @param {string} token - token of authiorised user
  * @param {number} channelId - id of channel to send message in
  * @param {string} message - message to add to channel
  * ...
  *
  * @throws {HTTPError} - invalid token, invalid channelId, message less than 1 or greater than 1000 characters
  * @returns {MessageId} - everything works
*/

function messageSendV1(token: string, channelId: number, message: string): MessageId {
  // invalid token
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  const data = getData();
  const userId = getUserId(token);
  // Error checking
  // Message length checking
  const minMsgLength = 1;
  const maxMsgLength = 1000;
  if (message.length < minMsgLength || message.length > maxMsgLength) {
    throw HTTPError(400, 'Message is too short or too long');
  }

  // channelId is invalid
  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, 'Channel Id is invalid');
  }

  // token user is not in channel
  if (!isUserInChannel(userId, channelId)) {
    throw HTTPError(403, 'Authorised user is not in channel');
  }

  // Implementation
  // Generate message id (count which message number it is)\
  const newMessageId = generateMsgId(channelId);
  // Add message
  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      const newMessage: Message = {
        messageId: newMessageId,
        uId: userId,
        message: message,
        timeSent: Math.floor(Date.now() / 1000),
        reacts: [],
        isPinned: false
      };
      channel.messages.unshift(newMessage);
    }
  }

  // Notify Tagged Users
  messageCheckTags(userId, message, channelId, -1);

  setData(data);
  // Return message id
  return {
    messageId: newMessageId
  };
}

/**
  * <Sends a message from authorised user to the DM specified by dmId.>
  *
  * @param {string} token - token of authiorised user
  * @param {number} dmId - id of channel to send message in
  * @param {string} message - message to add to channel
  * ...
  *
  * @throws {HTTPError} - invalid token, invalid dmId, message less than 1 or greater than 1000 characters
  * @returns {MessageId} - everything works
*/

function messageSendDmV1(token: string, dmId: number, message: string): MessageId {
  // Error checking
  // Message length checking
  const minMsgLength = 1;
  const maxMsgLength = 1000;
  if (message.length < minMsgLength || message.length > maxMsgLength) {
    throw HTTPError(400, 'Message is too short or too long');
  }
  // invalid token
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  // dmId is invalid
  if (!isDmIdValid(dmId)) {
    throw HTTPError(400, 'Channel Id is invalid');
  }

  const data = getData();
  const userId = getUserId(token);
  // token user is not in channel
  if (!isUserInDM(userId, dmId)) {
    throw HTTPError(403, 'Authorised user is not in channel');
  }

  // Implementation
  // Generate message id (count which message number it is)\
  const newMessageId = generateMsgId(dmId);
  // Add message
  for (const dm of data.dms) {
    if (dmId === dm.dmId) {
      const newMessage: Message = {
        messageId: newMessageId,
        uId: userId,
        message: message,
        timeSent: Math.floor(Date.now() / 1000),
        reacts: [],
        isPinned: false
      };
      dm.messages.unshift(newMessage);
    }
  }

  // Notify Tagged Users
  messageCheckTags(userId, message, -1, dmId);

  setData(data);
  // Return message id
  return {
    messageId: newMessageId
  };
}

/**
  * <Given a message with ID messageId, updates its text with new text given in message. If the new message is an empty string, the message is deleted.>
  *
  * @param {string} token - token of authiorised user
  * @param {number} messageId - id of message to edit
  * @param {string} message - new updated message
  * ...
  *
  * @throws {HTTPError} - invalid token, message is too long, messageId does not refer to valid message, message not sent by user and has no permission to edit
  * @returns {} - everything works
*/

function messageEditV1(token: string, messageId: number, message: string): Record<string, never> {
  const data = getData();
  // Error Checking
  // invalid token
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  // Message is too long
  const maxMsgLength = 1000;
  if (message.length > maxMsgLength) {
    throw HTTPError(400, 'Message is too long');
  }

  // messageId does not refer to a valid message within a channel/DM that the authorised user has joined
  const authUserId = getUserId(token);
  let messageFound = false;
  let channelLocation;
  let messageLocation;
  let isChannel = true;
  for (const channel of data.channels) {
    for (const member of channel.allMembers) {
      if (member.uId === authUserId) {
        for (const message of channel.messages) {
          if (message.messageId === messageId) {
            messageFound = true;
            channelLocation = channel;
            messageLocation = message;
          }
        }
      }
    }
  }
  if (messageFound === false) {
    for (const dm of data.dms) {
      for (const member of dm.members) {
        if (member.uId === authUserId) {
          for (const message of dm.messages) {
            if (message.messageId === messageId) {
              messageFound = true;
              channelLocation = dm;
              messageLocation = message;
              isChannel = false;
            }
          }
        }
      }
    }
  }
  // if message location is not found return error
  if (!messageFound) {
    throw HTTPError(400, 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined');
  }
  // the message was not sent by the authorised user making this request and the user does not have owner permissions in the channel/DM
  // Check if the user is a global owner
  if (isChannel) {
    let isGlobalOwner = false;
    const isChannelOwner = isUserOwnerOfChannel(authUserId, channelLocation.channelId);
    for (const user of data.users) {
      if (user.authUserId === authUserId) {
        if (user.permissionId === 1) {
          isGlobalOwner = true;
        }
      }
    }
    if (messageLocation.uId !== authUserId && !isGlobalOwner && !isChannelOwner) {
      throw HTTPError(403, 'message not sent by user and user does not have permission to edit');
    }
  } else {
    if (messageLocation.uId !== authUserId && channelLocation.creator !== authUserId) {
      throw HTTPError(403, 'message not sent by user and user does not have permission to edit');
    }
  }
  // Implementation
  // If message is empty -> delete message. Otherwise change message
  if (message === '') {
    const index = channelLocation.messages.indexOf(messageLocation);
    channelLocation.messages.splice(index, 1);
  } else {
    messageLocation.message = message;
    // Notify Tagged Users
    if (isChannel) { messageCheckTags(authUserId, message, channelLocation.channelId, -1); } else { messageCheckTags(authUserId, message, -1, channelLocation.dmId); }
    setData(data);
  }

  return {};
}

/**
  * <Given a messageId for a message, removes the message from the channel/DM.>
  *
  * @param {string} token - token of authiorised user
  * @param {number} messageId - id of message to delete
  * ...
  *
  * @returns {} - everything works
*/

function messageRemoveV1(token: string, messageId: number): Record<string, never> {
  const ret = messageEditV1(token, messageId, '');
  return ret;
}

/**
  * <Given a message within a channel or DM the authorised user is part of, adds a "react" to that particular message.>
  *
  * @param {string} token - token of authiorised user
  * @param {number} messageId - id of message
  * @param {number} reactId - id of react
  * ...
  *@throws {HTTPError} - token is invalid, invalid messageId, reactId is invalid, user has already reacted to this react
  * @returns {} - everything works
*/

function messageReactV1(token: string, messageId: number, reactId: number): Record<string, never> {
  const store = getData();
  // checks for invalid token
  if (isTokenValid(token) !== true) {
    throw HTTPError(403, 'Token is invalid');
  }

  // Get current userId
  const currentUserId = getUserId(token);
  // Get current message
  const messageDetails = getCurrentMessage(currentUserId, messageId);
  const currentMessage: Message = messageDetails.message;

  // Checks for invalid message
  if (currentMessage === undefined) {
    throw HTTPError(400, 'Invalid messageId');
  }

  // Checks for invalid reactId
  if (reactId !== 1) {
    throw HTTPError(400, 'reactId is invalid');
  }

  // Adds react and modifies object if empty
  // or Modifies react if it already exists
  if (currentMessage.reacts.length === 0) {
    currentMessage.reacts.push({
      reactId: reactId,
      uIds: [currentUserId],
      isThisUserReacted: true
    });
  } else {
    let currentReact: Reacts = currentMessage.reacts.find(react => react.reactId === reactId);
    const reactorId = currentReact.uIds.find(rId => rId === currentUserId);

    if (reactorId !== undefined) {
      throw HTTPError(400, 'this user has already reacted to this message');
    }

    currentReact.uIds.push(currentUserId);
    const uIds = currentReact.uIds;

    currentReact = {
      reactId: reactId,
      uIds: uIds,
      isThisUserReacted: true
    };
  }

  // Notify User
  let channelId = -1;
  let dmId = -1;
  if (messageDetails.channel !== undefined) { channelId = messageDetails.channel.channelId; }
  if (messageDetails.dm !== undefined) { dmId = messageDetails.dm.dmId; }
  notifyReact(currentUserId, currentMessage.uId, channelId, dmId);

  setData(store);
  // Return
  return {};
}

/**
  * <Given a message within a channel or DM the authorised user is part of, removes a "react" to that particular message.>
  *
  * @param {string} token - token of authiorised user
  * @param {number} messageId - id of message
  * @param {number} reactId - id of react
  * ...
  *@throws {HTTPError} - token is invalid, invalid messageId, reactId is invalid, the message is not reacted to
  * @returns {} - everything works
*/

function messageUnreactV1(token: string, messageId: number, reactId: number): Record<string, never> {
  const store = getData();
  // checks for invalid token
  if (isTokenValid(token) !== true) {
    throw HTTPError(403, 'Token is invalid');
  }

  // Get current userId
  const currentUserId = getUserId(token);
  // Get current Message
  const currentMessage: Message = getCurrentMessage(currentUserId, messageId).message;

  // Checks for invalid message
  if (currentMessage === undefined) {
    throw HTTPError(400, 'Invalid messageId');
  }

  // Checks for invalid reactId
  if (reactId !== 1) {
    throw HTTPError(400, 'reactId is invalid');
  }

  // Finds react
  const currentReact: Reacts = currentMessage.reacts.find(react => react.reactId === reactId);
  // If react doest exist, throw error
  // If the react exists but hasnt been reacted to
  // throw error
  if (currentReact === undefined) {
    throw HTTPError(400, 'The message is not already pinned.');
  } else if (!currentReact.uIds.includes(currentUserId)) {
    throw HTTPError(400, 'The message is not already pinned.');
  }

  // Filter out user
  currentReact.uIds = currentReact.uIds.filter(id => id !== currentUserId);
  currentReact.isThisUserReacted = false;

  setData(store);
  // Return
  return {};
}

/**
  * <Sends a message from the authorised user to the channel specified by channelId automatically at a specified time in the future. >
  *
  * @param {string} token - token of authiorised user
  * @param {number} messageId - id of message to send later
  * @param {string} message - message
  * @param {number} timeSent - time sent
  * ...
  *
  * @throws {HTTPError} - invalid token, invalid messageId, message less than 1 or greater than 1000 characters
  * @returns {MessageId} - everything works
*/
function messageSendLaterV1(token: string, channelId: number, message: string, timeSent: number): MessageId {
  const store = getData();

  // checks for invalid token
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  // checks for invalid channelId
  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, 'Channel Id is invalid');
  }

  // checks for invalid message length
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Message is too short or too long');
  }

  // checks if timesent is in the past
  const currentTime = Math.floor((new Date()).getTime() / 1000);
  if (timeSent < currentTime) {
    throw HTTPError(400, 'Timesent is in the past');
  }

  // gets current users authUserId
  const currentUserId = getUserId(token);
  // gets current channel
  const currentChannel = store.channels.find(channel => channel.channelId === channelId);

  // Checks if currentUser is in curentChannel
  if (!isUserInChannel(currentUserId, channelId)) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }

  // generate a new message Id
  const newMessageId = generateMsgId(channelId);
  // Create the newMessage
  const newMessage: Message = {
    messageId: newMessageId,
    uId: currentUserId,
    message: message,
    timeSent: timeSent,
    reacts: [],
    isPinned: false
  };

  currentChannel.messages.unshift(newMessage);

  setData(store);
  // return messageId
  return {
    messageId: newMessageId
  };
}

/**
  * <Sends a message from the authorised user to the DM specified by dmId automatically at a specified time in the future.>
  *
  * @param {string} token - token of authiorised user
  * @param {number} dmId - id of dm to edit
  * @param {string} message - message
  * @param {number} timeSent - time sent
  * ...
  *
  * @throws {HTTPError} - invalid token, invalid dmId, message less than 1 or greater than 1000 characters
  * @returns {MessageId} - everything works
*/

function messageSendLaterDmV1(token: string, dmId: number, message: string, timeSent: number): MessageId {
  const store = getData();

  // checks for invalid token
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  // checks for invalid channelId
  if (!isDmIdValid(dmId)) {
    throw HTTPError(400, 'Channel Id is invalid');
  }

  // checks for invalid message length
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Message is too short or too long');
  }

  // checks if timesent is in the past
  const currentTime = Math.floor((new Date()).getTime() / 1000);
  if (timeSent < currentTime) {
    throw HTTPError(400, 'Timesent is in the past');
  }

  // gets current users authUserId
  const currentUserId = getUserId(token);
  // gets current dm
  const currentDm = store.dms.find(dm => dm.dmId === dmId);

  // Checks if currentUser is a part of the dm
  const currentUser = currentDm.members.find((user: Member) => user.uId === currentUserId);
  if (currentUser === undefined) {
    throw HTTPError(403, 'authorised user is not a member of the dm');
  }

  // generate a new message Id
  const newMessageId = generateMsgId(dmId);
  // Create the newMessage
  const newMessage: Message = {
    messageId: newMessageId,
    uId: currentUserId,
    message: message,
    timeSent: timeSent,
    reacts: [],
    isPinned: false
  };

  currentDm.messages.unshift(newMessage);

  setData(store);
  // return messageId
  return {
    messageId: newMessageId
  };
}

/**
  * <shares a message to another channel/dm with an optional additional message attached>
  *
  * @param {string} token - token of authiorised user
  * @param {number} ogMessageId - id of the message being shared
  * @param {string} message - optional message to add to the shared message
  * @param {number} channelId - channel shared message is being shared to
  * @param {number} dmId - dm shared message is being sent to
  *
  * @throws {HTTPError} - invalid token, invalid dmId and channelId, message > 1000 characters, neither channelId/dmId = -1, user not in same dm/channel as ogMessageId, user not in channelId or dmId
  * @returns {sharedMessageId} - everything works
*/

interface SharedMessage {
  sharedMessageId: number
}

function messageShare(token: string, ogMessageId: number, message: string, channelId: number, dmId: number): SharedMessage {
  const data = getData();
  // Error Check: Neither dmId or channelId === -1
  if (channelId !== -1 && dmId !== -1) {
    throw HTTPError(400, 'Neither dmId or channelId === 1');
  }
  // Error Check: Message > 1000 characters
  if (message.length > 1000) {
    throw HTTPError(400, 'Message > 1000 characters');
  }
  // Error Check: Invalid Token
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  // Error Check: Both channelId and dmId are invalid
  const channel = data.channels.find(channel => channel.channelId === channelId);
  const dm = data.dms.find(dm => dm.dmId === dmId);
  if (channel === undefined && dm === undefined) {
    throw HTTPError(400, 'Both channelId and dmId are invalid');
  }
  // Error Check: Authorised user has not joined dm/channel
  const userId = getUserId(token);
  let userInChannel;
  let userInDm;
  if (channel !== undefined) {
    userInChannel = channel.allMembers.find((member: Member) => member.uId === userId);
  } else {
    userInDm = dm.members.find((member: Member) => member.uId === userId);
  }
  if (userInChannel === undefined && userInDm === undefined) {
    throw HTTPError(403, 'Authorised user has not joined channel/dm');
  }
  // Error Check: Message and user not in same channel/dm
  // (Stream = Channel/Dm)
  const streams = data.channels.concat(data.dms);
  const messageStream = streams.find(stream => stream.messages.map((msg: Message) => msg.messageId).find((id: number) => id === ogMessageId) === ogMessageId);
  let userInMessageStream;
  if (data.channels.includes(messageStream)) {
    userInMessageStream = messageStream.allMembers.find((user: Member) => user.uId === userId);
  } else {
    userInMessageStream = messageStream.members.find((user: Member) => user.uId === userId);
  }
  if (userInMessageStream === undefined) {
    throw HTTPError(400, 'Message and user not in same channel/dm');
  }

  // Implementation
  const ogMessage = messageStream.messages.find((msg: Message) => msg.messageId === ogMessageId);
  const sharedMessageContent = `Original Message: "${ogMessage.message}". Comment: "${message}"`;
  let sharedMessageId;
  if (channel !== undefined) {
    sharedMessageId = messageSendV1(token, channelId, sharedMessageContent).messageId;
  } else {
    sharedMessageId = messageSendDmV1(token, dmId, sharedMessageContent).messageId;
  }
  setData(data);
  return {
    sharedMessageId: sharedMessageId
  };
}

/**
  * <Given a message within a channel or DM, marks it as "pinned".>
  *
  * @param {string} token - token of authiorised user
  * @param {number} messageId - id of message to pin
  * ...
  *
  * @throws {HTTPError} - invalid token, invalid messageId, message is already pinned, user does not have channel rights, user does not have dm rights
  * @returns {} - everything works
*/

function messagePinV1 (token: string, messageId: number) {
  const store = getData();
  // checks for invalid token
  if (isTokenValid(token) !== true) {
    throw HTTPError(403, 'Token is invalid');
  }

  const currentUserId = getUserId(token);
  const currentMessage: Message = getCurrentMessage(currentUserId, messageId).message;

  if (currentMessage === undefined) {
    throw HTTPError(400, 'Invalid messageId');
  }
  // checks if the current message has already been pinned
  if (currentMessage.isPinned === true) {
    throw HTTPError(400, 'The message is already pinned');
  }

  const currentChannel = getCurrentMessage(currentUserId, messageId).channel;
  const currentDm = getCurrentMessage(currentUserId, messageId).dm;
  const currentUser = store.users.find(user => user.authUserId === currentUserId);
  let channelOwner;
  if (currentChannel !== undefined) {
    channelOwner = currentChannel.ownerMembers.find(owner => owner.uId === currentUserId);
    if (channelOwner === undefined && currentUser.permissionId !== 1) {
      throw HTTPError(403, 'User does not have channel rights');
    }
  } else {
    if (currentDm.creator !== currentUserId && currentUser.permissionId !== 1) {
      throw HTTPError(403, 'User does not have dm rights');
    }
  }

  currentMessage.isPinned = true;
  setData(store);
  return {};
}

/**
  * <Given a message within a channel or DM, unmarks it as "pinned".>
  *
  * @param {string} token - token of authiorised user
  * @param {number} messageId - id of message to pin
  * ...
  *
  * @throws {HTTPError} - invalid token, invalid messageId, message is not pinned, user does not have channel rights, user does not have dm rights
  * @returns {} - everything works
*/

function messageUnpinV1(token: string, messageId: number) {
  const store = getData();
  // checks for invalid token
  if (isTokenValid(token) !== true) {
    throw HTTPError(403, 'Token is invalid');
  }

  const currentUserId = getUserId(token);
  const currentMessage: Message = getCurrentMessage(currentUserId, messageId).message;

  if (currentMessage === undefined) {
    throw HTTPError(400, 'Invalid messageId');
  }
  // checks if the current message has already been pinned
  if (currentMessage.isPinned === false) {
    throw HTTPError(400, 'The message is not pinned');
  }

  const currentChannel = getCurrentMessage(currentUserId, messageId).channel;
  const currentDm = getCurrentMessage(currentUserId, messageId).dm;
  const currentUser = store.users.find(user => user.authUserId === currentUserId);
  let channelOwner;
  if (currentChannel !== undefined) {
    channelOwner = currentChannel.ownerMembers.find(owner => owner.uId === currentUserId);
    if (channelOwner === undefined && currentUser.permissionId !== 1) {
      throw HTTPError(403, 'User does not have channel rights');
    }
  } else {
    if (currentDm.creator !== currentUserId && currentUser.permissionId !== 1) {
      throw HTTPError(403, 'User does not have dm rights');
    }
  }

  currentMessage.isPinned = false;
  setData(store);
  return {};
}

export {
  messageSendV1,
  messageSendDmV1,
  messageEditV1,
  messageRemoveV1,
  messageReactV1,
  messageUnreactV1,
  messageSendLaterV1,
  messageSendLaterDmV1,
  messageShare,
  messagePinV1,
  messageUnpinV1
};
