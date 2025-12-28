import axios from 'axios';
import { predictETA, uploadCSV } from '../api/predictionService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('predictionService', () => {
  beforeEach(() => {
    mockedAxios.post.mockClear();
  });

  test('predictETA makes POST request to /predict', async () => {
    const requestData = { originLat: 40.7128 };
    await predictETA(requestData);
    expect(mockedAxios.post).toHaveBeenCalledWith('/predict', requestData);
  });

  test('uploadCSV makes POST request to /csv/upload', async () => {
    const file = new File([''], 'test.csv');
    await uploadCSV(file);
    expect(mockedAxios.post).toHaveBeenCalledWith('/csv/upload', expect.any(FormData), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  });
});