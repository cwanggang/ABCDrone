import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '@/features/auth/AuthContext'
import type { AuthContextValue } from '@/features/auth/types'
import { fakeAuth, fakeUser } from '@/test/fakeAuth'
import { LoginPage } from './LoginPage'

function renderLogin(url: string, auth: AuthContextValue) {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginPage /> },
      { path: '*', element: <p>Inside the app</p> },
    ],
    { initialEntries: [url] },
  )
  render(
    <AuthContext value={auth}>
      <RouterProvider router={router} />
    </AuthContext>,
  )
  return router
}

describe('LoginPage', () => {
  it('redirects signed-in users to the page they were heading to', async () => {
    const router = renderLogin('/login?next=/drones', fakeAuth({ user: fakeUser('clinic') }))
    expect(await screen.findByText('Inside the app')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/drones')
  })

  it('signs in with email and password', async () => {
    const signInWithPassword = vi.fn(async () => {})
    renderLogin('/login', fakeAuth({ signInWithPassword }))

    await userEvent.type(screen.getByLabelText('Email'), 'staff@duke.edu')
    await userEvent.type(screen.getByLabelText('Password'), 'hunter22')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(signInWithPassword).toHaveBeenCalledWith('staff@duke.edu', 'hunter22')
  })

  it('shows the error when sign-in fails', async () => {
    const signInWithPassword = vi.fn(async () => {
      throw new Error('Invalid login credentials')
    })
    renderLogin('/login', fakeAuth({ signInWithPassword }))

    await userEvent.type(screen.getByLabelText('Email'), 'staff@duke.edu')
    await userEvent.type(screen.getByLabelText('Password'), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Invalid login credentials')).toBeInTheDocument()
  })

  it('starts Google sign-in with the return path', async () => {
    const signInWithGoogle = vi.fn(async () => {})
    renderLogin('/login?next=/drones/blue-devil-3', fakeAuth({ signInWithGoogle }))
    await userEvent.click(screen.getByRole('button', { name: /Continue with Google/ }))
    expect(signInWithGoogle).toHaveBeenCalledWith('/drones/blue-devil-3')
  })

  it('disables sign-in when Supabase is not configured', () => {
    renderLogin('/login', fakeAuth({ isConfigured: false }))
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled()
    expect(screen.getByText(/Supabase isn't configured/)).toBeInTheDocument()
  })
})
