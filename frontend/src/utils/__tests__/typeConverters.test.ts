import { describe, it, expect } from 'vitest';
import {
  toDisplayArtist,
  toDisplayArtists,
  fromSimpleArtist,
  toDisplayRelease,
  getBestImageUrl,
  formatDate,
  getSocialPlatformIcon
} from '../typeConverters';
import {
  createMockArtist,
  createMockSimpleArtist,
  createMockRelease,
  createMockArtistWithReleases
} from '../testUtils';

describe('Type Converters', () => {
  describe('toDisplayArtist', () => {
    it('converts numeric ID to string', () => {
      const artist = createMockArtist({ id: 123 });
      const display = toDisplayArtist(artist);
      
      expect(display.id).toBe('123');
      expect(typeof display.id).toBe('string');
    });

    it('preserves all other fields', () => {
      const artist = createMockArtist({
        name: 'Test Artist',
        bio: 'Test bio',
        isFeatured: true
      });
      const display = toDisplayArtist(artist);
      
      expect(display.name).toBe('Test Artist');
      expect(display.bio).toBe('Test bio');
      expect(display.isFeatured).toBe(true);
    });

    it('derives genre from releases', () => {
      const artist = createMockArtistWithReleases();
      const display = toDisplayArtist(artist);
      
      expect(display.genre).toBe('Album Artist');
    });

    it('provides default genre when no releases', () => {
      const artist = createMockArtist({ releases: [] });
      const display = toDisplayArtist(artist);
      
      expect(display.genre).toBe('Independent Artist');
    });
  });

  describe('toDisplayArtists', () => {
    it('converts array of artists', () => {
      const artists = [
        createMockArtist({ id: 1 }),
        createMockArtist({ id: 2 }),
        createMockArtist({ id: 3 })
      ];
      
      const displays = toDisplayArtists(artists);
      
      expect(displays).toHaveLength(3);
      expect(displays[0].id).toBe('1');
      expect(displays[1].id).toBe('2');
      expect(displays[2].id).toBe('3');
    });
  });

  describe('fromSimpleArtist', () => {
    it('converts simple artist to display format', () => {
      const simple = createMockSimpleArtist({
        id: '42',
        name: 'Simple Artist',
        genre: 'Rock'
      });
      
      const display = fromSimpleArtist(simple);
      
      expect(display.id).toBe('42');
      expect(display.name).toBe('Simple Artist');
      expect(display.genre).toBe('Rock');
      expect(display.bio).toBeNull();
      expect(display.socialLinks).toEqual({});
      expect(display.isFeatured).toBe(false);
    });
  });

  describe('toDisplayRelease', () => {
    it('converts release IDs to strings', () => {
      const release = createMockRelease({ id: 456, artistId: 789 });
      const display = toDisplayRelease(release);
      
      expect(display.id).toBe('456');
      expect(display.artistId).toBe('789');
      expect(typeof display.id).toBe('string');
      expect(typeof display.artistId).toBe('string');
    });
  });

  describe('getBestImageUrl', () => {
    it('returns preferred size when available', () => {
      const imageSizes = {
        thumbnail: '/thumb.jpg',
        profile: '/profile.jpg',
        featured: '/featured.jpg'
      };
      
      const url = getBestImageUrl(imageSizes, '/default.jpg', 'profile');
      expect(url).toBe('/profile.jpg');
    });

    it('falls back to other sizes when preferred not available', () => {
      const imageSizes = {
        thumbnail: '/thumb.jpg'
      };
      
      const url = getBestImageUrl(imageSizes, '/default.jpg', 'profile');
      expect(url).toBe('/thumb.jpg');
    });

    it('falls back to main URL when no sizes available', () => {
      const imageSizes = {};
      
      const url = getBestImageUrl(imageSizes, '/default.jpg', 'profile');
      expect(url).toBe('/default.jpg');
    });

    it('returns placeholder when no images available', () => {
      const imageSizes = {};
      
      const url = getBestImageUrl(imageSizes, null, 'profile');
      expect(url).toBe('/images/placeholder-artist.jpg');
    });
  });

  describe('formatDate', () => {
    it('formats date string correctly', () => {
      const formatted = formatDate('2024-03-15');
      expect(formatted).toMatch(/March 15, 2024/);
    });

    it('formats Date object correctly', () => {
      const date = new Date('2024-03-15');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/March 15, 2024/);
    });
  });

  describe('getSocialPlatformIcon', () => {
    it('returns correct icon for known platforms', () => {
      expect(getSocialPlatformIcon('spotify')).toBe('Music');
      expect(getSocialPlatformIcon('youtube')).toBe('Youtube');
      expect(getSocialPlatformIcon('instagram')).toBe('Instagram');
    });

    it('returns default icon for unknown platforms', () => {
      expect(getSocialPlatformIcon('unknown')).toBe('Globe');
    });
  });
});