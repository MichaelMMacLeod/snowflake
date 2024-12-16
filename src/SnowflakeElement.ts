import { Config, copy, sync } from "./Config";
import * as Configs from "./Config";
import { Graphic } from "./Graphic";
import * as Graphics from "./Graphic";
import { Maybe, none, orElse, some, unwrapOr } from "./Maybe";
import * as Maybes from "./Maybe";
import { initializeGraphic, State } from "./State";
import * as States from "./State";

export class SnowflakeElement extends HTMLElement {
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
        initializeGraphic(this.#state, this.#config.snowflakeCanvasSizePX);
        Maybes.map(
            this.#state.graphic,
            () => {

            },
            _ => { throw new Error('snowflake already installed') },
        );
        // this.#state.graphic = Graphics.make();
        this.#graphic = orElse(this.#graphic, () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx === null) {
                return none();
            }

        });
        console.log('connectedCallback');
    }

    disconnectedCallback() {
        console.log('disconnectedCallback');

    }

    adoptedCallback() {
        console.log('adoptedCallback');
    }

    attributeChangedCallback(property: string, oldValue: string | null, newValue: string | null) {
        switch (property) {
            case 'snowflake-id':
                this.#config.snowflakeID = property;
                break;
            case 'size':
                this.#config.snowflakeCanvasSizePX = property;
                break;
            case 'target-growth-time':
                break;
            case 'max-fps':
                break;
            case 'max-updates':
                break;
            case 'playing':
                break;
            case 'on-finished-growing':
                break;
            case 'on-reset':
                break;
            case 'on-install-canvas':
                break;
            case 'on-install-canvas-failure':
                break;
        }
        console.log('attributeChangedCallback');
    }

    static get observedAttributes() {
        return [
            'snowflake-id',
            'size',
            'target-growth-time',
            'max-fps',
            'max-updates',
            'playing',
            'on-finished-growing',
            'on-reset',
            'on-install-canvas',
            'on-install-canvas-failure',
        ];
    }

    // defaultConfig(): Config {
    //     return Configs.zero();
    // }

    // configure(config: Config): void {
    //     sync(some(this.#config), config, this.#state);
    //     this.#config = copy(config);
    // }

    // installSnowflakeCanvas(): void {
    //     States.installSnowflakeCanvas(this.#state, this.#config.snowflakeCanvasSizePX);
    // }

    // reset(): void {
    //     States.reset(this.#state);
    // }

    // randomSnowflakeId(): string {
    //     return Configs.randomSnowflakeId();
    // }
}