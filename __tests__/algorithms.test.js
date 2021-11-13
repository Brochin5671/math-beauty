import {
    burningShip,
    mandelbrotSet,
    multibrotSet,
    tricorn,
} from '../public/js/algorithms';

const defaultOptions = {
    maxIterations: 100,
    offsetX: 0,
    offsetY: 0,
    zoom: 1,
    d: 2,
    cr: undefined,
    ci: undefined,
};

const juliaOptions = {
    maxIterations: 100,
    offsetX: 0,
    offsetY: 0,
    zoom: 1,
    d: 2,
    cr: -0.70176,
    ci: 0.3842,
};

describe('mandelbrotSet', () => {
    test.each`
        x      | y      | width  | height | options           | expected
        ${147} | ${78}  | ${320} | ${320} | ${defaultOptions} | ${{ iterations: 26, radius: 9.364669406861136 }}
        ${160} | ${160} | ${320} | ${320} | ${defaultOptions} | ${{ iterations: 100, radius: 0 }}
    `(
        'returns $expected for canvas point ($x,$y) with dimensions $width x $height and options',
        ({ x, y, width, height, options, expected }) =>
            expect(mandelbrotSet(x, y, width, height, options)).toStrictEqual(
                expected
            )
    );
});

describe('burningShip', () => {
    test.each`
        x      | y      | width  | height | options           | expected
        ${73}  | ${94}  | ${320} | ${320} | ${defaultOptions} | ${{ iterations: 13, radius: 7.818855129194052 }}
        ${160} | ${160} | ${320} | ${320} | ${defaultOptions} | ${{ iterations: 100, radius: 0 }}
    `(
        'returns $expected for canvas point ($x,$y) with dimensions $width x $height and options',
        ({ x, y, width, height, options, expected }) =>
            expect(burningShip(x, y, width, height, options)).toStrictEqual(
                expected
            )
    );
});

describe('tricorn', () => {
    test.each`
        x      | y      | width  | height | options           | expected
        ${64}  | ${146} | ${320} | ${320} | ${defaultOptions} | ${{ iterations: 9, radius: 5.137565547661867 }}
        ${160} | ${160} | ${320} | ${320} | ${defaultOptions} | ${{ iterations: 100, radius: 0 }}
    `(
        'returns $expected for canvas point ($x,$y) with dimensions $width x $height and options',
        ({ x, y, width, height, options, expected }) =>
            expect(tricorn(x, y, width, height, options)).toStrictEqual(
                expected
            )
    );
});

describe('multibrotSet', () => {
    test.each`
        x      | y      | width  | height | options           | expected
        ${147} | ${78}  | ${320} | ${320} | ${defaultOptions} | ${{ iterations: 26, radius: 9.364669406937864 }}
        ${160} | ${160} | ${320} | ${320} | ${defaultOptions} | ${{ iterations: 100, radius: 0 }}
    `(
        'returns $expected for canvas point ($x,$y) with dimensions $width x $height and options',
        ({ x, y, width, height, options, expected }) =>
            expect(multibrotSet(x, y, width, height, options)).toStrictEqual(
                expected
            )
    );
});

describe('Julia Set options for each', () => {
    test.each`
        x      | y      | width  | height | options         | function         | expected
        ${167} | ${107} | ${320} | ${320} | ${juliaOptions} | ${mandelbrotSet} | ${{ iterations: 58, radius: 11.850780532390306 }}
        ${160} | ${160} | ${320} | ${320} | ${juliaOptions} | ${burningShip}   | ${{ iterations: 4, radius: 11.364702615318595 }}
        ${170} | ${207} | ${320} | ${320} | ${juliaOptions} | ${tricorn}       | ${{ iterations: 10, radius: 4.71884510231555 }}
        ${167} | ${107} | ${320} | ${320} | ${juliaOptions} | ${multibrotSet}  | ${{ iterations: 58, radius: 11.85078053238783 }}
    `(
        'returns $expected for canvas point ($x,$y) with dimensions $width x $height and options for $function',
        ({ x, y, width, height, options, function: algorithm, expected }) =>
            expect(algorithm(x, y, width, height, options)).toStrictEqual(
                expected
            )
    );
});
