import apiClient from './apiClient';

export const getAllTaxis = () => {
  return apiClient.get('/taxis');
};

export const createTaxi = (taxi) => {
  return apiClient.post('/taxis', taxi, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const updateTaxi = (id, taxi) => {
  return apiClient.put(`/taxis/${id}`, taxi, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const deleteTaxi = (id) => {
  return apiClient.delete(`/taxis/${id}`);
};