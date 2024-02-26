import { requestHelper } from './otherRequests';

// authLogin
function authLoginV2(email: string, password: string) {
  return requestHelper('POST', '/auth/login/v3', { email, password });
}

// authRegister
function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v3', { email, password, nameFirst, nameLast });
}

// authLogout
function authLogoutV1(token: string) {
  return requestHelper('POST', '/auth/logout/v2', {}, token);
}

// authPasswordResetRequest
function authPasswordResetRequestV1(email: string) {
  return requestHelper('POST', '/auth/passwordreset/request/v1', { email });
}

// authPasswordResetReset
function authPasswordResetResetV1(resetCode: string, newPassword: string) {
  return requestHelper('POST', '/auth/passwordreset/reset/v1', { resetCode, newPassword });
}

export {
  authLoginV2,
  authRegisterV1,
  authLogoutV1,
  authPasswordResetRequestV1,
  authPasswordResetResetV1,
};
