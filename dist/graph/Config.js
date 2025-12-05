import { parseBool, parseConfigAndDisplayErrors, parseFunction1, parseNonnegativeFloat, parsePositiveFloat, parseSnowflakeID, randomSnowflakeIDString } from "../common/Config.js";
import { arraysEqual } from "../common/Utils.js";
import * as Maybes from "maybe-either/Maybe";
import { setAspectRatio, setIsLightTheme, setPercentGrown, setSnowflakeID } from "./State.js";
export const configParser = {
    percentGrown: parseNonnegativeFloat,
    snowflakeID: parseSnowflakeID,
    aspectRatio: parsePositiveFloat,
    isLightTheme: parseBool,
    handleMovedCallback: parseFunction1,
};
export const zero = () => {
    return parseConfigAndDisplayErrors(configParser, {
        percentGrown: 0,
        snowflakeID: randomSnowflakeIDString(),
        aspectRatio: 3,
        isLightTheme: true,
        handleMovedCallback: _id => { return; },
    });
};
export const configSynchronizer = {
    percentGrown: (_c, s, newValue, oldValue) => {
        const newEqOld = Maybes.map(oldValue, () => false, oldValue => newValue === oldValue);
        if (!newEqOld) {
            setPercentGrown(s, newValue);
            return true;
        }
        return false;
    },
    snowflakeID: (_c, s, newValue, oldValue) => {
        const eqNumber = (a, b) => a === b;
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
    isLightTheme: (_c, s, newValue, oldValue) => {
        const newEqOld = Maybes.map(oldValue, () => false, oldValue => newValue === oldValue);
        if (!newEqOld) {
            setIsLightTheme(s, newValue);
            return true;
        }
        return false;
    },
    handleMovedCallback: (_c, s, newValue, oldValue) => {
        Maybes.mapSome(s.graph, g => g.handleMovedCallback = newValue);
        return false;
    },
};
//# sourceMappingURL=Config.js.map