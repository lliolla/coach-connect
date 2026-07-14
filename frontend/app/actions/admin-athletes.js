'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Récupère un athlète avec tous ses objectifs et leurs séances associées
 * Pour la vue admin : récapitulatif des objectifs avec progression
 */
export async function getAthleteWithObjectifsAndSessions(athleteId) {
  const supabase = await createClient()
  
  try {
    // 1. Récupérer les infos de l'athlète
    const { data: athlete, error: athleteError } = await supabase
      .from('athletes')
      .select(`
        *,
        abonnements (id, label),
        modes_paiement (id, label),
        athletes_groupes (groupes (id, name))
      `)
      .eq('id', athleteId)
      .single()
    
    if (athleteError) throw new Error(athleteError.message)
    if (!athlete) throw new Error('Athlète non trouvé')
    
    // Formater les groupes
    const groupes = athlete.athletes_groupes?.map(ag => ag.groupes.name) || []
    
    // 2. Récupérer tous les objectifs de l'athlète via la table de liaison
    const { data: athleteObjectifs, error: objError } = await supabase
      .from('athletes_objectifs')
      .select(`
        objectif_id,
        objectifs (*)
      `)
      .eq('athlete_id', athleteId)
    
    if (objError) throw new Error(objError.message)
    
    // 3. Récupérer toutes les séances de l'athlète
    const { data: sessions, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        *,
        session_exercises (*)
      `)
      .eq('athlete_id', athleteId)
      .order('date', { ascending: true })
    
    if (sessionError) throw new Error(sessionError.message)
    
    // 4. Structurer les données par objectif
    const objectifsWithSessions = []
    
    for (const ao of athleteObjectifs) {
      const objectif = ao.objectifs
      // Filtrer les séances qui appartiennent à cet objectif
      const objectifSessions = sessions.filter(s => s.objectif_id === objectif.id)
      
      // Calculer la progression : rang chronologique / total_sessions
      // Tri par date pour avoir l'ordre chronologique
      const sortedSessions = [...objectifSessions].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      )
      
      const currentSessionCount = sortedSessions.length
      const totalSessions = objectif.total_sessions || 20
      
      // Calculer le rang de chaque séance dans cet objectif
      const sessionsWithRank = sortedSessions.map((session, index) => ({
        ...session,
        rank: index + 1, // 1-based
        progression: `${index + 1} / ${totalSessions}`
      }))
      
      objectifsWithSessions.push({
        ...objectif,
        sessions: sessionsWithRank,
        progression: {
          current: currentSessionCount,
          total: totalSessions,
          percentage: Math.round((currentSessionCount / totalSessions) * 100),
          display: `Séance ${currentSessionCount} / ${totalSessions}`
        },
        hasSessions: currentSessionCount > 0
      })
    }
    
    // 5. Formater l'athlète
    const formattedAthlete = {
      ...athlete,
      abonnement: athlete.abonnements?.label || athlete.abonnement,
      mode_paiement: athlete.modes_paiement?.label,
      groupes: groupes,
      full_name: `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim()
    }
    
    return {
      success: true,
      data: {
        athlete: formattedAthlete,
        objectifs: objectifsWithSessions,
        totalSessions: sessions.length,
        totalObjectifs: athleteObjectifs.length
      }
    }
    
  } catch (err) {
    console.error('Error getAthleteWithObjectifsAndSessions:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Récupère les statistiques globales d'un athlète pour le tableau de bord admin
 */
export async function getAthleteStats(athleteId) {
  const supabase = await createClient()
  
  try {
    // Récupérer les séances de l'athlète
    const { data: sessions, error: sessionError } = await supabase
      .from('sessions')
      .select('status')
      .eq('athlete_id', athleteId)
    
    if (sessionError) throw new Error(sessionError.message)
    
    const stats = {
      total: sessions.length,
      en_attente: sessions.filter(s => s.status === 'en attente').length,
      transmis: sessions.filter(s => s.status === 'transmis').length,
      prevu: sessions.filter(s => s.status === 'prévu').length
    }
    
    return { success: true, data: stats }
    
  } catch (err) {
    console.error('Error getAthleteStats:', err)
    return { success: false, error: err.message }
  }
}
