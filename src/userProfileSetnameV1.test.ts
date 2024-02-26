/*
  This function updates a users name
  Errors:
    - token is invalid
    - nameFirst size is not between 1 and 50 characters inclusive
    - nameLast size is not between 1 and 50 characters inclusive

  Success:
    - Update the users name
*/

import { clearV1 } from './otherRequests';
import { userProfileV1, userProfileSetnameV1 } from './usersRequests';
import { authRegisterV1 } from './authRequests';
// Reseting dataStore for each test
beforeEach(() => {
  clearV1();
});

// Testing error cases
describe('Testing userProfileSetnameV1 error cases', () => {
  test('Test 1: token is invalid', () => {
    expect(userProfileSetnameV1('~', 'nameFirst', 'nameLast')).toEqual(
      {
        errorCode: 403
      }
    );
  });

  test('Test 2: nameFirst less than 1 character', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');

    expect(userProfileSetnameV1(Lachlan.token, '', 'nameLast')).toEqual(
      {
        errorCode: 400
      }
    );
  });

  test('Test 3: nameLast less than 1 character', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');

    expect(userProfileSetnameV1(Lachlan.token, 'nameFirst', '')).toEqual(
      {
        errorCode: 400
      }
    );
  });

  test('Test 4: nameFirst greater than 50 characters', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');

    expect(userProfileSetnameV1(Lachlan.token, '123456789012345678901234567890123456789012345678901', 'nameLast')).toEqual(
      {
        errorCode: 400
      }
    );
  });

  test('Test 5: nameLast greater than 50 characters', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');

    expect(userProfileSetnameV1(Lachlan.token, 'nameFirst', '123456789012345678901234567890123456789012345678901')).toEqual(
      {
        errorCode: 400
      }
    );
  });
});

describe('Testing userProfileSetnameV1 success cases', () => {
  test('Test 1: Updating users first name successfully', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    userProfileSetnameV1(Lachlan.token, 'nameFirst', 'nameLast');
    expect(
      userProfileV1(Lachlan.token, Lachlan.authUserId).user.nameFirst
    ).toEqual('nameFirst');
  });

  test('Test 2: Updating users last name successfully', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    userProfileSetnameV1(Lachlan.token, 'nameFirst', 'nameLast');
    expect(
      userProfileV1(Lachlan.token, Lachlan.authUserId).user.nameLast
    ).toEqual('nameLast');
  });

  test('Test 3: returns empty object', () => {
    authRegisterV1('testuser@gmail.com', 'password', 'first', 'last');
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    expect(
      userProfileSetnameV1(Lachlan.token, 'nameFirst', 'nameLast')
    ).toEqual({});
  });
});
