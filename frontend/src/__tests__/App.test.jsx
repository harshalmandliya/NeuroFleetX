import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ children }) => <div>{children}</div>,
}));

test('renders NeuroFleetX title', () => {
  render(<App />);
  const titleElement = screen.getByText(/NeuroFleetX Lite/i);
  expect(titleElement).toBeInTheDocument();
});