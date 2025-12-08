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
var _SnowflakeElement_state, _SnowflakeElement_shadow;
import { parseSnowflakeIDString } from "../common/SnowflakeID.js";
import * as SnowflakeIDs from "../common/SnowflakeID.js";
import * as Maybes from "maybe-either/Maybe";
import { _State_cfg, _State_graphic, initializeGraphic } from "./State.js";
import * as States from "./State.js";
import * as Configs from "../common/Config.js";
import { _graphic_canvas } from "./Graphic.js";
import { _SnowflakeConfig_snowflakeCanvasSizePX, _SnowflakeConfig_snowflakeID, snowflakeCfgFunctions, snowflakeDefaultConfig } from "./SnowflakeConfig.js";
class SnowflakeElement extends HTMLElement {
    constructor() {
        super();
        _SnowflakeElement_state.set(this, void 0);
        _SnowflakeElement_shadow.set(this, void 0);
        __classPrivateFieldSet(this, _SnowflakeElement_shadow, this.attachShadow({ mode: 'open' }), "f");
        __classPrivateFieldSet(this, _SnowflakeElement_state, States.zero(), "f");
    }
    connectedCallback() {
        Maybes.map(initializeGraphic(__classPrivateFieldGet(this, _SnowflakeElement_state, "f"), __classPrivateFieldGet(this, _SnowflakeElement_state, "f")[_State_cfg][_SnowflakeConfig_snowflakeCanvasSizePX]), () => { throw new Error("couldn't get canvas 2d context"); }, g => {
            __classPrivateFieldGet(this, _SnowflakeElement_shadow, "f").appendChild(g[_graphic_canvas]);
        });
    }
    configure(key, value) {
        const cfg = __classPrivateFieldGet(this, _SnowflakeElement_state, "f")[_State_cfg];
        Configs.configure(snowflakeCfgFunctions, cfg, __classPrivateFieldGet(this, _SnowflakeElement_state, "f"), key, value, snowflakeDefaultConfig, States.reset);
    }
    configuredValue(key) {
        return __classPrivateFieldGet(this, _SnowflakeElement_state, "f")[_State_cfg][key];
    }
    reset() {
        States.reset(__classPrivateFieldGet(this, _SnowflakeElement_state, "f"));
    }
    parseSnowflakeID(id) {
        return parseSnowflakeIDString(id);
    }
    randomSnowflakeId() {
        return SnowflakeIDs.randomSnowflakeID();
    }
    snowflakeIDString() {
        return SnowflakeIDs.formatAsSnowflakeIDString(__classPrivateFieldGet(this, _SnowflakeElement_state, "f")[_State_cfg][_SnowflakeConfig_snowflakeID]);
    }
    percentGrown() {
        return States.percentGrown(__classPrivateFieldGet(this, _SnowflakeElement_state, "f"));
    }
    canvas() {
        return Maybes.unwrapOr(__classPrivateFieldGet(this, _SnowflakeElement_state, "f")[_State_graphic], () => { throw new Error('element not yet inserted into document'); })[_graphic_canvas];
    }
}
_SnowflakeElement_state = new WeakMap(), _SnowflakeElement_shadow = new WeakMap();
export default SnowflakeElement;
//# sourceMappingURL=Element.js.map