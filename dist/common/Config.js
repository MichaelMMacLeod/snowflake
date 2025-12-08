export const getOrDefault = (defaultConfig, cfg, key) => {
    const value = cfg[key];
    if (value !== undefined) {
        return value;
    }
    return defaultConfig[key];
};
export const resetRequred = true;
export const resetUnecessary = false;
export const configure = (cfgFunctions, oldCfg, state, key, value, defaultConfig, resetState) => {
    const oldValue = getOrDefault(defaultConfig, oldCfg, key);
    oldCfg[key] = value;
    const resetStatus = cfgFunctions[key](oldCfg, state, oldValue, value);
    if (resetStatus === resetRequred) {
        resetState(state);
    }
};
//# sourceMappingURL=Config.js.map