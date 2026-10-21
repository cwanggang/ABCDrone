import { describe, expect, it } from 'vitest'
import { getTemperatureAlert } from './temperature'

const range = { min: 2, max: 8 }

describe('getTemperatureAlert', () => {
  it('returns null inside the range, including the edges', () => {
    expect(getTemperatureAlert(2, range)).toBeNull()
    expect(getTemperatureAlert(5, range)).toBeNull()
    expect(getTemperatureAlert(8, range)).toBeNull()
  })

  it('flags readings outside the range', () => {
    expect(getTemperatureAlert(1.9, range)).toBe('too_cold')
    expect(getTemperatureAlert(8.1, range)).toBe('too_hot')
  })

  it('returns null when there is no reading', () => {
    expect(getTemperatureAlert(null, range)).toBeNull()
  })
})
