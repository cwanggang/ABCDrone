import { DatabaseZap } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useDrones } from '@/features/telemetry/useDrones'

/**
 * Warns when the drone list came from the static fallback file because
 * Supabase couldn't be reached. Renders nothing otherwise.
 */
export function DroneListSourceBanner() {
  const { data } = useDrones()
  if (data?.source !== 'static-fallback') return null
  return (
    <Alert className="border-amber-300 bg-amber-50 text-amber-900">
      <DatabaseZap aria-hidden />
      <AlertTitle>Couldn't load drones from Supabase; using the built-in list</AlertTitle>
      <AlertDescription className="text-amber-900/80">
        {data.fallbackReason ?? 'Unknown error.'} Drones added in Supabase won't appear until this
        is fixed.
      </AlertDescription>
    </Alert>
  )
}
