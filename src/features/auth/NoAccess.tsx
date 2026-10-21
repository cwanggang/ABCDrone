import { useNavigate } from 'react-router'
import { ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { UserRole } from './types'
import { useAuth } from './useAuth'

interface Props {
  requiredRole: UserRole
  /** If the profile failed to load we can't know the role; say so. */
  error: Error | null
}

const ROLE_LABELS: Record<UserRole, string> = {
  clinic: 'clinic staff',
  patient: 'patients',
}

/** Shown to signed-in users who lack the role a page needs. */
export function NoAccess({ requiredRole, error }: Props) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <ShieldX className="size-10 text-muted-foreground" aria-hidden />
      <h1 className="text-xl font-semibold">
        {error ? "We couldn't check your access" : 'No access to this area'}
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {error
          ? error.message
          : `This area is for ${ROLE_LABELS[requiredRole]}. You're signed in as ${user?.email}, which doesn't have that role yet. Ask a project admin to grant it.`}
      </p>
      <Button variant="outline" onClick={handleSignOut}>
        Sign out
      </Button>
    </div>
  )
}
