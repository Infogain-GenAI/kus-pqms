import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CountBadge } from '@/features/common/CountBadge'

describe('CountBadge', () => {
  it('defaults to the dark (filled) tone', () => {
    render(<CountBadge>3</CountBadge>)
    const badge = screen.getByText('3')
    expect(badge.style.background).toBe('var(--kia-midnight)')
    expect(badge.style.color).toBe('rgb(255, 255, 255)')
  })

  it('renders the light tone when asked', () => {
    render(<CountBadge tone="light">12</CountBadge>)
    const badge = screen.getByText('12')
    expect(badge.style.background).toBe('var(--neutral-100)')
    expect(badge.style.color).toBe('var(--text-secondary)')
  })
})
