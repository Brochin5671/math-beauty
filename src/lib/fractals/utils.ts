// Linearly remaps a value from one range to another
export function mapToRange(
  value: number,
  oldStart: number,
  oldStop: number,
  newStart: number,
  newStop: number,
): number {
  return newStart + (newStop - newStart) * ((value - oldStart) / (oldStop - oldStart));
}

// Maps a pixel coordinate into the complex plane from a start and length
export function getRelativeValue(
  value: number,
  dimension: number,
  start: number,
  length: number,
): number {
  return start + (value / dimension) * length;
}
