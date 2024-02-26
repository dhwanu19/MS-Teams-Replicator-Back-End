import { requestHelper } from './otherRequests';

function messageSendV1(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/message/send/v2', { channelId, message }, token);
}

function messageSendDmV1(token: string, dmId: number, message: string) {
  return requestHelper('POST', '/message/senddm/v2', { dmId, message }, token);
}

function messageEditV1(token: string, messageId: number, message: string) {
  return requestHelper('PUT', '/message/edit/v2', { messageId, message }, token);
}

function messageRemoveV1(token: string, messageId: number) {
  return requestHelper('DELETE', '/message/remove/v2', { messageId }, token);
}

function messageSendLaterV1(token: string, channelId: number, message: string, timeSent: number) {
  return requestHelper('POST', '/message/sendlater/v1', { channelId, message, timeSent }, token);
}

function messageSendLaterDmV1(token: string, dmId: number, message: string, timeSent: number) {
  return requestHelper('POST', '/message/sendlaterdm/v1', { dmId, message, timeSent }, token);
}

function messageShare(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  return requestHelper('POST', '/message/share/v1', { ogMessageId, message, channelId, dmId }, token);
}
function messagePinV1(token: string, messageId: number) {
  return requestHelper('POST', '/message/pin/v1', { messageId }, token);
}

function messageUnpinV1(token: string, messageId: number) {
  return requestHelper('POST', '/message/unpin/v1', { messageId }, token);
}

function messageReactV1(token: string, messageId: number, reactId: number) {
  return requestHelper('POST', '/message/react/v1', { messageId, reactId }, token);
}

function messageUnreactV1(token: string, messageId: number, reactId: number) {
  return requestHelper('POST', '/message/unreact/v1', { messageId, reactId }, token);
}

export {
  messageSendV1,
  messageEditV1,
  messageSendDmV1,
  messageRemoveV1,
  messageReactV1,
  messageUnreactV1,
  messageSendLaterDmV1,
  messageSendLaterV1,
  messageShare,
  messagePinV1,
  messageUnpinV1,
};
