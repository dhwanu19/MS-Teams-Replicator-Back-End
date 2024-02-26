import { dmCreateV1, dmLeaveV1, dmRemoveV1 } from './dmRequests';
import { clearV1 } from './otherRequests';
import { authRegisterV1 } from './authRequests';

beforeEach(() => {
  clearV1();
});

describe('dmRemoveV1 Success Cases', () => {
  test('Creator successfully removes DM', () => {
    const token = authRegisterV1('error@gmail.com', 'errorPassword', 'Error', 'Smith');
    const altToken = authRegisterV1('alt@gmail.com', 'altPassword', 'Alt', 'Smith');
    const dmId = dmCreateV1(token.token, [altToken.authUserId]).dmId;
    expect(dmRemoveV1(token.token, dmId)).toStrictEqual({});
  });
});

describe('dmRemoveV1 Error Cases', () => {
  test('Token is invalid', () => {
    const user = authRegisterV1('error@gmail.com', 'errorPassword', 'Error', 'Smith');
    const alt = authRegisterV1('alt@gmail.com', 'altPassword', 'Alt', 'Smith');
    const invalidToken = user.token + 'toInvalid';
    const dmId = dmCreateV1(invalidToken, [alt.authUserId]).dmId;
    expect(dmRemoveV1(invalidToken, dmId)).toStrictEqual({ errorCode: 403 });
  });

  test('dmId does not refer to a valid DM', () => {
    const user = authRegisterV1('error@gmail.com', 'errorPassword', 'Error', 'Smith');
    const alt = authRegisterV1('alt@gmail.com', 'altPassword', 'Alt', 'Smith');
    const dmId = dmCreateV1(user.token, [alt.token]).dmId;
    const invalidDmId = dmId + 1;
    expect(dmRemoveV1(user.token, invalidDmId)).toStrictEqual({ errorCode: 400 });
  });

  test('dmId is valid and the authorised user is not the original DM creator', () => {
    const token = authRegisterV1('error@gmail.com', 'errorPassword', 'Error', 'Smith');
    const altToken = authRegisterV1('alt@gmail.com', 'altPassword', 'Alt', 'Smith');
    const dmId = dmCreateV1(token.token, [altToken.authUserId]).dmId;
    expect(dmRemoveV1(altToken.token, dmId)).toStrictEqual({ errorCode: 403 });
  });

  test('dmId is valid and the owner is no longer in the DM', () => {
    const owner = authRegisterV1('error@gmail.com', 'errorPassword', 'Error', 'Smith');
    const member = authRegisterV1('alt@gmail.com', 'altPassword', 'Alt', 'Smith');
    const dmId = dmCreateV1(owner.token, [member.authUserId]).dmId;
    dmLeaveV1(owner.token, dmId);
    expect(dmRemoveV1(owner.token, dmId)).toStrictEqual({ errorCode: 403 });
  });
});
