import { GraphState } from "./State.js";
import * as GraphStates from "./State.js";
import { graphDefaultConfig, graphCfgFunctions, GraphConfig } from "./GraphConfig.js";
import * as GraphConfigs from "./GraphConfig.js";
import * as Configs from "../common/Config.js";

export default class SnowflakeGraphElement extends HTMLElement {
    #shadow: ShadowRoot;
    #config: GraphConfig;
    #state: GraphState;

    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: 'open' });
        this.#config = { ...graphDefaultConfig };
        this.#state = GraphStates.zero();
    }

    connectedCallback() {
        const element = GraphStates.initialize(this.#state);
        this.#shadow.appendChild(element);
    }

    configure<K extends keyof GraphConfig>(key: K, value: GraphConfig[K]) {
        const cfg = this.#config;
        Configs.configure(
            graphCfgFunctions,
            cfg,
            this.#state,
            key,
            value,
            graphDefaultConfig,
            (_state) => { return; }
        )
        cfg[key] = value;
    }

    configuredValue<K extends keyof GraphConfig>(key: K): GraphConfig[K] {
        return this.#config[key];
    }
}