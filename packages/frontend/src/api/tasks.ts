import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createToaster } from '@chakra-ui/react'
import { apiFetch } from './client'

export const toaster = createToaster({ placement: 'bottom-end', duration: 3000 })

export interface Task {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

function fetchTasks(): Promise<Task[]> {
  return apiFetch<Task[]>('/tasks')
}

function createTaskApi(text: string): Promise<Task> {
  return apiFetch<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}

function deleteTaskApi(id: string): Promise<void> {
  return apiFetch<void>(`/tasks/${id}`, { method: 'DELETE' })
}

function updateTaskApi(id: string, updates: { completed?: boolean; text?: string }): Promise<Task> {
  return apiFetch<Task>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    staleTime: 30_000,
  })
}

export function useToggleTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateTaskApi(id, { completed }),
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previous = queryClient.getQueryData<Task[]>(['tasks'])
      queryClient.setQueryData<Task[]>(['tasks'], (old = []) =>
        old.map((t) => (t.id === id ? { ...t, completed } : t)),
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['tasks'], context.previous)
      toaster.create({ id: 'mutation-error', title: 'Something went wrong. Please try again.', type: 'error' })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useUpdateText() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      updateTaskApi(id, { text }),
    onMutate: async ({ id, text }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previous = queryClient.getQueryData<Task[]>(['tasks'])
      queryClient.setQueryData<Task[]>(['tasks'], (old = []) =>
        old.map((t) => (t.id === id ? { ...t, text } : t)),
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['tasks'], context.previous)
      toaster.create({ id: 'mutation-error', title: 'Something went wrong. Please try again.', type: 'error' })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTaskApi(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previous = queryClient.getQueryData<Task[]>(['tasks'])
      queryClient.setQueryData<Task[]>(['tasks'], (old = []) =>
        old.filter((t) => t.id !== id),
      )
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(['tasks'], context.previous)
      toaster.create({ id: 'mutation-error', title: 'Something went wrong. Please try again.', type: 'error' })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (text: string) => createTaskApi(text),
    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previous = queryClient.getQueryData<Task[]>(['tasks'])
      queryClient.setQueryData<Task[]>(['tasks'], (old = []) => [
        ...old,
        { id: crypto.randomUUID(), text, completed: false, createdAt: new Date().toISOString() },
      ])
      return { previous }
    },
    onError: (_err, _text, context) => {
      if (context?.previous) queryClient.setQueryData(['tasks'], context.previous)
      toaster.create({ id: 'mutation-error', title: 'Something went wrong. Please try again.', type: 'error' })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
