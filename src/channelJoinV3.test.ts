/*
    Test file for channelJoinV1 function from './channel.js'

    parameters: { authUserId, channelId }
    Testing:
    - Successful add to channel
    - error: channelId does not refer to valid channel
    - error: user already in channel
    - error: channelId refers to a channel that is private,
              when the authorised user is not already a channel member and
              is not a global owner
    - error: token is invalid
*/

import { authRegisterV1 } from './authRequests';
import { channelsCreateV1 } from './channelsRequests';
import { channelDetailsV1 } from './channelRequests';
import { channelJoinV1 } from './channelRequests';
import { clearV1 } from './otherRequests';

beforeEach(() => {
  clearV1();
});

// Reseting dataStore after each test
afterAll(() => {
  clearV1();
});

// Error cases
describe('Testing channelJoinV1 error cases', () => {
  // channelId is invalid
  test('Test 1: invalid channelId', () => {
    const newUser = authRegisterV1('sample@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy').token;
    const user2 = authRegisterV1('something@gmail.com', 'randoPassword', 'Bro', 'Hello').token;
    const newChannelId = channelsCreateV1(newUser, 'name', true).channelId;
    expect(
      channelJoinV1(user2, newChannelId + 1)
    ).toEqual({ errorCode: 400 });
  });

  // token is invalid
  test('Test 2: invalid token', () => {
    expect(
      channelJoinV1('', 1)
    ).toEqual({ errorCode: 403 });
  });

  // User is already in channel
  test('Test 3: authUserId is already in channel', () => {
    const user = authRegisterV1('sample@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy').token;
    const channelId = channelsCreateV1(user, 'name', true).channelId;
    expect(
      channelJoinV1(user, channelId)
    ).toEqual({ errorCode: 400 });
  });

  // channelId refers to a channel that is private,
  // when the authorised user is not already a channel member and
  // is not a global owner
  test('Test 4: token has no access to channel (private, not global member', () => {
    const user1 = authRegisterV1('sample@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy').token;
    const user2 = authRegisterV1('something@gmail.com', 'randoPassword', 'Bro', 'Hello').token;
    const channelId = channelsCreateV1(user1, 'name', false).channelId;
    expect(
      channelJoinV1(user2, channelId)
    ).toEqual({ errorCode: 403 });
  });
});

// Success case
describe('Testing channelJoinV1 success case', () => {
  // User successfully joins channel
  test('Test 1: correctly joins user to channel', () => {
    const user1 = authRegisterV1('sample@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const user1Token = user1.token;
    const user2 = authRegisterV1('something@gmail.com', 'randoPassword', 'Bro', 'Hello');
    const user2Token = user2.token;
    const newChannelId = channelsCreateV1(user1Token, 'channelName', true).channelId;
    channelJoinV1(user2Token, newChannelId);
    const details = channelDetailsV1(user1Token, newChannelId);
    expect(new Set(details.allMembers)).toEqual(new Set(
      [
        {
          uId: user2.authUserId,
          nameFirst: 'Bro',
          nameLast: 'Hello',
          email: 'something@gmail.com',
          handleStr: 'brohello',
          profileImgUrl: expect.any(String)
        },
        {
          uId: user1.authUserId,
          email: 'sample@gmail.com',
          nameFirst: 'Lachlan',
          nameLast: 'Gilroy',
          handleStr: 'lachlangilroy',
          profileImgUrl: expect.any(String)
        },
      ]
    ));
  });

  // correct return empty object
  test('Test 2: correct return empty object', () => {
    const user1 = authRegisterV1('sample@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy').token;
    const user2 = authRegisterV1('something@gmail.com', 'randoPassword', 'Bro', 'Hello').token;
    const newChannelId = channelsCreateV1(user1, 'channelName', true).channelId;
    expect(channelJoinV1(user2, newChannelId)).toEqual({});
  });
});
