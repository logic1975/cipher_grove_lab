import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const footerSections = [
    {
      title: 'Explore',
      links: [
        { label: 'New Releases', path: '/releases/new' },
        { label: 'Coming Soon', path: '/releases/upcoming' },
        { label: 'Best Sellers', path: '/releases/best' },
        { label: 'Complete Catalog', path: '/releases' },
      ],
    },
    {
      title: 'About',
      links: [
        { label: 'Our Story', path: '/about' },
        { label: 'Contact', path: '/contact' },
        { label: 'Press', path: '/press' },
        { label: 'Careers', path: '/careers' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'FAQ', path: '/faq' },
        { label: 'Shipping', path: '/shipping' },
        { label: 'Returns', path: '/returns' },
        { label: 'Terms', path: '/terms' },
      ],
    },
    {
      title: 'Connect',
      links: [
        { label: 'Newsletter', path: '/newsletter' },
        { label: 'Instagram', path: 'https://instagram.com', external: true },
        { label: 'Facebook', path: 'https://facebook.com', external: true },
        { label: 'Spotify', path: 'https://spotify.com', external: true },
      ],
    },
  ];

  return (
    <footer>
      <div className="footer-content">
        {footerSections.map((section) => (
          <div key={section.title} className="footer-section">
            <h4>{section.title}</h4>
            <ul className="footer-links">
              {section.links.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.path}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <div className="copyright">
          © {new Date().getFullYear()} Cipher Grove Lab. All rights reserved.
        </div>
        <div className="copyright">
          <Link to="/privacy">Privacy Policy</Link>
          {' | '}
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};