import apiClient from './apiClient';

export const getAllRides = () => {
  return apiClient.get('/rides');
};

export const getUnassignedRides = () => {
  return apiClient.get('/rides/unassigned');
};

export const getUnassignedRidesForDriver = () => {
  return apiClient.get('/rides/unassigned-for-driver');
};

export const getUserRides = () => {
  return apiClient.get('/user/rides');
};

export const createRide = (ride) => {
  return apiClient.post('/user/rides', ride, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const updateRide = (id, ride) => {
  return apiClient.put(`/rides/${id}`, ride, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const deleteRide = (id) => {
  return apiClient.delete(`/rides/${id}`);
};

export const assignTaxi = (rideRequestId) => {
  return apiClient.post('/dispatch', { rideRequestId }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};