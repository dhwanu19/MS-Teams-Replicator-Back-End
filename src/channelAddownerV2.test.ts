/*
    This is test file for channelAddowner

    This function makes a user an owner in a channel
    Error:
        - token is invalid
        - channelId does not refer to a valid channel
        - uId does not refer to a valid user
        - uId refers to a user who is not a member of the channel
        - uId refers to a user who is already an owner of the channel
        - channelId is valid and the authorised user does not have owner permissions in the channel

    Success:
        - Make user with user id uId an owner of the channel
*/

import { channelAddownerV1 } from './channelRequests';
import { clearV1 } from './otherRequests';
import { authRegisterV1 } from './authRequests';
import { channelsCreateV1 } from './channelsRequests';
import { channelJoinV1, channelDetailsV1 } from './channelRequests';

// Reseting dataStore for each test
beforeEach(() => {
  clearV1();
});

// Reseting dataStore after each test
afterAll(() => {
  clearV1();
});

// Testing error cases
describe('Testing channelAddownerV1 error cases', () => {
  test('Test 1: token is invalid', () => {
    expect(channelAddownerV1('', 1, 1)).toEqual({ errorCode: 403 });
  });

  test('Test 2: channelId is invalid', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    expect(
      channelAddownerV1(Lachlan.token, 1, Lachlan.authUserId)
    ).toEqual({ errorCode: 400 });
  });

  test('Test 3: uId is invalid', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const newChannel = channelsCreateV1(Lachlan.token, 'name', true);
    expect(
      channelAddownerV1(Lachlan.token, newChannel.channelId, Lachlan.authUserId + 1)
    ).toEqual({ errorCode: 400 });
  });

  test('Test 4: uId is not a member of the channel', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const newChannel = channelsCreateV1(Lachlan.token, 'name', true);
    const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
    expect(
      channelAddownerV1(Lachlan.token, newChannel.channelId, Banjo.authUserId)
    ).toEqual({ errorCode: 400 });
  });

  test('Test 5: uId is already an owner of the channel', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const newChannel = channelsCreateV1(Lachlan.token, 'name', true);
    expect(
      channelAddownerV1(Lachlan.token, newChannel.channelId, Lachlan.authUserId)
    ).toEqual({ errorCode: 400 });
  });

  test('Test 6: authorised user does not have owner permissions in the channel', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const newChannel = channelsCreateV1(Lachlan.token, 'name', true);
    const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
    channelJoinV1(Banjo.token, newChannel.channelId);
    expect(
      channelAddownerV1(Banjo.token, newChannel.channelId, Banjo.authUserId)
    ).toEqual({ errorCode: 403 });
  });
});

// Testing success cases
describe('Testing channel/addowner/v1 success case', () => {
  test('Test 1: Owner added successfully', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
    const newChannel = channelsCreateV1(Banjo.token, 'name', true);
    channelJoinV1(Lachlan.token, newChannel.channelId);
    channelAddownerV1(Banjo.token, newChannel.channelId, Lachlan.authUserId);
    expect(
      new Set(channelDetailsV1(Banjo.token, newChannel.channelId).ownerMembers)
    ).toEqual(
      new Set([
        {
          uId: Lachlan.authUserId,
          email: 'lachlangilroy@gmail.com',
          nameFirst: 'Lachlan',
          nameLast: 'Gilroy',
          handleStr: 'lachlangilroy',
          profileImgUrl: expect.any(String)
        },
        {
          uId: Banjo.authUserId,
          email: 'bpatterson@gmail.com',
          nameFirst: 'Banjo',
          nameLast: 'Patterson',
          handleStr: 'banjopatterson',
          profileImgUrl: expect.any(String)
        },
      ])
    );
  });

  test('Test 2: returns empty object', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
    const newChannel = channelsCreateV1(Banjo.token, 'name', true);
    channelJoinV1(Lachlan.token, newChannel.channelId);
    expect(
      channelAddownerV1(Banjo.token, newChannel.channelId, Lachlan.authUserId)
    ).toEqual({});
  });
});
