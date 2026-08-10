'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const SESSION_SELECT = `
  *,
  exercices:session_exercises (
    *,
    exercice:exercices_library (*)
  ),
  objectif:objectifs (*)
`

export async function getSessions() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select(SESSION_SELECT)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getSessionById(id) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select(SESSION_SELECT)
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function isObjectifFull(objectifId) {
  const supabase = await createClient()
  const { data: objectif, error: objectifError } = await supabase
    .from('objectifs')
    .select('total_sessions')
    .eq('id', objectifId)
    .single()

  if (objectifError) throw new Error(objectifError.message)

  const { count, error: countError } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('objectif_id', objectifId)

  if (countError) throw new Error(countError.message)
  return count >= objectif.total_sessions
}

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
      sets: ex.sets !== "" ? parseInt(ex.sets) || 1 : 1,
      reps: ex.reps !== "" ? parseInt(ex.reps) || 0 : 0,
      weight: ex.weight !== "" ? parseFloat(ex.weight) || 0 : 0,
      rest_time: ex.rest_time !== "" ? parseInt(ex.rest_time) || 60 : 60,
      order_index: ex.order_index,
      notes: ex.notes || "",
      intensity: ex.intensity !== "" && ex.intensity != null ? Number(ex.intensity) : 0,
      section: ex.section || 'main',
      rounds: ex.rounds !== "" ? parseInt(ex.rounds) || 1 : 1
    }))

    console.log('[createSession] exercisesToInsert:', JSON.stringify(exercisesToInsert, null, 2))

    console.log(
      '[createSession] numeric fields:',
      exercisesToInsert.map((ex, index) => ({
        index,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        rest_time: ex.rest_time,
        order_index: ex.order_index,
        intensity: ex.intensity,
        rounds: ex.rounds
      }))
    )

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

export async function updateSession(sessionId, updates) {
  const supabase = await createClient()
  const currentSession = await getSessionById(sessionId)

  const objectifIdChanged = updates.objectif_id !== undefined &&
    updates.objectif_id !== currentSession.objectif_id

  if (objectifIdChanged) {
    if (updates.objectif_id && currentSession.objectif_id) {
      await supabase.rpc('move_session_to_another_objectif', {
        p_session_id: sessionId,
        p_new_objectif_id: updates.objectif_id,
      })
      updates.session_number = null
    } else if (currentSession.objectif_id && updates.objectif_id === null) {
      updates.objectif_id = null
      updates.session_number = null
    } else if (updates.objectif_id && currentSession.objectif_id === null) {
      const { count, error } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('objectif_id', updates.objectif_id)

      if (error) throw new Error(error.message)
      if (await isObjectifFull(updates.objectif_id)) {
        throw new Error("L'objectif est plein")
      }

      updates.session_number = count + 1
    }
  }

  const { data, error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', sessionId)
    .select(SESSION_SELECT)
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/admin/seances')
  revalidatePath('/admin/modeles')
  revalidatePath('/athlete/mes-seances')
  return data
}

export async function deleteSession(sessionId) {
  const supabase = await createClient()
  const { error } = await supabase.rpc('delete_session_and_renumber', {
    p_session_id: sessionId,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/seances')
  revalidatePath('/admin/modeles')
  revalidatePath('/athlete/mes-seances')
}

export async function duplicateSession(sessionId) {
  const supabase = await createClient()
  const session = await getSessionById(sessionId)

  if (session.objectif_id) {
    if (await isObjectifFull(session.objectif_id)) {
      throw new Error("L'objectif est plein")
    }
  }

  const { data, error } = await supabase.rpc('duplicate_session', {
    p_session_id: sessionId,
    p_new_title: `Copie de ${session.title}`,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/seances')
  revalidatePath('/admin/modeles')
  return data
}

export async function moveSessionWithinObjectif(sessionId, newPosition) {
  const supabase = await createClient()
  const { error } = await supabase.rpc('move_session_within_objectif', {
    p_session_id: sessionId,
    p_new_position: newPosition,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/seances')
  revalidatePath('/admin/modeles')
  revalidatePath('/athlete/mes-seances')
}

export async function moveSessionToAnotherObjectif(sessionId, newObjectifId) {
  const supabase = await createClient()
  const { error } = await supabase.rpc('move_session_to_another_objectif', {
    p_session_id: sessionId,
    p_new_objectif_id: newObjectifId,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/seances')
  revalidatePath('/admin/modeles')
  revalidatePath('/athlete/mes-seances')
}

export async function moveSession(sessionId, newPosition) {
  try {
    await moveSessionWithinObjectif(sessionId, newPosition)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function transmitSession(sessionId) {
  const supabase = await createClient()
  try {
    const { error } = await supabase.rpc('transmit_session', {
      p_session_id: sessionId
    })

    if (error) throw new Error(error.message)

    revalidatePath('/admin/seances')
    revalidatePath('/athlete/mes-seances')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
