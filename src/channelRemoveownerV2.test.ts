/*
    This is test file for channelRemoveowner

    This function removes a user as an owner in a channel
    Error:
        - token is invalid
        - channelId does not refer to a valid channel
        - uId does not refer to a valid user
        - uId refers to a user who is not an owner of the channel
        - uId refers to a user who is the only owner of the channel
        - channelId is valid and the authorised user does not have owner permissions in the channel

    Success:
        - Remove user with user id uId as an owner of the channel
*/

import { channelAddownerV1, channelRemoveownerV1 } from './channelRequests';
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
describe('Testing channelRemoveownerV1 error cases', () => {
  test('Test 1: token is invalid', () => {
    expect(channelRemoveownerV1('', 1, 1)).toEqual({ errorCode: 403 });
  });

  test('Test 2: channelId is invalid', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    expect(
      channelRemoveownerV1(Lachlan.token, 1, Lachlan.authUserId)
    ).toEqual(
      { errorCode: 400 }
    );
  });

  test('Test 3: uId is invalid', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const newChannel = channelsCreateV1(Lachlan.token, 'name', true);
    expect(
      channelRemoveownerV1(Lachlan.token, newChannel.channelId, Lachlan.authUserId + 1)
    ).toEqual(
      { errorCode: 400 }
    );
  });

  test('Test 4: uId is not an owner of the channel', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const newChannel = channelsCreateV1(Lachlan.token, 'name', true);
    const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
    expect(
      channelRemoveownerV1(Lachlan.token, newChannel.channelId, Banjo.authUserId)
    ).toEqual(
      { errorCode: 400 }
    );
  });

  test('Test 5: uId is the only owner of the channel', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const newChannel = channelsCreateV1(Lachlan.token, 'name', true);
    expect(
      channelRemoveownerV1(Lachlan.token, newChannel.channelId, Lachlan.authUserId)
    ).toEqual(
      { errorCode: 400 }
    );
  });

  test('Test 6: authorised user does not have owner permissions in the channel', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const newChannel = channelsCreateV1(Lachlan.token, 'name', true);
    const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
    const Bob = authRegisterV1('bsmith@gmail.com', 'bruhmoment', 'Bob', 'Smith');
    channelJoinV1(Banjo.token, newChannel.channelId);
    channelJoinV1(Bob.token, newChannel.channelId);
    channelAddownerV1(Lachlan.token, newChannel.channelId, Bob.authUserId);
    expect(
      channelRemoveownerV1(Banjo.token, newChannel.channelId, Lachlan.authUserId)
    ).toEqual(
      { errorCode: 403 }
    );
  });
});

// Testing success cases
describe('Testing channel/removeowner/v1 success case', () => {
  test('Test 1: Owner added successfully', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
    const Phil = authRegisterV1('pmoore@gmail.com', 'bobsyauncle', 'Phil', 'Moore');
    const newChannel = channelsCreateV1(Banjo.token, 'name', true);
    channelJoinV1(Lachlan.token, newChannel.channelId);
    channelJoinV1(Phil.token, newChannel.channelId);
    channelAddownerV1(Banjo.token, newChannel.channelId, Phil.authUserId);
    channelRemoveownerV1(Lachlan.token, newChannel.channelId, Phil.authUserId);
    channelAddownerV1(Banjo.token, newChannel.channelId, Lachlan.authUserId);
    channelRemoveownerV1(Banjo.token, newChannel.channelId, Banjo.authUserId);
    expect(
      channelDetailsV1(Banjo.token, newChannel.channelId).ownerMembers
    ).toEqual(
      [
        {
          uId: Lachlan.authUserId,
          email: 'lachlangilroy@gmail.com',
          nameFirst: 'Lachlan',
          nameLast: 'Gilroy',
          handleStr: 'lachlangilroy',
          profileImgUrl: expect.any(String)
        }
      ]
    );
  });

  test('Test 2: returns empty object', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
    const newChannel = channelsCreateV1(Banjo.token, 'name', true);
    channelJoinV1(Lachlan.token, newChannel.channelId);
    channelAddownerV1(Banjo.token, newChannel.channelId, Lachlan.authUserId);
    expect(
      channelRemoveownerV1(Banjo.token, newChannel.channelId, Banjo.authUserId)
    ).toEqual({});
  });
});
