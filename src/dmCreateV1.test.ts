/*
    This is a test file for dm/create/v1 that will  test the dmCreateV1() function
    uIds: Array of user ids
    dms: Array of objects, where each object contains types { dmId, name }
    dmId: is integer
    name: is string
    Errors:
        - any uId in uIds does not refer to a valid user
        - there are dublicate 'uId's in uIds
        - taken is invalid
    Success:
        - Creates a dm which is an object containing name and dmId
        - Creator is owner of DM
        - uIds does not include the creator
        - name is automatically generated based on users in dm
        - The name should be an alphabetically-sorted, comma-and-space-separated list of user handles, e.g. 'ahandle1, bhandle2, chandle3'
        - An empty uIds list indicates the creator is the only member of the DM

    DM structure:
        dms: [
            {
                dmId: dmId,
                name: 'ahandle1, bhandle2, chandle3',
                creator: authUserId,
                members: [
                    {
                    uId: uId,
                    email: email,
                    nameFirst: nameFirst,
                    nameLast: nameLast,
                    handleStr: handleStr,
                    },
                ],
                messages: [
                    {
                    messageId: messageId,
                    uId: uId,
                    message: message,
                    timeSent: timeSent,
                    }
                ],
            },
        ]
*/

import { dmCreateV1, dmDetailsV1 } from './dmRequests';
import { clearV1 } from './otherRequests';
import { authRegisterV1 } from './authRequests';

// Reseting dataStore for each test
beforeEach(() => {
  clearV1();
});

// Testing error cases
describe('Testing dmCreateV1 error cases', () => {
  test('Test 1: token is invalid', () => {
    expect(dmCreateV1('bruh', [2])).toStrictEqual({ errorCode: 403 });
  });

  test('Test 2: any uId in uIds does not refer to a valid user', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    expect(dmCreateV1(Lachlan.token, [Lachlan.authUserId + 1])).toStrictEqual({ errorCode: 400 });
  });

  test('Test 3: duplicate uId in uIds', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
    expect(dmCreateV1(Lachlan.token, [Banjo.authUserId, Banjo.authUserId])).toStrictEqual({ errorCode: 400 });
  });
});

// Testing success cases
describe('Testing dmCreateV1 success cases', () => {
  test('Test 1: name created correctly', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
    const Hayden = authRegisterV1('hsmith@gmail.com', 'randoPassword', 'Hayden', 'Smith');
    const Hayden0 = authRegisterV1('brother@gmail.com', 'randoPassword', 'Hayden', 'Smith');
    const Hayden1 = authRegisterV1('sister@gmail.com', 'randoPassword', 'Hayden', 'Smith');
    const newDM = dmCreateV1(Lachlan.token, [Banjo.authUserId, Hayden0.authUserId, Hayden1.authUserId, Hayden.authUserId]);
    expect(
      dmDetailsV1(Lachlan.token, newDM.dmId).name
    ).toEqual(
      'banjopatterson, haydensmith, haydensmith0, haydensmith1, lachlangilroy'
    );
  });

  test('Test 2: members added correctly', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
    const Hayden = authRegisterV1('hsmith@gmail.com', 'randoPassword', 'Hayden', 'Smith');
    const newDM = dmCreateV1(Lachlan.token, [Banjo.authUserId, Hayden.authUserId]);
    expect(
      new Set(dmDetailsV1(Lachlan.token, newDM.dmId).members)
    ).toEqual(
      new Set(
        [
          {
            uId: Lachlan.authUserId,
            email: 'lachlangilroy@gmail.com',
            nameFirst: 'Lachlan',
            nameLast: 'Gilroy',
            handleStr: 'lachlangilroy',
            profileImgUrl: expect.any(String)
          },
          {
            uId: Banjo.authUserId,
            email: 'bpatterson@gmail.com',
            nameFirst: 'Banjo',
            nameLast: 'Patterson',
            handleStr: 'banjopatterson',
            profileImgUrl: expect.any(String)
          },
          {
            uId: Hayden.authUserId,
            email: 'hsmith@gmail.com',
            nameFirst: 'Hayden',
            nameLast: 'Smith',
            handleStr: 'haydensmith',
            profileImgUrl: expect.any(String)
          },
        ]
      )
    );
  });
});
