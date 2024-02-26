// import config from './config.json';
import { requestHelper } from './otherRequests';

// const OK = 200;
// const port = config.port;
// const url = config.url;

function userProfileV1(token: string, uId: number) {
  return requestHelper('GET', '/user/profile/v3', { uId }, token);
}

function userProfileSethandleV1(token: string, handleStr: string) {
  return requestHelper('PUT', '/user/profile/sethandle/v2', { handleStr }, token);
}

function userProfileSetnameV1(token: string, nameFirst: string, nameLast: string) {
  return requestHelper('PUT', '/user/profile/setname/v2', { nameFirst, nameLast }, token);
}

function userProfileSetemailV1(token: string, email: string) {
  return requestHelper('PUT', '/user/profile/setemail/v2', { email }, token);
}

function usersAllV1(token: string) {
  return requestHelper('GET', '/users/all/v2', { }, token);
}

function userProfileUploadphoto(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  return requestHelper('POST', '/user/profile/uploadphoto/v1', { imgUrl, xStart, yStart, xEnd, yEnd }, token);
}

export {
  userProfileV1,
  userProfileSethandleV1,
  userProfileSetnameV1,
  userProfileSetemailV1,
  usersAllV1,
  userProfileUploadphoto
};
