
/*
    This is test file for authPasswordResetRequest

    This function requests a users password to be reset

    Success:
        - no token required
        - Given an email address, if the email address belongs to a registered user,
        - sends them an email containing a secret password reset code. (Tested on front-end)
        - No error on invalid email
        - generated reset code sent to users email (Tested on front-end)
        - user requesting password reset should be logged out of all current sessions.
        - returns an empty object
*/

// Uncomment below if solution is found to the email sending timing problem

import { clearV1 } from './otherRequests';
import { authLoginV2, authPasswordResetRequestV1, authRegisterV1 } from './authRequests';
import { channelsCreateV1 } from './channelsRequests';

// Reseting dataStore for each test
beforeEach(() => {
  clearV1();
});

// Reseting dataStore after each test
afterAll(() => {
  clearV1();
});

// Testing success cases
describe('Testing authPasswordResetRequestV1 success case', () => {
  test('User is logged out so there token is invalid', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    authLoginV2('lachlangilroy@gmail.com', 'randoPassword');
    expect(authPasswordResetRequestV1('lachlangilroy@gmail.com')).toEqual({});
    expect(channelsCreateV1(Lachlan.token, 'name', true)).toEqual({ errorCode: 403 });
  });
});
