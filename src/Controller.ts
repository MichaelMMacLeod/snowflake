import { Config, sync } from "./Config";
import * as Configs from "./Config";
import { receiveEvent, State, StateEvent } from "./State";
import * as States from "./State";

export type Controller = {
    getDefaultConfig: () => Config,
    configure: (c: Config) => void,
    handle: (e: StateEvent) => void,
    handleAll: (e: [StateEvent]) => void,
};

export function make(): Controller {
    const state = States.make();
    const result: Controller = {
        configure: c => sync(c, state),
        getDefaultConfig: () => Configs.zero(),
        handle: e => receiveEvent(state, e),
        handleAll: es => es.forEach(e => receiveEvent(state, e)),
    };
    result.configure(result.getDefaultConfig());
    return result;
}