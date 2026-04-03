export default async function athleteRoutes(fastify, opts) {
  const { supabase } = fastify

  // Helper function to sync many-to-many relationships
  async function syncManyToMany(athleteId, joinTable, lookupTable, lookupField, items, fkColumn) {
    if (!items || !Array.isArray(items)) return

    // 1. Delete existing links
    await supabase.from(joinTable).delete().eq('athlete_id', athleteId)

    if (items.length === 0) return

    // 2. Ensure all items exist in the lookup table (useful for custom objectives)
    for (const itemValue of items) {
      await supabase.from(lookupTable).upsert([{ [lookupField]: itemValue }], { onConflict: lookupField })
    }

    // 3. Fetch IDs for the provided labels
    const { data: lookups } = await supabase
      .from(lookupTable)
      .select(`id, ${lookupField}`)
      .in(lookupField, items)

    if (lookups && lookups.length > 0) {
      const inserts = lookups.map(item => ({
        athlete_id: athleteId,
        [fkColumn]: item.id
      }))
      await supabase.from(joinTable).insert(inserts)
    }
  }

  // GET all athletes
  fastify.get('/athletes', async (request, reply) => {
    const { data, error } = await supabase
      .from('athletes')
      .select(`
        *,
        abonnements(label),
        modes_paiement(label),
        athletes_groupes(groupes(name)),
        athletes_objectifs(objectifs(label))
      `)
    
    if (error) return reply.status(500).send(error)

    // Format data for frontend (flattening relations)
    return data.map(athlete => ({
      ...athlete,
      abonnement: athlete.abonnements?.label || athlete.abonnement,
      mode_paiement: athlete.modes_paiement?.label,
      groupes: athlete.athletes_groupes?.map(ag => ag.groupes.name) || [],
      objectives: athlete.athletes_objectifs?.map(ao => ao.objectifs.label) || []
    }))
  })

  // GET single athlete by ID
  fastify.get('/athletes/:id', async (request, reply) => {
    const { id } = request.params
    const { data, error } = await supabase
      .from('athletes')
      .select(`
        *,
        abonnements(label),
        modes_paiement(label),
        athletes_groupes(groupes(name)),
        athletes_objectifs(objectifs(label))
      `)
      .eq('id', id)
      .single()
    
    if (error) return reply.status(404).send({ message: 'Athlete not found' })

    // Format for frontend
    return {
      ...data,
      abonnement: data.abonnements?.label || data.abonnement,
      mode_paiement: data.modes_paiement?.label,
      groupes: data.athletes_groupes?.map(ag => ag.groupes.name) || [],
      objectives: data.athletes_objectifs?.map(ao => ao.objectifs.label) || []
    }
  })

  // CREATE new athlete
  fastify.post('/athletes', async (request, reply) => {
    const { sports, objectives, groupes, groupe, abonnement, mode_paiement, ...athleteData } = request.body
    
    // Merge single 'groupe' into 'groupes' array for M2M syncing
    const allGroupes = Array.isArray(groupes) ? groupes : (groupe ? [groupe] : [])

    // Resolve abonnement_id and mode_paiement_id
    if (abonnement) {
      const { data: ab } = await supabase.from('abonnements').select('id').eq('label', abonnement).maybeSingle()
      if (ab) athleteData.abonnement_id = ab.id
    }
    if (mode_paiement) {
      const { data: mp } = await supabase.from('modes_paiement').select('id').eq('label', mode_paiement).maybeSingle()
      if (mp) athleteData.mode_paiement_id = mp.id
    }

    const { data, error } = await supabase
      .from('athletes')
      .insert([athleteData])
      .select()
    
    if (error) return reply.status(400).send(error)
    const newAthlete = data[0]

    // Sync Many-to-Many
    if (allGroupes.length > 0) await syncManyToMany(newAthlete.id, 'athletes_groupes', 'groupes', 'name', allGroupes, 'groupe_id')
    if (objectives) await syncManyToMany(newAthlete.id, 'athletes_objectifs', 'objectifs', 'label', objectives, 'objectif_id')

    return reply.status(201).send(newAthlete)
  })

  // UPDATE athlete
  fastify.put('/athletes/:id', async (request, reply) => {
    const { id } = request.params
    const { sports, objectives, groupes, groupe, abonnement, mode_paiement, ...athleteData } = request.body

    // Merge single 'groupe' into 'groupes' array for M2M syncing
    const allGroupes = Array.isArray(groupes) ? groupes : (groupe ? [groupe] : [])

    // Resolve abonnement_id and mode_paiement_id
    if (abonnement) {
      const { data: ab } = await supabase.from('abonnements').select('id').eq('label', abonnement).maybeSingle()
      if (ab) athleteData.abonnement_id = ab.id
    }
    if (mode_paiement) {
      const { data: mp } = await supabase.from('modes_paiement').select('id').eq('label', mode_paiement).maybeSingle()
      if (mp) athleteData.mode_paiement_id = mp.id
    }

    const { data, error } = await supabase
      .from('athletes')
      .update(athleteData)
      .eq('id', id)
      .select()
    
    if (error) return reply.status(400).send(error)

    // Sync Many-to-Many
    if (allGroupes.length > 0) await syncManyToMany(id, 'athletes_groupes', 'groupes', 'name', allGroupes, 'groupe_id')
    if (objectives) await syncManyToMany(id, 'athletes_objectifs', 'objectifs', 'label', objectives, 'objectif_id')

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
