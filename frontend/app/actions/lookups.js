'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getLookupTable(table) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('id', { ascending: true })
  
  if (error) throw new Error(error.message)
  return data
}

export async function createLookupItem(table, itemData) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from(table)
    .insert([itemData])
    .select()
  
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/parametrage')
  return { success: true, data: data[0] }
}

export async function updateLookupItem(table, id, itemData) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from(table)
    .update(itemData)
    .eq('id', id)
    .select()
  
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/parametrage')
  return { success: true, data: data[0] }
}

export async function deleteLookupItem(table, id) {
  const supabase = await createClient()
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
  
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/parametrage')
  return { success: true }
}
