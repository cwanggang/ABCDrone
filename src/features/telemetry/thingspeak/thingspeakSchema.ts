import { z } from 'zod'
import { THINGSPEAK_FIELDS } from '@/config/thingspeakFields'
import type { TelemetryPoint } from '@/types/telemetry'

/**
 * ThingSpeak sends every field as a string ("5.23"), or null when the
 * firmware didn't write it. Anything that isn't a finite number becomes null,
 * so one bad reading never breaks the page.
 */
export function parseNumericField(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string' || value.trim() === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/**
 * GPS modules report 0,0 (or nothing) before they have a fix. That spot is in
 * the Atlantic, never a real drone position, so treat it as "no position".
 */
function parsePosition(
  rawLat: unknown,
  rawLng: unknown,
): { lat: number | null; lng: number | null } {
  const lat = parseNumericField(rawLat)
  const lng = parseNumericField(rawLng)
  const valid =
    lat !== null &&
    lng !== null &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(lat === 0 && lng === 0)
  return valid ? { lat, lng } : { lat: null, lng: null }
}

/** One entry of a ThingSpeak feed, turned into a TelemetryPoint. */
export const FeedEntrySchema = z
  .looseObject({
    // e.g. "2026-10-27T14:03:15Z" (UTC unless a `timezone` param is passed)
    created_at: z.iso.datetime({ offset: true }),
  })
  .transform((raw: Record<string, unknown> & { created_at: string }): TelemetryPoint => ({
    timestamp: new Date(raw.created_at),
    temperatureC: parseNumericField(raw[THINGSPEAK_FIELDS.temperatureC]),
    ...parsePosition(raw[THINGSPEAK_FIELDS.lat], raw[THINGSPEAK_FIELDS.lng]),
    speedMps: parseNumericField(raw[THINGSPEAK_FIELDS.speedMps]),
    batteryPct: parseNumericField(raw[THINGSPEAK_FIELDS.batteryPct]),
  }))

/**
 * Response of `/channels/<id>/feeds.json`. Entries are checked one by one in
 * `parseFeedResponse` so a single corrupt entry is skipped, not fatal.
 */
const FeedResponseSchema = z.object({
  feeds: z.array(z.unknown()),
})

/**
 * Parses a feeds.json body into readings, oldest first.
 * ThingSpeak answers `-1` (instead of an HTTP error) when the channel doesn't
 * exist or the read key is wrong, so that case gets its own error message.
 */
export function parseFeedResponse(body: unknown, channelId: string): TelemetryPoint[] {
  if (body === -1 || body === '-1') {
    throw new Error(
      `ThingSpeak channel ${channelId} wasn't found, or it is private and its read key is missing or wrong.`,
    )
  }
  const parsed = FeedResponseSchema.safeParse(body)
  if (!parsed.success) {
    throw new Error(`Unexpected response from ThingSpeak channel ${channelId}.`)
  }
  return parsed.data.feeds
    .map((entry) => FeedEntrySchema.safeParse(entry))
    .filter((result) => result.success)
    .map((result) => result.data)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
}
