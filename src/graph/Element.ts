import { _GraphState_cfg, GraphState } from "./State.js";
import * as GraphStates from "./State.js";
import { graphDefaultConfig, graphCfgFunctions, GraphConfig } from "./GraphConfig.js";
import * as Configs from "../common/Config.js";

export default class SnowflakeGraphElement extends HTMLElement {
    shadow: ShadowRoot;
    state: GraphState;

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        this.state = GraphStates.zero();
    }

    connectedCallback() {
        const element = GraphStates.initialize(this.state);
        this.shadow.appendChild(element);
    }

    configure<K extends keyof GraphConfig>(key: K, value: GraphConfig[K]) {
        Configs.configure(
            graphCfgFunctions,
            this.state[_GraphState_cfg],
            this.state,
            key,
            value,
            graphDefaultConfig,
            (_state) => { return; }
        )
    }

    configuredValue<K extends keyof GraphConfig>(key: K): GraphConfig[K] {
        return this.state[_GraphState_cfg][key];
    }
}