export const _ColorScheme_darkThemeColor = 0;
export const _ColorScheme_lightThemeColor = 1;

export type ColorScheme = {
    [_ColorScheme_darkThemeColor]: string,
    [_ColorScheme_lightThemeColor]: string,
}

export const equals = (ct1: ColorScheme, ct2: ColorScheme): boolean => {
    return ct1[_ColorScheme_darkThemeColor] === ct2[_ColorScheme_darkThemeColor]
        && ct1[_ColorScheme_lightThemeColor] === ct2[_ColorScheme_lightThemeColor];
}

export const zero = (): ColorScheme => {
    // Counterintuitively, the 'dark theme color' is light, because
    // 'dark theme' here means 'draw with a dark background'. We're
    // only concerned here with the foreground, which is why the
    // 'dark' color is white and the 'light' color is black.
    const darkThemeColor = 'oklab(1 0 0 / 0.2)';
    const lightThemeColor = 'oklab(0 0 0 / 0.2)';
    return [
        darkThemeColor,
        lightThemeColor,
    ];
}