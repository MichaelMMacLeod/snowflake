import {
    ConfigParser, ConfigSynchronizer, parseBool, parseConfigAndDisplayErrors, parseFunction1,
    parseNonnegativeFloat, parsePositiveFloat, parseSnowflakeID, randomSnowflakeIDString
} from "../common/Config.js";
import { arraysEqual, doNothing, NonEmptyArray, SnowflakeID } from "../common/Utils.js";
import * as Maybes from "maybe-either/Maybe";
import { _graphState_graph, GraphState, setAspectRatio, setIsLightTheme, setPercentGrown, setSnowflakeID } from "./State.js";
import { _SnowflakeGraph_handleMovedCallback } from "./Graph.js";
import * as SnowflakeConfigs from "../snowflake/SnowflakeConfig.js";
import { Either, getLeft, mapRight, right } from "maybe-either/Either";
import { mapSome, Maybe } from "maybe-either/Maybe";
import * as GraphStates from "./State.js";

export const _GraphConfig_percentGrown = 0;
export const _GraphConfig_snowflakeID = 1;
export const _GraphConfig_aspectRatio = 2;
export const _GraphConfig_isLightTheme = 3;
export const _GraphConfig_handleMovedCallback = 4;

type _GraphConfig_percentGrown = 0;
type _GraphConfig_snowflakeID = 1;
type _GraphConfig_aspectRatio = 2;
type _GraphConfig_isLightTheme = 3;
type _GraphConfig_handleMovedCallback = 4;

export type GraphConfig = {
    [_GraphConfig_percentGrown]: number,
    [_GraphConfig_snowflakeID]: SnowflakeID,
    [_GraphConfig_aspectRatio]: number,
    [_GraphConfig_isLightTheme]: boolean,
    [_GraphConfig_handleMovedCallback]: (snowflakeID: SnowflakeID) => void,
};

export const cfgKeys: Array<keyof GraphConfig> = [
    _GraphConfig_percentGrown,
    _GraphConfig_snowflakeID,
    _GraphConfig_aspectRatio,
    _GraphConfig_isLightTheme,
    _GraphConfig_handleMovedCallback,
];

type ResetRequired = true;
type ResetUnecessary = false;
type ResetStatus = ResetRequired | ResetUnecessary;
const resetRequred = true;
const resetUnecessary = false;

type ErrorMessage = string;

export const defaultPercentGrown = 0;
export const defaultSnowflakeID = SnowflakeConfigs.defaultSnowflakeID;
export const defaultAspectRatio = 3;
export const defaultIsLightTheme = SnowflakeConfigs.defaultIsLightTheme;
export const defaultHandleMovedCallback = doNothing;

export const defaultGraphConfig: Readonly<GraphConfig> = Object.freeze([
    defaultPercentGrown,
    defaultSnowflakeID,
    defaultAspectRatio,
    defaultIsLightTheme,
    defaultHandleMovedCallback,
]);

const cfgGetOrDefault = <K extends keyof GraphConfig>(cfg: GraphConfig, key: K): GraphConfig[K] => {
    const value = cfg[key];
    if (value !== undefined) {
        return value;
    }
    return defaultGraphConfig[key];
}

type CfgFunction<K extends keyof GraphConfig> = (
    cfg: GraphConfig,
    state: GraphState,
    oldValue: GraphConfig[K],
    newValue: GraphConfig[K]
) => Either<ErrorMessage, ResetStatus>;

export type UnparsedConfig = Partial<{
    percentGrown: number,
    snowflakeID: string,
    aspectRatio: number,
    isLightTheme: boolean,
    handleMovedCallback: (snowflakeID: SnowflakeID) => void,
}>;

export type Config = {
    percentGrown: number,
    snowflakeID: NonEmptyArray<number>,
    aspectRatio: number,
    isLightTheme: boolean,
    handleMovedCallback: (snowflakeID: SnowflakeID) => void,
};

const cfgPercentGrown: CfgFunction<_GraphConfig_percentGrown> = (_cfg, state, oldValue, newValue) => {
    if (oldValue !== newValue) {
        setPercentGrown(state, newValue);
        return right(resetUnecessary);
    }
    return right(resetUnecessary);
};

const cfgSnowflakeID: CfgFunction<_GraphConfig_snowflakeID> = (_cfg, state, oldValue, newValue) => {
    if (oldValue === newValue) {
        return right(resetUnecessary);
    }
    return mapRight(parseSnowflakeID(newValue), r => {
        setSnowflakeID(state, r);
        return resetUnecessary;
    });
};

const cfgAspectRatio: CfgFunction<_GraphConfig_aspectRatio> = (_cfg, state, oldValue, newValue) => {
    if (oldValue !== newValue) {
        setAspectRatio(state, newValue);
        return right(resetUnecessary);
    }
    return right(resetUnecessary);
};

const cfgIsLightTheme: CfgFunction<_GraphConfig_isLightTheme> = (_cfg, state, oldValue, newValue) => {
    if (oldValue !== newValue) {
        setIsLightTheme(state, newValue);
        return right(resetUnecessary);
    }
    return right(resetUnecessary);
};

const cfgHandleMovedCallback: CfgFunction<_GraphConfig_handleMovedCallback> = (_cfg, state, _oldValue, newValue) => {
    mapSome(state[_graphState_graph], g => g[_SnowflakeGraph_handleMovedCallback] = newValue);
    return right(resetUnecessary);
};

type CfgFunctions = { [K in keyof GraphConfig]: CfgFunction<K> };

const cfgFunctions: CfgFunctions = [
    cfgPercentGrown,
    cfgSnowflakeID,
    cfgAspectRatio,
    cfgIsLightTheme,
    cfgHandleMovedCallback,
];

export const configure = <K extends keyof GraphConfig>(
    oldCfg: GraphConfig,
    state: GraphState,
    key: K,
    value: GraphConfig[K],
): Maybe<ErrorMessage> => {
    const c = cfgFunctions[key](oldCfg, state, cfgGetOrDefault(oldCfg, key), value);
    return getLeft(mapRight(c, resetStatus => {
        if (resetStatus === resetRequred) {
            GraphStates.reset(state);
        }
    }));
};
