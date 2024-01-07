import apiClient from './apiClient';

const recordApi = (orgCode, token,body) =>
  apiClient.post(`${orgCode}/record/employee_record`,body, {
    headers: {Authorization: `Bearer ${token}`}
  });

export default recordApi;
