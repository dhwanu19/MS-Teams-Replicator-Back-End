import { authRegisterV1 } from './authRequests';
import { userProfileV1, usersAllV1 } from './usersRequests';
import { clearV1 } from './otherRequests';

beforeEach(() => {
  clearV1();
});

// Set of unsuccessful cases.
describe('Error cases UsersAllV1', () => {
  // Error test when token entered is invalid.
  test('Invalid token', () => {
    const usertoken = authRegisterV1('NarutoSasuke@gmail.com', 'Narutopassword', 'Naruto', 'Uzumaki').token;
    expect(usersAllV1(usertoken + '1')).toStrictEqual({ errorCode: 403 });
  });
});

// Set of successful cases.
describe('Success cases UsersAllV1', () => {
  // Success test where the program returns a single user.
  test('Single user', () => {
    const usertoken = authRegisterV1('NarutoSasuke@gmail.com', '123456789', 'James', 'Sharma');
    const user = userProfileV1(usertoken.token, usertoken.authUserId).user;
    expect(usersAllV1(usertoken.token)).toStrictEqual({
      users: [
        {
          uId: user.uId,
          email: user.email,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          handleStr: user.handleStr,
          profileImgUrl: expect.any(String)
        }
      ]
    });
  });

  // Success test where the program returns multiple users.
  test('Multiple users', () => {
    const usertoken1 = authRegisterV1('NarutoSasuke@gmail.com', 'password7', 'Naruto', 'Uzumaki');
    const usertoken2 = authRegisterV1('Boruto@gmail.com', 'password777', 'Boruto', 'Hyuga');
    const user1 = userProfileV1(usertoken1.token, usertoken1.authUserId).user;
    const user2 = userProfileV1(usertoken2.token, usertoken2.authUserId).user;
    expect(usersAllV1(usertoken1.token)).toStrictEqual({
      users: [
        {
          uId: user1.uId,
          email: user1.email,
          nameFirst: user1.nameFirst,
          nameLast: user1.nameLast,
          handleStr: user1.handleStr,
          profileImgUrl: expect.any(String)
        },
        {
          uId: user2.uId,
          email: user2.email,
          nameFirst: user2.nameFirst,
          nameLast: user2.nameLast,
          handleStr: user2.handleStr,
          profileImgUrl: expect.any(String)
        }
      ]
    });
  });
});
