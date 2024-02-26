import { authRegisterV1 } from './authRequests';
import { channelsCreateV1 } from './channelsRequests';
import { channelMessagesV1, channelLeaveV1 } from './channelRequests';
import { dmMessagesV1, dmCreateV1, dmLeaveV1 } from './dmRequests';
import { messageSendV1, messageSendDmV1, messageUnreactV1, messageReactV1 } from './messageRequests';
import { clearV1 } from './otherRequests';

/*
    Test suite for messageUnreactV1
    error cases
    - messageId is not valid within the channel or DM that the user is apart of
    - reactId is not valid
    - message does not contain a react from the authored user

    success cases
    - uncreacts the message
*/

beforeEach(() => {
  clearV1();
});

describe('messageUnreactV1 error cases', () => {
  test('Invalid Token', () => {
    const user = authRegisterV1('NarutoSasuke@gmail.com', 'Password123', 'Agrim', 'Shakergaye');
    expect(messageUnreactV1(user.token + 'toInvalid', 1234, 1)).toStrictEqual({ errorCode: 403 });
  });
  test('Invalid messageId (Channel).', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
    const channelId = channelsCreateV1(token, 'General', true).channelId;
    const messageId = messageSendV1(token, channelId, 'Old message!').messageId;
    channelLeaveV1(token, channelId);
    expect(messageUnreactV1(token, messageId, 1)).toStrictEqual({ errorCode: 400 });
  });
  test('Invalid messageId (Dm)', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
    const sender = authRegisterV1('send@gmail.com', 'sendPass', 'Send', 'Smith');
    const dmId = dmCreateV1(token.token, [sender.authUserId]).dmId;
    const messageId = messageSendDmV1(sender.token, dmId, 'test').messageId;
    dmLeaveV1(sender.token, dmId);
    expect(messageUnreactV1(sender.token, messageId, 1)).toStrictEqual({ errorCode: 400 });
  });
  test('Invalid reactId (channel)', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
    const channelId = channelsCreateV1(token.token, 'General', true).channelId;
    const messageId = messageSendV1(token.token, channelId, 'Old message!').messageId;
    expect(messageUnreactV1(token.token, messageId, 2)).toStrictEqual({ errorCode: 400 });
  });
  test('Invalid reactId (dm)', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
    const sender = authRegisterV1('send@gmail.com', 'sendPass', 'Send', 'Smith');
    const dmId = dmCreateV1(token, [sender.authUserId]).dmId;
    const messageId = messageSendDmV1(token, dmId, 'react message plz').messageId;
    expect(messageUnreactV1(token, messageId, 2)).toStrictEqual({ errorCode: 400 });
  });
  test('Message has not been reacted to', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
    const channelId = channelsCreateV1(token.token, 'General', true).channelId;
    const messageId = messageSendV1(token.token, channelId, 'Old message!').messageId;
    expect(messageUnreactV1(token.token, messageId, 1)).toStrictEqual({ errorCode: 400 });
  });
  test('The message has already been unreacted to', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
    const channelId = channelsCreateV1(token.token, 'General', true).channelId;
    const messageId = messageSendV1(token.token, channelId, 'Old message!').messageId;
    expect(messageReactV1(token.token, messageId, 1)).toStrictEqual({});
    expect(messageUnreactV1(token.token, messageId, 1)).toStrictEqual({});
    expect(messageUnreactV1(token.token, messageId, 1)).toStrictEqual({ errorCode: 400 });
  });
});

describe('messageUnreactV1 Success cases', () => {
  test('Successful React in Channel', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
    const channelId = channelsCreateV1(token.token, 'General', true).channelId;
    const messageId = messageSendV1(token.token, channelId, 'Old message!').messageId;
    expect(messageReactV1(token.token, messageId, 1)).toStrictEqual({});
    expect(messageUnreactV1(token.token, messageId, 1)).toStrictEqual({});
    expect(channelMessagesV1(token.token, channelId, 0).messages[0].reacts[0]).toStrictEqual({
      reactId: 1,
      uIds: [],
      isThisUserReacted: false
    });
  });

  test('Successful multiple reacts & unreacts in dm', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
    const sender = authRegisterV1('send@gmail.com', 'sendPass', 'Send', 'Smith');
    const dmId = dmCreateV1(token.token, [sender.authUserId]).dmId;
    const messageId = messageSendDmV1(token.token, dmId, 'Old message!').messageId;
    expect(messageReactV1(token.token, messageId, 1)).toStrictEqual({});
    expect(messageReactV1(sender.token, messageId, 1)).toStrictEqual({});
    expect(messageUnreactV1(token.token, messageId, 1)).toStrictEqual({});
    expect(dmMessagesV1(token.token, dmId, 0).messages[0].reacts[0]).toStrictEqual({
      reactId: 1,
      uIds: [sender.authUserId],
      isThisUserReacted: false
    });
  });
});
