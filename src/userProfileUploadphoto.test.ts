import { clearV1 } from './otherRequests';
import { channelsCreateV1 } from './channelsRequests';
import { channelDetailsV1, channelJoinV1, channelAddownerV1 } from './channelRequests';
import { dmCreateV1, dmDetailsV1 } from './dmRequests';
import { userProfileUploadphoto, userProfileV1 } from './usersRequests';
import { authRegisterV1 } from './authRequests';
import config from './config.json';
import fs from 'fs';

beforeAll(() => { clearV1(); });
afterEach(() => { clearV1(); });

describe('Success Tests', () => {
  test('Success Test', () => {
    const user = authRegisterV1('someuser@gmail.com', 'password', 'Test', 'SuccessFirst');
    const imgUrl = 'http://www.salvationarmy.org.au/scribe/sites/all/shared/logos/redshield/jpg-colour-shield-A3.jpg';
    expect(userProfileUploadphoto(user.token, imgUrl, 100, 100, 700, 700)).toStrictEqual({});
    expect(fs.existsSync(__dirname + '/static/testsuccessfirst.jpg')).toStrictEqual(true);
  });
  test('Whitebox Success Test, URL added properly', () => {
    const firstUser = authRegisterV1('coverage@gmail.com', 'password', 'Me', 'Too');
    const secondUser = authRegisterV1('someuser@gmail.com', 'password', 'Test', 'SuccessFirst');
    const channelId = channelsCreateV1(firstUser.token, 'New Channel', true).channelId;
    channelJoinV1(secondUser.token, channelId);
    channelAddownerV1(firstUser.token, channelId, secondUser.authUserId);
    const dmId = dmCreateV1(firstUser.token, [secondUser.authUserId]).dmId;
    const imgUrl = 'http://www.salvationarmy.org.au/scribe/sites/all/shared/logos/redshield/jpg-colour-shield-A3.jpg';
    expect(userProfileUploadphoto(secondUser.token, imgUrl, 100, 100, 700, 700)).toStrictEqual({});
    const userProfile = userProfileV1(secondUser.token, secondUser.authUserId).user;
    const newUrl = `${config.url}:${config.port}/static/${userProfile.handleStr}.jpg`;
    expect(userProfile.profileImgUrl).toStrictEqual(newUrl);
    const channelDeets = channelDetailsV1(secondUser.token, channelId);
    expect(channelDeets.allMembers[1].profileImgUrl).toStrictEqual(newUrl);
    expect(channelDeets.ownerMembers[1].profileImgUrl).toStrictEqual(newUrl);
    expect(dmDetailsV1(secondUser.token, dmId).members[1].profileImgUrl).toStrictEqual(newUrl);
  });
});

describe('Error Tests', () => {
  test('Invalid Token', () => {
    const imgUrl = 'http://www.salvationarmy.org.au/scribe/sites/all/shared/logos/redshield/jpg-colour-shield-A3.jpg';
    // x:1100, y:825
    expect(userProfileUploadphoto('invalid token', imgUrl, 0, 0, 200, 150)).toStrictEqual({ errorCode: 403 });
  });
  test('xStart, yStart, xEnd or yEnd not within image dimensions', () => {
    const userToken = authRegisterV1('someuser@gmail.com', 'password', 'Test', 'Second').token;
    const imgUrl = 'http://www.salvationarmy.org.au/scribe/sites/all/shared/logos/redshield/jpg-colour-shield-A3.jpg';
    // x:1100, y:825
    expect(userProfileUploadphoto(userToken, imgUrl, -1, 0, 200, 150)).toStrictEqual({ errorCode: 400 });
    expect(userProfileUploadphoto(userToken, imgUrl, 0, -1, 200, 150)).toStrictEqual({ errorCode: 400 });
    expect(userProfileUploadphoto(userToken, imgUrl, 0, 0, 1200, 150)).toStrictEqual({ errorCode: 400 });
    expect(userProfileUploadphoto(userToken, imgUrl, 0, 0, 200, 1200)).toStrictEqual({ errorCode: 400 });
  });
  test('imgUrl is an error', () => {
    const userToken = authRegisterV1('someuser@gmail.com', 'password', 'Test', 'Third').token;
    const imgUrl = 'https://google.com/asdsaisdjoqiw.jpg';
    expect(userProfileUploadphoto(userToken, imgUrl, 0, 0, 200, 150)).toStrictEqual({ errorCode: 400 });
  });
  test('xEnd/yEnd is <= xStart/yStart', () => {
    const userToken = authRegisterV1('someuser@gmail.com', 'password', 'Test', 'Fourth').token;
    const imgUrl = 'http://www.salvationarmy.org.au/scribe/sites/all/shared/logos/redshield/jpg-colour-shield-A3.jpg';
    expect(userProfileUploadphoto(userToken, imgUrl, 0, 0, 0, 150)).toStrictEqual({ errorCode: 400 });
    expect(userProfileUploadphoto(userToken, imgUrl, 0, 0, 200, 0)).toStrictEqual({ errorCode: 400 });
  });
  test('imgUrl is not .jpg', () => {
    const userToken = authRegisterV1('someuser@gmail.com', 'password', 'Test', 'Fifth').token;
    const imgUrl = 'http://compote.slate.com/images/697b023b-64a5-49a0-8059-27b963453fb1.gif';
    expect(userProfileUploadphoto(userToken, imgUrl, 0, 0, 10, 10)).toStrictEqual({ errorCode: 400 });
  });
});
