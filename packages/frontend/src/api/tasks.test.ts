import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { useTasks, useCreateTask, useDeleteTask, useToggleTask } from './tasks'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

function mockResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  }
}

describe('API hooks', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  describe('useTasks', () => {
    it('fetches from /api/tasks', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse([]))
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/tasks',
        expect.objectContaining({ headers: {} }),
      )
    })

    it('returns task data', async () => {
      const tasks = [{ id: '1', text: 'Test', completed: false, createdAt: '2026-01-01T00:00:00.000Z' }]
      mockFetch.mockResolvedValueOnce(mockResponse(tasks))
      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(tasks)
    })
  })

  describe('useCreateTask', () => {
    it('calls POST /api/tasks with correct body', async () => {
      const newTask = { id: '1', text: 'New task', completed: false, createdAt: '2026-01-01T00:00:00.000Z' }
      // First call is for useTasks query, second for mutation
      mockFetch.mockResolvedValue(mockResponse(newTask, 201))
      const { result } = renderHook(() => useCreateTask(), { wrapper: createWrapper() })
      result.current.mutate('New task')
      await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(
        '/api/tasks',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ text: 'New task' }),
        }),
      ))
    })
  })

  describe('useDeleteTask', () => {
    it('calls DELETE /api/tasks/:id', async () => {
      mockFetch.mockResolvedValue(mockResponse(undefined, 204))
      const { result } = renderHook(() => useDeleteTask(), { wrapper: createWrapper() })
      result.current.mutate('task-123')
      await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(
        '/api/tasks/task-123',
        expect.objectContaining({ method: 'DELETE' }),
      ))
    })
  })

  describe('useToggleTask', () => {
    it('calls PATCH /api/tasks/:id with completed flag', async () => {
      const updated = { id: 'task-123', text: 'Test', completed: true, createdAt: '2026-01-01T00:00:00.000Z' }
      mockFetch.mockResolvedValue(mockResponse(updated))
      const { result } = renderHook(() => useToggleTask(), { wrapper: createWrapper() })
      result.current.mutate({ id: 'task-123', completed: true })
      await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(
        '/api/tasks/task-123',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ completed: true }),
        }),
      ))
    })
  })
})
