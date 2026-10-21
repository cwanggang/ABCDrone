import { useQuery } from '@tanstack/react-query'
import { telemetryQueries } from './queries'
import { useTelemetryProvider } from './useTelemetryProvider'

/** The list of drones (from the mock, Supabase, or the static fallback). */
export function useDrones() {
  const provider = useTelemetryProvider()
  return useQuery(telemetryQueries.drones(provider))
}
