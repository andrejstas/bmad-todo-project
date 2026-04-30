import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../test-utils'
import { TaskInput } from './TaskInput'

const mockMutate = vi.fn()

vi.mock('../api/tasks', () => ({
  useCreateTask: () => ({ mutate: mockMutate }),
}))

describe('TaskInput', () => {
  beforeEach(() => {
    mockMutate.mockClear()
  })

  it('renders with placeholder text', () => {
    renderWithProviders(<TaskInput />)
    expect(screen.getByPlaceholderText('What are you working on?')).toBeInTheDocument()
  })

  it('has aria-label for accessibility', () => {
    renderWithProviders(<TaskInput />)
    expect(screen.getByLabelText('Add a new task')).toBeInTheDocument()
  })

  it('calls createTask.mutate on Enter with text', () => {
    renderWithProviders(<TaskInput />)
    const input = screen.getByLabelText('Add a new task')
    fireEvent.change(input, { target: { value: 'Buy milk' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(mockMutate).toHaveBeenCalledWith('Buy milk')
  })

  it('clears input after submit', () => {
    renderWithProviders(<TaskInput />)
    const input = screen.getByLabelText('Add a new task') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Buy milk' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(input.value).toBe('')
  })

  it('ignores empty submissions', () => {
    renderWithProviders(<TaskInput />)
    const input = screen.getByLabelText('Add a new task')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('ignores whitespace-only submissions', () => {
    renderWithProviders(<TaskInput />)
    const input = screen.getByLabelText('Add a new task')
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(mockMutate).not.toHaveBeenCalled()
  })
})
