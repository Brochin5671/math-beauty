import { getRelativeValue } from './utils.js';

// Mandelbrot Set escape algorithm for getting iterations of each point
export function mandelbrotSet(x, y, width, height, options) {
    const { maxIterations, cr, ci, zoom, offsetX, offsetY } = options;

    // Map x and y to lie in the set
    let a = getRelativeValue(x + offsetX, width, -2, 4) / zoom; //divide a and b to zoom, add or subtract from x and y to move around
    let b = getRelativeValue(y - offsetY, height, -2, 4) / zoom;

    // c = a + bi = Re(z) + Im(z)
    const ca = cr ?? a;
    const cb = ci ?? b;

    // Calculate new z value until radius reaches escape radius or loop ends
    let iterations = 0;
    let radius = a * a + b * b;
    while (radius <= 4 && iterations < maxIterations) {
        // z^2 = (a + bi)^2 = a^2 - b^2 + 2abi
        const a2 = a * a - b * b;
        const b2 = 2 * a * b;
        // z = z^2 + c
        a = a2 + ca;
        b = b2 + cb;
        // z^2 radius value
        radius = a * a + b * b;
        iterations++;
    }
    return { iterations, radius };
}

// Burning Ship fractal using same algorithm but with modified equation
export function burningShip(x, y, width, height, options) {
    const { maxIterations, cr, ci, zoom, offsetX, offsetY } = options;

    // Map x and y to lie in the set
    let a = getRelativeValue(x + offsetX, width, -2, 4) / zoom; //divide a and b to zoom, add or subtract from x and y to move around
    let b = getRelativeValue(y - offsetY, height, -2, 4) / zoom;

    // c = a + bi = Re(z) + Im(z)
    const ca = cr ?? a;
    const cb = ci ?? b;

    // Calculate new z value until radius reaches escape radius or loop ends
    let iterations = 0;
    let radius = a * a + b * b;
    while (radius <= 4 && iterations < maxIterations) {
        // z^2 = (|a| + |b|i)^2 = a^2 - b^2 + |2ab|i
        const a2 = a * a - b * b;
        const b2 = Math.abs(2 * a * b);
        // z = z^2 + c
        a = a2 + ca;
        b = b2 + cb;
        // z^2 radius value
        radius = a * a + b * b;
        iterations++;
    }
    return { iterations, radius };
}

// Tricorn fractal using same algorithm but with modified equation
export function tricorn(x, y, width, height, options) {
    const { maxIterations, cr, ci, zoom, offsetX, offsetY } = options;

    // Map x and y to lie in the set
    let a = getRelativeValue(x + offsetX, width, -2, 4) / zoom; //divide a and b to zoom, add or subtract from x and y to move around
    let b = getRelativeValue(y - offsetY, height, -2, 4) / zoom;

    // c = a + bi = Re(z) + Im(z)
    const ca = cr ?? a;
    const cb = ci ?? b;

    // Calculate new z value until radius reaches escape radius or loop ends
    let iterations = 0;
    let radius = a * a + b * b;
    while (radius <= 4 && iterations < maxIterations) {
        // z^2 = conj(z^2) = a^2 - b^2 - 2abi
        const a2 = a * a - b * b;
        const b2 = -2 * a * b;
        // z = z^2 + c
        a = a2 + ca;
        b = b2 + cb;
        // z^2 radius value
        radius = a * a + b * b;
        iterations++;
    }
    return { iterations, radius };
}

// Multibrot Set escape algorithm for getting iterations of each point
export function multibrotSet(x, y, width, height, options) {
    const { maxIterations, cr, ci, zoom, offsetX, offsetY, d } = options;

    // Map x and y to lie in the set
    let a = getRelativeValue(x + offsetX, width, -2, 4) / zoom; //divide a and b to zoom, add or subtract from x and y to move around
    let b = getRelativeValue(y - offsetY, height, -2, 4) / zoom;

    // c = a + bi = Re(z) + Im(z)
    const ca = cr ?? a;
    const cb = ci ?? b;

    // Calculate new z value until radius reaches escape radius or loop ends
    let iterations = 0;
    let radius = a * a + b * b;
    while (radius <= 4 && iterations < maxIterations) {
        // Calculate z^d
        const aabbd = (a * a + b * b) ** (d / 2);
        const datan2 = d * Math.atan2(b, a);
        const a2 = aabbd * Math.cos(datan2);
        const b2 = aabbd * Math.sin(datan2);
        // z = z^d + c
        a = a2 + ca;
        b = b2 + cb;
        // z^2 radius value
        radius = a * a + b * b;
        iterations++;
    }
    return { iterations, radius };
}
