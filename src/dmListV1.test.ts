import { authRegisterV1 } from './authRequests';
import { dmCreateV1, dmListV1 } from './dmRequests';
import { clearV1 } from './otherRequests';

beforeEach(() => {
  clearV1();
});

describe('dmListV1 Success Cases', () => {
  test('no dms', () => {
    const owner = authRegisterV1('owner@gmail.com', 'ownerPass', 'Owner', 'Smith').token;
    expect(dmListV1(owner)).toStrictEqual({ dms: [] });
  });

  test('one dm', () => {
    const owner = authRegisterV1('owner@gmail.com', 'ownerPass', 'Owner', 'Smith').token;
    const user1 = authRegisterV1('user1@gmail.com', 'user1Pass', 'user1', 'Smith');
    const dm = dmCreateV1(owner, [user1.authUserId]);
    expect(dmListV1(owner)).toStrictEqual({ dms: [{ dmId: dm.dmId, name: 'ownersmith, user1smith' }] });
  });

  test('muliple (two) dms', () => {
    const owner = authRegisterV1('owner@gmail.com', 'ownerPass', 'Owner', 'Smith').token;
    const user1 = authRegisterV1('user1@gmail.com', 'user1Pass', 'user1', 'Smith');
    const dm1 = dmCreateV1(owner, [user1.authUserId]);
    const user2 = authRegisterV1('user2@gmail.com', 'user2Pass', 'user2', 'Smith');
    const dm2 = dmCreateV1(owner, [user2.authUserId]);
    expect(new Set(dmListV1(owner).dms)).toStrictEqual(new Set([
      { dmId: dm1.dmId, name: 'ownersmith, user1smith' },
      { dmId: dm2.dmId, name: 'ownersmith, user2smith' }
    ]));
  });
});

describe('dmListV1 Error Cases', () => {
  test('invalid token', () => {
    const user = authRegisterV1('error@gmail.com', 'errorPassword', 'Error', 'Smith');
    const invalidToken = user.token + 'toInvalid';
    expect(dmListV1(invalidToken)).toStrictEqual({ errorCode: 403 });
  });
});
