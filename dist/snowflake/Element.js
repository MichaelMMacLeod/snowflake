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
var _SnowflakeElement_state, _SnowflakeElement_config, _SnowflakeElement_shadow;
import { parseConfigAndDisplayErrors, parseSnowflakeID, randomSnowflakeIDString, sync } from "../common/Config.js";
import { none, some } from "maybe-either/Maybe";
import * as Maybes from "maybe-either/Maybe";
import { initializeGraphic } from "./State.js";
import * as Eithers from "maybe-either/Either";
import * as States from "./State.js";
import { configParser, configSynchronizer } from "./Config.js";
import * as Configs from "./Config.js";
import { _graphic_canvas } from "./Graphic.js";
class SnowflakeElement extends HTMLElement {
    constructor() {
        super();
        _SnowflakeElement_state.set(this, void 0);
        _SnowflakeElement_config.set(this, void 0);
        _SnowflakeElement_shadow.set(this, void 0);
        __classPrivateFieldSet(this, _SnowflakeElement_shadow, this.attachShadow({ mode: 'open' }), "f");
        __classPrivateFieldSet(this, _SnowflakeElement_state, States.zero(), "f");
        __classPrivateFieldSet(this, _SnowflakeElement_config, Configs.zero(), "f");
        sync(configSynchronizer, __classPrivateFieldGet(this, _SnowflakeElement_state, "f"), () => States.reset(__classPrivateFieldGet(this, _SnowflakeElement_state, "f")), none, __classPrivateFieldGet(this, _SnowflakeElement_config, "f"));
    }
    connectedCallback() {
        Maybes.map(initializeGraphic(__classPrivateFieldGet(this, _SnowflakeElement_state, "f"), __classPrivateFieldGet(this, _SnowflakeElement_config, "f").snowflakeCanvasSizePX), () => { throw new Error("couldn't get canvas 2d context"); }, g => {
            __classPrivateFieldGet(this, _SnowflakeElement_shadow, "f").appendChild(g[_graphic_canvas]);
        });
    }
    disconnectedCallback() { }
    adoptedCallback() { }
    configure(unparsedConfig) {
        const config = parseConfigAndDisplayErrors(configParser, unparsedConfig);
        sync(configSynchronizer, __classPrivateFieldGet(this, _SnowflakeElement_state, "f"), () => States.reset(__classPrivateFieldGet(this, _SnowflakeElement_state, "f")), some(__classPrivateFieldGet(this, _SnowflakeElement_config, "f")), config);
        __classPrivateFieldSet(this, _SnowflakeElement_config, config, "f");
    }
    reset() {
        States.reset(__classPrivateFieldGet(this, _SnowflakeElement_state, "f"));
    }
    isValidSnowflakeId(id) {
        return Eithers.map(parseSnowflakeID(id), () => false, () => true);
    }
    randomSnowflakeId() {
        return randomSnowflakeIDString();
    }
    percentGrown() {
        return States.percentGrown(__classPrivateFieldGet(this, _SnowflakeElement_state, "f"));
    }
    canvas() {
        return Maybes.unwrapOr(__classPrivateFieldGet(this, _SnowflakeElement_state, "f")[States._graphic], () => { throw new Error('element not yet inserted into document'); })[_graphic_canvas];
    }
}
_SnowflakeElement_state = new WeakMap(), _SnowflakeElement_config = new WeakMap(), _SnowflakeElement_shadow = new WeakMap();
export default SnowflakeElement;
//# sourceMappingURL=Element.js.map