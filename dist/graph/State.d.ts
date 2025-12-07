import { Maybe } from "maybe-either/Maybe";
import { SnowflakeGraph } from "./Graph.js";
import { GraphConfig } from "./Config.js";
export declare const _GraphState_graph = 0;
export declare const _GraphState_cfg = 1;
export type GraphState = {
    [_GraphState_graph]: Maybe<SnowflakeGraph>;
    [_GraphState_cfg]: GraphConfig;
};
export declare const zero: () => GraphState;
export declare const reset: (_g: GraphState) => void;
export declare const initialize: (state: GraphState) => Node;
