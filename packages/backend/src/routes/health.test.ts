import { describe, it, expect, afterAll } from 'vitest'
import { buildServer } from '../server.js'

describe('health route', () => {
  const server = buildServer()

  afterAll(async () => {
    await server.close()
  })

  it('returns status ok', async () => {
    await server.ready()
    const response = await server.inject({ method: 'GET', url: '/health' })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status: 'ok' })
  })
})
