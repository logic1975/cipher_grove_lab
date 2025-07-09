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
    // Note: Concerts appears in header (desktop + mobile) and main nav
    const concertsLinks = screen.getAllByRole('link', { name: 'Concerts' })
    expect(concertsLinks.length).toBeGreaterThanOrEqual(2)
    
    // About appears in header, main nav, and footer
    const aboutLinks = screen.getAllByRole('link', { name: 'About' })
    expect(aboutLinks.length).toBeGreaterThanOrEqual(2)
  })

  it('renders main navigation', () => {
    render(<App />)
    // Check for main navigation links
    expect(screen.getByRole('link', { name: 'Artists' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Releases' })).toBeInTheDocument()
    // Note: there are multiple "Concerts" links (header + main nav)
    const concertsLinks = screen.getAllByRole('link', { name: 'Concerts' })
    expect(concertsLinks.length).toBeGreaterThan(0)
    // Note: there are multiple "About" links (header + main nav + footer)
    const aboutLinks = screen.getAllByRole('link', { name: 'About' })
    expect(aboutLinks.length).toBeGreaterThan(0)
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