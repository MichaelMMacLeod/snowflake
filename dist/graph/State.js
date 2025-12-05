import { mapSome, none, some } from "maybe-either/Maybe";
import { syncToPercentGrown, syncToSnowflakeID } from "./Graph.js";
import * as SnowflakeGraphs from "./Graph.js";
import * as Maybes from "maybe-either/Maybe";
export const zero = () => {
    return {
        graph: none,
        percentGrown: 0,
        aspectRatio: 3,
        isLightTheme: true,
    };
};
export const initialize = (state) => {
    return Maybes.map(state.graph, () => {
        const g = SnowflakeGraphs.zero();
        state.graph = some(g);
        return g.root;
    }, g => {
        return g.root;
    });
};
export const setPercentGrown = (state, percentGrown) => {
    state.percentGrown = percentGrown;
    mapSome(state.graph, g => syncToPercentGrown(g, percentGrown));
};
export const setSnowflakeID = (state, snowflakeID) => {
    mapSome(state.graph, g => {
        g.snowflakeID = snowflakeID;
        syncToSnowflakeID(g);
    });
};
export const setAspectRatio = (state, aspectRatio) => {
    state.aspectRatio = aspectRatio;
    mapSome(state.graph, g => SnowflakeGraphs.setConstants(g, state.aspectRatio, state.isLightTheme));
};
export const setIsLightTheme = (state, isLightTheme) => {
    state.isLightTheme = isLightTheme;
    mapSome(state.graph, g => SnowflakeGraphs.setConstants(g, state.aspectRatio, state.isLightTheme));
};
//# sourceMappingURL=State.js.map