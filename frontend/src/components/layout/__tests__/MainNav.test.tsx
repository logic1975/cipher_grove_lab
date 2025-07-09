import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MainNav } from '../MainNav';

describe('MainNav Component', () => {
  it('renders all navigation items', () => {
    render(
      <MemoryRouter>
        <MainNav />
      </MemoryRouter>
    );

    expect(screen.getByText('Artists')).toBeInTheDocument();
    expect(screen.getByText('Releases')).toBeInTheDocument();
    expect(screen.getByText('Concerts')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('renders navigation with correct structure', () => {
    const { container } = render(
      <MemoryRouter>
        <MainNav />
      </MemoryRouter>
    );

    const nav = container.querySelector('.main-nav');
    expect(nav).toBeInTheDocument();
    
    const ul = nav?.querySelector('ul');
    expect(ul).toBeInTheDocument();
    
    const listItems = ul?.querySelectorAll('li');
    expect(listItems).toHaveLength(4);
  });

  it('renders links with correct paths', () => {
    render(
      <MemoryRouter>
        <MainNav />
      </MemoryRouter>
    );

    const artistsLink = screen.getByText('Artists').closest('a');
    expect(artistsLink).toHaveAttribute('href', '/artists');

    const releasesLink = screen.getByText('Releases').closest('a');
    expect(releasesLink).toHaveAttribute('href', '/releases');

    const concertsLink = screen.getByText('Concerts').closest('a');
    expect(concertsLink).toHaveAttribute('href', '/concerts');

    const aboutLink = screen.getByText('About').closest('a');
    expect(aboutLink).toHaveAttribute('href', '/about');
  });

  it('applies active class to current route', () => {
    render(
      <MemoryRouter initialEntries={['/artists']}>
        <Routes>
          <Route path="*" element={<MainNav />} />
        </Routes>
      </MemoryRouter>
    );

    const artistsLink = screen.getByText('Artists');
    expect(artistsLink).toHaveClass('active');

    const releasesLink = screen.getByText('Releases');
    expect(releasesLink).not.toHaveClass('active');
  });

  it('applies different active classes for different routes', () => {
    // Test artists route
    const { unmount: unmountArtists } = render(
      <MemoryRouter initialEntries={['/artists']}>
        <Routes>
          <Route path="*" element={<MainNav />} />
        </Routes>
      </MemoryRouter>
    );

    const artistsLink = screen.getByText('Artists');
    expect(artistsLink).toHaveClass('active');

    unmountArtists();

    // Test releases route
    render(
      <MemoryRouter initialEntries={['/releases']}>
        <Routes>
          <Route path="*" element={<MainNav />} />
        </Routes>
      </MemoryRouter>
    );

    const releasesLink = screen.getByText('Releases');
    expect(releasesLink).toHaveClass('active');
    
    const artistsLinkInactive = screen.getByText('Artists');
    expect(artistsLinkInactive).not.toHaveClass('active');
  });
});