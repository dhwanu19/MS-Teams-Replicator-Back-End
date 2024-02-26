import { authLoginV2, authRegisterV1, authLogoutV1 } from './authRequests';
import { clearV1 } from './otherRequests';

beforeEach(() => {
  clearV1();
});

describe('Success Tests', () => {
  test('Register then Logout', () => {
    const register = authRegisterV1('BillyBob@gmail.com', 'BigPassword', 'Billy', 'Robert').token;
    expect(authLogoutV1(register)).toStrictEqual({});
  });
  test('Register, Logout, Login, Logout', () => {
    const register = authRegisterV1('BillyBob@gmail.com', 'BigPassword', 'Billy', 'Robert').token;
    authLogoutV1(register);
    const login = authLoginV2('BillyBob@gmail.com', 'BigPassword').token;
    expect(authLogoutV1(login)).toStrictEqual({});
  });
  test('Logout when multiple users are active', () => {
    authRegisterV1('first@gmail.com', 'BigPassword', 'Billy', 'Robert');
    const second = authRegisterV1('second@gmail.com', 'BigPassword', 'Timmy', 'Bobert').token;
    authRegisterV1('third@gmail.com', 'BigPassword', 'Willy', 'Obert');
    expect(authLogoutV1(second)).toStrictEqual({});
  });
});

describe('Error Tests', () => {
  test('Invalid token => error', () => {
    const logout = authLogoutV1('token');
    expect(logout).toStrictEqual({ errorCode: 403 });
  });
  test('Logout invalidates token', () => {
    const register = authRegisterV1('BillyBob@gmail.com', 'BigPassword', 'Billy', 'Robert').token;
    authLogoutV1(register);
    expect(authLogoutV1(register)).toStrictEqual({ errorCode: 403 });
  });
});
