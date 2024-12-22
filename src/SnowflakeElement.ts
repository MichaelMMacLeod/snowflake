import { parseConfigAndDisplayErrors, randomSnowflakeIDString, sync } from "./Config";
import { none, some } from "./Maybe";
import * as Maybes from "./Maybe";
import { initializeGraphic, State } from "./SnowflakeState";
import * as States from "./SnowflakeState";
import { Config, configParser, configSynchronizer, UnparsedConfig } from "./SnowflakeConfig";
import * as Configs from "./SnowflakeConfig";

export default class SnowflakeElement extends HTMLElement {
    #state: State;
    #config: Config;
    #shadow: ShadowRoot;

    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: 'open' });
        this.#state = States.zero();
        this.#config = Configs.zero();
        sync(configSynchronizer, this.#state, () => States.reset(this.#state), none(), this.#config);
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
        const config = parseConfigAndDisplayErrors(configParser, unparsedConfig);
        sync(configSynchronizer, this.#state, () => States.reset(this.#state), some(this.#config), config);
        this.#config = config;
    }

    reset(): void {
        States.reset(this.#state);
    }

    randomSnowflakeId(): string {
        return randomSnowflakeIDString();
    }

    percentGrown(): number {
        return States.percentGrown(this.#state);
    }
}