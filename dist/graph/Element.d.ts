import { GraphConfig } from "./Config.js";
export default class SnowflakeGraphElement extends HTMLElement {
    #private;
    constructor();
    connectedCallback(): void;
    configure<K extends keyof GraphConfig>(key: K, value: GraphConfig[K]): void;
    configuredValue<K extends keyof GraphConfig>(key: K): GraphConfig[K];
}
