import React, { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { MainNav } from './MainNav';
import { Footer } from './Footer';
import { useNavigationStore } from '../../stores';

export const Layout: React.FC = () => {
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useNavigationStore(state => state.scrollProgress);
  
  // Update scroll indicator width based on store
  useEffect(() => {
    if (scrollIndicatorRef.current) {
      scrollIndicatorRef.current.style.width = `${scrollProgress}%`;
    }
  }, [scrollProgress]);


  return (
    <>
      {/* Scroll Progress Indicator */}
      <div ref={scrollIndicatorRef} className="scroll-indicator" />
      
      <Header />
      <MainNav />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};