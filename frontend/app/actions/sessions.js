'use server'

import { createClient } from '@/lib/supabase/server'
import { toNumeric, mapExercises } from '@/lib/actions-utils'
import { revalidatePath } from 'next/cache'

// On définit ce qu'on veut récupérer par défaut (avec les exercices liés)
const SESSION_SELECT = `
  *,
  session_exercises (
    *,
    exercise:exercices_library(*)
  )
`

export async function getSessions() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select(SESSION_SELECT)
    .order('date', { ascending: false })
    
  if (error) return { success: false, error: error.message }
  return { success: true, data: data }
}

export async function getSessionById(id) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select(SESSION_SELECT)
    .eq('id', id)
    .single()
    
  if (error) return { success: false, error: error.message }
  return { success: true, data: data }
}

export async function createSession(formData) {
  const supabase = await createClient()
  
  // Gestion si formData est une instance de FormData ou un objet simple
  const dataRaw = formData instanceof FormData ? Object.fromEntries(formData) : formData
  const { exercises, ...rawData } = dataRaw

  try {
    // Récupérer l'ID de l'utilisateur connecté pour l'associer à la séance
    const { data: { user } } = await supabase.auth.getUser()

    const sessionData = {
      title: rawData.title,
      description: rawData.description || "",
      date: rawData.date || new Date().toISOString().split('T')[0],
      status: rawData.status || 'prévu',
      // Si athlete_id n'est pas fourni, on prend l'user actuel
      athlete_id: rawData.athlete_id || user?.id, 
      is_template: rawData.is_template === true || rawData.is_template === 'true',
      duration: toNumeric(rawData.duration, 0),
      main_rounds: Math.round(toNumeric(rawData.main_rounds, 1))
    }

    const { data: sessions, error: sessionError } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select()

    if (sessionError) throw sessionError
    
    const session = sessions[0]

    // Insertion des exercices si présents
    if (exercises && Array.isArray(exercises) && exercises.length > 0) {
      const formattedExercises = mapExercises(exercises, session.id)
      const { error: exError } = await supabase
        .from('session_exercises')
        .insert(formattedExercises)
        
      if (exError) return { success: true, warning: "Séance créée sans exercices", session }
    }
    
    // Revalidation des chemins (pense à tes nouveaux noms de dossiers !)
    revalidatePath('/mes-seances')
    revalidatePath('/gestion-seances')
    revalidatePath('/modeles')
    
    return { success: true, data: session }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function updateSession(id, formData) {
  const supabase = await createClient()
  const dataRaw = formData instanceof FormData ? Object.fromEntries(formData) : formData
  const { exercises, ...rawData } = dataRaw

  try {
    const sessionData = {
      title: rawData.title,
      description: rawData.description,
      date: rawData.date,
      status: rawData.status,
      athlete_id: rawData.athlete_id,
      is_template: rawData.is_template === true || rawData.is_template === 'true',
      duration: toNumeric(rawData.duration, 0),
      main_rounds: Math.round(toNumeric(rawData.main_rounds, 1))
    }

    const { data: sessions, error: sessionError } = await supabase
      .from('sessions')
      .update(sessionData)
      .eq('id', id)
      .select()

    if (sessionError) throw sessionError

    // Mise à jour simplifiée des exercices (Delete then Insert)
    if (exercises && Array.isArray(exercises)) {
      await supabase.from('session_exercises').delete().eq('session_id', id)
      
      if (exercises.length > 0) {
        const { error: exError } = await supabase
          .from('session_exercises')
          .insert(mapExercises(exercises, id))
        if (exError) throw exError
      }
    }
    
    revalidatePath('/mes-seances')
    revalidatePath('/gestion-seances')
    revalidatePath(`/mes-seances/${id}`)
    
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
    
    revalidatePath('/mes-seances')
    revalidatePath('/gestion-seances')
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}