import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilterStore } from '../useFilterStore';

describe('useFilterStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useFilterStore.setState({
      artistsSortBy: 'A-Z',
      artistsFilterBy: 'All',
      artistsSearchQuery: '',
      releasesSortBy: 'Recent',
      releasesFilterBy: 'All',
      releasesSearchQuery: '',
    });
  });

  describe('Artists filters', () => {
    it('initializes with correct default values', () => {
      const { result } = renderHook(() => useFilterStore());
      
      expect(result.current.artistsSortBy).toBe('A-Z');
      expect(result.current.artistsFilterBy).toBe('All');
      expect(result.current.artistsSearchQuery).toBe('');
    });

    it('sets artists sort by', () => {
      const { result } = renderHook(() => useFilterStore());
      
      act(() => {
        result.current.setArtistsSortBy('Genre');
      });
      
      expect(result.current.artistsSortBy).toBe('Genre');
    });

    it('sets artists filter by', () => {
      const { result } = renderHook(() => useFilterStore());
      
      act(() => {
        result.current.setArtistsFilterBy('Electronic');
      });
      
      expect(result.current.artistsFilterBy).toBe('Electronic');
    });

    it('sets artists search query', () => {
      const { result } = renderHook(() => useFilterStore());
      
      act(() => {
        result.current.setArtistsSearchQuery('midnight');
      });
      
      expect(result.current.artistsSearchQuery).toBe('midnight');
    });

    it('resets artists filters', () => {
      const { result } = renderHook(() => useFilterStore());
      
      // First change some values
      act(() => {
        result.current.setArtistsSortBy('Recent');
        result.current.setArtistsFilterBy('Rock');
        result.current.setArtistsSearchQuery('test');
      });
      
      // Then reset
      act(() => {
        result.current.resetArtistsFilters();
      });
      
      expect(result.current.artistsSortBy).toBe('A-Z');
      expect(result.current.artistsFilterBy).toBe('All');
      expect(result.current.artistsSearchQuery).toBe('');
    });
  });

  describe('Releases filters', () => {
    it('initializes with correct default values', () => {
      const { result } = renderHook(() => useFilterStore());
      
      expect(result.current.releasesSortBy).toBe('Recent');
      expect(result.current.releasesFilterBy).toBe('All');
      expect(result.current.releasesSearchQuery).toBe('');
    });

    it('sets releases sort by', () => {
      const { result } = renderHook(() => useFilterStore());
      
      act(() => {
        result.current.setReleasesSortBy('Title');
      });
      
      expect(result.current.releasesSortBy).toBe('Title');
    });

    it('sets releases filter by', () => {
      const { result } = renderHook(() => useFilterStore());
      
      act(() => {
        result.current.setReleasesFilterBy('Album');
      });
      
      expect(result.current.releasesFilterBy).toBe('Album');
    });

    it('sets releases search query', () => {
      const { result } = renderHook(() => useFilterStore());
      
      act(() => {
        result.current.setReleasesSearchQuery('neon');
      });
      
      expect(result.current.releasesSearchQuery).toBe('neon');
    });

    it('resets releases filters', () => {
      const { result } = renderHook(() => useFilterStore());
      
      // First change some values
      act(() => {
        result.current.setReleasesSortBy('Artist');
        result.current.setReleasesFilterBy('EP');
        result.current.setReleasesSearchQuery('test');
      });
      
      // Then reset
      act(() => {
        result.current.resetReleasesFilters();
      });
      
      expect(result.current.releasesSortBy).toBe('Recent');
      expect(result.current.releasesFilterBy).toBe('All');
      expect(result.current.releasesSearchQuery).toBe('');
    });
  });
});