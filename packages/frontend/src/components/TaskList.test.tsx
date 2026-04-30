import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../test-utils'
import { TaskList } from './TaskList'
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

const defaultProps = {
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  onEdit: vi.fn(),
}

describe('TaskList', () => {
  it('returns null when tasks array is empty', () => {
    const { container } = renderWithProviders(<TaskList tasks={[]} {...defaultProps} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders active tasks', () => {
    const tasks = [makeTask({ text: 'Active task' })]
    renderWithProviders(<TaskList tasks={tasks} {...defaultProps} />)
    expect(screen.getByText('Active task')).toBeInTheDocument()
  })

  it('renders both active and completed tasks', () => {
    const tasks = [
      makeTask({ text: 'Active task' }),
      makeTask({ text: 'Done task', completed: true }),
    ]
    renderWithProviders(<TaskList tasks={tasks} {...defaultProps} />)
    expect(screen.getByText('Active task')).toBeInTheDocument()
    expect(screen.getByText('Done task')).toBeInTheDocument()
  })

  it('renders separator when both active and completed tasks exist', () => {
    const tasks = [
      makeTask({ text: 'Active' }),
      makeTask({ text: 'Done', completed: true }),
    ]
    renderWithProviders(<TaskList tasks={tasks} {...defaultProps} />)
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('does not render separator when only active tasks exist', () => {
    const tasks = [makeTask({ text: 'Active 1' }), makeTask({ text: 'Active 2' })]
    renderWithProviders(<TaskList tasks={tasks} {...defaultProps} />)
    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
  })

  it('does not render separator when only completed tasks exist', () => {
    const tasks = [
      makeTask({ text: 'Done 1', completed: true }),
      makeTask({ text: 'Done 2', completed: true }),
    ]
    renderWithProviders(<TaskList tasks={tasks} {...defaultProps} />)
    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
  })

  it('renders as a list with role="list"', () => {
    const tasks = [makeTask()]
    renderWithProviders(<TaskList tasks={tasks} {...defaultProps} />)
    expect(screen.getByRole('list')).toBeInTheDocument()
  })

  it('has aria-live polite on list', () => {
    const tasks = [makeTask()]
    renderWithProviders(<TaskList tasks={tasks} {...defaultProps} />)
    expect(screen.getByRole('list')).toHaveAttribute('aria-live', 'polite')
  })
})
