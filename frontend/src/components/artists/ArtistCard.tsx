import React from 'react';
import { Link } from 'react-router-dom';

interface ArtistCardProps {
  artist: {
    id: string;
    name: string;
    genre: string;
    imageUrl: string;
  };
  index: number;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, index }) => {
  // Calculate animation delay based on index for staggered effect
  const animationDelay = `${index * 0.05}s`;

  return (
    <div 
      className="artist-item"
      style={{ animationDelay }}
    >
      <div className="artist-image">
        <img
          src={artist.imageUrl}
          alt={artist.name}
          loading="lazy"
        />
      </div>

      <div className="artist-name">
        <Link to={`/artists/${artist.id}`}>
          {artist.name}
        </Link>
      </div>
      <div className="artist-instrument">
        {artist.genre}
      </div>
    </div>
  );
};