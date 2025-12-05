import { ConfigParser, ConfigSynchronizer } from "../common/Config.js";
import { NonEmptyArray, SnowflakeID } from "../common/Utils.js";
import { GraphState } from "./State.js";
export type UnparsedConfig = Partial<{
    percentGrown: number;
    snowflakeID: string;
    aspectRatio: number;
    isLightTheme: boolean;
    handleMovedCallback: (snowflakeID: SnowflakeID) => void;
}>;
export type Config = {
    percentGrown: number;
    snowflakeID: NonEmptyArray<number>;
    aspectRatio: number;
    isLightTheme: boolean;
    handleMovedCallback: (snowflakeID: SnowflakeID) => void;
};
export declare const configParser: ConfigParser<UnparsedConfig, Config>;
export declare const zero: () => Config;
export declare const configSynchronizer: ConfigSynchronizer<GraphState, Config>;
