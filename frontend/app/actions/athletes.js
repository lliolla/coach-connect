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
  
  const { 
    objectives, groupes, groupe, abonnement, mode_paiement,
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

    const { data, error } = await supabase
      .from('athletes')
      .insert([athleteData])
      .select()

    if (error) throw error

    const newAthlete = data[0]
    
    // Synchronisation M2M
    if (allGroupes.length > 0) {
      await syncManyToMany(supabase, newAthlete.id, 'athletes_groupes', 'groupes', 'name', allGroupes, 'groupe_id')
    }
    if (objectives && objectives.length > 0) {
      await syncManyToMany(supabase, newAthlete.id, 'athletes_objectifs', 'objectifs', 'label', objectives, 'objectif_id')
    }

    revalidatePath('/athletes')
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

    const { data, error } = await supabase
      .from('athletes')
      .update(athleteData)
      .eq('id', id)
      .select()
    
    if (error) throw error

    // Synchronisation M2M
    await syncManyToMany(supabase, id, 'athletes_groupes', 'groupes', 'name', allGroupes, 'groupe_id')
    if (objectives) {
      await syncManyToMany(supabase, id, 'athletes_objectifs', 'objectifs', 'label', objectives, 'objectif_id')
    }

    revalidatePath('/athletes')
    revalidatePath(`/athletes/${id}`)
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
    if (error) throw error
    
    revalidatePath('/athletes')
    return { success: true }
  } catch (err) {
    console.error('Error deleting athlete:', err)
    return { success: false, error: err.message }
  }
}
