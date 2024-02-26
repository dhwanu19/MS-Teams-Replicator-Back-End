import { authRegisterV1 } from './authRequests';
import { channelsCreateV1 } from './channelsRequests';
import { channelMessagesV1 } from './channelRequests';
import { messageSendLaterV1 } from './messageRequests';
import { clearV1 } from './otherRequests';

beforeEach(() => {
  clearV1();
});

describe('MessageSendLater Error Cases', () => {
  test('Invalid token => error', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
    const invalidToken = token + '1';
    const timeSend = Math.floor((new Date()).getTime() / 1000) + 2;
    expect(messageSendLaterV1(invalidToken, 1234, 'Message!', timeSend)).toStrictEqual({ errorCode: 403 });
  });
  test('Invalid channelId => error', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
    const invalidChannelId = 1234;
    const timeSend = Math.floor((new Date()).getTime() / 1000) + 2;
    expect(messageSendLaterV1(token, invalidChannelId, 'Message!', timeSend)).toStrictEqual({ errorCode: 400 });
  });
  test('Message length < 1 => error', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
    const channelId = channelsCreateV1(token, 'General', true).channelId;
    const timeSend = Math.floor((new Date()).getTime() / 1000) + 2;
    expect(messageSendLaterV1(token, channelId, '', timeSend)).toStrictEqual({ errorCode: 400 });
  });
  test('Message length > 1000 => error', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
    const channelId = channelsCreateV1(token, 'General', true).channelId;
    const message = 'cCRayjN9vMcjiaqy2eBGaNlDNGGmVPHMjYX6lOrgDSIiJGYyBdfGa786uS3Yy0fRl3wpMJOUdAisNxw0vE7pxxzD43TH1nNlY9BZzjjkVfmmDvkwX2vSQgtu1yA8gGPYLATme0IOHJTMjISTATAsbIZr2xWEN8v2Aql5Lu9pPshb0Epz4jjId4DAkLLwevwpjnfvuF9vm0oE3DWVTvBA6Kn2gjEKy7ekDa3Lh6GXwewSubUVxuo6mkiDBN1KTUzj4cZY8lxZ3fr29l9tb5pmZMTiRokPXJqa3fZm6tFmu41NZ53fPtOu4kKL7QjkYKDZNgXZEI1SK3a4W8U4EiHa2CydRAg6ovFYTcywNim7Xf7ymO7fsnG1FTJOVc4fBjHBwaIVIjEJ0Bieq3fkYxkKTxiCC9ZZGX2yufbOZpvgwL0jtQGe7aH89KVlZgHGorQIE2xI4WAVcF1YjMlLpGejVsnjC0pzRxJxcgpI1wx2GwfV3YU1BWEadDwgf87SmicL8RvaET93ib77CODKbaZ21YWR5gDNnUkr1yeHAKEIDfdtwsHQDhMHzPmccho3fRDTYrx75ZU91w4mZOIbhdZnYs4PuRnqfjC6adzMDzwInbI1aKcgWCCCaW0zuDk6Z0KCPGUIcHoRNFlSzBQTaXNLij9I4N53iBC37CzSXtQbyi89r6zZjDVhu8Y05zUHodCUdsntQ7zNqCT5lvwxWKwBrTaLQKmyMdziweq7pBYnPTykuk9IWDWkQAepYMWCF1tltelrFV0ZjQXjoq93OzsUGcRQ8CGwzOTaLVHKZ6V9EWO3Yi7COCqCpob7LXBYEhbQi7CR9eGkUFc2V5L0A1eUWFMhnLrPLNrWYILVfft7ZV5k1psEFC8c4JaDEfBIGkTnAoCu2egNi2AYTvKdvRSmugDuGffofVa9MMYTj3z6QZpGtyT4Ev2DtOOVkqu7wDcUBYPN59G9heFXWV3QCCjXWJBerrX3DFV4IonfUaC36';
    const timeSend = Math.floor((new Date()).getTime() / 1000) + 2;
    expect(messageSendLaterV1(token, channelId, message, timeSend)).toStrictEqual({ errorCode: 400 });
  });
  test('TimeSent is in the past', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
    const channelId = channelsCreateV1(token, 'General', true).channelId;
    const timeSend = Math.floor((new Date()).getTime() / 1000) - 2;
    expect(messageSendLaterV1(token, channelId, 'Message!', timeSend)).toStrictEqual({ errorCode: 400 });
  });
  test('Authorised user not part of channel => error', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
    const channelId = channelsCreateV1(token, 'General', true).channelId;
    const invalidToken = authRegisterV1('other@gmail.com', 'Password', 'Bob', 'Thebuilder').token;
    const timeSend = Math.floor((new Date()).getTime() / 1000) + 2;
    expect(messageSendLaterV1(invalidToken, channelId, 'Message!', timeSend)).toStrictEqual({ errorCode: 403 });
  });
});

describe('MessageSendLaterV1 Success Cases', () => {
  test('Message successfully sends at timeSend', async () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates');
    const channelId = channelsCreateV1(token.token, 'General', true).channelId;
    const message = 'testMessage';
    const timeSend = Math.floor((new Date()).getTime() / 1000) + 2;
    const messageId = messageSendLaterV1(token.token, channelId, message, timeSend).messageId;

    expect(channelMessagesV1(token.token, channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1
    });

    await new Promise((r) => setTimeout(r, 2000));
    const returnVal = channelMessagesV1(token.token, channelId, 0);
    expect(returnVal.messages[0].timeSent).not.toBeLessThan(timeSend);
    expect(returnVal).toStrictEqual({
      messages: [
        {
          message: 'testMessage',
          messageId: messageId,
          timeSent: expect.any(Number),
          uId: token.authUserId,
          reacts: [],
          isPinned: false
        }
      ],
      start: 0,
      end: -1
    });
  });
});
