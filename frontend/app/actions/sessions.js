
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const SESSION_SELECT =
  '*, exercices:session_exercises(*, exercice:exercices_library(*)), objectif:objectifs(*)'

export async function getSessions() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sessions')
    .select(SESSION_SELECT)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getSessionById(id) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sessions')
    .select(SESSION_SELECT)
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function isObjectifFull(objectifId) {
  const supabase = await createClient()

  const { data: objectif, error: objectifError } = await supabase
    .from('objectifs')
    .select('total_sessions')
    .eq('id', objectifId)
    .single()

  if (objectifError) {
    throw new Error(objectifError.message)
  }

  const { count, error: countError } = await supabase
    .from('sessions')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('objectif_id', objectifId)

  if (countError) {
    throw new Error(countError.message)
  }

  return count >= objectif.total_sessions
}

export async function createSession(sessionData) {
  const supabase = await createClient()

  if (!sessionData.is_template) {
    if (!sessionData.objectif_id) {
      throw new Error(
        'Une séance classique doit obligatoirement être rattachée à un objectif'
      )
    }

    if (!sessionData.athlete_id) {
      throw new Error(
        'Une séance classique doit obligatoirement être rattachée à un athlète'
      )
    }
  } else {
    sessionData.objectif_id = null
    sessionData.athlete_id = null
  }

  const { exercises, ...sessionFields } = sessionData

  if (sessionFields.objectif_id) {
    const { count, error } = await supabase
      .from('sessions')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('objectif_id', sessionFields.objectif_id)

    if (error) {
      throw new Error(error.message)
    }

    if (await isObjectifFull(sessionFields.objectif_id)) {
      throw new Error("L'objectif est plein")
    }

    sessionFields.session_number = (count || 0) + 1
  } else {
    sessionFields.session_number = null
  }

  const {
    data: newSession,
    error: sessionError,
  } = await supabase
    .from('sessions')
    .insert(sessionFields)
    .select(SESSION_SELECT)
    .single()

  if (sessionError) {
    throw new Error(sessionError.message)
  }

  if (exercises && exercises.length > 0) {
    const toSafeNumber = (value, defaultValue = 0) => {
      if (
        value === undefined ||
        value === null ||
        value === ''
      ) {
        return defaultValue
      }

      const num = Number(value)

      return Number.isNaN(num) ? defaultValue : num
    }

    const exercisesToInsert = exercises.map((ex) => ({
      session_id: newSession.id,
      exercise_id: ex.exercise_id,
      sets: toSafeNumber(ex.sets, 1),
      reps: toSafeNumber(ex.reps, 0),
      weight: toSafeNumber(ex.weight, 0),
      rest_time: toSafeNumber(ex.rest_time, 60),
      order_index: toSafeNumber(ex.order_index, 0),
      notes: ex.notes || '',
      intensity: toSafeNumber(ex.intensity, 0),
      section: ex.section || 'main',
      rounds: toSafeNumber(ex.rounds, 1),
    }))

    const { error: exercisesError } = await supabase
      .from('session_exercises')
      .insert(exercisesToInsert)

    if (exercisesError) {
      await supabase
        .from('sessions')
        .delete()
        .eq('id', newSession.id)

      throw new Error(exercisesError.message)
    }
  }

  revalidatePath('/admin/seances')
  revalidatePath('/admin/modeles')
  revalidatePath('/admin/objectifs')
  revalidatePath('/athlete/mes-seances')

  return newSession
}

export async function updateSession(id, sessionData) {
  const supabase = await createClient()

  const { exercises, ...sessionFields } = sessionData

  const {
    data: updatedSession,
    error: sessionError,
  } = await supabase
    .from('sessions')
    .update(sessionFields)
    .eq('id', id)
    .select(SESSION_SELECT)
    .single()

  if (sessionError) {
    throw new Error(sessionError.message)
  }

  if (exercises) {
    const {
      error: deleteExercisesError,
    } = await supabase
      .from('session_exercises')
      .delete()
      .eq('session_id', id)

    if (deleteExercisesError) {
      throw new Error(deleteExercisesError.message)
    }

    const toSafeNumber = (value, defaultValue = 0) => {
      if (
        value === undefined ||
        value === null ||
        value === ''
      ) {
        return defaultValue
      }

      const num = Number(value)

      return Number.isNaN(num) ? defaultValue : num
    }

    const exercisesToInsert = exercises.map((ex, index) => ({
      session_id: id,
      exercise_id: ex.exercise_id,
      sets: toSafeNumber(ex.sets, 1),
      reps: toSafeNumber(ex.reps, 0),
      weight: toSafeNumber(ex.weight, 0),
      rest_time: toSafeNumber(ex.rest_time, 60),
      order_index: index,
      notes: ex.notes || '',
      intensity: toSafeNumber(ex.intensity, 0),
      section: ex.section || 'main',
      rounds: toSafeNumber(ex.rounds, 1),
    }))

    if (exercisesToInsert.length > 0) {
      const {
        error: exercisesError,
      } = await supabase
        .from('session_exercises')
        .insert(exercisesToInsert)

      if (exercisesError) {
        throw new Error(exercisesError.message)
      }
    }
  }

  revalidatePath('/admin/seances')
  revalidatePath('/admin/modeles')
  revalidatePath('/admin/objectifs')
  revalidatePath('/athlete/mes-seances')

  return updatedSession
}

export async function transmitSession(sessionId) {
  const supabase = await createClient()

  try {
    const {
      data: session,
      error: sessionError,
    } = await supabase
      .from('sessions')
      .select(
        '*, athlete:athletes(*), objectif:objectifs(*)'
      )
      .eq('id', sessionId)
      .single()

    if (sessionError) {
      throw new Error(sessionError.message)
    }

    if (!session) {
      throw new Error('Séance introuvable')
    }

    if (!session.athlete) {
      throw new Error(
        "La séance n'est pas liée à un athlète"
      )
    }

    if (
      !session.athlete.email ||
      !session.athlete.email.includes('@')
    ) {
      throw new Error(
        "L'athlète n'a pas d'adresse email valide"
      )
    }

    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        status: 'transmis',
        transmitted_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    if (updateError) {
      throw new Error(updateError.message)
    }

    revalidatePath('/admin/seances')
    revalidatePath('/admin/modeles')
    revalidatePath('/admin/objectifs')
    revalidatePath('/athlete/mes-seances')

    return {
      success: true,
    }
  } catch (error) {
    console.error(
      'Erreur lors de la transmission:',
      error
    )

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    }
  }
}

export async function deleteSession(id) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    revalidatePath('/mes-seances')
    revalidatePath('/seances')
    revalidatePath('/modeles')
    revalidatePath('/suivis')

    revalidatePath('/admin/seances')
    revalidatePath('/admin/modeles')
    revalidatePath('/admin/suivis')
    revalidatePath('/admin/objectifs')

    revalidatePath('/athlete/mes-seances')

    return {
      success: true,
    }
  } catch (error) {
    console.error(
      'Erreur lors de la suppression de la séance:',
      error
    )

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    }
  }
}

export async function updateSessionRealisation(
  id,
  realisation
) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('sessions')
      .update({
        realisation: realisation,
      })
      .eq('id', id)

    if (error) {
      console.error(
        'Erreur Supabase updateSessionRealisation:',
        error
      )

      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath('/suivis')
    revalidatePath('/seances')
    revalidatePath('/mes-seances')
    revalidatePath('/admin/suivis')
    revalidatePath('/admin/seances')
    revalidatePath('/athlete/mes-seances')

    return {
      success: true,
    }
  } catch (error) {
    console.error(
      'Erreur lors de la mise à jour de la réalisation:',
      error
    )

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    }
  }
}

export async function moveSession(
  sessionId,
  newSessionNumber
) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.rpc(
      'move_session',
      {
        p_session_id: sessionId,
        p_new_session_number: newSessionNumber,
      }
    )

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/admin/seances')
    revalidatePath('/admin/modeles')
    revalidatePath('/admin/objectifs')
    revalidatePath('/athlete/mes-seances')

    return {
      success: true,
    }
  } catch (error) {
    console.error(
      'Erreur lors du déplacement:',
      error
    )

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    }
  }
}

export async function moveSessionWithinObjectif(
  sessionId,
  newPosition
) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.rpc(
      'move_session_within_objectif',
      {
        p_session_id: sessionId,
        p_new_position: newPosition,
      }
    )

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/admin/seances')
    revalidatePath('/admin/modeles')
    revalidatePath('/admin/objectifs')
    revalidatePath('/athlete/mes-seances')

    return {
      success: true,
    }
  } catch (error) {
    console.error(
      "Erreur lors du déplacement dans l'objectif:",
      error
    )

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    }
  }
}

export async function moveSessionToAnotherObjectif(
  sessionId,
  newObjectifId,
  newPosition
) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.rpc(
      'move_session_to_another_objectif',
      {
        p_session_id: sessionId,
        p_new_objectif_id: newObjectifId,
        p_new_position: newPosition,
      }
    )

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/admin/seances')
    revalidatePath('/admin/modeles')
    revalidatePath('/admin/objectifs')
    revalidatePath('/athlete/mes-seances')

    return {
      success: true,
    }
  } catch (error) {
    console.error(
      "Erreur lors du déplacement vers un autre objectif:",
      error
    )

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    }
  }
}

