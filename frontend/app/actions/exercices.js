'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getExercices() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exercices_library')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) throw new Error(error.message)
  return data
}

export async function getExerciceById(id) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exercices_library')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw new Error(error.message)
  return data
}

export async function createExercice(formData) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exercices_library')
    .insert([formData])
    .select()
  
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/exercices')
  return { success: true, data: data[0] }
}

export async function updateExercice(id, formData) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exercices_library')
    .update(formData)
    .eq('id', id)
    .select()
  
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/exercices')
  revalidatePath(`/exercices/${id}`)
  return { success: true, data: data[0] }
}

export async function deleteExercice(id) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('exercices_library')
    .delete()
    .eq('id', id)
  
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/exercices')
  return { success: true }
}
