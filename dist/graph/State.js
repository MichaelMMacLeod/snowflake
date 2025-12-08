import { none, some } from "maybe-either/Maybe";
import { _SnowflakeGraph_root } from "./Graph.js";
import * as SnowflakeGraphs from "./Graph.js";
import * as Maybes from "maybe-either/Maybe";
import { defaultGraphConfig } from "./GraphConfig.js";
export const _GraphState_graph = 0;
export const _GraphState_cfg = 1;
export const zero = () => {
    const graph = none;
    const cfg = Object.assign({}, defaultGraphConfig) /* create non-frozen copy */;
    return [
        graph,
        cfg,
    ];
};
export const reset = (_g) => { };
export const initialize = (state) => {
    return Maybes.map(state[_GraphState_graph], () => {
        const g = SnowflakeGraphs.zero();
        state[_GraphState_graph] = some(g);
        return g[_SnowflakeGraph_root];
    }, g => {
        return g[_SnowflakeGraph_root];
    });
};
//# sourceMappingURL=State.js.map