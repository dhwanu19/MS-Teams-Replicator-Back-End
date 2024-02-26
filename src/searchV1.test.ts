import { searchV1 } from './searchRequests';
import { channelsCreateV1 } from './channelsRequests';
import { dmCreateV1 } from './dmRequests';
import { messageSendV1, messageSendDmV1 } from './messageRequests';
import { authRegisterV1 } from './authRequests';
import { clearV1 } from './otherRequests';

interface Reacts {
  reactId: number,
  uIds: number[],
  isThisUserReacted: boolean
}

beforeEach(() => {
  clearV1();
});

describe('Success Tests', () => {
  test('Search across dms and channels', () => {
    const user = authRegisterV1('some@email.com', 'password', 'First', 'Last');
    const token = user.token;
    const userId = user.authUserId;
    const queryStr = 'Message';
    const channelId = channelsCreateV1(token, 'Channel', true).channelId;
    const dmId = dmCreateV1(token, []).dmId;
    const channelMsgId = messageSendV1(token, channelId, 'Channel Message').messageId;
    const dmMsgId = messageSendDmV1(token, dmId, 'Dm Message').messageId;
    const react: Reacts[] = [];
    const messages = [
      {
        messageId: channelMsgId,
        uId: userId,
        message: 'Channel Message',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      },
      {
        messageId: dmMsgId,
        uId: userId,
        message: 'Dm Message',
        timeSent: expect.any(Number),
        reacts: react,
        isPinned: false
      }
    ];
    expect(searchV1(token, queryStr)).toStrictEqual(messages);
  });
  test('Search across multiple message', () => {
    const user = authRegisterV1('some@email.com', 'password', 'First', 'Last');
    const token = user.token;
    const userId = user.authUserId;
    const queryStr = 'Message';
    const channelId = channelsCreateV1(token, 'Channel', true).channelId;
    messageSendV1(token, channelId, 'First!');
    const channelMsgId = messageSendV1(token, channelId, 'Search Message').messageId;
    messageSendV1(token, channelId, 'Third!');
    const react: Reacts[] = [];
    const messages = [
      {
        messageId: channelMsgId,
        uId: userId,
        message: 'Search Message',
        timeSent: expect.any(Number),
        reacts: react,
        isPinned: false
      }
    ];
    expect(searchV1(token, queryStr)).toStrictEqual(messages);
  });
});

describe('Error Tests', () => {
  test('invalid token', () => {
    const str = 'some string';
    expect(searchV1('', str)).toStrictEqual({ errorCode: 403 });
  });
  test('queryStr length < 1', () => {
    const token = authRegisterV1('some@email.com', 'password', 'First', 'Last').token;
    const str = '';
    expect(searchV1(token, str)).toStrictEqual({ errorCode: 400 });
  });
  test('queryStr length > 1000', () => {
    const token = authRegisterV1('some@email.com', 'password', 'First', 'Last').token;
    const str = '7fwd9hKoNiZ6mSjQ3hxwHWnRcNMlNd77JJpsO67!CphDoCF2qra$E5BE!Ir5UG9uYdSVbu1pYBk#ls7K@RCNHV$Bnux2j9C!rDsRyQMpeDmp9MQSbmk@0HhIJsTMRNjDJs56PPGqw$spoQI1BPRAuKfdq!5Wn3XZ71HdvOq7eZCalh4364$E5feFmU4DiMeaWb3yM60i#8UnEPsjkc1oZExAltopgibrzzaG9qEma7@JShffH1y!7A$a3Zjri345vA8Qe$OBx9#7zy2DVs7vttpp!aSkWwgyulg@G!AuXKCA$E8ysi4uUw!$lr!lkl82MvweZml3h$Ut9ff52DeqKbnEIs4Fo9iza1JwJ5BfGEZS#d!@w$DRSe9$PMlU!o9WjkXXQPbqNt4CRy9Uu0J@8W#bwjBTTsFcCGSdrLk1c7SpR4ykeRq3YFR6$nKrpReufXfKThi80cXf$6xX7NQaz9xNjjZ2xySQP3#A7PWvhLfev0KGWlz03lR2YhC$rwVp0BzmHbk1MtdPOMDzf2mQUOqHFUs#SEitUA@6nlewE$g1QMr$bodXx$0qUof9OTPH276knPJA@OrjwodtJq1cKPP0hapATQRk!ki8VyqLhmbVbocwJtEELLIUItF6#Y6#n7qMo2@FhlXeFgvTOsrpmiPXT1gxBM9!ehBZU3ds3G@TR3zUA4nGuIEC4Q3VxawfQXaEPkZAMvR15GcjrqLra5Gk3IZw5y5@StG8SB$N8sx7sWqkI1nPwAdXOdCihaOa65bo9E@HOm6I0jB0cATWyuoobrGlJLaL#!mPtyseCv0GUR9b91pzKNpJ1xL@XLe6yxaS77K9g1jOdCBNhla$5!mheEEGz$mCfdJiWszXCLY1ywy3$pRGbGUBZB7vj3FjY3PD6t4oBH$0oo#e5U76BViwobJ0p#f76Cp0ejH9r9pJQaIgBg#!mhQk3WJHvsKn@fkESTusd#5@9L33XDd23WnZzH$O$cGy$wYbKzQ30';
    expect(searchV1(token, str)).toStrictEqual({ errorCode: 400 });
  });
});
