import { Controller } from "./Controller";
import * as States from "./State";
import { defaultStateOptions, StateOptions } from "./State";
import { isStateOptions } from "./State.guard";
import * as Controllers from "./Controller";

export function main(): Controller {
    const state = States.make();
    const controller = Controllers.make(state);
    controller.handle({
        kind: 'installSnowflake',
        options: {
            className: "snowflake",
            width: 800,
            height: 800
        },
        installCanvas: function (snowflake: HTMLCanvasElement): void {
            document.getElementById('canvasContainer')?.appendChild(snowflake);
        },
        onNoContextFailure: function (): void {
            throw new Error("error getting canvas context");
        }
    });
    controller.handle({
        kind: 'play',
        play: true,
    });
    return controller;
    // onInit: (options: StateOptions) => unknown /* StateOptions */
    // const options = onInit(defaultStateOptions());

    // if (!isStateOptions(options)) {
    //     console.error("Recived bad StateOptions from onInit");
    //     return;
    // } else {
    //     const state = States.make(options);
    //     if (state === undefined) {
    //         return;
    //     }
    //     // States.registerControlsEventListeners(state);
    //     // state.intervalId = window.setInterval(
    //     //     () => States.update(state),
    //     //     state.updateInterval);
    // }
}

// main();