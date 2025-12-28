import apiClient from './apiClient';

export const getDriverProfile = () => {
  return apiClient.get('/driver/profile');
};

export const getDriverTaxis = () => {
  return apiClient.get('/driver/taxis');
};

export const createDriverTaxi = (taxi) => {
  return apiClient.post('/driver/taxis', taxi, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const updateDriverTaxi = (id, taxi) => {
  console.log('updateDriverTaxi called with id:', id, 'and taxi:', taxi); // Debug log
  // Handle case where id might be undefined or null
  if (!id) {
    console.error('Attempted to update taxi with invalid ID:', id);
    return Promise.reject(new Error('Invalid taxi ID'));
  }
  return apiClient.put(`/driver/taxis/${id}`, taxi, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const getDriverRides = () => {
  return apiClient.get('/driver/rides');
};

export const driverRideAction = (actionData) => {
  return apiClient.post('/driver/rides/action', actionData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const startRide = (rideId) => {
  return apiClient.post(`/driver/rides/${rideId}/start`);
};

export const completeRide = (rideId) => {
  return apiClient.post(`/driver/rides/${rideId}/complete`);
};