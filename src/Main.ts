import { Controller } from "./Controller";
import * as States from "./State";
import { defaultStateOptions, StateOptions } from "./State";
import { isStateOptions } from "./State.guard";
import * as Controllers from "./Controller";

export function main(): Controller {
    // const c = Controllers.make();
    // c.handleAll([
    //     {
    //         kind: 'installGraph',
    //         options: {
    //             canvasClassName: 'graph',
    //             canvasWidth: 600,
    //             canvasHeight: 200,
    //             mouseUpEventListenerNode: document,
    //         },
    //         installCanvas: graph => {
    //             document.getElementById('graphContainer')?.appendChild(graph);
    //         },
    //         onNoContextFailure: () => { throw new Error("error getting graph canvas context") },
    //     }
    // ]);
    // return c;
    return Controllers.make();
}
