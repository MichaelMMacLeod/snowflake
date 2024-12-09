import { Graphic } from "./Graphic";

export type Control = {
    pause: HTMLButtonElement;
    reset: HTMLButtonElement;
    playing: boolean;
};

export function make(graphic: Graphic): Control {
    const pause = document.getElementById('pause') as HTMLButtonElement;
    const reset = document.getElementById('reset') as HTMLButtonElement;
    return { pause, reset, playing: true };
}