import { queryOptions } from '@tanstack/react-query'
import { POLL_INTERVAL_MS } from '@/config/telemetry'
import type { TelemetryProvider } from './TelemetryProvider'

/** Query keys and options shared by the telemetry hooks, so their caches line up. */
export const telemetryQueries = {
  drones: (provider: TelemetryProvider) =>
    queryOptions({
      queryKey: ['drones'],
      queryFn: () => provider.listDrones(),
      staleTime: 60_000,
    }),

  latest: (provider: TelemetryProvider, droneId: string) =>
    queryOptions({
      queryKey: ['telemetry', 'latest', droneId],
      queryFn: () => provider.getLatest(droneId),
      refetchInterval: POLL_INTERVAL_MS,
    }),

  history: (provider: TelemetryProvider, droneId: string, minutes: number) =>
    queryOptions({
      queryKey: ['telemetry', 'history', droneId, minutes],
      queryFn: () => provider.getHistory(droneId, { minutes }),
      refetchInterval: POLL_INTERVAL_MS,
    }),
}
