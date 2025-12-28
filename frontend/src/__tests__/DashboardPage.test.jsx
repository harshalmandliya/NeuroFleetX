import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '../pages/DashboardPage';

// Mock the API services
jest.mock('../api/taxiService', () => ({
  getAllTaxis: jest.fn().mockResolvedValue({ data: [] }),
}));

jest.mock('../api/rideService', () => ({
  getAllRides: jest.fn().mockResolvedValue({ data: [] }),
}));

test('renders dashboard title', async () => {
  render(<DashboardPage />);
  
  // Wait for the loading to complete
  await waitFor(() => {
    expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
  });
  
  const titleElement = screen.getByText(/Dashboard/i);
  expect(titleElement).toBeInTheDocument();
});