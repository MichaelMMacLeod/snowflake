import { SnowflakeID } from "../common/SnowflakeID.js";
import { State } from "./State.js";
import { SnowflakeConfig } from "./SnowflakeConfig.js";
import { Either } from "maybe-either/Either";
export default class SnowflakeElement extends HTMLElement {
    state: State;
    shadow: ShadowRoot;
    constructor();
    connectedCallback(): void;
    configure<K extends keyof SnowflakeConfig>(key: K, value: SnowflakeConfig[K]): void;
    configuredValue<K extends keyof SnowflakeConfig>(key: K): SnowflakeConfig[K];
    reset(): void;
    parseSnowflakeID(id: string): Either<string, SnowflakeID>;
    randomSnowflakeId(): SnowflakeID;
    snowflakeIDString(): string;
    percentGrown(): number;
    canvas(): HTMLCanvasElement;
}
