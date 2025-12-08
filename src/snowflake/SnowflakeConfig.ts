import {
    copySnowflakeID,
    SnowflakeID,
} from "../common/SnowflakeID.js";
import {
    _State_cfg,
    _State_currentMS,
    _State_snowflakeID,
    scheduleUpdate,
    setIdealMSBetweenUpdates,
    setSnowflakeCanvasSizePX,
    State
} from "./State.js";
import { arraysEqual, doNothing } from "../common/Utils.js";
import * as ColorThemes from "../common/ColorScheme.js";
import { ColorScheme } from "../common/ColorScheme.js";
import * as SnowflakeIDs from "../common/SnowflakeID.js";
import { CfgFunction, CfgFunctionArray, resetRequred, resetUnecessary } from "../common/Config.js";

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

type _SnowflakeConfig_snowflakeID = 0;
type _SnowflakeConfig_snowflakeCanvasSizePX = 1;
type _SnowflakeConfig_targetGrowthTimeMS = 2;
type _SnowflakeConfig_upsCap = 3;
type _SnowflakeConfig_maxUpdates = 4;
type _SnowflakeConfig_playing = 5;
type _SnowflakeConfig_colorScheme = 6;
type _SnowflakeConfig_isLightTheme = 7;
type _SnowflakeConfig_finishedGrowingCallback = 8;
type _SnowflakeConfig_resetCallback = 9;
type _SnowflakeConfig_updatedCallback = 10;

export type SnowflakeConfig = {
    [_SnowflakeConfig_snowflakeID]: SnowflakeID,
    [_SnowflakeConfig_snowflakeCanvasSizePX]: number,
    [_SnowflakeConfig_targetGrowthTimeMS]: number,
    [_SnowflakeConfig_upsCap]: number,
    [_SnowflakeConfig_maxUpdates]: number,
    [_SnowflakeConfig_playing]: boolean,
    [_SnowflakeConfig_colorScheme]: ColorScheme,
    [_SnowflakeConfig_isLightTheme]: boolean,
    [_SnowflakeConfig_finishedGrowingCallback]: () => void,
    [_SnowflakeConfig_resetCallback]: () => void,
    [_SnowflakeConfig_updatedCallback]: () => void,
};

const cfgKeys: Array<keyof SnowflakeConfig> = [
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

export const snowflakeDefaultConfig: Readonly<SnowflakeConfig> = Object.freeze([
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

const cfgGetOrDefault = <K extends keyof SnowflakeConfig>(cfg: SnowflakeConfig, key: K): SnowflakeConfig[K] => {
    const value = cfg[key];
    if (value !== undefined) {
        return value;
    }
    return snowflakeDefaultConfig[key];
}

type SnowflakeCfgFunction<K extends keyof SnowflakeConfig> = CfgFunction<State, SnowflakeConfig, K>;

const cfgSnowflakeID: SnowflakeCfgFunction<_SnowflakeConfig_snowflakeID> = (_cfg, state, oldValue, newValue) => {
    if (oldValue === newValue || arraysEqual(oldValue, newValue, (v1, v2) => v1 === v2)) {
        return resetUnecessary;
    }
    state[_State_snowflakeID] = copySnowflakeID(newValue);
    return resetRequred;
};

const cfgSnowflakeCanvasSizePX: SnowflakeCfgFunction<_SnowflakeConfig_snowflakeCanvasSizePX> = (_cfg, state, oldValue, newValue) => {
    if (newValue !== oldValue) {
        return setSnowflakeCanvasSizePX(state, newValue);
    }
    return resetUnecessary;
};

const cfgTargetGrowthTimeMS: SnowflakeCfgFunction<_SnowflakeConfig_targetGrowthTimeMS> = (cfg, state, _oldValue, newValue) => {
    setIdealMSBetweenUpdates(state, newValue, cfgGetOrDefault(cfg, _SnowflakeConfig_upsCap));
    return resetUnecessary;
};

const cfgUPSCap: SnowflakeCfgFunction<_SnowflakeConfig_upsCap> = (cfg, state, _oldValue, newValue) => {
    setIdealMSBetweenUpdates(state, cfgGetOrDefault(cfg, _SnowflakeConfig_targetGrowthTimeMS), newValue);
    return resetUnecessary;
};

const cfgMaxUpdates: SnowflakeCfgFunction<_SnowflakeConfig_maxUpdates> = (_cfg, _state, _oldValue, _newValue) => {
    return resetUnecessary;
};

const cfgPlaying: SnowflakeCfgFunction<_SnowflakeConfig_playing> = (_cfg, state, oldValue, newValue) => {
    if (newValue !== oldValue) {
        state[_State_currentMS] = performance.now();
        state[_State_cfg][_SnowflakeConfig_playing] = newValue;
        scheduleUpdate(state);
    }
    return resetUnecessary;
};

const cfgColorTheme: SnowflakeCfgFunction<_SnowflakeConfig_colorScheme> = (_cfg, _state, oldValue, newValue) => {
    if (ColorThemes.equals(newValue, oldValue)) {
        return resetUnecessary;
    }
    return resetRequred;
};

const cfgIsLightTheme: SnowflakeCfgFunction<_SnowflakeConfig_isLightTheme> = (_cfg, _state, oldValue, newValue) => {
    if (newValue === oldValue) {
        return resetUnecessary;
    }
    return resetRequred;
};

const cfgFinishedGrowingCallback: SnowflakeCfgFunction<_SnowflakeConfig_finishedGrowingCallback> = (_cfg, _state, _oldValue, _newValue) => {
    return resetUnecessary;
};

const cfgResetCallback: SnowflakeCfgFunction<_SnowflakeConfig_resetCallback> = (_cfg, _state, _oldValue, _newValue) => {
    return resetUnecessary;
};

const cfgUpdatedCallback: SnowflakeCfgFunction<_SnowflakeConfig_updatedCallback> = (_cfg, _state, _oldValue, _newValue) => {
    return resetUnecessary;
};

export const snowflakeCfgFunctions: CfgFunctionArray<State, SnowflakeConfig> = [
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