import { Navigate, type RouteObject } from 'react-router'
import { AppShell } from './layout/AppShell'
import { RouteErrorPage } from './RouteErrorPage'

/** Shown in the top bar; read via useMatches() in TopBar. */
export interface RouteHandle {
  title: string
}

/**
 * Pages are lazy-loaded so the login page doesn't download the map and
 * chart libraries. Route guards are added in Phase 2.
 */
export const routes: RouteObject[] = [
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  {
    path: '/login',
    lazy: async () => ({ Component: (await import('@/pages/login/LoginPage')).LoginPage }),
  },
  {
    element: <AppShell />,
    errorElement: <RouteErrorPage />,
    children: [
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
    ],
  },
  {
    path: '*',
    lazy: async () => ({
      Component: (await import('@/pages/not-found/NotFoundPage')).NotFoundPage,
    }),
  },
]
