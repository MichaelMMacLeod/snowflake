export const _ColorTheme_darkThemeColor = 0;
export const _ColorTheme_lightThemeColor = 1;
export const equals = (ct1, ct2) => {
    return ct1[_ColorTheme_darkThemeColor] === ct2[_ColorTheme_darkThemeColor]
        && ct1[_ColorTheme_lightThemeColor] === ct2[_ColorTheme_lightThemeColor];
};
export const zero = () => {
    // Counterintuitively, the 'dark theme color' is light, because
    // 'dark theme' here means 'draw with a dark background'. We're
    // only concerned here with the foreground, which is why the
    // 'dark' color is white and the 'light' color is black.
    const darkThemeColor = '#ffffffff';
    const lightThemeColor = '#000000';
    return [
        darkThemeColor,
        lightThemeColor,
    ];
};
//# sourceMappingURL=Theme.js.map