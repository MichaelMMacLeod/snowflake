import { } from "./CoordinateSystem";

export type Graphic = {
    sizePX: number,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
};

export function make(sizePX: number): Graphic | undefined {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
        return undefined;
    }
    // Setting ctx.canvas.(width|height) changes the number of pixels we
    // can render to. Changing canvas.style.(width|height) changes the
    // size of the displayed canvas. So if the 'style' version is larger,
    // we will get a blurry canvas.
    ctx.canvas.width = sizePX;
    ctx.canvas.height = sizePX;
    canvas.style.width = `${sizePX}px`;
    canvas.style.height = `${sizePX}px`;
    return { sizePX, canvas, ctx };
}

export function clear(graphic: Graphic): void {
    graphic.ctx.clearRect(0, 0, graphic.ctx.canvas.width, graphic.ctx.canvas.height);
}