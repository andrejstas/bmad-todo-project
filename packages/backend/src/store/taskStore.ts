import { randomUUID } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'node:fs'
import { dirname } from 'node:path'

export interface Task {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

const DATA_FILE = process.env.DATA_FILE || './data/tasks.json'

function loadTasks(): Map<string, Task> {
  try {
    const data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
    return new Map(Object.entries(data))
  } catch {
    return new Map()
  }
}

function persist(): void {
  mkdirSync(dirname(DATA_FILE), { recursive: true })
  writeFileSync(DATA_FILE, JSON.stringify(Object.fromEntries(tasks)))
}

const tasks = loadTasks()

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
  persist()
  return task
}

export function updateTask(id: string, updates: { text?: string; completed?: boolean }): Task | undefined {
  const task = tasks.get(id)
  if (!task) return undefined

  if (updates.text !== undefined) task.text = updates.text
  if (updates.completed !== undefined) task.completed = updates.completed

  persist()
  return task
}

export function deleteTask(id: string): boolean {
  const deleted = tasks.delete(id)
  if (deleted) persist()
  return deleted
}

export function clearTasks(): void {
  tasks.clear()
  try { unlinkSync(DATA_FILE) } catch { /* file may not exist */ }
}
