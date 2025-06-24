import React from 'react';
import { ArtistCard } from './ArtistCard';

interface Artist {
  id: string;
  name: string;
  genre: string;
  imageUrl: string;
}

interface ArtistGridProps {
  artists: Artist[];
}

export const ArtistGrid: React.FC<ArtistGridProps> = ({ artists }) => {
  return (
    <div className="artists-grid">
      {artists.map((artist, index) => (
        <ArtistCard
          key={artist.id}
          artist={artist}
          index={index}
        />
      ))}
    </div>
  );
};