import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { DroneStatus } from '@/types/drone'
import { STATUS_STYLES } from './statusStyles'

export function DroneStatusBadge({ status }: { status: DroneStatus }) {
  const { label, icon: Icon, badgeClass } = STATUS_STYLES[status]
  return (
    <Badge variant="outline" className={cn('gap-1', badgeClass)}>
      <Icon aria-hidden />
      {label}
    </Badge>
  )
}
