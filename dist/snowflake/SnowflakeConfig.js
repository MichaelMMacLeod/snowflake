import { copySnowflakeID, } from "../common/SnowflakeID.js";
import { _State_currentMS, _State_snowflakeID, scheduleUpdate, setIdealMSBetweenUpdates, setSnowflakeCanvasSizePX } from "./State.js";
import * as States from './State.js';
import { arraysEqual, doNothing } from "../common/Utils.js";
import * as ColorThemes from "../common/ColorScheme.js";
import { getLeft, mapRight, right } from "maybe-either/Either";
import * as SnowflakeIDs from "../common/SnowflakeID.js";
export const _SnowflakeConfig_snowflakeID = 0;
export const _SnowflakeConfig_snowflakeCanvasSizePX = 1;
export const _SnowflakeConfig_targetGrowthTimeMS = 2;
export const _SnowflakeConfig_upsCap = 3;
export const _SnowflakeConfig_maxUpdates = 4;
export const _SnowflakeConfig_playing = 5;
export const _SnowflakeConfig_colorScheme = 6;
export const _SnowflakeConfig_isLightTheme = 7;
export const _SnowflakeConfig_finishedGrowingCallback = 8;
export const _SnowflakeConfig_resetCallback = 9;
export const _SnowflakeConfig_updatedCallback = 10;
const cfgKeys = [
    _SnowflakeConfig_snowflakeID,
    _SnowflakeConfig_snowflakeCanvasSizePX,
    _SnowflakeConfig_targetGrowthTimeMS,
    _SnowflakeConfig_upsCap,
    _SnowflakeConfig_maxUpdates,
    _SnowflakeConfig_playing,
    _SnowflakeConfig_colorScheme,
    _SnowflakeConfig_isLightTheme,
    _SnowflakeConfig_finishedGrowingCallback,
    _SnowflakeConfig_resetCallback,
    _SnowflakeConfig_updatedCallback,
];
const resetRequred = true;
const resetUnecessary = false;
export const defaultSnowflakeID = SnowflakeIDs.getDefaultSnowflakeID();
export const defaultSnowflakeCanvasSizePX = 800;
export const defaultTargetGrowthTimeMS = 8000;
export const defaultUpsCap = 100000000;
export const defaultMaxUpdates = 500;
export const defaultPlaying = true;
export const defaultColorTheme = ColorThemes.zero();
export const defaultIsLightTheme = true;
export const defaultFinishedGrowingCallback = doNothing;
export const defaultResetCallback = doNothing;
export const defaultUpdatedCallback = doNothing;
export const defaultConfig = Object.freeze([
    defaultSnowflakeID,
    defaultSnowflakeCanvasSizePX,
    defaultTargetGrowthTimeMS,
    defaultUpsCap,
    defaultMaxUpdates,
    defaultPlaying,
    defaultColorTheme,
    defaultIsLightTheme,
    defaultFinishedGrowingCallback,
    defaultResetCallback,
    defaultUpdatedCallback,
]);
const cfgGetOrDefault = (cfg, key) => {
    const value = cfg[key];
    if (value !== undefined) {
        return value;
    }
    return defaultConfig[key];
};
const cfgSnowflakeID = (_cfg, state, oldValue, newValue) => {
    if (oldValue === newValue || arraysEqual(oldValue, newValue, (v1, v2) => v1 === v2)) {
        return right(resetUnecessary);
    }
    state[_State_snowflakeID] = copySnowflakeID(newValue);
    return right(resetRequred);
};
const cfgSnowflakeCanvasSizePX = (_cfg, state, oldValue, newValue) => {
    if (newValue !== oldValue) {
        return right(setSnowflakeCanvasSizePX(state, newValue));
    }
    return right(resetUnecessary);
};
const cfgTargetGrowthTimeMS = (cfg, state, _oldValue, newValue) => {
    setIdealMSBetweenUpdates(state, newValue, cfgGetOrDefault(cfg, _SnowflakeConfig_upsCap));
    return right(resetUnecessary);
};
const cfgUPSCap = (cfg, state, _oldValue, newValue) => {
    setIdealMSBetweenUpdates(state, cfgGetOrDefault(cfg, _SnowflakeConfig_targetGrowthTimeMS), newValue);
    return right(resetUnecessary);
};
const cfgMaxUpdates = (_cfg, _state, _oldValue, _newValue) => {
    return right(resetUnecessary);
};
const cfgPlaying = (_cfg, state, oldValue, newValue) => {
    if (newValue !== oldValue) {
        state[_State_currentMS] = performance.now();
        scheduleUpdate(state);
    }
    return right(resetUnecessary);
};
const cfgColorTheme = (_cfg, _state, oldValue, newValue) => {
    if (ColorThemes.equals(newValue, oldValue)) {
        return right(resetUnecessary);
    }
    return right(resetRequred);
};
const cfgIsLightTheme = (_cfg, _state, oldValue, newValue) => {
    if (newValue === oldValue) {
        return right(resetUnecessary);
    }
    return right(resetRequred);
};
const cfgFinishedGrowingCallback = (_cfg, _state, _oldValue, _newValue) => {
    return right(resetUnecessary);
};
const cfgResetCallback = (_cfg, _state, _oldValue, _newValue) => {
    return right(resetUnecessary);
};
const cfgUpdatedCallback = (_cfg, _state, _oldValue, _newValue) => {
    return right(resetUnecessary);
};
const cfgFunctions = [
    cfgSnowflakeID,
    cfgSnowflakeCanvasSizePX,
    cfgTargetGrowthTimeMS,
    cfgUPSCap,
    cfgMaxUpdates,
    cfgPlaying,
    cfgColorTheme,
    cfgIsLightTheme,
    cfgFinishedGrowingCallback,
    cfgResetCallback,
    cfgUpdatedCallback,
];
export const configure = (oldCfg, state, key, value) => {
    const c = cfgFunctions[key](oldCfg, state, cfgGetOrDefault(oldCfg, key), value);
    return getLeft(mapRight(c, resetStatus => {
        if (resetStatus === resetRequred) {
            States.reset(state);
        }
    }));
};
//# sourceMappingURL=SnowflakeConfig.js.map