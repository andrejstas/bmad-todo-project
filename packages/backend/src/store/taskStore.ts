import { randomUUID } from 'node:crypto'

export interface Task {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

const tasks = new Map<string, Task>()

export function getAllTasks(): Task[] {
  return Array.from(tasks.values())
}

export function getTask(id: string): Task | undefined {
  return tasks.get(id)
}

export function createTask(text: string): Task {
  const task: Task = {
    id: randomUUID(),
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  }
  tasks.set(task.id, task)
  return task
}

export function updateTask(id: string, updates: { text?: string; completed?: boolean }): Task | undefined {
  const task = tasks.get(id)
  if (!task) return undefined

  if (updates.text !== undefined) task.text = updates.text
  if (updates.completed !== undefined) task.completed = updates.completed

  return task
}

export function deleteTask(id: string): boolean {
  return tasks.delete(id)
}

export function clearTasks(): void {
  tasks.clear()
}
