import { env } from '@/config/env'
import { MockTelemetryProvider } from './mock/MockTelemetryProvider'
import type { TelemetryProvider } from './TelemetryProvider'

/** Picks the implementation based on VITE_TELEMETRY_SOURCE. */
export function createTelemetryProvider(): TelemetryProvider {
  switch (env.telemetrySource) {
    case 'mock':
      return new MockTelemetryProvider()
    case 'thingspeak':
      // Added in Phase 3.
      throw new Error('VITE_TELEMETRY_SOURCE=thingspeak is not implemented yet. Use "mock".')
  }
}
