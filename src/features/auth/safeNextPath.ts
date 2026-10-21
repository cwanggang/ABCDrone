const DEFAULT_PATH = '/dashboard'

/**
 * Where to send the user after login, from the `?next=` query parameter.
 * Only same-site paths are allowed. Otherwise a crafted link like
 * /login?next=https://evil.example could bounce users off-site after signing in.
 */
export function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return DEFAULT_PATH
  }
  if (next.startsWith('/login')) return DEFAULT_PATH
  return next
}
