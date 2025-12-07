import { _graphic_canvas, _graphic_sizePX, Graphic } from "./Graphic.js";
import * as Graphics from "./Graphic.js";
import { addBranchesToGrowingFaces, addFacesToGrowingBranches, Snowflake } from "./SnowflakeObject.js";
import * as Snowflakes from "./SnowflakeObject.js";
import * as Branches from "./Branch.js";
import * as Faces from "./Face.js";
import { doNothing, fracPart, GrowthType, growthTypeBranching, interpretGrowth, NonEmptyArray } from "../common/Utils.js";
import { isSome, mapSome, Maybe, none } from "maybe-either/Maybe";
import * as Maybes from "maybe-either/Maybe";
import * as RGBA from "../common/color/Color.js";
import {
    _Cfg_colorTheme,
    _Cfg_finishedGrowingCallback,
    _Cfg_isLightTheme,
    _Cfg_maxUpdates,
    _Cfg_playing,
    _Cfg_resetCallback,
    _Cfg_updatedCallback,
    Cfg,
    defaultConfig
} from "./Config.js";

export const _State_growthInput = 0;
export const _State_graphic = 1;
export const _State_snowflake = 2;
export const _State_currentGrowthType = 3;
export const _State_idealMSBetweenUpdates = 4;
export const _State_growing = 5;
export const _State_hasScheduledUpdate = 6;
export const _State_updateCount = 7;
export const _State_currentMS = 8;
export const _State_updateBank = 9;
export const _State_resetStartTime = 10;
export const _State_needsReset = 11;
export const _State_updateOnNextFrame = 12;
export const _State_doUpdate = 13;
export const _State_cfg = 14;

export type State = {
    [_State_growthInput]: NonEmptyArray<number>,
    [_State_graphic]: Maybe<Graphic>,
    [_State_snowflake]: Snowflake,
    [_State_currentGrowthType]: GrowthType | undefined,
    [_State_idealMSBetweenUpdates]: number,
    [_State_growing]: boolean,
    [_State_hasScheduledUpdate]: boolean,

    // Running total number of updates since last reset.
    [_State_updateCount]: number,

    // Current time as of the start of the last update.
    [_State_currentMS]: number,

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
    [_State_updateBank]: number,

    [_State_resetStartTime]: number,
    [_State_needsReset]: boolean,
    [_State_updateOnNextFrame]: () => void,
    [_State_doUpdate]: () => void,
    [_State_cfg]: Cfg,
};

const currentThemeForegroundRGBAString = (state: State): string => {
    const cfg = state[_State_cfg];
    const colorTheme = cfg[_Cfg_colorTheme];
    if (cfg[_Cfg_isLightTheme]) {
        return RGBA.toString(colorTheme.light.foreground);
    }
    return RGBA.toString(colorTheme.dark.foreground);
}

export const reset = (state: State): void => {
    state[_State_needsReset] = true;
    state[_State_currentMS] = performance.now();
    state[_State_resetStartTime] = performance.now();
    if (state[_State_cfg][_Cfg_playing]) {
        scheduleUpdate(state);
    } else {
        doReset(state);
    }
}

export const setSnowflakeCanvasSizePX = (state: State, snowflakeCanvasSizePX: number): boolean => {
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
}

export const initializeGraphic = (state: State, snowflakeCanvasSizePX: number): Maybe<Graphic> => {
    return Maybes.orElse(state[_State_graphic], () => {
        state[_State_graphic] = Graphics.make(snowflakeCanvasSizePX);
        return state[_State_graphic];
    });
}

export const scheduleUpdate = (state: State): void => {
    if (state[_State_hasScheduledUpdate]) {
        return;
    } else {
        const cfg = state[_State_cfg];
        if (state[_State_growing] && cfg[_Cfg_playing] || state[_State_needsReset]) {
            state[_State_hasScheduledUpdate] = true;
            setTimeout(state[_State_updateOnNextFrame], state[_State_idealMSBetweenUpdates]);
        } else {
            state[_State_hasScheduledUpdate] = false;
        }
    }
}

export const setIdealMSBetweenUpdates = (state: State, targetGrowthTimeMS: number, upsCap: number): void => {
    const maxUpdates = state[_State_cfg][_Cfg_maxUpdates];
    state[_State_idealMSBetweenUpdates] = Math.max(1000 / upsCap, targetGrowthTimeMS / maxUpdates);
}

export const zero = (): State => {
    const growthInput: NonEmptyArray<number> = [0];
    const graphic: Maybe<Graphic> = none;
    const snowflake = Snowflakes.zero();
    const currentGrowthType = undefined;
    const idealMSBetweenUpdates = 0;
    const growing = true;
    const hasScheduledUpdate = false;
    const updateCount = 0;
    const currentMS = 0;
    const updateBank = 0;
    const resetStartTime = performance.now();
    const needsReset = false;
    const updateOnNextFrame = doNothing;
    const doUpdate = doNothing;
    const cfg = { ...defaultConfig } /* create non-frozen copy */;

    const result: State = [
        growthInput,
        graphic,
        snowflake,
        currentGrowthType,
        idealMSBetweenUpdates,
        growing,
        hasScheduledUpdate,
        updateCount,
        currentMS,
        updateBank,
        resetStartTime,
        needsReset,
        updateOnNextFrame,
        doUpdate,
        cfg,
    ];

    result[_State_updateOnNextFrame] = () => { requestAnimationFrame(result[_State_doUpdate]); };
    result[_State_doUpdate] = () => {
        update(result);
        result[_State_hasScheduledUpdate] = false;
        scheduleUpdate(result);
    };

    scheduleUpdate(result);

    return result;
}

export const percentGrown = (state: State): number => {
    const maxUpdates = state[_State_cfg][_Cfg_maxUpdates];
    return state[_State_updateCount] / maxUpdates;
}

const doReset = (state: State): void => {
    state[_State_needsReset] = false;
    Snowflakes.zeroM(state[_State_snowflake]);
    state[_State_currentGrowthType] = undefined;
    state[_State_growing] = true;
    state[_State_updateBank] = 0;
    state[_State_updateCount] = 0;
    mapSome(state[_State_graphic], g => Graphics.clear(g));
    state[_State_cfg][_Cfg_resetCallback]();
}

export const update = (state: State): void => {
    const cfg = state[_State_cfg];
    const maxUpdates = cfg[_Cfg_maxUpdates];

    const snowflake = state[_State_snowflake];

    if (state[_State_needsReset]) {
        doReset(state);
    }

    const lastMS = state[_State_currentMS];
    state[_State_currentMS] = performance.now();
    const deltaMS = state[_State_currentMS] - lastMS;

    let requiredUpdates = Math.min(maxUpdates - state[_State_updateCount], deltaMS / state[_State_idealMSBetweenUpdates] + state[_State_updateBank]);
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
            } else {
                addFacesToGrowingBranches(snowflake);
            }
        }

        Snowflakes.cacheNormalizedSides(snowflake);

        if (state[_State_currentGrowthType] === growthTypeBranching) {
            Snowflakes.killCoveredBranches(snowflake);
            Snowflakes.forEachGrowingBranch(snowflake, (b, _) => Branches.enlarge(b, growth.scale));
        } else {
            Snowflakes.killCoveredFaces(snowflake);
            Snowflakes.forEachGrowingFace(snowflake, (f, fi) => Faces.enlarge(f, fi, growth.scale));
        }

        mapSome(state[_State_graphic], g => {
            const foregroundColor = currentThemeForegroundRGBAString(state);
            if (Snowflakes.draw(g, snowflake, foregroundColor)) {
                state[_State_updateCount] = maxUpdates;
                state[_State_updateBank] = 0;
            }
        });
    }

    const msPer60FPSFrame = 1000 / 60;
    const msBudget = msPer60FPSFrame * 0.9; // Allow for 10% free time so we don't skip frames.
    let currentMS = performance.now();
    let elapsedMS = 0;
    for (let i = 0; i < requiredUpdates && state[_State_updateCount] < maxUpdates; ++i) {
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

    cfg[_Cfg_updatedCallback]();

    if (state[_State_updateCount] >= maxUpdates) {
        state[_State_updateCount] = maxUpdates;
        cfg[_Cfg_finishedGrowingCallback]();
        state[_State_growing] = false;
    }
}