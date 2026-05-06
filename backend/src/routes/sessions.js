export default async function sessionRoutes(fastify, opts) {
  const { supabase } = fastify

  /**
   * Helper pour transformer une valeur en nombre ou null/0 pour PostgreSQL
   */
  const toNumeric = (val, defaultValue = 0) => {
    if (val === undefined || val === null || val === "") return defaultValue;
    const parsed = parseFloat(val.toString().replace(',', '.'));
    return isNaN(parsed) ? defaultValue : parsed;
  };

  /**
   * Helper pour mapper les exercices reçus du client vers le format de la DB
   */
  const mapExercises = (exercises, sessionId) => {
    return exercises
      .map((ex, index) => {
        const exerciseId = ex.exercise_id || ex.template_id || ex.id;
        
        if (!exerciseId) {
          console.warn(`[WARN] Exercice à l'index ${index} ignoré car l'ID est manquant`);
          return null;
        }

        return {
          session_id: sessionId,
          exercise_id: exerciseId,
          sets: 1, // On force à 1 car piloté par les rounds globaux
          reps: Math.round(toNumeric(ex.reps, 0)),
          weight: toNumeric(ex.weight, 0),
          order_index: ex.order_index !== undefined ? parseInt(ex.order_index) : index,
          rest_time: Math.round(toNumeric(ex.rest_time || ex.rest_time_seconds, 60)),
          notes: ex.notes || "",
          intensity: ex.intensity ? toNumeric(ex.intensity, 0).toString() : null,
          section: ex.section || 'main'
        };
      })
      .filter(ex => ex !== null);
  }

  const SESSION_SELECT = `
    *,
    session_exercises (
      id, exercise_id, sets, reps, weight, order_index, rest_time, notes, intensity, section,
      exercices_library (name, category, unit, description)
    ),
    athletes (id, first_name, last_name, email, avatar_url)
  `

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
      return reply.status(500).send({ message: "Erreur lors de la récupération", error: err.message })
    }
  })

  // GET single session
  fastify.get('/sessions/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const { data, error } = await supabase.from('sessions').select(SESSION_SELECT).eq('id', id).single()
      if (error) throw error
      return data
    } catch (err) {
      return reply.status(404).send({ message: "Séance non trouvée", error: err.message })
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
        duration: toNumeric(rawData.duration, 0),
        main_rounds: Math.round(toNumeric(rawData.main_rounds, 1))
      }

      const { data: sessions, error: sessionError } = await supabase.from('sessions').insert([sessionData]).select()
      if (sessionError) throw sessionError
      
      const session = sessions[0]
      if (exercises && Array.isArray(exercises) && exercises.length > 0) {
        const { error: exError } = await supabase.from('session_exercises').insert(mapExercises(exercises, session.id))
        if (exError) return reply.status(207).send({ message: "Séance créée mais erreur exercices", session, error: exError.message })
      }
      return reply.status(201).send(session)
    } catch (err) {
      return reply.status(400).send({ message: "Erreur lors de la création", error: err.message })
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
        athlete_id: rawData.athlete_id || null,
        is_template: rawData.is_template === true,
        duration: toNumeric(rawData.duration, 0),
        main_rounds: Math.round(toNumeric(rawData.main_rounds, 1))
      }

      const { data: sessions, error: sessionError } = await supabase.from('sessions').update(sessionData).eq('id', id).select()
      if (sessionError) throw sessionError

      if (exercises && Array.isArray(exercises)) {
        await supabase.from('session_exercises').delete().eq('session_id', id)
        if (exercises.length > 0) {
          const { error: exError } = await supabase.from('session_exercises').insert(mapExercises(exercises, id))
          if (exError) throw exError
        }
      }
      return sessions[0]
    } catch (err) {
      return reply.status(400).send({ message: "Erreur lors de la mise à jour", error: err.message })
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
      return reply.status(400).send({ message: "Erreur lors de la suppression", error: err.message })
    }
  })
}
