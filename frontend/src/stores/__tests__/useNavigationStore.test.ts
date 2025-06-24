import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavigationStore } from '../useNavigationStore';

describe('useNavigationStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useNavigationStore.setState({
      isMobileMenuOpen: false,
      activeSection: null,
      scrollProgress: 0,
    });
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useNavigationStore());
    
    expect(result.current.isMobileMenuOpen).toBe(false);
    expect(result.current.activeSection).toBe(null);
    expect(result.current.scrollProgress).toBe(0);
  });

  it('toggles mobile menu state', () => {
    const { result } = renderHook(() => useNavigationStore());
    
    act(() => {
      result.current.toggleMobileMenu();
    });
    
    expect(result.current.isMobileMenuOpen).toBe(true);
    
    act(() => {
      result.current.toggleMobileMenu();
    });
    
    expect(result.current.isMobileMenuOpen).toBe(false);
  });

  it('closes mobile menu', () => {
    const { result } = renderHook(() => useNavigationStore());
    
    // First open the menu
    act(() => {
      result.current.toggleMobileMenu();
    });
    
    expect(result.current.isMobileMenuOpen).toBe(true);
    
    // Then close it
    act(() => {
      result.current.closeMobileMenu();
    });
    
    expect(result.current.isMobileMenuOpen).toBe(false);
  });

  it('sets active section', () => {
    const { result } = renderHook(() => useNavigationStore());
    
    act(() => {
      result.current.setActiveSection('artists');
    });
    
    expect(result.current.activeSection).toBe('artists');
    
    act(() => {
      result.current.setActiveSection(null);
    });
    
    expect(result.current.activeSection).toBe(null);
  });

  it('sets scroll progress', () => {
    const { result } = renderHook(() => useNavigationStore());
    
    act(() => {
      result.current.setScrollProgress(50);
    });
    
    expect(result.current.scrollProgress).toBe(50);
    
    act(() => {
      result.current.setScrollProgress(100);
    });
    
    expect(result.current.scrollProgress).toBe(100);
  });
});