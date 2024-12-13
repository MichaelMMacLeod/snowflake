import { Config, sync } from "./Config";
import * as Configs from "./Config";
import { receiveEvent, State, StateEvent } from "./State";
import * as States from "./State";

export class Controller {
    #state: State;

    constructor() {
        this.#state = States.make();
        const config = Configs.zero();
        sync(config, this.#state);
    }

    getDefaultConfig(): Config {
        return Configs.zero();
    }

    configure(config: Config): void {
        sync(config, this.#state);
    }

    handle(event: StateEvent): void {
        receiveEvent(this.#state, event);
    }

    handleAll(events: Array<StateEvent>): void {
        events.forEach(e => this.handle(e));
    }
}