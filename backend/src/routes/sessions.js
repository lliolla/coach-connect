export default async function sessionRoutes(fastify, opts) {
  const { supabase } = fastify

  /**
   * Helper pour mapper les exercices reçus du client vers le format de la DB
   */
  const mapExercises = (exercises, sessionId) => {
    return exercises
      .map((ex, index) => {
        // Supporte plusieurs formats d'ID provenant du frontend
        const exerciseId = ex.exercise_id || ex.template_id || ex.id;
        
        if (!exerciseId) {
          console.warn(`[WARN] Exercice à l'index ${index} ignoré car l'ID est manquant`);
          return null;
        }

        return {
          session_id: sessionId,
          exercise_id: exerciseId,
          sets: parseInt(ex.sets) || 0,
          reps: parseInt(ex.reps) || 0,
          weight: parseFloat(ex.weight) || 0,
          order_index: ex.order_index !== undefined ? parseInt(ex.order_index) : index,
          rest_time: (ex.rest_time !== undefined && ex.rest_time !== null) ? parseInt(ex.rest_time) : (parseInt(ex.rest_time_seconds) || 60),
          notes: ex.notes || "",
          intensity: ex.intensity ? ex.intensity.toString() : ""
        };
      })
      .filter(ex => ex !== null);
  }

  // Requête SELECT réutilisable avec jointures pour les athlètes et les détails des exercices
  const SESSION_SELECT = `
    *,
    session_exercises (
      id,
      exercise_id,
      sets,
      reps,
      weight,
      order_index,
      rest_time,
      notes,
      intensity,
      exercices_library (
        name,
        category,
        unit,
        description
      )
    ),
    athletes (
      id,
      first_name,
      last_name,
      email,
      avatar_url
    )
  `

  // --- ROUTES ---

  // GET all sessions
  fastify.get('/sessions', async (request, reply) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(SESSION_SELECT)
        .order('date', { ascending: false })

      if (error) throw error
      return data
    } catch (err) {
      fastify.log.error(err)
      return reply.status(500).send({ message: "Erreur lors de la récupération des séances", error: err.message })
    }
  })

  // GET single session
  fastify.get('/sessions/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const { data, error } = await supabase
        .from('sessions')
        .select(SESSION_SELECT)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (err) {
      fastify.log.error(err)
      return reply.status(404).send({ message: "Séance non trouvée", error: err.message })
    }
  })

  // GET sessions by athlete
  fastify.get('/athletes/:athlete_id/sessions', async (request, reply) => {
    try {
      const { athlete_id } = request.params
      const { data, error } = await supabase
        .from('sessions')
        .select(SESSION_SELECT)
        .eq('athlete_id', athlete_id)
        .order('date', { ascending: false })

      if (error) throw error
      return data
    } catch (err) {
      fastify.log.error(err)
      return reply.status(500).send({ message: "Erreur lors de la récupération des séances de l'athlète", error: err.message })
    }
  })

  // CREATE session
  fastify.post('/sessions', async (request, reply) => {
    const { exercises, ...rawData } = request.body

    try {
      const sessionData = {
        title: rawData.title,
        description: rawData.description || "",
        date: rawData.date || new Date().toISOString().split('T')[0],
        status: rawData.status || 'prévu',
        athlete_id: rawData.athlete_id || null,
        is_template: rawData.is_template === true,
        duration: parseInt(rawData.duration) || 0
      }

      const { data: sessions, error: sessionError } = await supabase
        .from('sessions')
        .insert([sessionData])
        .select()

      if (sessionError) throw sessionError
      
      const session = sessions[0]

      // Insertion des exercices si présents
      if (exercises && Array.isArray(exercises) && exercises.length > 0) {
        const exercisesToInsert = mapExercises(exercises, session.id)
        const { error: exError } = await supabase
          .from('session_exercises')
          .insert(exercisesToInsert)

        if (exError) {
          // On renvoie un code 207 (Multi-Status) si la session est créée mais pas les exercices
          return reply.status(207).send({ 
            message: "La séance a été créée mais l'enregistrement des exercices a échoué", 
            session, 
            error: exError 
          })
        }
      }

      return reply.status(201).send(session)
    } catch (err) {
      fastify.log.error(err)
      return reply.status(400).send({ message: "Erreur lors de la création de la séance", error: err.message })
    }
  })

  // UPDATE session
  fastify.put('/sessions/:id', async (request, reply) => {
    const { id } = request.params
    const { exercises, ...rawData } = request.body

    try {
      const sessionData = {
        title: rawData.title,
        description: rawData.description,
        date: rawData.date,
        status: rawData.status,
        athlete_id: rawData.athlete_id,
        is_template: rawData.is_template === true,
        duration: parseInt(rawData.duration) || 0
      }

      // 1. Mise à jour de l'enveloppe de la séance
      const { data: sessions, error: sessionError } = await supabase
        .from('sessions')
        .update(sessionData)
        .eq('id', id)
        .select()

      if (sessionError) throw sessionError

      // 2. Synchronisation des exercices (Suppression puis ré-insertion)
      if (exercises && Array.isArray(exercises)) {
        // TODO: Une approche plus granulaire (upsert/delete) serait préférable pour la prod
        await supabase.from('session_exercises').delete().eq('session_id', id)
        
        if (exercises.length > 0) {
          const exercisesToInsert = mapExercises(exercises, id)
          const { error: exError } = await supabase.from('session_exercises').insert(exercisesToInsert)
          
          if (exError) throw exError
        }
      }

      return sessions[0]
    } catch (err) {
      fastify.log.error(err)
      return reply.status(400).send({ message: "Erreur lors de la mise à jour de la séance", error: err.message })
    }
  })

  // DELETE session
  fastify.delete('/sessions/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const { error } = await supabase.from('sessions').delete().eq('id', id)
      
      if (error) throw error
      return reply.status(204).send()
    } catch (err) {
      fastify.log.error(err)
      return reply.status(400).send({ message: "Erreur lors de la suppression de la séance", error: err.message })
    }
  })
}
