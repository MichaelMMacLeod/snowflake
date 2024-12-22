import { mapSome, Maybe, none, some } from "./Maybe";
import { SnowflakeGraph, syncToPercentGrown, syncToSnowflakeID } from "./SnowflakeGraph";
import * as SnowflakeGraphs from "./SnowflakeGraph";
import { NonEmptyArray } from "./Utils";
import * as Maybes from "./Maybe";

export type GraphState = {
    graph: Maybe<SnowflakeGraph>
    snowflakeID: NonEmptyArray<number>,
    percentGrown: number,
    aspectRatio: number,
};

export function zero(): GraphState {
    return {
        graph: none(),
        snowflakeID: [0, 0],
        percentGrown: 0,
        aspectRatio: 3,
    };
}

export function initialize(state: GraphState): Node {
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

export function setPercentGrown(state: GraphState, percentGrown: number): void {
    state.percentGrown = percentGrown;
    mapSome(state.graph, g => syncToPercentGrown(g, percentGrown));
}

export function setSnowflakeID(state: GraphState, snowflakeID: NonEmptyArray<number>): void {
    state.snowflakeID = snowflakeID;
    mapSome(state.graph, g => syncToSnowflakeID(g, snowflakeID));
}

export function setAspectRatio(state: GraphState, aspectRatio: number): void {
    state.aspectRatio = aspectRatio;
}