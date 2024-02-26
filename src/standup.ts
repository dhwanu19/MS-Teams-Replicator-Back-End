import { getData, setData } from './dataStore';
import { isTokenValid, isChannelIdValid, getUserId, isUserInChannel } from './other';
import { messageSendV1 } from './message';
import HTTPError from 'http-errors';
import { StandupStart, StandupActive } from './interfaces';

/**
  * <For a given channel, starts a standup period lasting length seconds.>
  *
  * @param {string} token - token of authiorised user
  * @param {number} channelId - id of channel
  * @param {number} length - length of standup
  * ...
  *
  * @throws {HTTPError} - invalid token, channelId is invalid, length is invalid, authorised user is not member of channel, active standup is currently running channel
  * @returns {timeFinish} - everything works
*/

function standupStartV1 (token: string, channelId: number, length: number): StandupStart {
  const store = getData();

  // Checks for invalid token
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  // Checks for invalid channelId
  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, 'channelId is invalid');
  }

  // Checks for invalid length
  if (length < 0) {
    throw HTTPError(400, 'length is invalid');
  }

  // gets current users authUserId
  const currentUserId = getUserId(token);
  // gets current channel
  const currentChannel = store.channels.find(channel => channel.channelId === channelId);

  // Checks if currentUser is in curentChannel
  if (!isUserInChannel(currentUserId, channelId)) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }

  // If a standup is already active in currentChannel, throws error
  if (currentChannel.standup.isActive) {
    throw HTTPError(400, 'an active standup is currently running in the channel');
  }

  // Calculates timeFinish for the standup
  const timeFinish = Math.floor((new Date()).getTime() / 1000) + length;

  // Modifies object
  currentChannel.standup = {
    isActive: true,
    startMember: currentUserId,
    starterToken: token,
    timeFinish: timeFinish,
    messages: []
  };

  setData(store);

  // returns timeFinish
  return {
    timeFinish: currentChannel.standup.timeFinish
  };
}

/**
  * <For a given channel, returns whether a standup is active in it, and what time the standup finishes.>
  *
  * @param {string} token - token of authiorised user
  * @param {number} channelId - id of channel
  * ...
  *
  * @throws {HTTPError} - invalid token, channelId is invalid, authorised user is not member of channel
  * @returns {isActive, timeFinish} - everything works
*/

function standupActiveV1 (token: string, channelId: number): StandupActive {
  const store = getData();

  // Checks for invalid token
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  // Checks for invalid channelId
  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, 'channelId is invalid');
  }

  // gets current users authUserId
  const currentUserId = getUserId(token);
  // gets current channel
  const currentChannel = store.channels.find(channel => channel.channelId === channelId);

  // Checks if currentUser is in curentChannel
  if (!isUserInChannel(currentUserId, channelId)) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }

  // gets timeFinish from standup's object
  const timeFinish = currentChannel.standup.timeFinish;
  // calculates the currentTime
  const currentTime = Math.floor((new Date()).getTime() / 1000);
  // Initialises packedMessage
  let packedMessage;
  // gets starter's token from standup object
  const starterToken = currentChannel.standup.starterToken;

  // If currentTime is past timeFinish
  // Pack the messages in the standup.messages buffer
  // Post the packedMessage using the standup starter
  // Reset standup object
  if (currentTime >= timeFinish) {
    if (currentChannel.standup.messages.length > 0) {
      packedMessage = currentChannel.standup.messages.join('\n');
      messageSendV1(starterToken, channelId, packedMessage);
    }

    currentChannel.standup = {
      isActive: false,
      startMember: null,
      starterToken: null,
      timeFinish: null,
      messages: []
    };
  }

  setData(store);

  // return whether the standup isActive and its timeFinish
  return {
    isActive: currentChannel.standup.isActive,
    timeFinish: currentChannel.standup.timeFinish
  };
}

/**
  * <For a given channel, if a standup is currently active in the channel, sends a message to get buffered in the standup queue.>
  *
  * @param {string} token - token of authiorised user
  * @param {number} channelId - id of channel
  * @param {number} message - message that gets buffered in the standup queue
  * ...
  *
  * @throws {HTTPError} - invalid token, channelId is invalid, message length is invalid, authorised user is not member of the channel, no current active standup
  * @returns {} - everything works
*/

function standupSendV1 (token: string, channelId: number, message: string): Record<string, never> {
  const store = getData();

  // Checks for invalid token
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  // Checks for invalid channelId
  if (!isChannelIdValid(channelId)) {
    throw HTTPError(400, 'channelId is invalid');
  }

  // gets current users authUserId
  const currentUserId = getUserId(token);
  // gets the current user
  const currentUser = store.users.find(user => user.authUserId === currentUserId);
  // gets current channels
  const currentChannel = store.channels.find(channel => channel.channelId === channelId);

  // checks for invalid message length
  if (message.length > 1000) {
    throw HTTPError(400, 'Invalid Message Length');
  }

  // Checks if currentUser is in curentChannel
  if (!isUserInChannel(currentUserId, channelId)) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }

  // If there is no active standup, throw error
  if (!currentChannel.standup.isActive) {
    throw HTTPError(400, 'No current active standup');
  }

  // Modify input message to format:
  // [messageSenderHandle]: [message]
  const modifiedMessage = `${currentUser.handleStr}: ${message}`;
  // Push modifiedMessage to standup messages buffer
  currentChannel.standup.messages.push(modifiedMessage);

  setData(store);
  return {};
}

export {
  standupStartV1,
  standupActiveV1,
  standupSendV1
};
