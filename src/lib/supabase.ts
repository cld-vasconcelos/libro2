import { createClient } from '@supabase/supabase-js'

// Only create the client if we have the environment variables
export const supabase = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
  : createClient('http://placeholder-url', 'placeholder-key') // Placeholder for tests

export type SupabaseError = {
  message: string
  status?: number
}
