'use server'

import { createClient } from "@/lib/supabase/server"

export async function login(email, password) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Vérifier le statut admin dans la table athletes
  const { data: athlete, error: athleteError } = await supabase
    .from('athletes')
    .select('admin')
    .eq('email', email)
    .single()

  if (athleteError) {
    return { success: false, error: "Erreur lors de la vérification du profil" }
  }

  return { success: true, isAdmin: athlete.admin }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
