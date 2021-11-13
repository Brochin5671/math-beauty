import { mapToRange } from './utils.js';

// Color palette
let palette;

// Color presets
export const colorPresets = {
    default: [{ r: 1, g: 1, b: 1 }, false],
    rainbow: [{ r: 2, g: 4, b: 0 }, true],
    temperature: [{ r: 4, g: 5, b: 6 }, true],
    whacky: [{ r: 18, g: 12, b: 20 }, false],
};

// Creates a basic gradient palette based on factors
function gradient(redFactor, greenFactor, blueFactor, i) {
    // r,g,b = (i * factor) % 256
    return {
        r: (i * redFactor) % 256,
        g: (i * greenFactor) % 256,
        b: (i * blueFactor) % 256,
    };
}

// Creates a gradient loop palette based on phase shifts
function gradientLoop(redPhase, greenPhase, bluePhase, i) {
    // r,g,b = sin(frequency * i + phase shift) * width + center
    return {
        r: Math.round(Math.sin(0.024 * i + redPhase) * 127 + 128),
        g: Math.round(Math.sin(0.024 * i + greenPhase) * 127 + 128),
        b: Math.round(Math.sin(0.024 * i + bluePhase) * 127 + 128),
    };
}

// Creates the color palette
export function createPalette(color, loop) {
    const { r, g, b } = color;

    // Choose palette style
    const getColor = loop ? gradientLoop : gradient;

    // Fill palette
    palette = [];
    for (let i = 0; i < 256; i++) {
        palette.push(getColor(r, g, b, i));
    }
    return palette;
}

// Assigns a value based on iteration for each point
export function iterationColoring(iterations, maxIterations) {
    // Set to dark if equal to max
    if (iterations === maxIterations) {
        return { r: 0, g: 0, b: 0 };
    }

    // Normalize iterations to a 0-1 range then map its square root to a range 0-255
    let color = mapToRange(iterations, 0, maxIterations, 0, 1);
    color = mapToRange(Math.sqrt(color), 0, 1, 0, 255);
    return palette[Math.floor(color)];
}

// Assigns a color for each iteration providing a smooth transition of colors between iterations
export function smoothColoring(iterations, maxIterations, radius) {
    // Get the normalized iteration count
    if (iterations < maxIterations) {
        // N + 1 - (log(log(Z)) / 2 / log(2)) / log(2)
        iterations +=
            1 - Math.log(Math.log(radius) / 2 / Math.log(2)) / Math.log(2);
    } else {
        return { r: 0, g: 0, b: 0 };
    }

    // Get both colors and avoid negative numbers from modulo
    const color1 = palette[((Math.floor(iterations) % 255) + 255) % 255];
    const color2 = palette[(((Math.floor(iterations) + 1) % 255) + 255) % 255];

    // Get the linear interpolation of both colors
    const fracIteration = iterations % 1;
    const r = (color2.r - color1.r) * fracIteration + color1.r;
    const g = (color2.g - color1.g) * fracIteration + color1.g;
    const b = (color2.b - color1.b) * fracIteration + color1.b;
    return { r, g, b };
}
