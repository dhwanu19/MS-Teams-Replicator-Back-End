import request, { HttpVerb } from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

function requestHelper(method: HttpVerb, path: string, inputs: object, token?: string) {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = inputs;
  } else {
    json = inputs;
  }
  const headers = { token: token };
  const res = request(method, `${url}:${port}` + path, { qs, json, headers });

  if (res.statusCode !== OK) {
    return {
      errorCode: res.statusCode
    };
  }
  return JSON.parse(res.getBody() as string);
}

// clear
function clearV1() {
  const res = request(
    'DELETE',
          `${url}:${port}/clear/v1`,
          {
            qs: { }
          }
  );
  return JSON.parse(res.body as string);
}

export {
  clearV1,
  requestHelper
};
