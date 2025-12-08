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
import * as GraphStates from "./State.js";
import { graphDefaultConfig, graphCfgFunctions } from "./GraphConfig.js";
import * as GraphConfigs from "./GraphConfig.js";
import * as Configs from "../common/Config.js";
class SnowflakeGraphElement extends HTMLElement {
    constructor() {
        super();
        _SnowflakeGraphElement_shadow.set(this, void 0);
        _SnowflakeGraphElement_config.set(this, void 0);
        _SnowflakeGraphElement_state.set(this, void 0);
        __classPrivateFieldSet(this, _SnowflakeGraphElement_shadow, this.attachShadow({ mode: 'open' }), "f");
        __classPrivateFieldSet(this, _SnowflakeGraphElement_config, Object.assign({}, graphDefaultConfig), "f");
        __classPrivateFieldSet(this, _SnowflakeGraphElement_state, GraphStates.zero(), "f");
        GraphConfigs.cfgKeys.forEach(key => {
            Configs.configure(graphCfgFunctions, __classPrivateFieldGet(this, _SnowflakeGraphElement_config, "f"), __classPrivateFieldGet(this, _SnowflakeGraphElement_state, "f"), key, __classPrivateFieldGet(this, _SnowflakeGraphElement_config, "f")[key], graphDefaultConfig, (_state) => { return; });
        });
    }
    connectedCallback() {
        const element = GraphStates.initialize(__classPrivateFieldGet(this, _SnowflakeGraphElement_state, "f"));
        __classPrivateFieldGet(this, _SnowflakeGraphElement_shadow, "f").appendChild(element);
    }
    configure(key, value) {
        const cfg = __classPrivateFieldGet(this, _SnowflakeGraphElement_config, "f");
        Configs.configure(graphCfgFunctions, cfg, __classPrivateFieldGet(this, _SnowflakeGraphElement_state, "f"), key, value, graphDefaultConfig, (_state) => { return; });
        cfg[key] = value;
    }
    configuredValue(key) {
        return __classPrivateFieldGet(this, _SnowflakeGraphElement_config, "f")[key];
    }
}
_SnowflakeGraphElement_shadow = new WeakMap(), _SnowflakeGraphElement_config = new WeakMap(), _SnowflakeGraphElement_state = new WeakMap();
export default SnowflakeGraphElement;
//# sourceMappingURL=Element.js.map