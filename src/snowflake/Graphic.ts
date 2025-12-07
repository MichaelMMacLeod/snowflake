import { Maybe, none, some } from "maybe-either/Maybe";

export const _graphic_sizePX = 0;
export const _graphic_canvas = 1;
export const _graphic_ctx = 2;

export type Graphic = {
    [_graphic_sizePX]: number,
    [_graphic_canvas]: HTMLCanvasElement,
    [_graphic_ctx]: CanvasRenderingContext2D,
};

export const zero = (sizePX: number): Maybe<Graphic> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
        return none;
    }
    // Setting ctx.canvas.(width|height) changes the number of pixels we
    // can render to. Changing canvas.style.(width|height) changes the
    // size of the displayed canvas. So if the 'style' version is larger,
    // we will get a blurry canvas.
    canvas.width = sizePX;
    canvas.height = sizePX;
    canvas.style.width = `${sizePX}px`;
    canvas.style.height = `${sizePX}px`;
    canvas.className = 'sf-canvas';
    return some([sizePX, canvas, ctx]);
}

export const clear = (g: Graphic): void => {
    const c = g[_graphic_canvas];
    g[_graphic_ctx].clearRect(0, 0, c.width, c.height);
}