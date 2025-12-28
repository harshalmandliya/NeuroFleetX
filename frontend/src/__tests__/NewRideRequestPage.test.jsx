import React from 'react';
import { render, screen } from '@testing-library/react';
import NewRideRequestPage from '../pages/NewRideRequestPage';

// Mock the API services
jest.mock('../api/rideService', () => ({
  createRide: jest.fn().mockResolvedValue({ data: {} }),
  assignTaxi: jest.fn().mockResolvedValue({ data: {} }),
}));

jest.mock('../api/predictionService', () => ({
  predictETA: jest.fn().mockResolvedValue({ data: { predictedETA: 12.5 } }),
}));

test('renders new ride request title', () => {
  render(<NewRideRequestPage />);
  const titleElement = screen.getByText(/New Ride Request/i);
  expect(titleElement).toBeInTheDocument();
});