import { getRelativeValue, mapToRange } from '../public/js/utils';

describe('mapToRange', () => {
    test.each`
        value        | oldStart | oldStop | newStart | newStop | expected
        ${1}         | ${0}     | ${10}   | ${0}     | ${100}  | ${10}
        ${-1}        | ${0}     | ${10}   | ${0}     | ${100}  | ${-10}
        ${110}       | ${0}     | ${100}  | ${0}     | ${10}   | ${11}
        ${1}         | ${10}    | ${10}   | ${0}     | ${100}  | ${-Infinity}
        ${undefined} | ${0}     | ${10}   | ${0}     | ${100}  | ${NaN}
    `(
        'returns $expected when $value with range $oldStart - $oldStop is mapped to range $newStart - $newStop',
        ({ value, oldStart, oldStop, newStart, newStop, expected }) =>
            expect(
                mapToRange(value, oldStart, oldStop, newStart, newStop)
            ).toBe(expected)
    );
});

describe('getRelativeValue', () => {
    test.each`
        value        | dimension | start | length | expected
        ${1}         | ${10}     | ${0}  | ${100} | ${10}
        ${-1}        | ${10}     | ${0}  | ${100} | ${-10}
        ${110}       | ${100}    | ${0}  | ${10}  | ${11}
        ${1}         | ${0}      | ${0}  | ${100} | ${Infinity}
        ${undefined} | ${10}     | ${10} | ${100} | ${NaN}
    `(
        'returns $expected when $value with dimension $dimension is mapped to start value $start and length value $length',
        ({ value, dimension, start, length, expected }) =>
            expect(getRelativeValue(value, dimension, start, length)).toBe(
                expected
            )
    );
});
