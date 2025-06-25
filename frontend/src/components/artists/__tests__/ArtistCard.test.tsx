import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ArtistCard } from '../ArtistCard';
import { 
  createMockSimpleArtist, 
  createMockArtistDisplay,
  createMockSocialLinks 
} from '../../../utils/testUtils';

// Wrapper for routing
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ArtistCard Component', () => {
  describe('Basic Functionality', () => {
    it('renders simple artist data correctly', () => {
      const artist = createMockSimpleArtist({
        id: '1',
        name: 'Test Artist',
        genre: 'Rock',
        imageUrl: '/test.jpg'
      });
      
      renderWithRouter(<ArtistCard artist={artist} />);
      
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
      expect(screen.getByText('Rock')).toBeInTheDocument();
      expect(screen.getByTestId('artist-image')).toHaveAttribute('src', '/test.jpg');
    });

    it('renders enhanced artist data correctly', () => {
      const artist = createMockArtistDisplay({
        id: '1',
        name: 'Enhanced Artist',
        genre: 'Electronic',
        bio: 'A great artist with a long biography that should be truncated in the preview...'
      });
      
      renderWithRouter(<ArtistCard artist={artist} />);
      
      expect(screen.getByText('Enhanced Artist')).toBeInTheDocument();
      expect(screen.getByText('Electronic')).toBeInTheDocument();
      expect(screen.getByTestId('bio-preview')).toBeInTheDocument();
    });

    it('applies animation delay based on index', () => {
      const artist = createMockSimpleArtist();
      
      renderWithRouter(<ArtistCard artist={artist} index={3} />);
      
      const card = screen.getByTestId('artist-card');
      expect(card.style.animationDelay).toMatch(/^0\.15/);
    });

    it('applies custom className', () => {
      const artist = createMockSimpleArtist();
      
      renderWithRouter(<ArtistCard artist={artist} className="custom-class" />);
      
      const card = screen.getByTestId('artist-card');
      expect(card).toHaveClass('artist-item', 'custom-class');
    });
  });

  describe('Enhanced Features', () => {
    it('displays featured badge for featured artists', () => {
      const artist = createMockArtistDisplay({ isFeatured: true });
      
      renderWithRouter(<ArtistCard artist={artist} />);
      
      expect(screen.getByTestId('featured-badge')).toBeInTheDocument();
      expect(screen.getByText('Featured')).toBeInTheDocument();
    });

    it('does not display featured badge for non-featured artists', () => {
      const artist = createMockArtistDisplay({ isFeatured: false });
      
      renderWithRouter(<ArtistCard artist={artist} />);
      
      expect(screen.queryByTestId('featured-badge')).not.toBeInTheDocument();
    });

    it('displays social links preview for enhanced artists', () => {
      const artist = createMockArtistDisplay({
        socialLinks: createMockSocialLinks()
      });
      
      renderWithRouter(<ArtistCard artist={artist} />);
      
      expect(screen.getByTestId('social-preview')).toBeInTheDocument();
      const socialIcons = screen.getByTestId('social-preview').querySelectorAll('.social-icon');
      expect(socialIcons).toHaveLength(3); // Shows first 3
    });

    it('shows count for more than 3 social links', () => {
      const artist = createMockArtistDisplay({
        socialLinks: createMockSocialLinks()
      });
      
      renderWithRouter(<ArtistCard artist={artist} />);
      
      expect(screen.getByText('+5')).toBeInTheDocument(); // 8 total - 3 shown = +5
    });

    it('truncates long bio in preview', () => {
      const longBio = 'A'.repeat(150); // 150 characters
      const artist = createMockArtistDisplay({ bio: longBio });
      
      renderWithRouter(<ArtistCard artist={artist} />);
      
      const bioPreview = screen.getByTestId('bio-preview');
      expect(bioPreview.textContent).toHaveLength(103); // 100 chars + '...'
      expect(bioPreview.textContent?.endsWith('...')).toBe(true);
    });
  });

  describe('Image Handling', () => {
    it('uses best available image from imageSizes', () => {
      const artist = createMockArtistDisplay({
        imageUrl: '/default.jpg',
        imageSizes: {
          thumbnail: '/thumb.webp',
          profile: '/profile.webp'
        }
      });
      
      renderWithRouter(<ArtistCard artist={artist} />);
      
      expect(screen.getByTestId('artist-image')).toHaveAttribute('src', '/thumb.webp');
    });

    it('falls back to imageUrl when no imageSizes', () => {
      const artist = createMockArtistDisplay({
        imageUrl: '/fallback.jpg',
        imageSizes: {}
      });
      
      renderWithRouter(<ArtistCard artist={artist} />);
      
      expect(screen.getByTestId('artist-image')).toHaveAttribute('src', '/fallback.jpg');
    });

    it('handles image load error', () => {
      const artist = createMockSimpleArtist({ imageUrl: '/broken.jpg' });
      
      renderWithRouter(<ArtistCard artist={artist} />);
      
      const img = screen.getByTestId('artist-image');
      expect(img).toHaveAttribute('src', '/broken.jpg');
      
      // Check that onError handler is attached
      expect(img).toHaveProperty('onerror');
    });

    it('uses correct alt text', () => {
      const enhancedArtist = createMockArtistDisplay({
        name: 'Artist Name',
        imageAlt: 'Custom alt text'
      });
      
      renderWithRouter(<ArtistCard artist={enhancedArtist} />);
      
      expect(screen.getByTestId('artist-image')).toHaveAttribute('alt', 'Custom alt text');
    });

    it('falls back to artist name for alt text', () => {
      const simpleArtist = createMockSimpleArtist({ name: 'Simple Artist' });
      
      renderWithRouter(<ArtistCard artist={simpleArtist} />);
      
      expect(screen.getByTestId('artist-image')).toHaveAttribute('alt', 'Simple Artist');
    });
  });

  describe('Navigation', () => {
    it('links to correct artist detail page', () => {
      const artist = createMockSimpleArtist({ id: '42', name: 'Linked Artist' });
      
      renderWithRouter(<ArtistCard artist={artist} />);
      
      const link = screen.getByRole('link', { name: 'Linked Artist' });
      expect(link).toHaveAttribute('href', '/artists/42');
    });
  });

  describe('Backward Compatibility', () => {
    it('handles simple artist without enhanced features', () => {
      const artist = createMockSimpleArtist();
      
      renderWithRouter(<ArtistCard artist={artist} />);
      
      // Should not show enhanced features
      expect(screen.queryByTestId('featured-badge')).not.toBeInTheDocument();
      expect(screen.queryByTestId('social-preview')).not.toBeInTheDocument();
      expect(screen.queryByTestId('bio-preview')).not.toBeInTheDocument();
    });

    it('shows default genre for enhanced artist without genre', () => {
      const artist = createMockArtistDisplay({ genre: undefined });
      
      renderWithRouter(<ArtistCard artist={artist} />);
      
      expect(screen.getByText('Independent Artist')).toBeInTheDocument();
    });

    it('shows generic label for simple artist without genre', () => {
      const artist = { id: '1', name: 'Test', imageUrl: '/test.jpg' };
      
      renderWithRouter(<ArtistCard artist={artist as any} />);
      
      expect(screen.getByText('Artist')).toBeInTheDocument();
    });
  });
});