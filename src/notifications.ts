import { getData, setData } from './dataStore';
import { isTokenValid, getUserId } from './other';
import HTTPError from 'http-errors';
import { Notification, Member } from './interfaces';

/**
  * <notifts user when tagged.>
  *
  * @param {string} token - token of authiorised user
  * @param {number} notifiedId - id if notified
  * @param {number} channelId - channelId
  * @param {number} dmId - dmId
  * @param {string} message - message
  * ...
  *
*/

function notifyTag(senderId: number, notifiedId: number, channelId: number, dmId: number, message: string) {
  const data = getData();
  const senderUser = data.users.find(user => user.authUserId === senderId);
  const notifiedUser = data.users.find(user => user.authUserId === notifiedId);
  let stream;
  if (channelId !== -1) {
    stream = data.channels.find(channel => channel.channelId === channelId);
    const isNotifiedUserInChannel = stream.allMembers.find((member: Member) => member.uId === notifiedId) !== undefined;
    if (!isNotifiedUserInChannel) { return; }
  } else {
    stream = data.dms.find(dm => dm.dmId === dmId);
    const isNotifiedUserInDm = stream.members.find((member: Member) => member.uId === notifiedId) !== undefined;
    if (!isNotifiedUserInDm) { return; }
  }
  const streamName = stream.name;
  // Add notification to user notifications
  const notificationMsg = `${senderUser.handleStr} tagged you in ${streamName}: ${message.substring(0, 20)}`;
  const notification: Notification = {
    channelId: channelId,
    dmId: dmId,
    notificationMessage: notificationMsg
  };
  notifiedUser.notifications.unshift(notification);
  /*
  // Notify User
  for (const token of notifiedUser.sessions) {
    notificationsGet(token);
  }
  */
  setData(data);
}

/**
  * <notifts user when react.>
  *
  * @param {string} token - token of authiorised user
  * @param {number} notifiedId - id if notified
  * @param {number} channelId - channelId
  * @param {number} dmId - dmId
  * ...
  *
*/

function notifyReact(reactedId: number, notifiedId: number, channelId: number, dmId: number) {
  const data = getData();
  const reactedUser = data.users.find(user => user.authUserId === reactedId);
  const notifiedUser = data.users.find(user => user.authUserId === notifiedId);
  let stream;
  if (channelId !== -1) {
    stream = data.channels.find(channel => channel.channelId === channelId);
    const isNotifiedUserInChannel = stream.allMembers.find((member: Member) => member.uId === notifiedId) !== undefined;
    if (!isNotifiedUserInChannel) { return; }
  } else {
    stream = data.dms.find(dm => dm.dmId === dmId);
    const isNotifiedUserInDm = stream.members.find((member: Member) => member.uId === notifiedId) !== undefined;
    if (!isNotifiedUserInDm) { return; }
  }
  const streamName = stream.name;
  // Add notification to user notifications
  const notificationMsg = `${reactedUser.handleStr} reacted to your message in ${streamName}`;
  const notification: Notification = {
    channelId: channelId,
    dmId: dmId,
    notificationMessage: notificationMsg
  };
  notifiedUser.notifications.unshift(notification);
  /*
  // Notify User
  for (const token of notifiedUser.sessions) {
    notificationsGet(token);
  }
  */
  setData(data);
}

/**
  * <notifts user when joined.>
  *
  * @param {string} token - token of authiorised user
  * @param {number} notifiedId - id if notified
  * @param {number} channelId - channelId
  * @param {number} dmId - dmId
  * ...
  *
*/

function notifyJoin(adderId: number, notifiedId: number, channelId: number, dmId: number) {
  const data = getData();
  const adderUser = data.users.find(user => user.authUserId === adderId);
  const notifiedUser = data.users.find(user => user.authUserId === notifiedId);
  let streamName;
  if (channelId !== -1) {
    streamName = data.channels.find(channel => channel.channelId === channelId).name;
  } else {
    streamName = data.dms.find(dm => dm.dmId === dmId).name;
  }
  // Add notification to user notifications
  const notificationMsg = `${adderUser.handleStr} added you to ${streamName}`;
  const notification: Notification = {
    channelId: channelId,
    dmId: dmId,
    notificationMessage: notificationMsg
  };
  notifiedUser.notifications.unshift(notification);
  /*
  // Notify User
  for (const token of notifiedUser.sessions) {
    notificationsGet(token);
  }
  */
  setData(data);
}

/**
  * <Returns 20 most recent notifications for the user>
  *
  * @param {string} token - token of user
  * ...
  *
  * @throws {HTTPError} - token is invalid
  * @returns {Notification[]} - all works
*/

function notificationsGet(token: string): Notification[] {
  // Error Check: Invalid token
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Invalid Token');
  }
  // Implementation
  // Find user in database
  const data = getData();
  const userId = getUserId(token);
  const notifiedUser = data.users.find(user => user.authUserId === userId);
  const returnedNotifications: Notification[] = notifiedUser.notifications.slice(0, 20);
  return returnedNotifications;
}

export {
  notificationsGet,
  notifyJoin,
  notifyReact,
  notifyTag
};
