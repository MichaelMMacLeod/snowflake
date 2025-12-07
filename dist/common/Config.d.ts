import * as Eithers from "maybe-either/Either";
import { Either } from "maybe-either/Either";
import { Maybe } from "maybe-either/Maybe";
import { NonEmptyArray, SnowflakeID } from "./Utils.js";
export declare const isBoolean: (value: any) => value is boolean;
export declare const isFunction: (value: any) => boolean;
export declare const isNumber: (value: any) => value is number;
export declare const isFunctionN: (value: any, argCount: number) => boolean;
export declare const isFunction0: (value: any) => value is () => any;
export declare const isFunction1: (value: any) => value is (a: any) => any;
export declare const parseRGBComponent: (value: any) => Either<string, number>;
export declare const parseAlphaComponent: (value: any) => Either<string, number>;
export declare const parseSnowflakeID: (value: any) => Either<string, NonEmptyArray<number>>;
export declare const parseNat: (value: any) => Either<string, number>;
export declare const parseNonnegativeFloat: (value: any) => Either<string, number>;
export declare const parsePositiveFloat: (value: any) => Either<string, number>;
export declare const parseBool: (value: any) => Eithers.Either<string, boolean>;
export declare const parseFunction0: (value: any) => Eithers.Either<string, () => any>;
export declare const parseFunction1: (value: any) => Eithers.Either<string, (a: any) => any>;
export type ParserFailure = {
    expected: string;
    actual: any;
};
export declare const isObject: (value: any) => value is Object;
export type ConfigParser<UnparsedConfig, Config> = {
    [K in keyof UnparsedConfig]: (value: any) => K extends keyof Config ? Either<string, Config[K]> : never;
};
export declare const parseConfig: <UnparsedConfig, Config>(u: UnparsedConfig, configParser: ConfigParser<UnparsedConfig, Config>) => Either<Array<ParserFailure>, Config>;
export declare const parseErrorString: (e: ParserFailure) => string;
export declare const parseErrorsString: (e: Array<ParserFailure>) => string;
export declare const parseConfigAndDisplayErrors: <UnparsedConfig, Config>(configParser: ConfigParser<UnparsedConfig, Config>, u: UnparsedConfig) => Config;
export declare const snowflakeIDString: (id: NonEmptyArray<number>) => SnowflakeID;
export declare const randomSnowflakeId: () => NonEmptyArray<number>;
export declare const randomSnowflakeIDString: () => SnowflakeID;
export type ConfigSynchronizer<State, Config> = {
    [K in keyof Config]: (c: Config, s: State, newValue: Config[K], oldValue: Maybe<Config[K]>) => boolean;
};
export declare const sync: <Config extends Object, State>(configSynchronizer: ConfigSynchronizer<State, Config>, state: State, resetState: () => void, oldConfig: Maybe<Config>, newConfig: Config) => void;
