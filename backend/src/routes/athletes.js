export default async function athleteRoutes(fastify, opts) {
  const { supabase } = fastify

  /**
   * Helper pour synchroniser les relations many-to-many
   */
  async function syncManyToMany(athleteId, joinTable, lookupTable, lookupField, items, fkColumn) {
    if (!items || !Array.isArray(items)) return

    try {
      // 1. Supprimer les liens existants
      await supabase.from(joinTable).delete().eq('athlete_id', athleteId)

      if (items.length === 0) return

      // 2. S'assurer que tous les items existent dans la table de référence
      for (const itemValue of items) {
        await supabase.from(lookupTable).upsert([{ [lookupField]: itemValue }], { onConflict: lookupField })
      }

      // 3. Récupérer les IDs pour les labels fournis
      const { data: lookups } = await supabase
        .from(lookupTable)
        .select(`id, ${lookupField}`)
        .in(lookupField, items)

      if (lookups && lookups.length > 0) {
        const inserts = lookups.map(item => ({
          athlete_id: athleteId,
          [fkColumn]: item.id
        }))
        const { error } = await supabase.from(joinTable).insert(inserts)
        if (error) throw error
      }
    } catch (err) {
      console.error(`[ERROR] syncManyToMany failed for ${joinTable}:`, err)
      throw err
    }
  }

  // SELECT avec jointures
  const ATHLETE_SELECT = `
    *,
    abonnements (id, label),
    modes_paiement (id, label),
    athletes_groupes (groupes (id, name)),
    athletes_objectifs (objectifs (id, label))
  `

  /**
   * Formate l'objet athlète pour le frontend
   */
  const formatAthlete = (athlete) => ({
    ...athlete,
    abonnement: athlete.abonnements?.label || athlete.abonnement,
    mode_paiement: athlete.modes_paiement?.label,
    groupes: athlete.athletes_groupes?.map(ag => ag.groupes.name) || [],
    objectives: athlete.athletes_objectifs?.map(ao => ao.objectifs.label) || []
  })

  // --- ROUTES ---

  // GET all athletes
  fastify.get('/athletes', async (request, reply) => {
    try {
      const { data, error } = await supabase
        .from('athletes')
        .select(ATHLETE_SELECT)
        .order('last_name', { ascending: true })

      if (error) throw error
      return data.map(formatAthlete)
    } catch (err) {
      fastify.log.error(err)
      return reply.status(500).send({ message: "Erreur lors du chargement des athlètes", error: err.message })
    }
  })

  // GET single athlete
  fastify.get('/athletes/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const { data, error } = await supabase
        .from('athletes')
        .select(ATHLETE_SELECT)
        .eq('id', id)
        .single()

      if (error) throw error
      return formatAthlete(data)
    } catch (err) {
      fastify.log.error(err)
      return reply.status(404).send({ message: "Athlète non trouvé", error: err.message })
    }
  })

  // CREATE athlete
  fastify.post('/athletes', async (request, reply) => {
    const { 
      objectives, groupes, groupe, abonnement, mode_paiement,
      ...athleteData 
    } = request.body

    try {
      const allGroupes = Array.isArray(groupes) ? groupes : (groupe ? [groupe] : [])

      // Résolution des IDs pour abonnement et mode de paiement
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

      if (error) throw error

      const newAthlete = data[0]
      
      // Synchronisation M2M
      if (allGroupes.length > 0) {
        await syncManyToMany(newAthlete.id, 'athletes_groupes', 'groupes', 'name', allGroupes, 'groupe_id')
      }
      if (objectives && objectives.length > 0) {
        await syncManyToMany(newAthlete.id, 'athletes_objectifs', 'objectifs', 'label', objectives, 'objectif_id')
      }

      return reply.status(201).send(newAthlete)
    } catch (err) {
      fastify.log.error(err)
      return reply.status(400).send({ message: "Erreur lors de la création de l'athlète", error: err.message })
    }
  })

  // UPDATE athlete
  fastify.put('/athletes/:id', async (request, reply) => {
    const { id } = request.params
    const { 
      objectives, groupes, groupe, abonnement, mode_paiement,
      abonnements, modes_paiement, athletes_groupes, athletes_objectifs, // Filtrage des relations reçues
      ...athleteData 
    } = request.body

    try {
      const allGroupes = Array.isArray(groupes) ? groupes : (groupe ? [groupe] : [])

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
      
      if (error) throw error

      // Synchronisation M2M
      await syncManyToMany(id, 'athletes_groupes', 'groupes', 'name', allGroupes, 'groupe_id')
      if (objectives) {
        await syncManyToMany(id, 'athletes_objectifs', 'objectifs', 'label', objectives, 'objectif_id')
      }

      return data[0]
    } catch (err) {
      fastify.log.error(err)
      return reply.status(400).send({ message: "Erreur lors de la mise à jour de l'athlète", error: err.message })
    }
  })

  // DELETE athlete
  fastify.delete('/athletes/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const { error } = await supabase.from('athletes').delete().eq('id', id)
      
      if (error) throw error
      return reply.status(204).send()
    } catch (err) {
      fastify.log.error(err)
      return reply.status(400).send({ message: "Erreur lors de la suppression de l'athlète", error: err.message })
    }
  })
}
