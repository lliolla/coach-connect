'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Récupère tous les objectifs avec leurs séances liées
 */
export async function getObjectifs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('objectifs')
    .select(`
      *,
      sessions (*)
    `)
    .order('label', { ascending: true })
  
  if (error) {
    // Si la jointure échoue (colonne sessions.objectif_id absente), on récupère juste les objectifs
    const { data: simpleData, error: simpleError } = await supabase
      .from('objectifs')
      .select('*')
      .order('label', { ascending: true })
    if (simpleError) throw new Error(simpleError.message)
    return simpleData
  }
  return data
}

/**
 * Récupère un objectif par son ID avec ses séances
 */
export async function getObjectifById(id) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('objectifs')
    .select(`
      *,
      sessions (*)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    const { data: simpleData, error: simpleError } = await supabase
      .from('objectifs')
      .select('*')
      .eq('id', id)
      .single()
    if (simpleError) throw new Error(simpleError.message)
    return simpleData
  }
  return data
}

/**
 * Crée un nouvel objectif
 */
export async function createObjectif(formData) {
  const supabase = await createClient()
  const { sessionIds, ...objectifData } = formData
  
  try {
    // Nettoyage des données
    const cleanData = {
      label: objectifData.label,
      description: objectifData.description,
      weeksCount: parseInt(objectifData.weeksCount) || 4,
      total_sessions: parseInt(objectifData.total_sessions) || 20,
      athlete_id: objectifData.athlete_id
    }

    const { data: objectives, error: objError } = await supabase
      .from('objectifs')
      .insert([cleanData])
      .select()
    
    if (objError) throw objError
    const objective = objectives[0]

    // Si on a des IDs de séances à lier
    if (sessionIds && Array.isArray(sessionIds) && sessionIds.length > 0) {
      await supabase
        .from('sessions')
        .update({ objectif_id: objective.id })
        .in('id', sessionIds)
    }
    
    revalidatePath('/objectifs')
    return { success: true, data: objective }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Met à jour un objectif
 */
export async function updateObjectif(id, formData) {
  const supabase = await createClient()
  const { sessionIds, ...objectifData } = formData
  
  try {
    const { data: objectives, error: objError } = await supabase
      .from('objectifs')
      .update(objectifData)
      .eq('id', id)
      .select()
    
    if (objError) throw objError
    const objective = objectives[0]

    // Mise à jour des liens (on nettoie d'abord les anciens liens)
    await supabase
      .from('sessions')
      .update({ objectif_id: null })
      .eq('objectif_id', id)

    if (sessionIds && Array.isArray(sessionIds) && sessionIds.length > 0) {
      await supabase
        .from('sessions')
        .update({ objectif_id: id })
        .in('id', sessionIds)
    }
    
    revalidatePath('/objectifs')
    return { success: true, data: objective }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Supprime un objectif
 */
export async function deleteObjectif(id) {
  const supabase = await createClient()
  
  try {
    // On délie les séances avant de supprimer l'objectif
    await supabase
      .from('sessions')
      .update({ objectif_id: null })
      .eq('objectif_id', id)

    const { error } = await supabase
      .from('objectifs')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    revalidatePath('/objectifs')
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
