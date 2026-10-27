import { describe, expect, it } from 'vitest'
import { parseFeedResponse, parseNumericField } from './thingspeakSchema'

/** Trimmed copy of a real `/channels/<id>/feeds.json` response. */
const SAMPLE_RESPONSE = {
  channel: { id: 1234567, name: 'Blue Devil 1', last_entry_id: 42 },
  feeds: [
    {
      created_at: '2026-10-27T14:03:30Z',
      entry_id: 42,
      field1: '4.75',
      field2: '36.0074',
      field3: '-78.9378',
      field4: '12.3',
      field5: '88',
    },
    {
      created_at: '2026-10-27T14:03:15Z',
      entry_id: 41,
      field1: '4.80',
      field2: '36.0070',
      field3: '-78.9370',
      field4: '11.9',
      field5: '89',
    },
  ],
}

describe('parseNumericField', () => {
  it('turns numeric strings into numbers', () => {
    expect(parseNumericField('4.75')).toBe(4.75)
    expect(parseNumericField(' -78.9 ')).toBe(-78.9)
    expect(parseNumericField(3)).toBe(3)
  })

  it('returns null for missing or garbage values', () => {
    for (const v of [null, undefined, '', '  ', 'abc', 'nan', 'NaN', '1.2.3', {}, Infinity]) {
      expect(parseNumericField(v)).toBeNull()
    }
  })
})

describe('parseFeedResponse', () => {
  it('maps fields to a TelemetryPoint, oldest first', () => {
    const points = parseFeedResponse(SAMPLE_RESPONSE, '1234567')
    expect(points).toHaveLength(2)
    expect(points[0]!.timestamp.toISOString()).toBe('2026-10-27T14:03:15.000Z')
    expect(points[1]).toEqual({
      timestamp: new Date('2026-10-27T14:03:30Z'),
      temperatureC: 4.75,
      lat: 36.0074,
      lng: -78.9378,
      speedMps: 12.3,
      batteryPct: 88,
    })
  })

  it('allows missing and garbage fields, keeping the rest', () => {
    const [point] = parseFeedResponse(
      {
        feeds: [{ created_at: '2026-10-27T14:03:30Z', field1: 'oops', field2: null, field5: '50' }],
      },
      '1',
    )
    expect(point).toMatchObject({
      temperatureC: null,
      lat: null,
      lng: null,
      speedMps: null,
      batteryPct: 50,
    })
  })

  it('treats a 0,0 or out-of-range position as no GPS fix', () => {
    const points = parseFeedResponse(
      {
        feeds: [
          { created_at: '2026-10-27T14:00:00Z', field2: '0', field3: '0' },
          { created_at: '2026-10-27T14:00:15Z', field2: '95', field3: '-78.9' },
          { created_at: '2026-10-27T14:00:30Z', field2: '36.0', field3: 'x' },
        ],
      },
      '1',
    )
    expect(points).toHaveLength(3)
    for (const p of points) expect(p).toMatchObject({ lat: null, lng: null })
  })

  it('skips entries with a missing or invalid timestamp', () => {
    const points = parseFeedResponse(
      {
        feeds: [
          { field1: '5' },
          { created_at: 'yesterday', field1: '5' },
          'not an object',
          { created_at: '2026-10-27T10:03:30-04:00', field1: '6' },
        ],
      },
      '1',
    )
    expect(points).toHaveLength(1)
    expect(points[0]!.timestamp.toISOString()).toBe('2026-10-27T14:03:30.000Z')
  })

  it('returns an empty list for a channel with no entries', () => {
    expect(parseFeedResponse({ channel: {}, feeds: [] }, '1')).toEqual([])
  })

  it('explains the -1 response (channel missing or bad read key)', () => {
    expect(() => parseFeedResponse(-1, '1234567')).toThrow(/1234567.*read key/)
  })

  it('rejects a body that is not a feed', () => {
    expect(() => parseFeedResponse({ status: '400' }, '1')).toThrow(/Unexpected response/)
    expect(() => parseFeedResponse(null, '1')).toThrow(/Unexpected response/)
  })
})
