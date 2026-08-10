export async function createSession(sessionData) {
  const supabase = await createClient()

  // Extraire les exercices du sessionData
  const { exercises, ...sessionFields } = sessionData

  if (sessionFields.objectif_id) {
    const { count, error } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('objectif_id', sessionFields.objectif_id)

    if (error) throw new Error(error.message)
    if (await isObjectifFull(sessionFields.objectif_id)) {
      throw new Error("L'objectif est plein")
    }

    sessionFields.session_number = count + 1
  } else {
    sessionFields.session_number = null
  }

  // Créer la session
  const { data: newSession, error: sessionError } = await supabase
    .from('sessions')
    .insert(sessionFields)
    .select(SESSION_SELECT)
    .single()

  if (sessionError) throw new Error(sessionError.message)

  // Créer les exercices associés si ils existent
  if (exercises && exercises.length > 0) {
    const exercisesToInsert = exercises.map(ex => ({
      session_id: newSession.id,
      exercise_id: ex.exercise_id,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      rest_time: ex.rest_time,
      order_index: ex.order_index,
      notes: ex.notes,
      intensity: ex.intensity,
      section: ex.section,
      rounds: ex.rounds
    }))

    const { error: exercisesError } = await supabase
      .from('session_exercises')
      .insert(exercisesToInsert)

    if (exercisesError) {
      // En cas d'erreur, supprimer la session créée pour éviter les orphelins
      await supabase.from('sessions').delete().eq('id', newSession.id)
      throw new Error(exercisesError.message)
    }
  }

  revalidatePath('/admin/seances')
  revalidatePath('/admin/modeles')
  return newSession
}
