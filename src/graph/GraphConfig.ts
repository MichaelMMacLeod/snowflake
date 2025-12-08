import { copySnowflakeID, SnowflakeID } from "../common/SnowflakeID.js";
import { arraysEqual, doNothing } from "../common/Utils.js";
import { _GraphState_graph, GraphState } from "./State.js";
import {
    _SnowflakeGraph_handleMovedCallback,
    _SnowflakeGraph_snowflakeID,
    setAspectRatio,
    setIsLightTheme,
    syncToPercentGrown,
    syncToSnowflakeID
} from "./Graph.js";
import * as SnowflakeConfigs from "../snowflake/SnowflakeConfig.js";
import { mapSome } from "maybe-either/Maybe";
import { CfgFunction, CfgFunctionArray, resetUnecessary } from "../common/Config.js";

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

export const defaultPercentGrown = 0;
export const defaultSnowflakeID = SnowflakeConfigs.defaultSnowflakeID;
export const defaultAspectRatio = 3;
export const defaultIsLightTheme = SnowflakeConfigs.defaultIsLightTheme;
export const defaultHandleMovedCallback = doNothing;

export const graphDefaultConfig: Readonly<GraphConfig> = Object.freeze([
    defaultPercentGrown,
    defaultSnowflakeID,
    defaultAspectRatio,
    defaultIsLightTheme,
    defaultHandleMovedCallback,
]);

type GraphCfgFunction<K extends keyof GraphConfig> = CfgFunction<GraphState, GraphConfig, K>;

const cfgPercentGrown: GraphCfgFunction<_GraphConfig_percentGrown> = (cfg, state, oldValue, newValue) => {
    if (oldValue !== newValue) {
        mapSome(state[_GraphState_graph], g => syncToPercentGrown(g, cfg[_GraphConfig_aspectRatio], newValue));
    }
    return resetUnecessary;
};

const cfgSnowflakeID: GraphCfgFunction<_GraphConfig_snowflakeID> = (cfg, state, oldValue, newValue) => {
    if (oldValue === newValue || arraysEqual(oldValue, newValue, (v1, v2) => v1 === v2)) {
        return resetUnecessary;
    }
    mapSome(state[_GraphState_graph], g => {
        g[_SnowflakeGraph_snowflakeID] = copySnowflakeID(newValue);
        syncToSnowflakeID(g, cfg[_GraphConfig_aspectRatio]);
    });
    return resetUnecessary;
};

const cfgAspectRatio: GraphCfgFunction<_GraphConfig_aspectRatio> = (_cfg, state, oldValue, newValue) => {
    if (oldValue !== newValue) {
        mapSome(state[_GraphState_graph], g => setAspectRatio(g, newValue));
    }
    return resetUnecessary;
};

const cfgIsLightTheme: GraphCfgFunction<_GraphConfig_isLightTheme> = (_cfg, state, oldValue, newValue) => {
    if (oldValue !== newValue) {
        mapSome(state[_GraphState_graph], g => setIsLightTheme(g, newValue));
    }
    return resetUnecessary;
};

const cfgHandleMovedCallback: GraphCfgFunction<_GraphConfig_handleMovedCallback> = (_cfg, state, _oldValue, newValue) => {
    mapSome(state[_GraphState_graph], g => g[_SnowflakeGraph_handleMovedCallback] = newValue);
    return resetUnecessary;
};

export const graphCfgFunctions: CfgFunctionArray<GraphState, GraphConfig> = [
    cfgPercentGrown,
    cfgSnowflakeID,
    cfgAspectRatio,
    cfgIsLightTheme,
    cfgHandleMovedCallback,
];