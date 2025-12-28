import axios from 'axios';
import { getAllTaxis, createTaxi, updateTaxi, deleteTaxi } from '../api/taxiService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('taxiService', () => {
  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
    mockedAxios.put.mockClear();
    mockedAxios.delete.mockClear();
  });

  test('getAllTaxis makes GET request to /taxis', async () => {
    await getAllTaxis();
    expect(mockedAxios.get).toHaveBeenCalledWith('/taxis');
  });

  test('createTaxi makes POST request to /taxis', async () => {
    const taxiData = { name: 'Test Taxi' };
    await createTaxi(taxiData);
    expect(mockedAxios.post).toHaveBeenCalledWith('/taxis', taxiData);
  });

  test('updateTaxi makes PUT request to /taxis/{id}', async () => {
    const taxiData = { name: 'Updated Taxi' };
    await updateTaxi(1, taxiData);
    expect(mockedAxios.put).toHaveBeenCalledWith('/taxis/1', taxiData);
  });

  test('deleteTaxi makes DELETE request to /taxis/{id}', async () => {
    await deleteTaxi(1);
    expect(mockedAxios.delete).toHaveBeenCalledWith('/taxis/1');
  });
});