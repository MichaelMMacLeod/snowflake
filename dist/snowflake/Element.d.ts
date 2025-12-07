import { SnowflakeID } from "../common/Utils.js";
import { Cfg } from "./Config.js";
export default class SnowflakeElement extends HTMLElement {
    #private;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    adoptedCallback(): void;
    configure<K extends keyof Required<Cfg>>(key: K, value: Required<Cfg>[K]): void;
    configuredValue<K extends keyof Required<Cfg>>(key: K): Required<Cfg>[K];
    reset(): void;
    isValidSnowflakeId(id: string): id is SnowflakeID;
    randomSnowflakeId(): SnowflakeID;
    percentGrown(): number;
    canvas(): HTMLCanvasElement;
}
