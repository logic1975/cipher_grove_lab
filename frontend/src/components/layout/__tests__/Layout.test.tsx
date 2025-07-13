import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Layout } from '../Layout';
import { useNavigationStore } from '../../../stores';
import { vi } from 'vitest';

// Mock the navigation store
vi.mock('../../../stores', () => ({
  useNavigationStore: vi.fn()
}));

// Mock child components to avoid testing their implementation
vi.mock('../Header', () => ({
  Header: () => <div data-testid="header">Header</div>
}));

vi.mock('../Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>
}));

describe('Layout Component', () => {
  const mockUseNavigationStore = useNavigationStore as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Default mock implementation
    mockUseNavigationStore.mockImplementation((selector) => {
      const state = {
        scrollProgress: 0
      };
      return selector(state);
    });
  });

  it('renders all layout components', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    // Note: MainNav not included - navigation handled cleanly in Header
  });

  it('renders outlet for child routes', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('renders scroll progress indicator', () => {
    const { container } = render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    const scrollIndicator = container.querySelector('.scroll-indicator');
    expect(scrollIndicator).toBeInTheDocument();
  });

  it('updates scroll indicator width based on scroll progress', () => {
    // Mock store with 50% scroll progress
    mockUseNavigationStore.mockImplementation((selector) => {
      const state = {
        scrollProgress: 50
      };
      return selector(state);
    });

    const { container } = render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    const scrollIndicator = container.querySelector('.scroll-indicator');
    expect(scrollIndicator).toHaveStyle({ width: '50%' });
  });

  it('updates scroll indicator when progress changes', () => {
    const { container, rerender } = render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    const scrollIndicator = container.querySelector('.scroll-indicator');
    expect(scrollIndicator).toHaveStyle({ width: '0%' });

    // Update scroll progress
    mockUseNavigationStore.mockImplementation((selector) => {
      const state = {
        scrollProgress: 75
      };
      return selector(state);
    });

    rerender(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    expect(scrollIndicator).toHaveStyle({ width: '75%' });
  });
});