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
  objectif:objectifs!objectif_id(id, label, total_sessions, sessions(id, date))
`

export async function getSessions() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select(SESSION_SELECT)
    .order('date', { ascending: false })
    
  if (error) {
    console.error("Erreur getSessions:", error.message)
    // Tentative de repli sans la jointure d'objectif si la relation échoue
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
  
  // D'abord, essayons avec la requête complète
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select(SESSION_SELECT)
      .eq('id', id)
      .single()
      
    if (error) {
      console.error("[getSessionById] Erreur avec SESSION_SELECT:", error.message)
      
      // Si erreur, essayons avec une requête plus simple
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

/**
 * Marque une séance comme transmise en mettant à jour le statut et en envoyant un email
 */
export async function transmitSession(id) {
  const supabase = await createClient()
  try {
    // 1. Récupérer les infos de la séance et de l'athlète
    const session = await getSessionById(id)
    if (!session) throw new Error("Séance non trouvée")
    
    const athlete = session.athletes || session.athlete
    if (!athlete || !athlete.email) {
      console.warn("Pas d'email pour l'athlète, mise à jour du statut uniquement")
    } else {
      // 2. Envoyer l'email via Resend
      const athleteName = `${athlete.first_name} ${athlete.last_name || ''}`.trim()
      
      const { error: emailError } = await resend.emails.send({
        from: 'Prep Athlete <contact@prepathlete.pro>',
        to: [athlete.email],
        subject: 'Ton programme de la semaine est disponible !',
        react: WorkoutProgramEmail({ 
          athleteName, 
          programTitle: session.title,
          notes: session.description,
          exercises: session.session_exercises,
          mainRounds: session.main_rounds,
          duration: session.duration
        }),
      });

      if (emailError) {
        console.error("Erreur Resend:", emailError)
        // On continue quand même pour mettre à jour le statut
      }
    }

    // 3. Mettre à jour le statut en DB
    const { error } = await supabase
      .from('sessions')
      .update({ status: 'transmis' })
      .eq('id', id)
    
    if (error) throw error
    
    revalidatePath('/seances')
    revalidatePath(`/seances/${id}`)
    revalidatePath('/mes-seances')
    
    return { success: true }
  } catch (err) {
    console.error("Erreur transmitSession:", err)
    return { success: false, error: err.message }
  }
}

export async function createSession(formData) {
  const supabase = await createClient()
  
  const dataRaw = formData instanceof FormData ? Object.fromEntries(formData) : formData
  const { exercises, ...rawData } = dataRaw

  try {
    const { data: { user } } = await supabase.auth.getUser()

    const sessionData = {
      title: rawData.title,
      description: rawData.description || "",
      date: rawData.date || new Date().toISOString().split('T')[0],
      status: rawData.status || 'en attente',
      athlete_id: rawData.athlete_id || user?.id, 
      objectif_id: rawData.objectif_id || null,
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
      is_template: rawData.is_template === true || rawData.is_template === 'true',
      duration: toNumeric(rawData.duration, 0),
      main_rounds: Math.round(toNumeric(rawData.main_rounds, 1))
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
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (error) throw error
    
    revalidatePath('/mes-seances')
    revalidatePath('/seances')
    revalidatePath('/modeles')
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Met à jour la réalisation d'une séance (Complet/Partiel)
 */
export async function updateSessionRealisation(id, realisation) {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('sessions')
      .update({ realisation: realisation })
      .eq('id', id)
    
    if (error) {
      // Si la colonne n'existe pas, essayer de l'ajouter via une requête brute
      // Note: Supabase JavaScript client ne permet pas d'ALTER TABLE directement
      // Le user doit créer la colonne manuellement via l'interface Supabase
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