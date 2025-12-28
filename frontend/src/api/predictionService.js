import apiClient from './apiClient';

export const predictETA = (requestData) => {
  return apiClient.post('/predict', requestData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const uploadCSV = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  // Let the browser set the Content-Type with proper boundary
  return apiClient.post('/csv/upload', formData);
};