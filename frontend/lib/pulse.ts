/**
 * Tiny, three.js-free contract between the page sections and the 3D backdrop:
 * dispatch this window event when the visitor picks something, and the ring
 * gate in the background flashes in a matching colour.
 */
export const PULSE_EVENT = "cosmos:pulse";

export interface PulseDetail {
  /** any integer; picks the flash colour (cycles through 5) */
  index: number;
}

export function firePulse(index: number) {
  window.dispatchEvent(new CustomEvent<PulseDetail>(PULSE_EVENT, { detail: { index } }));
}
