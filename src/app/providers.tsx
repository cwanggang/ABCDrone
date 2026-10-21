import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { TelemetryContextProvider } from '@/features/telemetry/TelemetryContextProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            // Telemetry already polls; refetching on tab focus would just double up.
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TelemetryContextProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </TelemetryContextProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
