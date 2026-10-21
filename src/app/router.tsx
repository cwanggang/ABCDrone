import { Navigate, type RouteObject } from 'react-router'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { RequireRole } from '@/features/auth/RequireRole'
import { AppShell } from './layout/AppShell'
import { RouteErrorPage } from './RouteErrorPage'

/** Shown in the top bar; read via useMatches() in TopBar. */
export interface RouteHandle {
  title: string
}

/** The clinic pages, rendered inside the app shell. Exported for tests. */
export const clinicRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    handle: { title: 'Dashboard' } satisfies RouteHandle,
    lazy: async () => ({
      Component: (await import('@/pages/dashboard/DashboardPage')).DashboardPage,
    }),
  },
  {
    path: '/drones',
    handle: { title: 'Drones' } satisfies RouteHandle,
    lazy: async () => ({ Component: (await import('@/pages/drones/DronesPage')).DronesPage }),
  },
  {
    path: '/drones/:droneId',
    handle: { title: 'Drone details' } satisfies RouteHandle,
    lazy: async () => ({
      Component: (await import('@/pages/drone-detail/DroneDetailPage')).DroneDetailPage,
    }),
  },
]

/**
 * Route tree. Guards are layout routes that wrap their children:
 *   RequireAuth          → not signed in? go to /login
 *     RequireRole clinic → wrong role? show "no access"
 *       AppShell         → sidebar + top bar
 *
 * Pages are lazy-loaded so the login page doesn't download the map and
 * chart libraries. A future patient area would be a sibling of the clinic
 * branch with <RequireRole role="patient" />.
 */
export const routes: RouteObject[] = [
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  {
    path: '/login',
    lazy: async () => ({ Component: (await import('@/pages/login/LoginPage')).LoginPage }),
  },
  {
    element: <RequireAuth />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <RequireRole role="clinic" />,
        children: [{ element: <AppShell />, children: clinicRoutes }],
      },
    ],
  },
  {
    path: '*',
    lazy: async () => ({
      Component: (await import('@/pages/not-found/NotFoundPage')).NotFoundPage,
    }),
  },
]
