import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from '../Footer';

describe('Footer Component', () => {
  it('renders all footer sections', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Connect')).toBeInTheDocument();
  });

  it('renders explore section links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText('New Releases')).toBeInTheDocument();
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    expect(screen.getByText('Best Sellers')).toBeInTheDocument();
    expect(screen.getByText('Complete Catalog')).toBeInTheDocument();
  });

  it('renders about section links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText('Our Story')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Press')).toBeInTheDocument();
    expect(screen.getByText('Careers')).toBeInTheDocument();
  });

  it('renders support section links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText('FAQ')).toBeInTheDocument();
    expect(screen.getByText('Shipping')).toBeInTheDocument();
    expect(screen.getByText('Returns')).toBeInTheDocument();
    expect(screen.getAllByText('Terms')[0]).toBeInTheDocument();
  });

  it('renders connect section links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText('Newsletter')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Spotify')).toBeInTheDocument();
  });

  it('renders internal links with correct paths', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const newReleasesLink = screen.getByText('New Releases').closest('a');
    expect(newReleasesLink).toHaveAttribute('href', '/releases/new');

    const contactLink = screen.getByText('Contact').closest('a');
    expect(contactLink).toHaveAttribute('href', '/contact');

    const faqLink = screen.getByText('FAQ').closest('a');
    expect(faqLink).toHaveAttribute('href', '/faq');

    const newsletterLink = screen.getByText('Newsletter').closest('a');
    expect(newsletterLink).toHaveAttribute('href', '/newsletter');
  });

  it('renders external links with correct attributes', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const instagramLink = screen.getByText('Instagram').closest('a');
    expect(instagramLink).toHaveAttribute('href', 'https://instagram.com');
    expect(instagramLink).toHaveAttribute('target', '_blank');
    expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer');

    const facebookLink = screen.getByText('Facebook').closest('a');
    expect(facebookLink).toHaveAttribute('href', 'https://facebook.com');
    expect(facebookLink).toHaveAttribute('target', '_blank');
    expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer');

    const spotifyLink = screen.getByText('Spotify').closest('a');
    expect(spotifyLink).toHaveAttribute('href', 'https://spotify.com');
    expect(spotifyLink).toHaveAttribute('target', '_blank');
    expect(spotifyLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders copyright text with current year', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const currentYear = new Date().getFullYear();
    const copyrightText = `© ${currentYear} Cipher Grove Lab. All rights reserved.`;
    expect(screen.getByText(copyrightText)).toBeInTheDocument();
  });

  it('renders footer bottom links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const privacyLink = screen.getByText('Privacy Policy');
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink.closest('a')).toHaveAttribute('href', '/privacy');

    const termsLink = screen.getByText('Terms of Service');
    expect(termsLink).toBeInTheDocument();
    expect(termsLink.closest('a')).toHaveAttribute('href', '/terms');
  });

  it('renders footer with correct structure', () => {
    const { container } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();

    const footerContent = footer?.querySelector('.footer-content');
    expect(footerContent).toBeInTheDocument();

    const footerSections = footerContent?.querySelectorAll('.footer-section');
    expect(footerSections).toHaveLength(4);

    const footerBottom = footer?.querySelector('.footer-bottom');
    expect(footerBottom).toBeInTheDocument();
  });
});