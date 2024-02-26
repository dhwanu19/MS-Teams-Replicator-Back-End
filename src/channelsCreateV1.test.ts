// dataStore functions imported so that channels can be registered in channelsCreateV1.
import { channelsCreateV1 } from './channelsRequests';
import { authRegisterV1 } from './authRequests';
import { clearV1 } from './otherRequests';
import { channelDetailsV1 } from './channelRequests';

// Reseting dataStore for each test
beforeEach(() => {
  clearV1();
});

// Testing all the error cases for ChannelsCreatveV1.
describe('Describe channelsCreateV1 fail cases', () => {
  test('Test 1: token is invalid', () => {
    const token = authRegisterV1('NarutoSasuke@gmail.com', '123456789', 'James', 'Sharma').token;
    expect(
      channelsCreateV1(token + '1', 'Laptop', true)
    ).toStrictEqual({ errorCode: 403 });
  });

  test('Test 2: Empty channel name inserted', () => {
    const token = authRegisterV1('NarutoSasuke@gmail.com', '123456789', 'James', 'Sharma').token;
    expect(
      channelsCreateV1(token, '', true)
    ).toStrictEqual({ errorCode: 400 });
  });

  test('Test 3: Length of channel name is too long', () => {
    const token = authRegisterV1('NarutoSasuke@gmail.com', '123456789', 'James', 'Sharma').token;
    expect(
      channelsCreateV1(token, '123456789012345678901', true)
    ).toStrictEqual({ errorCode: 400 });
  });
});

// Testing success cases for ChannelsCreateV1.
describe('Describe channelsCreateV1 success cases', () => {
  // testing return value
  test('Test 1: Successful return value checker', () => {
    const token = authRegisterV1('NarutoSasuke@gmail.com', '123456789', 'James', 'Sharma').token;
    expect(
      channelsCreateV1(token, 'channelName', true)
    ).toStrictEqual(
      {
        channelId: expect.any(Number)
      }
    );
  });

  // testing unique channelId created
  test('Test 2: checking if new channelId is unique', () => {
    const token = authRegisterV1('lachlangilroy@gmail.com', 'randoPassword', 'Lachlan', 'Gilroy').token;
    const channel1Id = channelsCreateV1(token, 'this name', true).channelId;
    const channel2Id = channelsCreateV1(token, 'channelName', true).channelId;
    expect(channel1Id === channel2Id).toEqual(false);
  });

  // testing isPublic = true
  test('Test 3: is public', () => {
    const token = authRegisterV1('NarutoSasuke@gmail.com', '123456789', 'James', 'Sharma').token;
    const channelId = channelsCreateV1(token, 'this name', true).channelId;
    expect(channelDetailsV1(token, channelId).isPublic).toStrictEqual(true);
  });

  // testing isPublic = false
  test('Test 4: is not public', () => {
    const token = authRegisterV1('NarutoSasuke@gmail.com', '123456789', 'James', 'Sharma').token;
    const channel1Id = channelsCreateV1(token, 'this name', false).channelId;
    expect(channelDetailsV1(token, channel1Id).isPublic).toStrictEqual(false);
  });

  // testing channel name
  test('Test 5: correct name', () => {
    const token = authRegisterV1('NarutoSasuke@gmail.com', '123456789', 'James', 'Sharma').token;
    const channel1Id = channelsCreateV1(token, 'this name', false).channelId;
    expect(channelDetailsV1(token, channel1Id).name).toStrictEqual('this name');
  });

  // testing ownerMembers
  test('Test 6: ownerMembers returned', () => {
    const newUser = authRegisterV1('NarutoSasuke@gmail.com', '123456789', 'James', 'Sharma');
    const token = newUser.token;
    const userId = newUser.authUserId;
    const channel1Id = channelsCreateV1(token, 'this name', true).channelId;
    const details = channelDetailsV1(token, channel1Id);
    expect(details.ownerMembers[0].uId).toStrictEqual(userId);
  });

  // testing allMembers
  test('Test 7: allMembers returned', () => {
    const newUser = authRegisterV1('NarutoSasuke@gmail.com', '123456789', 'James', 'Sharma');
    const token = newUser.token;
    const userId = newUser.authUserId;
    const channel1Id = channelsCreateV1(token, 'this name', true).channelId;
    const details = channelDetailsV1(token, channel1Id);
    expect(details.allMembers[0].uId).toStrictEqual(userId);
  });
});
