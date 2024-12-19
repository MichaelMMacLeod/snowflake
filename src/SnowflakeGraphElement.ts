import { parseConfigAndDisplayErrors, parseSnowflakeID, sync } from "./Config";
import { GraphState } from "./SnowflakeGraphState";
import { Maybe, none, some } from "./Maybe";
import * as Maybes from "./Maybe";
import * as SnowflakeGraphs from "./SnowflakeGraph";
import { SnowflakeGraph } from "./SnowflakeGraph";
import * as GraphStates from "./SnowflakeGraphState";
import { NonEmptyArray, ok } from "./Utils";
import { Config, configParser, configSynchronizer, UnparsedConfig } from "./SnowflakeGraphConfig";
import * as GraphConfigs from "./SnowflakeGraphConfig";

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