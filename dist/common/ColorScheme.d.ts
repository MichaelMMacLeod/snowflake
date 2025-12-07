export declare const _ColorScheme_darkThemeColor = 0;
export declare const _ColorScheme_lightThemeColor = 1;
export type ColorScheme = {
    [_ColorScheme_darkThemeColor]: string;
    [_ColorScheme_lightThemeColor]: string;
};
export declare const equals: (ct1: ColorScheme, ct2: ColorScheme) => boolean;
export declare const defaultDarkThemeColor = "oklab(1 0 0 / 0.2)";
export declare const defaultLightThemeColor = "oklab(0 0 0 / 0.2)";
export declare const defaultGraphDarkThemeColor = "oklab(1 0 0)";
export declare const defaultGraphLightThemeColor = "oklab(0 0 0)";
export declare const zero: () => ColorScheme;
