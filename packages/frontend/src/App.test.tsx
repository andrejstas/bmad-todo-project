import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from './test-utils'
import App from './App'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function mockResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  }
}

describe('App', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('shows loading spinner while fetching tasks', () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // never resolves
    const { container } = renderWithProviders(<App />)
    expect(container.querySelector('.chakra-spinner')).toBeInTheDocument()
  })

  it('shows empty state when no tasks exist', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse([]))
    renderWithProviders(<App />)
    await waitFor(() => {
      expect(screen.getByText('No tasks yet')).toBeInTheDocument()
    })
  })

  it('shows error state when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    renderWithProviders(<App />)
    await waitFor(() => {
      expect(screen.getByText('Failed to load tasks')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('retries fetch when Try again is clicked', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    renderWithProviders(<App />)
    await waitFor(() => {
      expect(screen.getByText('Failed to load tasks')).toBeInTheDocument()
    })

    mockFetch.mockResolvedValueOnce(mockResponse([]))
    screen.getByRole('button', { name: 'Try again' }).click()
    await waitFor(() => {
      expect(screen.getByText('No tasks yet')).toBeInTheDocument()
    })
  })

  it('shows tasks when fetch succeeds', async () => {
    const tasks = [{ id: '1', text: 'Test task', completed: false, createdAt: '2026-01-01T00:00:00.000Z' }]
    mockFetch.mockResolvedValueOnce(mockResponse(tasks))
    renderWithProviders(<App />)
    await waitFor(() => {
      expect(screen.getByText('Test task')).toBeInTheDocument()
    })
  })
})
