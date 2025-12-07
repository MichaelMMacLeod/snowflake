import { GraphState } from "./State.js";
import * as GraphStates from "./State.js";
import { defaultGraphConfig, GraphConfig } from "./Config.js";
import * as GraphConfigs from "./Config.js";
import * as Maybes from "maybe-either/Maybe";

export default class SnowflakeGraphElement extends HTMLElement {
    #shadow: ShadowRoot;
    #config: GraphConfig;
    #state: GraphState;

    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: 'open' });
        this.#config = { ...defaultGraphConfig };
        this.#state = GraphStates.zero();

        GraphConfigs.cfgKeys.forEach(key => {
            GraphConfigs.configure(this.#config, this.#state, key, this.#config[key])
        });
    }

    connectedCallback() {
        const element = GraphStates.initialize(this.#state);
        this.#shadow.appendChild(element);
    }

    configure<K extends keyof GraphConfig>(key: K, value: GraphConfig[K]) {
        const cfg = this.#config;
        Maybes.map(
            GraphConfigs.configure(cfg, this.#state, key, value),
            () => {
                cfg[key] = value;
            },
            error => {
                console.error(error);
            },
        );
    }

    configuredValue<K extends keyof GraphConfig>(key: K): GraphConfig[K] {
        return this.#config[key];
    }
}