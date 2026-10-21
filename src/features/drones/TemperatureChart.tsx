import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import { TEMPERATURE_SAFE_RANGE_C } from '@/config/telemetry'
import { getTemperatureAlert } from '@/features/telemetry/temperature'
import { formatClockTime, formatTemperature } from '@/lib/format'
import type { TelemetryPoint } from '@/types/telemetry'
import { ALERT_COLOR } from './statusStyles'

const LINE_COLOR = '#334155' // neutral slate, so red alert dots and the green band stand out
const SAFE_COLOR = '#16a34a'

interface ChartPoint {
  time: number
  temperatureC: number
}

/** Temperature over time with the safe range shaded and out-of-range readings marked red. */
export function TemperatureChart({ history }: { history: TelemetryPoint[] }) {
  const { min, max } = TEMPERATURE_SAFE_RANGE_C
  const data: ChartPoint[] = history.flatMap((p) =>
    p.temperatureC === null ? [] : [{ time: p.timestamp.getTime(), temperatureC: p.temperatureC }],
  )

  if (data.length === 0) {
    return (
      <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No temperature readings in this window yet.
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
        <CartesianGrid stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="time"
          type="number"
          scale="time"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(t: number) => formatClockTime(new Date(t))}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          stroke="#d1d5db"
          minTickGap={40}
        />
        <YAxis
          // Always show the whole safe band plus a margin, even when readings sit inside it.
          domain={[
            (dataMin: number) => Math.floor(Math.min(dataMin, min - 1)),
            (dataMax: number) => Math.ceil(Math.max(dataMax, max + 1)),
          ]}
          tickFormatter={(v: number) => `${v}°`}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          stroke="#d1d5db"
          width={44}
        />
        <ReferenceArea
          y1={min}
          y2={max}
          fill={SAFE_COLOR}
          fillOpacity={0.1}
          ifOverflow="extendDomain"
        />
        <ReferenceLine y={min} stroke={SAFE_COLOR} strokeDasharray="4 4" />
        <ReferenceLine
          y={max}
          stroke={SAFE_COLOR}
          strokeDasharray="4 4"
          label={{
            value: `Safe ${min}–${max} °C`,
            position: 'insideTopRight',
            fontSize: 11,
            fill: '#15803d',
          }}
        />
        <Tooltip content={ChartTooltip} cursor={{ stroke: '#9ca3af', strokeDasharray: '3 3' }} />
        <Line
          type="monotone"
          dataKey="temperatureC"
          stroke={LINE_COLOR}
          strokeWidth={2}
          dot={OutOfRangeDot}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

/** Only out-of-range readings get a dot, so they stand out on the line. */
function OutOfRangeDot(props: { cx?: number; cy?: number; payload?: ChartPoint; index?: number }) {
  const { cx, cy, payload, index } = props
  if (cx == null || cy == null || !payload || !getTemperatureAlert(payload.temperatureC)) {
    return <g key={index} />
  }
  return (
    <circle key={index} cx={cx} cy={cy} r={4} fill={ALERT_COLOR} stroke="#ffffff" strokeWidth={2} />
  )
}

function ChartTooltip({ active, payload }: TooltipContentProps) {
  const point = payload?.[0]?.payload as ChartPoint | undefined
  if (!active || !point) return null
  const alert = getTemperatureAlert(point.temperatureC)
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md">
      <div className="text-muted-foreground">{formatClockTime(new Date(point.time))}</div>
      <div className="font-medium">{formatTemperature(point.temperatureC)}</div>
      {alert && (
        <div className="font-medium text-red-600">
          {alert === 'too_hot' ? 'Above' : 'Below'} safe range
        </div>
      )}
    </div>
  )
}
