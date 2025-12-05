import { UnparsedConfig } from "./Config.js";
export default class SnowflakeGraphElement extends HTMLElement {
    #private;
    constructor();
    configure(unparsedConfig: UnparsedConfig): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    adoptedCallback(): void;
}
