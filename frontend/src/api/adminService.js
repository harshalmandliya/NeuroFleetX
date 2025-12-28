import apiClient from './apiClient';

export const getAdminStats = () => {
  return Promise.all([
    apiClient.get('/admin/users'),
    apiClient.get('/admin/taxis'),
    apiClient.get('/admin/rides'),
    apiClient.get('/admin/metrics')
  ]).then(([usersRes, taxisRes, ridesRes, metricsRes]) => {
    return {
      users: usersRes.data,
      taxis: taxisRes.data,
      rides: ridesRes.data,
      metrics: metricsRes.data
    };
  });
};

export const getAllUsers = () => {
  return apiClient.get('/admin/users');
};

export const createUser = (userData) => {
  return apiClient.post('/admin/users', userData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const createAdminUser = (userData) => {
  return apiClient.post('/admin/users', userData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const updateUser = (id, userData) => {
  return apiClient.put(`/admin/users/${id}`, userData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const getAllTaxis = () => {
  return apiClient.get('/admin/taxis');
};

export const createTaxi = (taxiData) => {
  return apiClient.post('/taxis', taxiData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const updateTaxi = (id, taxiData) => {
  return apiClient.put(`/taxis/${id}`, taxiData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const getAllRides = () => {
  return apiClient.get('/admin/rides');
};

export const getModelMetrics = () => {
  return apiClient.get('/admin/metrics');
};

export const deleteUser = (id) => {
  return apiClient.delete(`/admin/users/${id}`);
};

export const deleteTaxi = (id) => {
  return apiClient.delete(`/admin/taxis/${id}`);
};