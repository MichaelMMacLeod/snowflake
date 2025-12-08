export declare const getOrDefault: <C, K extends keyof C>(defaultConfig: C, cfg: C, key: K) => C[K];
export type ResetRequired = true;
export type ResetUnecessary = false;
export type ResetStatus = ResetRequired | ResetUnecessary;
export declare const resetRequred = true;
export declare const resetUnecessary = false;
export type CfgFunction<S, C, K extends keyof C> = (cfg: C, state: S, oldValue: C[K], newValue: C[K]) => ResetStatus;
export type CfgFunctionArray<S, C> = {
    [K in keyof C]: CfgFunction<S, C, K>;
};
export declare const configure: <S, C, K extends keyof C>(cfgFunctions: CfgFunctionArray<S, C>, oldCfg: C, state: S, key: K, value: C[K], defaultConfig: C, resetState: (state: S) => void) => void;
