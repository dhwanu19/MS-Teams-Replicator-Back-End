import { authRegisterV1 } from './authRequests';
import { clearV1 } from './otherRequests';
import { userProfileV1 } from './usersRequests';

beforeEach(() => {
  clearV1();
});

// Testing all the error cases for userProfileV1
describe('Describe userProfileV1 fail cases', () => {
  test('Test 1: authUserId is invalid', () => {
    const user = authRegisterV1('NarutoSasuke@gmail.com', '123456789', 'James', 'Sharma');
    expect(
      userProfileV1(user.token + '1', user.authUserId)
    ).toStrictEqual({ errorCode: 403 });
  });

  test('Test 2: uId is invalid', () => {
    const user = authRegisterV1('NarutoSasuke@gmail.com', '123456789', 'James', 'Sharma');
    expect(
      userProfileV1(user.token, user.authUserId + 1)
    ).toStrictEqual({ errorCode: 400 });
  });
});

// Testing success cases for userProfileV1.
describe('Describe userProfileV1 success cases', () => {
  // testing return value
  test('Test 1: Successful userId returned', () => {
    const user = authRegisterV1('NarutoSasuke@gmail.com', '123456789', 'James', 'Sharma');
    expect(
      userProfileV1(user.token, user.authUserId).user.uId
    ).toStrictEqual(user.authUserId);
  });

  test('Test 2: Successful first name returned', () => {
    const user = authRegisterV1('NarutoSasuke@gmail.com', '123456789', 'James', 'Sharma');
    expect(
      userProfileV1(user.token, user.authUserId).user.nameFirst
    ).toStrictEqual('James');
  });

  test('Test 3: Successful last name returned', () => {
    const user = authRegisterV1('NarutoSasuke@gmail.com', '123456789', 'James', 'Sharma');
    expect(
      userProfileV1(user.token, user.authUserId).user.nameLast
    ).toStrictEqual('Sharma');
  });

  test('Test 4: Successful email returned', () => {
    const user = authRegisterV1('NarutoSasuke@gmail.com', '123456789', 'James', 'Sharma');
    expect(
      userProfileV1(user.token, user.authUserId).user.email
    ).toStrictEqual('NarutoSasuke@gmail.com');
  });

  test('Test 5: Successful handle string returned', () => {
    const user = authRegisterV1('NarutoSasuke@gmail.com', '123456789', 'James', 'Sharma');
    expect(
      userProfileV1(user.token, user.authUserId).user.handleStr
    ).toStrictEqual('jamessharma');
  });

  test('Test 6: Successful profileImgUrl returned', () => {
    const user = authRegisterV1('NarutoSasuke@gmail.com', '123456789', 'James', 'Sharma');
    expect(
      userProfileV1(user.token, user.authUserId).user.profileImgUrl
    ).toStrictEqual(expect.any(String));
  });
});
