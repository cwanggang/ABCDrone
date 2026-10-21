import { createContext } from 'react'
import type { TelemetryProvider } from './TelemetryProvider'

export const TelemetryContext = createContext<TelemetryProvider | null>(null)
