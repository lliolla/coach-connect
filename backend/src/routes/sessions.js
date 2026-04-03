export default async function sessionRoutes(fastify, opts) {
  const { supabase } = fastify

  // GET all sessions
  fastify.get('/sessions', async (request, reply) => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*, exercises(*)')
    
    if (error) return reply.status(500).send(error)
    return data
  })

  // GET single session by ID
  fastify.get('/sessions/:id', async (request, reply) => {
    const { id } = request.params
    const { data, error } = await supabase
      .from('sessions')
      .select('*, exercises(*)')
      .eq('id', id)
      .single()
    
    if (error) return reply.status(404).send({ message: 'Session not found' })
    return data
  })

  // GET sessions for specific athlete
  fastify.get('/athletes/:athlete_id/sessions', async (request, reply) => {
    const { athlete_id } = request.params
    const { data, error } = await supabase
      .from('sessions')
      .select('*, exercises(*)')
      .eq('athlete_id', athlete_id)
    
    if (error) return reply.status(500).send(error)
    return data
  })

  // CREATE new session
  fastify.post('/sessions', async (request, reply) => {
    const { data, error } = await supabase
      .from('sessions')
      .insert([request.body])
      .select()
    
    if (error) return reply.status(400).send(error)
    return reply.status(201).send(data[0])
  })

  // UPDATE session
  fastify.put('/sessions/:id', async (request, reply) => {
    const { id } = request.params
    const { data, error } = await supabase
      .from('sessions')
      .update(request.body)
      .eq('id', id)
      .select()
    
    if (error) return reply.status(400).send(error)
    return data[0]
  })

  // DELETE session
  fastify.delete('/sessions/:id', async (request, reply) => {
    const { id } = request.params
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id)
    
    if (error) return reply.status(400).send(error)
    return reply.status(204).send()
  })
}
