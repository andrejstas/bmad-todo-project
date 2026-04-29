import type { FastifyInstance } from 'fastify'
import { getAllTasks, createTask, updateTask, deleteTask } from '../store/taskStore.js'
import { createTaskSchema, updateTaskSchema, taskParamsSchema } from '../schemas/taskSchemas.js'

export default async function taskRoutes(fastify: FastifyInstance) {
  fastify.get('/api/tasks', async () => {
    return getAllTasks()
  })

  fastify.post<{ Body: { text: string } }>(
    '/api/tasks',
    { schema: createTaskSchema },
    async (request, reply) => {
      const task = createTask(request.body.text)
      return reply.status(201).send(task)
    },
  )

  fastify.patch<{ Params: { id: string }; Body: { text?: string; completed?: boolean } }>(
    '/api/tasks/:id',
    { schema: updateTaskSchema },
    async (request) => {
      const updated = updateTask(request.params.id, request.body)
      if (!updated) throw fastify.httpErrors.notFound('Task not found')
      return updated
    },
  )

  fastify.delete<{ Params: { id: string } }>(
    '/api/tasks/:id',
    { schema: taskParamsSchema },
    async (request, reply) => {
      const deleted = deleteTask(request.params.id)
      if (!deleted) throw fastify.httpErrors.notFound('Task not found')
      return reply.status(204).send()
    },
  )
}
