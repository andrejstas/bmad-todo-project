import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from './client'

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

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    staleTime: 30_000,
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
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
