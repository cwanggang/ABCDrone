import { z } from 'zod'

/**
 * All environment variables the app reads, validated once at startup.
 * Every VITE_ variable is bundled into the browser, so never put secrets here
 * that you wouldn't be comfortable with any visitor seeing. See .env.example.
 */
const EnvSchema = z.object({
  VITE_TELEMETRY_SOURCE: z.enum(['mock', 'thingspeak']).default('mock'),
  VITE_AUTH_BYPASS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
})

const parsed = EnvSchema.safeParse(import.meta.env)
if (!parsed.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`)
}

export const env = {
  telemetrySource: parsed.data.VITE_TELEMETRY_SOURCE,
  /** Only honoured in `npm run dev`; production builds always require real auth. */
  authBypass: import.meta.env.DEV && parsed.data.VITE_AUTH_BYPASS,
}
