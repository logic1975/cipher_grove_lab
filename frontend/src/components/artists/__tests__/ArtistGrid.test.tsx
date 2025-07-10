import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ArtistGrid } from '../ArtistGrid';
import { 
  createMockSimpleArtist, 
  createMockArtistDisplay,
  createMockArtists 
} from '../../../utils/testUtils';

// Wrapper for routing
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ArtistGrid Component', () => {
  describe('Basic Rendering', () => {
    it('renders artists correctly', () => {
      const artists = [
        createMockSimpleArtist({ id: '1', name: 'Artist 1' }),
        createMockSimpleArtist({ id: '2', name: 'Artist 2' }),
        createMockSimpleArtist({ id: '3', name: 'Artist 3' })
      ];
      
      renderWithRouter(<ArtistGrid artists={artists} />);
      
      expect(screen.getByTestId('artists-grid')).toBeInTheDocument();
      expect(screen.getByText('Artist 1')).toBeInTheDocument();
      expect(screen.getByText('Artist 2')).toBeInTheDocument();
      expect(screen.getByText('Artist 3')).toBeInTheDocument();
    });

    it('renders empty state when no artists', () => {
      renderWithRouter(<ArtistGrid artists={[]} />);
      
      expect(screen.getByText('No artists found.')).toBeInTheDocument();
      expect(screen.queryByTestId('artists-grid')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      const artists = [createMockSimpleArtist()];
      
      renderWithRouter(<ArtistGrid artists={artists} className="custom-grid" />);
      
      expect(screen.getByTestId('artists-grid')).toHaveClass('artists-grid', 'custom-grid');
    });
  });

  describe('Loading State', () => {
    it('shows skeleton cards when loading', () => {
      renderWithRouter(<ArtistGrid artists={[]} loading={true} />);
      
      const skeletons = document.querySelectorAll('.artist-item-skeleton');
      
      expect(skeletons).toHaveLength(6);
      expect(screen.queryByTestId('artists-grid')).not.toBeInTheDocument();
    });

    it('shows artists when loading is false', () => {
      const artists = [createMockSimpleArtist({ name: 'Loaded Artist' })];
      
      renderWithRouter(<ArtistGrid artists={artists} loading={false} />);
      
      expect(screen.getByText('Loaded Artist')).toBeInTheDocument();
      expect(screen.queryByText('artist-item-skeleton')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message with retry button', () => {
      const error = new Error('Failed to load artists');
      
      renderWithRouter(<ArtistGrid artists={[]} error={error} />);
      
      expect(screen.getByText('Error loading artists: Failed to load artists')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('retry button reloads page', () => {
      const mockReload = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true
      });
      
      const error = new Error('Test error');
      renderWithRouter(<ArtistGrid artists={[]} error={error} />);
      
      fireEvent.click(screen.getByText('Try Again'));
      expect(mockReload).toHaveBeenCalled();
    });
  });

  describe('Sorting', () => {
    it('sorts featured artists first', () => {
      const artists = [
        createMockArtistDisplay({ id: '1', name: 'Regular Artist', isFeatured: false }),
        createMockArtistDisplay({ id: '2', name: 'Featured Artist', isFeatured: true }),
        createMockArtistDisplay({ id: '3', name: 'Another Regular', isFeatured: false })
      ];
      
      renderWithRouter(<ArtistGrid artists={artists} />);
      
      const artistCards = screen.getAllByTestId('artist-card');
      const firstArtistName = artistCards[0].querySelector('.artist-name')?.textContent;
      
      expect(firstArtistName).toContain('Featured Artist');
    });

    it('sorts by name within featured/non-featured groups', () => {
      const artists = [
        createMockArtistDisplay({ id: '1', name: 'Zebra', isFeatured: true }),
        createMockArtistDisplay({ id: '2', name: 'Alpha', isFeatured: true }),
        createMockArtistDisplay({ id: '3', name: 'Beta', isFeatured: false })
      ];
      
      renderWithRouter(<ArtistGrid artists={artists} />);
      
      const artistCards = screen.getAllByTestId('artist-card');
      const names = artistCards.map(card => 
        card.querySelector('.artist-name')?.textContent?.trim()
      );
      
      expect(names).toEqual(['Alpha', 'Zebra', 'Beta']);
    });

    it('handles mixed simple and enhanced artists', () => {
      const artists = [
        createMockSimpleArtist({ id: '1', name: 'Simple Artist' }),
        createMockArtistDisplay({ id: '2', name: 'Enhanced Featured', isFeatured: true }),
        createMockArtistDisplay({ id: '3', name: 'Enhanced Regular', isFeatured: false })
      ];
      
      renderWithRouter(<ArtistGrid artists={artists} />);
      
      const artistCards = screen.getAllByTestId('artist-card');
      expect(artistCards).toHaveLength(3);
      
      // Featured should be first
      const firstArtistName = artistCards[0].querySelector('.artist-name')?.textContent;
      expect(firstArtistName).toContain('Enhanced Featured');
    });
  });

  describe('Integration', () => {
    it('passes correct props to ArtistCard components', () => {
      const artists = [
        createMockSimpleArtist({ id: '1', name: 'Artist 1' }),
        createMockSimpleArtist({ id: '2', name: 'Artist 2' })
      ];
      
      renderWithRouter(<ArtistGrid artists={artists} />);
      
      const artistCards = screen.getAllByTestId('artist-card');
      expect(artistCards).toHaveLength(2);
      
      // Check that cards have correct animation delays based on index
      expect(artistCards[0]).toHaveStyle({ animationDelay: '0s' });
      expect(artistCards[1]).toHaveStyle({ animationDelay: '0.05s' });
    });

    it('renders with realistic mock data', () => {
      const artists = createMockArtists(5);
      
      renderWithRouter(<ArtistGrid artists={artists} />);
      
      expect(screen.getAllByTestId('artist-card')).toHaveLength(5);
      
      // First two should be featured (based on mock data)
      const featuredBadges = screen.getAllByTestId('featured-badge');
      expect(featuredBadges).toHaveLength(2);
    });
  });
});