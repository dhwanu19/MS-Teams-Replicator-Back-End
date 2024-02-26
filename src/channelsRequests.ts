import { requestHelper } from './otherRequests';

function channelsCreateV1(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v3', { name, isPublic }, token);
}

function channelsListV1(token: string) {
  return requestHelper('GET', '/channels/list/v3', { }, token);
}

function channelsListAllV1(token: string) {
  return requestHelper('GET', '/channels/listAll/v3', { }, token);
}

/*
// const OK = 200;
const port = config.port;
const url = config.url;

function channelsCreateV1(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
          `${url}:${port}/channels/create/v2`,
          {
            json: {
              token: token,
              name: name,
              isPublic: isPublic
            }
          }
  );
  return JSON.parse(res.body as string);
}

function channelsListV1(token: string) {
  const res = request(
    'GET',
          `${url}:${port}/channels/list/v2`,
          {
            qs: {
              token: token,
            }
          }
  );
  return JSON.parse(res.body as string);
}

function channelsListAllV1(token: string) {
  const res = request(
    'GET',
          `${url}:${port}/channels/listAll/v2`,
          {
            qs: {
              token: token,
            }
          }
  );
  return JSON.parse(res.body as string);
}
*/

export {
  channelsCreateV1,
  channelsListV1,
  channelsListAllV1
};
