import { useQueries } from '@tanstack/react-query'
import { useNow } from '@/lib/useNow'
import type { DroneList } from '@/types/drone'
import { toDroneTelemetry, type DroneTelemetry } from './droneTelemetry'
import { telemetryQueries } from './queries'
import { useDrones } from './useDrones'
import { useTelemetryProvider } from './useTelemetryProvider'

interface Result {
  items: DroneTelemetry[]
  droneList: DroneList | undefined
  isLoading: boolean
  /** Couldn't load the drone list at all. */
  error: Error | null
  /** Drones whose latest reading failed to load (they show as stale/offline). */
  failedCount: number
  refetch: () => void
}

/** Live data for every drone. Shares its cache with useDroneTelemetry. */
export function useAllDronesTelemetry(): Result {
  const provider = useTelemetryProvider()
  const now = useNow()
  const dronesQuery = useDrones()
  const drones = dronesQuery.data?.drones ?? []

  const latestQueries = useQueries({
    queries: drones.map((d) => telemetryQueries.latest(provider, d.id)),
  })

  const items = drones.map((drone, i) => {
    const q = latestQueries[i]
    return toDroneTelemetry(drone, q?.data ?? null, now, q?.isError ?? false)
  })

  return {
    items,
    droneList: dronesQuery.data,
    isLoading: dronesQuery.isPending || latestQueries.some((q) => q.isPending),
    error: dronesQuery.error,
    failedCount: latestQueries.filter((q) => q.isError).length,
    refetch: () => void dronesQuery.refetch(),
  }
}
