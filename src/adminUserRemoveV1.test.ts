/*
    This is test file for adminUserRemoveV1.test.ts

    This function removes a user from beans
    Error:
        - token is invalid
        - uId does not refer to a valid user
        - uId refers to a user who is the only global owner
        - the authorised user is not a global owner

    Success:
        - Removes a user from Beans
        - Removes them from all channels and DMs
        - not included in array of users returned by users/all
        - anyone can be removed
        - message contents of removed user replaced by 'Removed user'
        - their profile must still be retrievable by user/profile, but
        nameFirst must be 'Removed' and nameLast must be 'user'
        - the user's email and handle should be reusable
        - called with adminUserRemoveV1(token, uId);
*/

import { clearV1 } from './otherRequests';
import { authRegisterV1 } from './authRequests';
import { adminUserRemoveV1, adminUserpermissionChangeV1 } from './adminRequests';
import { channelAddownerV1, channelJoinV1, channelDetailsV1, channelMessagesV1 } from './channelRequests';
import { channelsCreateV1 } from './channelsRequests';
import { dmCreateV1, dmDetailsV1, dmMessagesV1 } from './dmRequests';
import { usersAllV1, userProfileV1, userProfileSetemailV1, userProfileSethandleV1 } from './usersRequests';
import { messageSendV1, messageSendDmV1 } from './messageRequests';

// Reseting dataStore before each test
beforeEach(() => {
  clearV1();
});

// Reseting dataStore after each test
afterAll(() => {
  clearV1();
});

describe('Error cases', () => {
  test('Test 1: token is invalid', () => {
    expect(adminUserRemoveV1('', 1)).toEqual({ errorCode: 403 });
  });

  test('Test 2: uId is invalid', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    expect(
      adminUserRemoveV1(Lachlan.token, Lachlan.authUserId + 1)
    ).toEqual({ errorCode: 400 });
  });

  test('Test 3: uId is only global owner', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    expect(
      adminUserRemoveV1(Lachlan.token, Lachlan.authUserId)
    ).toEqual({ errorCode: 400 });
  });

  test('Test 4: auth user is not a global owner', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
    const Jack = authRegisterV1('jattack@gmail.com', 'nunyabusiness', 'Jack', 'Attack');
    adminUserpermissionChangeV1(Lachlan.token, Banjo.authUserId, 1);
    expect(
      adminUserRemoveV1(Jack.token, Lachlan.authUserId)
    ).toEqual({ errorCode: 403 });
  });

  describe('Success cases', () => {
    test('Test 1: return empty object', () => {
      const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
      const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
      adminUserpermissionChangeV1(Lachlan.token, Banjo.authUserId, 1);
      expect(
        adminUserRemoveV1(Banjo.token, Lachlan.authUserId)
      ).toEqual({});
    });

    test('Test 2: removes user from channel', () => {
      const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
      const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
      const newChannel = channelsCreateV1(Lachlan.token, 'name', true);
      channelJoinV1(Banjo.token, newChannel.channelId);
      channelAddownerV1(Lachlan.token, newChannel.channelId, Banjo.authUserId);
      adminUserpermissionChangeV1(Lachlan.token, Banjo.authUserId, 1);
      adminUserRemoveV1(Banjo.token, Lachlan.authUserId);
      expect(
        channelDetailsV1(Banjo.token, newChannel.channelId)
      ).toEqual(
        {
          name: 'name',
          isPublic: true,
          ownerMembers: [
            {
              uId: Banjo.authUserId,
              nameFirst: 'Banjo',
              nameLast: 'Patterson',
              email: 'bpatterson@gmail.com',
              handleStr: 'banjopatterson',
              profileImgUrl: expect.any(String)
            }
          ],
          allMembers: [
            {
              uId: Banjo.authUserId,
              nameFirst: 'Banjo',
              nameLast: 'Patterson',
              email: 'bpatterson@gmail.com',
              handleStr: 'banjopatterson',
              profileImgUrl: expect.any(String)
            }
          ],
        }
      );
    });

    test('Test 3: removes user from DM', () => {
      const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
      const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
      const newDM = dmCreateV1(Lachlan.token, [Banjo.authUserId]);
      adminUserpermissionChangeV1(Lachlan.token, Banjo.authUserId, 1);
      adminUserRemoveV1(Banjo.token, Lachlan.authUserId);
      expect(
        dmDetailsV1(Banjo.token, newDM.dmId)
      ).toEqual(
        {
          name: 'banjopatterson, lachlangilroy',
          members: [
            {
              uId: Banjo.authUserId,
              nameFirst: 'Banjo',
              nameLast: 'Patterson',
              email: 'bpatterson@gmail.com',
              handleStr: 'banjopatterson',
              profileImgUrl: expect.any(String)
            }
          ],
        }
      );
    });

    test('Test 4: not in users/all', () => {
      const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
      const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
      adminUserpermissionChangeV1(Lachlan.token, Banjo.authUserId, 1);
      adminUserRemoveV1(Banjo.token, Lachlan.authUserId);
      expect(
        usersAllV1(Banjo.token)
      ).toEqual(
        {
          users: [
            {
              uId: Banjo.authUserId,
              nameFirst: 'Banjo',
              nameLast: 'Patterson',
              email: 'bpatterson@gmail.com',
              handleStr: 'banjopatterson',
              profileImgUrl: expect.any(String)
            }
          ],
        }
      );
    });

    test('Test 5: profile reteivable with user/profile with changes', () => {
      const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
      const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
      adminUserpermissionChangeV1(Lachlan.token, Banjo.authUserId, 1);
      adminUserRemoveV1(Banjo.token, Lachlan.authUserId);
      expect(
        userProfileV1(Banjo.token, Lachlan.authUserId).user
      ).toEqual(
        {
          uId: Lachlan.authUserId,
          nameFirst: 'Removed',
          nameLast: 'user',
          email: 'lachlangilroy@gmail.com',
          handleStr: 'lachlangilroy',
          profileImgUrl: expect.any(String)
        }
      );
    });

    test('Test 6: reusable email and handle', () => {
      const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
      const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
      adminUserpermissionChangeV1(Lachlan.token, Banjo.authUserId, 1);
      userProfileSetemailV1(Lachlan.token, 'used@gmail.com');
      userProfileSethandleV1(Lachlan.token, 'usedhandle');
      adminUserRemoveV1(Banjo.token, Lachlan.authUserId);
      userProfileSetemailV1(Banjo.token, 'used@gmail.com');
      userProfileSethandleV1(Banjo.token, 'usedhandle');
      expect(
        userProfileV1(Banjo.token, Banjo.authUserId).user
      ).toEqual(
        {
          uId: Banjo.authUserId,
          nameFirst: 'Banjo',
          nameLast: 'Patterson',
          email: 'used@gmail.com',
          handleStr: 'usedhandle',
          profileImgUrl: expect.any(String)
        }
      );
    });

    test('Test 7: contents of messages sent changed', () => {
      const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
      const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
      const newChannel = channelsCreateV1(Lachlan.token, 'name', true);
      channelJoinV1(Banjo.token, newChannel.channelId);
      const newDM = dmCreateV1(Lachlan.token, [Banjo.authUserId]);
      adminUserpermissionChangeV1(Lachlan.token, Banjo.authUserId, 1);
      messageSendV1(Lachlan.token, newChannel.channelId, 'message content');
      messageSendDmV1(Lachlan.token, newDM.dmId, 'message content');
      adminUserRemoveV1(Banjo.token, Lachlan.authUserId);
      expect(
        channelMessagesV1(Banjo.token, newChannel.channelId, 0).messages
      ).toEqual(
        [
          {
            messageId: expect.any(Number),
            uId: Lachlan.authUserId,
            message: 'Removed user',
            timeSent: expect.any(Number),
            reacts: [],
            isPinned: false,
          }
        ]
      );
      expect(
        dmMessagesV1(Banjo.token, newDM.dmId, 0).messages
      ).toEqual(
        [
          {
            messageId: expect.any(Number),
            uId: Lachlan.authUserId,
            message: 'Removed user',
            timeSent: expect.any(Number),
            reacts: [],
            isPinned: false,
          }
        ]
      );
    });
  });
});
