import { describe, expect, it } from 'vitest'
import { safeNextPath } from './safeNextPath'

describe('safeNextPath', () => {
  it('keeps same-site paths, including query strings', () => {
    expect(safeNextPath('/drones/blue-devil-2')).toBe('/drones/blue-devil-2')
    expect(safeNextPath('/drones?x=1')).toBe('/drones?x=1')
  })

  it('falls back to the dashboard when missing', () => {
    expect(safeNextPath(null)).toBe('/dashboard')
    expect(safeNextPath('')).toBe('/dashboard')
  })

  it('rejects anything that could leave the site', () => {
    expect(safeNextPath('https://evil.example')).toBe('/dashboard')
    expect(safeNextPath('//evil.example')).toBe('/dashboard')
    expect(safeNextPath('/\\evil.example')).toBe('/dashboard')
  })

  it('does not loop back to the login page', () => {
    expect(safeNextPath('/login')).toBe('/dashboard')
  })
})
