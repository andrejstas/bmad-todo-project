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
  it('shows empty state message when tasks array is empty', () => {
    renderWithProviders(<TaskList tasks={[]} {...defaultProps} />)
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
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

  it('renders divider when both active and completed tasks exist', () => {
    const tasks = [
      makeTask({ text: 'Active' }),
      makeTask({ text: 'Done', completed: true }),
    ]
    const { container } = renderWithProviders(<TaskList tasks={tasks} {...defaultProps} />)
    expect(container.querySelector('li[role="presentation"]')).toBeInTheDocument()
  })

  it('does not render divider when only active tasks exist', () => {
    const tasks = [makeTask({ text: 'Active 1' }), makeTask({ text: 'Active 2' })]
    const { container } = renderWithProviders(<TaskList tasks={tasks} {...defaultProps} />)
    expect(container.querySelector('li[role="presentation"]')).not.toBeInTheDocument()
  })

  it('does not render divider when only completed tasks exist', () => {
    const tasks = [
      makeTask({ text: 'Done 1', completed: true }),
      makeTask({ text: 'Done 2', completed: true }),
    ]
    const { container } = renderWithProviders(<TaskList tasks={tasks} {...defaultProps} />)
    expect(container.querySelector('li[role="presentation"]')).not.toBeInTheDocument()
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
