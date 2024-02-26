import { clearV1 } from './otherRequests';
import { messagePinV1, messageSendV1, messageSendDmV1, messageUnpinV1 } from './messageRequests';
import { authRegisterV1 } from './authRequests';
import { channelLeaveV1, channelJoinV1, channelMessagesV1 } from './channelRequests';
import { channelsCreateV1 } from './channelsRequests';
import { dmCreateV1, dmLeaveV1, dmMessagesV1 } from './dmRequests';

beforeEach(() => {
  clearV1();
});

afterEach(() => {
  clearV1();
});

describe('messagePinV1 success cases', () => {
  test('messagePinV1 returns empty object (dm)', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
    const sender = authRegisterV1('send@gmail.com', 'sendPass', 'Send', 'Smith');
    const dmId = dmCreateV1(token.token, [sender.authUserId]).dmId;
    const currentTime = Math.floor(Date.now() / 1000);
    const messageId = messageSendDmV1(token.token, dmId, 'test').messageId;
    expect(messagePinV1(token.token, messageId)).toStrictEqual({});
    expect(messageUnpinV1(token.token, messageId)).toStrictEqual({});
    const ret = dmMessagesV1(token.token, dmId, 0);
    expect(ret.messages[0].timeSent).not.toBeLessThan(currentTime);
    expect(ret).toStrictEqual({
      messages: [{
        messageId: messageId,
        uId: token.authUserId,
        message: 'test',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }],
      start: 0,
      end: -1
    });
  });

  test('messageUnpinV1 returns empty object (channel)', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
    const channelId = channelsCreateV1(token.token, 'General', true).channelId;
    const currentTime = Math.floor(Date.now() / 1000);
    const messageId = messageSendV1(token.token, channelId, 'test').messageId;
    expect(messagePinV1(token.token, messageId)).toStrictEqual({});
    expect(messageUnpinV1(token.token, messageId)).toStrictEqual({});
    const ret = channelMessagesV1(token.token, channelId, 0);
    expect(ret.messages[0].timeSent).not.toBeLessThan(currentTime);
    expect(channelMessagesV1(token.token, channelId, 0)).toStrictEqual({
      messages: [{
        messageId: messageId,
        uId: token.authUserId,
        message: 'test',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }],
      start: 0,
      end: -1
    });
  });
});

describe('messageUnpinV1 error cases.', () => {
  test('Invalid token', () => {
    const user = authRegisterV1('NarutoSasuke@gmail.com', 'Password123', 'Agrim', 'Shakergaye');
    expect(messageUnpinV1(user.token + 'toInvalid', 1234)).toStrictEqual({ errorCode: 403 });
  });
  test('Invalid messageId (Channel).', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
    const channelId = channelsCreateV1(token, 'General', true).channelId;
    const messageId = messageSendV1(token, channelId, 'Old message!').messageId;
    channelLeaveV1(token, channelId);
    expect(messageUnpinV1(token, messageId + 1)).toStrictEqual({ errorCode: 400 });
  });
  test('Invalid messageId (Dm)', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
    const sender = authRegisterV1('send@gmail.com', 'sendPass', 'Send', 'Smith');
    const dmId = dmCreateV1(token.token, [sender.authUserId]).dmId;
    const messageId = messageSendDmV1(sender.token, dmId, 'test').messageId;
    dmLeaveV1(sender.token, dmId);
    expect(messageUnpinV1(sender.token, messageId)).toStrictEqual({ errorCode: 400 });
  });
  test('Message is not pinned', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
    const sender = authRegisterV1('send@gmail.com', 'sendPass', 'Send', 'Smith');
    const dmId = dmCreateV1(token.token, [sender.authUserId]).dmId;
    const messageId = messageSendDmV1(token.token, dmId, 'test').messageId;
    expect(messageUnpinV1(token.token, messageId)).toStrictEqual({ errorCode: 400 });
  });
  test('User does not owner permissions (channel)', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
    const user = authRegisterV1('send@gmail.com', 'sendPass', 'Send', 'Smith');
    const channelId = channelsCreateV1(token.token, 'General', true).channelId;
    channelJoinV1(user.token, channelId);
    const messageId = messageSendV1(token.token, channelId, 'test').messageId;
    messagePinV1(token.token, messageId);
    expect(messageUnpinV1(user.token, messageId)).toStrictEqual({ errorCode: 403 });
  });
  test('User does not owner permissions (dm)', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
    const user = authRegisterV1('send@gmail.com', 'sendPass', 'Send', 'Smith');
    const dmId = dmCreateV1(token.token, [user.authUserId]).dmId;
    const messageId = messageSendDmV1(token.token, dmId, 'test').messageId;
    messagePinV1(token.token, messageId);
    expect(messageUnpinV1(user.token, messageId)).toStrictEqual({ errorCode: 403 });
  });
});
