import { useQuery } from '@tanstack/react-query'
import { HISTORY_WINDOW_MINUTES } from '@/config/telemetry'
import { telemetryQueries } from './queries'
import { useTelemetryProvider } from './useTelemetryProvider'

/** Recent readings for one drone (oldest first), polled for the map trail and chart. */
export function useDroneHistory(droneId: string, minutes = HISTORY_WINDOW_MINUTES) {
  const provider = useTelemetryProvider()
  return useQuery(telemetryQueries.history(provider, droneId, minutes))
}
