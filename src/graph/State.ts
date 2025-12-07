import { Maybe, none, some } from "maybe-either/Maybe";
import { _SnowflakeGraph_root, _SnowflakeGraph_snowflakeID, SnowflakeGraph, syncToPercentGrown, syncToSnowflakeID } from "./Graph.js";
import * as SnowflakeGraphs from "./Graph.js";
import * as Maybes from "maybe-either/Maybe";
import { defaultGraphConfig, GraphConfig } from "./Config.js";

export const _GraphState_graph = 0;
export const _GraphState_cfg = 1;

export type GraphState = {
    [_GraphState_graph]: Maybe<SnowflakeGraph>,
    [_GraphState_cfg]: GraphConfig,
};

export const zero = (): GraphState => {
    const graph = none;
    const cfg = { ...defaultGraphConfig } /* create non-frozen copy */;
    return [
        graph,
        cfg,
    ];
}

export const reset = (_g: GraphState) => { }

export const initialize = (state: GraphState): Node => {
    return Maybes.map(
        state[_GraphState_graph],
        () => {
            const g = SnowflakeGraphs.zero();
            state[_GraphState_graph] = some(g);
            return g[_SnowflakeGraph_root];
        },
        g => {
            return g[_SnowflakeGraph_root];
        });
}