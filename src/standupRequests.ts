import { requestHelper } from './otherRequests';

function standupStartV1(token: string, channelId: number, length: number) {
  return requestHelper('POST', '/standup/start/v1', { channelId, length }, token);
}

function standupActiveV1 (token: string, channelId: number) {
  return requestHelper('GET', '/standup/active/v1', { channelId }, token);
}

function standupSendV1 (token: string, channelId: number, message: string) {
  return requestHelper('POST', '/standup/send/v1', { channelId, message }, token);
}

export {
  standupStartV1,
  standupActiveV1,
  standupSendV1
};
