import type { AppUser } from './types'

/** Fake clinic user for VITE_AUTH_BYPASS=true (dev only). */
export const BYPASS_USER: AppUser = {
  id: 'dev-bypass-user',
  email: 'dev@localhost',
  displayName: 'Dev User (auth bypass)',
  role: 'clinic',
}
