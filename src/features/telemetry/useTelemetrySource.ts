import { useTelemetryProvider } from './useTelemetryProvider'

/** Which backend telemetry is coming from ('mock' or 'thingspeak'), for display. */
export function useTelemetrySource() {
  return useTelemetryProvider().source
}
