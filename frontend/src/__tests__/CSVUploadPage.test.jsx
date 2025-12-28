import React from 'react';
import { render, screen } from '@testing-library/react';
import CSVUploadPage from '../pages/CSVUploadPage';

// Mock the API services
jest.mock('../api/predictionService', () => ({
  uploadCSV: jest.fn().mockResolvedValue({ data: 'File uploaded and model trained successfully!' }),
}));

test('renders CSV upload title', () => {
  render(<CSVUploadPage />);
  const titleElement = screen.getByText(/CSV Upload/i);
  expect(titleElement).toBeInTheDocument();
});