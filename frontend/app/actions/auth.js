'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Récupère l'utilisateur actuel et son profil athlète
 */
export async function getUser() {
  const supabase = await createClient()
  
  // 1. Récupérer l'utilisateur de l'authentification
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (!user || authError) return null

  // 2. Récupérer le profil dans la table 'athletes'
  const { data: athlete, error: dbError } = await supabase
    .from('athletes')
    .select('*')
    .eq('id', user.id)
    .maybeSingle() 

  if (dbError) {
    console.error("Erreur base de données:", dbError.message)
  }

  // 3. Retourner l'objet complet avec le flag isAdmin calculé
  const isAdmin = user.app_metadata?.role === 'admin' || 
                  user.user_metadata?.admin === true || 
                  athlete?.admin === true ||
                  athlete?.is_admin === true

  return {
    ...user,
    athlete_profile: athlete,
    isAdmin: isAdmin
  }
}

/**
 * Connexion d'un utilisateur
 */
export async function login(email, password) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Récupérer le profil complet pour connaître le rôle
  const fullUser = await getUser()
  const isAdmin = fullUser?.isAdmin || false

  revalidatePath('/', 'layout')
  return { success: true, isAdmin }
}

/**
 * Inscription d'un nouvel utilisateur
 */
export async function signup(email, password, name) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Déconnexion
 */
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
}

/**
 * Demande de réinitialisation de mot de passe
 */
export async function resetPasswordForEmail(email) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/update-password`,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Mise à jour du mot de passe (après réinitialisation)
 */
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
