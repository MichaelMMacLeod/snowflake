import { none, some } from "maybe-either/Maybe";
export const _graphic_sizePX = 0;
export const _graphic_canvas = 1;
export const _graphic_ctx = 2;
export const zero = (sizePX) => {
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
};
export const clear = (g) => {
    const c = g[_graphic_canvas];
    g[_graphic_ctx].clearRect(0, 0, c.width, c.height);
};
//# sourceMappingURL=Graphic.js.map