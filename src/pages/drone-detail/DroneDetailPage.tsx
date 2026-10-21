import { Link, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { ErrorState } from '@/components/ErrorState'
import { StaleIndicator } from '@/components/StaleIndicator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { HISTORY_WINDOW_MINUTES } from '@/config/telemetry'
import { DroneStatusBadge } from '@/features/drones/DroneStatusBadge'
import { DroneTrackMap } from '@/features/drones/map/DroneTrackMap'
import { TemperatureAlertBanner } from '@/features/drones/TemperatureAlertBanner'
import { TemperatureChart } from '@/features/drones/TemperatureChart'
import type { DroneTelemetry } from '@/features/telemetry/droneTelemetry'
import { useDroneHistory } from '@/features/telemetry/useDroneHistory'
import { useDroneTelemetry } from '@/features/telemetry/useDroneTelemetry'
import { DroneStatCards, DroneStatCardsSkeleton } from './DroneStatCards'

export function DroneDetailPage() {
  const { droneId = '' } = useParams()
  const { data, isLoading, error, notFound } = useDroneTelemetry(droneId)

  if (notFound) return <DroneNotFound droneId={droneId} />
  if (error) return <ErrorState title="Couldn't load this drone" error={error} />

  if (isLoading || !data) {
    return (
      <>
        <Skeleton className="h-9 w-64" />
        <DroneStatCardsSkeleton />
        <Skeleton className="h-[420px] rounded-xl" />
      </>
    )
  }

  return (
    <>
      <DroneHeader telemetry={data} />
      <TemperatureAlertBanner telemetry={data} />
      <DroneStatCards telemetry={data} />
      <DroneHistorySection telemetry={data} />
    </>
  )
}

function DroneHeader({ telemetry }: { telemetry: DroneTelemetry }) {
  const { drone, status, latest, isStale } = telemetry
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button asChild variant="ghost" size="icon" aria-label="Back to all drones">
        <Link to="/drones">
          <ArrowLeft />
        </Link>
      </Button>
      <h2 className="text-2xl font-semibold">{drone.name}</h2>
      <DroneStatusBadge status={status} />
      <StaleIndicator lastUpdated={latest?.timestamp ?? null} isStale={isStale} />
    </div>
  )
}

/** Map trail and temperature chart, which both need the history query. */
function DroneHistorySection({ telemetry }: { telemetry: DroneTelemetry }) {
  const history = useDroneHistory(telemetry.drone.id)

  return (
    <div className="grid gap-4 xl:grid-cols-5">
      <Card className="xl:col-span-3">
        <CardHeader>
          <CardTitle>Live position</CardTitle>
        </CardHeader>
        <CardContent>
          <DroneTrackMap telemetry={telemetry} history={history.data ?? []} className="h-[420px]" />
        </CardContent>
      </Card>
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Sample temperature, last {HISTORY_WINDOW_MINUTES} min</CardTitle>
        </CardHeader>
        <CardContent className="h-[420px]">
          {history.isPending ? (
            <Skeleton className="size-full" />
          ) : history.data ? (
            <TemperatureChart history={history.data} />
          ) : (
            <ErrorState
              title="Couldn't load temperature history"
              error={history.error}
              onRetry={() => void history.refetch()}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DroneNotFound({ droneId }: { droneId: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
      <p className="font-medium">No drone with id “{droneId}”</p>
      <p className="text-sm text-muted-foreground">It may have been removed or renamed.</p>
      <Button asChild variant="outline" size="sm">
        <Link to="/drones">Back to all drones</Link>
      </Button>
    </div>
  )
}
