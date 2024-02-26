/*
    This is test file for channelDetails

    This function returns details about a channel
    Error:
        - token is invalid
        - channelId does not refer to a valid channel
        - channelId is valid but user is not a member of the channel

    Success:
        - returns basic details about a channel
        {
          name: string,
          isPublic: boolean,
          ownerMembers: Member[],
          allMembers: Member[],
        }
*/

import { channelDetailsV1 } from './channelRequests';
import { channelsCreateV1 } from './channelsRequests';
import { authRegisterV1 } from './authRequests';
import { clearV1 } from './otherRequests';
import { userProfileV1 } from './usersRequests';

beforeEach(() => {
  clearV1();
});

// Reseting dataStore after each test
afterAll(() => {
  clearV1();
});

// Successful Tests
describe('Successful Tests', () => {
  test('Test 1: Getting details using channel owner', () => {
    const newUser = authRegisterV1('bob@gmail.com', 'password', 'bob', 'smith');
    const channelId = channelsCreateV1(newUser.token, 'Pets', true).channelId;
    expect(channelDetailsV1(newUser.token, channelId)).toStrictEqual({
      name: 'Pets',
      isPublic: true,
      ownerMembers: [userProfileV1(newUser.token, newUser.authUserId).user],
      allMembers: [userProfileV1(newUser.token, newUser.authUserId).user],
    });
  });
});

// error tests
describe('channelDetails error cases', () => {
  // Invalid channelIds
  test('Test 1: Invalid Channel Id', () => {
    const token = authRegisterV1('bob@gmail.com', 'password', 'bob', 'smith').token;
    const channelId = channelsCreateV1(token, 'Pets', true).channelId;
    const invalidId = channelId + 1;
    expect(channelDetailsV1(token, invalidId)).toEqual({ errorCode: 400 });
  });

  // token is not a member of the channel
  test('Test 2: authorised user is not a member of the channel', () => {
    const creatorToken = authRegisterV1('bob@gmail.com', 'password', 'bob', 'smith').token;
    const channelId = channelsCreateV1(creatorToken, 'Pets', true).channelId;
    const nonMemberToken = authRegisterV1('tim@gmail.com', 'football22', 'Tim', 'Tam').token;
    expect(channelDetailsV1(nonMemberToken, channelId)).toEqual({ errorCode: 403 });
  });

  // token is invalid
  test('Test 3: token is invalid', () => {
    expect(channelDetailsV1('', 1)).toEqual({ errorCode: 403 });
  });
});
