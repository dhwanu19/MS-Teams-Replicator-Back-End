/*
    This is test file for authPasswordResetReset

    This function uses a user reset code to perform a password change

    Cases described by (Cannot Test) will need to be tested using the front end

    Error:
        - resetCode is not a valid reset code (Cannot Test)
        - newPassword is less than 6 characters long

    Success:
        - no token required
        - Given a reset code for a user, sets that user's new password to the password provided. (Cannot Test)
        - Once a reset code has been used, it is then invalidated. (Cannot Test)
*/

// Uncomment below if solution is found to the email sending timing problem

import { clearV1 } from './otherRequests';
import { authLoginV2, authPasswordResetResetV1, authRegisterV1 } from './authRequests';

// Reseting dataStore for each test
beforeEach(() => {
  clearV1();
});

// Reseting dataStore after each test
afterAll(() => {
  clearV1();
});

// Testing error cases
describe('Testing authPasswordResetResetV1 error cases', () => {
  test('Test 1: newPassword is less then 6 characters', () => {
    authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    authLoginV2('lachlangilroy@gmail.com', 'randoPassword');
    expect(authPasswordResetResetV1('123456', 'short')).toEqual({ errorCode: 400 });
  });
});
