import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

/** Shape of a `public.profiles` row (see supabase/migrations). */
export const ProfileSchema = z.object({
  id: z.string(),
  display_name: z.string().nullable(),
  role: z.enum(['clinic', 'patient']),
})

export type Profile = z.infer<typeof ProfileSchema>

export async function fetchProfile(client: SupabaseClient, userId: string): Promise<Profile> {
  const { data, error } = await client
    .from('profiles')
    .select('id, display_name, role')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new Error(`Couldn't load your profile: ${error.message}`)
  if (!data) {
    throw new Error(
      'Your account has no profile row. Has the database migration been run in Supabase?',
    )
  }
  return ProfileSchema.parse(data)
}
