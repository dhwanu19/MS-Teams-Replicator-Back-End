/*
  This is a test suite for clearV1 that resets internal data in our data store to

  data = {
    users: [

    ],
    channels: [

    ],
    dms: [

    ],
  };
*/

import { clearV1 } from './otherRequests';
import { authRegisterV1 } from './authRequests';
import { channelsCreateV1, channelsListAllV1 } from './channelsRequests';
import { usersAllV1, userProfileV1 } from './usersRequests';

// Reseting dataStore for each test
beforeEach(() => {
  clearV1();
});

describe('Testing clearV1 error cases', () => {
  test('Test 1: correct return value', () => {
    expect(
      clearV1()
    ).toEqual({});
  });

  test('Test 2: deletes users', () => {
    authRegisterV1('nothing@gmail.com', 'randoPassword', 'Tim', 'Timson');
    authRegisterV1('sample@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    authRegisterV1('bruh@gmail.com', 'whateverPassword', 'Dam', 'Daniel');
    clearV1();
    const extra2 = authRegisterV1('buddy@gmail.com', 'whateverPassword', 'Sam', 'Samson');
    expect(usersAllV1(extra2.token).users).toEqual([userProfileV1(extra2.token, extra2.authUserId).user]);
  });

  test('Test 3: deletes channels', () => {
    const Lachlan = authRegisterV1('bruh@gmail.com', 'whateverPassword', 'Dam', 'Daniel');
    channelsCreateV1(Lachlan.token, 'COMP1531', true);
    channelsCreateV1(Lachlan.token, 'COMP2521', true);
    channelsCreateV1(Lachlan.token, 'COMP1521', true);
    clearV1();
    const Tim = authRegisterV1('nothing@gmail.com', 'randoPassword', 'Tim', 'Timson');
    expect(channelsListAllV1(Tim.token).channels).toEqual([]);
  });

  // Can't check for dms deleted as dmList only shows dms that user is a member of but all users get deleted by clear
});
