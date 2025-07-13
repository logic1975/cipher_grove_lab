import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { FilterBar } from '../components/common/FilterBar';
import { ArtistGrid } from '../components/artists/ArtistGrid';
import { LoadMoreButton } from '../components/common/LoadMoreButton';
import { useFilterStore } from '../stores';

// Temporary mock data - will be replaced with API data
const mockArtists = [
  { id: '1', name: 'The Midnight Echo', genre: 'Alternative Rock', imageUrl: '/images/artists/artist1.png' },
  { id: '2', name: 'Velvet Shadows', genre: 'Electronic', imageUrl: '/images/artists/artist2.png' },
  { id: '3', name: 'Neon Pulse', genre: 'Synthwave', imageUrl: '/images/artists/artist3.png' },
  { id: '4', name: 'Echo Chamber', genre: 'Ambient', imageUrl: '/images/artists/artist4.png' },
  { id: '5', name: 'Crystal Void', genre: 'Post-Rock', imageUrl: '/images/artists/artist5.png' },
  { id: '6', name: 'Digital Phantoms', genre: 'Techno', imageUrl: '/images/artists/artist6.png' },
  { id: '7', name: 'Lunar Drift', genre: 'Experimental', imageUrl: '/images/artists/artist7.png' },
  { id: '8', name: 'Solar Fields', genre: 'Ambient Electronic', imageUrl: '/images/artists/artist8.png' },
  { id: '9', name: 'Aurora Waves', genre: 'Dream Pop', imageUrl: '/images/artists/artist9.png' },
];

export const ArtistsPage: React.FC = () => {
  const { 
    artistsSortBy, 
    artistsFilterBy, 
    setArtistsSortBy, 
    setArtistsFilterBy 
  } = useFilterStore();
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter and sort artists based on current state
  const filteredAndSortedArtists = useMemo(() => {
    let filtered = [...mockArtists];
    
    // Apply genre filter
    if (artistsFilterBy !== 'All') {
      const genreMap: Record<string, string[]> = {
        'Rock': ['Alternative Rock', 'Post-Rock'],
        'Electronic': ['Electronic', 'Synthwave', 'Techno', 'Ambient Electronic'],
        'Ambient': ['Ambient', 'Ambient Electronic'],
        'Experimental': ['Experimental', 'Dream Pop']
      };
      
      const allowedGenres = genreMap[artistsFilterBy] || [];
      filtered = filtered.filter(artist => 
        allowedGenres.some(genre => artist.genre.includes(genre))
      );
    }
    
    // Apply sorting
    switch (artistsSortBy) {
      case 'A-Z':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Z-A':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'Genre':
        filtered.sort((a, b) => a.genre.localeCompare(b.genre));
        break;
      case 'Recent':
        // In real app, would sort by creation date
        filtered.reverse();
        break;
    }
    
    return filtered;
  }, [artistsSortBy, artistsFilterBy]);

  const handleLoadMore = () => {
    setIsLoading(true);
    // Simulate loading more artists
    setTimeout(() => {
      setIsLoading(false);
      // In real app, fetch more artists from API
    }, 1000);
  };

  return (
    <div>
      <PageHeader title="Artists" />
      
      <FilterBar
        sortOptions={['A-Z', 'Z-A', 'Recent', 'Genre']}
        filterOptions={['All', 'Rock', 'Electronic', 'Ambient', 'Experimental']}
        currentSort={artistsSortBy}
        currentFilter={artistsFilterBy}
        onSortChange={(sort) => setArtistsSortBy(sort as any)}
        onFilterChange={(filter) => setArtistsFilterBy(filter as any)}
      />

      <div className="artists-container">
        <ArtistGrid artists={filteredAndSortedArtists} />
      </div>

      <div className="load-more">
        <LoadMoreButton onClick={handleLoadMore} isLoading={isLoading} />
      </div>
    </div>
  );
};