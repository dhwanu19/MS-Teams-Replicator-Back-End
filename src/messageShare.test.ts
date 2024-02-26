import { clearV1 } from './otherRequests';
import { authRegisterV1 } from './authRequests';
import { channelsCreateV1 } from './channelsRequests';
import { channelJoinV1 } from './channelRequests';
import { dmCreateV1 } from './dmRequests';
import { searchV1 } from './searchRequests';
import { messageSendV1, messageSendDmV1, messageShare } from './messageRequests';

beforeAll(() => {
  clearV1();
});

afterEach(() => {
  clearV1();
});

describe('Success Tests', () => {
  test('ogMessage in a channel', () => {
    const ogUser = authRegisterV1('someemail@gmail.com', 'password', 'first', 'last');
    const ogChannelId = channelsCreateV1(ogUser.token, 'OG Channel', true).channelId;
    const ogMessageId = messageSendV1(ogUser.token, ogChannelId, 'ogMessage').messageId;
    const shareUser = authRegisterV1('share@gmail.com', 'password', 'share', 'name');
    channelJoinV1(shareUser.token, ogChannelId);
    const shareChannelId = channelsCreateV1(shareUser.token, 'Share channel', true).channelId;
    const shareDmId = dmCreateV1(shareUser.token, []).dmId;
    // Share to channel
    let shareMessage = messageShare(shareUser.token, ogMessageId, '', shareChannelId, -1);
    expect(shareMessage).toStrictEqual({ sharedMessageId: expect.any(Number) });
    // Share to dm
    shareMessage = messageShare(shareUser.token, ogMessageId, '', -1, shareDmId);
    expect(shareMessage).toStrictEqual({ sharedMessageId: expect.any(Number) });
  });
  test('ogMessage in a dm', () => {
    const ogUser = authRegisterV1('someemail@gmail.com', 'password', 'first', 'last');
    const shareUser = authRegisterV1('share@gmail.com', 'password', 'share', 'name');
    const ogDmId = dmCreateV1(ogUser.token, [shareUser.authUserId]).dmId;
    const ogMessageId = messageSendDmV1(ogUser.token, ogDmId, 'ogMessage').messageId;
    const shareChannelId = channelsCreateV1(shareUser.token, 'Share channel', true).channelId;
    const shareDmId = dmCreateV1(shareUser.token, []).dmId;
    // Share to channel
    let shareMessage = messageShare(shareUser.token, ogMessageId, '', shareChannelId, -1);
    expect(shareMessage).toStrictEqual({ sharedMessageId: expect.any(Number) });
    // Share to dm
    shareMessage = messageShare(shareUser.token, ogMessageId, '', -1, shareDmId);
    expect(shareMessage).toStrictEqual({ sharedMessageId: expect.any(Number) });
  });
  test('Shared messages contain substrings of ogMessage and optional message', () => {
    const ogUser = authRegisterV1('someemail@gmail.com', 'password', 'first', 'last');
    const ogChannelId = channelsCreateV1(ogUser.token, 'OG Channel', true).channelId;
    const ogMessage = 'So original';
    const optionalMessage = 'Optional';
    const ogMessageId = messageSendV1(ogUser.token, ogChannelId, ogMessage).messageId;
    const shareUser = authRegisterV1('share@gmail.com', 'password', 'share', 'name');
    channelJoinV1(shareUser.token, ogChannelId);
    const shareChannelId = channelsCreateV1(shareUser.token, 'Share channel', true).channelId;
    const shareDmId = dmCreateV1(shareUser.token, []).dmId;
    messageShare(shareUser.token, ogMessageId, optionalMessage, shareChannelId, -1);
    messageShare(shareUser.token, ogMessageId, optionalMessage, -1, shareDmId);
    expect(searchV1(shareUser.token, ogMessage).length).toStrictEqual(3);
    expect(searchV1(shareUser.token, optionalMessage).length).toStrictEqual(2);
  });
});
describe('Error Tests', () => {
  test('Token is invalid', () => {
    const ogUser = authRegisterV1('someemail@gmail.com', 'password', 'first', 'last');
    const ogChannelId = channelsCreateV1(ogUser.token, 'OG Channel', true).channelId;
    const ogMessageId = messageSendV1(ogUser.token, ogChannelId, 'Og Message!').messageId;
    const shareUser = authRegisterV1('share@gmail.com', 'password', 'share', 'name');
    const shareChannelId = channelsCreateV1(shareUser.token, 'Share channel', true).channelId;
    channelJoinV1(shareUser.token, ogChannelId);
    const shareMessage = messageShare(shareUser.token + 'invalid token', ogMessageId, '', shareChannelId, -1);
    expect(shareMessage).toStrictEqual({ errorCode: 403 });
  });
  test('Both channelId and dmId are invalid', () => {
    const ogUser = authRegisterV1('someemail@gmail.com', 'password', 'first', 'last');
    const ogChannelId = channelsCreateV1(ogUser.token, 'OG Channel', true).channelId;
    const ogMessageId = messageSendV1(ogUser.token, ogChannelId, 'Og Message!').messageId;
    const shareUser = authRegisterV1('share@gmail.com', 'password', 'share', 'name');
    channelJoinV1(shareUser.token, ogChannelId);
    const shareMessage = messageShare(shareUser.token, ogMessageId, '', -1, -1);
    expect(shareMessage).toStrictEqual({ errorCode: 400 });
  });
  test('Neither channelId or dmId is -1', () => {
    const ogUser = authRegisterV1('someemail@gmail.com', 'password', 'first', 'last');
    const shareUser = authRegisterV1('share@gmail.com', 'password', 'share', 'name');
    const ogDmId = dmCreateV1(ogUser.token, [shareUser.authUserId]).dmId;
    const ogMessageId = messageSendDmV1(ogUser.token, ogDmId, 'Og Message!').messageId;
    const shareChannelId = channelsCreateV1(shareUser.token, 'Share channel', true).channelId;
    const shareDmId = dmCreateV1(shareUser.token, []).dmId;
    const shareMessage = messageShare(shareUser.token, ogMessageId, '', shareChannelId, shareDmId);
    expect(shareMessage).toStrictEqual({ errorCode: 400 });
  });
  test('ogMessageId is not a valid message in channel/dm user has joined', () => {
    const ogUser = authRegisterV1('someemail@gmail.com', 'password', 'first', 'last');
    const ogChannelId = channelsCreateV1(ogUser.token, 'OG Channel', true).channelId;
    const ogMessageId = messageSendV1(ogUser.token, ogChannelId, 'Og Message!').messageId;
    const shareUser = authRegisterV1('share@gmail.com', 'password', 'share', 'name');
    const shareDmId = dmCreateV1(shareUser.token, []).dmId;
    const shareMessage = messageShare(shareUser.token, ogMessageId, '', -1, shareDmId);
    expect(shareMessage).toStrictEqual({ errorCode: 400 });
  });
  test('Length of optional message is > 1000 characters', () => {
    const ogUser = authRegisterV1('someemail@gmail.com', 'password', 'first', 'last');
    const ogChannelId = channelsCreateV1(ogUser.token, 'OG Channel', true).channelId;
    const ogMessageId = messageSendV1(ogUser.token, ogChannelId, 'Og Message!').messageId;
    const shareUser = authRegisterV1('share@gmail.com', 'password', 'share', 'name');
    const shareChannelId = channelsCreateV1(shareUser.token, 'Share channel', true).channelId;
    channelJoinV1(shareUser.token, ogChannelId);
    const msg = 'x6L3AR7I1ox7EdCYiLTLKaBDOg5eEB5KSsY7A7oVfQsawAlviPgOzjCiGAUQbJotwkfRceVlJ2aJENnxBBqhaN9jRJ0k4kIyfoZanrrNnfwiniQiP1lwKhlpXuQtXsKmYMPiuNLlx4NNhMgVxggCdBXR4YOvKwn4vjKtcRJ0f3AtVy7xwm4vBAobSyg9bZdSyO4SHW1ZGjUhNu0fWyl5Q0gmh1JXW21EoVSD9r7fboC2JCw8ZD4vim2ocCpFhvsVvPDklkB0XlPH59PwpdIHLmS5Go02UD2kvgFLM4ujlCr2Ywp1iionycxW5AtRvDvwGGDudoPodrC5ZN0IsxbwgjY3MNAcH6IUID2WywlL4bfQU29yEzGS2wIriLHHlAwHCI6uuDYGpJ3fmwHyKcTpyH6xFhS00Vbxwo1jPvmmQNkOImjmMZmuzBJUNiSRC7NUFyrmsUJCkFlPElfRSvv0GuCMzrZsNuZZ01StQXRQ0oh5HlDoBa9N1WIrTl6T6JfyrSEM3deRiJWPSBPHC5ygcmvzs52fAV7Sbfcv43Wx8G7jznx4FIsJYs96eiKa2GgzSIketayWR9cYJJ7kdwgjLrvzBacrOcLQ70jizC4hM9CjiNXPdgCyI5LtO5WsYLn3E6ijzsNExIGalk76xSIFTvkJRuzaWL0dMAxJMEttt9X7pusQNCzT0pQyQ62KfFA4lSZ8FzpPLRDtmkRzEwSG9MhrPF1Ls0aCK0m59cTJcVWexVuiG6LqMABGMF8cb6p9CIxWvKC3Fi6eizrocXZi9hoGArbgnPyLpTrazzfiDUDmm55nyf9iTBm8eU25PnJUchPTPHXmjRd66kcKWhNz4BR6Ua4jyOSZ9G9QtivksdbXZQ4VR7EhFniapqPLkQNPy1gW3fea6mK5skBfWvcA1ih1VcPQ1Fva7ruEjjTF40DyzWro5A20k6n3qCzY5gIsiRfXxi5FQk6VIk1wRiRKx9TxWshg1w3CUFEtfbhc3';
    const shareMessage = messageShare(shareUser.token, ogMessageId, msg, shareChannelId, -1);
    expect(shareMessage).toStrictEqual({ errorCode: 400 });
  });
  test('Channel + Dm valid but user is not in them', () => {
    const ogUser = authRegisterV1('someemail@gmail.com', 'password', 'first', 'last');
    const shareUser = authRegisterV1('share@gmail.com', 'password', 'share', 'name');
    const ogChannelId = channelsCreateV1(ogUser.token, 'OG Channel', true).channelId;
    const ogMessageId = messageSendV1(ogUser.token, ogChannelId, 'Og Message!').messageId;
    const invalidShareChannelId = channelsCreateV1(ogUser.token, 'Share channel', true).channelId;
    const invalidShareDmId = dmCreateV1(ogUser.token, []).dmId;
    channelJoinV1(shareUser.token, ogChannelId);
    // Not in Dm
    let shareMessage = messageShare(shareUser.token, ogMessageId, '', invalidShareChannelId, -1);
    expect(shareMessage).toStrictEqual({ errorCode: 403 });
    // Not in channel
    shareMessage = messageShare(shareUser.token, ogMessageId, '', -1, invalidShareDmId);
    expect(shareMessage).toStrictEqual({ errorCode: 403 });
  });
});
