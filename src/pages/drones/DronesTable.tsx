import { Link, useNavigate } from 'react-router'
import { StaleIndicator } from '@/components/StaleIndicator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DroneStatusBadge } from '@/features/drones/DroneStatusBadge'
import { TemperatureReading } from '@/features/drones/TemperatureReading'
import type { DroneTelemetry } from '@/features/telemetry/droneTelemetry'
import { formatBattery } from '@/lib/format'

const COLUMNS = ['Name', 'Status', 'Temperature', 'Battery', 'Last updated']

function DronesTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        {COLUMNS.map((c) => (
          <TableHead key={c}>{c}</TableHead>
        ))}
      </TableRow>
    </TableHeader>
  )
}

/** One row per drone. The whole row is clickable; the name is also a real link for keyboard users. */
export function DronesTable({ items }: { items: DroneTelemetry[] }) {
  const navigate = useNavigate()

  return (
    <Table>
      <DronesTableHeader />
      <TableBody>
        {items.map(({ drone, latest, status, isStale, temperatureAlert }) => (
          <TableRow
            key={drone.id}
            className="cursor-pointer"
            onClick={() => navigate(`/drones/${drone.id}`)}
          >
            <TableCell className="font-medium">
              <Link to={`/drones/${drone.id}`} className="hover:underline">
                {drone.name}
              </Link>
            </TableCell>
            <TableCell>
              <DroneStatusBadge status={status} />
            </TableCell>
            <TableCell>
              <TemperatureReading
                temperatureC={latest?.temperatureC ?? null}
                alert={temperatureAlert}
              />
            </TableCell>
            <TableCell className="tabular-nums">
              {formatBattery(latest?.batteryPct ?? null)}
            </TableCell>
            <TableCell>
              <StaleIndicator lastUpdated={latest?.timestamp ?? null} isStale={isStale} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function DronesTableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Table>
      <DronesTableHeader />
      <TableBody>
        {Array.from({ length: rows }, (_, i) => (
          <TableRow key={i}>
            {COLUMNS.map((c) => (
              <TableCell key={c}>
                <Skeleton className="h-5 w-24" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
