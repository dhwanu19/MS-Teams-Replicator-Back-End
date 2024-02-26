import { authRegisterV1 } from './authRequests';
import { channelsCreateV1, channelsListV1 } from './channelsRequests';
import { clearV1 } from './otherRequests';

beforeEach(() => {
  clearV1();
});

describe('channelsListV1 Success Cases', () => {
  // run channelsListV1 using a user that is in no channels.
  test('valid token in no channels', () => {
    const user = authRegisterV1('sample@gmail.com', 'samplePassword1', 'John', 'Smith').token;
    channelsCreateV1(user, 'TestChannel1', true);
    const alternateUser = authRegisterV1('email@gmail.com', 'samplePassword2', 'Emily', 'Lai').token;
    expect(channelsListV1(alternateUser).channels).toStrictEqual([]);
  });

  // run channelsListV1 using a user that is in a single channel
  test('valid token in one channel', () => {
    const user = authRegisterV1('sample@gmail.com', 'samplePassword1', 'John', 'Smith').token;
    const newChannel = channelsCreateV1(user, 'TestChannel1', true).channelId;
    expect(channelsListV1(user).channels).toStrictEqual([{ channelId: newChannel, name: 'TestChannel1' }]);
  });

  // run channelsListV1 using a user that is in two channels
  test('valid token in multiple (two) channels', () => {
    const user = authRegisterV1('sample@gmail.com', 'samplePassword1', 'John', 'Smith').token;
    const newChannel = channelsCreateV1(user, 'TestChannel1', true).channelId;
    const newChannel2 = channelsCreateV1(user, 'TestChannel2', true).channelId;
    expect(new Set((channelsListV1(user).channels))).toStrictEqual(new Set([{ channelId: newChannel, name: 'TestChannel1' }, { channelId: newChannel2, name: 'TestChannel2' }]));
  });

  // run channelsListV1 using a user that is in a specific channel but not in another specific channel
  test('valid token in one of two channels', () => {
    const user = authRegisterV1('sample@gmail.com', 'samplePassword1', 'John', 'Smith').token;
    channelsCreateV1(user, 'TestChannel1', true);
    const alternateUser2 = authRegisterV1('duplicate@gmail.com', 'samplePassword3', 'Krish', 'Patel').token;
    const newChannel3 = channelsCreateV1(alternateUser2, 'TestChannel3', true).channelId;
    expect(channelsListV1(alternateUser2).channels).toStrictEqual([{ channelId: newChannel3, name: 'TestChannel3' }]);
  });
});

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////////

// runrun channelsListV1 using an invalid user
describe('channelsListV1 Error Cases', () => {
  test('invalid authUserId', () => {
    const errorUser = authRegisterV1('error@gmail.com', 'errorPassword', 'Error', 'Smith').token;
    channelsCreateV1(errorUser, 'TestChannel1', true);
    const invalidUserId = errorUser + '1';
    expect(channelsListV1(invalidUserId)).toStrictEqual({ errorCode: 403 });
  });
});
