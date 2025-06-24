import { create } from 'zustand';

export type SortOption = 'A-Z' | 'Z-A' | 'Recent' | 'Genre';
export type FilterOption = 'All' | 'Rock' | 'Electronic' | 'Ambient' | 'Experimental';

interface FilterState {
  // Artists filters
  artistsSortBy: SortOption;
  artistsFilterBy: FilterOption;
  artistsSearchQuery: string;
  
  // Releases filters
  releasesSortBy: 'Recent' | 'Title' | 'Artist';
  releasesFilterBy: 'All' | 'Album' | 'EP' | 'Single';
  releasesSearchQuery: string;
  
  // Artists actions
  setArtistsSortBy: (sort: SortOption) => void;
  setArtistsFilterBy: (filter: FilterOption) => void;
  setArtistsSearchQuery: (query: string) => void;
  resetArtistsFilters: () => void;
  
  // Releases actions
  setReleasesSortBy: (sort: 'Recent' | 'Title' | 'Artist') => void;
  setReleasesFilterBy: (filter: 'All' | 'Album' | 'EP' | 'Single') => void;
  setReleasesSearchQuery: (query: string) => void;
  resetReleasesFilters: () => void;
}

const initialState = {
  artistsSortBy: 'A-Z' as SortOption,
  artistsFilterBy: 'All' as FilterOption,
  artistsSearchQuery: '',
  releasesSortBy: 'Recent' as const,
  releasesFilterBy: 'All' as const,
  releasesSearchQuery: '',
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialState,
  
  // Artists actions
  setArtistsSortBy: (sort) => set({ artistsSortBy: sort }),
  setArtistsFilterBy: (filter) => set({ artistsFilterBy: filter }),
  setArtistsSearchQuery: (query) => set({ artistsSearchQuery: query }),
  resetArtistsFilters: () => set({
    artistsSortBy: initialState.artistsSortBy,
    artistsFilterBy: initialState.artistsFilterBy,
    artistsSearchQuery: initialState.artistsSearchQuery,
  }),
  
  // Releases actions
  setReleasesSortBy: (sort) => set({ releasesSortBy: sort }),
  setReleasesFilterBy: (filter) => set({ releasesFilterBy: filter }),
  setReleasesSearchQuery: (query) => set({ releasesSearchQuery: query }),
  resetReleasesFilters: () => set({
    releasesSortBy: initialState.releasesSortBy,
    releasesFilterBy: initialState.releasesFilterBy,
    releasesSearchQuery: initialState.releasesSearchQuery,
  }),
}));