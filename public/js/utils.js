// Maps a value using its range to a given range
export function mapToRange(value, oldStart, oldStop, newStart, newStop) {
    return (
        newStart +
        (newStop - newStart) * ((value - oldStart) / (oldStop - oldStart))
    );
}

// Gets relative value from given dimension, start and length
export function getRelativeValue(value, dimension, start, length) {
    return start + (value / dimension) * length;
}
