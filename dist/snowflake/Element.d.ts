import { UnparsedConfig } from "./Config.js";
import { SnowflakeID } from "../common/Utils.js";
export default class SnowflakeElement extends HTMLElement {
    #private;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    adoptedCallback(): void;
    configure(unparsedConfig: UnparsedConfig): void;
    reset(): void;
    isValidSnowflakeId(id: string): id is SnowflakeID;
    randomSnowflakeId(): SnowflakeID;
    percentGrown(): number;
    canvas(): HTMLCanvasElement;
}
