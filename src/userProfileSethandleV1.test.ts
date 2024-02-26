/*
  This function updates a users handle
  Errors:
    - token is invalid
    - handle size is not between 3 and 20 characters inclusive
    - handle contains non alphanumeric characters
    - handle is already taken
  Success:
    - Update the users handleStr
*/

import { clearV1 } from './otherRequests';
import { userProfileV1, userProfileSethandleV1 } from './usersRequests';
import { authRegisterV1 } from './authRequests';

// Reseting dataStore for each test
beforeEach(() => {
  clearV1();
});

// Testing error cases
describe('Testing userProfileSethandleV1 error cases', () => {
  test('Test 1: token is invalid', () => {
    expect(userProfileSethandleV1('', 'Flanno')).toEqual(
      {
        errorCode: 403
      }
    );
  });

  test('Test 2: handle is less than 3 characters', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    expect(userProfileSethandleV1(Lachlan.token, '12')).toEqual(
      {
        errorCode: 400
      }
    );
  });

  test('Test 3: handle is more than 20 characters', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    expect(userProfileSethandleV1(Lachlan.token, '123456789012345678901')).toEqual(
      {
        errorCode: 400
      }
    );
  });

  test('Test 4: handle contains non-alphanumeric characters', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    expect(userProfileSethandleV1(Lachlan.token, 'F!lanno&')).toEqual(
      {
        errorCode: 400
      }
    );
  });

  test('Test 5: handle is already taken', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    expect(userProfileSethandleV1(Lachlan.token, 'lachlangilroy')).toEqual(
      {
        errorCode: 400
      }
    );
  });
});

// Testing success case
describe('Testing userProfileSethandleV1 success case', () => {
  test('Test 1: Updating users handle successfully', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    userProfileSethandleV1(Lachlan.token, 'Flanno');
    expect(
      userProfileV1(Lachlan.token, Lachlan.authUserId).user.handleStr
    ).toEqual('Flanno');
  });

  test('Test 2: returns empty object', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    expect(
      userProfileSethandleV1(Lachlan.token, 'Flanno')
    ).toEqual({});
  });
});
