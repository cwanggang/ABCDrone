import { ErrorState } from '@/components/ErrorState'
import { StaleIndicator } from '@/components/StaleIndicator'
import { Skeleton } from '@/components/ui/skeleton'
import { FleetMap } from '@/features/drones/map/FleetMap'
import type { DroneTelemetry } from '@/features/telemetry/droneTelemetry'
import { useAllDronesTelemetry } from '@/features/telemetry/useAllDronesTelemetry'
import { SummaryCards, SummaryCardsSkeleton } from './SummaryCards'

const MAP_HEIGHT = 'h-[calc(100vh-15rem)] min-h-[420px]'

export function DashboardPage() {
  const { items, isLoading, error, failedCount, refetch } = useAllDronesTelemetry()

  if (error) return <ErrorState title="Couldn't load drones" error={error} onRetry={refetch} />

  if (isLoading) {
    return (
      <>
        <SummaryCardsSkeleton />
        <Skeleton className={`${MAP_HEIGHT} rounded-xl`} />
      </>
    )
  }

  return (
    <>
      <SummaryCards items={items} />
      <FleetFreshness items={items} failedCount={failedCount} />
      <FleetMap items={items} className={MAP_HEIGHT} />
    </>
  )
}

/**
 * One line telling the user whether the feed as a whole is alive, based on
 * the newest reading from any drone. Per-drone freshness is in each popup.
 */
function FleetFreshness({ items, failedCount }: { items: DroneTelemetry[]; failedCount: number }) {
  const newest = items.reduce<DroneTelemetry | undefined>(
    (best, t) =>
      t.latest && (!best?.latest || t.latest.timestamp > best.latest.timestamp) ? t : best,
    undefined,
  )
  const staleCount = items.filter((t) => t.isStale).length

  return (
    <div className="-mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        Newest reading:
        <StaleIndicator
          lastUpdated={newest?.latest?.timestamp ?? null}
          isStale={newest?.isStale ?? true}
        />
      </span>
      {staleCount > 0 && (
        <span>
          {staleCount} of {items.length} drones have stale data
        </span>
      )}
      {failedCount > 0 && (
        <span className="text-red-600">Couldn't refresh {failedCount} drone(s); retrying</span>
      )}
    </div>
  )
}
