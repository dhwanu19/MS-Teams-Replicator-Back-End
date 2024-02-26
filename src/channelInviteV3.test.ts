/*
    Test file for channelInviteV1 function from './channel.js'

    Testing:
    - Successful Invite
    - error: Invalid channelId
    - error: Invalid uId
    - error: uId is already a part of channel
    - error: authUserId is not part of channel
    - error: invalid token
    */

import { channelInviteV1, channelDetailsV1 } from './channelRequests';
import { clearV1 } from './otherRequests';
import { authRegisterV1 } from './authRequests';
import { channelsCreateV1 } from './channelsRequests';

beforeEach(() => {
  clearV1();
});

// Reseting dataStore after each test
afterAll(() => {
  clearV1();
});

// success tests
describe('Success tests', () => {
  test('Test 1: returns empty object', () => {
    const authUser = authRegisterV1('email@email.com', 'password', 'Firstname', 'Lastname').token;
    const channelId = channelsCreateV1(authUser, 'Channelname', true).channelId;
    const altUserId = authRegisterV1('gmail@gmail.com', 'passWord', 'Fname', 'Lname').authUserId;
    expect(channelInviteV1(authUser, channelId, altUserId)).toStrictEqual({});
  });

  test('Test 2: check if user is added to the channel', () => {
    const authUser = authRegisterV1('email@email.com', 'password', 'Firstname', 'Lastname');
    const channelId = channelsCreateV1(authUser.token, 'Channelname', true).channelId;
    const altUser = authRegisterV1('gmail@gmail.com', 'passWord', 'Fname', 'Lname');
    channelInviteV1(authUser.token, channelId, altUser.authUserId);
    const channelMembers = channelDetailsV1(altUser.token, channelId).allMembers;
    expect(new Set(channelMembers)).toStrictEqual(
      new Set(
        [
          {
            uId: authUser.authUserId,
            nameFirst: 'Firstname',
            nameLast: 'Lastname',
            email: 'email@email.com',
            handleStr: 'firstnamelastname',
            profileImgUrl: expect.any(String)
          },
          {
            uId: altUser.authUserId,
            email: 'gmail@gmail.com',
            nameFirst: 'Fname',
            nameLast: 'Lname',
            handleStr: 'fnamelname',
            profileImgUrl: expect.any(String)
          },
        ]
      )
    );
  });
});

// error tests
describe('Error tests', () => {
  test('Test 1: token is invalid', () => {
    expect(channelInviteV1('', 1, 1)).toStrictEqual({ errorCode: 403 });
  });

  test('Test 2: Invalid ChannelId', () => {
    const authUser = authRegisterV1('email@email.com', 'password', 'Firstname', 'Lastname').token;
    const channelId = channelsCreateV1(authUser, 'Channelname', true).channelId;
    const invalidChannel = channelId + 1;
    const altUserId = authRegisterV1('gmail@gmail.com', 'passWord', 'Fname', 'Lname').authUserId;
    expect(channelInviteV1(authUser, invalidChannel, altUserId)).toStrictEqual({ errorCode: 400 });
  });

  test('Test 3: Invalid uId', () => {
    const authUser = authRegisterV1('email@email.com', 'password', 'Firstname', 'Lastname');
    const channelId = channelsCreateV1(authUser.token, 'Channelname', true).channelId;
    const invalidUser = authUser.authUserId + 1;
    expect(channelInviteV1(authUser.token, channelId, invalidUser)).toStrictEqual({ errorCode: 400 });
  });

  test('Test 4: uId user already in Channel', () => {
    const authUser = authRegisterV1('email@email.com', 'password', 'Firstname', 'Lastname');
    const channelId = channelsCreateV1(authUser.token, 'Channelname', true).channelId;
    expect(channelInviteV1(authUser.token, channelId, authUser.authUserId)).toStrictEqual({ errorCode: 400 });
  });

  test('Test 5: Token user is not a member of the Channel => { error: expect.any(String) }', () => {
    const authUser = authRegisterV1('email@email.com', 'password', 'Firstname', 'Lastname').token;
    const channelId = channelsCreateV1(authUser, 'Channelname', true).channelId;
    const altUser = authRegisterV1('gmail@gmail.com', 'passWord', 'Fname', 'Lname');
    expect(channelInviteV1(altUser.token, channelId, altUser.authUserId)).toStrictEqual({ errorCode: 403 });
  });
});
