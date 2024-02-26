import { dmCreateV1, dmLeaveV1, dmDetailsV1 } from './dmRequests';
import { clearV1 } from './otherRequests';
import { authRegisterV1 } from './authRequests';
import { userProfileV1 } from './usersRequests';

beforeEach(() => {
  clearV1();
});

describe('dmLeaveV1 Success Cases', () => {
  test('Owner leaves dm', () => {
    const owner = authRegisterV1('owner@gmail.com', 'ownerPass', 'Owner', 'Smith');
    const user = authRegisterV1('alt@gmail.com', 'altPassword', 'Alt', 'Smith');
    const dm = dmCreateV1(owner.token, [user.authUserId]);
    dmLeaveV1(owner.token, dm.dmId);
    expect(dmDetailsV1(user.token, dm.dmId).members).toStrictEqual([userProfileV1(user.token, user.authUserId).user]);
  });

  test('Non-owner leaves dm', () => {
    const owner = authRegisterV1('owner@gmail.com', 'ownerPass', 'Owner', 'Smith');
    const user = authRegisterV1('alt@gmail.com', 'altPassword', 'Alt', 'Smith');
    const dm = dmCreateV1(owner.token, [user.authUserId]);
    dmLeaveV1(user.token, dm.dmId);
    expect(dmDetailsV1(owner.token, dm.dmId).members).toStrictEqual([userProfileV1(owner.token, owner.authUserId).user]);
  });

  test('Owner leaves dm && dm still exists', () => {
    const owner = authRegisterV1('owner@gmail.com', 'ownerPass', 'Owner', 'Smith');
    const user = authRegisterV1('alt@gmail.com', 'altPassword', 'Alt', 'Smith');
    const dm = dmCreateV1(owner.token, [user.authUserId]);
    dmLeaveV1(owner.token, dm.dmId);
    expect(dmDetailsV1(user.token, dm.dmId)).toStrictEqual(
      {
        name: 'altsmith, ownersmith',
        members: [userProfileV1(user.token, user.authUserId).user]
      });
  });

  test('dmLeave returns empty object', () => {
    const owner = authRegisterV1('owner@gmail.com', 'ownerPass', 'Owner', 'Smith');
    const user = authRegisterV1('alt@gmail.com', 'altPassword', 'Alt', 'Smith');
    const dm = dmCreateV1(owner.token, [user.authUserId]);
    expect(dmLeaveV1(owner.token, dm.dmId)).toStrictEqual({ });
  });
});

describe('dmLeaveV1 Error Cases', () => {
  test('Token is invalid', () => {
    const owner = authRegisterV1('owner@gmail.com', 'ownerPass', 'Owner', 'Smith');
    const user = authRegisterV1('alt@gmail.com', 'altPassword', 'Alt', 'Smith');
    const invalidToken = owner.token + 'toInvalid';
    const dmId = dmCreateV1(owner.token, [user.token]).dmId;
    expect(dmLeaveV1(invalidToken, dmId)).toStrictEqual({ errorCode: 403 });
  });

  test('dmId does not refer to a valid DM', () => {
    const owner = authRegisterV1('owner@gmail.com', 'ownerPass', 'Owner', 'Smith');
    const user = authRegisterV1('alt@gmail.com', 'altPassword', 'Alt', 'Smith');
    const dmId = dmCreateV1(owner.token, [user.token]).dmId;
    const invalidDmId = dmId + 1;
    expect(dmLeaveV1(owner.token, invalidDmId)).toStrictEqual({ errorCode: 400 });
  });

  test('dmId is valid and the authorised user is not a member of the DM (already left)', () => {
    const owner = authRegisterV1('owner@gmail.com', 'ownerPass', 'Owner', 'Smith');
    const user = authRegisterV1('alt@gmail.com', 'altPassword', 'Alt', 'Smith');
    const dm = dmCreateV1(owner.token, [user.authUserId]);
    dmLeaveV1(user.token, dm.dmId);
    expect(dmLeaveV1(user.token, dm.dmId)).toStrictEqual({ errorCode: 403 });
  });

  test('dmId is valid and the authorised user is not a member of the DM (never joined)', () => {
    const owner = authRegisterV1('owner@gmail.com', 'ownerPass', 'Owner', 'Smith');
    const user = authRegisterV1('alt@gmail.com', 'altPassword', 'Alt', 'Smith');
    const user2 = authRegisterV1('alt2@gmail.com', 'alt2Pass', 'Alt', 'Smith');
    const dm = dmCreateV1(owner.token, [user.authUserId]);
    expect(dmLeaveV1(user2.token, dm.dmId)).toStrictEqual({ errorCode: 403 });
  });
});
