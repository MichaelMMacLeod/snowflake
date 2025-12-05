export type RGBA = {
    r: number;
    g: number;
    b: number;
    a: number;
};
export declare const equals: (c1: RGBA, c2: RGBA) => boolean;
export declare const toString: ({ r, g, b, a }: RGBA) => string;
export declare const black: () => RGBA;
export declare const white: () => RGBA;
