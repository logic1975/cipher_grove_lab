import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Test component to verify rendering works
const TestComponent = ({ title }: { title: string }) => (
  <div data-testid="test-component">{title}</div>
)

// Mock function to test mocking capabilities
const mockFunction = vi.fn()

describe('Vitest + React Testing Library Configuration', () => {
  it('renders components correctly', () => {
    render(<TestComponent title="Test Title" />)
    expect(screen.getByTestId('test-component')).toBeInTheDocument()
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('supports mocking functions', () => {
    mockFunction('test-arg')
    expect(mockFunction).toHaveBeenCalledWith('test-arg')
    expect(mockFunction).toHaveBeenCalledTimes(1)
  })

  it('can mock modules', async () => {
    const mockConsole = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    console.log('test message')
    expect(mockConsole).toHaveBeenCalledWith('test message')
    
    mockConsole.mockRestore()
  })

  it('supports async testing', async () => {
    const asyncFunction = vi.fn().mockResolvedValue('async result')
    
    const result = await asyncFunction()
    expect(result).toBe('async result')
    expect(asyncFunction).toHaveBeenCalledTimes(1)
  })

  it('provides testing utilities', () => {
    // Test that testing library utilities are available
    expect(screen).toBeDefined()
    expect(render).toBeDefined()
    
    // Test that vitest utilities are available
    expect(vi).toBeDefined()
    expect(expect).toBeDefined()
    expect(describe).toBeDefined()
    expect(it).toBeDefined()
  })
})