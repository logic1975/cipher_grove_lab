import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../Header';
import { useNavigationStore } from '../../../stores';
import { vi } from 'vitest';
import { RouterWrapper } from '../../../test-helpers';

// Mock the navigation store
vi.mock('../../../stores', () => ({
  useNavigationStore: vi.fn()
}));

describe('Header Component', () => {
  const mockStore = {
    isMobileMenuOpen: false,
    toggleMobileMenu: vi.fn(),
    closeMobileMenu: vi.fn(),
    setScrollProgress: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigationStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockStore);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders logo with correct text', () => {
    render(<Header />, { wrapper: RouterWrapper });

    const logo = screen.getByText('CIPHER GROVE LAB');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveClass('logo');
  });

  it('renders desktop navigation links', () => {
    render(<Header />, { wrapper: RouterWrapper });

    // Check desktop nav links
    const desktopNav = screen.getByRole('banner').querySelector('.header-nav');
    expect(desktopNav).toBeInTheDocument();
    
    expect(screen.getAllByText('Concerts')[0]).toBeInTheDocument();
    expect(screen.getAllByText('About')[0]).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('renders mobile menu button', () => {
    render(<Header />, { wrapper: RouterWrapper });

    const mobileButton = screen.getByLabelText('Toggle menu');
    expect(mobileButton).toBeInTheDocument();
    expect(mobileButton).toHaveClass('mobile-menu-button');
  });

  it('toggles mobile menu when button is clicked', () => {
    render(<Header />, { wrapper: RouterWrapper });

    const mobileButton = screen.getByLabelText('Toggle menu');
    fireEvent.click(mobileButton);

    expect(mockStore.toggleMobileMenu).toHaveBeenCalledTimes(1);
  });

  it('applies active class to hamburger when mobile menu is open', () => {
    const openStore = { ...mockStore, isMobileMenuOpen: true };
    (useNavigationStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(openStore);

    const { container } = render(<Header />, { wrapper: RouterWrapper });

    const hamburger = container.querySelector('.hamburger');
    expect(hamburger).toHaveClass('active');
  });

  it('renders mobile navigation with correct links', () => {
    const { container } = render(<Header />, { wrapper: RouterWrapper });

    const mobileNav = container.querySelector('.mobile-nav');
    expect(mobileNav).toBeInTheDocument();
    
    const mobileLinks = mobileNav?.querySelectorAll('.mobile-nav-link');
    expect(mobileLinks).toHaveLength(2);
  });

  it('applies active class to mobile nav when menu is open', () => {
    const openStore = { ...mockStore, isMobileMenuOpen: true };
    (useNavigationStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(openStore);

    const { container } = render(<Header />, { wrapper: RouterWrapper });

    const mobileNav = container.querySelector('.mobile-nav');
    expect(mobileNav).toHaveClass('active');
  });

  it('closes mobile menu when logo is clicked', () => {
    render(<Header />, { wrapper: RouterWrapper });

    const logo = screen.getByText('CIPHER GROVE LAB');
    fireEvent.click(logo);

    expect(mockStore.closeMobileMenu).toHaveBeenCalledTimes(1);
  });

  it('closes mobile menu when mobile nav link is clicked', () => {
    render(<Header />, { wrapper: RouterWrapper });

    // Click the second "Concerts" link (mobile nav)
    const concertsLinks = screen.getAllByText('Concerts');
    fireEvent.click(concertsLinks[1]);

    expect(mockStore.closeMobileMenu).toHaveBeenCalledTimes(1);
  });

  it('adds scrolled class when page is scrolled', () => {
    const { container } = render(<Header />, { wrapper: RouterWrapper });

    const header = container.querySelector('.header');
    expect(header).not.toHaveClass('scrolled');

    // Simulate scroll
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    fireEvent.scroll(window);

    // Force re-render to check class update
    expect(header).toHaveClass('scrolled');
  });

  it('updates scroll progress when scrolling', () => {
    // Mock document dimensions
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    Object.defineProperty(window, 'scrollY', { value: 600, writable: true });

    render(<Header />, { wrapper: RouterWrapper });

    fireEvent.scroll(window);

    // Calculate expected percentage: (600 / (2000 - 800)) * 100 = 50
    expect(mockStore.setScrollProgress).toHaveBeenCalledWith(50);
  });

  it('cleans up scroll event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(<Header />, { wrapper: RouterWrapper });

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});