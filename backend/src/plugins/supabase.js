import { createClient } from '@supabase/supabase-js'
import fp from 'fastify-plugin'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key is missing. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

async function supabasePlugin(fastify, opts) {
  // On décore l'instance fastify avec le client supabase
  fastify.decorate('supabase', supabase)
}

// fp permet de rendre le décorateur accessible en dehors du plugin
export default fp(supabasePlugin)
