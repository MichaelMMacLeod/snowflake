import { Config, parseConfigAndDisplayErrors, randomSnowflakeIDString, sync, UnparsedConfig } from "./Config";
import * as Configs from "./Config";
import { none, some } from "./Maybe";
import * as Maybes from "./Maybe";
import { initializeGraphic, State } from "./State";
import * as States from "./State";

export default class SnowflakeElement extends HTMLElement {
    #state: State;
    #config: Config;
    #shadow: ShadowRoot;

    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: 'open' });
        this.#state = States.zero();
        this.#config = Configs.zero();
        sync(none(), this.#config, this.#state);
    }

    connectedCallback() {
        Maybes.map(
            initializeGraphic(this.#state, this.#config.snowflakeCanvasSizePX),
            () => { throw new Error("couldn't get canvas 2d context") },
            g => {
                this.#shadow.appendChild(g.canvas);
            },

        );
        console.log('connectedCallback');
    }

    disconnectedCallback() {
        console.log('disconnectedCallback');

    }

    adoptedCallback() {
        console.log('adoptedCallback');
    }

    configure(unparsedConfig: UnparsedConfig): void {
        const config = parseConfigAndDisplayErrors(unparsedConfig);
        sync(some(this.#config), config, this.#state);
        this.#config = config;
    }

    reset(): void {
        States.reset(this.#state);
    }

    randomSnowflakeId(): string {
        return randomSnowflakeIDString();
    }
}