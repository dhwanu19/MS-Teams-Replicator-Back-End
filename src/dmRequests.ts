import { requestHelper } from './otherRequests';

function dmCreateV1(token: string, uIds: number[]) {
  return requestHelper('POST', '/dm/create/v2', { uIds }, token);
}

function dmDetailsV1(token: string, dmId: number) {
  return requestHelper('GET', '/dm/details/v2', { dmId }, token);
}

function dmMessagesV1(token: string, dmId: number, start: number) {
  return requestHelper('GET', '/dm/messages/v2', { dmId, start }, token);
}

function dmListV1(token: string) {
  return requestHelper('GET', '/dm/list/v2', { }, token);
}

function dmLeaveV1 (token: string, dmId: number) {
  return requestHelper('POST', '/dm/leave/v2', { dmId }, token);
}

function dmRemoveV1 (token: string, dmId: number) {
  return requestHelper('DELETE', '/dm/remove/v2', { dmId }, token);
}

export {
  dmCreateV1,
  dmDetailsV1,
  dmMessagesV1,
  dmListV1,
  dmLeaveV1,
  dmRemoveV1
};
