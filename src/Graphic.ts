import { worldToViewTransformGuarded } from "./CoordinateSystem";
import { Point } from "./Point";
import { Array6 } from "./Utils";

export type Graphic = {
    sizePX: number,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
};

export type GraphicOptions = {
    sizePX: number,
}

export function make(options: GraphicOptions): Graphic | undefined {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
        return undefined;
    }
    // Setting ctx.canvas.(width|height) changes the number of pixels we
    // can render to. Changing canvas.style.(width|height) changes the
    // size of the displayed canvas. So if the 'style' version is larger,
    // we will get a blurry canvas.
    ctx.canvas.width = options.sizePX;
    ctx.canvas.height = options.sizePX;
    canvas.style.width = `${options.sizePX}px`;
    canvas.style.height = `${options.sizePX}px`;
    return { sizePX: options.sizePX, canvas, ctx };
}

export function clear(graphic: Graphic): void {
    graphic.ctx.clearRect(0, 0, graphic.ctx.canvas.width, graphic.ctx.canvas.height);
}

export function callWithViewspacePoints<T, U>(
    graphic: Graphic,
    getPoints: () => Array6<Point>,
    onSomeOutsideViewspace: () => U,
    onAllVisible: (points: Array6<Point>) => T,
): T | U {
    const ps = getPoints();
    for (let i = 0; i < ps.length; ++i) {
        const vp = worldToViewTransformGuarded(graphic, ps[i]);
        if (vp === undefined) {
            return onSomeOutsideViewspace();
        }
        ps[i] = vp;
    }
    return onAllVisible(ps);
}