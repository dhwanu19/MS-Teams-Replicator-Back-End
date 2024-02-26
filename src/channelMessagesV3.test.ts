/*
    This is test file for channelMessagesV1

    This function prints out messages from a channel
    Error:
        - token is invalid
        - channelId does not refer to a valid channel
        - start is greater than total number of messages
        - channelId is valid and the authorised user is not a member of the channel

    Success:
        - Prints out messages
*/

import { channelMessagesV1 } from './channelRequests';
import { clearV1 } from './otherRequests';
import { authRegisterV1 } from './authRequests';
import { channelsCreateV1 } from './channelsRequests';
import { messageSendV1 } from './messageRequests';

// Reseting dataStore for each test
beforeEach(() => {
  clearV1();
});

// Reseting dataStore after each test
afterAll(() => {
  clearV1();
});

// error cases
describe('Testing channelMessagesV1 error cases', () => {
  test('Test 1: checking channelId is invalid', () => {
    const newUser = authRegisterV1('sample@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy').token;
    expect(
      channelMessagesV1(newUser, 1, 0)
    ).toEqual({ errorCode: 400 });
  });

  test('Test 2: checking start greater than total number of messages in the channel', () => {
    const newUser = authRegisterV1('sample@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy').token;
    const newChannelId = channelsCreateV1(newUser, 'newChannel', true).channelId;
    expect(
      channelMessagesV1(newUser, newChannelId, 1)
    ).toEqual({ errorCode: 400 });
  });

  test('Test 3: checking user is not a member of the channel', () => {
    const newUser = authRegisterV1('sample@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy').token;
    const newChannelId = channelsCreateV1(newUser, 'newChannel', true).channelId;
    const banjo = authRegisterV1('bpatterson@gmail.com', 'nunyabusiness', 'Banjo', 'Patterson').token;
    expect(
      channelMessagesV1(banjo, newChannelId, 0)
    ).toEqual({ errorCode: 403 });
  });

  test('Test 4: checking token is invalid', () => {
    expect(
      channelMessagesV1('', 1, 0)
    ).toEqual({ errorCode: 403 });
  });
});

// correct function implementation testing
describe('Testing correct message retrieval', () => {
  test('Test 1: function should print one message', () => {
    const user = authRegisterV1('sample@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy');
    const token = user.token;
    const newChannelId = channelsCreateV1(token, 'newChannel', true).channelId;
    const start = 0;
    const end = -1;
    const messageId = messageSendV1(token, newChannelId, 'first Message').messageId;
    expect(
      channelMessagesV1(token, newChannelId, start)
    ).toEqual(
      {
        messages: [
          {
            message: 'first Message',
            messageId: messageId,
            timeSent: expect.any(Number),
            uId: user.authUserId,
            reacts: [],
            isPinned: false
          }
        ],
        start: start,
        end: end,
      }
    );
  });

  test('Test 2: exactly 50 messages in the channel so end === -1', () => {
    const token = authRegisterV1('sample@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy').token;
    const newChannelId = channelsCreateV1(token, 'newChannel', true).channelId;
    for (let i = 0; i < 50; i++) {
      messageSendV1(token, newChannelId, 'messageNum' + i);
    }
    const start = 0;
    const end = -1;
    expect(
      channelMessagesV1(token, newChannelId, start).end
    ).toEqual(end);
  });

  test('Test 3: exactly 51 messages in the channel so end === 50', () => {
    const token = authRegisterV1('sample@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy').token;
    const newChannelId = channelsCreateV1(token, 'newChannel', true).channelId;
    for (let i = 0; i < 51; i++) {
      messageSendV1(token, newChannelId, 'messageNum' + i);
    }
    const start = 0;
    const end = 50;
    expect(
      channelMessagesV1(token, newChannelId, start).end
    ).toEqual(end);
  });

  // test('Test 4: testing pagination', () => {
  //   const token = authRegisterV1('sample@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy').token;
  //   const newChannelId = channelsCreateV1(token, 'newChannel', true).channelId;
  //   for (let i = 0; i < 124; i++) {
  //     messageSendV1(token, newChannelId, 'messageNum' + i);
  //   }
  //   const start = 0;
  //   const end1 = 50;
  //   const end2 = 100;
  //   const end3 = -1;
  //   expect(
  //     [
  //       channelMessagesV1(token, newChannelId, start).end,
  //       channelMessagesV1(token, newChannelId, start + 50).end,
  //       channelMessagesV1(token, newChannelId, start + 100).end,
  //     ]
  //   ).toEqual(
  //     [
  //       end1,
  //       end2,
  //       end3,
  //     ]
  //   );
  // });

  test('Test 5: Testing 1 message, start = 1', () => {
    const token = authRegisterV1('sample@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy').token;
    const newChannelId = channelsCreateV1(token, 'newChannel', true).channelId;
    const start = 1;
    const end = -1;
    messageSendV1(token, newChannelId, 'first Message');
    expect(
      channelMessagesV1(token, newChannelId, start)
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
    const newChannel = channelsCreateV1(newUser.token, 'newChannel', true);
    const start = 0;
    const end = -1;
    expect(
      channelMessagesV1(newUser.token, newChannel.channelId, start)
    ).toEqual(
      {
        messages: [],
        start: start,
        end: end,
      }
    );
  });
});
