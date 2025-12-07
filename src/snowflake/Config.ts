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
import * as ColorThemes from "../common/color/Theme.js";
import { ColorTheme } from "../common/color/Theme.js";
import { Maybe } from "maybe-either/Maybe";
import { Either, getLeft, mapRight, right } from "maybe-either/Either";

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

type _Cfg_snowflakeID = 0;
type _Cfg_snowflakeCanvasSizePX = 1;
type _Cfg_targetGrowthTimeMS = 2;
type _Cfg_upsCap = 3;
type _Cfg_maxUpdates = 4;
type _Cfg_playing = 5;
type _Cfg_colorTheme = 6;
type _Cfg_isLightTheme = 7;
type _Cfg_finishedGrowingCallback = 8;
type _Cfg_resetCallback = 9;
type _Cfg_updatedCallback = 10;

export type Cfg = {
    [_Cfg_snowflakeID]: SnowflakeID,
    [_Cfg_snowflakeCanvasSizePX]: number,
    [_Cfg_targetGrowthTimeMS]: number,
    [_Cfg_upsCap]: number,
    [_Cfg_maxUpdates]: number,
    [_Cfg_playing]: boolean,
    [_Cfg_colorTheme]: ColorTheme,
    [_Cfg_isLightTheme]: boolean,
    [_Cfg_finishedGrowingCallback]: () => void,
    [_Cfg_resetCallback]: () => void,
    [_Cfg_updatedCallback]: () => void,
};

const cfgKeys: Array<keyof Cfg> = [
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

export const defaultConfig: Readonly<Cfg> = Object.freeze([
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

const cfgGetOrDefault = <K extends keyof Cfg>(cfg: Cfg, key: K): Cfg[K] => {
    const value = cfg[key];
    if (value !== undefined) {
        return value;
    }
    return defaultConfig[key];
}

type CfgFunction<K extends keyof Cfg> = (
    cfg: Cfg,
    state: State,
    oldValue: Cfg[K],
    newValue: Cfg[K]
) => Either<ErrorMessage, ResetStatus>;

const cfgSnowflakeID: CfgFunction<_Cfg_snowflakeID> = (_cfg, state, oldValue, newValue) => {
    if (oldValue === newValue) {
        return right(resetUnecessary);
    }
    return mapRight(parseSnowflakeID(newValue), r => {
        state[_State_growthInput] = r;
        return resetRequred;
    });
};

const cfgSnowflakeCanvasSizePX: CfgFunction<_Cfg_snowflakeCanvasSizePX> = (_cfg, state, oldValue, newValue) => {
    if (newValue !== oldValue) {
        return right(setSnowflakeCanvasSizePX(state, newValue));
    }
    return right(resetUnecessary);
};

const cfgTargetGrowthTimeMS: CfgFunction<_Cfg_targetGrowthTimeMS> = (cfg, state, _oldValue, newValue) => {
    setIdealMSBetweenUpdates(state, newValue, cfgGetOrDefault(cfg, _Cfg_upsCap));
    return right(resetUnecessary);
};

const cfgUPSCap: CfgFunction<_Cfg_upsCap> = (cfg, state, _oldValue, newValue) => {
    setIdealMSBetweenUpdates(state, cfgGetOrDefault(cfg, _Cfg_targetGrowthTimeMS), newValue);
    return right(resetUnecessary);
};

const cfgMaxUpdates: CfgFunction<_Cfg_maxUpdates> = (_cfg, _state, _oldValue, _newValue) => {
    return right(resetUnecessary);
};

const cfgPlaying: CfgFunction<_Cfg_playing> = (_cfg, state, oldValue, newValue) => {
    if (newValue !== oldValue) {
        state[_State_currentMS] = performance.now();
        scheduleUpdate(state);
    }
    return right(resetUnecessary);
};

const cfgColorTheme: CfgFunction<_Cfg_colorTheme> = (_cfg, _state, oldValue, newValue) => {
    if (ColorThemes.equals(newValue, oldValue)) {
        return right(resetUnecessary);
    }
    return right(resetRequred);
};

const cfgIsLightTheme: CfgFunction<_Cfg_isLightTheme> = (_cfg, _state, oldValue, newValue) => {
    if (newValue === oldValue) {
        return right(resetUnecessary);
    }
    return right(resetRequred);
};

const cfgFinishedGrowingCallback: CfgFunction<_Cfg_finishedGrowingCallback> = (_cfg, _state, _oldValue, _newValue) => {
    return right(resetUnecessary);
};

const cfgResetCallback: CfgFunction<_Cfg_resetCallback> = (_cfg, _state, _oldValue, _newValue) => {
    return right(resetUnecessary);
};

const cfgUpdatedCallback: CfgFunction<_Cfg_updatedCallback> = (_cfg, _state, _oldValue, _newValue) => {
    return right(resetUnecessary);
};

type CfgFunctions = { [K in keyof Cfg]: CfgFunction<K> };
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

export const configure = <K extends keyof Cfg>(
    oldCfg: Cfg,
    state: State,
    key: K,
    value: Cfg[K],
): Maybe<ErrorMessage> => {
    const c = cfgFunctions[key](oldCfg, state, cfgGetOrDefault(oldCfg, key), value);
    return getLeft(mapRight(c, resetStatus => {
        if (resetStatus === resetRequred) {
            States.reset(state);
        }
    }));
};