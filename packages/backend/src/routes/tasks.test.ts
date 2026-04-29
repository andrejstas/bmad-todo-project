import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { buildServer } from '../server.js'
import { clearTasks } from '../store/taskStore.js'

describe('task routes', () => {
  const server = buildServer()

  afterAll(async () => {
    await server.close()
  })

  beforeEach(async () => {
    clearTasks()
    await server.ready()
  })

  describe('GET /api/tasks', () => {
    it('returns empty array when no tasks exist', async () => {
      const response = await server.inject({ method: 'GET', url: '/api/tasks' })
      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual([])
    })

    it('returns all tasks', async () => {
      await server.inject({ method: 'POST', url: '/api/tasks', payload: { text: 'Task 1' } })
      await server.inject({ method: 'POST', url: '/api/tasks', payload: { text: 'Task 2' } })

      const response = await server.inject({ method: 'GET', url: '/api/tasks' })
      expect(response.statusCode).toBe(200)
      expect(response.json()).toHaveLength(2)
    })
  })

  describe('POST /api/tasks', () => {
    it('creates a task with status 201', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { text: 'Buy milk' },
      })
      expect(response.statusCode).toBe(201)
      const task = response.json()
      expect(task.text).toBe('Buy milk')
      expect(task.completed).toBe(false)
      expect(task.id).toBeDefined()
      expect(task.createdAt).toBeDefined()
    })

    it('returns 400 for missing text', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: {},
      })
      expect(response.statusCode).toBe(400)
    })

    it('returns 400 for empty text', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { text: '' },
      })
      expect(response.statusCode).toBe(400)
    })

    it('returns 400 for text exceeding 500 characters', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { text: 'a'.repeat(501) },
      })
      expect(response.statusCode).toBe(400)
    })
  })

  describe('PATCH /api/tasks/:id', () => {
    it('updates task completion', async () => {
      const createRes = await server.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { text: 'Test' },
      })
      const { id } = createRes.json()

      const response = await server.inject({
        method: 'PATCH',
        url: `/api/tasks/${id}`,
        payload: { completed: true },
      })
      expect(response.statusCode).toBe(200)
      expect(response.json().completed).toBe(true)
    })

    it('updates task text', async () => {
      const createRes = await server.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { text: 'Original' },
      })
      const { id } = createRes.json()

      const response = await server.inject({
        method: 'PATCH',
        url: `/api/tasks/${id}`,
        payload: { text: 'Updated text' },
      })
      expect(response.statusCode).toBe(200)
      expect(response.json().text).toBe('Updated text')
    })

    it('returns 404 for non-existent task', async () => {
      const response = await server.inject({
        method: 'PATCH',
        url: '/api/tasks/non-existent-id',
        payload: { completed: true },
      })
      expect(response.statusCode).toBe(404)
      const body = response.json()
      expect(body.statusCode).toBe(404)
      expect(body.error).toBe('Not Found')
      expect(body.message).toBe('Task not found')
    })

    it('returns 400 for empty body', async () => {
      const createRes = await server.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { text: 'Test' },
      })
      const { id } = createRes.json()

      const response = await server.inject({
        method: 'PATCH',
        url: `/api/tasks/${id}`,
        payload: {},
      })
      expect(response.statusCode).toBe(400)
    })
  })

  describe('DELETE /api/tasks/:id', () => {
    it('deletes a task with status 204', async () => {
      const createRes = await server.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { text: 'Test' },
      })
      const { id } = createRes.json()

      const response = await server.inject({
        method: 'DELETE',
        url: `/api/tasks/${id}`,
      })
      expect(response.statusCode).toBe(204)
      expect(response.body).toBe('')
    })

    it('returns 404 for non-existent task', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: '/api/tasks/non-existent-id',
      })
      expect(response.statusCode).toBe(404)
      const body = response.json()
      expect(body.message).toBe('Task not found')
    })
  })
})
