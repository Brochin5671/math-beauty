import { describe, expect, test } from "vitest";
import { getRelativeValue, mapToRange } from "@/lib/fractals/utils";

describe("mapToRange", () => {
  test.each`
    value        | oldStart | oldStop | newStart | newStop | expected
    ${1}         | ${0}     | ${10}   | ${0}     | ${100}  | ${10}
    ${-1}        | ${0}     | ${10}   | ${0}     | ${100}  | ${-10}
    ${110}       | ${0}     | ${100}  | ${0}     | ${10}   | ${11}
    ${1}         | ${10}    | ${10}   | ${0}     | ${100}  | ${-Infinity}
    ${undefined} | ${0}     | ${10}   | ${0}     | ${100}  | ${Number.NaN}
  `(
    "maps $value from $oldStart-$oldStop onto $newStart-$newStop to give $expected",
    ({ value, oldStart, oldStop, newStart, newStop, expected }) => {
      expect(mapToRange(value, oldStart, oldStop, newStart, newStop)).toBe(expected);
    },
  );
});

describe("getRelativeValue", () => {
  test.each`
    value        | dimension | start | length | expected
    ${1}         | ${10}     | ${0}  | ${100} | ${10}
    ${-1}        | ${10}     | ${0}  | ${100} | ${-10}
    ${110}       | ${100}    | ${0}  | ${10}  | ${11}
    ${1}         | ${0}      | ${0}  | ${100} | ${Infinity}
    ${undefined} | ${10}     | ${10} | ${100} | ${Number.NaN}
  `(
    "maps $value with dimension $dimension onto start $start length $length to give $expected",
    ({ value, dimension, start, length, expected }) => {
      expect(getRelativeValue(value, dimension, start, length)).toBe(expected);
    },
  );
});
