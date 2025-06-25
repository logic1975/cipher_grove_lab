import React from 'react';
import { Link } from 'react-router-dom';
import { ArtistDisplay } from '../../types';
import { getBestImageUrl, formatDate } from '../../utils/typeConverters';

interface ArtistProfileProps {
  artist: ArtistDisplay;
  showReleases?: boolean;
  className?: string;
}

export const ArtistProfile: React.FC<ArtistProfileProps> = ({ 
  artist, 
  showReleases = true,
  className = '' 
}) => {
  const profileImageUrl = getBestImageUrl(
    artist.imageSizes, 
    artist.imageUrl, 
    'profile'
  );

  return (
    <div className={`artist-profile ${className}`} data-testid="artist-profile">
      {/* Hero Section */}
      <div className="artist-hero">
        {artist.isFeatured && (
          <div className="artist-featured-banner" data-testid="featured-banner">
            Featured Artist
          </div>
        )}
        
        <div className="artist-hero-content">
          <div className="artist-profile-image">
            <img
              src={profileImageUrl}
              alt={artist.imageAlt || artist.name}
              loading="eager"
            />
          </div>
          
          <div className="artist-profile-info">
            <h1 className="artist-profile-name">{artist.name}</h1>
            
            {artist.genre && (
              <div className="artist-profile-genre">{artist.genre}</div>
            )}
            
            {artist.bio && (
              <div className="artist-profile-bio">
                {artist.bio}
              </div>
            )}
            
            {/* Social Links */}
            {artist.socialLinks && Object.keys(artist.socialLinks).length > 0 && (
              <div className="artist-social-links" data-testid="social-links">
                {Object.entries(artist.socialLinks).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`social-link social-link-${platform}`}
                    aria-label={`${artist.name} on ${platform}`}
                    data-testid={`social-link-${platform}`}
                  >
                    <span className={`social-icon social-icon-${platform}`} />
                    <span className="social-label">{platform}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Releases Section */}
      {showReleases && artist.releases && artist.releases.length > 0 && (
        <div className="artist-releases">
          <h2 className="section-title">Releases</h2>
          
          <div className="releases-grid">
            {artist.releases.map((release) => (
              <div key={release.id} className="release-card" data-testid="release-card">
                <div className="release-cover">
                  <img
                    src={getBestImageUrl(
                      release.coverArtSizes,
                      release.coverArtUrl,
                      'medium'
                    )}
                    alt={release.coverArtAlt || release.title}
                    loading="lazy"
                  />
                  <div className="release-type-badge">
                    {release.type}
                  </div>
                </div>
                
                <div className="release-info">
                  <h3 className="release-title">
                    <Link to={`/releases/${release.id}`}>
                      {release.title}
                    </Link>
                  </h3>
                  
                  <div className="release-date">
                    {formatDate(release.releaseDate)}
                  </div>
                  
                  {/* Streaming Links */}
                  {release.streamingLinks && Object.keys(release.streamingLinks).length > 0 && (
                    <div className="release-streaming-links">
                      {Object.entries(release.streamingLinks).slice(0, 3).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`streaming-link streaming-link-${platform}`}
                          aria-label={`Listen to ${release.title} on ${platform}`}
                        >
                          <span className={`streaming-icon streaming-icon-${platform}`} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Back to Artists Link */}
      <div className="artist-profile-footer">
        <Link to="/artists" className="back-link">
          ← Back to All Artists
        </Link>
      </div>
    </div>
  );
};