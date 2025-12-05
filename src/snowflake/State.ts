import { _graphic_canvas, _graphic_ctx, _graphic_sizePX, Graphic } from "./Graphic.js";
import * as Graphics from "./Graphic.js";
import { addBranchesToGrowingFaces, addFacesToGrowingBranches, Snowflake } from "./SnowflakeObject.js";
import * as Snowflakes from "./SnowflakeObject.js";
import * as Branches from "./Branch.js";
import * as Faces from "./Face.js";
import { fracPart, GrowthType, interpretGrowth, NonEmptyArray } from "../common/Utils.js";
import { isSome, mapSome, Maybe, none } from "maybe-either/Maybe";
import * as Maybes from "maybe-either/Maybe";
import * as RGBA from "../common/color/Color.js";
import * as ColorThemes from "../common/color/Theme.js";
import { ColorTheme } from "../common/color/Theme.js";

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

export type State = {
    [_growthInput]: NonEmptyArray<number>,
    [_graphic]: Maybe<Graphic>,
    [_snowflake]: Snowflake,
    [_currentGrowthType]: GrowthType | undefined,
    [_idealMSBetweenUpdates]: number,
    [_growing]: boolean,
    [_hasScheduledUpdate]: boolean,
    [_colorTheme]: ColorTheme,
    [_isLightTheme]: boolean,

    // Running total number of updates since last reset.
    [_updateCount]: number,

    // Current time as of the start of the last update.
    [_currentMS]: number,

    // The interval that the update function is called at is not
    // completely under our control. It may be called sooner or later
    // than we require. Because of this, we may calculate that we need to
    // do a fractional number of updates in a single call to update. For
    // example, we could calculate that we need to do 2.5 updates. To avoid
    // doing 'fractional updates', we instead simply perform 2 whole updates,
    // store the 0.5 in this 'updateBank', and then include the 'updateBank'
    // value in our future calculations.
    //
    // If we were to throw away these fractional updates, we would skip over
    // required updates which would slow down the growth of the snowflake,
    // throwing us off our desired time-to-grown.
    [_updateBank]: number,

    [_maxUpdates]: number,
    [_resetStartTime]: number,
    [_playing]: boolean,
    [_finishedGrowingCallback]: () => void,
    [_needsReset]: boolean,
    [_resetCallback]: () => void,
    [_updatedCallback]: () => void,
    [_updateOnNextFrame]: () => void,
    [_doUpdate]: () => void,
};

const currentThemeForegroundRGBAString = (state: State): string => {
    if (state[_isLightTheme]) {
        return RGBA.toString(state[_colorTheme].light.foreground);
    }
    return RGBA.toString(state[_colorTheme].dark.foreground);
}

export const reset = (state: State): void => {
    state[_needsReset] = true;
    state[_currentMS] = performance.now();
    state[_resetStartTime] = performance.now();
    if (state[_playing]) {
        scheduleUpdate(state);
    } else {
        doReset(state);
    }
}

export const setSnowflakeCanvasSizePX = (state: State, snowflakeCanvasSizePX: number): boolean => {
    mapSome(state[_graphic], g => {
        g[_graphic_sizePX] = snowflakeCanvasSizePX;
        const ctxc = g[_graphic_ctx].canvas;
        ctxc.width = snowflakeCanvasSizePX;
        ctxc.height = snowflakeCanvasSizePX;
        const cstyle = g[_graphic_canvas].style;
        cstyle.width = `${snowflakeCanvasSizePX}px`;
        cstyle.height = `${snowflakeCanvasSizePX}px`;
    });
    return isSome(state[_graphic]);
}

export const initializeGraphic = (state: State, snowflakeCanvasSizePX: number): Maybe<Graphic> => {
    return Maybes.orElse(state[_graphic], () => {
        state[_graphic] = Graphics.make(snowflakeCanvasSizePX);
        return state[_graphic];
    });
}

export const scheduleUpdate = (state: State): void => {
    if (state[_hasScheduledUpdate]) {
        return;
    } else if (state[_growing] && state[_playing] || state[_needsReset]) {
        state[_hasScheduledUpdate] = true;
        setTimeout(state[_updateOnNextFrame], state[_idealMSBetweenUpdates]);
    } else {
        state[_hasScheduledUpdate] = false;
    }
}

export const setIdealMSBetweenUpdates = (state: State, targetGrowthTimeMS: number, upsCap: number): void => {
    state[_idealMSBetweenUpdates] = Math.max(1000 / upsCap, targetGrowthTimeMS / state[_maxUpdates]);
}

export const zero = (): State => {
    // These defaults are overwritten in Controller which synchronizes
    // this state with the default Config. It's the values in the 
    // default Config that matter.

    const doNothing = () => { return; };

    const growthInput: NonEmptyArray<number> = [0];
    const graphic: Maybe<Graphic> = none;
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
    const playing = false;
    const finishedGrowingCallback = () => doNothing;
    const needsReset = false;
    const resetCallback = () => doNothing;
    const updatedCallback = () => doNothing;
    const updateOnNextFrame = () => doNothing;
    const doUpdate = doNothing;

    const result: State = [
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
}

export const percentGrown = (state: State): number => {
    return state[_updateCount] / state[_maxUpdates];
}

const doReset = (state: State): void => {
    state[_needsReset] = false;
    Snowflakes.zeroM(state[_snowflake]);
    state[_currentGrowthType] = undefined;
    state[_growing] = true;
    state[_updateBank] = 0;
    state[_updateCount] = 0;
    mapSome(state[_graphic], g => Graphics.clear(g));
    state[_resetCallback]();
}

export const update = (state: State): void => {
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
            if (state[_currentGrowthType] === 'branching') {
                addBranchesToGrowingFaces(snowflake);
            } else {
                addFacesToGrowingBranches(snowflake);
            }
        }

        Snowflakes.cacheNormalizedSides(snowflake);

        if (state[_currentGrowthType] === 'branching') {
            Snowflakes.killCoveredBranches(snowflake);
            Snowflakes.forEachGrowingBranch(snowflake, (b, _) => Branches.enlarge(b, growth.scale));
        } else {
            Snowflakes.killCoveredFaces(snowflake);
            Snowflakes.forEachGrowingFace(snowflake, (f, _) => Faces.enlarge(f, growth.scale));
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
}