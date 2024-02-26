/*
This is a test file for authRegisterV1 that will test that:
    - The 5 error cases return an object and error message
    - An account is created with the correct users first and last name, email and password
    - The correct handle is generated for the user
    - A unique authUserId is created
Sample function call authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella')
*/

import { authRegisterV1 } from './authRequests';
import { clearV1 } from './otherRequests';
import { userProfileV1 } from './usersRequests';

// Reseting dataStore for each test
beforeEach(() => {
  clearV1();
});

// Testing error cases
describe('Testing authRegisterV1 error cases', () => {
  test('Test 1: email is not valid', () => {
    expect(
      authRegisterV1('notValidEmail', 'randoPassword', 'Lachlan', 'Gilroy')
    ).toStrictEqual({ errorCode: 400 });
  });

  test('Test 2: email already used', () => {
    authRegisterV1('sameEmail@gmail.com', 'firstPassword', 'firstUserName', 'lastName');
    expect(
      authRegisterV1('sameEmail@gmail.com', 'chimychanga', 'John', 'Smith')
    ).toEqual({ errorCode: 400 });
  });

  test('Test 3: password too short', () => {
    expect(
      authRegisterV1('validemail@gmail.com', 'SmlPW', 'Osama', 'Bin Laden')
    ).toEqual({ errorCode: 400 });
  });

  test('Test 4: first name too long', () => {
    expect(
      authRegisterV1('longfirstname@gmail.com', 'duznMatter',
        '12345678901234567890123456789012345678901234567890+',
        'regLastName')
    ).toEqual({ errorCode: 400 });
  });

  test('Test 5: first name too short', () => {
    expect(
      authRegisterV1('shortfirstname@gmail.com', 'randoPassword', '', 'regLastNamey')
    ).toEqual({ errorCode: 400 });
  });

  test('Test 6: last name too long', () => {
    expect(
      authRegisterV1('longlastname@gmail.com', 'randoPassword', 'regFirstName',
        '12345678901234567890123456789012345678901234567890+')
    ).toEqual({ errorCode: 400 });
  });

  test('Test 7: last name too short', () => {
    expect(
      authRegisterV1('shortlastname@gmail.com', 'randoPassword', 'regFirstName', '')
    ).toEqual({ errorCode: 400 });
  });
});

// Testing if authRegisterV1 adds a user correctly
// Cannot test that password is added correctly without accessing datastore so no test exists for this
describe('Testing authRegisterV1 adds a user correctly', () => {
  test('Test 1: checking nameFirst is added', () => {
    const lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    expect(
      userProfileV1(lachlan.token, lachlan.authUserId).user.nameFirst
    ).toEqual('Lachlan');
  });

  test('Test 2: checking nameLast is added', () => {
    const lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    expect(
      userProfileV1(lachlan.token, lachlan.authUserId).user.nameLast
    ).toEqual('Gilroy');
  });

  test('Test 3: checking email is added', () => {
    const lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    expect(
      userProfileV1(lachlan.token, lachlan.authUserId).user.email
    ).toEqual('lachlangilroy@gmail.com');
  });

  test('Test 4: checking if an additional user can be added', () => {
    const lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
    expect(
      userProfileV1(lachlan.token, banjo.authUserId).user
    ).toEqual({
      uId: banjo.authUserId,
      nameFirst: 'Banjo',
      nameLast: 'Patterson',
      email: 'bpatterson@gmail.com',
      handleStr: 'banjopatterson',
      profileImgUrl: expect.any(String)
    });
  });
});

// Testing if authRegisterV1 returns a new (unique) authUserId
describe('Testing authRegisterV1 returns a new (unique) authUserId', () => {
  test('Test 1: checking if new user has authUserId', () => {
    const newAuthUserId = authRegisterV1('nothing@gmail.com', 'randoPassword', 'Tim', 'Timson').authUserId;
    expect(newAuthUserId).toEqual(expect.any(Number));
  });

  test('Test 2: checking if new authUserId is unique', () => {
    const lachlansId = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy').authUserId;
    const banjosId = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson').authUserId;

    expect(lachlansId === banjosId).toEqual(false);
  });
});

// Testing handle creation
describe('Testing handle creation', () => {
  test('Test 1: normal name', () => {
    const newUser = authRegisterV1('hsmith@gmail.com', 'randoPassword', 'Hayden', 'Smith');
    expect(
      userProfileV1(newUser.token, newUser.authUserId).user.handleStr
    ).toEqual('haydensmith');
  });

  test('Test 2: handle must be shortened to 20 characters', () => {
    const newUser = authRegisterV1('polpot@gmail.com', 'randoPassword', 'Michael', 'WazoWskiEyeball');
    expect(
      userProfileV1(newUser.token, newUser.authUserId).user.handleStr
    ).toEqual('michaelwazowskieyeba');
  });

  test('Test 3: remove non alphanumeric characters', () => {
    const newUser = authRegisterV1('puppys@gmail.com', 'randoPassword', '1 h8 wr?t?ng TESTS', 'br0!!!');
    expect(
      userProfileV1(newUser.token, newUser.authUserId).user.handleStr
    ).toEqual('1h8wrtngtestsbr0');
  });

  test('Test 4: name already taken once', () => {
    authRegisterV1('hsmith@gmail.com', 'randoPassword', 'Hayden', 'Smith');
    const newUser = authRegisterV1('brother@gmail.com', 'randoPassword', 'Hayden', 'Smith');
    expect(
      userProfileV1(newUser.token, newUser.authUserId).user.handleStr
    ).toEqual('haydensmith0');
  });

  test('Test 5: name already taken twice', () => {
    authRegisterV1('hsmith@gmail.com', 'randoPassword', 'Hayden', 'Smith');
    authRegisterV1('brother@gmail.com', 'randoPassword', 'Hayden', 'Smith');
    const newUser = authRegisterV1('sister@gmail.com', 'randoPassword', 'Hayden', 'Smith');
    expect(
      userProfileV1(newUser.token, newUser.authUserId).user.handleStr
    ).toEqual('haydensmith1');
  });

  test('Test 6: exceed 20 char allowed if new duplicate number is added', () => {
    authRegisterV1('polpot@gmail.com', 'randoPassword', 'Michael', 'WazoWskiEyeball');
    const newUser = authRegisterV1('kimjong@gmail.com', 'randoPassword', 'Michael', 'WazoWskiEyeball');
    expect(
      userProfileV1(newUser.token, newUser.authUserId).user.handleStr
    ).toEqual('michaelwazowskieyeba0');
  });
});

// Testing if authRegisterV2 returns a token
describe('Testing authRegisterV1 returns token and correct object', () => {
  test('Test 1: checking if new user has authUserId', () => {
    const token = authRegisterV1('nothing@gmail.com', 'randoPassword', 'Tim', 'Timson').token;
    expect(token).toEqual(expect.any(String));
  });
  test('Test 2: checking return object', () => {
    const register = authRegisterV1('nothing@gmail.com', 'randoPassword', 'Tim', 'Timson');
    expect(register).toEqual({ token: expect.any(String), authUserId: expect.any(Number) });
  });
});
