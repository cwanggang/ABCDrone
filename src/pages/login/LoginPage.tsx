import { Link } from 'react-router'
import { Stethoscope, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/useAuth'
import { ClinicLoginForm } from './ClinicLoginForm'

/** Portal page: clinic staff sign in here; patients will get their own option later. */
export function LoginPage() {
  const { isBypass } = useAuth()

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center">
          <img src="/favicon.svg" alt="" className="mx-auto size-10" />
          <h1 className="mt-2 text-2xl font-semibold">ABCDrone</h1>
          <p className="text-sm text-muted-foreground">At-home saliva sample pickup by drone</p>
        </div>

        {isBypass && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-center text-sm text-amber-900">
            Dev auth bypass is on (VITE_AUTH_BYPASS=true).{' '}
            <Link to="/dashboard" className="font-medium underline">
              Continue to the dashboard
            </Link>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="size-5" aria-hidden /> Clinic staff login
              </CardTitle>
              <CardDescription>Monitor drones and sample temperatures.</CardDescription>
            </CardHeader>
            <CardContent>
              <ClinicLoginForm />
            </CardContent>
          </Card>

          <Card className="opacity-60" aria-disabled>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="size-5" aria-hidden /> Patient login
                <Badge variant="secondary">Coming soon</Badge>
              </CardTitle>
              <CardDescription>Track your sample pickup.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>
                Patient login (coming soon)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
