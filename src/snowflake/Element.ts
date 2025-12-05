import { parseConfigAndDisplayErrors, parseSnowflakeID, randomSnowflakeIDString, sync } from "../common/Config.js";
import { none, some } from "maybe-either/Maybe";
import * as Maybes from "maybe-either/Maybe";
import { initializeGraphic, State } from "./State.js";
import * as Eithers from "maybe-either/Either";
import * as States from "./State.js";
import { Config, configParser, configSynchronizer, UnparsedConfig } from "./Config.js";
import * as Configs from "./Config.js";
import { SnowflakeID } from "../common/Utils.js";
import { _graphic_canvas } from "./Graphic.js";

export default class SnowflakeElement extends HTMLElement {
    #state: State;
    #config: Config;
    #shadow: ShadowRoot;

    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: 'open' });
        this.#state = States.zero();
        this.#config = Configs.zero();
        sync(configSynchronizer, this.#state, () => States.reset(this.#state), none, this.#config);
    }

    connectedCallback() {
        Maybes.map(
            initializeGraphic(this.#state, this.#config.snowflakeCanvasSizePX),
            () => { throw new Error("couldn't get canvas 2d context"); },
            g => {
                this.#shadow.appendChild(g[_graphic_canvas]);
            },
        );
    }

    disconnectedCallback() { }

    adoptedCallback() { }

    configure(unparsedConfig: UnparsedConfig): void {
        const config = parseConfigAndDisplayErrors(configParser, unparsedConfig);
        sync(configSynchronizer, this.#state, () => States.reset(this.#state), some(this.#config), config);
        this.#config = config;
    }

    reset(): void {
        States.reset(this.#state);
    }

    isValidSnowflakeId(id: string): id is SnowflakeID {
        return Eithers.map(
            parseSnowflakeID(id),
            () => false,
            () => true
        );
    }

    randomSnowflakeId(): SnowflakeID {
        return randomSnowflakeIDString();
    }

    percentGrown(): number {
        return States.percentGrown(this.#state);
    }

    canvas(): HTMLCanvasElement {
        return Maybes.unwrapOr(
            this.#state[States._graphic],
            () => { throw new Error('element not yet inserted into document') },
        )[_graphic_canvas];
    }
}