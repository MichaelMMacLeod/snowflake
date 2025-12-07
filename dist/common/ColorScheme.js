export const _ColorScheme_darkThemeColor = 0;
export const _ColorScheme_lightThemeColor = 1;
export const equals = (ct1, ct2) => {
    return ct1[_ColorScheme_darkThemeColor] === ct2[_ColorScheme_darkThemeColor]
        && ct1[_ColorScheme_lightThemeColor] === ct2[_ColorScheme_lightThemeColor];
};
// Counterintuitively, the 'dark theme color' is light, because
// 'dark theme' here means 'draw with a dark background'. We're
// only concerned here with the foreground, which is why the
// 'dark' color is white and the 'light' color is black.
export const defaultDarkThemeColor = 'oklab(1 0 0 / 0.2)';
export const defaultLightThemeColor = 'oklab(0 0 0 / 0.2)';
export const defaultGraphDarkThemeColor = 'oklab(1 0 0)';
export const defaultGraphLightThemeColor = 'oklab(0 0 0)';
export const zero = () => {
    return [
        defaultDarkThemeColor,
        defaultLightThemeColor,
    ];
};
//# sourceMappingURL=ColorScheme.js.map