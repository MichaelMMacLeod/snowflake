import { Maybe } from "maybe-either/Maybe";
import { SnowflakeGraph } from "./Graph.js";
import { NonEmptyArray } from "../common/Utils.js";
export type GraphState = {
    graph: Maybe<SnowflakeGraph>;
    percentGrown: number;
    aspectRatio: number;
    isLightTheme: boolean;
};
export declare const zero: () => GraphState;
export declare const initialize: (state: GraphState) => Node;
export declare const setPercentGrown: (state: GraphState, percentGrown: number) => void;
export declare const setSnowflakeID: (state: GraphState, snowflakeID: NonEmptyArray<number>) => void;
export declare const setAspectRatio: (state: GraphState, aspectRatio: number) => void;
export declare const setIsLightTheme: (state: GraphState, isLightTheme: boolean) => void;
