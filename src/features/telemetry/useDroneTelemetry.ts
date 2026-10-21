import { useQuery } from '@tanstack/react-query'
import { useNow } from '@/lib/useNow'
import { toDroneTelemetry, type DroneTelemetry } from './droneTelemetry'
import { telemetryQueries } from './queries'
import { useDrones } from './useDrones'
import { useTelemetryProvider } from './useTelemetryProvider'

interface Result {
  data: DroneTelemetry | undefined
  isLoading: boolean
  /** Set only when there is nothing to show at all. */
  error: Error | null
  /** The drone list loaded but has no drone with this id. */
  notFound: boolean
}

/** Live data for one drone, polled every POLL_INTERVAL_MS. */
export function useDroneTelemetry(droneId: string): Result {
  const provider = useTelemetryProvider()
  const now = useNow()
  const dronesQuery = useDrones()
  const drone = dronesQuery.data?.drones.find((d) => d.id === droneId)
  const latestQuery = useQuery({
    ...telemetryQueries.latest(provider, droneId),
    enabled: drone !== undefined,
  })

  // When a later refresh fails, TanStack Query keeps the last good `data`
  // (and sets isError), so we keep showing it and mark it stale.
  // (getLatest returns null for "never reported", which is still data.)
  const data =
    drone && latestQuery.data !== undefined
      ? toDroneTelemetry(drone, latestQuery.data, now, latestQuery.isError)
      : undefined

  return {
    data,
    isLoading: dronesQuery.isPending || (drone !== undefined && latestQuery.isPending),
    error: data ? null : (dronesQuery.error ?? latestQuery.error),
    notFound: dronesQuery.isSuccess && !drone,
  }
}
