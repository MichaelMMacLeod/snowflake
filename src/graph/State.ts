import { mapSome, Maybe, none, some } from "maybe-either/Maybe";
import { SnowflakeGraph, syncToPercentGrown, syncToSnowflakeID } from "./Graph.js";
import * as SnowflakeGraphs from "./Graph.js";
import { NonEmptyArray } from "../common/Utils.js";
import * as Maybes from "maybe-either/Maybe";

export const _graphState_graph = 0;
export const _graphState_percentGrown = 1;
export const _graphState_aspectRatio = 2;
export const _graphState_isLightTheme = 3;
export type GraphState = {
    [_graphState_graph]: Maybe<SnowflakeGraph>
    [_graphState_percentGrown]: number,
    [_graphState_aspectRatio]: number,
    [_graphState_isLightTheme]: boolean,
};

export const zero = (): GraphState => {
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
}

export const initialize = (state: GraphState): Node => {
    return Maybes.map(
        state[_graphState_graph],
        () => {
            const g = SnowflakeGraphs.zero();
            state[_graphState_graph] = some(g);
            return g.root;
        },
        g => {
            return g.root;
        });
}

export const setPercentGrown = (state: GraphState, percentGrown: number): void => {
    state[_graphState_percentGrown] = percentGrown;
    mapSome(state[_graphState_graph], g => syncToPercentGrown(g, percentGrown));
}

export const setSnowflakeID = (state: GraphState, snowflakeID: NonEmptyArray<number>): void => {
    mapSome(state[_graphState_graph], g => {
        g.snowflakeID = snowflakeID;
        syncToSnowflakeID(g);
    });
}

export const setAspectRatio = (state: GraphState, aspectRatio: number): void => {
    state[_graphState_aspectRatio] = aspectRatio;
    mapSome(state[_graphState_graph], g => SnowflakeGraphs.setConstants(g, state[_graphState_aspectRatio], state[_graphState_isLightTheme]));
}

export const setIsLightTheme = (state: GraphState, isLightTheme: boolean): void => {
    state[_graphState_isLightTheme] = isLightTheme;
    mapSome(state[_graphState_graph], g => SnowflakeGraphs.setConstants(g, state[_graphState_aspectRatio], state[_graphState_isLightTheme]));
}