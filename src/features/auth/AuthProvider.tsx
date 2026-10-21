import { useMemo, type ReactNode } from 'react'
import { env } from '@/config/env'
import { AuthContext } from './AuthContext'
import { BYPASS_USER } from './authBypass'
import type { AuthContextValue } from './types'

/**
 * Phase 1: only the dev bypass is wired up. Phase 2 adds Supabase
 * (email/password + Google) behind this same interface.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AuthContextValue>(
    () => ({
      user: env.authBypass ? BYPASS_USER : null,
      isLoading: false,
      isBypass: env.authBypass,
      // Nothing to sign out of in bypass mode; the caller just navigates to /login.
      signOut: async () => {},
    }),
    [],
  )
  return <AuthContext value={value}>{children}</AuthContext>
}
