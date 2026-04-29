import { describe, it, expect, beforeEach } from 'vitest'
import { getAllTasks, getTask, createTask, updateTask, deleteTask, clearTasks } from './taskStore.js'

describe('taskStore', () => {
  beforeEach(() => {
    clearTasks()
  })

  describe('getAllTasks', () => {
    it('returns empty array when no tasks exist', () => {
      expect(getAllTasks()).toEqual([])
    })

    it('returns all created tasks', () => {
      createTask('Task 1')
      createTask('Task 2')
      expect(getAllTasks()).toHaveLength(2)
    })
  })

  describe('createTask', () => {
    it('creates a task with correct defaults', () => {
      const task = createTask('Buy milk')
      expect(task.text).toBe('Buy milk')
      expect(task.completed).toBe(false)
      expect(task.id).toBeDefined()
      expect(task.createdAt).toBeDefined()
    })

    it('generates unique IDs', () => {
      const task1 = createTask('Task 1')
      const task2 = createTask('Task 2')
      expect(task1.id).not.toBe(task2.id)
    })

    it('generates valid ISO 8601 date', () => {
      const task = createTask('Test')
      expect(new Date(task.createdAt).toISOString()).toBe(task.createdAt)
    })
  })

  describe('getTask', () => {
    it('returns a task by ID', () => {
      const created = createTask('Test')
      const found = getTask(created.id)
      expect(found).toEqual(created)
    })

    it('returns undefined for non-existent ID', () => {
      expect(getTask('non-existent')).toBeUndefined()
    })
  })

  describe('updateTask', () => {
    it('updates task text', () => {
      const task = createTask('Original')
      const updated = updateTask(task.id, { text: 'Updated' })
      expect(updated?.text).toBe('Updated')
      expect(updated?.completed).toBe(false)
    })

    it('updates task completion', () => {
      const task = createTask('Test')
      const updated = updateTask(task.id, { completed: true })
      expect(updated?.completed).toBe(true)
      expect(updated?.text).toBe('Test')
    })

    it('updates both text and completion', () => {
      const task = createTask('Original')
      const updated = updateTask(task.id, { text: 'New', completed: true })
      expect(updated?.text).toBe('New')
      expect(updated?.completed).toBe(true)
    })

    it('returns undefined for non-existent ID', () => {
      expect(updateTask('non-existent', { text: 'Test' })).toBeUndefined()
    })
  })

  describe('deleteTask', () => {
    it('deletes an existing task', () => {
      const task = createTask('Test')
      expect(deleteTask(task.id)).toBe(true)
      expect(getTask(task.id)).toBeUndefined()
    })

    it('returns false for non-existent ID', () => {
      expect(deleteTask('non-existent')).toBe(false)
    })
  })

  describe('clearTasks', () => {
    it('removes all tasks', () => {
      createTask('Task 1')
      createTask('Task 2')
      clearTasks()
      expect(getAllTasks()).toEqual([])
    })
  })
})
