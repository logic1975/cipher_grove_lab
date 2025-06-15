import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  // Theme state
  darkMode: boolean;
  
  // User preferences
  preferences: {
    autoplay: boolean;
    showLyrics: boolean;
    preferredQuality: 'low' | 'medium' | 'high';
    notificationsEnabled: boolean;
  };
  
  // UI state
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  
  // Search state
  searchQuery: string;
  searchResults: {
    artists: any[];
    releases: any[];
    news: any[];
  };
  searchLoading: boolean;
  
  // Navigation state
  currentPage: string;
  breadcrumbs: Array<{ label: string; path: string }>;
  
  // Actions
  toggleDarkMode: () => void;
  updatePreferences: (preferences: Partial<AppState['preferences']>) => void;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  toggleSearch: () => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: AppState['searchResults']) => void;
  setSearchLoading: (loading: boolean) => void;
  setCurrentPage: (page: string) => void;
  setBreadcrumbs: (breadcrumbs: AppState['breadcrumbs']) => void;
  resetSearch: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        darkMode: true, // Default to dark mode for music label aesthetic
        preferences: {
          autoplay: true,
          showLyrics: false,
          preferredQuality: 'high',
          notificationsEnabled: true,
        },
        sidebarOpen: false,
        mobileMenuOpen: false,
        searchOpen: false,
        searchQuery: '',
        searchResults: {
          artists: [],
          releases: [],
          news: [],
        },
        searchLoading: false,
        currentPage: 'home',
        breadcrumbs: [],

        // Actions
        toggleDarkMode: () => {
          const newDarkMode = !get().darkMode;
          set({ darkMode: newDarkMode });
          
          // Update HTML class for CSS
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', newDarkMode);
          }
        },

        updatePreferences: (newPreferences) => {
          set({
            preferences: {
              ...get().preferences,
              ...newPreferences,
            },
          });
        },

        toggleSidebar: () => {
          set({ sidebarOpen: !get().sidebarOpen });
        },

        toggleMobileMenu: () => {
          set({ mobileMenuOpen: !get().mobileMenuOpen });
        },

        toggleSearch: () => {
          const newSearchOpen = !get().searchOpen;
          set({ searchOpen: newSearchOpen });
          
          // Clear search when closing
          if (!newSearchOpen) {
            get().resetSearch();
          }
        },

        setSearchQuery: (query: string) => {
          set({ searchQuery: query });
        },

        setSearchResults: (results) => {
          set({ searchResults: results });
        },

        setSearchLoading: (loading: boolean) => {
          set({ searchLoading: loading });
        },

        setCurrentPage: (page: string) => {
          set({ currentPage: page });
        },

        setBreadcrumbs: (breadcrumbs) => {
          set({ breadcrumbs });
        },

        resetSearch: () => {
          set({
            searchQuery: '',
            searchResults: {
              artists: [],
              releases: [],
              news: [],
            },
            searchLoading: false,
          });
        },
      }),
      {
        name: 'app-store',
        // Only persist certain values
        partialize: (state) => ({
          darkMode: state.darkMode,
          preferences: state.preferences,
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
);

// Selector hooks for common use cases
export const useTheme = () => useAppStore((state) => state.darkMode);
export const usePreferences = () => useAppStore((state) => state.preferences);
export const useSearch = () => useAppStore((state) => ({
  query: state.searchQuery,
  results: state.searchResults,
  loading: state.searchLoading,
  isOpen: state.searchOpen,
}));
export const useNavigation = () => useAppStore((state) => ({
  currentPage: state.currentPage,
  breadcrumbs: state.breadcrumbs,
  sidebarOpen: state.sidebarOpen,
  mobileMenuOpen: state.mobileMenuOpen,
}));