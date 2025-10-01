import {
    ConfigParser, ConfigSynchronizer, parseConfigAndDisplayErrors, parseFunction1,
    parseNonnegativeFloat, parsePositiveFloat, parseSnowflakeID, randomSnowflakeIDString
} from "../common/Config";
import { arraysEqual, NonEmptyArray } from "../common/Utils";
import * as Maybes from "../common/Maybe";
import { GraphState, setAspectRatio, setPercentGrown, setSnowflakeID } from "./State";

export type UnparsedConfig = {
    percentGrown: number,
    snowflakeID: string,
    aspectRatio: number,
    handleMovedCallback: (snowflakeID: string) => void,
};

export type Config = {
    percentGrown: number,
    snowflakeID: NonEmptyArray<number>,
    aspectRatio: number,
    handleMovedCallback: (snowflakeID: string) => void,
};

export const configParser: ConfigParser<UnparsedConfig, Config> = {
    percentGrown: parseNonnegativeFloat,
    snowflakeID: parseSnowflakeID,
    aspectRatio: parsePositiveFloat,
    handleMovedCallback: parseFunction1,
};

export function zero(): Config {
    return parseConfigAndDisplayErrors(
        configParser,
        {
            percentGrown: 0,
            snowflakeID: randomSnowflakeIDString(),
            aspectRatio: 3,
            handleMovedCallback: _id => { return; },
        },
    );
}

export const configSynchronizer: ConfigSynchronizer<GraphState, Config> = {
    percentGrown: (_c, s, newValue, oldValue) => {
        const newEqOld = Maybes.map(oldValue, () => false, oldValue => newValue === oldValue);
        if (!newEqOld) {
            setPercentGrown(s, newValue);
            return true;
        }
        return false;
    },
    snowflakeID: (_c, s, newValue, oldValue) => {
        const eqNumber = (a: number, b: number) => a === b;
        const newEqOld = Maybes.map(oldValue, () => false, oldValue => arraysEqual(newValue, oldValue, eqNumber));
        if (!newEqOld) {
            setSnowflakeID(s, newValue);
            return true;
        }
        return false;
    },
    aspectRatio: (_c, s, newValue, oldValue) => {
        const newEqOld = Maybes.map(oldValue, () => false, oldValue => newValue === oldValue);
        if (!newEqOld) {
            setAspectRatio(s, newValue);
            return true;
        }
        return false;
    },
    handleMovedCallback: (_c, s, newValue, oldValue) => {
        Maybes.mapSome(s.graph, g => g.handleMovedCallback = newValue);
        return false;
    },
};