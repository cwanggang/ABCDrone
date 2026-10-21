import type { AppUser, AuthContextValue } from './types'

/** Fake clinic user for VITE_AUTH_BYPASS=true (dev only). */
export const BYPASS_USER: AppUser = {
  id: 'dev-bypass-user',
  email: 'dev@localhost',
  displayName: 'Dev User (auth bypass)',
  role: 'clinic',
}

export const BYPASS_AUTH: AuthContextValue = {
  user: BYPASS_USER,
  isLoading: false,
  isBypass: true,
  isConfigured: true,
  profileError: null,
  signInWithPassword: async () => {},
  signInWithGoogle: async () => {},
  // Nothing to sign out of; the caller just navigates to /login.
  signOut: async () => {},
}
