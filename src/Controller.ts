import { receiveEvent, State, StateEvent } from "./State";

export type Controller = {
    handle: (e: StateEvent) => void,
};

export function make(state: State): Controller {
    return {
        handle: e => receiveEvent(state, e),
    }
}