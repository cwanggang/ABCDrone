/**
 * HARDWARE CONTRACT: which ThingSpeak field holds which reading.
 *
 * The carrier firmware (ESP32 + SIM7080G) must write exactly these fields to
 * the drone's channel. If the hardware team changes the firmware, change this
 * file (and the table in the README) to match; nothing else should need to.
 */
export const THINGSPEAK_FIELDS = {
  /** Sample temperature, °C */
  temperatureC: 'field1',
  /** Latitude, decimal degrees */
  lat: 'field2',
  /** Longitude, decimal degrees */
  lng: 'field3',
  /** Ground speed, m/s */
  speedMps: 'field4',
  /** Battery, % */
  batteryPct: 'field5',
} as const

export const THINGSPEAK_API_URL = 'https://api.thingspeak.com'
