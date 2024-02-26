/*
    This is test file for channelLeave

    This function removes a user as a member and owner of a channel
    Error:
        - token is invalid
        - channelId does not refer to a valid channel
        - the authorised user is the starter of an active standup in the channel
        - channelId is valid and the authorised user is not a member of the channel

    Success:
        - Removes authorised user as a member (both owner and all) of the channel
*/

import { authRegisterV1 } from './authRequests';
import { channelsCreateV1 } from './channelsRequests';
import { channelLeaveV1, channelDetailsV1, channelJoinV1, channelMessagesV1, channelInviteV1 } from './channelRequests';
import { clearV1 } from './otherRequests';
import { userProfileV1 } from './usersRequests';
import { messageSendV1 } from './messageRequests';
import { standupStartV1 } from './standupRequests';

beforeEach(() => {
  clearV1();
});

// Reseting dataStore after each test
afterAll(() => {
  clearV1();
});

describe('channelsLeaveV1 Error Cases', () => {
  test('Test 1: channelId is invalid', () => {
    const token = authRegisterV1('error@gmail.com', 'errorPassword', 'Error', 'Smith').token;
    expect(channelLeaveV1(token, 1)).toStrictEqual({ errorCode: 400 });
  });

  test('Test 2: authorised user is not a member of the channel', () => {
    const token = authRegisterV1('error@gmail.com', 'errorPassword', 'Error', 'Smith').token;
    const altToken = authRegisterV1('alt@gmail.com', 'altPass', 'Alt', 'Smith').token;
    const validChannelId = channelsCreateV1(token, 'TestChannel', true).channelId;
    expect(channelLeaveV1(altToken, validChannelId)).toStrictEqual({ errorCode: 403 });
  });

  test('Test 3: Invalid token', () => {
    expect(channelLeaveV1('', 1)).toStrictEqual({ errorCode: 403 });
  });

  test('Test 4: authorised user is the starter of an active standup in the channel', () => {
    const owner = authRegisterV1('owner@gmail.com', 'ownerPassword', 'Owner', 'Smith');
    const validChannelId = channelsCreateV1(owner.token, 'TestChannel', true).channelId;
    standupStartV1(owner.token, validChannelId, 10);
    expect(channelLeaveV1(owner.token, validChannelId)).toStrictEqual({ errorCode: 400 });
  });
});

describe('channelsLeaveV1 Success Cases', () => {
  test('Test 1: Non-owner member leaves channel', () => {
    const owner = authRegisterV1('owner@gmail.com', 'ownerPassword', 'Owner', 'Smith');
    const other = authRegisterV1('other@gmail.com', 'otherPassword', 'Other', 'Smith');
    const validChannelId = channelsCreateV1(owner.token, 'TestChannel', true).channelId;
    channelInviteV1(owner.token, validChannelId, other.authUserId);
    channelLeaveV1(other.token, validChannelId);
    expect(channelDetailsV1(owner.token, validChannelId)).toStrictEqual(
      {
        name: 'TestChannel',
        isPublic: true,
        ownerMembers: [userProfileV1(owner.token, owner.authUserId).user],
        allMembers: [userProfileV1(owner.token, owner.authUserId).user],
      });
  });

  test('Test 2: Owner leaves channel', () => {
    const owner = authRegisterV1('owner@gmail.com', 'ownerPassword', 'Owner', 'Smith');
    const other = authRegisterV1('other@gmail.com', 'otherPassword', 'Other', 'Smith');
    const validChannelId = channelsCreateV1(owner.token, 'TestChannel', true).channelId;
    channelInviteV1(owner.token, validChannelId, other.authUserId);
    channelLeaveV1(owner.token, validChannelId);
    expect(channelDetailsV1(other.token, validChannelId)).toStrictEqual(
      {
        name: 'TestChannel',
        isPublic: true,
        ownerMembers: [],
        allMembers: [userProfileV1(other.token, other.authUserId).user],
      });
  });

  test('Test 3: User Message Still Remains in Channel', () => {
    const owner = authRegisterV1('owner@gmail.com', 'ownerPassword', 'Owner', 'Smith');
    const other = authRegisterV1('other@gmail.com', 'otherPassword', 'Other', 'Smith');
    const validChannelId = channelsCreateV1(owner.token, 'TestChannel', true).channelId;
    channelJoinV1(other.token, validChannelId);
    const message = 'testMessage';
    messageSendV1(other.token, validChannelId, message);
    channelLeaveV1(other.token, validChannelId);
    expect(channelMessagesV1(owner.token, validChannelId, 0).messages[0].message).toStrictEqual(message);
  });

  test('Test 4: No remaining members/correct return object', () => {
    const owner = authRegisterV1('owner@gmail.com', 'ownerPassword', 'Owner', 'Smith');
    const validChannelId = channelsCreateV1(owner.token, 'TestChannel', true).channelId;
    const empty = channelLeaveV1(owner.token, validChannelId);
    expect(empty).toStrictEqual({});
  });
});
