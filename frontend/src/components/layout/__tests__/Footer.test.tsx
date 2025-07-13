import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from '../Footer';

describe('Footer Component', () => {
  it('renders minimal footer structure', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    // Check for footer element
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('renders copyright text with current year', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const copyrightText = '© 2025 Cipher Grove Lab. All rights reserved.';
    expect(screen.getByText(copyrightText)).toBeInTheDocument();
  });

  it('renders privacy policy and terms of service text', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText('Privacy Policy | Terms of Service')).toBeInTheDocument();
  });

  it('renders footer with correct CSS structure', () => {
    const { container } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();

    const footerBottom = footer?.querySelector('.footer-bottom');
    expect(footerBottom).toBeInTheDocument();

    const copyrightElements = footerBottom?.querySelectorAll('.copyright');
    expect(copyrightElements).toHaveLength(2);
  });

  it('footer maintains ECM minimal aesthetic', () => {
    const { container } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    // Verify minimal structure matches current implementation
    const footer = container.querySelector('footer');
    const footerBottom = footer?.querySelector('.footer-bottom');
    const copyrightDivs = footerBottom?.querySelectorAll('.copyright');
    
    expect(footer).toBeInTheDocument();
    expect(footerBottom).toBeInTheDocument();
    expect(copyrightDivs).toHaveLength(2);
    
    // Verify content matches current implementation
    expect(copyrightDivs?.[0]?.textContent).toBe('© 2025 Cipher Grove Lab. All rights reserved.');
    expect(copyrightDivs?.[1]?.textContent).toBe('Privacy Policy | Terms of Service');
  });
});