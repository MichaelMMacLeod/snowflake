var snowflake_graph;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ src_SnowflakeGraphElement)
});

;// ./src/Either.ts
function Either_left(value) {
    return { v: 0, d: value };
}
function Either_right(value) {
    return { v: 1, d: value };
}
function map(e, onLeft, onRight) {
    switch (e.v) {
        case 0:
            return onLeft(e.d);
        case 1:
            return onRight(e.d);
    }
}

;// ./src/Maybe.ts
function Maybe_none() {
    return { v: 0 };
}
function Maybe_some(value) {
    return { v: 1, d: value };
}
function Maybe_map(m, onNone, onSome) {
    switch (m.v) {
        case 0:
            return onNone();
        case 1:
            return onSome(m.d);
    }
}
function isSome(m) {
    return Maybe_map(m, () => false, _ => true);
}
function isNone(m) {
    return !isSome(m);
}
function mapSome(m, onSome) {
    switch (m.v) {
        case 0:
            return Maybe_none();
        case 1:
            return Maybe_some(onSome(m.d));
    }
}
function then(b, onTrue) {
    if (b) {
        return Maybe_some(onTrue());
    }
    return Maybe_none();
}
function unwrapOr(m, onNone) {
    return Maybe_map(m, onNone, v => v);
}
function orElse(m, onNone) {
    return Maybe_map(m, onNone, v => Maybe_some(v));
}
function expect(m, error) {
    return Maybe_map(m, () => { throw new Error(error); }, t => t);
}

;// ./src/Constants.ts
const oneSixthCircle = Math.PI * 2 / 6;
const overallScale = 1;
const faceSizeGrowthScalar = overallScale * 0.002;
const branchLengthGrowthScalar = overallScale * 0.0015;
const branchSizeGrowthScalar = overallScale * 0.0005;
const Constants_yChoices = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1];

;// ./src/Utils.ts





function rem(x, m) {
    return ((x % m) + m) % m;
}
function clamp(x, low, high) {
    return Math.min(Math.max(x, low), high);
}
function lerp(a, b, n) {
    return (1 - n) * a + n * b;
}
function fracPart(n) {
    return n % 1;
}
function makeArray6(f) {
    return [f(), f(), f(), f(), f(), f()];
}
function mapArray6(array, callbackfn, thisArg) {
    return array.map(callbackfn, thisArg);
}
function convertRGBAToString(rgba) {
    const { r, g, b, a } = rgba;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}
function randomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
const sideCacheConstructor = length => new Float64Array(length);
function interpretGrowth(growthInput, time) {
    let s = lerp(0, growthInput.length - 1, time);
    let n = fracPart(s);
    let a = yChoices[growthInput[Math.floor(s)]];
    let b = yChoices[growthInput[Math.ceil(s)]];
    let signedScale = lerp(a, b, n);
    // let timeScalar = -0.01 * s + 1;
    return {
        scale: /*timeScalar **/ Math.abs(signedScale),
        growthType: signedScale > 0.0 ? 'branching' : 'faceting',
    };
}
function okOrElse(m, onNone) {
    return Maybe_map(m, () => Either_left(onNone()), v => Either_right(v));
}
function ok(e) {
    return Eithers.map(e, () => none(), r => some(r));
}
function arraysEqual(a1, a2, eqT) {
    return a1.length === a2.length
        && a1.every((v, i) => eqT(v, a2[i]));
}

;// ./src/Config.ts




function isBoolean(value) {
    return typeof value === 'boolean';
}
function isFunction(value) {
    return typeof value === 'function';
}
function isFunctionN(value, argCount) {
    return isFunction(value) && value.length === argCount;
}
function isFunction0(value) {
    return isFunctionN(value, 0);
}
function isFunction1(value) {
    return isFunctionN(value, 1);
}
function parseSnowflakeID(value) {
    if (value.toString === undefined) {
        return Either_left('integer or string containing digits [1-9]');
    }
    const digits = value.toString();
    const result = [];
    for (let i = 0; i < digits.length; ++i) {
        const digit = parseInt(digits[i], 10);
        if (Number.isNaN(digit)) {
            return Either_left('integer or string containing digits [1-9]');
        }
        if (digit === 0) {
            return Either_left('integer or string containing digits [1-9]');
        }
        const parsedDigit = digit - 1;
        result.push(parsedDigit);
    }
    if (result.length === 0) {
        return Either_left('integer or string containing at least one nonzero digit');
    }
    return Either_right(result);
}
function parseNat(value) {
    if (!Number.isSafeInteger(value)) {
        return left('integer');
    }
    if (value < 0) {
        return left('nonnegative integer');
    }
    return right(value);
}
function parseNonnegativeFloat(value) {
    if (!Number.isFinite(value)) {
        return Either_left('finite, non-NaN float');
    }
    if (value < 0) {
        return Either_left('non-negative float');
    }
    return Either_right(value);
}
function parsePositiveFloat(value) {
    if (!Number.isFinite(value)) {
        return Either_left('finite, non-NaN float');
    }
    if (value <= 0) {
        return Either_left('positive float');
    }
    return Either_right(value);
}
function makeParser(predicate, expected) {
    return v => okOrElse(then(predicate(v), () => v), () => expected);
}
const parseBool = makeParser(isBoolean, 'boolean');
const parseFunction0 = makeParser(isFunction0, 'function requiring no arguments');
const parseFunction1 = makeParser(isFunction1, 'function requiring one argument');
function isObject(value) {
    return typeof value === 'object' && !Array.isArray(value) && value !== null;
}
function parseConfig(u, configParser) {
    const errors = [];
    const parser = configParser;
    const result = {};
    if (!isObject(u)) {
        errors.push({ expected: 'object', actual: JSON.stringify(u) });
        return Either_left(errors);
    }
    if (errors.length > 0) {
        return Either_left(errors);
    }
    for (const [k, v] of Object.entries(u)) {
        const kParser = parser[k];
        if (kParser === undefined) {
            errors.push({ expected: `object without key '${k}'`, actual: u });
        }
        else {
            const r = kParser(v);
            map(r, expectedType => errors.push({ expected: `${k} to be ${expectedType}`, actual: v }), parsed => result[k] = parsed);
        }
    }
    if (errors.length > 0) {
        return Either_left(errors);
    }
    return Either_right(result);
}
function parseErrorString(e) {
    return `expected ${e.expected}, received ${e.actual}`;
}
function parseErrorsString(e) {
    return 'errors detected when validating config\n' + e.map(parseErrorString).join('\n');
}
function parseConfigAndDisplayErrors(configParser, u) {
    return map(parseConfig(u, configParser), errors => { throw new Error(parseErrorsString(errors)); }, config => config);
}
function snowflakeIDString(id) {
    return id.map(n => n + 1).join('');
}
function randomSnowflakeId() {
    const id = [randomIntInclusive(0, 3)];
    for (let i = 1; i < 16; i++) {
        id.push(randomIntInclusive(0, 8));
    }
    return map(parseSnowflakeID(snowflakeIDString(id)), _err => { throw new Error(`randomSnowflakeId returned invalid ID: '${id}'`); }, _id => id);
}
function randomSnowflakeIDString() {
    return snowflakeIDString(randomSnowflakeId());
}
function sync(configSynchronizer, state, resetState, oldConfig, newConfig) {
    const cs = configSynchronizer;
    let needsReset = false;
    for (let [k, v] of Object.entries(newConfig)) {
        const oldValue = mapSome(oldConfig, old => old[k]);
        needsReset = cs[k](newConfig, state, v, oldValue) || needsReset;
    }
    if (needsReset) {
        resetState();
    }
}

;// ./src/SnowflakeGraph.ts




const SVG_NS = 'http://www.w3.org/2000/svg';
const SIZE_SCALAR = 0.5;
const VIEWPORT_WIDTH = 600;
const VIEWPORT_HEIGHT = 200;
const HANDLE_OUTER_HOVER_SCALE = 1.5;
const HANDLE_OUTER_SIZE = SIZE_SCALAR * 15;
const HANDLE_OUTER_HOVERED_SIZE = HANDLE_OUTER_SIZE * HANDLE_OUTER_HOVER_SCALE;
const HANDLE_INNER_SIZE = SIZE_SCALAR * 10;
const LINE_WIDTH = SIZE_SCALAR * 5;
const MARGIN_WIDTH = HANDLE_OUTER_HOVERED_SIZE * 2;
const MARGIN_HEIGHT = HANDLE_OUTER_HOVERED_SIZE * 2;
const GRAPHABLE_VIEWPORT_WIDTH = VIEWPORT_WIDTH - MARGIN_WIDTH * 2;
const GRAPHABLE_VIEWPORT_HEIGHT = VIEWPORT_HEIGHT - MARGIN_HEIGHT * 2;
const ROOT_ATTRS = {
    'viewBox': `0 0 ${VIEWPORT_WIDTH} ${VIEWPORT_HEIGHT}`,
    'xmlns': `${SVG_NS}`,
    'width': '60em',
    'height': '20em',
};
const ROOT_STYLE = `
@media (prefers-color-scheme: dark) {
  svg * {
    --SFG-color-background: #111111;
    --SFG-color-foreground: #ffffff;
  }
}

@media (prefers-color-scheme: light) {
  svg * {
    --SFG-color-background: #ffffff;
    --SFG-color-foreground: #000000;
  }
}

svg * {
  transform-box: fill-box;
}

.sf-graph-handle-inside {
  fill: var(--SFG-color-foreground);
}

.sf-graph-handle-outside {
  stroke: var(--SFG-color-foreground);
}

.sf-graph-handle-outside {
  scale: 1;
  transition: scale 0.1s;
  transform-origin: center;
}

.sf-graph-handle-outside:hover {
  scale: ${HANDLE_OUTER_HOVER_SCALE};
}

.sf-graph-line {
  stroke: var(--SFG-color-foreground);
}

.sf-graph-progress {
  fill: var(--SFG-color-foreground);
  fill-opacity: 0.1;
}

.sf-graph {
  filter: drop-shadow(0 0 ${10 * SIZE_SCALAR}px var(--SFG-color-foreground));
}
`;
const HANDLE_INSIDE_ATTRS = {
    'class': 'sf-graph-handle-inside',
    'r': `${HANDLE_INNER_SIZE}`,
    'cx': '0',
    'cy': '0',
};
const HANDLE_OUTSIDE_ATTRS = {
    'class': 'sf-graph-handle-outside',
    'r': `${HANDLE_OUTER_SIZE}`,
    'fill-opacity': '0',
    'stroke-width': `${LINE_WIDTH}`,
    'cx': '0',
    'cy': '0',
};
const LINE_ATTRS = {
    'class': 'sf-graph-line',
    'stroke-width': `${LINE_WIDTH}`,
    'fill': 'none',
};
const PROGRESS_ATTRS = {
    'class': 'sf-graph-progress',
    'x': `${MARGIN_WIDTH}`,
    'y': '0',
    'height': `${VIEWPORT_HEIGHT}`,
};
function setSVGAttributes(element, attributes) {
    for (const [k, v] of Object.entries(attributes)) {
        element.setAttribute(k, v);
    }
}
function createSVGElement(element, attributes) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', element);
    setSVGAttributes(svg, attributes);
    return svg;
}
function handleZero() {
    const g = createSVGElement('g', { 'class': 'sf-graph-handle' });
    const inside = createSVGElement('circle', HANDLE_INSIDE_ATTRS);
    const outside = createSVGElement('circle', HANDLE_OUTSIDE_ATTRS);
    g.appendChild(inside);
    g.appendChild(outside);
    return {
        g,
        inside,
        outside,
    };
}
function setHandleLocation(handle, x, y) {
    const attrs = { 'cx': x.toString(), 'cy': y.toString() };
    setSVGAttributes(handle.inside, attrs);
    setSVGAttributes(handle.outside, attrs);
}
function addHandle(g, x, y) {
    const result = handleZero();
    setHandleLocation(result, x, y);
    g.appendChild(result.g);
    g.appendChild(result.g);
    return result;
}
function createLine(g) {
    const result = createSVGElement('polyline', LINE_ATTRS);
    ;
    g.appendChild(result);
    return result;
}
function fitLineToHandles(line, handles) {
    const points = handles.map(h => {
        const x = h.inside.getAttribute('cx');
        const y = h.inside.getAttribute('cy');
        return `${x}, ${y}`;
    }).join(' ');
    setSVGAttributes(line, { 'points': points });
}
function createProgress(g) {
    const result = createSVGElement('rect', PROGRESS_ATTRS);
    g.appendChild(result);
    return result;
}
function fitProgressToGrowth(progress, percentGrown) {
    const width = GRAPHABLE_VIEWPORT_WIDTH * percentGrown;
    setSVGAttributes(progress, {
        'width': width.toString(),
        'height': VIEWPORT_HEIGHT.toString(),
    });
}
function syncToSnowflakeID(g) {
    const id = g.snowflakeID;
    while (g.handles.length < id.length) {
        g.handles.push(addHandle(g.g, 0, 0));
    }
    while (g.handles.length > id.length) {
        const h = g.handles.pop();
        if (h !== undefined) {
            h.g.remove();
        }
        else {
            throw new Error('h undefined');
        }
    }
    g.handles.forEach((h, i) => {
        const x0 = MARGIN_WIDTH;
        const y0 = MARGIN_HEIGHT;
        const dx = GRAPHABLE_VIEWPORT_WIDTH / (id.length - 1);
        const dy = GRAPHABLE_VIEWPORT_HEIGHT / (Constants_yChoices.length - 1);
        const x = x0 + dx * i;
        const y = y0 + dy * id[i];
        setSVGAttributes(h.inside, { 'cx': x.toString(), 'cy': y.toString() });
        setSVGAttributes(h.outside, { 'cx': x.toString(), 'cy': y.toString() });
    });
    fitLineToHandles(g.line, g.handles);
}
function syncToPercentGrown(g, percentGrown) {
    fitProgressToGrowth(g.progress, percentGrown);
}
function graphHandleCenter(g) {
    const r = g.getBoundingClientRect();
    return {
        x: r.x + r.width * 0.5,
        y: r.y + r.height * 0.5,
    };
}
function distanceToGraphHandle(g, p) {
    // return distance(graphHandleCenter(g), p);
    return Math.abs(graphHandleCenter(g).x - p.x);
}
function closestGraphHandle(g, ev) {
    const p = { x: ev.offsetX, y: ev.offsetY };
    let closest = 0;
    let closestDistance = Infinity;
    g.handles.forEach((h, i) => {
        const d = distanceToGraphHandle(h.outside, p);
        if (d < closestDistance) {
            closest = i;
            closestDistance = d;
        }
    });
    return closest;
}
function closestYChoice(g, p) {
    const r = g.root.getBoundingClientRect();
    const y = p.y / r.height;
    const i = Math.floor(y * Constants_yChoices.length);
    return clamp(i, 0, Constants_yChoices.length - 1);
}
function zero() {
    const root = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const style = document.createElement('style');
    style.textContent = ROOT_STYLE;
    root.appendChild(style);
    const g = createSVGElement('g', { 'class': 'sf-graph' });
    const result = {
        snowflakeID: [0, 0],
        root,
        g,
        handles: [],
        line: createLine(g),
        progress: createProgress(g),
        handleBeingDragged: Maybe_none(),
        mouseCoordinates: Maybe_none(),
        handleMovedCallback: (snowflakeID) => { return; },
    };
    function updateHandlePosition(h, ev) {
        const p = { x: ev.offsetX, y: ev.offsetY };
        const yChoice = closestYChoice(result, p);
        result.snowflakeID[h] = yChoice;
        syncToSnowflakeID(result);
        result.handleMovedCallback(snowflakeIDString(result.snowflakeID));
    }
    function handleMouseDown(ev) {
        const h = closestGraphHandle(result, ev);
        result.handleBeingDragged = Maybe_some(h);
        updateHandlePosition(h, ev);
    }
    function handleMouseUp(ev) {
        result.handleBeingDragged = Maybe_none();
    }
    function handleMouseMove(ev) {
        mapSome(result.handleBeingDragged, h => {
            updateHandlePosition(h, ev);
        });
    }
    root.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    result.root.appendChild(result.g);
    setSVGAttributes(result.root, ROOT_ATTRS);
    result.handles = [
        addHandle(g, 0, 0),
        addHandle(g, 0, 0),
    ];
    fitLineToHandles(result.line, result.handles);
    syncToSnowflakeID(result);
    return result;
}

;// ./src/SnowflakeGraphState.ts




function SnowflakeGraphState_zero() {
    return {
        graph: Maybe_none(),
        percentGrown: 0,
        aspectRatio: 3,
    };
}
function initialize(state) {
    return Maybe_map(state.graph, () => {
        const g = zero();
        state.graph = Maybe_some(g);
        return g.root;
    }, g => {
        return g.root;
    });
}
function setPercentGrown(state, percentGrown) {
    state.percentGrown = percentGrown;
    mapSome(state.graph, g => syncToPercentGrown(g, percentGrown));
}
function setSnowflakeID(state, snowflakeID) {
    mapSome(state.graph, g => {
        g.snowflakeID = snowflakeID;
        syncToSnowflakeID(g);
    });
}
function setAspectRatio(state, aspectRatio) {
    state.aspectRatio = aspectRatio;
}

;// ./src/SnowflakeGraphConfig.ts




const configParser = {
    percentGrown: parseNonnegativeFloat,
    snowflakeID: parseSnowflakeID,
    aspectRatio: parsePositiveFloat,
    handleMovedCallback: parseFunction1,
};
function SnowflakeGraphConfig_zero() {
    return parseConfigAndDisplayErrors(configParser, {
        percentGrown: 0,
        snowflakeID: randomSnowflakeIDString(),
        aspectRatio: 3,
        handleMovedCallback: _id => { return; },
    });
}
const configSynchronizer = {
    percentGrown: (_c, s, newValue, oldValue) => {
        const newEqOld = Maybe_map(oldValue, () => false, oldValue => newValue === oldValue);
        if (!newEqOld) {
            setPercentGrown(s, newValue);
            return true;
        }
        return false;
    },
    snowflakeID: (_c, s, newValue, oldValue) => {
        const eqNumber = (a, b) => a === b;
        const newEqOld = Maybe_map(oldValue, () => false, oldValue => arraysEqual(newValue, oldValue, eqNumber));
        if (!newEqOld) {
            setSnowflakeID(s, newValue);
            return true;
        }
        return false;
    },
    aspectRatio: (_c, s, newValue, oldValue) => {
        const newEqOld = Maybe_map(oldValue, () => false, oldValue => newValue === oldValue);
        if (!newEqOld) {
            setAspectRatio(s, newValue);
            return true;
        }
        return false;
    },
    handleMovedCallback: (_c, s, newValue, oldValue) => {
        mapSome(s.graph, g => g.handleMovedCallback = newValue);
        return false;
    },
};

;// ./src/SnowflakeGraphElement.ts
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SnowflakeGraphElement_shadow, _SnowflakeGraphElement_config, _SnowflakeGraphElement_state;





class SnowflakeGraphElement extends HTMLElement {
    constructor() {
        super();
        _SnowflakeGraphElement_shadow.set(this, void 0);
        _SnowflakeGraphElement_config.set(this, void 0);
        _SnowflakeGraphElement_state.set(this, void 0);
        __classPrivateFieldSet(this, _SnowflakeGraphElement_shadow, this.attachShadow({ mode: 'open' }), "f");
        __classPrivateFieldSet(this, _SnowflakeGraphElement_config, SnowflakeGraphConfig_zero(), "f");
        __classPrivateFieldSet(this, _SnowflakeGraphElement_state, SnowflakeGraphState_zero(), "f");
        sync(configSynchronizer, __classPrivateFieldGet(this, _SnowflakeGraphElement_state, "f"), () => { return; }, Maybe_none(), __classPrivateFieldGet(this, _SnowflakeGraphElement_config, "f"));
    }
    configure(unparsedConfig) {
        const config = parseConfigAndDisplayErrors(configParser, unparsedConfig);
        sync(configSynchronizer, __classPrivateFieldGet(this, _SnowflakeGraphElement_state, "f"), () => { return; }, Maybe_some(__classPrivateFieldGet(this, _SnowflakeGraphElement_config, "f")), config);
        __classPrivateFieldSet(this, _SnowflakeGraphElement_config, config, "f");
    }
    connectedCallback() {
        const element = initialize(__classPrivateFieldGet(this, _SnowflakeGraphElement_state, "f"));
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
/* harmony default export */ const src_SnowflakeGraphElement = (SnowflakeGraphElement);

snowflake_graph = __webpack_exports__;
/******/ })()
;