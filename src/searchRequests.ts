import { requestHelper } from './otherRequests';

function searchV1(token: string, queryStr: string) {
  return requestHelper('GET', '/search/v1', { queryStr }, token);
}

export { searchV1 };
