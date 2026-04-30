import { buildServer } from './server.js'

const server = buildServer()
const port = Number(process.env.PORT) || 3000
const host = process.env.HOST || '0.0.0.0'

server.listen({ port, host }, (err, address) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
  server.log.info(`Server listening at ${address}`)
})
