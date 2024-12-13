import { Config, copy, sync } from "./Config";
import * as Configs from "./Config";
import { none, some } from "./Maybe";
import { receiveEvent, State, StateEvent } from "./State";
import * as States from "./State";

export class Controller {
    #state: State;
    #config: Config;

    constructor() {
        this.#state = States.make();
        this.#config = Configs.zero();
        sync(none(), this.#config, this.#state);
    }

    defaultConfig(): Config {
        return Configs.zero();
    }

    configure(config: Config): void {
        sync(some(this.#config), config, this.#state);
        this.#config = copy(config);
    }

    installSnowflakeCanvas(): void {
        States.installSnowflakeCanvas(this.#state);
    }

    reset(): void {
        States.reset(this.#state);
    }

    randomSnowflakeId(): string {
        return Configs.randomSnowflakeId();
    }

    handle(event: StateEvent): void {
        receiveEvent(this.#state, event);
    }

    handleAll(events: Array<StateEvent>): void {
        events.forEach(e => this.handle(e));
    }
}