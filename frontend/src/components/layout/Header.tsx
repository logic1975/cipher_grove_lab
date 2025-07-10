import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigationStore } from '../../stores';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, setScrollProgress } = useNavigationStore();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
      
      // Update scroll progress in store
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (window.scrollY / scrollHeight) * 100;
      setScrollProgress(scrollPercentage);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setScrollProgress]);

  return (
    <>
      <header className={`header ${isScrolled ? 'scrolled' : ''}`} role="banner">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo" onClick={closeMobileMenu}>
            CIPHER GROVE LAB
          </Link>

          {/* Desktop Navigation */}
          <nav className="header-nav">
            <Link to="/artists">Artists</Link>
            <Link to="/releases">Releases</Link>
            <Link to="/concerts">Concerts</Link>
            <Link to="/about">About</Link>
            <span className="search-toggle">Search</span>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`}>
        <Link to="/artists" className="mobile-nav-link" onClick={closeMobileMenu}>
          Artists
        </Link>
        <Link to="/releases" className="mobile-nav-link" onClick={closeMobileMenu}>
          Releases
        </Link>
        <Link to="/concerts" className="mobile-nav-link" onClick={closeMobileMenu}>
          Concerts
        </Link>
        <Link to="/about" className="mobile-nav-link" onClick={closeMobileMenu}>
          About
        </Link>
      </nav>
    </>
  );
};