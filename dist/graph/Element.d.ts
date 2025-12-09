import { GraphState } from "./State.js";
import { GraphConfig } from "./GraphConfig.js";
export default class SnowflakeGraphElement extends HTMLElement {
    shadow: ShadowRoot;
    state: GraphState;
    constructor();
    connectedCallback(): void;
    configure<K extends keyof GraphConfig>(key: K, value: GraphConfig[K]): void;
    configuredValue<K extends keyof GraphConfig>(key: K): GraphConfig[K];
}
