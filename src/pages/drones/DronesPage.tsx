import { ErrorState } from '@/components/ErrorState'
import { Card } from '@/components/ui/card'
import { useAllDronesTelemetry } from '@/features/telemetry/useAllDronesTelemetry'
import { DronesTable, DronesTableSkeleton } from './DronesTable'

export function DronesPage() {
  const { items, isLoading, error, refetch } = useAllDronesTelemetry()

  if (error) return <ErrorState title="Couldn't load drones" error={error} onRetry={refetch} />

  return (
    <Card className="py-2">
      {isLoading ? (
        <DronesTableSkeleton />
      ) : items.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">No drones registered yet.</p>
      ) : (
        <DronesTable items={items} />
      )}
    </Card>
  )
}
