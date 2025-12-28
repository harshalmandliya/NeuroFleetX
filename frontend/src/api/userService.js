import apiClient from './apiClient';

export const getUserProfile = () => {
  return apiClient.get('/user/profile');
};

export const getUserRides = () => {
  return apiClient.get('/user/rides');
};