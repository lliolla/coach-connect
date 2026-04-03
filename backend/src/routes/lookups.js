export default async function lookupRoutes(fastify, opts) {
  const { supabase } = fastify

  // Generic GET for any lookup table
  fastify.get('/lookups/:table', async (request, reply) => {
    const { table } = request.params
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('id', { ascending: true })
    
    if (error) return reply.status(500).send(error)
    return data
  })

  // Generic POST for any lookup table
  fastify.post('/lookups/:table', async (request, reply) => {
    const { table } = request.params
    const { data, error } = await supabase
      .from(table)
      .insert([request.body])
      .select()
    
    if (error) return reply.status(400).send(error)
    return reply.status(201).send(data[0])
  })

  // Generic PUT for any lookup table
  fastify.put('/lookups/:table/:id', async (request, reply) => {
    const { table, id } = request.params
    const { data, error } = await supabase
      .from(table)
      .update(request.body)
      .eq('id', id)
      .select()
    
    if (error) return reply.status(400).send(error)
    return data[0]
  })

  // Generic DELETE for any lookup table
  fastify.delete('/lookups/:table/:id', async (request, reply) => {
    const { table, id } = request.params
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    
    if (error) return reply.status(400).send(error)
    return reply.status(204).send()
  })
}
