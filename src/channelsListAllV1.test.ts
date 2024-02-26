import { authRegisterV1 } from './authRequests';
import { channelsCreateV1, channelsListAllV1 } from './channelsRequests';
import { clearV1 } from './otherRequests';

beforeEach(() => {
  clearV1();
});

describe('channelsListV2 Success Cases', () => {
  test('no channels exist', () => {
    const user = authRegisterV1('sample@gmail.com', 'samplePassword1', 'John', 'Smith').token;
    expect(channelsListAllV1(user).channels).toStrictEqual([]);
  });

  test('one public channel exists', () => {
    const user = authRegisterV1('sample@gmail.com', 'samplePassword1', 'John', 'Smith').token;
    const newChannel = channelsCreateV1(user, 'TestChannel1', true).channelId;
    expect(channelsListAllV1(user).channels).toStrictEqual([{ channelId: newChannel, name: 'TestChannel1' }]);
  });

  test('one private channel exists', () => {
    const user = authRegisterV1('sample@gmail.com', 'samplePassword1', 'John', 'Smith').token;
    const privChannel = channelsCreateV1(user, 'PrivChannel1', true).channelId;
    expect(channelsListAllV1(user).channels).toStrictEqual([{ channelId: privChannel, name: 'PrivChannel1' }]);
  });

  test('valid authUserId in multiple (two) channels', () => {
    const user = authRegisterV1('sample@gmail.com', 'samplePassword1', 'John', 'Smith').token;
    const pubChannel = channelsCreateV1(user, 'PubChannel1', true).channelId;
    const alternateUser2 = authRegisterV1('duplicate@gmail.com', 'samplePassword3', 'Krish', 'Patel').token;
    const privChannel3 = channelsCreateV1(alternateUser2, 'PrivChannel3', true).channelId;
    expect(new Set((channelsListAllV1(user).channels))).toStrictEqual(new Set([{ channelId: pubChannel, name: 'PubChannel1' }, { channelId: privChannel3, name: 'PrivChannel3' }]));
  });
});

/// //////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('channelsListV2 Error Cases', () => {
  test('invalid authUserId', () => {
    const errorUser = authRegisterV1('error@gmail.com', 'errorPassword', 'Error', 'Smith').token;
    channelsCreateV1(errorUser, 'TestChannel1', true);
    const invalidUserId = errorUser + '1';
    expect(channelsListAllV1(invalidUserId)).toStrictEqual({ errorCode: 403 });
  });
});
