import { authRegisterV1 } from './authRequests';
import { channelsCreateV1 } from './channelsRequests';
import { channelMessagesV1, channelJoinV1, channelLeaveV1 } from './channelRequests';
import { dmMessagesV1, dmCreateV1, dmLeaveV1 } from './dmRequests';
import { messageSendV1, messageSendDmV1, messageRemoveV1 } from './messageRequests';
import { clearV1 } from './otherRequests';

beforeEach(() => {
  clearV1();
});

// CHANNEL messages tests
describe('Channel Messages', () => {
  describe('Success Tests', () => {
    test('Normal Message => {}}', () => {
      const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
      const channelId = channelsCreateV1(token, 'General', true).channelId;
      const messageId = messageSendV1(token, channelId, 'Old message!').messageId;
      expect(messageRemoveV1(token, messageId)).toStrictEqual({});
    });
    test('Message is removed correctly', () => {
      const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
      const channelId = channelsCreateV1(token, 'General', true).channelId;
      const messageId = messageSendV1(token, channelId, 'Old message!').messageId;
      messageRemoveV1(token, messageId);
      expect(channelMessagesV1(token, channelId, 0).messages).toStrictEqual([]);
    });
    describe('Message is not written by authorised user success cases', () => {
      test('Global owner is non-owner member and attempts to edit => success', () => {
        const globalOwner = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
        const ogMessenger = authRegisterV1('other@gmail.com', 'Passwords', 'Other', 'Name');
        const channelId = channelsCreateV1(ogMessenger.token, 'General', true).channelId;
        const messageId = messageSendV1(ogMessenger.token, channelId, 'Old message!').messageId;
        channelJoinV1(globalOwner.token, channelId);
        expect(messageRemoveV1(globalOwner.token, messageId)).toStrictEqual({});
      });
      test('Non-global owner channel Owner can edit => success', () => {
        const ogMessenger = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
        const channelOwner = authRegisterV1('other@gmail.com', 'Passwords', 'Other', 'Name');
        const channelId = channelsCreateV1(channelOwner.token, 'General', true).channelId;
        channelJoinV1(ogMessenger.token, channelId);
        const messageId = messageSendV1(ogMessenger.token, channelId, 'Old message!').messageId;
        expect(messageRemoveV1(channelOwner.token, messageId)).toStrictEqual({});
      });
    });
  });

  // Error cases:
  // - token is invalid
  // - length of message is over 1000 characters
  // - message is in a channel that the user has not joined
  // - message is not written by user

  describe('Error Tests', () => {
    test('Invalid token => error', () => {
      const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
      const channelId = channelsCreateV1(token, 'General', true).channelId;
      const messageId = messageSendV1(token, channelId, 'Old message!').messageId;
      expect(messageRemoveV1(token + '1', messageId)).toStrictEqual({ errorCode: 403 });
    });
    test('User and message not in the same channel => error', () => {
      const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
      const channelId = channelsCreateV1(token, 'General', true).channelId;
      const messageId = messageSendV1(token, channelId, 'Old message!').messageId;
      channelLeaveV1(token, channelId);
      expect(messageRemoveV1(token, messageId)).toStrictEqual({ errorCode: 400 });
    });
    test('Msg not written by user, global owner not in channel edit => error', () => {
      const globalOwner = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
      const ogMessenger = authRegisterV1('other@gmail.com', 'Passwords', 'Other', 'Name');
      const channelId = channelsCreateV1(ogMessenger.token, 'General', true).channelId;
      const messageId = messageSendV1(ogMessenger.token, channelId, 'Old message!').messageId;
      expect(messageRemoveV1(globalOwner.token, messageId)).toStrictEqual({ errorCode: 400 });
    });
    test('Msg not written by user, user is member tries to edit => error', () => {
      const ogMessenger = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
      const attemptedEditor = authRegisterV1('other@gmail.com', 'Passwords', 'Other', 'Name');
      const channelId = channelsCreateV1(ogMessenger.token, 'General', true).channelId;
      const messageId = messageSendV1(ogMessenger.token, channelId, 'Old message!').messageId;
      channelJoinV1(attemptedEditor.token, channelId);
      expect(messageRemoveV1(attemptedEditor.token, messageId)).toStrictEqual({ errorCode: 403 });
    });
  });
});

// DM messages tests
describe('Dm Messages', () => {
  describe('Success Tests', () => {
    test('Normal Message => {}}', () => {
      const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
      const dmId = dmCreateV1(token, []).dmId;
      const messageId = messageSendDmV1(token, dmId, 'Old message!').messageId;
      expect(messageRemoveV1(token, messageId)).toStrictEqual({});
    });
    test('Message is removed correctly', () => {
      const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
      const dmId = dmCreateV1(token, []).dmId;
      const messageId = messageSendDmV1(token, dmId, 'Old message!').messageId;
      messageRemoveV1(token, messageId);
      expect(dmMessagesV1(token, dmId, 0).messages).toStrictEqual([]);
    });
    describe('Message is not written by authorised user success cases', () => {
      test('Authorised user is creator', () => {
        const creator = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
        const messenger = authRegisterV1('other@gmail.com', 'Passwords', 'Other', 'Name');
        const dmId = dmCreateV1(creator.token, [messenger.authUserId]).dmId;
        const messageId = messageSendDmV1(messenger.token, dmId, 'Old message!').messageId;
        expect(messageRemoveV1(creator.token, messageId)).toStrictEqual({});
      });
    });
  });

  // Error cases:
  // - token is invalid
  // - length of message is over 1000 characters
  // - message is in a channel that the user has not joined
  // - message is not written by user

  describe('Error Tests', () => {
    test('Invalid token => error', () => {
      const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
      const dmId = dmCreateV1(token, []).dmId;
      const messageId = messageSendDmV1(token, dmId, 'Old message!').messageId;
      expect(messageRemoveV1(token + '1', messageId)).toStrictEqual({ errorCode: 403 });
    });
    test('User and message not in the same channel => error', () => {
      const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
      const dmId = dmCreateV1(token, []).dmId;
      const messageId = messageSendDmV1(token, dmId, 'Old message!').messageId;
      dmLeaveV1(token, dmId);
      expect(messageRemoveV1(token, messageId)).toStrictEqual({ errorCode: 400 });
    });
    test('Non-creator global owner attempts to edit out of dm => error', () => {
      const globalOwner = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
      const creator = authRegisterV1('other@gmail.com', 'Passwords', 'Other', 'Name');
      const dmId = dmCreateV1(creator.token, []).dmId;
      const messageId = messageSendDmV1(creator.token, dmId, 'Old message!').messageId;
      expect(messageRemoveV1(globalOwner.token, messageId)).toStrictEqual({ errorCode: 400 });
    });
    test('Non-creator global owner attempts to edit in dm => error', () => {
      const globalOwner = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
      const creator = authRegisterV1('other@gmail.com', 'Passwords', 'Other', 'Name');
      const dmId = dmCreateV1(creator.token, [globalOwner.authUserId]).dmId;
      const messageId = messageSendDmV1(creator.token, dmId, 'Old message!').messageId;
      expect(messageRemoveV1(globalOwner.token, messageId)).toStrictEqual({ errorCode: 403 });
    });
    test('Non-creator attempts to edit => error', () => {
      const creator = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
      const editor = authRegisterV1('other@gmail.com', 'Passwords', 'Other', 'Name');
      const dmId = dmCreateV1(creator.token, [editor.authUserId]).dmId;
      const messageId = messageSendDmV1(creator.token, dmId, 'Old message!').messageId;
      expect(messageRemoveV1(editor.token, messageId)).toStrictEqual({ errorCode: 403 });
    });
  });
});
