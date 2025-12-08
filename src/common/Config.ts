export const getOrDefault = <C, K extends keyof C>(defaultConfig: C, cfg: C, key: K): C[K] => {
    const value = cfg[key];
    if (value !== undefined) {
        return value;
    }
    return defaultConfig[key];
};

export type ResetRequired = true;
export type ResetUnecessary = false;
export type ResetStatus = ResetRequired | ResetUnecessary;
export const resetRequred = true;
export const resetUnecessary = false;

export type CfgFunction<S, C, K extends keyof C> = (
    cfg: C,
    state: S,
    oldValue: C[K],
    newValue: C[K]
) => ResetStatus;

export type CfgFunctionArray<S, C> = { [K in keyof C]: CfgFunction<S, C, K> };

export const configure = <S, C, K extends keyof C>(
    cfgFunctions: CfgFunctionArray<S, C>,
    oldCfg: C,
    state: S,
    key: K,
    value: C[K],
    defaultConfig: C,
    resetState: (state: S) => void,
) => {
    const oldValue = getOrDefault(defaultConfig, oldCfg, key);
    oldCfg[key] = value;
    const resetStatus = cfgFunctions[key](oldCfg, state, oldValue, value);
    if (resetStatus === resetRequred) {
        resetState(state);
    }
};