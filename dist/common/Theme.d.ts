export declare const _ColorTheme_darkThemeColor = 0;
export declare const _ColorTheme_lightThemeColor = 1;
export type ColorTheme = {
    [_ColorTheme_darkThemeColor]: string;
    [_ColorTheme_lightThemeColor]: string;
};
export declare const equals: (ct1: ColorTheme, ct2: ColorTheme) => boolean;
export declare const zero: () => ColorTheme;
