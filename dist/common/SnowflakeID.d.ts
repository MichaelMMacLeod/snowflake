import { Either } from "maybe-either/Either";
import { NonEmptyArray, SnowflakeID } from "./Utils.js";
export declare const parseSnowflakeID: (value: any) => Either<string, NonEmptyArray<number>>;
export declare const snowflakeIDString: (id: NonEmptyArray<number>) => SnowflakeID;
export declare const randomSnowflakeId: () => NonEmptyArray<number>;
export declare const randomSnowflakeIDString: () => SnowflakeID;
