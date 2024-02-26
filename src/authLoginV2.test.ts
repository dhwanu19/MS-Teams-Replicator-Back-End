/*
Test file for authLoginV2 function from './auth.js'
Testing:
 - Successful login
 - error: email does not belong to a user
 - error: password is not correct
*/

import { authLoginV2, authRegisterV1 } from './authRequests';
import { clearV1 } from './otherRequests';

beforeEach(() => {
  clearV1();
});

// Success Case
describe('Describe authLoginV2 success cases', () => {
  // Test successful login
  test('Token is generated', () => {
    authRegisterV1('berry3@gmail.com', 'berryIsTheBest', 'Berry', 'Meinground');
    const login = authLoginV2('berry3@gmail.com', 'berryIsTheBest').token;
    expect(login).toStrictEqual(expect.any(String));
  });
  test('AuthUserId same as authRegister', () => {
    const register = authRegisterV1('berry3@gmail.com', 'berryIsTheBest', 'Berry', 'Meinground').authUserId;
    const login = authLoginV2('berry3@gmail.com', 'berryIsTheBest').authUserId;
    expect(login).toStrictEqual(register);
  });
  test('Returned objects are same', () => {
    const id = authRegisterV1('berry3@gmail.com', 'berryIsTheBest', 'Berry', 'Meinground').authUserId;
    const login = authLoginV2('berry3@gmail.com', 'berryIsTheBest');
    expect(login).toStrictEqual({ token: expect.any(String), authUserId: id });
  });
});

// Error Cases
describe('Testing authLoginV2 error cases', () => {
  // Test login with a different email
  test('Error Test 1: Email does not belong to a user', () => {
    authRegisterV1('berry3@gmail.com', 'berryIsTheBest', 'Berry', 'Meinground');
    const login = authLoginV2('wrong@gmail.com', 'berryIsTheBest');
    expect(login).toEqual({ errorCode: 400 });
  });

  // Test login with correct email but wrong password
  test('Error Test 2: Password is incorrect', () => {
    authRegisterV1('berry3@gmail.com', 'berryIsTheBest', 'Berry', 'Meinground');
    const login = authLoginV2('berry3@gmail.com', 'notThePassword');
    expect(login).toEqual({ errorCode: 400 });
  });
});
