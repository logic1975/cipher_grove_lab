import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText('Vite + React')).toBeInTheDocument()
  })

  it('displays initial counter value', () => {
    render(<App />)
    expect(screen.getByText('count is 0')).toBeInTheDocument()
  })

  it('increments counter when button is clicked', () => {
    render(<App />)
    const button = screen.getByRole('button', { name: /count is/i })
    
    fireEvent.click(button)
    expect(screen.getByText('count is 1')).toBeInTheDocument()
    
    fireEvent.click(button)
    expect(screen.getByText('count is 2')).toBeInTheDocument()
  })

  it('displays correct logos and links', () => {
    render(<App />)
    
    const viteLogo = screen.getByAltText('Vite logo')
    const reactLogo = screen.getByAltText('React logo')
    
    expect(viteLogo).toBeInTheDocument()
    expect(reactLogo).toBeInTheDocument()
    
    expect(viteLogo.closest('a')).toHaveAttribute('href', 'https://vite.dev')
    expect(reactLogo.closest('a')).toHaveAttribute('href', 'https://react.dev')
  })

  it('displays HMR instruction text', () => {
    render(<App />)
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Edit src/App.tsx and save to test HMR'
    })).toBeInTheDocument()
  })

  it('displays learn more instruction', () => {
    render(<App />)
    expect(screen.getByText('Click on the Vite and React logos to learn more')).toBeInTheDocument()
  })
})