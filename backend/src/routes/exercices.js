









export default async function exerciceRoutes(fastify, opts) {
  const { supabase } = fastify

  // GET all exercices from library
  fastify.get('/exercices', async (request, reply) => {
    const { data, error } = await supabase
      .from('exercices_library')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      console.error("GET Exercices Error:", error)
      return reply.status(500).send(error)
    }
    return data
  })

  // GET single exercice by ID
  fastify.get('/exercices/:id', async (request, reply) => {
    const { id } = request.params
    const { data, error } = await supabase
      .from('exercices_library')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return reply.status(404).send({ message: 'Exercice non trouvé', error })
    return data
  })

  // CREATE new exercice in library
  fastify.post('/exercices', async (request, reply) => {
    const { data, error } = await supabase
      .from('exercices_library')
      .insert([request.body])
      .select()
    
    if (error) {
      console.error("POST Exercice Error:", error)
      return reply.status(400).send(error)
    }
    return reply.status(201).send(data[0])
  })

  // UPDATE exercice
  fastify.put('/exercices/:id', async (request, reply) => {
    const { id } = request.params
    const { data, error } = await supabase
      .from('exercices_library')
      .update(request.body)
      .eq('id', id)
      .select()
    
    if (error) return reply.status(400).send(error)
    return data[0]
  })

  // DELETE exercice
  fastify.delete('/exercices/:id', async (request, reply) => {
    const { id } = request.params
    const { error } = await supabase
      .from('exercices_library')
      .delete()
      .eq('id', id)
    
    if (error) return reply.status(400).send(error)
    return reply.status(204).send()
  })
}
