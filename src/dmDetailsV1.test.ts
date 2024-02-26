import { authRegisterV1 } from './authRequests';
import { dmCreateV1, dmDetailsV1 } from './dmRequests';
import { clearV1 } from './otherRequests';
import { userProfileV1 } from './usersRequests';

beforeEach(() => {
  clearV1();
});

describe('dmDetailsV1 Success Cases', () => {
  test('Multiple Members', () => {
    const owner = authRegisterV1('owner@gmail.com', 'OwnerPass', 'Owner', 'Smith');
    const member1 = authRegisterV1('member1@gmail.com', 'MemberPass1', 'Member1', 'Smith');
    const member2 = authRegisterV1('member2@gmail.com', 'MemberPass2', 'Member2', 'Smith');
    const uIds = [member1.authUserId, member2.authUserId];
    const dmId = dmCreateV1(owner.token, uIds).dmId;
    expect(dmDetailsV1(owner.token, dmId)).toStrictEqual({
      name: 'member1smith, member2smith, ownersmith',
      members: [
        userProfileV1(owner.token, owner.authUserId).user,
        userProfileV1(member1.token, member1.authUserId).user,
        userProfileV1(member2.token, member2.authUserId).user
      ],
    });
  });
});

describe('dmDetailsV1 Error Cases', () => {
  test('token is invalid', () => {
    const owner = authRegisterV1('owner@gmail.com', 'OwnerPass', 'Owner', 'Smith');
    const member = authRegisterV1('member@gmail.com', 'MemberPass', 'Member', 'Smith');
    const dmId = dmCreateV1(owner.token, [member.authUserId]).dmId;
    const invalidToken = owner.token + 'toInvalid';
    expect(dmDetailsV1(invalidToken, dmId)).toStrictEqual({ errorCode: 403 });
  });

  test('dmId does not refer to a valid DM', () => {
    const owner = authRegisterV1('owner@gmail.com', 'OwnerPass', 'Owner', 'Smith');
    const member = authRegisterV1('member@gmail.com', 'MemberPass', 'Member', 'Smith');
    const dmId = dmCreateV1(owner.token, [member.authUserId]).dmId;
    const invalidDmId = dmId + 1;
    expect(dmDetailsV1(owner.token, invalidDmId)).toStrictEqual({ errorCode: 400 });
  });

  test('dmId is valid and the authorised user is not a member of the DM', () => {
    const owner = authRegisterV1('owner@gmail.com', 'OwnerPass', 'Owner', 'Smith');
    const member = authRegisterV1('member@gmail.com', 'MemberPass', 'Member', 'Smith');
    const dmId = dmCreateV1(owner.token, [member.authUserId]).dmId;
    const nonMember = authRegisterV1('nonMember@gmail.com', 'notPass', 'Not', 'Smith');
    expect(dmDetailsV1(nonMember.token, dmId)).toStrictEqual({ errorCode: 403 });
  });
});
