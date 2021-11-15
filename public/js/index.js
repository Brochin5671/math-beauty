import { mandelbrotSet } from './algorithms.js';
import {
    changeCR,
    changeCI,
    changeD,
    changeEscapeFractal,
    changeIterations,
    changeX,
    changeY,
    changeZoom,
    clickDrawGroup,
    toggleJuliaSet,
    clickZoom,
} from './cameraTools.js';
import { iterationColoring, createPalette } from './coloring.js';
import {
    changeColorMethod,
    changeColorPreset,
    changeRGB,
    toggleAutoDraw,
    toggleGradientLoop,
} from './drawTools.js';

// Options for camera and draw
const options = {
    escapeFractal: mandelbrotSet,
    colorMethod: iterationColoring,
    maxIterations: 100,
    offsetX: 0,
    offsetY: 0,
    zoom: 1,
    d: 2,
    cr: undefined,
    ci: undefined,
    color: { r: 1, g: 1, b: 1 },
};

// Draws the escape fractal image to be put on the canvas
export function drawEscapeFractal(options) {
    // Get canvas context, dimensions, and options
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const { escapeFractal, colorMethod, maxIterations } = options;

    // Create ImageData object
    const imageData = ctx.createImageData(width, 1);

    // Setup new
    ctx.clearRect(0, 0, width, height);

    // Iterate each pixel of the canvas and color it according to the algorithm
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Get iterations from algorithm
            const { iterations, radius } = escapeFractal(
                x,
                y,
                width,
                height,
                options
            );
            // Get palette color based on coloring algorithm
            const { r, g, b } = colorMethod(iterations, maxIterations, radius);
            // Set the current pixel's RGBA values
            let pixelIdx = x * 4;
            imageData.data[pixelIdx++] = r;
            imageData.data[pixelIdx++] = g;
            imageData.data[pixelIdx++] = b;
            imageData.data[pixelIdx++] = 255;
        }
        // Add the image data to the canvas
        ctx.putImageData(imageData, 0, y);
    }
}

// Updates the color palette used for drawing the fractal
export function updateColorPalette(color, loopGradient) {
    // Get palette, canvas context and dimensions
    const palette = createPalette(color, loopGradient);
    const canvas = document.getElementById('colorPalette');
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Create ImageData object
    const imageData = ctx.createImageData(width, 1);

    // Setup new
    ctx.clearRect(0, 0, width, height);

    // Create gradient
    for (let x = 0; x < width; x++) {
        // Set the current pixel's RGBA values
        const { r, g, b } = palette[x];
        let pixelIdx = x * 4;
        imageData.data[pixelIdx++] = r;
        imageData.data[pixelIdx++] = g;
        imageData.data[pixelIdx++] = b;
        imageData.data[pixelIdx++] = 255;
    }

    // Add the image data to the canvas
    for (let y = 0; y < height; y++) {
        ctx.putImageData(imageData, 0, y);
    }
}

// Updates the canvas
export function changeCanvas() {
    drawEscapeFractal(options);
}

// Initialize scripts and listeners on load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize color palette and drawing
    updateColorPalette(options.color, false);
    drawEscapeFractal(options);

    // Change escape fractal
    const escapeFractalsInput = document.getElementById('escapeFractalsInput');
    escapeFractalsInput.addEventListener('click', ({ target }) =>
        changeEscapeFractal(target, options)
    );

    // Change zoom
    const zoomInput = document.getElementById('zoomInput');
    zoomInput.addEventListener('click', ({ target }) =>
        changeZoom(target, options)
    );
    zoomInput.addEventListener('change', ({ target }) =>
        changeZoom(target, options)
    );
    // Change d power
    const dInput = document.getElementById('dInput');
    dInput.addEventListener('click', ({ target }) => changeD(target, options));
    dInput.addEventListener('change', ({ target }) => changeD(target, options));
    // Change complex real part
    const crInput = document.getElementById('crInput');
    crInput.addEventListener('click', ({ target }) =>
        changeCR(target, options)
    );
    crInput.addEventListener('change', ({ target }) =>
        changeCR(target, options)
    );
    // Change complex imaginary part
    const ciInput = document.getElementById('ciInput');
    ciInput.addEventListener('click', ({ target }) =>
        changeCI(target, options)
    );
    ciInput.addEventListener('change', ({ target }) =>
        changeCI(target, options)
    );
    // Change x-offset
    const xInput = document.getElementById('xInput');
    xInput.addEventListener('click', ({ target }) => changeX(target, options));
    xInput.addEventListener('change', ({ target }) => changeX(target, options));
    // Change y-offset
    const yInput = document.getElementById('yInput');
    yInput.addEventListener('click', ({ target }) => changeY(target, options));
    yInput.addEventListener('change', ({ target }) => changeY(target, options));
    // Change maximum iterations
    const iterationsInput = document.getElementById('iterationsInput');
    iterationsInput.addEventListener('click', ({ target }) =>
        changeIterations(target, options)
    );
    iterationsInput.addEventListener('change', ({ target }) =>
        changeIterations(target, options)
    );
    // Draw or reset buttons
    const drawGroup = document.getElementById('drawGroup');
    drawGroup.addEventListener('click', ({ target }) =>
        clickDrawGroup(target, options)
    );
    // Toggle gradient loop
    const juliaToggle = document.getElementById('juliaToggle');
    juliaToggle.addEventListener('change', ({ target }) =>
        toggleJuliaSet(target, options)
    );
    // Click on canvas to zoom in and pan gradually to that point
    const canvas = document.getElementById('canvas');
    canvas.addEventListener('click', ({ target, clientX, clientY }) => {
        clickZoom(target, clientX, clientY, options);
    });
    // Change coloring methods
    const colorMethodInput = document.getElementById('colorMethod');
    colorMethodInput.addEventListener('change', ({ target }) =>
        changeColorMethod(target, options)
    );
    // Toggle gradient loop
    const gradientLoopInput = document.getElementById('gradientLoop');
    gradientLoopInput.addEventListener('change', ({ target }) =>
        toggleGradientLoop(target, options)
    );
    // Change color preset
    const colorPresetsInput = document.getElementById('colorPresetsInput');
    colorPresetsInput.addEventListener('click', ({ target }) =>
        changeColorPreset(target, options)
    );
    // Toggle gradient loop
    const autoDrawInput = document.getElementById('autoDraw');
    autoDrawInput.addEventListener('change', ({ target }) =>
        toggleAutoDraw(target)
    );
    // Get values from RGB range and update color palette
    const rgbRange = document.getElementById('rgbRange');
    rgbRange.addEventListener('change', ({ target }) =>
        changeRGB(target, options)
    );
    // Everytime update to input is made, redraw
    document.body.addEventListener('change', changeCanvas);
});

// Camera Tools for keys
document.addEventListener('keydown', ({ key }) => {
    /**
     * wasd to move, z and x to zoom in/out respectively,
     * n and m to decrease/increase iterations respectively,
     * r to restart
     */
    switch (key) {
        case 'w':
            options.offsetY += 25;
            break;
        case 'a':
            options.offsetX -= 25;
            break;
        case 's':
            options.offsetY -= 25;
            break;
        case 'd':
            options.offsetX += 25;
            break;
        case 'z':
            options.zoom *= 1.15;
            options.offsetX *= 1.15;
            options.offsetY *= 1.15;
            break;
        case 'x':
            options.zoom /= 1.15;
            options.offsetX /= 1.15;
            options.offsetY /= 1.15;
            break;
        case 'm':
            if (options.maxIterations < 10000) {
                options.maxIterations += 100;
            }
            break;
        case 'n':
            if (options.maxIterations > 100) {
                options.maxIterations -= 100;
            }
            break;
        case 'r':
            options.zoom = 1;
            options.offsetX = 0;
            options.offsetY = 0;
            options.maxIterations = 100;
            options.d = 2;
            if (options.cr && options.ci) {
                options.cr = -0.70176;
                options.ci = 0.3842;
            }
            break;
        default:
            return;
    }

    // Update values
    const zoomInput = document.querySelector('#zoomInput > form > input');
    const dInput = document.querySelector('#dInput > form > input');
    const crInput = document.querySelector('#crInput > form > input');
    const ciInput = document.querySelector('#ciInput > form > input');
    const xInput = document.querySelector('#xInput > form > input');
    const yInput = document.querySelector('#yInput > form > input');
    const iterationsInput = document.querySelector(
        '#iterationsInput > form > input'
    );
    zoomInput.value = options.zoom;
    dInput.value = options.d;
    xInput.value = options.offsetX;
    yInput.value = options.offsetY;
    iterationsInput.value = options.maxIterations;
    if (options.cr && options.ci) {
        crInput.value = options.cr;
        ciInput.value = options.ci;
    }
    drawEscapeFractal(options);
});
