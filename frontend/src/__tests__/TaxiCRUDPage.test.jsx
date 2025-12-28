import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import TaxiCRUDPage from '../pages/TaxiCRUDPage';

// Mock the API services
jest.mock('../api/taxiService', () => ({
  getAllTaxis: jest.fn().mockResolvedValue({ data: [] }),
  createTaxi: jest.fn().mockResolvedValue({ data: {} }),
  updateTaxi: jest.fn().mockResolvedValue({ data: {} }),
  deleteTaxi: jest.fn().mockResolvedValue({ data: {} }),
}));

test('renders taxi management title', async () => {
  render(<TaxiCRUDPage />);
  
  // Wait for the loading to complete
  await waitFor(() => {
    expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
  });
  
  const titleElement = screen.getByText(/Taxi Management/i);
  expect(titleElement).toBeInTheDocument();
});