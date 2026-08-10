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

  // Validation stricte des règles métier
  if (!sessionData.is_template) {
    if (!sessionData.objectif_id) {
      throw new Error("Une séance classique doit obligatoirement être rattachée à un objectif")
    }
    if (!sessionData.athlete_id) {
      throw new Error("Une séance classique doit obligatoirement être rattachée à un athlète")
    }
  } else {
    // Pour les modèles, forcer les valeurs nulles
    sessionData.objectif_id = null
    sessionData.athlete_id = null
  }

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
    // Fonction utilitaire pour convertir en nombre avec vérification stricte
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
      // En cas d'erreur, supprimer la session créée pour éviter les orphelins
      await supabase.from('sessions').delete().eq('id', newSession.id)
      throw new Error(exercisesError.message)
    }
  }

  revalidatePath('/admin/seances')
  revalidatePath('/admin/modeles')
  return newSession
}

// ... (toutes les autres fonctions restent strictement inchangées)
