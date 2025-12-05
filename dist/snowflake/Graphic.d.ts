import { Maybe } from "maybe-either/Maybe";
export type Graphic = {
    sizePX: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
};
export declare const make: (sizePX: number) => Maybe<Graphic>;
export declare const clear: (graphic: Graphic) => void;
