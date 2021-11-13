import { iterationColoring, smoothColoring, colorPresets } from './coloring.js';
import { changeCanvas, updateColorPalette } from './index.js';

// Chooses coloring method based on radio selection
export function changeColorMethod(target, options) {
    const { value } = target;

    if (value === 'iteration') {
        options.colorMethod = iterationColoring;
    } else if (value === 'smooth') {
        options.colorMethod = smoothColoring;
    } else {
        return;
    }
}

// Updates color palette with chosen preset and updates inputs
export function changeColorPreset(target, options) {
    const { name } = target;
    const colorPreset = colorPresets[name];

    if (colorPreset) {
        const redRange = document.getElementById('redRange');
        const greenRange = document.getElementById('greenRange');
        const blueRange = document.getElementById('blueRange');
        const gradientLoopInput = document.getElementById('gradientLoop');
        redRange.value = colorPreset[0].r;
        greenRange.value = colorPreset[0].g;
        blueRange.value = colorPreset[0].b;
        gradientLoopInput.checked = colorPreset[1];
        updateColorPalette(...colorPreset);
        options.color = colorPreset[0];
    }
    document.body.dispatchEvent(new Event('change'));
}

// Toggles gradient loop
export function toggleGradientLoop(target, options) {
    const { checked } = target;
    const { color } = options;
    updateColorPalette(color, checked);
}

// Change the RGB factors/shifts for the color palette
export function changeRGB(target, options) {
    const { id, valueAsNumber } = target;
    const { color } = options;

    switch (id) {
        case 'redRange':
            color.r = valueAsNumber;
            break;
        case 'greenRange':
            color.g = valueAsNumber;
            break;
        case 'blueRange':
            color.b = valueAsNumber;
            break;
        default:
            return;
    }

    // Update the color palette
    updateColorPalette(color, document.getElementById('gradientLoop').checked);
}

// Toggles auto draw
export function toggleAutoDraw({ checked }) {
    checked
        ? document.body.addEventListener('change', changeCanvas)
        : document.body.removeEventListener('change', changeCanvas);
}
