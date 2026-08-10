// frontend/app/actions/sessions.js
'use server'

import { createClient } from '@/lib/supabase/server'
import { toNumeric, mapExercises } from '@/lib/actions-utils'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import { WorkoutProgramEmail } from '@/components/emails/WorkoutProgramEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

const SESSION_SELECT = `
  *,
  session_exercises (
    *,
    exercise:exercices_library(*)
  ),
  athletes (id, first_name, last_name, email, avatar_url),
  objectif:objectifs!objectif_id(id, label, total_sessions, sessions(id, date, session_number))
`

export async function getSessions() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select(SESSION_SELECT)
    .order('session_number', { ascending: true }) // Tri par numéro de séance
    .neq('objectif_id', null)

  if (error) {
    console.error("Erreur getSessions:", error.message)
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('sessions')
      .select(`
        *,
        session_exercises (
          *,
          exercise:exercices_library(*)
        ),
        athletes (id, first_name, last_name, email, avatar_url)
      `)
      .order('date', { ascending: false })

    if (fallbackError) throw new Error(fallbackError.message)
    return fallbackData
  }
  return data
}

export async function getSessionById(id) {
  const supabase = await createClient()
  console.log(`[getSessionById] Recherche de la séance avec ID: ${id}`)

  try {
    const { data, error } = await supabase
      .from('sessions')
      .select(SESSION_SELECT)
      .eq('id', id)
      .single()

    if (error) {
      console.error("[getSessionById] Erreur avec SESSION_SELECT:", error.message)
      const { data: simpleData, error: simpleError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .single()

      if (simpleError) {
        console.error("[getSessionById] Erreur avec requête simple:", simpleError.message)
        throw new Error(simpleError.message)
      }

      console.log("[getSessionById] Séance trouvée avec requête simple:", simpleData)
      return simpleData
    }

    console.log("[getSessionById] Séance trouvée:", data)
    return data
  } catch (err) {
    console.error("[getSessionById] Erreur fatale:", err.message)
    throw new Error("Séance non trouvée")
  }
}

export async function createSession(formData) {
  const supabase = await createClient()

  const dataRaw = formData instanceof FormData ? Object.fromEntries(formData) : formData
  const { exercises, ...rawData } = dataRaw

  try {
    const { data: { user } } = await supabase.auth.getUser()

    // Calcul du prochain session_number
    let nextSessionNumber = 1
    if (rawData.objectif_id) {
      const { count } = await supabase
        .from('sessions')
        .select('session_number', { count: 'exact' })
        .eq('objectif_id', rawData.objectif_id)

      nextSessionNumber = (count || 0) + 1
    }

    const sessionData = {
      title: rawData.title,
      description: rawData.description || "",
      date: rawData.date || new Date().toISOString().split('T')[0],
      status: rawData.status || 'en attente',
      athlete_id: rawData.athlete_id || user?.id,
      objectif_id: rawData.objectif_id || null,
      session_number: rawData.objectif_id ? nextSessionNumber : null,
      is_template: rawData.is_template === true || rawData.is_template === 'true',
      duration: toNumeric(rawData.duration, 0),
      mainRounds: Math.round(toNumeric(rawData.main_rounds, 1))
    }

    const { data: sessions, error: sessionError } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select()

    if (sessionError) throw sessionError

    const session = sessions[0]

    if (exercises && Array.isArray(exercises) && exercises.length > 0) {
      const formattedExercises = mapExercises(exercises, session.id)
      const { error: exError } = await supabase
        .from('session_exercises')
        .insert(formattedExercises)

      if (exError) return { success: true, warning: "Séance créée sans exercices", session }
    }

    revalidatePath('/mes-seances')
    revalidatePath('/seances')
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
      objectif_id: rawData.objectif_id || null,
      session_number: rawData.session_number, // Conservation du numéro
      is_template: rawData.is_template === true || rawData.is_template === 'true',
      duration: toNumeric(rawData.duration, 0),
      mainRounds: Math.round(toNumeric(rawData.main_rounds, 1))
    }

    const { data: sessions, error: sessionError } = await supabase
      .from('sessions')
      .update(sessionData)
      .eq('id', id)
      .select()

    if (sessionError) {
      console.error("Erreur updateSession (session):", sessionError.message)
      throw sessionError
    }

    if (!sessions || sessions.length === 0) {
      throw new Error("Aucune séance retournée après mise à jour")
    }

    if (exercises && Array.isArray(exercises)) {
      const { error: deleteError } = await supabase.from('session_exercises').delete().eq('session_id', id)
      if (deleteError) {
        console.error("Erreur updateSession (delete exercises):", deleteError.message)
        throw deleteError
      }

      if (exercises.length > 0) {
        const { error: exError } = await supabase
          .from('session_exercises')
          .insert(mapExercises(exercises, id))
        if (exError) {
          console.error("Erreur updateSession (insert exercises):", exError.message)
          throw exError
        }
      }
    }

    revalidatePath('/mes-seances')
    revalidatePath('/seances')
    revalidatePath(`/mes-seances/${id}`)
    revalidatePath(`/seances/${id}`)

    return { success: true, data: sessions[0] }
  } catch (err) {
    console.error("Erreur updateSession:", err)
    return { success: false, error: err.message }
  }
}

export async function deleteSession(id) {
  const supabase = await createClient()
  try {
    // Récupérer la séance avant suppression
    const { data: sessionToDelete } = await supabase
      .from('sessions')
      .select('objectif_id, session_number')
      .eq('id', id)
      .single()

    // Supprimer la séance
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (error) throw error

    // Renuméroter les séances suivantes si nécessaire
    if (sessionToDelete.objectif_id && sessionToDelete.session_number) {
      const { data: sessionsToUpdate } = await supabase
        .from('sessions')
        .select('id, session_number')
        .eq('objectif_id', sessionToDelete.objectif_id)
        .gt('session_number', sessionToDelete.session_number)
        .order('session_number', { ascending: true })

      for (const session of sessionsToUpdate) {
        await supabase
          .from('sessions')
          .update({ session_number: session.session_number - 1 })
          .eq('id', session.id)
      }
    }

    revalidatePath('/mes-seances')
    revalidatePath('/seances')
    revalidatePath('/modeles')
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export async function moveSession(id, newPosition) {
  const supabase = await createClient()

  try {
    // 1. Récupérer la séance et son objectif
    const { data: session } = await supabase
      .from('sessions')
      .select('id, objectif_id, session_number')
      .eq('id', id)
      .single()

    if (!session.objectif_id || !session.session_number) {
      return { success: false, error: "Séance sans numéro ou sans objectif" }
    }

    // 2. Récupérer toutes les séances de l'objectif
    const { data: allSessions } = await supabase
      .from('sessions')
      .select('id, session_number')
      .eq('objectif_id', session.objectif_id)
      .order('session_number', { ascending: true })

    // 3. Calculer le nouveau numéro (borné entre 1 et nombre total)
    const newNumber = Math.min(Math.max(1, newPosition), allSessions.length)

    // 4. Si déplacement vers le bas, décrémenter les séances intermédiaires
    if (newNumber > session.session_number) {
      const sessionsToDecrement = allSessions.filter(s =>
        s.session_number > session.session_number &&
        s.session_number <= newNumber
      )

      for (const s of sessionsToDecrement) {
        await supabase
          .from('sessions')
          .update({ session_number: s.session_number - 1 })
          .eq('id', s.id)
      }
    }
    // 5. Si déplacement vers le haut, incrémenter les séances intermédiaires
    else if (newNumber < session.session_number) {
      const sessionsToIncrement = allSessions.filter(s =>
        s.session_number < session.session_number &&
        s.session_number >= newNumber
      )

      for (const s of sessionsToIncrement) {
        await supabase
          .from('sessions')
          .update({ session_number: s.session_number + 1 })
          .eq('id', s.id)
      }
    }

    // 6. Mettre à jour la séance déplacée
    await supabase
      .from('sessions')
      .update({ session_number: newNumber })
      .eq('id', id)

    revalidatePath('/seances')
    revalidatePath('/mes-seances')
    return { success: true }
  } catch (err) {
    console.error("Erreur moveSession:", err)
    return { success: false, error: err.message }
  }
}

export async function duplicateSession(originalId) {
  const supabase = await createClient()

  try {
    // 1. Récupérer la séance originale avec ses exercices
    const { data: originalSession } = await supabase
      .from('sessions')
      .select(`
        *,
        session_exercises (*)
      `)
      .eq('id', originalId)
      .single()

    if (!originalSession) {
      throw new Error("Séance originale non trouvée")
    }

    // 2. Trouver le prochain numéro de séance
    let nextNumber = 1
    if (originalSession.objectif_id) {
      const { count } = await supabase
        .from('sessions')
        .select('session_number', { count: 'exact' })
        .eq('objectif_id', originalSession.objectif_id)

      nextNumber = (count || 0) + 1
    }

    // 3. Créer la nouvelle séance
    const { data: newSession } = await supabase
      .from('sessions')
      .insert({
        title: `${originalSession.title} (copie)`,
        description: originalSession.description,
        date: new Date().toISOString().split('T')[0],
        status: 'en attente',
        athlete_id: originalSession.athlete_id,
        objectif_id: originalSession.objectif_id,
        session_number: originalSession.objectif_id ? nextNumber : null,
        duration: originalSession.duration,
        mainRounds: originalSession.main_rounds,
        is_template: originalSession.is_template
      })
      .select()
      .single()

    // 4. Dupliquer les exercices
    if (originalSession.session_exercises && originalSession.session_exercises.length > 0) {
      const exercisesToInsert = originalSession.session_exercises.map(ex => ({
        session_id: newSession.id,
        exercise_id: ex.exercise_id,
        order_index: ex.order_index,
        section: ex.section,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        rest_time: ex.rest_time,
        rounds: ex.rounds,
        notes: ex.notes,
        intensity: ex.intensity
      }))

      await supabase
        .from('session_exercises')
        .insert(exercisesToInsert)
    }

    revalidatePath('/seances')
    revalidatePath('/mes-seances')
    return { success: true, data: newSession }
  } catch (err) {
    console.error("Erreur duplicateSession:", err)
    return { success: false, error: err.message }
  }
}

export async function updateSessionRealisation(id, realisation) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('sessions')
      .update({ realisation: realisation })
      .eq('id', id)

    if (error) {
      throw new Error(`Erreur: ${error.message}. Veuillez vérifier que la colonne 'realisation' existe dans la table 'sessions'.`)
    }

    revalidatePath('/suivis')
    revalidatePath('/seances')
    revalidatePath('/mes-seances')

    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
