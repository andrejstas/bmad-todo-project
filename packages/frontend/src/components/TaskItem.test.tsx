import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../test-utils'
import { TaskItem } from './TaskItem'
import type { Task } from '../api/tasks'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'test-id-1',
    text: 'Buy milk',
    completed: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('TaskItem', () => {
  const defaultProps = {
    onToggle: vi.fn(),
    onDelete: vi.fn(),
    onEdit: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders task text', () => {
    renderWithProviders(<TaskItem task={makeTask()} {...defaultProps} />)
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
  })

  it('renders checkbox with task text as aria-label', () => {
    renderWithProviders(<TaskItem task={makeTask()} {...defaultProps} />)
    expect(screen.getByLabelText('Buy milk')).toBeInTheDocument()
  })

  it('renders checkbox for the task', () => {
    const { container } = renderWithProviders(<TaskItem task={makeTask()} {...defaultProps} />)
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()
  })

  it('renders checked checkbox for completed task', () => {
    const { container } = renderWithProviders(<TaskItem task={makeTask({ completed: true })} {...defaultProps} />)
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(checkbox).toBeChecked()
  })

  it('shows strikethrough for completed tasks', () => {
    renderWithProviders(<TaskItem task={makeTask({ completed: true })} {...defaultProps} />)
    const text = screen.getByText('Buy milk')
    expect(text).toHaveStyle({ textDecoration: 'line-through' })
  })

  it('renders delete button with correct aria-label', () => {
    renderWithProviders(<TaskItem task={makeTask()} {...defaultProps} />)
    expect(screen.getByLabelText('Delete task: Buy milk')).toBeInTheDocument()
  })

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn()
    renderWithProviders(<TaskItem task={makeTask()} {...defaultProps} onDelete={onDelete} />)
    fireEvent.click(screen.getByLabelText('Delete task: Buy milk'))
    expect(onDelete).toHaveBeenCalledWith('test-id-1')
  })
})
