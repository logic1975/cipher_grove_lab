import { create } from 'zustand';

interface NavigationState {
  isMobileMenuOpen: boolean;
  activeSection: string | null;
  scrollProgress: number;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  setActiveSection: (section: string | null) => void;
  setScrollProgress: (progress: number) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  isMobileMenuOpen: false,
  activeSection: null,
  scrollProgress: 0,
  
  toggleMobileMenu: () => set((state) => ({ 
    isMobileMenuOpen: !state.isMobileMenuOpen 
  })),
  
  closeMobileMenu: () => set({ 
    isMobileMenuOpen: false 
  }),
  
  setActiveSection: (section) => set({ 
    activeSection: section 
  }),
  
  setScrollProgress: (progress) => set({ 
    scrollProgress: progress 
  }),
}));