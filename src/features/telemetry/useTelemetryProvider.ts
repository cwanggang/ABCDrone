import { useContext } from 'react'
import { TelemetryContext } from './TelemetryContext'
import type { TelemetryProvider } from './TelemetryProvider'

/** Internal: only the telemetry hooks should call this, never components. */
export function useTelemetryProvider(): TelemetryProvider {
  const provider = useContext(TelemetryContext)
  if (!provider) {
    throw new Error('useTelemetryProvider must be used inside <TelemetryContextProvider>')
  }
  return provider
}
