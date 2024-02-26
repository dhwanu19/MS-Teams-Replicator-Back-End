/*
    This is test file for adminUserpermissionChangeV1.test.ts

    This function changes the permission of a user
    Error:
        - token is invalid
        - uId does not refer to a valid user
        - uId refers to a user who is the only global owner and they are being demoted to a user
        - permissionId is invalid
        - the user already has the permissions level of permissionId
        - the authorised user is not a global owner

    Success:
        - Sets the user permissions to permission Id
*/

import { clearV1 } from './otherRequests';
import { authRegisterV1 } from './authRequests';
import { adminUserpermissionChangeV1 } from './adminRequests';

// Reseting dataStore for each test
beforeEach(() => {
  clearV1();
});

describe('Error cases', () => {
  test('Test 1: token is invalid', () => {
    expect(adminUserpermissionChangeV1('', 1, 1)).toEqual({ errorCode: 403 });
  });

  test('Test 2: uId is invalid', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    expect(
      adminUserpermissionChangeV1(Lachlan.token, Lachlan.authUserId + 1, 1)
    ).toEqual({ errorCode: 400 });
  });

  test('Test 3: uId is only global owner and is being demoted', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    expect(
      adminUserpermissionChangeV1(Lachlan.token, Lachlan.authUserId, 2)
    ).toEqual({ errorCode: 400 });
  });

  test('Test 4: permissionId is invalid', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
    expect(
      adminUserpermissionChangeV1(Lachlan.token, Banjo.authUserId, 0)
    ).toEqual({ errorCode: 400 });
  });

  test('Test 5: the user already has permissions level of permissionId', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
    expect(
      adminUserpermissionChangeV1(Lachlan.token, Banjo.authUserId, 2)
    ).toEqual({ errorCode: 400 });
  });

  test('Test 6: auth user is not a global owner', () => {
    authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
    expect(
      adminUserpermissionChangeV1(Banjo.token, Banjo.authUserId, 1)
    ).toEqual({ errorCode: 403 });
  });
});

describe('Success cases', () => {
  test('Test 1: return empty object', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
    expect(
      adminUserpermissionChangeV1(Lachlan.token, Banjo.authUserId, 1)
    ).toEqual({});
  });

  test('Demoting the original global owner', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
    adminUserpermissionChangeV1(Lachlan.token, Banjo.authUserId, 1);
    adminUserpermissionChangeV1(Banjo.token, Lachlan.authUserId, 2);
    expect(
      adminUserpermissionChangeV1(Lachlan.token, Banjo.authUserId, 2)
    ).toEqual({ errorCode: 400 });
  });
});
