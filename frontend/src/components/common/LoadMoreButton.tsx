import React from 'react';

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ 
  onClick, 
  isLoading = false 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : 'Load More Artists'}
    </button>
  );
};