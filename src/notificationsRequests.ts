import { requestHelper } from './otherRequests';

function notificationsGet(token: string) {
  return requestHelper('GET', '/notifications/get/v1', {}, token);
}

export {
  notificationsGet
};
