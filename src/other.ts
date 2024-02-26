import { getData, setData } from './dataStore';
import { Message, MessageData, Member } from './interfaces';

/** clearV1 function
  * <Resets the dataStore>
  *
  * ...
  * @returns {} - returns an empty object
*/

function clearV1(): object {
  const store = getData();
  store.users = [];
  store.channels = [];
  store.dms = [];
  setData(store);
  return {};
}

// is token valid
const isTokenValid = (token: string): boolean => {
  const data = getData();
  return !(data.users.find(user => user.sessions.find((userToken: string) => userToken === token) !== undefined) === undefined);
};

// is channelId valid
const isChannelIdValid = (channelId: number): boolean => {
  const data = getData();
  return !(data.channels.find(channel => channel.channelId === channelId) === undefined);
};

// is dmId valid
const isDmIdValid = (dmId: number): boolean => {
  const data = getData();
  return !(data.dms.find(dm => dm.dmId === dmId) === undefined);
};

// is uId valid
const isuIdValid = (uId: number): boolean => {
  const data = getData();
  return !(data.users.find(user => user.authUserId === uId) === undefined);
};

// find uId from token
const getUserId = (token: string): number => {
  const data = getData();
  return data.users.find(user => user.sessions.find((userToken: string) => userToken === token) !== undefined).authUserId;
};

// check if uId is a member of a channel
const isUserInChannel = (uId: number, channelId: number): boolean => {
  const data = getData();
  return !(data.channels.find(channel => channel.allMembers.find((user: Member) => user.uId === uId) !== undefined) === undefined);
};

// check if uId is a member of a channel
const isUserInDM = (uId: number, dmId: number): boolean => {
  const data = getData();
  return !(data.dms.find(dm => dm.members.find((user: Member) => user.uId === uId) !== undefined) === undefined);
};

// check if uId is already owner of a channel
const isUserOwnerOfChannel = (uId: number, channelId: number): boolean => {
  const data = getData();
  return !(data.channels.find(channel => channel.ownerMembers.find((user: Member) => user.uId === uId) !== undefined) === undefined);
};

// Checks if user is a global owner
function isUserGlobalOwner(uId: number) {
  const data = getData();
  return (data.users.find(user => user.authUserId === uId).permissionId === 1);
}

// Returns the number of global owners
function numGlobalOwner() {
  const data = getData();
  return (data.users.filter(user => user.permissionId === 1)).length;
}

// Gets a users permissionId
function getPermissionId(uId: number) {
  const data = getData();
  return data.users.find(user => user.authUserId === uId).permissionId;
}

function getCurrentMessage(authUserId: number, messageId: number): MessageData {
  const store = getData();
  let member;
  let message;

  for (const channel of store.channels) {
    member = channel.allMembers.find((mem: Member) => mem.uId === authUserId);
    message = channel.messages.find((mes: Message) => mes.messageId === messageId);
    if (member !== undefined && message !== undefined) {
      return {
        message: message,
        channel: channel,
        dm: undefined
      };
    }
  }

  for (const dm of store.dms) {
    member = dm.members.find((mem: Member) => mem.uId === authUserId);
    message = dm.messages.find((mes: Message) => mes.messageId === messageId);
    if (member !== undefined && message !== undefined) {
      return {
        message: message,
        channel: undefined,
        dm: dm,
      };
    }
  }

  return {
    message: undefined,
    channel: undefined,
    dm: undefined
  };
}

export {
  clearV1,
  isTokenValid,
  isChannelIdValid,
  isDmIdValid,
  isuIdValid,
  getUserId,
  isUserInChannel,
  isUserOwnerOfChannel,
  isUserInDM,
  isUserGlobalOwner,
  numGlobalOwner,
  getPermissionId,
  getCurrentMessage
};
