import { Outlet } from 'react-router'
import { NoAccess } from './NoAccess'
import type { UserRole } from './types'
import { useAuth } from './useAuth'

/**
 * Layout route: renders child routes only if the user has `role`.
 * Must sit inside <RequireAuth>, which guarantees a signed-in user.
 */
export function RequireRole({ role }: { role: UserRole }) {
  const { user, profileError } = useAuth()
  if (user?.role !== role) return <NoAccess requiredRole={role} error={profileError} />
  return <Outlet />
}
