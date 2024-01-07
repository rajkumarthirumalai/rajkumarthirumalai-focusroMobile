import apiClient from './apiClient';

const resetPwdApi = (orgCode,body) =>
  apiClient.post(`${orgCode}/sys-app/user/reset-password`,body);

export default resetPwdApi;

