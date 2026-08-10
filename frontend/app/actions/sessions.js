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

  if (!sessionData.is_template) {
    if (!sessionData.objectif_id) {
      throw new Error("Une séance classique doit obligatoirement être rattachée à un objectif")
    }
    if (!sessionData.athlete_id) {
      throw new Error("Une séance classique doit obligatoirement être rattachée à un athlète")
    }
  } else {
    sessionData.objectif_id = null
    sessionData.athlete_id = null
  }

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

  const { data: newSession, error: sessionError } = await supabase
    .from('sessions')
    .insert(sessionFields)
    .select(SESSION_SELECT)
    .single()

  if (sessionError) throw new Error(sessionError.message)

  if (exercises && exercises.length > 0) {
    const toSafeNumber = (value, defaultValue = 0) => {
      if (value === undefined || value === null || value === "") {
        return defaultValue;
      }
      const num = Number(value);
      return isNaN(num) ? defaultValue : num;
    };

    const exercisesToInsert = exercises.map(ex => ({
      session_id: newSession.id,
      exercise_id: ex.exercise_id,
      sets: toSafeNumber(ex.sets, 1),
      reps: toSafeNumber(ex.reps, 0),
      weight: toSafeNumber(ex.weight, 0),
      rest_time: toSafeNumber(ex.rest_time, 60),
      order_index: toSafeNumber(ex.order_index, 0),
      notes: ex.notes || "",
      intensity: toSafeNumber(ex.intensity, 0),
      section: ex.section || 'main',
      rounds: toSafeNumber(ex.rounds, 1)
    }))

    const { error: exercisesError } = await supabase
      .from('session_exercises')
      .insert(exercisesToInsert)

    if (exercisesError) {
      await supabase.from('sessions').delete().eq('id', newSession.id)
      throw new Error(exercisesError.message)
    }
  }

  revalidatePath('/admin/seances')
  revalidatePath('/admin/modeles')
  return newSession
}

export async function updateSession(id, sessionData) {
  const supabase = await createClient()
  const { exercises, ...sessionFields } = sessionData

  const { data: updatedSession, error: sessionError } = await supabase
    .from('sessions')
    .update(sessionFields)
    .eq('id', id)
    .select(SESSION_SELECT)
    .single()

  if (sessionError) throw new Error(sessionError.message)

  if (exercises) {
    await supabase.from('session_exercises').delete().eq('session_id', id)

    const exercisesToInsert = exercises.map((ex, index) => ({
      session_id: id,
      exercise_id: ex.exercise_id,
      sets: ex.sets || 1,
      reps: ex.reps || 0,
      weight: ex.weight || 0,
      rest_time: ex.rest_time || 60,
      order_index: index,
      notes: ex.notes || "",
      intensity: ex.intensity || 0,
      section: ex.section || 'main',
      rounds: ex.rounds || 1
    }))

    const { error: exercisesError } = await supabase
      .from('session_exercises')
      .insert(exercisesToInsert)

    if (exercisesError) throw new Error(exercisesError.message)
  }

  revalidatePath('/admin/seances')
  revalidatePath('/admin/modeles')
  return updatedSession
}

export async function transmitSession(sessionId) {
  const supabase = await createClient()

  try {
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*, athlete:athletes(*), objectif:objectifs(*)')
      .eq('id', sessionId)
      .single()

    if (sessionError) throw new Error(sessionError.message)
    if (!session) throw new Error("Séance introuvable")

    if (!session.athlete) {
      throw new Error("La séance n'est pas liée à un athlète")
    }

    if (!session.athlete.email || !session.athlete.email.includes('@')) {
      throw new Error("L'athlète n'a pas d'adresse email valide")
    }

    // Ici vous devriez implémenter l'envoi d'email avec votre service d'email
    // Exemple avec un service fictif:
    // await sendEmail({
    //   to: session.athlete.email,
    //   subject: `Nouveau programme: ${session.title}`,
    //   html: generateProgramEmail(session)
    // })

    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        status: 'transmis',
        transmitted_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    if (updateError) throw new Error(updateError.message)

    revalidatePath('/admin/seances')
    return { success: true }
  } catch (error) {
    console.error("Erreur lors de la transmission:", error)
    return { success: false, error: error.message }
  }
}

export async function moveSession(sessionId, newSessionNumber) {
  const supabase = await createClient()

  try {
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*, objectif:objectifs(id)')
      .eq('id', sessionId)
      .single()

    if (sessionError) throw new Error(sessionError.message)
    if (!session) throw new Error("Séance introuvable")
    if (!session.objectif) throw new Error("La séance n'est pas liée à un objectif")

    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, session_number')
      .eq('objectif_id', session.objectif.id)
      .order('session_number', { ascending: true })

    if (sessionsError) throw new Error(sessionsError.message)

    if (newSessionNumber < 1 || newSessionNumber > sessions.length) {
      throw new Error("Numéro de séance invalide")
    }

    const { error } = await supabase.rpc('move_session', {
      session_id: sessionId,
      new_session_number: newSessionNumber
    })

    if (error) throw new Error(error.message)

    revalidatePath('/admin/seances')
    return { success: true }
  } catch (error) {
    console.error("Erreur lors du déplacement:", error)
    return { success: false, error: error.message }
  }
}

export async function moveSessionWithinObjectif(sessionId, newPosition) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.rpc('move_session_within_objectif', {
      p_session_id: sessionId,
      p_new_position: newPosition
    })

    if (error) throw new Error(error.message)

    revalidatePath('/admin/seances')
    return { success: true }
  } catch (error) {
    console.error("Erreur lors du déplacement dans l'objectif:", error)
    return { success: false, error: error.message }
  }
}

export async function moveSessionToAnotherObjectif(sessionId, newObjectifId, newPosition) {
  const supabase = await createClient()

  try {
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError) throw new Error(sessionError.message)
    if (!session) throw new Error("Séance introuvable")

    const { data: newObjectif, error: objectifError } = await supabase
      .from('objectifs')
      .select('id, total_sessions')
      .eq('id', newObjectifId)
      .single()

    if (objectifError) throw new Error(objectifError.message)
    if (!newObjectif) throw new Error("Nouvel objectif introuvable")

    if (await isObjectifFull(newObjectifId)) {
      throw new Error("Le nouvel objectif est plein")
    }

    const { error } = await supabase.rpc('move_session_to_another_objectif', {
      p_session_id: sessionId,
      p_new_objectif_id: newObjectifId,
      p_new_position: newPosition
    })

    if (error) throw new Error(error.message)

    revalidatePath('/admin/seances')
    revalidatePath('/admin/objectifs')
    return { success: true }
  } catch (error) {
    console.error("Erreur lors du déplacement vers un autre objectif:", error)
    return { success: false, error: error.message }
  }
}
