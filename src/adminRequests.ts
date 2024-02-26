import { requestHelper } from './otherRequests';

function adminUserRemoveV1(token: string, uId: number) {
  return requestHelper('DELETE', '/admin/user/remove/v1', { uId }, token);
}

function adminUserpermissionChangeV1(token: string, uId: number, permissionId: number) {
  return requestHelper('POST', '/admin/userpermission/change/v1', { uId, permissionId }, token);
}

export {
  adminUserRemoveV1,
  adminUserpermissionChangeV1,
};
