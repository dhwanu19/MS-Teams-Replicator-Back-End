import { requestHelper } from './otherRequests';

function channelDetailsV1(token: string, channelId: number) {
  return requestHelper('GET', '/channel/details/v3', { channelId }, token);
}

function channelMessagesV1(token: string, channelId: number, start: number) {
  return requestHelper('GET', '/channel/messages/v3', { channelId, start }, token);
}

function channelJoinV1(token: string, channelId: number) {
  return requestHelper('POST', '/channel/join/v3', { channelId }, token);
}

function channelInviteV1(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/invite/v3', { channelId, uId }, token);
}

function channelAddownerV1(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/addowner/v2', { channelId, uId }, token);
}

function channelRemoveownerV1(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/removeowner/v2', { channelId, uId }, token);
}

function channelLeaveV1(token: string, channelId: number) {
  return requestHelper('POST', '/channel/leave/v2', { channelId }, token);
}

export {
  channelDetailsV1,
  channelMessagesV1,
  channelJoinV1,
  channelInviteV1,
  channelAddownerV1,
  channelRemoveownerV1,
  channelLeaveV1
};
