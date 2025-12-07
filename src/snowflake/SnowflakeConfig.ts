import {
    parseSnowflakeID,
} from "../common/Config.js";
import {
    _State_currentMS,
    _State_growthInput,
    scheduleUpdate,
    setIdealMSBetweenUpdates,
    setSnowflakeCanvasSizePX,
    State
} from "./State.js";
import * as States from './State.js';
import { doNothing, SnowflakeID } from "../common/Utils.js";
import * as ColorThemes from "../common/ColorScheme.js";
import { ColorScheme } from "../common/ColorScheme.js";
import { Maybe } from "maybe-either/Maybe";
import { Either, getLeft, mapRight, right } from "maybe-either/Either";

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

type ResetRequired = true;
type ResetUnecessary = false;
type ResetStatus = ResetRequired | ResetUnecessary;
const resetRequred = true;
const resetUnecessary = false;

type ErrorMessage = string;

const defaultSnowflakeID = '13925257291' as SnowflakeID;
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

export const defaultConfig: Readonly<SnowflakeConfig> = Object.freeze([
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
    return defaultConfig[key];
}

type CfgFunction<K extends keyof SnowflakeConfig> = (
    cfg: SnowflakeConfig,
    state: State,
    oldValue: SnowflakeConfig[K],
    newValue: SnowflakeConfig[K]
) => Either<ErrorMessage, ResetStatus>;

const cfgSnowflakeID: CfgFunction<_SnowflakeConfig_snowflakeID> = (_cfg, state, oldValue, newValue) => {
    if (oldValue === newValue) {
        return right(resetUnecessary);
    }
    return mapRight(parseSnowflakeID(newValue), r => {
        state[_State_growthInput] = r;
        return resetRequred;
    });
};

const cfgSnowflakeCanvasSizePX: CfgFunction<_SnowflakeConfig_snowflakeCanvasSizePX> = (_cfg, state, oldValue, newValue) => {
    if (newValue !== oldValue) {
        return right(setSnowflakeCanvasSizePX(state, newValue));
    }
    return right(resetUnecessary);
};

const cfgTargetGrowthTimeMS: CfgFunction<_SnowflakeConfig_targetGrowthTimeMS> = (cfg, state, _oldValue, newValue) => {
    setIdealMSBetweenUpdates(state, newValue, cfgGetOrDefault(cfg, _SnowflakeConfig_upsCap));
    return right(resetUnecessary);
};

const cfgUPSCap: CfgFunction<_SnowflakeConfig_upsCap> = (cfg, state, _oldValue, newValue) => {
    setIdealMSBetweenUpdates(state, cfgGetOrDefault(cfg, _SnowflakeConfig_targetGrowthTimeMS), newValue);
    return right(resetUnecessary);
};

const cfgMaxUpdates: CfgFunction<_SnowflakeConfig_maxUpdates> = (_cfg, _state, _oldValue, _newValue) => {
    return right(resetUnecessary);
};

const cfgPlaying: CfgFunction<_SnowflakeConfig_playing> = (_cfg, state, oldValue, newValue) => {
    if (newValue !== oldValue) {
        state[_State_currentMS] = performance.now();
        scheduleUpdate(state);
    }
    return right(resetUnecessary);
};

const cfgColorTheme: CfgFunction<_SnowflakeConfig_colorScheme> = (_cfg, _state, oldValue, newValue) => {
    if (ColorThemes.equals(newValue, oldValue)) {
        return right(resetUnecessary);
    }
    return right(resetRequred);
};

const cfgIsLightTheme: CfgFunction<_SnowflakeConfig_isLightTheme> = (_cfg, _state, oldValue, newValue) => {
    if (newValue === oldValue) {
        return right(resetUnecessary);
    }
    return right(resetRequred);
};

const cfgFinishedGrowingCallback: CfgFunction<_SnowflakeConfig_finishedGrowingCallback> = (_cfg, _state, _oldValue, _newValue) => {
    return right(resetUnecessary);
};

const cfgResetCallback: CfgFunction<_SnowflakeConfig_resetCallback> = (_cfg, _state, _oldValue, _newValue) => {
    return right(resetUnecessary);
};

const cfgUpdatedCallback: CfgFunction<_SnowflakeConfig_updatedCallback> = (_cfg, _state, _oldValue, _newValue) => {
    return right(resetUnecessary);
};

type CfgFunctions = { [K in keyof SnowflakeConfig]: CfgFunction<K> };
const cfgFunctions: CfgFunctions = [
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

export const configure = <K extends keyof SnowflakeConfig>(
    oldCfg: SnowflakeConfig,
    state: State,
    key: K,
    value: SnowflakeConfig[K],
): Maybe<ErrorMessage> => {
    const c = cfgFunctions[key](oldCfg, state, cfgGetOrDefault(oldCfg, key), value);
    return getLeft(mapRight(c, resetStatus => {
        if (resetStatus === resetRequred) {
            States.reset(state);
        }
    }));
};