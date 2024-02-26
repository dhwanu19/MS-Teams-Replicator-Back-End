import { getData } from './dataStore';
import { isTokenValid, getUserId } from './other';
import HTTPError from 'http-errors';

interface Reacts {
  reactId: number,
  uIds: number[],
  isThisUserReacted: boolean
}

interface Message {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
  reacts: Reacts[],
  isPinned: false
}

interface Member {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
}

/**
  * <Given a query substring, returns a collection of messages in all of the channels/DMs that the user has joined that contain the query>
  *
  * @param {string} token - token of user session
  * @param {string} queryStr - search string
  * ...
  *
  * @throws {HTTPError} - token is invalid
  * @throws {HTTPError} - queryStr.length is < 1 or > 1000
  * @returns {allMessages} - all works
*/

function searchV1(token: string, queryStr: string) {
  const data = getData();
  // Error Checking
  if (!isTokenValid(token)) {
    throw HTTPError(403, 'Token is invalid');
  }
  const maxLength = 1000;
  if (queryStr.length < 1 || queryStr.length > maxLength) {
    throw HTTPError(400, 'Message is incorrect length');
  }
  // Implementation
  // find channels/dms user is part of
  const userId = getUserId(token);
  const channelsFound = data.channels.filter(channel => channel.allMembers.map((member: Member) => member.uId).find((id: number) => id === userId) === userId);
  const dmsFound = data.dms.filter(dm => dm.members.map((member: Member) => member.uId).find((id: number) => id === userId) === userId);
  const messageLocations = channelsFound.concat(dmsFound);
  let allMessages = messageLocations.map(loc => loc.messages.filter((msg: Message) => msg.message.toLowerCase().includes(queryStr.toLowerCase())));
  allMessages = allMessages.flat();
  return allMessages;
}

export {
  searchV1
};
