import * as States from "./State";

export function main() {
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