import { receiveEvent, State, StateEvent } from "./State";
import * as States from "./State";

export type Controller = {
    handle: (e: StateEvent) => void,
    handleAll: (e: [StateEvent]) => void,
};

export function make(): Controller {
    const state = States.make();
    return {
        handle: e => receiveEvent(state, e),
        handleAll: es => es.forEach(e => receiveEvent(state, e)),
    }
}