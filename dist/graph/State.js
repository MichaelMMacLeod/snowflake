import { mapSome, none, some } from "maybe-either/Maybe";
import { _SnowflakeGraph_root, _SnowflakeGraph_snowflakeID, syncToPercentGrown, syncToSnowflakeID } from "./Graph.js";
import * as SnowflakeGraphs from "./Graph.js";
import * as Maybes from "maybe-either/Maybe";
export const _graphState_graph = 0;
export const _graphState_percentGrown = 1;
export const _graphState_aspectRatio = 2;
export const _graphState_isLightTheme = 3;
export const zero = () => {
    const graph = none;
    const percentGrown = 0;
    const aspectRatio = 3;
    const isLightTheme = true;
    return [
        graph,
        percentGrown,
        aspectRatio,
        isLightTheme,
    ];
};
export const initialize = (state) => {
    return Maybes.map(state[_graphState_graph], () => {
        const g = SnowflakeGraphs.zero();
        state[_graphState_graph] = some(g);
        return g[_SnowflakeGraph_root];
    }, g => {
        return g[_SnowflakeGraph_root];
    });
};
export const setPercentGrown = (state, percentGrown) => {
    state[_graphState_percentGrown] = percentGrown;
    mapSome(state[_graphState_graph], g => syncToPercentGrown(g, percentGrown));
};
export const setSnowflakeID = (state, snowflakeID) => {
    mapSome(state[_graphState_graph], g => {
        g[_SnowflakeGraph_snowflakeID] = snowflakeID;
        syncToSnowflakeID(g);
    });
};
export const setAspectRatio = (state, aspectRatio) => {
    state[_graphState_aspectRatio] = aspectRatio;
    mapSome(state[_graphState_graph], g => SnowflakeGraphs.setConstants(g, state[_graphState_aspectRatio], state[_graphState_isLightTheme]));
};
export const setIsLightTheme = (state, isLightTheme) => {
    state[_graphState_isLightTheme] = isLightTheme;
    mapSome(state[_graphState_graph], g => SnowflakeGraphs.setConstants(g, state[_graphState_aspectRatio], state[_graphState_isLightTheme]));
};
//# sourceMappingURL=State.js.map