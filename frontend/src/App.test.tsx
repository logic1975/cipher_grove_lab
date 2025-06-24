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
    // Check for header navigation links (both desktop and mobile versions exist)
    const newsLinks = screen.getAllByRole('link', { name: 'News' })
    const concertsLinks = screen.getAllByRole('link', { name: 'Concerts' })
    const shopLinks = screen.getAllByRole('link', { name: 'Shop' })
    const aboutLinks = screen.getAllByRole('link', { name: 'About' })
    
    // Should have 2 of each (desktop + mobile)
    expect(newsLinks).toHaveLength(2)
    expect(concertsLinks).toHaveLength(2)
    expect(shopLinks).toHaveLength(2)
    expect(aboutLinks).toHaveLength(2)
  })

  it('renders main navigation', () => {
    render(<App />)
    // Check for main navigation links
    expect(screen.getByRole('link', { name: 'Artists' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Releases' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Series' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Stories' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sounds' })).toBeInTheDocument()
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