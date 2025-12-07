import { Maybe } from "maybe-either/Maybe";
export declare const _graphic_sizePX = 0;
export declare const _graphic_canvas = 1;
export declare const _graphic_ctx = 2;
export type Graphic = {
    [_graphic_sizePX]: number;
    [_graphic_canvas]: HTMLCanvasElement;
    [_graphic_ctx]: CanvasRenderingContext2D;
};
export declare const zero: (sizePX: number) => Maybe<Graphic>;
export declare const clear: (g: Graphic) => void;
