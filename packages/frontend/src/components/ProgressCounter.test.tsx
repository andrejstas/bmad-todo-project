import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../test-utils'
import { ProgressCounter } from './ProgressCounter'
import type { Task } from '../api/tasks'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    text: 'Test task',
    completed: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('ProgressCounter', () => {
  it('returns null when tasks array is empty', () => {
    const { container } = renderWithProviders(<ProgressCounter tasks={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('displays correct count', () => {
    const tasks = [
      makeTask({ completed: true }),
      makeTask({ completed: false }),
      makeTask({ completed: true }),
    ]
    renderWithProviders(<ProgressCounter tasks={tasks} />)
    expect(screen.getByText('2 of 3 done')).toBeInTheDocument()
  })

  it('displays all complete', () => {
    const tasks = [makeTask({ completed: true }), makeTask({ completed: true })]
    renderWithProviders(<ProgressCounter tasks={tasks} />)
    expect(screen.getByText('2 of 2 done')).toBeInTheDocument()
  })

  it('has aria-live polite attribute', () => {
    const tasks = [makeTask()]
    renderWithProviders(<ProgressCounter tasks={tasks} />)
    const counter = screen.getByText('0 of 1 done')
    expect(counter).toHaveAttribute('aria-live', 'polite')
  })
})
