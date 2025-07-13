import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ArtistDisplay, SimpleArtist } from '../../types';
import { isEnhancedArtist } from '../../types';
import { getBestImageUrl } from '../../utils/typeConverters';

interface ArtistCardProps {
  artist: SimpleArtist | ArtistDisplay;
  index?: number;
  className?: string;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ 
  artist, 
  index = 0,
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Calculate animation delay based on index for staggered effect
  const animationDelay = `${index * 0.05}s`;
  
  // Check if this is an enhanced artist with additional features
  const isEnhanced = isEnhancedArtist(artist);
  
  // Get the best image URL based on available sizes
  const imageUrl = isEnhanced && artist.imageSizes
    ? getBestImageUrl(artist.imageSizes, artist.imageUrl, 'thumbnail')
    : artist.imageUrl;
    
  // Handle image error by falling back to placeholder
  const handleImageError = () => {
    setImageError(true);
  };
  
  const displayImageUrl = imageError ? '/images/placeholder-artist.jpg' : imageUrl;

  return (
    <div 
      className={`artist-item ${className}`}
      style={{ animationDelay }}
      data-testid="artist-card"
    >
      {/* Featured badge for enhanced artists */}
      {isEnhanced && artist.isFeatured && (
        <div className="artist-featured-badge" data-testid="featured-badge">
          Featured
        </div>
      )}
      
      <div className="artist-image">
        <img
          src={displayImageUrl}
          alt={isEnhanced ? artist.imageAlt || artist.name : artist.name}
          loading="lazy"
          onError={handleImageError}
          data-testid="artist-image"
        />
        
        {/* Social links preview for enhanced artists */}
        {isEnhanced && artist.socialLinks && Object.keys(artist.socialLinks).length > 0 && (
          <div className="artist-social-preview" data-testid="social-preview">
            {Object.keys(artist.socialLinks).slice(0, 3).map(platform => (
              <span key={platform} className={`social-icon social-icon-${platform}`} />
            ))}
            {Object.keys(artist.socialLinks).length > 3 && (
              <span className="social-more">+{Object.keys(artist.socialLinks).length - 3}</span>
            )}
          </div>
        )}
      </div>

      <div className="artist-info">
        <div className="artist-name">
          <Link to={`/artists/${artist.id}`}>
            {artist.name}
          </Link>
        </div>
        
        <div className="artist-instrument">
          {artist.genre || (isEnhanced ? 'Independent Artist' : 'Artist')}
        </div>
        
        {/* Bio preview for enhanced artists */}
        {isEnhanced && artist.bio && (
          <div className="artist-bio-preview" data-testid="bio-preview">
            {artist.bio.substring(0, 100)}
            {artist.bio.length > 100 && '...'}
          </div>
        )}
      </div>
    </div>
  );
};