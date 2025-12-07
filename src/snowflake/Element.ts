import { parseConfigAndDisplayErrors, parseSnowflakeID, randomSnowflakeIDString, sync } from "../common/Config.js";
import { mapSome, none, some } from "maybe-either/Maybe";
import * as Maybes from "maybe-either/Maybe";
import { initializeGraphic, State } from "./State.js";
import * as Eithers from "maybe-either/Either";
import * as States from "./State.js";
import * as Configs from "./Config.js";
import { SnowflakeID } from "../common/Utils.js";
import { _graphic_canvas } from "./Graphic.js";
import { _Cfg_snowflakeCanvasSizePX, Cfg } from "./Config.js";

export default class SnowflakeElement extends HTMLElement {
    #state: State;
    #cfg: Required<Cfg>;
    #shadow: ShadowRoot;

    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: 'open' });
        this.#state = Configs.createDefaultState();
        this.#cfg = { ...Configs.defaultConfig } /* create non-frozen copy */;
    }

    connectedCallback() {
        Maybes.map(
            initializeGraphic(this.#state, this.#cfg[_Cfg_snowflakeCanvasSizePX]),
            () => { throw new Error("couldn't get canvas 2d context"); },
            g => {
                this.#shadow.appendChild(g[_graphic_canvas]);
            },
        );
    }

    disconnectedCallback() { }

    adoptedCallback() { }

    configure<K extends keyof Required<Cfg>>(key: K, value: Required<Cfg>[K]) {
        Maybes.map(
            Configs.configure(this.#cfg, this.#state, key, value),
            () => {
                this.#cfg[key] = value
            },
            error => {
                console.error(error)
            },
        );
    };

    configuredValue<K extends keyof Required<Cfg>>(key: K): Required<Cfg>[K] {
        return this.#cfg[key];
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