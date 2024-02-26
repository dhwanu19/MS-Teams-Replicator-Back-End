import { authRegisterV1 } from './authRequests';
import { channelsCreateV1 } from './channelsRequests';
import { channelMessagesV1, channelJoinV1, channelLeaveV1 } from './channelRequests';
import { dmMessagesV1, dmCreateV1, dmLeaveV1 } from './dmRequests';
import { messageSendV1, messageEditV1, messageSendDmV1 } from './messageRequests';
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
      expect(messageEditV1(token, messageId, 'Edited message!')).toStrictEqual({});
    });
    test('1000 character message => {}}', () => {
      const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
      const channelId = channelsCreateV1(token, 'General', true).channelId;
      const messageId = messageSendV1(token, channelId, 'Old message!').messageId;
      const message = 'cCRayjN9vMcjiaqy2eBGaNlDNGGmVPHMjYX6lOrgDSIiJGYyBdfGa786uS3Yy0fRl3wpMJOUdAisNxw0vE7pxxzD43TH1nNlY9BZzjjkVfmmDvkwX2vSQgtu1yA8gGPYLATme0IOHJTMjISTATAsbIZr2xWEN8v2Aql5Lu9pPshb0Epz4jjId4DAkLLwevwpjnfvuF9vm0oE3DWVTvBA6Kn2gjEKy7ekDa3Lh6GXwewSubUVxuo6mkiDBN1KTUzj4cZY8lxZ3fr29l9tb5pmZMTiRokPXJqa3fZm6tFmu41NZ53fPtOu4kKL7QjkYKDZNgXZEI1SK3a4W8U4EiHa2CydRAg6ovFYTcywNim7Xf7ymO7fsnG1FTJOVc4fBjHBwaIVIjEJ0Bieq3fkYxkKTxiCC9ZZGX2yufbOZpvgwL0jtQGe7aH89KVlZgHGorQIE2xI4WAVcF1YjMlLpGejVsnjC0pzRxJxcgpI1wx2GwfV3YU1BWEadDwgf87SmicL8RvaET93ib77CODKbaZ21YWR5gDNnUkr1yeHAKEIDfdtwsHQDhMHzPmccho3fRDTYrx75ZU91w4mZOIbhdZnYs4PuRnqfjC6adzMDzwInbI1aKcgWCCCaW0zuDk6Z0KCPGUIcHoRNFlSzBQTaXNLij9I4N53iBC37CzSXtQbyi89r6zZjDVhu8Y05zUHodCUdsntQ7zNqCT5lvwxWKwBrTaLQKmyMdziweq7pBYnPTykuk9IWDWkQAepYMWCF1tltelrFV0ZjQXjoq93OzsUGcRQ8CGwzOTaLVHKZ6V9EWO3Yi7COCqCpob7LXBYEhbQi7CR9eGkUFc2V5L0A1eUWFMhnLrPLNrWYILVfft7ZV5k1psEFC8c4JaDEfBIGkTnAoCu2egNi2AYTvKdvRSmugDuGffofVa9MMYTj3z6QZpGtyT4Ev2DtOOVkqu7wDcUBYPN59G9heFXWV3QCCjXWJBerrX3DFV4IonfUaC3';
      expect(messageEditV1(token, messageId, message)).toStrictEqual({});
    });
    test('No character message (delete) => {}}', () => {
      const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
      const channelId = channelsCreateV1(token, 'General', true).channelId;
      const messageId = messageSendV1(token, channelId, 'Old message!').messageId;
      expect(messageEditV1(token, messageId, '')).toStrictEqual({});
    });
    test('Message is changed correctly', () => {
      const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
      const channelId = channelsCreateV1(token, 'General', true).channelId;
      messageSendV1(token, channelId, 'Multiple messages wow!');
      const messageId = messageSendV1(token, channelId, 'Old message!').messageId;
      const newMessage = 'Edited message!';
      messageEditV1(token, messageId, newMessage);
      expect(channelMessagesV1(token, channelId, 0).messages[0].message).toStrictEqual(newMessage);
    });
    test('Message is removed correctly', () => {
      const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
      const channelId = channelsCreateV1(token, 'General', true).channelId;
      const messageId = messageSendV1(token, channelId, 'Old message!').messageId;
      messageEditV1(token, messageId, '');
      expect(channelMessagesV1(token, channelId, 0).messages).toStrictEqual([]);
    });
    describe('Message is not written by authorised user success cases', () => {
      test('Global owner is non-owner member and attempts to edit => success', () => {
        const globalOwner = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
        const ogMessenger = authRegisterV1('other@gmail.com', 'Passwords', 'Other', 'Name');
        const channelId = channelsCreateV1(ogMessenger.token, 'General', true).channelId;
        const messageId = messageSendV1(ogMessenger.token, channelId, 'Old message!').messageId;
        channelJoinV1(globalOwner.token, channelId);
        expect(messageEditV1(globalOwner.token, messageId, 'Edited message!')).toStrictEqual({});
      });
      test('Non-global owner channel Owner can edit => success', () => {
        const ogMessenger = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
        const channelOwner = authRegisterV1('other@gmail.com', 'Passwords', 'Other', 'Name');
        const channelId = channelsCreateV1(channelOwner.token, 'General', true).channelId;
        channelJoinV1(ogMessenger.token, channelId);
        const messageId = messageSendV1(ogMessenger.token, channelId, 'Old message!').messageId;
        expect(messageEditV1(channelOwner.token, messageId, 'Edited message!')).toStrictEqual({});
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
      expect(messageEditV1(token + '1', messageId, 'Edited message!')).toStrictEqual({ errorCode: 403 });
    });
    test('message length over 1000 characters => error', () => {
      const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
      const channelId = channelsCreateV1(token, 'General', true).channelId;
      const messageId = messageSendV1(token, channelId, 'Old message!').messageId;
      const message = 'cCRayjN9vMcjiaqy2eBGaNlDNGGmVPHMjYX6lOrgDSIiJGYyBdfGa786uS3Yy0fRl3wpMJOUdAisNxw0vE7pxxzD43TH1nNlY9BZzjjkVfmmDvkwX2vSQgtu1yA8gGPYLATme0IOHJTMjISTATAsbIZr2xWEN8v2Aql5Lu9pPshb0Epz4jjId4DAkLLwevwpjnfvuF9vm0oE3DWVTvBA6Kn2gjEKy7ekDa3Lh6GXwewSubUVxuo6mkiDBN1KTUzj4cZY8lxZ3fr29l9tb5pmZMTiRokPXJqa3fZm6tFmu41NZ53fPtOu4kKL7QjkYKDZNgXZEI1SK3a4W8U4EiHa2CydRAg6ovFYTcywNim7Xf7ymO7fsnG1FTJOVc4fBjHBwaIVIjEJ0Bieq3fkYxkKTxiCC9ZZGX2yufbOZpvgwL0jtQGe7aH89KVlZgHGorQIE2xI4WAVcF1YjMlLpGejVsnjC0pzRxJxcgpI1wx2GwfV3YU1BWEadDwgf87SmicL8RvaET93ib77CODKbaZ21YWR5gDNnUkr1yeHAKEIDfdtwsHQDhMHzPmccho3fRDTYrx75ZU91w4mZOIbhdZnYs4PuRnqfjC6adzMDzwInbI1aKcgWCCCaW0zuDk6Z0KCPGUIcHoRNFlSzBQTaXNLij9I4N53iBC37CzSXtQbyi89r6zZjDVhu8Y05zUHodCUdsntQ7zNqCT5lvwxWKwBrTaLQKmyMdziweq7pBYnPTykuk9IWDWkQAepYMWCF1tltelrFV0ZjQXjoq93OzsUGcRQ8CGwzOTaLVHKZ6V9EWO3Yi7COCqCpob7LXBYEhbQi7CR9eGkUFc2V5L0A1eUWFMhnLrPLNrWYILVfft7ZV5k1psEFC8c4JaDEfBIGkTnAoCu2egNi2AYTvKdvRSmugDuGffofVa9MMYTj3z6QZpGtyT4Ev2DtOOVkqu7wDcUBYPN59G9heFXWV3QCCjXWJBerrX3DFV4IonfUaC36';
      expect(messageEditV1(token, messageId, message)).toStrictEqual({ errorCode: 400 });
    });
    test('User and message not in the same channel => error', () => {
      const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
      const channelId = channelsCreateV1(token, 'General', true).channelId;
      const messageId = messageSendV1(token, channelId, 'Old message!').messageId;
      channelLeaveV1(token, channelId);
      expect(messageEditV1(token, messageId, 'Edited message!')).toStrictEqual({ errorCode: 400 });
    });
    test('Msg not written by user, global owner not in channel edit => error', () => {
      const globalOwner = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
      const ogMessenger = authRegisterV1('other@gmail.com', 'Passwords', 'Other', 'Name');
      const channelId = channelsCreateV1(ogMessenger.token, 'General', true).channelId;
      const messageId = messageSendV1(ogMessenger.token, channelId, 'Old message!').messageId;
      expect(messageEditV1(globalOwner.token, messageId, 'Edited message!')).toStrictEqual({ errorCode: 400 });
    });
    test('Msg not written by user, user is member tries to edit => error', () => {
      const ogMessenger = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
      const attemptedEditor = authRegisterV1('other@gmail.com', 'Passwords', 'Other', 'Name');
      const channelId = channelsCreateV1(ogMessenger.token, 'General', true).channelId;
      const messageId = messageSendV1(ogMessenger.token, channelId, 'Old message!').messageId;
      channelJoinV1(attemptedEditor.token, channelId);
      expect(messageEditV1(attemptedEditor.token, messageId, 'Edited message!')).toStrictEqual({ errorCode: 403 });
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
      expect(messageEditV1(token, messageId, 'Edited message!')).toStrictEqual({});
    });
    test('1000 character message => {}}', () => {
      const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
      const dmId = dmCreateV1(token, []).dmId;
      const messageId = messageSendDmV1(token, dmId, 'Old message!').messageId;
      const message = 'cCRayjN9vMcjiaqy2eBGaNlDNGGmVPHMjYX6lOrgDSIiJGYyBdfGa786uS3Yy0fRl3wpMJOUdAisNxw0vE7pxxzD43TH1nNlY9BZzjjkVfmmDvkwX2vSQgtu1yA8gGPYLATme0IOHJTMjISTATAsbIZr2xWEN8v2Aql5Lu9pPshb0Epz4jjId4DAkLLwevwpjnfvuF9vm0oE3DWVTvBA6Kn2gjEKy7ekDa3Lh6GXwewSubUVxuo6mkiDBN1KTUzj4cZY8lxZ3fr29l9tb5pmZMTiRokPXJqa3fZm6tFmu41NZ53fPtOu4kKL7QjkYKDZNgXZEI1SK3a4W8U4EiHa2CydRAg6ovFYTcywNim7Xf7ymO7fsnG1FTJOVc4fBjHBwaIVIjEJ0Bieq3fkYxkKTxiCC9ZZGX2yufbOZpvgwL0jtQGe7aH89KVlZgHGorQIE2xI4WAVcF1YjMlLpGejVsnjC0pzRxJxcgpI1wx2GwfV3YU1BWEadDwgf87SmicL8RvaET93ib77CODKbaZ21YWR5gDNnUkr1yeHAKEIDfdtwsHQDhMHzPmccho3fRDTYrx75ZU91w4mZOIbhdZnYs4PuRnqfjC6adzMDzwInbI1aKcgWCCCaW0zuDk6Z0KCPGUIcHoRNFlSzBQTaXNLij9I4N53iBC37CzSXtQbyi89r6zZjDVhu8Y05zUHodCUdsntQ7zNqCT5lvwxWKwBrTaLQKmyMdziweq7pBYnPTykuk9IWDWkQAepYMWCF1tltelrFV0ZjQXjoq93OzsUGcRQ8CGwzOTaLVHKZ6V9EWO3Yi7COCqCpob7LXBYEhbQi7CR9eGkUFc2V5L0A1eUWFMhnLrPLNrWYILVfft7ZV5k1psEFC8c4JaDEfBIGkTnAoCu2egNi2AYTvKdvRSmugDuGffofVa9MMYTj3z6QZpGtyT4Ev2DtOOVkqu7wDcUBYPN59G9heFXWV3QCCjXWJBerrX3DFV4IonfUaC3';
      expect(messageEditV1(token, messageId, message)).toStrictEqual({});
    });
    test('No character message (delete) => {}}', () => {
      const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
      const dmId = dmCreateV1(token, []).dmId;
      const messageId = messageSendDmV1(token, dmId, 'Old message!').messageId;
      expect(messageEditV1(token, messageId, '')).toStrictEqual({});
    });
    test('Message is changed correctly', () => {
      const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
      const dmId = dmCreateV1(token, []).dmId;
      messageSendDmV1(token, dmId, 'Multiple messages wow!');
      const messageId = messageSendDmV1(token, dmId, 'Old message!').messageId;
      const newMessage = 'Edited message!';
      messageEditV1(token, messageId, newMessage);
      expect(dmMessagesV1(token, dmId, 0).messages[0].message).toStrictEqual(newMessage);
    });
    test('Message is removed correctly', () => {
      const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
      const dmId = dmCreateV1(token, []).dmId;
      const messageId = messageSendDmV1(token, dmId, 'Old message!').messageId;
      messageEditV1(token, messageId, '');
      expect(dmMessagesV1(token, dmId, 0).messages).toStrictEqual([]);
    });
    describe('Message is not written by authorised user success cases', () => {
      test('Authorised user is creator', () => {
        const creator = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
        const messenger = authRegisterV1('other@gmail.com', 'Passwords', 'Other', 'Name');
        const dmId = dmCreateV1(creator.token, [messenger.authUserId]).dmId;
        const messageId = messageSendDmV1(messenger.token, dmId, 'Old message!').messageId;
        expect(messageEditV1(creator.token, messageId, 'Edited message!')).toStrictEqual({});
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
      expect(messageEditV1(token + '1', messageId, 'Edited message!')).toStrictEqual({ errorCode: 403 });
    });
    test('message length over 1000 characters => error', () => {
      const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
      const dmId = dmCreateV1(token, []).dmId;
      const messageId = messageSendDmV1(token, dmId, 'Old message!').messageId;
      const message = 'cCRayjN9vMcjiaqy2eBGaNlDNGGmVPHMjYX6lOrgDSIiJGYyBdfGa786uS3Yy0fRl3wpMJOUdAisNxw0vE7pxxzD43TH1nNlY9BZzjjkVfmmDvkwX2vSQgtu1yA8gGPYLATme0IOHJTMjISTATAsbIZr2xWEN8v2Aql5Lu9pPshb0Epz4jjId4DAkLLwevwpjnfvuF9vm0oE3DWVTvBA6Kn2gjEKy7ekDa3Lh6GXwewSubUVxuo6mkiDBN1KTUzj4cZY8lxZ3fr29l9tb5pmZMTiRokPXJqa3fZm6tFmu41NZ53fPtOu4kKL7QjkYKDZNgXZEI1SK3a4W8U4EiHa2CydRAg6ovFYTcywNim7Xf7ymO7fsnG1FTJOVc4fBjHBwaIVIjEJ0Bieq3fkYxkKTxiCC9ZZGX2yufbOZpvgwL0jtQGe7aH89KVlZgHGorQIE2xI4WAVcF1YjMlLpGejVsnjC0pzRxJxcgpI1wx2GwfV3YU1BWEadDwgf87SmicL8RvaET93ib77CODKbaZ21YWR5gDNnUkr1yeHAKEIDfdtwsHQDhMHzPmccho3fRDTYrx75ZU91w4mZOIbhdZnYs4PuRnqfjC6adzMDzwInbI1aKcgWCCCaW0zuDk6Z0KCPGUIcHoRNFlSzBQTaXNLij9I4N53iBC37CzSXtQbyi89r6zZjDVhu8Y05zUHodCUdsntQ7zNqCT5lvwxWKwBrTaLQKmyMdziweq7pBYnPTykuk9IWDWkQAepYMWCF1tltelrFV0ZjQXjoq93OzsUGcRQ8CGwzOTaLVHKZ6V9EWO3Yi7COCqCpob7LXBYEhbQi7CR9eGkUFc2V5L0A1eUWFMhnLrPLNrWYILVfft7ZV5k1psEFC8c4JaDEfBIGkTnAoCu2egNi2AYTvKdvRSmugDuGffofVa9MMYTj3z6QZpGtyT4Ev2DtOOVkqu7wDcUBYPN59G9heFXWV3QCCjXWJBerrX3DFV4IonfUaC36';
      expect(messageEditV1(token, messageId, message)).toStrictEqual({ errorCode: 400 });
    });
    test('User and message not in the same channel => error', () => {
      const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
      const dmId = dmCreateV1(token, []).dmId;
      const messageId = messageSendDmV1(token, dmId, 'Old message!').messageId;
      dmLeaveV1(token, dmId);
      expect(messageEditV1(token, messageId, 'Edited message!')).toStrictEqual({ errorCode: 400 });
    });
    test('Non-creator global owner attempts to edit out of dm => error', () => {
      const globalOwner = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
      const creator = authRegisterV1('other@gmail.com', 'Passwords', 'Other', 'Name');
      const dmId = dmCreateV1(creator.token, []).dmId;
      const messageId = messageSendDmV1(creator.token, dmId, 'Old message!').messageId;
      expect(messageEditV1(globalOwner.token, messageId, 'Edited message!')).toStrictEqual({ errorCode: 400 });
    });
    test('Non-creator global owner attempts to edit in dm => error', () => {
      const globalOwner = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
      const creator = authRegisterV1('other@gmail.com', 'Passwords', 'Other', 'Name');
      const dmId = dmCreateV1(creator.token, [globalOwner.authUserId]).dmId;
      const messageId = messageSendDmV1(creator.token, dmId, 'Old message!').messageId;
      expect(messageEditV1(globalOwner.token, messageId, 'Edited message!')).toStrictEqual({ errorCode: 403 });
    });
    test('Non-creator attempts to edit => error', () => {
      const creator = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
      const editor = authRegisterV1('other@gmail.com', 'Passwords', 'Other', 'Name');
      const dmId = dmCreateV1(creator.token, [editor.authUserId]).dmId;
      const messageId = messageSendDmV1(creator.token, dmId, 'Old message!').messageId;
      expect(messageEditV1(editor.token, messageId, 'Edited message!')).toStrictEqual({ errorCode: 403 });
    });
  });
});
