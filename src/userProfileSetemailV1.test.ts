/*
  This function updates a users email
  Errors:
    - token is invalid
    - email entered is not a valid email
    - email belongs to an already existing user

  Success:
    - Update the users email
*/

import { clearV1 } from './otherRequests';
import { userProfileV1, userProfileSetemailV1 } from './usersRequests';
import { authRegisterV1 } from './authRequests';

// Reseting dataStore for each test
beforeEach(() => {
  clearV1();
});

// Testing error cases
describe('Testing userProfileSetnameV1 error cases', () => {
  test('Test 1: token is invalid', () => {
    expect(userProfileSetemailV1('~', 'valid@email.com')).toEqual(
      {
        errorCode: 403
      }
    );
  });

  test('Test 2: email is already taken', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    expect(userProfileSetemailV1(Lachlan.token, 'lachlangilroy@gmail.com')).toEqual(
      {
        errorCode: 400
      }
    );
  });

  test('Test 3: email is not valid', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    expect(userProfileSetemailV1(Lachlan.token, 'notvalidemail')).toEqual(
      {
        errorCode: 400
      }
    );
  });
});

// Testing success case
describe('Testing userProfileSetemailV1 success case', () => {
  test('Test 1: Updating users email successfully', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    userProfileSetemailV1(Lachlan.token, 'validemail@gmail.com');
    expect(
      userProfileV1(Lachlan.token, Lachlan.authUserId).user.email
    ).toEqual('validemail@gmail.com');
  });

  test('Test 2: returns empty object', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    expect(
      userProfileSetemailV1(Lachlan.token, 'validemail@gmail.com')
    ).toEqual({});
  });
});
