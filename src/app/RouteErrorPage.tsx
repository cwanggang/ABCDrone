import { useRouteError } from 'react-router'
import { ErrorState } from '@/components/ErrorState'

/** Catches crashes inside a page so the rest of the app shell keeps working. */
export function RouteErrorPage() {
  const error = useRouteError()
  return (
    <div className="p-6">
      <ErrorState
        title="This page crashed"
        error={error}
        onRetry={() => window.location.reload()}
      />
    </div>
  )
}
