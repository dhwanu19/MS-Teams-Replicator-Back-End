import HTTPError from 'http-errors';
import { getData, setData } from './dataStore';
import { isTokenValid, getUserId } from './other';
import { ChannelId, ChannelsList } from './interfaces';
// import { authRegisterV1 } from './auth.js'
// import { channelsCreateV1, channelsListV1 } from './channels.js'
// Final update on channelsCreateV1 with expected return value.

const DefaultProfileImage = 'http://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/481px-Cat03.jpg';

/**
  * <Creates a new channel with the given name, that is either a public or private channel.>
  * <The user who created it automatically joins the channel.>
  *
  * @param {string} token - token of authorised user
  * @param {String} name - Given name for the channel
  * @param {Boolean} isPublic - decides if its a public or private channel
  * ...
  *@throws {HTTPError} - channel name length is invalid, token is invalid
  * @returns {number} - valid authUserId and name provided is between 1 and 20 characters long.
*/

function channelsCreateV1 (token: string, name: string, isPublic: boolean): ChannelId {
  const store = getData();

  // When length of name is less than 1 or more than 20 characters return error.
  if (name.length < 1 || name.length > 20) {
    // throw error 400 when the name is less than one character or greater than 20 characters.
    throw HTTPError(400, 'Channel name length is invalid');
  }

  // Loop through all the users and if the token does not match anyone's return "User doesn't exist".
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Token invalid');
  }

  // newChannelId is equal to the length of the channels array in the data object plus 1.
  const newChannelId = store.channels.length + 1;
  const channelCreatorId = getUserId(token);
  let channelCreator;
  for (const user of store.users) {
    if (channelCreatorId === user.authUserId) {
      channelCreator = user;
    }
  }

  // Pushing the details of the user into the dataStore.
  store.channels.push(
    {
      name: name,
      channelId: newChannelId,
      isPublic: isPublic,
      allMembers: [
        {
          uId: channelCreator.authUserId,
          email: channelCreator.email,
          nameFirst: channelCreator.nameFirst,
          nameLast: channelCreator.nameLast,
          handleStr: channelCreator.handleStr,
          profileImgUrl: DefaultProfileImage
        },
      ],
      ownerMembers: [
        {
          uId: channelCreator.authUserId,
          email: channelCreator.email,
          nameFirst: channelCreator.nameFirst,
          nameLast: channelCreator.nameLast,
          handleStr: channelCreator.handleStr,
          profileImgUrl: DefaultProfileImage
        },
      ],
      messages: [],
      standup: {
        isActive: false,
        startMember: null,
        starterToken: null,
        timeFinish: null,
        messages: []
      }
    }
  );
  setData(store);

  // if all parameters are valid, return channelId.
  return {
    channelId: newChannelId
  };
}

// channelsListV1
// Dhwanish Kshatriya z5421168

/**
  * <Provides an array of all channels (and their associated details) that the authorised user is part of.>
  *
  * @param {string} token - token of authorised user
  * ...
  *@throws {HTTPError} - invalid token
  * @returns {array} channel - authUserId is valid
*/

function channelsListV1 (token: string): ChannelsList {
  const store = getData();
  const channelsArray = [];

  // Checking if token is valid
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }
  // Scroll through channels. If the user
  // is a member of a channel then add
  // channel to array and return array
  const authUserId = getUserId(token);
  for (const channel of store.channels) {
    for (const member of channel.allMembers) {
      if (member.uId === authUserId) {
        const newChannel = {
          name: channel.name,
          channelId: channel.channelId,
        };
        channelsArray.push(newChannel);
      }
    }
  }

  // Return array of channels the authUser is a member of
  return {
    channels: channelsArray,
  };
}

// function stub for channelsListAllV1
// Dhwanish Kshatriya z5421168
// On 22/09/22

/**
  * Provides an array of all channels, including private channels (and their associated details).
  *
  * @param {string} token - token of authorised user
  * ...
  *@throws {HTTPError} - invalid token
  * @returns {Array} allChannelsArray - authUserId is valid
*/

function channelsListAllV1 (token: string): ChannelsList {
  const store = getData();
  const allChannelsArray = [];

  // Checking if token is valid
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  // If there are no errors, the scroll through
  // channels and push them to
  for (const channel of store.channels) {
    // need help for array of objects & pushing
    const newChannel = {
      name: channel.name,
      channelId: channel.channelId,
    };
    allChannelsArray.push(newChannel);
  }

  // Return array of all channels
  return {
    channels: allChannelsArray,
  };
}

export {
  channelsCreateV1,
  channelsListV1,
  channelsListAllV1,
};
