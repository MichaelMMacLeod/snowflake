import { _GraphState_cfg } from "./State.js";
import * as GraphStates from "./State.js";
import { graphDefaultConfig, graphCfgFunctions } from "./GraphConfig.js";
import * as Configs from "../common/Config.js";
export default class SnowflakeGraphElement extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        this.state = GraphStates.zero();
    }
    connectedCallback() {
        const element = GraphStates.initialize(this.state);
        this.shadow.appendChild(element);
    }
    configure(key, value) {
        Configs.configure(graphCfgFunctions, this.state[_GraphState_cfg], this.state, key, value, graphDefaultConfig, (_state) => { return; });
    }
    configuredValue(key) {
        return this.state[_GraphState_cfg][key];
    }
}
//# sourceMappingURL=Element.js.map