import { authRegisterV1 } from './authRequests';
import { channelsCreateV1 } from './channelsRequests';
import { channelJoinV1, channelMessagesV1 } from './channelRequests';
import { standupStartV1, standupActiveV1, standupSendV1 } from './standupRequests';
import { clearV1 } from './otherRequests';

beforeEach(() => {
  clearV1();
});

afterEach(() => {
  clearV1();
});

describe('standupStartV1 Error Cases', () => {
  // Invalid token (403)
  test('Invalid token', () => {
    const user = authRegisterV1('bob@gmail.com', 'password', 'bob', 'smith');
    const invalidToken = user.token + 'toInvalid';
    const channelId = channelsCreateV1(user.token, 'Pets', true).channelId;
    expect(standupStartV1(invalidToken, channelId, 1)).toStrictEqual({ errorCode: 403 });
  });

  // Invalid channelId (400)
  test('Invalid channelId', () => {
    const user = authRegisterV1('bob@gmail.com', 'password', 'bob', 'smith');
    const channelId = channelsCreateV1(user.token, 'Pets', true).channelId;
    const invalidChannelId = channelId + 1;
    expect(standupStartV1(user.token, invalidChannelId, 1)).toStrictEqual({ errorCode: 400 });
  });
  // Invalid length (400)
  test('Invalid length', () => {
    const user = authRegisterV1('bob@gmail.com', 'password', 'bob', 'smith');
    const channelId = channelsCreateV1(user.token, 'Pets', true).channelId;
    expect(standupStartV1(user.token, channelId, -1)).toStrictEqual({ errorCode: 400 });
  });

  // Currently an active standup (400)
  test('Currently an active standup', () => {
    const user = authRegisterV1('bob@gmail.com', 'password', 'bob', 'smith');
    const channelId = channelsCreateV1(user.token, 'Pets', true).channelId;
    standupStartV1(user.token, channelId, 10);
    expect(standupStartV1(user.token, channelId, 1)).toStrictEqual({ errorCode: 400 });
  });

  // authUser is not a member (403)
  test('authUser is not a member', () => {
    const user = authRegisterV1('bob@gmail.com', 'password', 'bob', 'smith');
    const nonMember = authRegisterV1('nonMem@gmail.com', 'nomPass', 'Non', 'Smith');
    const channelId = channelsCreateV1(user.token, 'Pets', true).channelId;
    expect(standupStartV1(nonMember.token, channelId, 1)).toStrictEqual({ errorCode: 403 });
  });
});

describe('standupActiveV1 Error Cases', () => {
  // Invalid token (403)
  test('Invalid token', () => {
    const user = authRegisterV1('bob@gmail.com', 'password', 'bob', 'smith');
    const invalidToken = user.token + 'toInvalid';
    const channelId = channelsCreateV1(user.token, 'Pets', true).channelId;
    standupStartV1(user.token, channelId, 10);
    expect(standupActiveV1(invalidToken, channelId)).toStrictEqual({ errorCode: 403 });
  });

  // Invalid channelId (400)
  test('Invalid channelId', () => {
    const user = authRegisterV1('bob@gmail.com', 'password', 'bob', 'smith');
    const channelId = channelsCreateV1(user.token, 'Pets', true).channelId;
    const invalidChannelId = channelId + 1;
    standupStartV1(user.token, channelId, 10);
    expect(standupActiveV1(user.token, invalidChannelId)).toStrictEqual({ errorCode: 400 });
  });

  // authUser is not a member (403)
  test('authUser is not a member', () => {
    const user = authRegisterV1('bob@gmail.com', 'password', 'bob', 'smith');
    const nonMember = authRegisterV1('nonMem@gmail.com', 'nomPass', 'Non', 'Smith');
    const channelId = channelsCreateV1(user.token, 'Pets', true).channelId;
    standupStartV1(user.token, channelId, 10);
    expect(standupActiveV1(nonMember.token, channelId)).toStrictEqual({ errorCode: 403 });
  });
});

describe('standupSendV1 Error Cases', () => {
  // Invalid token (403)
  test('Invalid token', () => {
    const user = authRegisterV1('bob@gmail.com', 'password', 'bob', 'smith');
    const invalidToken = user.token + 'toInvalid';
    const channelId = channelsCreateV1(user.token, 'Pets', true).channelId;
    const message = 'test';
    standupStartV1(user.token, channelId, 1);
    expect(standupSendV1(invalidToken, channelId, message)).toStrictEqual({ errorCode: 403 });
  });

  // Invalid channelId (400)
  test('Invalid channelId', () => {
    const user = authRegisterV1('bob@gmail.com', 'password', 'bob', 'smith');
    const channelId = channelsCreateV1(user.token, 'Pets', true).channelId;
    const invalidChannelId = channelId + 1;
    const message = 'test';
    standupStartV1(user.token, channelId, 1);
    expect(standupSendV1(user.token, invalidChannelId, message)).toStrictEqual({ errorCode: 400 });
  });

  // Invalid message length (400)
  test('Invalid message length', () => {
    const user = authRegisterV1('bob@gmail.com', 'password', 'bob', 'smith');
    const channelId = channelsCreateV1(user.token, 'Pets', true).channelId;
    const invalidMessage = 'cCRayjN9vMcjiaqy2eBGaNlDNGGmVPHMjYX6lOrgDSIiJGYyBdfGa786uS3Yy0fRl3wpMJOUdAisNxw0vE7pxxzD43TH1nNlY9BZzjjkVfmmDvkwX2vSQgtu1yA8gGPYLATme0IOHJTMjISTATAsbIZr2xWEN8v2Aql5Lu9pPshb0Epz4jjId4DAkLLwevwpjnfvuF9vm0oE3DWVTvBA6Kn2gjEKy7ekDa3Lh6GXwewSubUVxuo6mkiDBN1KTUzj4cZY8lxZ3fr29l9tb5pmZMTiRokPXJqa3fZm6tFmu41NZ53fPtOu4kKL7QjkYKDZNgXZEI1SK3a4W8U4EiHa2CydRAg6ovFYTcywNim7Xf7ymO7fsnG1FTJOVc4fBjHBwaIVIjEJ0Bieq3fkYxkKTxiCC9ZZGX2yufbOZpvgwL0jtQGe7aH89KVlZgHGorQIE2xI4WAVcF1YjMlLpGejVsnjC0pzRxJxcgpI1wx2GwfV3YU1BWEadDwgf87SmicL8RvaET93ib77CODKbaZ21YWR5gDNnUkr1yeHAKEIDfdtwsHQDhMHzPmccho3fRDTYrx75ZU91w4mZOIbhdZnYs4PuRnqfjC6adzMDzwInbI1aKcgWCCCaW0zuDk6Z0KCPGUIcHoRNFlSzBQTaXNLij9I4N53iBC37CzSXtQbyi89r6zZjDVhu8Y05zUHodCUdsntQ7zNqCT5lvwxWKwBrTaLQKmyMdziweq7pBYnPTykuk9IWDWkQAepYMWCF1tltelrFV0ZjQXjoq93OzsUGcRQ8CGwzOTaLVHKZ6V9EWO3Yi7COCqCpob7LXBYEhbQi7CR9eGkUFc2V5L0A1eUWFMhnLrPLNrWYILVfft7ZV5k1psEFC8c4JaDEfBIGkTnAoCu2egNi2AYTvKdvRSmugDuGffofVa9MMYTj3z6QZpGtyT4Ev2DtOOVkqu7wDcUBYPN59G9heFXWV3QCCjXWJBerrX3DFV4IonfUaC36';
    standupStartV1(user.token, channelId, 1);
    expect(standupSendV1(user.token, channelId, invalidMessage)).toStrictEqual({ errorCode: 400 });
  });

  // Currently no active standup (400)
  test('Currently no active standup', () => {
    const user = authRegisterV1('bob@gmail.com', 'password', 'bob', 'smith');
    const channelId = channelsCreateV1(user.token, 'Pets', true).channelId;
    const message = 'test';
    expect(standupSendV1(user.token, channelId, message)).toStrictEqual({ errorCode: 400 });
  });

  // authUser is not a member (403)
  test('authUser is not a member', () => {
    const user = authRegisterV1('bob@gmail.com', 'password', 'bob', 'smith');
    const nonMember = authRegisterV1('nonMem@gmail.com', 'nomPass', 'Non', 'Smith');
    const channelId = channelsCreateV1(user.token, 'Pets', true).channelId;
    const message = 'test';
    standupStartV1(user.token, channelId, 10);
    expect(standupSendV1(nonMember.token, channelId, message)).toStrictEqual({ errorCode: 403 });
  });
});

describe('Standup Start/Active/Send Success Cases', () => {
  test('Successfully start standup, send messages and end standup', async () => {
    // Create users and add them to channel
    const user = authRegisterV1('bob@gmail.com', 'password', 'bob', 'smith');
    const messager = authRegisterV1('messager@gmail.com', 'MPassWord', 'Mess', 'Smith');
    const channelId = channelsCreateV1(user.token, 'Pets', true).channelId;
    channelJoinV1(messager.token, channelId);

    // Create 3 messages
    const message1 = 'one';
    const message2 = 'two';
    const message3 = 'three';

    // Calculate current time
    const currentTime = Math.floor((new Date()).getTime() / 1000);
    // Calculate timeFinish for the standup
    const timeFinish = currentTime + 2;

    // Start standup
    expect(standupStartV1(user.token, channelId, 2).timeFinish).not.toBeLessThan(timeFinish);
    // Run standupActive
    const return1 = standupActiveV1(user.token, channelId);
    expect(return1.isActive).toStrictEqual(true);
    expect(return1.timeFinish).not.toBeLessThan(currentTime + 2);

    // Run standupSend 3 times to send all 3 messages
    expect(standupSendV1(user.token, channelId, message1)).toStrictEqual({});
    standupSendV1(messager.token, channelId, message2);
    standupSendV1(user.token, channelId, message3);

    // Wait until timeFinish
    await new Promise((r) => setTimeout(r, 2000));

    // Run standupActive now that you reached timeFinish
    expect(standupActiveV1(user.token, channelId)).toStrictEqual({
      isActive: false,
      timeFinish: null
    });
    // Calculate packedMessage
    const bufferArray = [`bobsmith: ${message1}`, `messsmith: ${message2}`, `bobsmith: ${message3}`];
    const packedMessage = bufferArray.join('\n');
    // Expect object to look like:
    const return2 = channelMessagesV1(user.token, channelId, 0);
    expect(return2.messages[0].timeSent).not.toBeLessThan(currentTime + 2);
    expect(return2).toStrictEqual({
      messages: [
        {
          message: packedMessage,
          messageId: expect.any(Number),
          uId: user.authUserId,
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        }
      ],
      start: 0,
      end: -1
    });
  });
  test('Successfully start & end a standup', async () => {
    // Create users and add them to channel
    const user = authRegisterV1('bob@gmail.com', 'password', 'bob', 'smith');
    const messager = authRegisterV1('messager@gmail.com', 'MPassWord', 'Mess', 'Smith');
    const channelId = channelsCreateV1(user.token, 'Pets', true).channelId;
    channelJoinV1(messager.token, channelId);

    // Calculate current time
    const currentTime = Math.floor((new Date()).getTime() / 1000);
    // Calculate timeFinish for the standup
    const timeFinish = currentTime + 2;

    // Start standup
    expect(standupStartV1(user.token, channelId, 2).timeFinish).not.toBeLessThan(timeFinish);
    // Run standupActive
    const activeReturn = standupActiveV1(user.token, channelId);

    expect(activeReturn.isActive).toStrictEqual(true);
    expect(activeReturn.timeFinish).not.toBeLessThan(currentTime + 2);

    // Wait until timeFinish
    await new Promise((r) => setTimeout(r, 2000));

    // Run standupActive now that you reached timeFinish
    expect(standupActiveV1(user.token, channelId)).toStrictEqual({
      isActive: false,
      timeFinish: null
    });
  });
});
