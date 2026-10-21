import { createClient } from '@supabase/supabase-js'
import { env } from '@/config/env'

/**
 * The shared Supabase client, or null if VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
 * aren't set. Callers must handle null so the app keeps working without Supabase.
 *
 * The anon key is safe to ship to the browser: it only grants what the
 * row-level security policies in supabase/migrations allow.
 */
export const supabase = env.supabase ? createClient(env.supabase.url, env.supabase.anonKey) : null
