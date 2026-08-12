// frontend/app/actions/objectifs.js
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
      .select('id, label, description, total_sessions, duree, completed, athletes_objectifs(athlete_id)' )
      .order('label', { ascending: true })

    if (error) {
      console.error("Erreur Supabase lors de la récupération des objectifs:", error)
      return []
    }

    // Garantir le format {id, label} même si d'autres champs sont manquants
    return data.map(obj => ({
      id: obj.id,
      label: obj.label || 'Sans nom', // Garantit que label existe toujours
      description: obj.description || '',
      total_sessions: obj.total_sessions || 20,

      duree: obj.duree || 4,
      completed: obj.completed || false,
      athlete_id: obj.athletes_objectifs?.[0]?.athlete_id || null
    }))
  } catch (error) {
    console.error("Erreur inattendue lors de la récupération des objectifs:", error)
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

    if (error) {
      console.error("Erreur Supabase lors de la récupération de l'objectif:", error)
      return null
    }

    return {
      ...objectif,
      sessions_count: objectif.sessions?.length || 0,
      athlete_id: objectif.athletes_objectifs?.[0]?.athlete_id || null
    }
  } catch (err) {
    console.error("Erreur inattendue lors de la récupération de l'objectif:", err)
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
      duree: parseInt(formData.duree) || 4,
      completed: formData.completed || false
    }

    const { data: objectives, error: objError } = await supabase
      .from('objectifs')
      .insert([cleanData])
      .select()

    if (objError) {
      console.error("Erreur Supabase lors de la création de l'objectif:", objError)
      throw new Error(objError.message)
    }

    const objective = objectives[0]

    if (formData.athlete_id) {
      const { error: linkError } = await supabase
        .from('athletes_objectifs')
        .insert([{
          athlete_id: formData.athlete_id,
          objectif_id: objective.id
        }])

      if (linkError) {
        console.error("Erreur Supabase lors de la liaison athlète-objectif:", linkError)
        throw new Error(linkError.message)
      }
    }

    if (formData.sessionIds && Array.isArray(formData.sessionIds) && formData.sessionIds.length > 0) {
      const { error: sessionError } = await supabase
        .from('sessions')
        .update({ objectif_id: objective.id })
        .in('id', formData.sessionIds)

      if (sessionError) {
        console.error("Erreur Supabase lors de la mise à jour des séances:", sessionError)
        throw new Error(sessionError.message)
      }
    }

    revalidatePath('/admin/objectifs')
    revalidatePath('/admin/seances')
    revalidatePath('/admin/modeles')
    revalidatePath('/athlete/mes-seances')
    revalidatePath('/')

    return { success: true, data: objective }
  } catch (err) {
    console.error("Erreur inattendue lors de la création de l'objectif:", err)
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

    if (objError) {
      console.error("Erreur Supabase lors de la mise à jour de l'objectif:", objError)
      throw new Error(objError.message)
    }

    const objective = objectives[0]

    if (formData.athlete_id) {
      const { error: deleteError } = await supabase
        .from('athletes_objectifs')
        .delete()
        .eq('objectif_id', formData.id)

      if (deleteError) {
        console.error("Erreur Supabase lors de la suppression de la liaison athlète-objectif:", deleteError)
        throw new Error(deleteError.message)
      }

      const { error: linkError } = await supabase
        .from('athletes_objectifs')
        .insert([{
          athlete_id: formData.athlete_id,
          objectif_id: formData.id
        }])

      if (linkError) {
        console.error("Erreur Supabase lors de la création de la liaison athlète-objectif:", linkError)
        throw new Error(linkError.message)
      }
    }

    if (formData.sessionIds && Array.isArray(formData.sessionIds)) {
      const { error: nullError } = await supabase
        .from('sessions')
        .update({ objectif_id: null })
        .eq('objectif_id', formData.id)

      if (nullError) {
        console.error("Erreur Supabase lors de la suppression des liens séances-objectif:", nullError)
        throw new Error(nullError.message)
      }

      if (formData.sessionIds.length > 0) {
        const { error: sessionError } = await supabase
          .from('sessions')
          .update({ objectif_id: formData.id })
          .in('id', formData.sessionIds)

        if (sessionError) {
          console.error("Erreur Supabase lors de la mise à jour des séances:", sessionError)
          throw new Error(sessionError.message)
        }
      }
    }

    revalidatePath('/admin/objectifs')
    revalidatePath('/admin/seances')
    revalidatePath('/admin/modeles')
    revalidatePath('/athlete/mes-seances')
    revalidatePath('/')

    return { success: true, data: objective }
  } catch (err) {
    console.error("Erreur inattendue lors de la mise à jour de l'objectif:", err)
    return { success: false, error: err.message }
  }
}

export async function deleteObjectif(id) {
  const supabase = await createClient()

  try {
    const { error: sessionError } = await supabase
      .from('sessions')
      .update({ objectif_id: null })
      .eq('objectif_id', id)

    if (sessionError) {
      console.error("Erreur Supabase lors de la suppression des liens séances-objectif:", sessionError)
      throw new Error(sessionError.message)
    }

    const { error } = await supabase
      .from('objectifs')
      .delete()
      .eq('id', id)

    if (error) {
      console.error("Erreur Supabase lors de la suppression de l'objectif:", error)
      throw new Error(error.message)
    }

    revalidatePath('/admin/objectifs')
    revalidatePath('/admin/seances')
    revalidatePath('/admin/modeles')
    revalidatePath('/athlete/mes-seances')
    revalidatePath('/')

    return { success: true }
  } catch (err) {
    console.error("Erreur inattendue lors de la suppression de l'objectif:", err)
    return { success: false, error: err.message }
  }
}
