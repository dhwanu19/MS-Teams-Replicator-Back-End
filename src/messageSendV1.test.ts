import { authRegisterV1 } from './authRequests';
import { channelsCreateV1 } from './channelsRequests';
import { messageSendV1 } from './messageRequests';
import { clearV1 } from './otherRequests';

beforeEach(() => {
  clearV1();
});

// Success cases:
// - 1 character edge case
// - 1000 character edge case
// - normal message length

describe('Success Tests', () => {
  test('Message of length 1 character => messageId', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
    const channelId = channelsCreateV1(token, 'General', true).channelId;
    const message = '1';
    expect(messageSendV1(token, channelId, message)).toStrictEqual({ messageId: expect.any(Number) });
  });
  test('Message of length 1000 characters => messageId', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
    const channelId = channelsCreateV1(token, 'General', true).channelId;
    const message = 'cCRayjN9vMcjiaqy2eBGaNlDNGGmVPHMjYX6lOrgDSIiJGYyBdfGa786uS3Yy0fRl3wpMJOUdAisNxw0vE7pxxzD43TH1nNlY9BZzjjkVfmmDvkwX2vSQgtu1yA8gGPYLATme0IOHJTMjISTATAsbIZr2xWEN8v2Aql5Lu9pPshb0Epz4jjId4DAkLLwevwpjnfvuF9vm0oE3DWVTvBA6Kn2gjEKy7ekDa3Lh6GXwewSubUVxuo6mkiDBN1KTUzj4cZY8lxZ3fr29l9tb5pmZMTiRokPXJqa3fZm6tFmu41NZ53fPtOu4kKL7QjkYKDZNgXZEI1SK3a4W8U4EiHa2CydRAg6ovFYTcywNim7Xf7ymO7fsnG1FTJOVc4fBjHBwaIVIjEJ0Bieq3fkYxkKTxiCC9ZZGX2yufbOZpvgwL0jtQGe7aH89KVlZgHGorQIE2xI4WAVcF1YjMlLpGejVsnjC0pzRxJxcgpI1wx2GwfV3YU1BWEadDwgf87SmicL8RvaET93ib77CODKbaZ21YWR5gDNnUkr1yeHAKEIDfdtwsHQDhMHzPmccho3fRDTYrx75ZU91w4mZOIbhdZnYs4PuRnqfjC6adzMDzwInbI1aKcgWCCCaW0zuDk6Z0KCPGUIcHoRNFlSzBQTaXNLij9I4N53iBC37CzSXtQbyi89r6zZjDVhu8Y05zUHodCUdsntQ7zNqCT5lvwxWKwBrTaLQKmyMdziweq7pBYnPTykuk9IWDWkQAepYMWCF1tltelrFV0ZjQXjoq93OzsUGcRQ8CGwzOTaLVHKZ6V9EWO3Yi7COCqCpob7LXBYEhbQi7CR9eGkUFc2V5L0A1eUWFMhnLrPLNrWYILVfft7ZV5k1psEFC8c4JaDEfBIGkTnAoCu2egNi2AYTvKdvRSmugDuGffofVa9MMYTj3z6QZpGtyT4Ev2DtOOVkqu7wDcUBYPN59G9heFXWV3QCCjXWJBerrX3DFV4IonfUaC3';
    expect(messageSendV1(token, channelId, message)).toStrictEqual({ messageId: expect.any(Number) });
  });
  test('Message of normal length => messageId', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
    channelsCreateV1(token, 'Other Channel', false);
    const channelId = channelsCreateV1(token, 'General', true).channelId;
    const message = 'When the washing machine is broken XDXDXD';
    expect(messageSendV1(token, channelId, message)).toStrictEqual({ messageId: expect.any(Number) });
  });
});

// Error cases:
// - token is invalid
// - channelId is not valid
// - length of message is less than 1 or over 1000 characters
// - channelId is valid but authorised user is not part of the channel

describe('Error Tests', () => {
  test('Invalid token => error', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
    const channelId = channelsCreateV1(token, 'General', true).channelId;
    const invalidToken = token + '1';
    expect(messageSendV1(invalidToken, channelId, 'Message!')).toStrictEqual({ errorCode: 403 });
  });
  test('Invalid channelId => error', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
    const invalidChannelId = 1234;
    expect(messageSendV1(token, invalidChannelId, 'Message!')).toStrictEqual({ errorCode: 400 });
  });
  test('Message length < 1 => error', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
    const channelId = channelsCreateV1(token, 'General', true).channelId;
    expect(messageSendV1(token, channelId, '')).toStrictEqual({ errorCode: 400 });
  });
  test('Message length > 1000 => error', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
    const channelId = channelsCreateV1(token, 'General', true).channelId;
    const message = 'cCRayjN9vMcjiaqy2eBGaNlDNGGmVPHMjYX6lOrgDSIiJGYyBdfGa786uS3Yy0fRl3wpMJOUdAisNxw0vE7pxxzD43TH1nNlY9BZzjjkVfmmDvkwX2vSQgtu1yA8gGPYLATme0IOHJTMjISTATAsbIZr2xWEN8v2Aql5Lu9pPshb0Epz4jjId4DAkLLwevwpjnfvuF9vm0oE3DWVTvBA6Kn2gjEKy7ekDa3Lh6GXwewSubUVxuo6mkiDBN1KTUzj4cZY8lxZ3fr29l9tb5pmZMTiRokPXJqa3fZm6tFmu41NZ53fPtOu4kKL7QjkYKDZNgXZEI1SK3a4W8U4EiHa2CydRAg6ovFYTcywNim7Xf7ymO7fsnG1FTJOVc4fBjHBwaIVIjEJ0Bieq3fkYxkKTxiCC9ZZGX2yufbOZpvgwL0jtQGe7aH89KVlZgHGorQIE2xI4WAVcF1YjMlLpGejVsnjC0pzRxJxcgpI1wx2GwfV3YU1BWEadDwgf87SmicL8RvaET93ib77CODKbaZ21YWR5gDNnUkr1yeHAKEIDfdtwsHQDhMHzPmccho3fRDTYrx75ZU91w4mZOIbhdZnYs4PuRnqfjC6adzMDzwInbI1aKcgWCCCaW0zuDk6Z0KCPGUIcHoRNFlSzBQTaXNLij9I4N53iBC37CzSXtQbyi89r6zZjDVhu8Y05zUHodCUdsntQ7zNqCT5lvwxWKwBrTaLQKmyMdziweq7pBYnPTykuk9IWDWkQAepYMWCF1tltelrFV0ZjQXjoq93OzsUGcRQ8CGwzOTaLVHKZ6V9EWO3Yi7COCqCpob7LXBYEhbQi7CR9eGkUFc2V5L0A1eUWFMhnLrPLNrWYILVfft7ZV5k1psEFC8c4JaDEfBIGkTnAoCu2egNi2AYTvKdvRSmugDuGffofVa9MMYTj3z6QZpGtyT4Ev2DtOOVkqu7wDcUBYPN59G9heFXWV3QCCjXWJBerrX3DFV4IonfUaC36';
    expect(messageSendV1(token, channelId, message)).toStrictEqual({ errorCode: 400 });
  });
  test('Authorised user not part of channel => error', () => {
    const token = authRegisterV1('test@gmail.com', 'Password', 'Bill', 'Gates').token;
    const channelId = channelsCreateV1(token, 'General', true).channelId;
    const invalidToken = authRegisterV1('other@gmail.com', 'Password', 'Bob', 'Thebuilder').token;
    expect(messageSendV1(invalidToken, channelId, 'Message!')).toStrictEqual({ errorCode: 403 });
  });
});
