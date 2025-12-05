import { mapSome, Maybe, none, some } from "../common/Maybe";
import { SnowflakeGraph, syncToPercentGrown, syncToSnowflakeID } from "./Graph";
import * as SnowflakeGraphs from "./Graph";
import { NonEmptyArray } from "../common/Utils";
import * as Maybes from "../common/Maybe";

export type GraphState = {
    graph: Maybe<SnowflakeGraph>
    percentGrown: number,
    aspectRatio: number,
    isLightTheme: boolean,
};

export const zero = (): GraphState => {
    return {
        graph: none(),
        percentGrown: 0,
        aspectRatio: 3,
        isLightTheme: true,
    };
}

export const initialize = (state: GraphState): Node => {
    return Maybes.map(
        state.graph,
        () => {
            const g = SnowflakeGraphs.zero();
            state.graph = some(g);
            return g.root;
        },
        g => {
            return g.root;
        });
}

export const setPercentGrown = (state: GraphState, percentGrown: number): void => {
    state.percentGrown = percentGrown;
    mapSome(state.graph, g => syncToPercentGrown(g, percentGrown));
}

export const setSnowflakeID = (state: GraphState, snowflakeID: NonEmptyArray<number>): void => {
    mapSome(state.graph, g => {
        g.snowflakeID = snowflakeID;
        syncToSnowflakeID(g);
    });
}

export const setAspectRatio = (state: GraphState, aspectRatio: number): void => {
    state.aspectRatio = aspectRatio;
    mapSome(state.graph, g => SnowflakeGraphs.setConstants(g, state.aspectRatio, state.isLightTheme));
}

export const setIsLightTheme = (state: GraphState, isLightTheme: boolean): void => {
    state.isLightTheme = isLightTheme;
    mapSome(state.graph, g => SnowflakeGraphs.setConstants(g, state.aspectRatio, state.isLightTheme));
}