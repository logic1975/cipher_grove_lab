import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ArtistProfile } from '../ArtistProfile';
import { 
  createMockArtistDisplay,
  createMockRelease,
  createMockSocialLinks,
  createMockStreamingLinks 
} from '../../../utils/testUtils';
import { toDisplayRelease } from '../../../utils/typeConverters';

// Wrapper for routing
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ArtistProfile Component', () => {
  describe('Basic Rendering', () => {
    it('renders artist information correctly', () => {
      const artist = createMockArtistDisplay({
        name: 'Test Artist',
        genre: 'Rock',
        bio: 'This is a test biography.'
      });
      
      renderWithRouter(<ArtistProfile artist={artist} />);
      
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
      expect(screen.getByText('Rock')).toBeInTheDocument();
      expect(screen.getByText('This is a test biography.')).toBeInTheDocument();
    });

    it('displays featured banner for featured artists', () => {
      const artist = createMockArtistDisplay({ isFeatured: true });
      
      renderWithRouter(<ArtistProfile artist={artist} />);
      
      expect(screen.getByTestId('featured-banner')).toBeInTheDocument();
      expect(screen.getByText('Featured Artist')).toBeInTheDocument();
    });

    it('does not display featured banner for non-featured artists', () => {
      const artist = createMockArtistDisplay({ isFeatured: false });
      
      renderWithRouter(<ArtistProfile artist={artist} />);
      
      expect(screen.queryByTestId('featured-banner')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      const artist = createMockArtistDisplay();
      
      renderWithRouter(<ArtistProfile artist={artist} className="custom-profile" />);
      
      expect(screen.getByTestId('artist-profile')).toHaveClass('artist-profile', 'custom-profile');
    });
  });

  describe('Image Handling', () => {
    it('uses profile image from imageSizes', () => {
      const artist = createMockArtistDisplay({
        imageUrl: '/default.jpg',
        imageSizes: {
          thumbnail: '/thumb.webp',
          profile: '/profile.webp',
          featured: '/featured.webp'
        }
      });
      
      renderWithRouter(<ArtistProfile artist={artist} />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/profile.webp');
    });

    it('uses custom alt text when available', () => {
      const artist = createMockArtistDisplay({
        name: 'Artist Name',
        imageAlt: 'Custom image description'
      });
      
      renderWithRouter(<ArtistProfile artist={artist} />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', 'Custom image description');
    });

    it('falls back to artist name for alt text', () => {
      const artist = createMockArtistDisplay({
        name: 'Fallback Artist',
        imageAlt: null
      });
      
      renderWithRouter(<ArtistProfile artist={artist} />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', 'Fallback Artist');
    });
  });

  describe('Social Links', () => {
    it('renders all social links', () => {
      const artist = createMockArtistDisplay({
        socialLinks: createMockSocialLinks()
      });
      
      renderWithRouter(<ArtistProfile artist={artist} />);
      
      expect(screen.getByTestId('social-links')).toBeInTheDocument();
      
      // Check for specific platforms
      expect(screen.getByTestId('social-link-spotify')).toBeInTheDocument();
      expect(screen.getByTestId('social-link-instagram')).toBeInTheDocument();
      expect(screen.getByTestId('social-link-youtube')).toBeInTheDocument();
      
      // Check all 8 platforms are rendered
      const socialLinks = screen.getAllByRole('link', { name: /on/ });
      expect(socialLinks).toHaveLength(8);
    });

    it('does not render social links section when empty', () => {
      const artist = createMockArtistDisplay({ socialLinks: {} });
      
      renderWithRouter(<ArtistProfile artist={artist} />);
      
      expect(screen.queryByTestId('social-links')).not.toBeInTheDocument();
    });

    it('social links open in new tab', () => {
      const artist = createMockArtistDisplay({
        socialLinks: { spotify: 'https://spotify.com/test' }
      });
      
      renderWithRouter(<ArtistProfile artist={artist} />);
      
      const link = screen.getByTestId('social-link-spotify');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Releases Section', () => {
    it('renders releases when available', () => {
      const releases = [
        createMockRelease({ id: 1, title: 'Album 1', type: 'album' }),
        createMockRelease({ id: 2, title: 'Single 1', type: 'single' })
      ];
      
      const artist = createMockArtistDisplay({
        releases: releases.map(toDisplayRelease)
      });
      
      renderWithRouter(<ArtistProfile artist={artist} />);
      
      expect(screen.getByText('Releases')).toBeInTheDocument();
      expect(screen.getByText('Album 1')).toBeInTheDocument();
      expect(screen.getByText('Single 1')).toBeInTheDocument();
    });

    it('displays release type badges', () => {
      const releases = [
        createMockRelease({ id: 1, type: 'album' }),
        createMockRelease({ id: 2, type: 'single' }),
        createMockRelease({ id: 3, type: 'ep' })
      ];
      
      const artist = createMockArtistDisplay({
        releases: releases.map(toDisplayRelease)
      });
      
      renderWithRouter(<ArtistProfile artist={artist} />);
      
      expect(screen.getByText('album')).toBeInTheDocument();
      expect(screen.getByText('single')).toBeInTheDocument();
      expect(screen.getByText('ep')).toBeInTheDocument();
    });

    it('formats release dates correctly', () => {
      const release = createMockRelease({ 
        releaseDate: '2024-03-15' 
      });
      
      const artist = createMockArtistDisplay({
        releases: [toDisplayRelease(release)]
      });
      
      renderWithRouter(<ArtistProfile artist={artist} />);
      
      expect(screen.getByText(/March 15, 2024/)).toBeInTheDocument();
    });

    it('renders streaming links for releases', () => {
      const release = createMockRelease({
        streamingLinks: createMockStreamingLinks()
      });
      
      const artist = createMockArtistDisplay({
        releases: [toDisplayRelease(release)]
      });
      
      renderWithRouter(<ArtistProfile artist={artist} />);
      
      const releaseCard = screen.getByTestId('release-card');
      const streamingLinks = releaseCard.querySelectorAll('.streaming-link');
      
      expect(streamingLinks).toHaveLength(3); // Shows first 3
    });

    it('does not render releases section when showReleases is false', () => {
      const artist = createMockArtistDisplay({
        releases: [createMockRelease()]
      });
      
      renderWithRouter(<ArtistProfile artist={artist} showReleases={false} />);
      
      expect(screen.queryByText('Releases')).not.toBeInTheDocument();
    });

    it('does not render releases section when no releases', () => {
      const artist = createMockArtistDisplay({ releases: [] });
      
      renderWithRouter(<ArtistProfile artist={artist} />);
      
      expect(screen.queryByText('Releases')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('includes back to artists link', () => {
      const artist = createMockArtistDisplay();
      
      renderWithRouter(<ArtistProfile artist={artist} />);
      
      const backLink = screen.getByText('← Back to All Artists');
      expect(backLink).toHaveAttribute('href', '/artists');
    });

    it('release titles link to release pages', () => {
      const release = createMockRelease({ id: 42, title: 'Test Album' });
      const artist = createMockArtistDisplay({
        releases: [toDisplayRelease(release)]
      });
      
      renderWithRouter(<ArtistProfile artist={artist} />);
      
      const releaseLink = screen.getByRole('link', { name: 'Test Album' });
      expect(releaseLink).toHaveAttribute('href', '/releases/42');
    });
  });

  describe('Cover Art', () => {
    it('uses medium size cover art for releases', () => {
      const release = createMockRelease({
        coverArtUrl: '/default.jpg',
        coverArtSizes: {
          small: '/small.webp',
          medium: '/medium.webp',
          large: '/large.webp'
        }
      });
      
      const artist = createMockArtistDisplay({
        releases: [toDisplayRelease(release)]
      });
      
      renderWithRouter(<ArtistProfile artist={artist} />);
      
      const releaseCard = screen.getByTestId('release-card');
      const img = releaseCard.querySelector('img');
      
      expect(img).toHaveAttribute('src', '/medium.webp');
    });
  });
});