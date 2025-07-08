import React from 'react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Test wrapper that includes React Router with future flags
 * to suppress v7 migration warnings in tests
 */
export const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter future={{ 
    v7_startTransition: true,
    v7_relativeSplatPath: true 
  }}>
    {children}
  </MemoryRouter>
);

/**
 * Helper to wrap components that need routing in tests
 */
export const renderWithRouter = (ui: React.ReactElement) => {
  return {
    ...ui,
    wrapper: RouterWrapper
  };
};