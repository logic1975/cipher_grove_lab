import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />)
    // Check for the site logo/title
    expect(screen.getByText('CIPHER GROVE LAB')).toBeInTheDocument()
  })

  it('renders header navigation', () => {
    render(<App />)
    // Check for header navigation links
    // Note: Artists appears in header (desktop + mobile)
    const artistsLinks = screen.getAllByRole('link', { name: 'Artists' })
    expect(artistsLinks.length).toBeGreaterThanOrEqual(2)
    
    // Note: Releases appears in header (desktop + mobile)
    const releasesLinks = screen.getAllByRole('link', { name: 'Releases' })
    expect(releasesLinks.length).toBeGreaterThanOrEqual(2)
    
    // Note: Concerts appears in header (desktop + mobile)
    const concertsLinks = screen.getAllByRole('link', { name: 'Concerts' })
    expect(concertsLinks.length).toBeGreaterThanOrEqual(2)
    
    // About appears in header (desktop + mobile)
    const aboutLinks = screen.getAllByRole('link', { name: 'About' })
    expect(aboutLinks.length).toBeGreaterThanOrEqual(2)
  })

  it('renders main navigation', () => {
    render(<App />)
    // Check for navigation links in header (desktop + mobile)
    // Note: Navigation is cleanly handled in header only
    const artistsLinks = screen.getAllByRole('link', { name: 'Artists' })
    expect(artistsLinks.length).toBeGreaterThanOrEqual(2)
    
    // Note: Releases appears in header (desktop + mobile)
    const releasesLinks = screen.getAllByRole('link', { name: 'Releases' })
    expect(releasesLinks.length).toBeGreaterThanOrEqual(2)
    
    // Note: Concerts appears in header (desktop + mobile)
    const concertsLinks = screen.getAllByRole('link', { name: 'Concerts' })
    expect(concertsLinks.length).toBeGreaterThanOrEqual(2)
    
    // Note: About appears in header (desktop + mobile)
    const aboutLinks = screen.getAllByRole('link', { name: 'About' })
    expect(aboutLinks.length).toBeGreaterThanOrEqual(2)
  })

  it('renders layout structure', () => {
    render(<App />)
    // Check for main layout elements
    expect(screen.getByRole('banner')).toBeInTheDocument() // header
    expect(screen.getByRole('main')).toBeInTheDocument() // main content
    expect(screen.getByRole('contentinfo')).toBeInTheDocument() // footer
  })

  it('renders footer content', () => {
    render(<App />)
    // Check for footer text
    expect(screen.getByText(/© \d{4} Cipher Grove Lab/)).toBeInTheDocument()
  })

  it('default route shows artists page', () => {
    render(<App />)
    // The default route should show the artists page header
    expect(screen.getByRole('heading', { name: 'Artists', level: 1 })).toBeInTheDocument()
  })
})