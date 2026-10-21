import { useState, type ReactNode } from 'react'
import { createTelemetryProvider } from './createTelemetryProvider'
import { TelemetryContext } from './TelemetryContext'
import type { TelemetryProvider } from './TelemetryProvider'

interface Props {
  children: ReactNode
  /** Tests pass a fake; the app uses whatever the env selects. */
  provider?: TelemetryProvider
}

export function TelemetryContextProvider({ children, provider }: Props) {
  const [value] = useState(() => provider ?? createTelemetryProvider())
  return <TelemetryContext value={value}>{children}</TelemetryContext>
}
