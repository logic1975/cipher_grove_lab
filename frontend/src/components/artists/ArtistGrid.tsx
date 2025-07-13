import React from 'react';
import { ArtistCard } from './ArtistCard';
import type { ArtistDisplay, SimpleArtist } from '../../types';

interface ArtistGridProps {
  artists: (SimpleArtist | ArtistDisplay)[];
  loading?: boolean;
  error?: Error | null;
  className?: string;
}

export const ArtistGrid: React.FC<ArtistGridProps> = ({ 
  artists, 
  loading = false,
  error = null,
  className = '' 
}) => {
  // Handle loading state
  if (loading) {
    return (
      <div className={`artists-grid artists-grid-loading ${className}`}>
        {/* Create skeleton cards for loading state */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={`skeleton-${index}`} className="artist-item-skeleton">
            <div className="skeleton-image" />
            <div className="skeleton-text" />
            <div className="skeleton-text skeleton-text-short" />
          </div>
        ))}
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <div className={`artists-grid-error ${className}`}>
        <p>Error loading artists: {error.message}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }
  
  // Handle empty state
  if (artists.length === 0) {
    return (
      <div className={`artists-grid-empty ${className}`}>
        <p>No artists found.</p>
      </div>
    );
  }

  // Sort artists: featured first (if enhanced), then by name
  const sortedArtists = [...artists].sort((a, b) => {
    // Check if either is featured
    const aFeatured = 'isFeatured' in a ? a.isFeatured : false;
    const bFeatured = 'isFeatured' in b ? b.isFeatured : false;
    
    if (aFeatured && !bFeatured) return -1;
    if (!aFeatured && bFeatured) return 1;
    
    // Then sort by name
    return a.name.localeCompare(b.name);
  });

  return (
    <div className={`artists-grid ${className}`} data-testid="artists-grid">
      {sortedArtists.map((artist, index) => (
        <ArtistCard
          key={artist.id}
          artist={artist}
          index={index}
        />
      ))}
    </div>
  );
};