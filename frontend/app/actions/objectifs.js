'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Récupère tous les objectifs avec leurs séances liées
 * et formate les données pour correspondre à la structure attendue par CardSeance
 */
export async function getObjectifs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('objectifs')
    .select(`
      id,
      label,
      description,
      total_sessions,
      weeksCount,
      duree,
      completed,
      sessions (*)
    `)
    .order('label', { ascending: true })

  if (error) {
    // Si la jointure échoue, on récupère juste les objectifs avec les champs nécessaires
    const { data: simpleData, error: simpleError } = await supabase
      .from('objectifs')
      .select('id, label, description, total_sessions, weeksCount, duree, completed')
      .order('label', { ascending: true })

    if (simpleError) throw new Error(simpleError.message)
    return simpleData.map(obj => ({
      id: obj.id,
      label: obj.label,
      description: obj.description,
      total_sessions: obj.total_sessions,
      weeksCount: obj.weeksCount,
      duree: obj.duree,
      completed: obj.completed
    }))
  }

  // Formatage des données pour correspondre à la structure attendue
  return data.map(obj => ({
    id: obj.id,
    label: obj.label,
    description: obj.description,
    total_sessions: obj.total_sessions,
    weeksCount: obj.weeksCount,
    duree: obj.duree,
    completed: obj.completed,
    sessions: obj.sessions || []
  }))
}

/**
 * Récupère un objectif par son ID avec ses séances et l'athlète lié
 */
export async function getObjectifById(id) {
  const supabase = await createClient()

  try {
    // Récupération de l'objectif avec toutes les informations nécessaires
    const { data: objectif, error } = await supabase
      .from('objectifs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    // Récupération du nombre de séances associées à l'objectif
    const { count: sessionsCount, error: countError } = await supabase
      .from('sessions')
      .select('id', { count: 'exact' })
      .eq('objectif_id', id)

    if (countError) throw countError

    // Récupération de l'athlète associé via la table de jointure
    const { data: athleteLink, error: linkError } = await supabase
      .from('athletes_objectifs')
      .select('athlete_id')
      .eq('objectif_id', id)
      .single()

    // Ajout du nombre de séances et de l'athlète à l'objectif
    const objectifWithSessions = {
      ...objectif,
      sessions_count: sessionsCount || 0,
      athlete_id: athleteLink?.athlete_id || null
    }

    return objectifWithSessions
  } catch (err) {
    console.error("Erreur lors de la récupération de l'objectif:", err)
    return null
  }
}

/**
 * Crée un nouvel objectif
 */
export async function createObjectif(formData) {
  const supabase = await createClient()

  try {
    // Nettoyage des données pour l'objectif
    const cleanData = {
      label: formData.label,
      description: formData.description,
      total_sessions: parseInt(formData.total_sessions) || 20,
      weeksCount: parseInt(formData.weeksCount) || 4,
      duree: parseInt(formData.duree) || 4,
      completed: formData.completed || false
    }

    const { data: objectives, error: objError } = await supabase
      .from('objectifs')
      .insert([cleanData])
      .select()

    if (objError) throw objError

    const objective = objectives[0]

    // Lier l'objectif à l'athlète via la table de liaison
    if (formData.athlete_id) {
      const { error: linkError } = await supabase
        .from('athletes_objectifs')
        .insert([{
          athlete_id: formData.athlete_id,
          objectif_id: objective.id
        }])

      if (linkError) throw linkError
    }

    // Si on a des IDs de séances à lier
    if (formData.sessionIds && Array.isArray(formData.sessionIds) && formData.sessionIds.length > 0) {
      await supabase
        .from('sessions')
        .update({ objectif_id: objective.id })
        .in('id', formData.sessionIds)
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
export async function updateObjectif(formData) {
  const supabase = await createClient()

  try {
    // Vérification des données requises
    if (!formData.id) {
      throw new Error("ID de l'objectif manquant")
    }

    // Nettoyage des données
    const cleanData = {
      label: formData.label,
      description: formData.description,
      total_sessions: parseInt(formData.total_sessions) || 20,
      duree: parseInt(formData.duree) || 4,
      completed: formData.completed || false
    }

    const { data: objectives, error: objError } = await supabase
      .from('objectifs')
      .update(cleanData)
      .eq('id', formData.id)
      .select()

    if (objError) throw objError

    const objective = objectives[0]

    // Mettre à jour la liaison avec l'athlète si athlete_id est fourni
    if (formData.athlete_id) {
      // Supprimer l'ancienne liaison si elle existe
      await supabase
        .from('athletes_objectifs')
        .delete()
        .eq('objectif_id', formData.id)

      // Créer la nouvelle liaison
      const { error: linkError } = await supabase
        .from('athletes_objectifs')
        .insert([{
          athlete_id: formData.athlete_id,
          objectif_id: formData.id
        }])

      if (linkError) throw linkError
    }

    // Mise à jour des liens avec les séances UNIQUEMENT si sessionIds est explicitement fourni
    if (formData.sessionIds && Array.isArray(formData.sessionIds)) {
      // 1. Délier toutes les séances de l'objectif
      await supabase
        .from('sessions')
        .update({ objectif_id: null })
        .eq('objectif_id', formData.id)

      // 2. Rattacher les séances spécifiées
      if (formData.sessionIds.length > 0) {
        await supabase
          .from('sessions')
          .update({ objectif_id: formData.id })
          .in('id', formData.sessionIds)
      }
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
