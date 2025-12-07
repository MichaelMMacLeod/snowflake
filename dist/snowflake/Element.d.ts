import { SnowflakeID } from "../common/Utils.js";
import { SnowflakeConfig } from "./SnowflakeConfig.js";
export default class SnowflakeElement extends HTMLElement {
    #private;
    constructor();
    connectedCallback(): void;
    configure<K extends keyof SnowflakeConfig>(key: K, value: SnowflakeConfig[K]): void;
    configuredValue<K extends keyof SnowflakeConfig>(key: K): SnowflakeConfig[K];
    reset(): void;
    isValidSnowflakeId(id: string): id is SnowflakeID;
    randomSnowflakeId(): SnowflakeID;
    percentGrown(): number;
    canvas(): HTMLCanvasElement;
}
