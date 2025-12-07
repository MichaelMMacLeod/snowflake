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
export const _State_growthInput = 0;
export const _State_graphic = 1;
export const _State_snowflake = 2;
export const _State_currentGrowthType = 3;
export const _State_idealMSBetweenUpdates = 4;
export const _State_growing = 5;
export const _State_hasScheduledUpdate = 6;
export const _State_colorTheme = 7;
export const _State_isLightTheme = 8;
export const _State_updateCount = 9;
export const _State_currentMS = 10;
export const _State_updateBank = 11;
export const _State_maxUpdates = 12;
export const _State_resetStartTime = 13;
export const _State_playing = 14;
export const _State_finishedGrowingCallback = 15;
export const _State_needsReset = 16;
export const _State_resetCallback = 17;
export const _State_updatedCallback = 18;
export const _State_updateOnNextFrame = 19;
export const _State_doUpdate = 20;
const currentThemeForegroundRGBAString = (state) => {
    if (state[_State_isLightTheme]) {
        return RGBA.toString(state[_State_colorTheme].light.foreground);
    }
    return RGBA.toString(state[_State_colorTheme].dark.foreground);
};
export const reset = (state) => {
    state[_State_needsReset] = true;
    state[_State_currentMS] = performance.now();
    state[_State_resetStartTime] = performance.now();
    if (state[_State_playing]) {
        scheduleUpdate(state);
    }
    else {
        doReset(state);
    }
};
export const setSnowflakeCanvasSizePX = (state, snowflakeCanvasSizePX) => {
    mapSome(state[_State_graphic], g => {
        g[_graphic_sizePX] = snowflakeCanvasSizePX;
        const c = g[_graphic_canvas];
        c.width = snowflakeCanvasSizePX;
        c.height = snowflakeCanvasSizePX;
        const cstyle = c.style;
        cstyle.width = `${snowflakeCanvasSizePX}px`;
        cstyle.height = `${snowflakeCanvasSizePX}px`;
    });
    return isSome(state[_State_graphic]);
};
export const initializeGraphic = (state, snowflakeCanvasSizePX) => {
    return Maybes.orElse(state[_State_graphic], () => {
        state[_State_graphic] = Graphics.make(snowflakeCanvasSizePX);
        return state[_State_graphic];
    });
};
export const scheduleUpdate = (state) => {
    if (state[_State_hasScheduledUpdate]) {
        return;
    }
    else if (state[_State_growing] && state[_State_playing] || state[_State_needsReset]) {
        state[_State_hasScheduledUpdate] = true;
        setTimeout(state[_State_updateOnNextFrame], state[_State_idealMSBetweenUpdates]);
    }
    else {
        state[_State_hasScheduledUpdate] = false;
    }
};
export const setIdealMSBetweenUpdates = (state, targetGrowthTimeMS, upsCap) => {
    state[_State_idealMSBetweenUpdates] = Math.max(1000 / upsCap, targetGrowthTimeMS / state[_State_maxUpdates]);
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
    result[_State_updateOnNextFrame] = () => { requestAnimationFrame(result[_State_doUpdate]); };
    result[_State_doUpdate] = () => {
        update(result);
        result[_State_hasScheduledUpdate] = false;
        scheduleUpdate(result);
    };
    scheduleUpdate(result);
    return result;
};
export const percentGrown = (state) => {
    return state[_State_updateCount] / state[_State_maxUpdates];
};
const doReset = (state) => {
    state[_State_needsReset] = false;
    Snowflakes.zeroM(state[_State_snowflake]);
    state[_State_currentGrowthType] = undefined;
    state[_State_growing] = true;
    state[_State_updateBank] = 0;
    state[_State_updateCount] = 0;
    mapSome(state[_State_graphic], g => Graphics.clear(g));
    state[_State_resetCallback]();
};
export const update = (state) => {
    const snowflake = state[_State_snowflake];
    if (state[_State_needsReset]) {
        doReset(state);
    }
    const lastMS = state[_State_currentMS];
    state[_State_currentMS] = performance.now();
    const deltaMS = state[_State_currentMS] - lastMS;
    let requiredUpdates = Math.min(state[_State_maxUpdates] - state[_State_updateCount], deltaMS / state[_State_idealMSBetweenUpdates] + state[_State_updateBank]);
    state[_State_updateBank] = fracPart(requiredUpdates);
    requiredUpdates = Math.floor(requiredUpdates);
    function doUpdate() {
        const growth = interpretGrowth(state[_State_growthInput], percentGrown(state));
        if (state[_State_currentGrowthType] === undefined) {
            state[_State_currentGrowthType] = growth.growthType;
        }
        if (state[_State_currentGrowthType] !== growth.growthType) {
            state[_State_currentGrowthType] = growth.growthType;
            if (state[_State_currentGrowthType] === growthTypeBranching) {
                addBranchesToGrowingFaces(snowflake);
            }
            else {
                addFacesToGrowingBranches(snowflake);
            }
        }
        Snowflakes.cacheNormalizedSides(snowflake);
        if (state[_State_currentGrowthType] === growthTypeBranching) {
            Snowflakes.killCoveredBranches(snowflake);
            Snowflakes.forEachGrowingBranch(snowflake, (b, _) => Branches.enlarge(b, growth.scale));
        }
        else {
            Snowflakes.killCoveredFaces(snowflake);
            Snowflakes.forEachGrowingFace(snowflake, (f, fi) => Faces.enlarge(f, fi, growth.scale));
        }
        mapSome(state[_State_graphic], g => {
            const foregroundColor = currentThemeForegroundRGBAString(state);
            if (Snowflakes.draw(g, snowflake, foregroundColor)) {
                state[_State_updateCount] = state[_State_maxUpdates];
                state[_State_updateBank] = 0;
            }
        });
    }
    const msPer60FPSFrame = 1000 / 60;
    const msBudget = msPer60FPSFrame * 0.9; // Allow for 10% free time so we don't skip frames.
    let currentMS = performance.now();
    let elapsedMS = 0;
    for (let i = 0; i < requiredUpdates && state[_State_updateCount] < state[_State_maxUpdates]; ++i) {
        state[_State_updateCount] += 1;
        doUpdate();
        const newMS = performance.now();
        elapsedMS += newMS - currentMS;
        currentMS = newMS;
        if (elapsedMS > msBudget) {
            state[_State_updateBank] += requiredUpdates - i;
            break;
        }
    }
    state[_State_updatedCallback]();
    if (state[_State_updateCount] >= state[_State_maxUpdates]) {
        state[_State_updateCount] = state[_State_maxUpdates];
        state[_State_finishedGrowingCallback]();
        state[_State_growing] = false;
    }
};
//# sourceMappingURL=State.js.map