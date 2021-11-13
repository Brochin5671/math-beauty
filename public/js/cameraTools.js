import {
    mandelbrotSet,
    burningShip,
    tricorn,
    multibrotSet,
} from './algorithms.js';
import { drawEscapeFractal } from './index.js';
import { mapToRange } from './utils.js';

// Changes escape fractal from selection
export function changeEscapeFractal(target, options) {
    const { name } = target;
    const dInput = document.getElementById('dInput');

    switch (name) {
        case 'mandelbrot':
            options.escapeFractal = mandelbrotSet;
            break;
        case 'ship':
            options.escapeFractal = burningShip;
            break;
        case 'tricorn':
            options.escapeFractal = tricorn;
            break;
        case 'multibrot':
            options.escapeFractal = multibrotSet;
            dInput.className = 'btn-group mb-3';
            break;
        default:
            return;
    }

    // Hides dInput when multibrot is not selected and dispatches change event
    if (name !== 'multibrot' && !dInput.className.includes('d-none')) {
        dInput.className = 'btn-group mb-3 d-none';
    }
    document.body.dispatchEvent(new Event('change'));
}

// Changes zoom from input value
export function changeZoom(target, options) {
    const { name, valueAsNumber } = target;

    if (name === 'dec') {
        options.zoom /= 1.1;
        options.offsetX /= 1.1;
        options.offsetY /= 1.1;
    } else if (name === 'inc') {
        options.zoom *= 1.1;
        options.offsetX *= 1.1;
        options.offsetY *= 1.1;
    } else {
        if (!isNaN(valueAsNumber)) {
            options.zoom = valueAsNumber;
        }
        return;
    }

    // Only updates value when inc/dec buttons are pressed and dispatches change event
    const zoomInput = document.querySelector('#zoomInput > form > input');
    const xInput = document.querySelector('#xInput > form > input');
    const yInput = document.querySelector('#yInput > form > input');
    zoomInput.value = options.zoom;
    xInput.value = options.offsetX;
    yInput.value = options.offsetY;
    document.body.dispatchEvent(new Event('change'));
}

// Changes d from input value or buttons
export function changeD(target, options) {
    const { name, valueAsNumber } = target;

    if (name === 'dec') {
        options.d -= 0.25;
    } else if (name === 'inc') {
        options.d += 0.25;
    } else {
        if (!isNaN(valueAsNumber)) {
            options.d = valueAsNumber;
        }
        return;
    }

    // Only updates value when inc/dec buttons are pressed and dispatches change event
    const dInput = document.querySelector('#dInput > form > input');
    dInput.value = options.d;
    document.body.dispatchEvent(new Event('change'));
}

// Changes complex real part from input value or buttons
export function changeCR(target, options) {
    const { name, valueAsNumber } = target;
    const { cr } = options;

    if (name === 'dec') {
        if (cr > -2) {
            options.cr -= 0.25;
        }
    } else if (name === 'inc') {
        if (cr < 2) {
            options.cr += 0.25;
        }
    } else {
        if (
            !isNaN(valueAsNumber) &&
            valueAsNumber <= 2 &&
            valueAsNumber >= -2
        ) {
            options.cr = valueAsNumber;
        }
        return;
    }

    // Only updates value when inc/dec buttons are pressed and dispatches change event
    const crInput = document.querySelector('#crInput > form > input');
    crInput.value = options.cr;
    document.body.dispatchEvent(new Event('change'));
}

// Changes complex imaginary part from input value or buttons
export function changeCI(target, options) {
    const { name, valueAsNumber } = target;
    const { ci } = options;

    if (name === 'dec') {
        if (ci > -2) {
            options.ci -= 0.05;
        }
    } else if (name === 'inc') {
        if (ci < 2) {
            options.ci += 0.05;
        }
    } else {
        if (
            !isNaN(valueAsNumber) &&
            valueAsNumber <= 2 &&
            valueAsNumber >= -2
        ) {
            options.ci = valueAsNumber;
        }
        return;
    }

    // Only updates value when inc/dec buttons are pressed and dispatches change event
    const ciInput = document.querySelector('#ciInput > form > input');
    ciInput.value = options.ci;
    document.body.dispatchEvent(new Event('change'));
}

// Changes x-offset from input value or buttons
export function changeX(target, options) {
    const { name, valueAsNumber } = target;

    if (name === 'dec') {
        options.offsetX -= 25;
    } else if (name === 'inc') {
        options.offsetX += 25;
    } else {
        if (!isNaN(valueAsNumber)) {
            options.offsetX = valueAsNumber;
        }
        return;
    }

    // Only updates value when inc/dec buttons are pressed and dispatches change event
    const xInput = document.querySelector('#xInput > form > input');
    xInput.value = options.offsetX;
    document.body.dispatchEvent(new Event('change'));
}

// Changes y-offset from input value or buttons
export function changeY(target, options) {
    const { name, valueAsNumber } = target;

    if (name === 'dec') {
        options.offsetY -= 25;
    } else if (name === 'inc') {
        options.offsetY += 25;
    } else {
        if (!isNaN(valueAsNumber)) {
            options.offsetY = valueAsNumber;
        }
        return;
    }

    // Only updates value when inc/dec buttons are pressed and dispatches change event
    const yInput = document.querySelector('#yInput > form > input');
    yInput.value = options.offsetY;
    document.body.dispatchEvent(new Event('change'));
}

// Changes maximum iterations from input value or buttons
export function changeIterations(target, options) {
    const { name, valueAsNumber } = target;
    const { maxIterations } = options;

    if (name === 'dec') {
        if (maxIterations > 100) {
            options.maxIterations -= 100;
        }
    } else if (name === 'inc') {
        if (maxIterations < 10000) {
            options.maxIterations += 100;
        }
    } else {
        if (
            !isNaN(valueAsNumber) &&
            valueAsNumber <= 10000 &&
            valueAsNumber >= 100
        ) {
            options.maxIterations = valueAsNumber;
        }
        return;
    }

    // Only updates value when inc/dec buttons are pressed and dispatches change event
    const iterationsInput = document.querySelector(
        '#iterationsInput > form > input'
    );
    iterationsInput.value = options.maxIterations;
    document.body.dispatchEvent(new Event('change'));
}

// Draws or resets the canvas
export function clickDrawGroup(target, options) {
    const { name } = target;

    if (name === 'draw') {
        drawEscapeFractal(options);
    } else if (name === 'reset') {
        resetCameraTools(options);
        document.body.dispatchEvent(new Event('change'));
    } else {
        return;
    }
}

// Toggle Julia set inputs and dispatch change event
export function toggleJuliaSet(target, options) {
    const { checked } = target;
    const crInput = document.getElementById('crInput');
    const ciInput = document.getElementById('ciInput');

    // Display or hide based on toggle and dispatch change event
    if (checked) {
        crInput.className = 'btn-group mb-3';
        ciInput.className = 'btn-group mb-3';
        options.cr = -0.70176;
        options.ci = 0.3842;
    } else {
        crInput.className = 'btn-group mb-3 d-none';
        ciInput.className = 'btn-group mb-3 d-none';
        options.cr = undefined;
        options.ci = undefined;
    }
    document.body.dispatchEvent(new Event('change'));
}

// Resets options and inputs to default
function resetCameraTools(options) {
    // Reset inputs to default
    const zoomInput = document.querySelector('#zoomInput > form > input');
    const dInput = document.querySelector('#dInput > form > input');
    const crInput = document.querySelector('#crInput > form > input');
    const ciInput = document.querySelector('#ciInput > form > input');
    const xInput = document.querySelector('#xInput > form > input');
    const yInput = document.querySelector('#yInput > form > input');
    const iterationsInput = document.querySelector(
        '#iterationsInput > form > input'
    );
    zoomInput.value = 1;
    dInput.value = 2;
    xInput.value = 0;
    yInput.value = 0;
    iterationsInput.value = 100;

    // Reset options to default
    options.zoom = 1;
    options.offsetX = 0;
    options.offsetY = 0;
    options.d = 2;
    options.maxIterations = 100;

    // Reset julia set inputs if defined
    if (options.cr && options.ci) {
        options.cr = -0.70176;
        options.ci = 0.3842;
        crInput.value = options.cr;
        ciInput.value = options.ci;
    }
}

// Zoom in and gradually pan towards point clicked
export function clickZoom(target, clientX, clientY, options) {
    // Get x and y position of clicked point within element and middle being the origin
    const { left, top } = target.getBoundingClientRect();
    const { clientWidth: width, clientHeight: height } = target;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const x = mapToRange(clientX - left, 0, width, -halfWidth, halfWidth);
    const y = mapToRange(clientY - top, 0, height, -halfHeight, halfHeight);

    // Change pan factor based off size of canvas
    const panFactor = width === 320 ? 10 : width === 275 ? 8 : 7;

    // Zoom and slightly move towards clicked point
    options.zoom *= 1.1;
    options.offsetX = (options.offsetX + x / panFactor) * 1.1;
    options.offsetY = (options.offsetY - y / panFactor) * 1.1;

    // Update inputs and dispatch change event
    const zoomInput = document.querySelector('#zoomInput > form > input');
    const xInput = document.querySelector('#xInput > form > input');
    const yInput = document.querySelector('#yInput > form > input');
    zoomInput.value = options.zoom;
    xInput.value = options.offsetX;
    yInput.value = options.offsetY;
    document.body.dispatchEvent(new Event('change'));
}
