import { Navigate, Outlet, useLocation } from 'react-router'
import { FullPageLoading } from '@/components/FullPageLoading'
import { useAuth } from './useAuth'

/**
 * Layout route: renders child routes only for signed-in users. Everyone else
 * is sent to /login, which sends them back here after they sign in.
 */
export function RequireAuth() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullPageLoading />
  if (!user) {
    const next = location.pathname + location.search
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />
  }
  return <Outlet />
}
