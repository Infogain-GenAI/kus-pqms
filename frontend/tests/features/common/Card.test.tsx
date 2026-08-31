import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Layers } from 'lucide-react'
import { Card } from '@/features/common/Card'

describe('Card', () => {
  it('renders count and label with the default tone/tint, and fires onClick', () => {
    const onClick = vi.fn()
    render(<Card label="My Issues" count={7} icon={Layers} onClick={onClick} />)
    expect(screen.getByText('7')).toBeTruthy()
    expect(screen.getByText('My Issues')).toBeTruthy()
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders a pct badge when provided', () => {
    render(<Card label="Open" count={3} icon={Layers} pct="20%" />)
    expect(screen.getByText('20%')).toBeTruthy()
  })

  it('renders no pct badge when omitted', () => {
    render(<Card label="Open" count={3} icon={Layers} />)
    expect(screen.queryByText(/%$/)).toBeNull()
  })

  it('renders with a custom tone/tint and no onClick', () => {
    render(<Card label="Escalated" count={2} icon={Layers} tone="var(--status-escalated)" tint="var(--danger-50)" pct="10%" />)
    expect(screen.getByText('2')).toBeTruthy()
    expect(screen.getByText('10%')).toBeTruthy()
  })

  it('accepts a string count', () => {
    render(<Card label="Total" count="12+" icon={Layers} />)
    expect(screen.getByText('12+')).toBeTruthy()
  })
})
