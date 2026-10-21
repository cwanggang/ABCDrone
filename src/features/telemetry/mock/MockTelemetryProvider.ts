import type { DroneList } from '@/types/drone'
import type { TelemetryPoint, TimeRange } from '@/types/telemetry'
import type { TelemetryProvider } from '../TelemetryProvider'
import { MOCK_DRONE_SPECS, type MockDroneSpec } from './mockDrones'
import { SAMPLE_INTERVAL_MS, simulateDrone } from './simulateDrone'

interface MockOptions {
  /** Injected so tests can freeze time. */
  now?: () => number
  /** Fake network delay so loading skeletons are visible. */
  latencyMs?: number
  specs?: MockDroneSpec[]
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Simulated drones flying around Durham. See mockDrones.ts for the fleet. */
export class MockTelemetryProvider implements TelemetryProvider {
  readonly source = 'mock' as const
  private readonly now: () => number
  private readonly latencyMs: number
  private readonly specs: MockDroneSpec[]
  private readonly startedAt: number

  constructor({ now = Date.now, latencyMs = 300, specs = MOCK_DRONE_SPECS }: MockOptions = {}) {
    this.now = now
    this.latencyMs = latencyMs
    this.specs = specs
    this.startedAt = now()
  }

  async listDrones(): Promise<DroneList> {
    await sleep(this.latencyMs)
    return { drones: this.specs.map((s) => s.drone), source: 'mock' }
  }

  async getLatest(droneId: string): Promise<TelemetryPoint | null> {
    await sleep(this.latencyMs)
    const spec = this.getSpec(droneId)
    return simulateDrone(spec, this.lastSampleTime(spec))
  }

  async getHistory(droneId: string, range: TimeRange): Promise<TelemetryPoint[]> {
    await sleep(this.latencyMs)
    const spec = this.getSpec(droneId)
    const start = this.now() - range.minutes * 60_000
    const points: TelemetryPoint[] = []
    for (let t = this.lastSampleTime(spec); t >= start; t -= SAMPLE_INTERVAL_MS) {
      points.push(simulateDrone(spec, t))
    }
    return points.reverse() // oldest first
  }

  private getSpec(droneId: string): MockDroneSpec {
    const spec = this.specs.find((s) => s.drone.id === droneId)
    if (!spec) throw new Error(`Unknown drone "${droneId}"`)
    return spec
  }

  /**
   * Time of the drone's most recent upload. Uploads happen on a 15 s grid;
   * drones that "lost contact" stopped uploading at a fixed time.
   */
  private lastSampleTime(spec: MockDroneSpec): number {
    const reportingUntil =
      spec.lostContactMsBeforeStart === undefined
        ? this.now()
        : this.startedAt - spec.lostContactMsBeforeStart
    const offset = spec.sampleOffsetMs
    return Math.floor((reportingUntil - offset) / SAMPLE_INTERVAL_MS) * SAMPLE_INTERVAL_MS + offset
  }
}
