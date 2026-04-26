import Fastify from 'fastify'
import cors from '@fastify/cors'
import supabasePlugin from './plugins/supabase.js'
import athleteRoutes from './routes/athletes.js'
import sessionRoutes from './routes/sessions.js'
import exerciceRoutes from './routes/exercices.js'
import lookupRoutes from './routes/lookups.js'

const fastify = Fastify({
  logger: true
})

// Register Plugins
fastify.register(cors, {
  origin: '*', // For development. You can restrict this to your frontend URL in production.
  methods: ['GET', 'POST', 'PUT', 'DELETE']
})
fastify.register(supabasePlugin)

// Register Routes
fastify.register(athleteRoutes, { prefix: '/api' })
fastify.register(sessionRoutes, { prefix: '/api' })
fastify.register(exerciceRoutes, { prefix: '/api' })
fastify.register(lookupRoutes, { prefix: '/api' })

// Base Routes
fastify.get('/', async (request, reply) => {
  return { status: 'ok', message: 'Prep Athlete API' }
})

fastify.get('/health', async (request, reply) => {
  return { status: 'ok' }
})

// Local development
if (process.env.NODE_ENV !== 'production') {
  const start = async () => {
    try {
      await fastify.listen({ port: 3001, host: '0.0.0.0' })
    } catch (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  }
  start()
}

// Export for Vercel
export default async (req, res) => {
  await fastify.ready()
  fastify.server.emit('request', req, res)
}
