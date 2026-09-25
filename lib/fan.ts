// Shared "fan / curve around" hover transform used by Tracks and EventsPreview.
// When a card is active (hovered or pinned), it rises + enlarges.
// Its neighbors rotate outward and sink slightly, curving around it like an open fan,
// dimming and shrinking the further they are from the active card.

export interface FanTransform {
  y: number;
  rotate: number;
  scale: number;
  opacity: number;
  zIndex: number;
}

export function getFanTransform(
  distance: number,
  isActive: boolean,
  hasActive: boolean
): FanTransform {
  if (isActive) {
    return { y: -34, rotate: 0, scale: 1.16, opacity: 1, zIndex: 30 };
  }

  if (!hasActive) {
    return { y: 0, rotate: 0, scale: 1, opacity: 1, zIndex: 1 };
  }

  const d = Math.min(Math.abs(distance), 4);
  const sign = Math.sign(distance);

  return {
    y: 12 + d * 10,
    rotate: sign * (6 + d * 3.4),
    scale: Math.max(0.8, 1 - d * 0.055),
    opacity: Math.max(0.4, 1 - d * 0.14),
    zIndex: 10 - d,
  };
}
