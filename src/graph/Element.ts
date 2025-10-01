import { parseConfigAndDisplayErrors, sync } from "../common/Config";
import { GraphState } from "./State";
import { none, some } from "../common/Maybe";
import * as GraphStates from "./State";
import { Config, configParser, configSynchronizer, UnparsedConfig } from "./Config";
import * as GraphConfigs from "./Config";

export default class SnowflakeGraphElement extends HTMLElement {
    #shadow: ShadowRoot;
    #config: Config;
    #state: GraphState;

    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: 'open' });
        this.#config = GraphConfigs.zero();
        this.#state = GraphStates.zero();
        sync(
            configSynchronizer,
            this.#state,
            () => { return; },
            none(),
            this.#config,
        )
    }

    configure(unparsedConfig: UnparsedConfig): void {
        const config = parseConfigAndDisplayErrors(configParser, unparsedConfig);
        sync(
            configSynchronizer,
            this.#state,
            () => { return; },
            some(this.#config),
            config,
        );
        this.#config = config;
    }

    connectedCallback() {
        const element = GraphStates.initialize(this.#state);
        this.#shadow.appendChild(element);
    }

    disconnectedCallback() {
        console.log('sfg disconnectedCallback');

    }

    adoptedCallback() {
        console.log('sfg adoptedCallback');
    }
}