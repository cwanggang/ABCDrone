import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { MockTelemetryProvider } from '@/features/telemetry/mock/MockTelemetryProvider'
import { TelemetryContextProvider } from '@/features/telemetry/TelemetryContextProvider'
import { DronesPage } from './DronesPage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const provider = new MockTelemetryProvider({ latencyMs: 0 })
  return render(
    <QueryClientProvider client={queryClient}>
      <TelemetryContextProvider provider={provider}>
        <MemoryRouter>
          <DronesPage />
        </MemoryRouter>
      </TelemetryContextProvider>
    </QueryClientProvider>,
  )
}

describe('DronesPage', () => {
  it('lists every mock drone with a status and a link to its detail page', async () => {
    renderPage()

    const link = await screen.findByRole('link', { name: 'Blue Devil 1' })
    expect(link).toHaveAttribute('href', '/drones/blue-devil-1')

    const rows = screen.getAllByRole('row').slice(1) // skip header
    expect(rows).toHaveLength(4)

    const offlineRow = screen.getByRole('link', { name: 'Blue Devil 4' }).closest('tr')!
    expect(within(offlineRow).getByText('Offline')).toBeInTheDocument()
    expect(within(offlineRow).getByText(/Stale/)).toBeInTheDocument()
  })
})
