import axios from 'axios';
import { getAllRides, createRide, updateRide, deleteRide, assignTaxi } from '../api/rideService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('rideService', () => {
  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
    mockedAxios.put.mockClear();
    mockedAxios.delete.mockClear();
  });

  test('getAllRides makes GET request to /rides', async () => {
    await getAllRides();
    expect(mockedAxios.get).toHaveBeenCalledWith('/rides');
  });

  test('createRide makes POST request to /rides', async () => {
    const rideData = { originLat: 40.7128 };
    await createRide(rideData);
    expect(mockedAxios.post).toHaveBeenCalledWith('/rides', rideData);
  });

  test('updateRide makes PUT request to /rides/{id}', async () => {
    const rideData = { originLat: 40.7128 };
    await updateRide(1, rideData);
    expect(mockedAxios.put).toHaveBeenCalledWith('/rides/1', rideData);
  });

  test('deleteRide makes DELETE request to /rides/{id}', async () => {
    await deleteRide(1);
    expect(mockedAxios.delete).toHaveBeenCalledWith('/rides/1');
  });

  test('assignTaxi makes POST request to /dispatch', async () => {
    await assignTaxi(1);
    expect(mockedAxios.post).toHaveBeenCalledWith('/dispatch', { rideRequestId: 1 });
  });
});