import { _graphic_canvas, _graphic_sizePX } from "./Graphic.js";
import * as Graphics from "./Graphic.js";
import { addBranchesToGrowingFaces, addFacesToGrowingBranches } from "./SnowflakeObject.js";
import * as Snowflakes from "./SnowflakeObject.js";
import * as Branches from "./Branch.js";
import * as Faces from "./Face.js";
import { doNothing, fracPart, growthTypeBranching, interpretGrowth } from "../common/Utils.js";
import { isSome, mapSome, none } from "maybe-either/Maybe";
import * as Maybes from "maybe-either/Maybe";
import * as RGBA from "../common/color/Color.js";
import * as ColorThemes from "../common/color/Theme.js";
export const _growthInput = 0;
export const _graphic = 1;
export const _snowflake = 2;
export const _currentGrowthType = 3;
export const _idealMSBetweenUpdates = 4;
export const _growing = 5;
export const _hasScheduledUpdate = 6;
export const _colorTheme = 7;
export const _isLightTheme = 8;
export const _updateCount = 9;
export const _currentMS = 10;
export const _updateBank = 11;
export const _maxUpdates = 12;
export const _resetStartTime = 13;
export const _playing = 14;
export const _finishedGrowingCallback = 15;
export const _needsReset = 16;
export const _resetCallback = 17;
export const _updatedCallback = 18;
export const _updateOnNextFrame = 19;
export const _doUpdate = 20;
const currentThemeForegroundRGBAString = (state) => {
    if (state[_isLightTheme]) {
        return RGBA.toString(state[_colorTheme].light.foreground);
    }
    return RGBA.toString(state[_colorTheme].dark.foreground);
};
export const reset = (state) => {
    state[_needsReset] = true;
    state[_currentMS] = performance.now();
    state[_resetStartTime] = performance.now();
    if (state[_playing]) {
        scheduleUpdate(state);
    }
    else {
        doReset(state);
    }
};
export const setSnowflakeCanvasSizePX = (state, snowflakeCanvasSizePX) => {
    mapSome(state[_graphic], g => {
        g[_graphic_sizePX] = snowflakeCanvasSizePX;
        const c = g[_graphic_canvas];
        c.width = snowflakeCanvasSizePX;
        c.height = snowflakeCanvasSizePX;
        const cstyle = c.style;
        cstyle.width = `${snowflakeCanvasSizePX}px`;
        cstyle.height = `${snowflakeCanvasSizePX}px`;
    });
    return isSome(state[_graphic]);
};
export const initializeGraphic = (state, snowflakeCanvasSizePX) => {
    return Maybes.orElse(state[_graphic], () => {
        state[_graphic] = Graphics.make(snowflakeCanvasSizePX);
        return state[_graphic];
    });
};
export const scheduleUpdate = (state) => {
    if (state[_hasScheduledUpdate]) {
        return;
    }
    else if (state[_growing] && state[_playing] || state[_needsReset]) {
        state[_hasScheduledUpdate] = true;
        setTimeout(state[_updateOnNextFrame], state[_idealMSBetweenUpdates]);
    }
    else {
        state[_hasScheduledUpdate] = false;
    }
};
export const setIdealMSBetweenUpdates = (state, targetGrowthTimeMS, upsCap) => {
    state[_idealMSBetweenUpdates] = Math.max(1000 / upsCap, targetGrowthTimeMS / state[_maxUpdates]);
};
export const zero = () => {
    // These defaults are overwritten in Controller which synchronizes
    // this state with the default Config. It's the values in the 
    // default Config that matter.
    const growthInput = [0];
    const graphic = none;
    const snowflake = Snowflakes.zero();
    const currentGrowthType = undefined;
    const idealMSBetweenUpdates = 0;
    const growing = true;
    const hasScheduledUpdate = false;
    const colorTheme = ColorThemes.zero();
    const isLightTheme = true;
    const updateCount = 0;
    const currentMS = 0;
    const updateBank = 0;
    const maxUpdates = 500;
    const resetStartTime = performance.now();
    const playing = true;
    const finishedGrowingCallback = doNothing;
    const needsReset = false;
    const resetCallback = doNothing;
    const updatedCallback = doNothing;
    const updateOnNextFrame = doNothing;
    const doUpdate = doNothing;
    const result = [
        growthInput,
        graphic,
        snowflake,
        currentGrowthType,
        idealMSBetweenUpdates,
        growing,
        hasScheduledUpdate,
        colorTheme,
        isLightTheme,
        updateCount,
        currentMS,
        updateBank,
        maxUpdates,
        resetStartTime,
        playing,
        finishedGrowingCallback,
        needsReset,
        resetCallback,
        updatedCallback,
        updateOnNextFrame,
        doUpdate,
    ];
    result[_updateOnNextFrame] = () => { requestAnimationFrame(result[_doUpdate]); };
    result[_doUpdate] = () => {
        update(result);
        result[_hasScheduledUpdate] = false;
        scheduleUpdate(result);
    };
    scheduleUpdate(result);
    return result;
};
export const percentGrown = (state) => {
    return state[_updateCount] / state[_maxUpdates];
};
const doReset = (state) => {
    state[_needsReset] = false;
    Snowflakes.zeroM(state[_snowflake]);
    state[_currentGrowthType] = undefined;
    state[_growing] = true;
    state[_updateBank] = 0;
    state[_updateCount] = 0;
    mapSome(state[_graphic], g => Graphics.clear(g));
    state[_resetCallback]();
};
export const update = (state) => {
    const snowflake = state[_snowflake];
    if (state[_needsReset]) {
        doReset(state);
    }
    const lastMS = state[_currentMS];
    state[_currentMS] = performance.now();
    const deltaMS = state[_currentMS] - lastMS;
    let requiredUpdates = Math.min(state[_maxUpdates] - state[_updateCount], deltaMS / state[_idealMSBetweenUpdates] + state[_updateBank]);
    state[_updateBank] = fracPart(requiredUpdates);
    requiredUpdates = Math.floor(requiredUpdates);
    function doUpdate() {
        const growth = interpretGrowth(state[_growthInput], percentGrown(state));
        if (state[_currentGrowthType] === undefined) {
            state[_currentGrowthType] = growth.growthType;
        }
        if (state[_currentGrowthType] !== growth.growthType) {
            state[_currentGrowthType] = growth.growthType;
            if (state[_currentGrowthType] === growthTypeBranching) {
                addBranchesToGrowingFaces(snowflake);
            }
            else {
                addFacesToGrowingBranches(snowflake);
            }
        }
        Snowflakes.cacheNormalizedSides(snowflake);
        if (state[_currentGrowthType] === growthTypeBranching) {
            Snowflakes.killCoveredBranches(snowflake);
            Snowflakes.forEachGrowingBranch(snowflake, (b, _) => Branches.enlarge(b, growth.scale));
        }
        else {
            Snowflakes.killCoveredFaces(snowflake);
            Snowflakes.forEachGrowingFace(snowflake, (f, fi) => Faces.enlarge(f, fi, growth.scale));
        }
        mapSome(state[_graphic], g => {
            const foregroundColor = currentThemeForegroundRGBAString(state);
            if (Snowflakes.draw(g, snowflake, foregroundColor)) {
                state[_updateCount] = state[_maxUpdates];
                state[_updateBank] = 0;
            }
        });
    }
    const msPer60FPSFrame = 1000 / 60;
    const msBudget = msPer60FPSFrame * 0.9; // Allow for 10% free time so we don't skip frames.
    let currentMS = performance.now();
    let elapsedMS = 0;
    for (let i = 0; i < requiredUpdates && state[_updateCount] < state[_maxUpdates]; ++i) {
        state[_updateCount] += 1;
        doUpdate();
        const newMS = performance.now();
        elapsedMS += newMS - currentMS;
        currentMS = newMS;
        if (elapsedMS > msBudget) {
            state[_updateBank] += requiredUpdates - i;
            break;
        }
    }
    state[_updatedCallback]();
    if (state[_updateCount] >= state[_maxUpdates]) {
        state[_updateCount] = state[_maxUpdates];
        state[_finishedGrowingCallback]();
        state[_growing] = false;
    }
};
//# sourceMappingURL=State.js.map