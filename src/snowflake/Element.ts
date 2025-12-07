import { parseSnowflakeIDString, SnowflakeID } from "../common/SnowflakeID.js";
import * as SnowflakeIDs from "../common/SnowflakeID.js";
import * as Maybes from "maybe-either/Maybe";
import { _State_cfg, _State_graphic, initializeGraphic, State } from "./State.js";
import * as States from "./State.js";
import * as Configs from "./SnowflakeConfig.js";
import { _graphic_canvas } from "./Graphic.js";
import { _SnowflakeConfig_snowflakeCanvasSizePX, _SnowflakeConfig_snowflakeID, SnowflakeConfig } from "./SnowflakeConfig.js";
import { Either } from "maybe-either/Either";

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

    parseSnowflakeID(id: string): Either<string, SnowflakeID> {
        return parseSnowflakeIDString(id);
    }

    randomSnowflakeId(): SnowflakeID {
        return SnowflakeIDs.randomSnowflakeID();
    }

    snowflakeIDString(): string {
        return SnowflakeIDs.formatAsSnowflakeIDString(this.#state[_State_cfg][_SnowflakeConfig_snowflakeID]);
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