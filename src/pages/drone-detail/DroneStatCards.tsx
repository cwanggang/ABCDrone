import type { ReactNode } from 'react'
import { BatteryMedium, Clock, Gauge, MapPin, Thermometer, type LucideIcon } from 'lucide-react'
import { StaleIndicator } from '@/components/StaleIndicator'
import { TimeAgo } from '@/components/TimeAgo'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TemperatureReading } from '@/features/drones/TemperatureReading'
import type { DroneTelemetry } from '@/features/telemetry/droneTelemetry'
import { formatBattery, formatCoordinate, formatSpeed } from '@/lib/format'

const GRID = 'grid grid-cols-2 gap-4 lg:grid-cols-5'

export function DroneStatCards({ telemetry }: { telemetry: DroneTelemetry }) {
  const { latest, temperatureAlert, isStale } = telemetry
  return (
    <div className={GRID}>
      <StatCard label="Speed" icon={Gauge}>
        {formatSpeed(latest?.speedMps ?? null)}
      </StatCard>
      <StatCard label="Temperature" icon={Thermometer} alert={temperatureAlert !== null}>
        <TemperatureReading temperatureC={latest?.temperatureC ?? null} alert={temperatureAlert} />
      </StatCard>
      <StatCard label="Battery" icon={BatteryMedium}>
        {formatBattery(latest?.batteryPct ?? null)}
      </StatCard>
      <StatCard label="Coordinates" icon={MapPin}>
        <span className="text-sm">
          {formatCoordinate(latest?.lat ?? null)}, {formatCoordinate(latest?.lng ?? null)}
        </span>
      </StatCard>
      <StatCard label="Last updated" icon={Clock}>
        {latest ? <TimeAgo date={latest.timestamp} /> : '—'}
        <StaleIndicator
          lastUpdated={latest?.timestamp ?? null}
          isStale={isStale}
          className="mt-1 flex"
        />
      </StatCard>
    </div>
  )
}

interface StatCardProps {
  label: string
  icon: LucideIcon
  children: ReactNode
  alert?: boolean
}

function StatCard({ label, icon: Icon, children, alert = false }: StatCardProps) {
  return (
    <Card className={alert ? 'border-red-300 bg-red-50 py-4' : 'py-4'}>
      <CardContent className="px-4">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Icon className="size-4" aria-hidden /> {label}
        </p>
        <div className="mt-1 text-lg font-semibold tabular-nums">{children}</div>
      </CardContent>
    </Card>
  )
}

export function DroneStatCardsSkeleton() {
  return (
    <div className={GRID}>
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-[84px] rounded-xl" />
      ))}
    </div>
  )
}
