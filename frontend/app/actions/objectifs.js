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
 * Récupère un objectif par son ID avec ses séances et l'athlète lié
 */
export async function getObjectifById(id) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('objectifs')
    .select(`
      *,
      sessions (*),
      athletes_objectifs (athlete_id)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    const { data: simpleData, error: simpleError } = await supabase
      .from('objectifs')
      .select('*, athletes_objectifs (athlete_id)')
      .eq('id', id)
      .single()
    if (simpleError) throw new Error(simpleError.message)
    return simpleData
  }
  
  // Ajouter athlete_id pour compatibilité avec le formulaire
  if (data.athletes_objectifs && data.athletes_objectifs.length > 0) {
    return {
      ...data,
      athlete_id: data.athletes_objectifs[0].athlete_id
    }
  }
  
  return data
}

/**
 * Crée un nouvel objectif
 */
export async function createObjectif(formData) {
  const supabase = await createClient()
  const { sessionIds, athlete_id, ...objectifData } = formData
  
  try {
    // Nettoyage des données pour l'objectif
    const cleanData = {
      label: objectifData.label,
      description: objectifData.description,
      total_sessions: parseInt(objectifData.total_sessions) || 20
    }

    const { data: objectives, error: objError } = await supabase
      .from('objectifs')
      .insert([cleanData])
      .select()
    
    if (objError) throw objError
    const objective = objectives[0]

    // Lier l'objectif à l'athlète via la table de liaison
    if (athlete_id) {
      const { error: linkError } = await supabase
        .from('athletes_objectifs')
        .insert([{
          athlete_id: athlete_id,
          objectif_id: objective.id
        }])
      if (linkError) throw linkError
    }

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
  const { sessionIds, athlete_id, ...objectifData } = formData
  
  try {
    // Nettoyage des données
    const cleanData = {
      ...objectifData,
      total_sessions: parseInt(objectifData.total_sessions) || 20
    }
    // Supprimer les champs qui ne sont pas dans la table objectifs
    delete cleanData.weeksCount
    delete cleanData.athlete_id

    const { data: objectives, error: objError } = await supabase
      .from('objectifs')
      .update(cleanData)
      .eq('id', id)
      .select()
    
    if (objError) throw objError
    const objective = objectives[0]

    // Mettre à jour la liaison avec l'athlète si athlete_id est fourni
    if (athlete_id) {
      // Supprimer l'ancienne liaison si elle existe
      await supabase
        .from('athletes_objectifs')
        .delete()
        .eq('objectif_id', id)
      
      // Créer la nouvelle liaison
      const { error: linkError } = await supabase
        .from('athletes_objectifs')
        .insert([{
          athlete_id: athlete_id,
          objectif_id: id
        }])
      if (linkError) throw linkError
    }

    // Mise à jour des liens avec les séances
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
