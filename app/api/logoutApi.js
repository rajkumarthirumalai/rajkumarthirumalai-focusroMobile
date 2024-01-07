import apiClient from './apiClient';

const logoutApi = (token,body) =>
  apiClient.post(`/auth/employee-logout`,body, {
    headers: {Authorization: `Bearer ${token}`}
  });

export default logoutApi;
