export type UserRole = 'clinic' | 'patient'

export interface AppUser {
  id: string
  email: string
  displayName: string
  /** Null if the profile row hasn't loaded or doesn't exist yet. */
  role: UserRole | null
}

/**
 * What the rest of the app may know about auth. Keep this provider-agnostic
 * so Supabase can be swapped for (or combined with) Duke SSO later.
 */
export interface AuthContextValue {
  user: AppUser | null
  isLoading: boolean
  /** True when VITE_AUTH_BYPASS is on (dev only). */
  isBypass: boolean
  signOut(): Promise<void>
}
