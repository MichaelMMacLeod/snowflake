export type RGBA = {
    r: number;
    g: number;
    b: number;
    a: number;
};
export declare function equals(c1: RGBA, c2: RGBA): boolean;
export declare function toString({ r, g, b, a }: RGBA): string;
export declare function black(): RGBA;
export declare function white(): RGBA;
