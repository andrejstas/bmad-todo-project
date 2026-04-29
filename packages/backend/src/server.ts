import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import sensible from '@fastify/sensible'
import taskRoutes from './routes/tasks.js'
import healthRoutes from './routes/health.js'

export function buildServer() {
  const fastify = Fastify({ logger: true })

  fastify.register(cors)
  fastify.register(helmet)
  fastify.register(sensible)

  fastify.register(taskRoutes)
  fastify.register(healthRoutes)

  return fastify
}
