import * as States from "./State";
import { defaultStateOptions, StateOptions } from "./State";
import { isStateOptions } from "./State.guard";

export function main(onInit: (options: StateOptions) => unknown) {
    const options = onInit(defaultStateOptions());

    if (!isStateOptions(options)) {
        console.error("Recived bad StateOptions from onInit");
        return;
    } else {
        const state = States.make(options);
        if (state === undefined) {
            return;
        }
        States.registerControlsEventListeners(state);
        state.intervalId = window.setInterval(
            () => States.update(state),
            state.updateInterval);
    }
}

// main();