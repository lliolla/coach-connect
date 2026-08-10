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

  if (sessionData.objectif_id) {
    const { count, error } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('objectif_id', sessionData.objectif_id)

    if (error) throw new Error(error.message)
    if (await isObjectifFull(sessionData.objectif_id)) {
      throw new Error("L'objectif est plein")
    }

    sessionData.session_number = count + 1
  } else {
    sessionData.session_number = null
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert(sessionData)
    .select(SESSION_SELECT)
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/admin/seances')
  revalidatePath('/admin/modeles')
  return data
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

// Nouvelle fonction wrapper pour la compatibilité avec le frontend
export async function moveSession(sessionId, newPosition) {
  try {
    await moveSessionWithinObjectif(sessionId, newPosition)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Nouvelle fonction pour la transmission de session
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
