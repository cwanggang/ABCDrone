export type UserRole = 'clinic' | 'patient'

export interface AppUser {
  id: string
  email: string
  displayName: string
  /** Null if the profile couldn't be loaded (see AuthContextValue.profileError). */
  role: UserRole | null
}

/**
 * What the rest of the app may know about auth. Keep this provider-agnostic
 * so Supabase can be swapped for (or combined with) Duke SSO later.
 */
export interface AuthContextValue {
  user: AppUser | null
  /** True until we know whether someone is signed in and what their role is. */
  isLoading: boolean
  /** True when VITE_AUTH_BYPASS is on (dev only). */
  isBypass: boolean
  /** False when the Supabase env variables are missing. */
  isConfigured: boolean
  /** Set if the user is signed in but their profile/role failed to load. */
  profileError: Error | null
  /** Throws an Error with a user-friendly message on failure. */
  signInWithPassword(email: string, password: string): Promise<void>
  /** Redirects to Google; the browser comes back to `returnTo` afterwards. */
  signInWithGoogle(returnTo: string): Promise<void>
  signOut(): Promise<void>
}
