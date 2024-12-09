import * as States from "./State";
import { defaultStateOptions, StateOptions } from "./State";

export function main(onInit: (options: StateOptions) => any) {
    const options = onInit(defaultStateOptions());
    if (options instanceof StateOptions) {

    }
    const state = States.make();
    if (state === undefined) {
        return;
    }
    States.registerControlsEventListeners(state);
    state.intervalId = window.setInterval(
        () => States.update(state),
        state.updateInterval);
}

// main();