'use server'

import { createClient } from '@/lib/supabase/server'
import { syncManyToMany } from '@/lib/actions-utils'
import { revalidatePath } from 'next/cache'

const ATHLETE_SELECT = `
  *,
  abonnements (id, label),
  modes_paiement (id, label),
  athletes_groupes (groupes (id, name)),
  athletes_objectifs (objectifs (id, label))
`

const formatAthlete = (athlete) => ({
  ...athlete,
  abonnement: athlete.abonnements?.label || athlete.abonnement,
  mode_paiement: athlete.modes_paiement?.label,
  groupes: athlete.athletes_groupes?.map(ag => ag.groupes.name) || [],
  objectives: athlete.athletes_objectifs?.map(ao => ao.objectifs.label) || []
})

export async function getAthletes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('athletes')
    .select(ATHLETE_SELECT)
    .order('last_name', { ascending: true })

  if (error) throw new Error(error.message)
  return data.map(formatAthlete)
}

export async function getAthleteById(id) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('athletes')
    .select(ATHLETE_SELECT)
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return formatAthlete(data)
}

export async function createAthlete(formData) {
  const supabase = await createClient()
  
  // Si un ID est passé (cas du profil utilisateur), on l'utilise
  const { 
    id, objectives, groupes, groupe, abonnement, mode_paiement,
    ...athleteData 
  } = formData

  try {
    const allGroupes = Array.isArray(groupes) ? groupes : (groupe ? [groupe] : [])

    // Résolution des IDs
    if (abonnement) {
      const { data: ab } = await supabase.from('abonnements').select('id').eq('label', abonnement).maybeSingle()
      if (ab) athleteData.abonnement_id = ab.id
    }
    if (mode_paiement) {
      const { data: mp } = await supabase.from('modes_paiement').select('id').eq('label', mode_paiement).maybeSingle()
      if (mp) athleteData.mode_paiement_id = mp.id
    }

    // On ajoute l'ID si présent
    const dataToInsert = id ? { ...athleteData, id } : athleteData

    const { data, error } = await supabase
      .from('athletes')
      .insert([dataToInsert])
      .select()

    if (error) {
      if (error.code === '23505') {
        throw new Error("Un athlète avec cet email existe déjà.")
      }
      throw error
    }

    const newAthlete = data[0]
    
    // Synchronisation M2M
    if (allGroupes.length > 0) {
      await syncManyToMany(supabase, newAthlete.id, 'athletes_groupes', 'groupes', 'name', allGroupes, 'groupe_id')
    }
    if (objectives && objectives.length > 0) {
      await syncManyToMany(supabase, newAthlete.id, 'athletes_objectifs', 'objectifs', 'label', objectives, 'objectif_id')
    }

    revalidatePath('/users')
    return { success: true, data: newAthlete }
  } catch (err) {
    console.error('Error creating athlete:', err)
    return { success: false, error: err.message }
  }
}

export async function updateAthlete(id, formData) {
  const supabase = await createClient()
  
  const { 
    objectives, groupes, groupe, abonnement, mode_paiement,
    abonnements, modes_paiement, athletes_groupes, athletes_objectifs,
    ...athleteData 
  } = formData

  try {
    const allGroupes = Array.isArray(groupes) ? groupes : (groupe ? [groupe] : [])

    if (abonnement) {
      const { data: ab } = await supabase.from('abonnements').select('id').eq('label', abonnement).maybeSingle()
      if (ab) athleteData.abonnement_id = ab.id
    }
    if (mode_paiement) {
      const { data: mp } = await supabase.from('modes_paiement').select('id').eq('label', mode_paiement).maybeSingle()
      if (mp) athleteData.mode_paiement_id = mp.id
    }

    // 1. Tenter la mise à jour
    let { data, error } = await supabase
      .from('athletes')
      .update(athleteData)
      .eq('id', id)
      .select()

    // 2. Si aucune donnée retournée (ID inexistant) ou erreur, tenter l'insertion
    if (error || !data || data.length === 0) {
      const { data: insertData, error: insertError } = await supabase
        .from('athletes')
        .insert([{ ...athleteData, id }])
        .select()
      
      if (insertError) throw insertError
      data = insertData
    }

    // Synchronisation M2M
    await syncManyToMany(supabase, id, 'athletes_groupes', 'groupes', 'name', allGroupes, 'groupe_id')
    if (objectives) {
      await syncManyToMany(supabase, id, 'athletes_objectifs', 'objectifs', 'label', objectives, 'objectif_id')
    }

    revalidatePath('/users')
    revalidatePath(`/users/${id}`)
    return { success: true, data: data[0] }
  } catch (err) {
    console.error('Error updating athlete:', err)
    return { success: false, error: err.message }
  }
}

export async function deleteAthlete(id) {
  const supabase = await createClient()
  try {
    const { error } = await supabase.from('athletes').delete().eq('id', id)
    if (error) {
      if (error.code === '23505') {
        throw new Error("Un athlète avec cet email existe déjà.")
      }
      throw error
    }
    
    revalidatePath('/users')
    return { success: true }
  } catch (err) {
    console.error('Error deleting athlete:', err)
    return { success: false, error: err.message }
  }
}
