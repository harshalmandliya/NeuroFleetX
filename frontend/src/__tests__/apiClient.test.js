import apiClient from '../api/apiClient';

test('apiClient is configured correctly', () => {
  expect(apiClient.defaults.baseURL).toBe('/api');
  expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
});