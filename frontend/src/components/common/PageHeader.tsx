import React, { useEffect, useRef } from 'react';

interface PageHeaderProps {
  title: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Subtle parallax effect on scroll
    const handleScroll = () => {
      if (titleRef.current) {
        const scrolled = window.pageYOffset;
        titleRef.current.style.transform = `translateY(${scrolled * 0.1}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="page-header">
      <h1 ref={titleRef} className="page-title">
        {title}
      </h1>
    </div>
  );
};