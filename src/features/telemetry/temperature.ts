import { TEMPERATURE_SAFE_RANGE_C, type TemperatureRange } from '@/config/telemetry'

export type TemperatureAlert = 'too_cold' | 'too_hot' | null

export function getTemperatureAlert(
  temperatureC: number | null,
  range: TemperatureRange = TEMPERATURE_SAFE_RANGE_C,
): TemperatureAlert {
  if (temperatureC === null) return null
  if (temperatureC < range.min) return 'too_cold'
  if (temperatureC > range.max) return 'too_hot'
  return null
}
