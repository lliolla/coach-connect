'use server'

import { createClient } from '@/lib/supabase/server'
import { toNumeric, mapExercises } from '@/lib/actions-utils'
import { revalidatePath } from 'next/cache'

const SESSION_SELECT = `
  *,
  session_exercises (
    id, exercise_id, sets, reps, weight, order_index, rest_time, notes, intensity, section,
    exercices_library (name, category, unit, description)
  ),
  athletes (id, first_name, last_name, email, avatar_url)
`

export async function getSessions() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select(SESSION_SELECT)
    .order('date', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function getSessionById(id) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('sessions').select(SESSION_SELECT).eq('id', id).single()
  if (error) throw new Error(error.message)
  return data
}

export async function createSession(formData) {
  const supabase = await createClient()
  const { exercises, ...rawData } = formData
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
      if (exError) return { success: true, warning: "Séance créée mais erreur exercices", session }
    }
    
    revalidatePath('/sessions')
    revalidatePath('/seances')
    return { success: true, data: session }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function updateSession(id, formData) {
  const supabase = await createClient()
  const { exercises, ...rawData } = formData
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
    
    revalidatePath('/sessions')
    revalidatePath('/seances')
    revalidatePath(`/sessions/${id}`)
    revalidatePath(`/seances/${id}`)
    return { success: true, data: sessions[0] }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function deleteSession(id) {
  const supabase = await createClient()
  try {
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (error) throw error
    
    revalidatePath('/sessions')
    revalidatePath('/seances')
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
