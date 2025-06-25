import { describe, it, expect } from 'vitest';
import {
  createMockArtist,
  createMockArtistDisplay,
  createMockSimpleArtist,
  createMockRelease,
  createMockSocialLinks,
  createMockStreamingLinks,
  createMockArtists,
  createMockArtistWithReleases
} from '../testUtils';
import { isArtist, isArtistDisplay } from '../../types';

describe('Test Utilities', () => {
  describe('createMockArtist', () => {
    it('creates valid Artist object', () => {
      const artist = createMockArtist();
      
      expect(isArtist(artist)).toBe(true);
      expect(artist.id).toBe(1);
      expect(artist.name).toBe('Test Artist');
      expect(artist.imageSizes).toHaveProperty('thumbnail');
      expect(artist.socialLinks).toHaveProperty('spotify');
    });

    it('accepts overrides', () => {
      const artist = createMockArtist({
        id: 42,
        name: 'Custom Artist',
        isFeatured: true
      });
      
      expect(artist.id).toBe(42);
      expect(artist.name).toBe('Custom Artist');
      expect(artist.isFeatured).toBe(true);
    });

    it('generates correct image paths based on ID', () => {
      const artist = createMockArtist({ id: 5 });
      
      expect(artist.imageSizes.thumbnail).toBe('/uploads/artists/5_thumbnail.webp');
      expect(artist.imageSizes.profile).toBe('/uploads/artists/5_profile.webp');
    });
  });

  describe('createMockArtistDisplay', () => {
    it('creates valid ArtistDisplay object', () => {
      const artist = createMockArtistDisplay();
      
      expect(isArtistDisplay(artist)).toBe(true);
      expect(artist.id).toBe('1');
      expect(typeof artist.id).toBe('string');
      expect(artist.genre).toBe('Alternative Rock');
    });
  });

  describe('createMockSimpleArtist', () => {
    it('creates backward-compatible artist', () => {
      const artist = createMockSimpleArtist();
      
      expect(artist.id).toBe('1');
      expect(artist.name).toBe('Test Artist');
      expect(artist.genre).toBe('Alternative Rock');
      expect(artist.imageUrl).toBe('/images/artists/artist1.png');
      expect(Object.keys(artist)).toHaveLength(4);
    });
  });

  describe('createMockRelease', () => {
    it('creates valid Release object', () => {
      const release = createMockRelease();
      
      expect(release.id).toBe(1);
      expect(release.artistId).toBe(1);
      expect(release.type).toBe('album');
      expect(release.coverArtSizes).toHaveProperty('small');
      expect(release.streamingLinks).toHaveProperty('spotify');
    });

    it('generates correct cover art paths', () => {
      const release = createMockRelease({ id: 3 });
      
      expect(release.coverArtSizes.small).toBe('/uploads/releases/3_small.webp');
      expect(release.coverArtSizes.medium).toBe('/uploads/releases/3_medium.webp');
      expect(release.coverArtSizes.large).toBe('/uploads/releases/3_large.webp');
    });
  });

  describe('createMockSocialLinks', () => {
    it('creates complete social links object', () => {
      const links = createMockSocialLinks();
      
      expect(links).toHaveProperty('spotify');
      expect(links).toHaveProperty('instagram');
      expect(links).toHaveProperty('youtube');
      expect(links).toHaveProperty('tiktok');
      expect(Object.keys(links)).toHaveLength(8);
    });

    it('creates valid URLs', () => {
      const links = createMockSocialLinks();
      
      expect(links.spotify).toMatch(/^https:\/\/open\.spotify\.com/);
      expect(links.instagram).toMatch(/^https:\/\/instagram\.com/);
    });
  });

  describe('createMockStreamingLinks', () => {
    it('creates complete streaming links object', () => {
      const links = createMockStreamingLinks();
      
      expect(links).toHaveProperty('spotify');
      expect(links).toHaveProperty('appleMusic');
      expect(links).toHaveProperty('bandcamp');
      expect(Object.keys(links)).toHaveLength(5);
    });
  });

  describe('createMockArtists', () => {
    it('creates array of artists with varied data', () => {
      const artists = createMockArtists(5);
      
      expect(artists).toHaveLength(5);
      expect(artists[0].isFeatured).toBe(true);
      expect(artists[1].isFeatured).toBe(true);
      expect(artists[2].isFeatured).toBe(false);
    });

    it('varies social links and bio', () => {
      const artists = createMockArtists(3);
      
      expect(artists[0].bio).not.toBeNull();
      expect(artists[1].bio).toBeNull();
      expect(Object.keys(artists[0].socialLinks)).toHaveLength(0);
      expect(Object.keys(artists[1].socialLinks).length).toBeGreaterThan(0);
    });
  });

  describe('createMockArtistWithReleases', () => {
    it('creates artist with multiple releases', () => {
      const artist = createMockArtistWithReleases();
      
      expect(artist.releases).toHaveLength(3);
      expect(artist.releases![0].type).toBe('album');
      expect(artist.releases![1].type).toBe('single');
      expect(artist.releases![2].type).toBe('ep');
    });

    it('sets correct artist ID on releases', () => {
      const artist = createMockArtistWithReleases();
      
      artist.releases!.forEach(release => {
        expect(release.artistId).toBe(artist.id);
      });
    });
  });
});