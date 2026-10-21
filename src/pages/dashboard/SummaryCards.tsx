import { Thermometer, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { STATUS_STYLES } from '@/features/drones/statusStyles'
import { hasActiveTemperatureAlert, type DroneTelemetry } from '@/features/telemetry/droneTelemetry'
import { cn } from '@/lib/utils'
import type { DroneStatus } from '@/types/drone'

export function SummaryCards({ items }: { items: DroneTelemetry[] }) {
  const count = (status: DroneStatus) => items.filter((t) => t.status === status).length
  const alerts = items.filter(hasActiveTemperatureAlert).length

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {(['in_flight', 'idle', 'offline'] as const).map((status) => (
        <SummaryCard
          key={status}
          label={STATUS_STYLES[status].label}
          value={count(status)}
          icon={STATUS_STYLES[status].icon}
        />
      ))}
      <SummaryCard
        label="Temperature alerts"
        value={alerts}
        icon={Thermometer}
        highlight={alerts > 0}
      />
    </div>
  )
}

interface CardProps {
  label: string
  value: number
  icon: LucideIcon
  /** Red styling to draw attention (used for active alerts). */
  highlight?: boolean
}

function SummaryCard({ label, value, icon: Icon, highlight = false }: CardProps) {
  return (
    <Card className={cn('py-4', highlight && 'border-red-300 bg-red-50')}>
      <CardContent className="flex items-center justify-between gap-2 px-4">
        <div>
          <p className={cn('text-sm text-muted-foreground', highlight && 'text-red-700')}>
            {label}
          </p>
          <p className={cn('text-3xl font-semibold tabular-nums', highlight && 'text-red-700')}>
            {value}
          </p>
        </div>
        <Icon
          className={cn('size-6 text-muted-foreground', highlight && 'text-red-600')}
          aria-hidden
        />
      </CardContent>
    </Card>
  )
}

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-[92px] rounded-xl" />
      ))}
    </div>
  )
}
