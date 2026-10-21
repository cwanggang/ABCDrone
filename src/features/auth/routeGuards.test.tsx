import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { fakeAuth, fakeUser } from '@/test/fakeAuth'
import { AuthContext } from './AuthContext'
import { BYPASS_AUTH } from './authBypass'
import { RequireAuth } from './RequireAuth'
import { RequireRole } from './RequireRole'
import type { AuthContextValue } from './types'

/** Same guard nesting as src/app/router.tsx, with stub pages. */
function renderAt(path: string, auth: AuthContextValue) {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <p>Login page</p> },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <RequireRole role="clinic" />,
            children: [{ path: '/drones/:droneId', element: <p>Clinic page</p> }],
          },
        ],
      },
    ],
    { initialEntries: [path] },
  )
  render(
    <AuthContext value={auth}>
      <RouterProvider router={router} />
    </AuthContext>,
  )
  return router
}

describe('route guards', () => {
  it('shows a loading state while auth is being checked', () => {
    renderAt('/drones/blue-devil-1', fakeAuth({ isLoading: true }))
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('Clinic page')).not.toBeInTheDocument()
  })

  it('sends signed-out users to /login, remembering where they were going', async () => {
    const router = renderAt('/drones/blue-devil-1', fakeAuth())
    expect(await screen.findByText('Login page')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(new URLSearchParams(router.state.location.search).get('next')).toBe(
      '/drones/blue-devil-1',
    )
  })

  it('blocks signed-in users without the clinic role', () => {
    renderAt('/drones/blue-devil-1', fakeAuth({ user: fakeUser('patient') }))
    expect(screen.getByText('No access to this area')).toBeInTheDocument()
    expect(screen.queryByText('Clinic page')).not.toBeInTheDocument()
  })

  it('explains when the role could not be loaded', () => {
    renderAt(
      '/drones/blue-devil-1',
      fakeAuth({ user: fakeUser(null), profileError: new Error('Profile query failed') }),
    )
    expect(screen.getByText("We couldn't check your access")).toBeInTheDocument()
    expect(screen.getByText('Profile query failed')).toBeInTheDocument()
  })

  it('lets clinic users through', () => {
    renderAt('/drones/blue-devil-1', fakeAuth({ user: fakeUser('clinic') }))
    expect(screen.getByText('Clinic page')).toBeInTheDocument()
  })

  it('lets the dev bypass user through', () => {
    renderAt('/drones/blue-devil-1', BYPASS_AUTH)
    expect(screen.getByText('Clinic page')).toBeInTheDocument()
  })
})
