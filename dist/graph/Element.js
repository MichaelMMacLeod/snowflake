var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SnowflakeGraphElement_shadow, _SnowflakeGraphElement_config, _SnowflakeGraphElement_state;
import { parseConfigAndDisplayErrors, sync } from "../common/Config.js";
import { none, some } from "maybe-either/Maybe";
import * as GraphStates from "./State.js";
import { configParser, configSynchronizer } from "./Config.js";
import * as GraphConfigs from "./Config.js";
class SnowflakeGraphElement extends HTMLElement {
    constructor() {
        super();
        _SnowflakeGraphElement_shadow.set(this, void 0);
        _SnowflakeGraphElement_config.set(this, void 0);
        _SnowflakeGraphElement_state.set(this, void 0);
        __classPrivateFieldSet(this, _SnowflakeGraphElement_shadow, this.attachShadow({ mode: 'open' }), "f");
        __classPrivateFieldSet(this, _SnowflakeGraphElement_config, GraphConfigs.zero(), "f");
        __classPrivateFieldSet(this, _SnowflakeGraphElement_state, GraphStates.zero(), "f");
        sync(configSynchronizer, __classPrivateFieldGet(this, _SnowflakeGraphElement_state, "f"), () => { return; }, none, __classPrivateFieldGet(this, _SnowflakeGraphElement_config, "f"));
    }
    configure(unparsedConfig) {
        const config = parseConfigAndDisplayErrors(configParser, unparsedConfig);
        sync(configSynchronizer, __classPrivateFieldGet(this, _SnowflakeGraphElement_state, "f"), () => { return; }, some(__classPrivateFieldGet(this, _SnowflakeGraphElement_config, "f")), config);
        __classPrivateFieldSet(this, _SnowflakeGraphElement_config, config, "f");
    }
    connectedCallback() {
        const element = GraphStates.initialize(__classPrivateFieldGet(this, _SnowflakeGraphElement_state, "f"));
        __classPrivateFieldGet(this, _SnowflakeGraphElement_shadow, "f").appendChild(element);
    }
    disconnectedCallback() {
        console.log('sfg disconnectedCallback');
    }
    adoptedCallback() {
        console.log('sfg adoptedCallback');
    }
}
_SnowflakeGraphElement_shadow = new WeakMap(), _SnowflakeGraphElement_config = new WeakMap(), _SnowflakeGraphElement_state = new WeakMap();
export default SnowflakeGraphElement;
//# sourceMappingURL=Element.js.map