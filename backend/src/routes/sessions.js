export default async function sessionRoutes(fastify, opts) {
  const { supabase } = fastify

  /**
   * Helper pour mapper les exercices reçus du client vers le format de la DB
   */
  const mapExercises = (exercises, sessionId) => {
    console.log(`[DEBUG] Mapping ${exercises.length} exercises for session ${sessionId}`);
    return exercises
      .map((ex, index) => {
        const exerciseId = ex.exercise_id || ex.template_id || ex.id;
        if (!exerciseId) console.warn(`[WARN] Exercise at index ${index} missing ID:`, ex);
        return {
          session_id: sessionId,
          exercise_id: exerciseId,
          sets: parseInt(ex.sets) || 0,
          reps: parseInt(ex.reps) || 0,
          weight: parseFloat(ex.weight) || 0,
          order_index: ex.order_index !== undefined ? ex.order_index : index,
          rest_time: (ex.rest_time !== undefined && ex.rest_time !== null) ? parseInt(ex.rest_time) : 60,
          notes: ex.notes || "",
          intensity: parseFloat(ex.intensity) || 0
        };
      })
      .filter(ex => ex.exercise_id)
  }

  // Requête SELECT réutilisable
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
      first_name,
      last_name
    )
  `

  // --- ROUTES ---

  // GET all sessions
  fastify.get('/sessions', async (request, reply) => {
    const { data, error } = await supabase
      .from('sessions')
      .select(SESSION_SELECT)
      .order('date', { ascending: false })

    if (error) return reply.status(500).send(error)
    return data
  })

  // GET single session
  fastify.get('/sessions/:id', async (request, reply) => {
    const { id } = request.params
    const { data, error } = await supabase
      .from('sessions')
      .select(SESSION_SELECT)
      .eq('id', id)
      .single()

    if (error) return reply.status(404).send({ message: 'Session not found', error })
    return data
  })

  // GET sessions by athlete
  fastify.get('/athletes/:athlete_id/sessions', async (request, reply) => {
    const { athlete_id } = request.params
    const { data, error } = await supabase
      .from('sessions')
      .select(SESSION_SELECT)
      .eq('athlete_id', athlete_id)
      .order('date', { ascending: false })

    if (error) return reply.status(500).send(error)
    return data
  })

  // CREATE session
  fastify.post('/sessions', async (request, reply) => {
    console.log("[DEBUG] POST /sessions body:", JSON.stringify(request.body, null, 2));
    const { exercises, ...rawData } = request.body

    const sessionData = {
      title: rawData.title,
      description: rawData.description,
      date: rawData.date,
      status: rawData.status || 'prévu',
      athlete_id: rawData.athlete_id || null,
      is_template: rawData.is_template === true
    }

    const { data: sessions, error: sessionError } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select()

    if (sessionError) return reply.status(400).send(sessionError)
    
    const session = sessions[0]

    if (exercises && Array.isArray(exercises) && exercises.length > 0) {
      const exercisesToInsert = mapExercises(exercises, session.id)
      console.log("[DEBUG] Inserting exercises:", exercisesToInsert);
      const { error: exError } = await supabase
        .from('session_exercises')
        .insert(exercisesToInsert)

      if (exError) {
        console.error("[ERROR] Failed to insert exercises:", exError);
        return reply.status(207).send({ message: "Session created but exercises failed", session, error: exError })
      }
    }

    return reply.status(201).send(session)
  })

  // UPDATE session
  fastify.put('/sessions/:id', async (request, reply) => {
    console.log(`[DEBUG] PUT /sessions/${request.params.id} body:`, JSON.stringify(request.body, null, 2));
    const { id } = request.params
    const { exercises, ...rawData } = request.body

    const sessionData = {
      title: rawData.title,
      description: rawData.description,
      date: rawData.date,
      status: rawData.status,
      athlete_id: rawData.athlete_id,
      is_template: rawData.is_template === true
    }

    // 1. Update Session
    const { data: sessions, error: sessionError } = await supabase
      .from('sessions')
      .update(sessionData)
      .eq('id', id)
      .select()

    if (sessionError) return reply.status(400).send(sessionError)

    // 2. Sync Exercises (Delete then Re-insert)
    if (exercises && Array.isArray(exercises)) {
      console.log(`[DEBUG] Syncing exercises for session ${id}`);
      await supabase.from('session_exercises').delete().eq('session_id', id)
      
      if (exercises.length > 0) {
        const exercisesToInsert = mapExercises(exercises, id)
        console.log("[DEBUG] Inserting exercises:", exercisesToInsert);
        const { error: exError } = await supabase.from('session_exercises').insert(exercisesToInsert)
        if (exError) {
            console.error("[ERROR] Failed to insert exercises during update:", exError);
            return reply.status(400).send({ message: "Failed to update exercises", error: exError });
        }
    }
    }

    return sessions[0]
  })

  // DELETE session
  fastify.delete('/sessions/:id', async (request, reply) => {
    const { id } = request.params
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    
    if (error) return reply.status(400).send(error)
    return reply.status(204).send()
  })
}
