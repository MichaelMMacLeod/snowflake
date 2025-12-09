import { parseSnowflakeIDString } from "../common/SnowflakeID.js";
import * as SnowflakeIDs from "../common/SnowflakeID.js";
import * as Maybes from "maybe-either/Maybe";
import { _State_cfg, _State_graphic, initializeGraphic } from "./State.js";
import * as States from "./State.js";
import * as Configs from "../common/Config.js";
import { _graphic_canvas } from "./Graphic.js";
import { _SnowflakeConfig_snowflakeCanvasSizePX, _SnowflakeConfig_snowflakeID, snowflakeCfgFunctions, snowflakeDefaultConfig } from "./SnowflakeConfig.js";
export default class SnowflakeElement extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        this.state = States.zero();
    }
    connectedCallback() {
        Maybes.map(initializeGraphic(this.state, this.state[_State_cfg][_SnowflakeConfig_snowflakeCanvasSizePX]), () => { throw new Error("couldn't get canvas 2d context"); }, g => {
            this.shadow.appendChild(g[_graphic_canvas]);
        });
    }
    configure(key, value) {
        const cfg = this.state[_State_cfg];
        Configs.configure(snowflakeCfgFunctions, cfg, this.state, key, value, snowflakeDefaultConfig, States.reset);
    }
    configuredValue(key) {
        return this.state[_State_cfg][key];
    }
    reset() {
        States.reset(this.state);
    }
    parseSnowflakeID(id) {
        return parseSnowflakeIDString(id);
    }
    randomSnowflakeId() {
        return SnowflakeIDs.randomSnowflakeID();
    }
    snowflakeIDString() {
        return SnowflakeIDs.formatAsSnowflakeIDString(this.state[_State_cfg][_SnowflakeConfig_snowflakeID]);
    }
    percentGrown() {
        return States.percentGrown(this.state);
    }
    canvas() {
        return Maybes.unwrapOr(this.state[_State_graphic], () => { throw new Error('element not yet inserted into document'); })[_graphic_canvas];
    }
}
//# sourceMappingURL=Element.js.map