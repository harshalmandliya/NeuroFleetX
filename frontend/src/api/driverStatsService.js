import apiClient from './apiClient';

export const getDriverEarnings = () => {
  return apiClient.get('/driver/earnings');
};

export const getDriverStatistics = () => {
  return apiClient.get('/driver/statistics');
};