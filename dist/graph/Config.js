import { parseSnowflakeID } from "../common/SnowflakeID.js";
import { doNothing } from "../common/Utils.js";
import { _GraphState_graph } from "./State.js";
import { _SnowflakeGraph_handleMovedCallback, _SnowflakeGraph_snowflakeID, setAspectRatio, setIsLightTheme, syncToPercentGrown, syncToSnowflakeID } from "./Graph.js";
import * as SnowflakeConfigs from "../snowflake/SnowflakeConfig.js";
import { getLeft, mapRight, right } from "maybe-either/Either";
import { mapSome } from "maybe-either/Maybe";
import * as GraphStates from "./State.js";
export const _GraphConfig_percentGrown = 0;
export const _GraphConfig_snowflakeID = 1;
export const _GraphConfig_aspectRatio = 2;
export const _GraphConfig_isLightTheme = 3;
export const _GraphConfig_handleMovedCallback = 4;
export const cfgKeys = [
    _GraphConfig_percentGrown,
    _GraphConfig_snowflakeID,
    _GraphConfig_aspectRatio,
    _GraphConfig_isLightTheme,
    _GraphConfig_handleMovedCallback,
];
const resetRequred = true;
const resetUnecessary = false;
export const defaultPercentGrown = 0;
export const defaultSnowflakeID = SnowflakeConfigs.defaultSnowflakeID;
export const defaultAspectRatio = 3;
export const defaultIsLightTheme = SnowflakeConfigs.defaultIsLightTheme;
export const defaultHandleMovedCallback = doNothing;
export const defaultGraphConfig = Object.freeze([
    defaultPercentGrown,
    defaultSnowflakeID,
    defaultAspectRatio,
    defaultIsLightTheme,
    defaultHandleMovedCallback,
]);
const cfgGetOrDefault = (cfg, key) => {
    const value = cfg[key];
    if (value !== undefined) {
        return value;
    }
    return defaultGraphConfig[key];
};
const cfgPercentGrown = (cfg, state, oldValue, newValue) => {
    if (oldValue !== newValue) {
        mapSome(state[_GraphState_graph], g => syncToPercentGrown(g, cfg[_GraphConfig_aspectRatio], newValue));
        return right(resetUnecessary);
    }
    return right(resetUnecessary);
};
const cfgSnowflakeID = (cfg, state, oldValue, newValue) => {
    if (oldValue === newValue) {
        return right(resetUnecessary);
    }
    return mapRight(parseSnowflakeID(newValue), r => {
        mapSome(state[_GraphState_graph], g => {
            g[_SnowflakeGraph_snowflakeID] = r;
            syncToSnowflakeID(g, cfg[_GraphConfig_aspectRatio]);
        });
        return resetUnecessary;
    });
};
const cfgAspectRatio = (_cfg, state, oldValue, newValue) => {
    if (oldValue !== newValue) {
        mapSome(state[_GraphState_graph], g => setAspectRatio(g, newValue));
        return right(resetUnecessary);
    }
    return right(resetUnecessary);
};
const cfgIsLightTheme = (_cfg, state, oldValue, newValue) => {
    if (oldValue !== newValue) {
        mapSome(state[_GraphState_graph], g => setIsLightTheme(g, newValue));
        return right(resetUnecessary);
    }
    return right(resetUnecessary);
};
const cfgHandleMovedCallback = (_cfg, state, _oldValue, newValue) => {
    mapSome(state[_GraphState_graph], g => g[_SnowflakeGraph_handleMovedCallback] = newValue);
    return right(resetUnecessary);
};
const cfgFunctions = [
    cfgPercentGrown,
    cfgSnowflakeID,
    cfgAspectRatio,
    cfgIsLightTheme,
    cfgHandleMovedCallback,
];
export const configure = (oldCfg, state, key, value) => {
    const c = cfgFunctions[key](oldCfg, state, cfgGetOrDefault(oldCfg, key), value);
    return getLeft(mapRight(c, resetStatus => {
        if (resetStatus === resetRequred) {
            GraphStates.reset(state);
        }
    }));
};
//# sourceMappingURL=Config.js.map