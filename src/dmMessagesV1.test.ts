/*
    This function prints messages similar to channelMessagesV1
    Error:
        - token is invalid
        - dmId is invalid
        - start is greater than the total number of messages in the channel
        - dmId is valid and the authorised user is not a member of the DM
    Success:
        - prints out the messages 50 at a time from index start to index end -1
*/

import { clearV1 } from './otherRequests';
import { dmCreateV1, dmMessagesV1 } from './dmRequests';
import { authRegisterV1 } from './authRequests';
import { messageSendDmV1 } from './messageRequests';

// Reseting dataStore for each test
beforeEach(() => {
  clearV1();
});

// Testing error cases
describe('Testing error cases of dmMessagesV1', () => {
  test('Test 1: token is invalid', () => {
    expect(dmMessagesV1('', 1, 0)).toEqual({ errorCode: 403 });
  });

  test('Test 2: dmID is invalid', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    expect(dmMessagesV1(Lachlan.token, 1, 0)).toEqual({ errorCode: 400 });
  });

  test('Test 3: start greater than total number of messages in DM', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const newDM = dmCreateV1(Lachlan.token, []);
    expect(dmMessagesV1(Lachlan.token, newDM.dmId, 1)).toEqual({ errorCode: 400 });
  });

  test('Test 4: user is not a member of the DM', () => {
    const Lachlan = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const Banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson');
    const newDM = dmCreateV1(Lachlan.token, []);
    expect(dmMessagesV1(Banjo.token, newDM.dmId, 0)).toEqual({ errorCode: 403 });
  });
});

// Testing success cases
describe('Testing messages successfully', () => {
  test('Test 1: function should print one message', () => {
    const newUser = authRegisterV1('sample@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const newDM = dmCreateV1(newUser.token, []);
    const start = 0;
    messageSendDmV1(newUser.token, newDM.dmId, 'first Message');
    expect(
      dmMessagesV1(newUser.token, newDM.dmId, start).messages[0].message
    ).toEqual(
      'first Message'
    );
  });

  test('Test 2: exactly 50 messages in the channel so end === -1', () => {
    const newUser = authRegisterV1('sample@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const newDM = dmCreateV1(newUser.token, []);
    for (let i = 0; i < 50; i++) {
      messageSendDmV1(newUser.token, newDM.dmId, 'messageNum' + i);
    }
    const start = 0;
    const end = -1;
    expect(
      dmMessagesV1(newUser.token, newDM.dmId, start).end
    ).toEqual(end);
  });

  test('Test 3: exactly 51 messages in the channel so end === 50', () => {
    const newUser = authRegisterV1('sample@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const newDM = dmCreateV1(newUser.token, []);
    for (let i = 0; i < 51; i++) {
      messageSendDmV1(newUser.token, newDM.dmId, 'messageNum' + i);
    }
    const start = 0;
    const end = 50;
    expect(
      dmMessagesV1(newUser.token, newDM.dmId, start).end
    ).toEqual(end);
  });

  // test('Test 4: testing pagination', () => {
  //   const newUser = authRegisterV1('sample@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
  //   const newDM = dmCreateV1(newUser.token, []);
  //   for (let i = 0; i < 124; i++) {
  //     messageSendDmV1(newUser.token, newDM.dmId, 'messageNum' + i);
  //   }
  //   const start = 0;
  //   const end1 = 50;
  //   const end2 = 100;
  //   const end3 = -1;
  //   expect(
  //     [
  //       dmMessagesV1(newUser.token, newDM.dmId, start).end,
  //       dmMessagesV1(newUser.token, newDM.dmId, start + 50).end,
  //       dmMessagesV1(newUser.token, newDM.dmId, start + 100).end,
  //     ]
  //   ).toEqual(
  //     [
  //       end1,
  //       end2,
  //       end3,
  //     ]
  //   );
  // });

  test('Test 5: Testing 1 message start = 1', () => {
    const newUser = authRegisterV1('sample@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const newDM = dmCreateV1(newUser.token, []);
    const start = 1;
    const end = -1;
    messageSendDmV1(newUser.token, newDM.dmId, 'first Message');
    expect(
      dmMessagesV1(newUser.token, newDM.dmId, start)
    ).toEqual(
      {
        messages: [],
        start: start,
        end: end,
      }
    );
  });

  test('Test 6: Testing no messages start = 0', () => {
    const newUser = authRegisterV1('sample@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const newDM = dmCreateV1(newUser.token, []);
    const start = 0;
    const end = -1;
    expect(
      dmMessagesV1(newUser.token, newDM.dmId, start)
    ).toEqual(
      {
        messages: [],
        start: start,
        end: end,
      }
    );
  });
});
