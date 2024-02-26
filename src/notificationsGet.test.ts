import { clearV1 } from './otherRequests';
import { notificationsGet } from './notificationsRequests';
import { authRegisterV1 } from './authRequests';
import { channelInviteV1, channelJoinV1, channelMessagesV1, channelLeaveV1 } from './channelRequests';
import { channelsCreateV1 } from './channelsRequests';
import { dmCreateV1, dmLeaveV1 } from './dmRequests';
import { messageSendV1, messageSendDmV1, messageEditV1, messageShare, messageReactV1 } from './messageRequests';

beforeAll(() => {
  clearV1();
});

afterEach(() => {
  clearV1();
});

test('20+ notificationsGet shows 20 most recent', () => {
  const user = authRegisterV1('some@gmail.com', 'password', 'user', 'name');
  const tagged = authRegisterV1('tagged@gmail.com', 'password', 'tagged', 'person');
  const channelId = channelsCreateV1(user.token, 'New Channel', true).channelId;
  channelJoinV1(tagged.token, channelId);
  const tagMessage = 'hello @taggedperson how are you';
  for (let i = 0; i < 22; i++) {
    messageSendV1(user.token, channelId, tagMessage);
  }
  expect(notificationsGet(tagged.token).length).toStrictEqual(20);
});
test('Error Test: Invalid Token', () => {
  const tagged = authRegisterV1('tagged@gmail.com', 'password', 'tagged', 'person');
  expect(notificationsGet(tagged.token + 'invalid token')).toStrictEqual({ errorCode: 403 });
});
describe('Tagging Tests', () => {
  test('MessageSend Tagging', () => {
    const user = authRegisterV1('some@gmail.com', 'password', 'user', 'name');
    authRegisterV1('dummy@gmail.com', 'password', 'dummy', 'user');
    const tagged = authRegisterV1('tagged@gmail.com', 'password', 'tagged', 'person');
    const channelName = 'New Channel';
    const channelId = channelsCreateV1(user.token, 'New Channel', true).channelId;
    channelJoinV1(tagged.token, channelId);
    const tagMessage = 'hello @taggedperson how are you @dummyuser';
    messageSendV1(user.token, channelId, tagMessage);
    expect(notificationsGet(tagged.token)).toStrictEqual([{
      channelId: channelId,
      dmId: -1,
      notificationMessage: `username tagged you in ${channelName}: ${tagMessage.substring(0, 20)}`
    }]);
  });
  test('MessageSendDm Tagging', () => {
    const user = authRegisterV1('some@gmail.com', 'password', 'user', 'name');
    authRegisterV1('dummy@gmail.com', 'password', 'dummy', 'user');
    const tagged = authRegisterV1('tagged@gmail.com', 'password', 'tagged', 'person');
    const taggedHandle = 'taggedperson';
    const userHandle = 'username';
    const dmId = dmCreateV1(user.token, [tagged.authUserId]).dmId;
    const tagMessage = `hello @${taggedHandle} how are you @dummyuser`;
    const dmName = `${taggedHandle}, ${userHandle}`;
    messageSendDmV1(user.token, dmId, tagMessage);
    expect(notificationsGet(tagged.token)[0]).toStrictEqual({
      channelId: -1,
      dmId: dmId,
      notificationMessage: `${userHandle} tagged you in ${dmName}: ${tagMessage.substring(0, 20)}`
    });
  });
  test('MessageEdit Tagging', () => {
    const user = authRegisterV1('some@gmail.com', 'password', 'user', 'name');
    const tagged = authRegisterV1('tagged@gmail.com', 'password', 'tagged', 'person');
    const channelName = 'New Channel';
    const channelId = channelsCreateV1(user.token, 'New Channel', true).channelId;
    channelJoinV1(tagged.token, channelId);
    const tagMessage = 'hello @taggedperson how are you';
    const messageId = messageSendV1(user.token, channelId, tagMessage).messageId;
    const secondtagMessage = 'hey @taggedperson i am tagging you again haha';
    messageEditV1(user.token, messageId, secondtagMessage);
    expect(notificationsGet(tagged.token)).toStrictEqual([
      {
        channelId: channelId,
        dmId: -1,
        notificationMessage: `username tagged you in ${channelName}: ${secondtagMessage.substring(0, 20)}`
      },
      {
        channelId: channelId,
        dmId: -1,
        notificationMessage: `username tagged you in ${channelName}: ${tagMessage.substring(0, 20)}`
      }
    ]);
  });
  test('MessageShare Tagging', () => {
    const user = authRegisterV1('some@gmail.com', 'password', 'user', 'name');
    const tagged = authRegisterV1('tagged@gmail.com', 'password', 'tagged', 'person');
    const ogChannelId = channelsCreateV1(user.token, 'OG channel', true).channelId;
    const channelName = 'New Channel';
    const channelId = channelsCreateV1(user.token, 'New Channel', true).channelId;
    channelJoinV1(tagged.token, channelId);
    const tagMessage = '@taggedperson this you owO?? cutie';
    const messageId = messageSendV1(user.token, ogChannelId, 'o_o').messageId;
    messageShare(user.token, messageId, tagMessage, channelId, -1);
    const sharedMessage = channelMessagesV1(user.token, channelId, 0).messages[0].message;
    expect(notificationsGet(tagged.token)).toStrictEqual([{
      channelId: channelId,
      dmId: -1,
      notificationMessage: `username tagged you in ${channelName}: ${sharedMessage.substring(0, 20)}`
    }]);
  });
});

describe('Reacted Message Tests', () => {
  test('MessageReact sends a Notification to the message sender (channel)', () => {
    const user = authRegisterV1('some@gmail.com', 'password', 'user', 'name');
    const notifee = authRegisterV1('notify@gmail.com', 'password', 'noti', 'fyme');
    const channelName = 'uwu crew';
    const channelId = channelsCreateV1(user.token, channelName, true).channelId;
    channelJoinV1(notifee.token, channelId);
    const messageId = messageSendV1(notifee.token, channelId, 'Message!').messageId;
    messageReactV1(user.token, messageId, 1);
    expect(notificationsGet(notifee.token)).toStrictEqual([{
      channelId: channelId,
      dmId: -1,
      notificationMessage: `username reacted to your message in ${channelName}`
    }]);
  });/*
  test('MessageReact sends a Notification to the message sender (dm)', () => {
    const user = authRegisterV1('some@gmail.com', 'password', 'user', 'name');
    const notifee = authRegisterV1('notify@gmail.com', 'password', 'noti', 'fyme');
    const dmId = dmCreateV1(user.token, [notifee.authUserId]).dmId;
    const messageId = messageSendDmV1(notifee.token, dmId, 'Message!').messageId;
    messageReactV1(user.token, messageId, 1);
    expect(notificationsGet(notifee.token)).toStrictEqual([{
      channelId: -1,
      dmId: dmId,
      notificationMessage: `username reacted to your message in notifyme, username`
    }]);
  }); */
  test('MessageReact does not send notification if original message sender left (channel)', () => {
    const user = authRegisterV1('some@gmail.com', 'password', 'user', 'name');
    const notifee = authRegisterV1('notify@gmail.com', 'password', 'noti', 'fyme');
    const channelId = channelsCreateV1(user.token, 'Channel Name', true).channelId;
    channelJoinV1(notifee.token, channelId);
    const messageId = messageSendV1(notifee.token, channelId, 'Message!').messageId;
    channelLeaveV1(notifee.token, channelId);
    messageReactV1(user.token, messageId, 1);
    expect(notificationsGet(notifee.token).length).toStrictEqual(0);
  });
  test('MessageReact does not send notification if original message sender left (dm)', () => {
    const user = authRegisterV1('some@gmail.com', 'password', 'user', 'name');
    const notifee = authRegisterV1('notify@gmail.com', 'password', 'noti', 'fyme');
    const dmId = dmCreateV1(user.token, [notifee.authUserId]).dmId;
    const messageId = messageSendDmV1(notifee.token, dmId, 'Message!').messageId;
    dmLeaveV1(notifee.token, dmId);
    messageReactV1(user.token, messageId, 1);
    expect(notificationsGet(notifee.token).length).toStrictEqual(1);
  });
});

describe('Joined channel Tests', () => {
  test('ChannelInvite Sends a Notification to joiner', () => {
    const user = authRegisterV1('some@gmail.com', 'password', 'user', 'name');
    const notifee = authRegisterV1('notify@gmail.com', 'password', 'noti', 'fyme');
    const channelName = 'Puppies!!!';
    const channelId = channelsCreateV1(user.token, channelName, true).channelId;
    channelInviteV1(user.token, channelId, notifee.authUserId);
    expect(notificationsGet(notifee.token)).toStrictEqual([{
      channelId: channelId,
      dmId: -1,
      notificationMessage: `username added you to ${channelName}`
    }]);
  });
  test('DmCreate Sends a Notification to all non-creator', () => {
    const user = authRegisterV1('some@gmail.com', 'password', 'user', 'name');
    const notifee = authRegisterV1('notify@gmail.com', 'password', 'noti', 'fyme');
    const notifeeTwo = authRegisterV1('notwo@gmail.com', 'password', 'noti', 'two');
    const dmId = dmCreateV1(user.token, [notifee.authUserId, notifeeTwo.authUserId]).dmId;
    const dmName = 'notifyme, notitwo, username';
    expect(notificationsGet(notifee.token)).toStrictEqual([{
      channelId: -1,
      dmId: dmId,
      notificationMessage: `username added you to ${dmName}`
    }]);
    expect(notificationsGet(notifeeTwo.token)).toStrictEqual([{
      channelId: -1,
      dmId: dmId,
      notificationMessage: `username added you to ${dmName}`
    }]);
    expect(notificationsGet(user.token)).toStrictEqual([]);
  });
});
