import { mapSome, Maybe, none, some } from "./Maybe";
import { SnowflakeGraph, syncToPercentGrown, syncToSnowflakeID } from "./SnowflakeGraph";
import * as SnowflakeGraphs from "./SnowflakeGraph";
import { NonEmptyArray } from "./Utils";
import * as Maybes from "./Maybe";
import { Point } from "./Point";

export type GraphState = {
    graph: Maybe<SnowflakeGraph>
    percentGrown: number,
    aspectRatio: number,
};

export function zero(): GraphState {
    return {
        graph: none(),
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
    mapSome(state.graph, g => {
        g.snowflakeID = snowflakeID;
        syncToSnowflakeID(g);
    });
}

export function setAspectRatio(state: GraphState, aspectRatio: number): void {
    state.aspectRatio = aspectRatio;
    mapSome(state.graph, g => SnowflakeGraphs.setAspectRatio(g, state.aspectRatio));
}