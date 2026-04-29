import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import sensible from '@fastify/sensible'

export function buildServer() {
  const fastify = Fastify({ logger: true })

  fastify.register(cors)
  fastify.register(helmet)
  fastify.register(sensible)

  return fastify
}
