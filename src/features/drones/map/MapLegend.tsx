import { ALERT_COLOR, STATUS_STYLES } from '../statusStyles'

/** Key for marker colors, overlaid in the map's bottom-left corner. */
export function MapLegend() {
  return (
    <div className="absolute bottom-6 left-2 z-[1000] rounded-md border bg-background/95 px-3 py-2 text-xs shadow-sm">
      <ul className="space-y-1">
        {Object.values(STATUS_STYLES).map(({ label, color }) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className="size-3 rounded-full border-2 border-white"
              style={{ background: color }}
            />
            {label}
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span
            className="size-3 rounded-full border-2 bg-gray-300"
            style={{ borderColor: ALERT_COLOR }}
          />
          Temperature alert
        </li>
      </ul>
    </div>
  )
}
