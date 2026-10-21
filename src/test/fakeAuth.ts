import type { AppUser, AuthContextValue } from '@/features/auth/types'

/** Build an AuthContextValue for tests; override only what the test cares about. */
export function fakeAuth(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    user: null,
    isLoading: false,
    isBypass: false,
    isConfigured: true,
    profileError: null,
    signInWithPassword: async () => {},
    signInWithGoogle: async () => {},
    signOut: async () => {},
    ...overrides,
  }
}

export function fakeUser(role: AppUser['role']): AppUser {
  return { id: 'u1', email: 'staff@duke.edu', displayName: 'Test Staff', role }
}
