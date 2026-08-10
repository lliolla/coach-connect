import { createClient } from './server'

export async function callSupabaseRpc(functionName, params = {}) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc(functionName, params)

  if (error) {
    console.error(`Erreur RPC ${functionName}:`, error)
    throw new Error(error.message)
  }

  return data
}
