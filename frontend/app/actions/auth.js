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

  // Si l'athlète n'existe pas encore dans la table (cas rare pour un login), on considère success: true mais isAdmin: false
  return { success: true, isAdmin: athlete?.admin || false }
}

export async function signup(email, password, fullName) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: athlete } = await supabase
    .from('athletes')
    .select('*')
    .eq('email', user.email)
    .single()

  return {
    ...user,
    athlete_profile: athlete
  }
}

export async function resetPasswordForEmail(email) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function updatePassword(newPassword) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
