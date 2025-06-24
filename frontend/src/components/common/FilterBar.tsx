import React from 'react';

interface FilterBarProps {
  sortOptions: string[];
  filterOptions: string[];
  currentSort: string;
  currentFilter: string;
  onSortChange: (sort: string) => void;
  onFilterChange: (filter: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  sortOptions,
  filterOptions,
  currentSort,
  currentFilter,
  onSortChange,
  onFilterChange,
}) => {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <span className="filter-label">Sort by:</span>
        <div className="filter-options">
          {sortOptions.map((option) => (
            <button
              key={option}
              onClick={() => onSortChange(option)}
              className={currentSort === option ? 'active' : ''}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-label">Filter:</span>
        <div className="filter-options">
          {filterOptions.map((option) => (
            <button
              key={option}
              onClick={() => onFilterChange(option)}
              className={currentFilter === option ? 'active' : ''}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};