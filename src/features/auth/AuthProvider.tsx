import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import { useEffect, useState, type ReactNode } from 'react'
import { env } from '@/config/env'
import { supabase } from '@/lib/supabase'
import { AuthContext } from './AuthContext'
import { BYPASS_AUTH } from './authBypass'
import { fetchProfile } from './profile'
import type { AppUser, AuthContextValue } from './types'

/**
 * Supplies the signed-in user to the app via useAuth().
 *
 * - VITE_AUTH_BYPASS=true (dev only): a fake clinic user, no Supabase needed.
 * - Otherwise: Supabase session + the user's row in `profiles` for their role.
 *
 * To add Duke SSO later, write another provider that produces the same
 * AuthContextValue and choose it here.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  if (env.authBypass) return <AuthContext value={BYPASS_AUTH}>{children}</AuthContext>
  return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
}

const NOT_CONFIGURED_MESSAGE =
  'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.'

function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null>(null)
  const [sessionLoaded, setSessionLoaded] = useState(supabase === null)

  // onAuthStateChange fires once immediately with the stored session
  // (INITIAL_SESSION), then again on every sign-in, sign-out and token refresh.
  useEffect(() => {
    if (!supabase) return
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setSessionLoaded(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const authUser = session?.user ?? null
  const profileQuery = useQuery({
    queryKey: ['profile', authUser?.id],
    queryFn: () => fetchProfile(supabase!, authUser!.id),
    enabled: supabase !== null && authUser !== null,
    staleTime: Infinity, // roles change rarely; reloading the page picks up changes
    retry: 1,
  })

  const user: AppUser | null = authUser && {
    id: authUser.id,
    email: authUser.email ?? '',
    displayName:
      profileQuery.data?.display_name ??
      (authUser.user_metadata.full_name as string | undefined) ??
      authUser.email ??
      'Signed-in user',
    role: profileQuery.data?.role ?? null,
  }

  const value: AuthContextValue = {
    user,
    isLoading: !sessionLoaded || (authUser !== null && profileQuery.isPending),
    isBypass: false,
    isConfigured: supabase !== null,
    profileError: profileQuery.error,

    async signInWithPassword(email, password) {
      if (!supabase) throw new Error(NOT_CONFIGURED_MESSAGE)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw new Error(error.message)
    },

    async signInWithGoogle(returnTo) {
      if (!supabase) throw new Error(NOT_CONFIGURED_MESSAGE)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        // This URL must be allowed under Supabase → Authentication → URL Configuration.
        options: {
          redirectTo: `${window.location.origin}/login?next=${encodeURIComponent(returnTo)}`,
        },
      })
      if (error) throw new Error(error.message)
    },

    async signOut() {
      if (supabase) await supabase.auth.signOut()
      // Drop cached data so the next person on this computer never sees it.
      queryClient.clear()
    },
  }

  return <AuthContext value={value}>{children}</AuthContext>
}
