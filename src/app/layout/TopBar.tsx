import { useMatches } from 'react-router'
import { FlaskConical, SatelliteDish } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useTelemetrySource } from '@/features/telemetry/useTelemetrySource'
import type { RouteHandle } from '../router'
import { UserMenu } from './UserMenu'

export function TopBar() {
  const matches = useMatches()
  const title = matches
    .map((m) => (m.handle as RouteHandle | undefined)?.title)
    .filter(Boolean)
    .at(-1)

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      <h1 className="truncate font-semibold">{title}</h1>
      <div className="ml-auto flex items-center gap-3">
        <TelemetrySourceBadge />
        <UserMenu />
      </div>
    </header>
  )
}

/** Makes it obvious when you're looking at simulated data. */
function TelemetrySourceBadge() {
  const source = useTelemetrySource()
  return source === 'mock' ? (
    <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-800">
      <FlaskConical aria-hidden /> Mock data
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1">
      <SatelliteDish aria-hidden /> ThingSpeak
    </Badge>
  )
}
