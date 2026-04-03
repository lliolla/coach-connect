export default async function athleteRoutes(fastify, opts) {
  const { supabase } = fastify

  // GET all athletes
  fastify.get('/athletes', async (request, reply) => {
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
    
    if (error) return reply.status(500).send(error)
    return data
  })

  // GET single athlete by ID
  fastify.get('/athletes/:id', async (request, reply) => {
    const { id } = request.params
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return reply.status(404).send({ message: 'Athlete not found' })
    return data
  })

  // CREATE new athlete
  fastify.post('/athletes', async (request, reply) => {
    const { data, error } = await supabase
      .from('athletes')
      .insert([request.body])
      .select()
    
    if (error) return reply.status(400).send(error)
    return reply.status(201).send(data[0])
  })

  // UPDATE athlete
  fastify.put('/athletes/:id', async (request, reply) => {
    const { id } = request.params
    const { data, error } = await supabase
      .from('athletes')
      .update(request.body)
      .eq('id', id)
      .select()
    
    if (error) return reply.status(400).send(error)
    return data[0]
  })

  // DELETE athlete
  fastify.delete('/athletes/:id', async (request, reply) => {
    const { id } = request.params
    const { error } = await supabase
      .from('athletes')
      .delete()
      .eq('id', id)
    
    if (error) return reply.status(400).send(error)
    return reply.status(204).send()
  })
}
