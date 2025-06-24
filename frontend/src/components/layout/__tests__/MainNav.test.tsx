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
    expect(screen.getByText('Series')).toBeInTheDocument();
    expect(screen.getByText('Stories')).toBeInTheDocument();
    expect(screen.getByText('Sounds')).toBeInTheDocument();
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
    expect(listItems).toHaveLength(5);
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

    const seriesLink = screen.getByText('Series').closest('a');
    expect(seriesLink).toHaveAttribute('href', '/series');

    const storiesLink = screen.getByText('Stories').closest('a');
    expect(storiesLink).toHaveAttribute('href', '/stories');

    const soundsLink = screen.getByText('Sounds').closest('a');
    expect(soundsLink).toHaveAttribute('href', '/sounds');
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