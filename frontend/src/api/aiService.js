import apiClient from './apiClient';

export const explainRide = (rideId) => {
  return apiClient.post(`/ai/explain-ride/${rideId}`);
};