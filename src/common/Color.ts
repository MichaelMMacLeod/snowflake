export type RGBA = {
    r: number,
    g: number,
    b: number,
    a: number,
}

export type ColorScheme = {
    background: RGBA,
    foreground: RGBA,
}

export type ColorTheme = {
    dark: ColorScheme,
    light: ColorScheme,
}