import { parseConfigAndDisplayErrors, parseSnowflakeID, randomSnowflakeIDString, sync } from "../common/Config.js";
import { mapSome, none, some } from "maybe-either/Maybe";
import * as Maybes from "maybe-either/Maybe";
import { _State_cfg, _State_graphic, initializeGraphic, State } from "./State.js";
import * as Eithers from "maybe-either/Either";
import * as States from "./State.js";
import * as Configs from "./SnowflakeConfig.js";
import { SnowflakeID } from "../common/Utils.js";
import { _graphic_canvas } from "./Graphic.js";
import { _SnowflakeConfig_snowflakeCanvasSizePX, SnowflakeConfig } from "./SnowflakeConfig.js";

export default class SnowflakeElement extends HTMLElement {
    #state: State;
    #shadow: ShadowRoot;

    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: 'open' });
        this.#state = States.zero();
    }

    connectedCallback() {
        Maybes.map(
            initializeGraphic(this.#state, this.#state[_State_cfg][_SnowflakeConfig_snowflakeCanvasSizePX]),
            () => { throw new Error("couldn't get canvas 2d context"); },
            g => {
                this.#shadow.appendChild(g[_graphic_canvas]);
            },
        );
    }

    configure<K extends keyof SnowflakeConfig>(key: K, value: SnowflakeConfig[K]) {
        const cfg = this.#state[_State_cfg];
        Maybes.map(
            Configs.configure(cfg, this.#state, key, value),
            () => {
                cfg[key] = value;
            },
            error => {
                console.error(error);
            },
        );
    }

    configuredValue<K extends keyof SnowflakeConfig>(key: K): SnowflakeConfig[K] {
        return this.#state[_State_cfg][key];
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
            this.#state[_State_graphic],
            () => { throw new Error('element not yet inserted into document') },
        )[_graphic_canvas];
    }
}