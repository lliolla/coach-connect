'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Récupère tous les objectifs et garantit le format {id, label}
 */
export async function getObjectifs() {
  const supabase = await createClient()

  try {
    // Récupérer les objectifs avec les champs minimaux requis
    const { data, error } = await supabase
      .from('objectifs')
      .select('id, label, description, total_sessions, weeksCount, duree, completed')
      .order('label', { ascending: true })

    if (error) throw error

    // Garantir le format {id, label} même si d'autres champs sont manquants
    return data.map(obj => ({
      id: obj.id,
      label: obj.label || 'Sans nom', // Garantit que label existe toujours
      description: obj.description || '',
      total_sessions: obj.total_sessions || 20,
      weeksCount: obj.weeksCount || 4,
      duree: obj.duree || 4,
      completed: obj.completed || false
    }))
  } catch (error) {
    console.error("Erreur lors de la récupération des objectifs:", error)
    // Retourner un tableau vide plutôt que de throw pour éviter de bloquer l'UI
    return []
  }
}

/**
 * Récupère un objectif par son ID
 */
export async function getObjectifById(id) {
  const supabase = await createClient()

  try {
    const { data: objectif, error } = await supabase
      .from('objectifs')
      .select('*, athletes_objectifs(athlete_id), sessions(*)')
      .eq('id', id)
      .single()

    if (error) throw error

    return {
      ...objectif,
      sessions_count: objectif.sessions?.length || 0,
      athlete_id: objectif.athletes_objectifs?.[0]?.athlete_id || null
    }
  } catch (err) {
    console.error("Erreur lors de la récupération de l'objectif:", err)
    return null
  }
}

export async function createObjectif(formData) {
  const supabase = await createClient()

  try {
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

    if (formData.athlete_id) {
      const { error: linkError } = await supabase
        .from('athletes_objectifs')
        .insert([{
          athlete_id: formData.athlete_id,
          objectif_id: objective.id
        }])

      if (linkError) throw linkError
    }

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

export async function updateObjectif(formData) {
  const supabase = await createClient()

  try {
    if (!formData.id) {
      throw new Error("ID de l'objectif manquant")
    }

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

    if (formData.athlete_id) {
      await supabase
        .from('athletes_objectifs')
        .delete()
        .eq('objectif_id', formData.id)

      const { error: linkError } = await supabase
        .from('athletes_objectifs')
        .insert([{
          athlete_id: formData.athlete_id,
          objectif_id: formData.id
        }])

      if (linkError) throw linkError
    }

    if (formData.sessionIds && Array.isArray(formData.sessionIds)) {
      await supabase
        .from('sessions')
        .update({ objectif_id: null })
        .eq('objectif_id', formData.id)

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

export async function deleteObjectif(id) {
  const supabase = await createClient()

  try {
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
