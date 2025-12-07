import { parseSnowflakeID } from "../common/Config.js";
import { _colorTheme, _finishedGrowingCallback, _growthInput, _maxUpdates, _resetCallback, _updatedCallback, scheduleUpdate, setIdealMSBetweenUpdates, setSnowflakeCanvasSizePX } from "./State.js";
import * as States from './State.js';
import { doNothing } from "../common/Utils.js";
import * as ColorThemes from "../common/color/Theme.js";
import { getLeft, mapRight, right } from "maybe-either/Either";
export const _Cfg_snowflakeID = 0;
export const _Cfg_snowflakeCanvasSizePX = 1;
export const _Cfg_targetGrowthTimeMS = 2;
export const _Cfg_upsCap = 3;
export const _Cfg_maxUpdates = 4;
export const _Cfg_playing = 5;
export const _Cfg_colorTheme = 6;
export const _Cfg_isLightTheme = 7;
export const _Cfg_finishedGrowingCallback = 8;
export const _Cfg_resetCallback = 9;
export const _Cfg_updatedCallback = 10;
const cfgKeys = [
    _Cfg_snowflakeID,
    _Cfg_snowflakeCanvasSizePX,
    _Cfg_targetGrowthTimeMS,
    _Cfg_upsCap,
    _Cfg_maxUpdates,
    _Cfg_playing,
    _Cfg_colorTheme,
    _Cfg_isLightTheme,
    _Cfg_finishedGrowingCallback,
    _Cfg_resetCallback,
    _Cfg_updatedCallback,
];
const resetRequred = true;
const resetUnecessary = false;
const defaultSnowflakeID = '13925257291';
const defaultSnowflakeCanvasSizePX = 800;
const defaultTargetGrowthTimeMS = 8000;
const defaultUpsCap = 100000000;
const defaultMaxUpdates = 500;
const defaultPlaying = true;
const defaultColorTheme = ColorThemes.zero();
const defaultIsLightTheme = true;
const defaultFinishedGrowingCallback = doNothing;
const defaultResetCallback = doNothing;
const defaultUpdatedCallback = doNothing;
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
    if (oldValue === newValue) {
        return right(resetUnecessary);
    }
    return mapRight(parseSnowflakeID(newValue), r => {
        state[_growthInput] = r;
        return resetRequred;
    });
};
const cfgSnowflakeCanvasSizePX = (_cfg, state, oldValue, newValue) => {
    if (newValue !== oldValue) {
        return right(setSnowflakeCanvasSizePX(state, newValue));
    }
    return right(resetUnecessary);
};
const cfgTargetGrowthTimeMS = (cfg, state, _oldValue, newValue) => {
    setIdealMSBetweenUpdates(state, newValue, cfgGetOrDefault(cfg, _Cfg_upsCap));
    return right(resetUnecessary);
};
const cfgUPSCap = (cfg, state, _oldValue, newValue) => {
    setIdealMSBetweenUpdates(state, cfgGetOrDefault(cfg, _Cfg_targetGrowthTimeMS), newValue);
    return right(resetUnecessary);
};
const cfgMaxUpdates = (_cfg, state, oldValue, newValue) => {
    if (newValue !== oldValue) {
        state[_maxUpdates] = newValue;
        return right(resetRequred);
    }
    return right(resetUnecessary);
};
const cfgPlaying = (_cfg, state, oldValue, newValue) => {
    if (newValue !== oldValue) {
        state[States._playing] = newValue;
        state[States._currentMS] = performance.now();
        scheduleUpdate(state);
    }
    return right(resetUnecessary);
};
const cfgColorTheme = (_cfg, state, oldValue, newValue) => {
    if (ColorThemes.equals(newValue, oldValue)) {
        return right(resetUnecessary);
    }
    state[_colorTheme] = newValue;
    return right(resetRequred);
};
const cfgIsLightTheme = (_cfg, state, oldValue, newValue) => {
    if (newValue === oldValue) {
        return right(false);
    }
    state[States._isLightTheme] = newValue;
    return right(true);
};
const cfgFinishedGrowingCallback = (_cfg, state, _oldValue, newValue) => {
    state[_finishedGrowingCallback] = newValue;
    return right(false);
};
const cfgResetCallback = (_cfg, state, _oldValue, newValue) => {
    state[_resetCallback] = newValue;
    return right(false);
};
const cfgUpdatedCallback = (_cfg, state, _oldValue, newValue) => {
    state[_updatedCallback] = newValue;
    return right(false);
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
export const createDefaultState = () => {
    const state = States.zero();
    cfgKeys.forEach(key => {
        configure(defaultConfig, state, key, defaultConfig[key]);
    });
    return state;
};
//# sourceMappingURL=Config.js.map