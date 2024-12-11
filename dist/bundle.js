var Main;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   make: () => (/* binding */ make)
/* harmony export */ });
/* harmony import */ var _State__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);


function make() {
    var state = _State__WEBPACK_IMPORTED_MODULE_0__.make();
    return {
        handle: function (e) { return (0,_State__WEBPACK_IMPORTED_MODULE_0__.receiveEvent)(state, e); },
        handleAll: function (es) { return es.forEach(function (e) { return (0,_State__WEBPACK_IMPORTED_MODULE_0__.receiveEvent)(state, e); }); },
    };
}


/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   handleEvent: () => (/* binding */ handleEvent),
/* harmony export */   handleEvents: () => (/* binding */ handleEvents),
/* harmony export */   make: () => (/* binding */ make),
/* harmony export */   receiveEvent: () => (/* binding */ receiveEvent),
/* harmony export */   update: () => (/* binding */ update)
/* harmony export */ });
/* harmony import */ var _Graph__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _Graphic__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6);
/* harmony import */ var _Snowflake__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7);
/* harmony import */ var _Branch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(12);
/* harmony import */ var _Face__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(8);







function makeEventHandlers(state) {
    return {
        installSnowflake: function (_a) {
            var options = _a.options, installCanvas = _a.installCanvas, onNoContextFailure = _a.onNoContextFailure;
            if (state.graphic !== undefined) {
                throw new Error('snowflake already installed');
            }
            state.graphic = _Graphic__WEBPACK_IMPORTED_MODULE_1__.make(options);
            if (state.graphic === undefined) {
                onNoContextFailure();
            }
            else {
                installCanvas(state.graphic.canvas);
            }
        },
        installGraph: function (_a) {
            var options = _a.options, installCanvas = _a.installCanvas, onNoContextFailure = _a.onNoContextFailure;
            _Graph__WEBPACK_IMPORTED_MODULE_0__.install(state.graph, options);
            if (state.graph.installation === undefined) {
                onNoContextFailure();
            }
            else {
                installCanvas(state.graph.installation.canvas);
            }
        },
        play: function (_a) {
            var play = _a.play;
            if (play === 'toggle') {
                state.playing = !state.playing;
            }
            else {
                state.playing = play;
            }
        },
        reset: function (_) {
            _Snowflake__WEBPACK_IMPORTED_MODULE_2__.reset(state.snowflake);
            state.currentElapsedMS = 0;
            state.currentGrowthType = undefined;
            if (state.graphic !== undefined) {
                _Graphic__WEBPACK_IMPORTED_MODULE_1__.clear(state.graphic);
            }
            state.resetCallbacks.forEach(function (callback) { return callback(); });
        },
        randomize: function (_) {
            (0,_Graph__WEBPACK_IMPORTED_MODULE_0__.randomizeGrowthInput)(state.graph);
        },
        halt: function (_) {
            var _a;
            clearInterval(state.eventHandlerTimeout);
            (_a = state.graph.installation) === null || _a === void 0 ? void 0 : _a.removeEventListeners();
        },
        registerFinishedGrowingCallback: function (_a) {
            var callback = _a.callback;
            state.finishedGrowingCallbacks.push(callback);
        },
        registerResetCallback: function (_a) {
            var callback = _a.callback;
            state.resetCallbacks.push(callback);
        },
    };
}
function handleEvent(state, e) {
    if (state.eventHandlers !== undefined) {
        state.eventHandlers[e.kind](e /* FIXME */);
    }
    else {
        throw new Error("state.eventHandlers is undefined");
    }
}
function handleEvents(state) {
    state.eventQueue.forEach(function (e) { return handleEvent(state, e); });
    state.eventQueue.length = 0;
    update(state);
}
function make() {
    var graph = _Graph__WEBPACK_IMPORTED_MODULE_0__.make((0,_Graph__WEBPACK_IMPORTED_MODULE_0__.defaultGraphOptions)());
    var snowflake = _Snowflake__WEBPACK_IMPORTED_MODULE_2__.zero();
    var currentGrowthType = undefined;
    var step = 0;
    var maxSteps = 1000;
    var result = {
        graph: graph,
        graphic: undefined,
        snowflake: snowflake,
        currentGrowthType: currentGrowthType,
        currentMS: 0,
        currentElapsedMS: 0,
        allotedGrowthTimeMS: 5000,
        targetMSPerUpdate: 1000 / 60,
        playing: false,
        eventQueue: [],
        eventHandlers: undefined,
        eventHandlerTimeout: undefined,
        finishedGrowingCallbacks: [],
        resetCallbacks: [],
    };
    result.eventHandlers = makeEventHandlers(result);
    result.eventHandlerTimeout = setInterval(function () { return handleEvents(result); }, result.targetMSPerUpdate);
    return result;
}
function receiveEvent(state, e) {
    state.eventQueue.push(e);
}
function currentTime(state) {
    return state.currentElapsedMS / state.allotedGrowthTimeMS;
}
function update(state) {
    var snowflake = state.snowflake, graph = state.graph, graphic = state.graphic, playing = state.playing;
    var lastMS = state.currentMS;
    var lastElapsedMS = state.currentElapsedMS;
    state.currentMS = performance.now();
    var deltaMS = state.currentMS - lastMS;
    var expectedNumberOfUpdates = state.allotedGrowthTimeMS / state.targetMSPerUpdate;
    var sixtyFPSExpectedNumberOfUpdates = state.allotedGrowthTimeMS / (1000 / 60);
    var fpsScale = sixtyFPSExpectedNumberOfUpdates / expectedNumberOfUpdates;
    var eightSecondsInMS = 8000;
    var timeScale = eightSecondsInMS / state.allotedGrowthTimeMS;
    if (playing) {
        state.currentElapsedMS += deltaMS;
        if (lastElapsedMS < state.allotedGrowthTimeMS
            && state.currentElapsedMS >= state.allotedGrowthTimeMS) {
            state.finishedGrowingCallbacks.forEach(function (callback) { return callback(); });
        }
        else {
            var thisUpdateGrowthScalar_1 = timeScale * fpsScale * deltaMS / state.targetMSPerUpdate;
            var growth_1 = (0,_Graph__WEBPACK_IMPORTED_MODULE_0__.interpretGrowth)(graph, currentTime(state));
            if (state.currentGrowthType === undefined) {
                state.currentGrowthType = growth_1.growthType;
            }
            if (state.currentGrowthType !== growth_1.growthType) {
                state.currentGrowthType = growth_1.growthType;
                if (state.currentGrowthType === 'branching') {
                    (0,_Snowflake__WEBPACK_IMPORTED_MODULE_2__.addBranchesToGrowingFaces)(snowflake);
                }
                else {
                    (0,_Snowflake__WEBPACK_IMPORTED_MODULE_2__.addFacesToGrowingBranches)(snowflake);
                }
            }
            _Snowflake__WEBPACK_IMPORTED_MODULE_2__.cacheNormalizedSides(snowflake);
            if (state.currentGrowthType === 'branching') {
                _Snowflake__WEBPACK_IMPORTED_MODULE_2__.killCoveredBranches(snowflake);
                snowflake.branches.forEach(function (b) {
                    if (b.growing) {
                        _Branch__WEBPACK_IMPORTED_MODULE_3__.enlarge(b, growth_1.scale, thisUpdateGrowthScalar_1);
                    }
                });
            }
            else {
                _Snowflake__WEBPACK_IMPORTED_MODULE_2__.killCoveredFaces(snowflake);
                snowflake.faces.forEach(function (f) {
                    if (f.growing) {
                        _Face__WEBPACK_IMPORTED_MODULE_4__.enlarge(f, growth_1.scale, thisUpdateGrowthScalar_1);
                    }
                });
            }
            if (graphic !== undefined) {
                _Snowflake__WEBPACK_IMPORTED_MODULE_2__.draw(graphic, snowflake, thisUpdateGrowthScalar_1);
            }
        }
    }
    var percentDone = state.currentElapsedMS / state.allotedGrowthTimeMS;
    (0,_Graph__WEBPACK_IMPORTED_MODULE_0__.callIfInstalled)(graph, function (i) {
        (0,_Graph__WEBPACK_IMPORTED_MODULE_0__.updateGraph)(graph, i);
        i.ctx.clearRect(0, 0, i.canvas.width, i.canvas.height);
        (0,_Graph__WEBPACK_IMPORTED_MODULE_0__.drawGrowthInput)(graph, i, percentDone);
    });
}


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   callIfInstalled: () => (/* binding */ callIfInstalled),
/* harmony export */   callWithInstallation: () => (/* binding */ callWithInstallation),
/* harmony export */   defaultGraphInstallationOptions: () => (/* binding */ defaultGraphInstallationOptions),
/* harmony export */   defaultGraphOptions: () => (/* binding */ defaultGraphOptions),
/* harmony export */   drawGraphHandle: () => (/* binding */ drawGraphHandle),
/* harmony export */   drawGrowthInput: () => (/* binding */ drawGrowthInput),
/* harmony export */   errorWithoutInstallation: () => (/* binding */ errorWithoutInstallation),
/* harmony export */   growthHandlePosition: () => (/* binding */ growthHandlePosition),
/* harmony export */   install: () => (/* binding */ install),
/* harmony export */   interpretGrowth: () => (/* binding */ interpretGrowth),
/* harmony export */   make: () => (/* binding */ make),
/* harmony export */   nearestGrowthHandle: () => (/* binding */ nearestGrowthHandle),
/* harmony export */   randomizeGrowthInput: () => (/* binding */ randomizeGrowthInput),
/* harmony export */   updateGraph: () => (/* binding */ updateGraph)
/* harmony export */ });
/* harmony import */ var _Constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);


function defaultGraphInstallationOptions() {
    return {
        mouseUpEventListenerNode: document,
        canvasClassName: 'graph',
        canvasWidth: 600,
        canvasHeight: 200,
    };
}
function callWithInstallation(graph, f, notInstalled) {
    if (graph.installation === undefined) {
        return notInstalled();
    }
    else {
        return f(graph.installation);
    }
}
function callIfInstalled(graph, f) {
    callWithInstallation(graph, f, function () { });
}
function errorWithoutInstallation(graph, f) {
    callWithInstallation(graph, f, function () {
        console.error('graph not installed');
    });
}
function defaultGraphOptions() {
    return {
        progressColor: { r: 255, g: 255, b: 255, a: 1 },
        progressLineColor: { r: 255, g: 255, b: 255, a: 1 },
        backgroundColor: { r: 0, g: 0, b: 0, a: 1 },
        foregroundColor: { r: 0, g: 0, b: 0, a: 1 },
    };
}
function randomizeGrowthInput(graph) {
    graph.growthInput = createRandomGrowthInput();
}
function createRandomGrowthInput() {
    var result = [0];
    for (var i = 1; i < 16; i++) {
        result[i] = Math.floor(Math.random() * 9);
    }
    result[0] = Math.floor(Math.random() * 4);
    return result;
}
function make(options) {
    return {
        options: options,
        growthInput: createRandomGrowthInput(),
        installation: undefined,
    };
}
;
function install(graph, options) {
    if (graph.installation !== undefined) {
        console.error('attempt to install graph twice');
        return;
    }
    var canvas = document.createElement('canvas');
    canvas.width = options.canvasWidth;
    canvas.height = options.canvasHeight;
    canvas.className = options.canvasClassName;
    var ctx = canvas.getContext('2d');
    if (ctx === null) {
        return;
    }
    var graphMargin = 10;
    function mousemove(e) {
        if (graph.installation !== undefined) {
            graph.installation.graphMouse = { x: e.offsetX, y: e.offsetY };
        }
    }
    function mousedown() {
        if (graph.installation !== undefined) {
            graph.installation.handleBeingDragged = 'needs lookup';
        }
    }
    function mouseup() {
        if (graph.installation !== undefined) {
            graph.installation.handleBeingDragged = undefined;
            graph.installation.graphMouse = undefined;
        }
    }
    function mouseleave() {
        if (graph.installation !== undefined) {
            graph.installation.mouseRecentlyExitedGraph = true;
        }
    }
    canvas.addEventListener('mousemove', mousemove);
    canvas.addEventListener('mousedown', mousedown);
    canvas.addEventListener('mouseleave', mouseleave);
    options.mouseUpEventListenerNode.addEventListener('mouseup', mouseup);
    function removeEventListeners() {
        canvas.removeEventListener('mousemove', mousemove);
        canvas.removeEventListener('mousedown', mousedown);
        canvas.removeEventListener('mouseleave', mouseleave);
        options.mouseUpEventListenerNode.removeEventListener('mouseup', mouseup);
    }
    graph.installation = {
        options: options,
        canvas: canvas,
        ctx: ctx,
        handleBeingDragged: undefined,
        mouseRecentlyExitedGraph: false,
        graphMouse: undefined,
        graphMargin: graphMargin,
        writableGraphWidth: canvas.width - 2 * graphMargin,
        writableGraphHeight: canvas.height,
        removeEventListeners: removeEventListeners,
    };
}
function drawGraphHandle(graph, i, x, y, isSelected, isBeingDragged) {
    var oldFillStyle = i.ctx.fillStyle;
    var oldStrokeStyle = i.ctx.strokeStyle;
    var oldLineDash = i.ctx.getLineDash();
    var newStyle = graph.options.foregroundColor;
    var outerRingRadius = (function () {
        if (isSelected) {
            return 8;
        }
        else {
            return 5;
        }
    })();
    var newLineDash = (function () {
        if (isBeingDragged) {
            return [2, 2];
        }
        else {
            return [];
        }
    })();
    i.ctx.beginPath();
    i.ctx.arc(x, y, 3, 0, 2 * Math.PI);
    i.ctx.closePath();
    i.ctx.fillStyle = (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.convertRGBAToString)(newStyle);
    i.ctx.fill();
    i.ctx.closePath();
    i.ctx.beginPath();
    i.ctx.arc(x, y, outerRingRadius, 0, 2 * Math.PI);
    i.ctx.strokeStyle = (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.convertRGBAToString)(newStyle);
    i.ctx.setLineDash(newLineDash);
    i.ctx.stroke();
    i.ctx.fillStyle = oldFillStyle;
    i.ctx.strokeStyle = oldStrokeStyle;
    i.ctx.setLineDash(oldLineDash);
}
function interpretGrowth(graph, time) {
    var s = (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.lerp)(0, graph.growthInput.length - 1, time);
    var n = (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.fracPart)(s);
    var a = _Constants__WEBPACK_IMPORTED_MODULE_0__.yChoices[graph.growthInput[Math.floor(s)]];
    var b = _Constants__WEBPACK_IMPORTED_MODULE_0__.yChoices[graph.growthInput[Math.ceil(s)]];
    var signedScale = (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.lerp)(a, b, n);
    var timeScalar = -0.01 * s + 1;
    return {
        scale: timeScalar * Math.abs(signedScale),
        growthType: signedScale > 0.0 ? 'branching' : 'faceting',
    };
}
function growthHandlePosition(graph, inst, i) {
    var writableGraphWidth = inst.writableGraphWidth, writableGraphHeight = inst.writableGraphHeight, graphMargin = inst.graphMargin;
    return {
        x: writableGraphWidth / (graph.growthInput.length - 1) * i + graphMargin,
        y: 4 * _Constants__WEBPACK_IMPORTED_MODULE_0__.yChoices[graph.growthInput[i]] * (writableGraphHeight / _Constants__WEBPACK_IMPORTED_MODULE_0__.yChoices.length) + writableGraphHeight * 0.5,
    };
}
function nearestGrowthHandle(graph, inst, canvasPoint) {
    var nearestDist = Infinity;
    var nearest = 0;
    for (var i = 0; i < graph.growthInput.length; i += 1) {
        var p = growthHandlePosition(graph, inst, i);
        var dx = p.x - canvasPoint.x;
        var dist = dx * dx;
        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = i;
        }
    }
    return nearest;
}
function updateGraph(graph, i) {
    if (i.handleBeingDragged !== undefined || i.mouseRecentlyExitedGraph) {
        i.mouseRecentlyExitedGraph = false;
        var handle = (function () {
            if (i.handleBeingDragged === 'needs lookup' && i.graphMouse !== undefined) {
                return nearestGrowthHandle(graph, i, i.graphMouse);
            }
            else {
                return i.handleBeingDragged;
            }
        })();
        if (i.handleBeingDragged === 'needs lookup') {
            i.handleBeingDragged = handle;
        }
        if (i.graphMouse !== undefined && handle !== 'needs lookup') {
            var dy = i.writableGraphHeight / _Constants__WEBPACK_IMPORTED_MODULE_0__.yChoices.length;
            var j = Math.floor(i.graphMouse.y / dy);
            if (handle !== undefined) {
                graph.growthInput[handle] = (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.clamp)(j, 0, _Constants__WEBPACK_IMPORTED_MODULE_0__.yChoices.length - 1);
            }
        }
    }
    var beingDragged = i.handleBeingDragged !== undefined;
    var userSelectValue = beingDragged ? 'none' : 'auto';
    var setStyle = function (e) { return e.setAttribute('style', "user-select: ".concat(userSelectValue)); };
    Array.from(document.getElementsByClassName('graphLabel')).forEach(setStyle);
    Array.from(document.getElementsByClassName('control')).forEach(setStyle);
    var controlContainer = document.getElementById('controlContainer');
    if (controlContainer !== null) {
        setStyle(controlContainer);
    }
}
function drawGrowthInput(graph, i, percentDone) {
    var writableGraphWidth = i.writableGraphWidth, writableGraphHeight = i.writableGraphHeight, graphMargin = i.graphMargin;
    var old = i.ctx.fillStyle;
    i.ctx.fillStyle = (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.convertRGBAToString)(graph.options.progressColor);
    i.ctx.fillRect(graphMargin, 0, writableGraphWidth * percentDone, writableGraphHeight);
    i.ctx.fillStyle = old;
    i.ctx.beginPath();
    {
        var p = growthHandlePosition(graph, i, 0);
        i.ctx.moveTo(p.x, p.y);
    }
    for (var j = 1; j < graph.growthInput.length; j += 1) {
        var p = growthHandlePosition(graph, i, j);
        i.ctx.lineTo(p.x, p.y);
    }
    i.ctx.strokeStyle = (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.convertRGBAToString)(graph.options.foregroundColor);
    i.ctx.stroke();
    for (var j = 0; j < graph.growthInput.length; j += 1) {
        var p = growthHandlePosition(graph, i, j);
        if (i.graphMouse !== undefined) {
            var nearest = nearestGrowthHandle(graph, i, i.graphMouse);
            drawGraphHandle(graph, i, p.x, p.y, j === nearest, j === i.handleBeingDragged);
        }
        else {
            drawGraphHandle(graph, i, p.x, p.y, false, false);
        }
    }
    i.ctx.beginPath();
    var progressX = writableGraphWidth * percentDone + graphMargin;
    i.ctx.moveTo(progressX, 0);
    i.ctx.lineTo(progressX, writableGraphHeight);
    i.ctx.strokeStyle = (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.convertRGBAToString)(graph.options.progressLineColor);
    i.ctx.stroke();
    i.ctx.beginPath();
    var xAxisY = writableGraphHeight * 0.5;
    i.ctx.moveTo(graphMargin, xAxisY);
    i.ctx.lineTo(writableGraphWidth + graphMargin, xAxisY);
    i.ctx.strokeStyle = (0,_Utils__WEBPACK_IMPORTED_MODULE_1__.convertRGBAToString)(graph.options.foregroundColor);
    i.ctx.setLineDash([2, 2]);
    i.ctx.stroke();
    i.ctx.setLineDash([]);
}


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   branchGrowthScalar: () => (/* binding */ branchGrowthScalar),
/* harmony export */   growthScalar: () => (/* binding */ growthScalar),
/* harmony export */   oneSixthCircle: () => (/* binding */ oneSixthCircle),
/* harmony export */   yChoices: () => (/* binding */ yChoices)
/* harmony export */ });
var oneSixthCircle = Math.PI * 2 / 6;
var growthScalar = 0.0025;
var branchGrowthScalar = growthScalar * 0.3;
var yChoices = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1];


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clamp: () => (/* binding */ clamp),
/* harmony export */   convertRGBAToString: () => (/* binding */ convertRGBAToString),
/* harmony export */   fracPart: () => (/* binding */ fracPart),
/* harmony export */   lerp: () => (/* binding */ lerp),
/* harmony export */   makeArray6: () => (/* binding */ makeArray6),
/* harmony export */   mapArray6: () => (/* binding */ mapArray6),
/* harmony export */   rem: () => (/* binding */ rem)
/* harmony export */ });
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
    var r = rgba.r, g = rgba.g, b = rgba.b, a = rgba.a;
    return "rgba(".concat(r, ", ").concat(g, ", ").concat(b, ", ").concat(a, ")");
}


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clear: () => (/* binding */ clear),
/* harmony export */   make: () => (/* binding */ make)
/* harmony export */ });
function make(options) {
    var canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    canvas.className = options.className;
    var ctx = canvas.getContext('2d');
    if (ctx === null) {
        return undefined;
    }
    return { canvas: canvas, ctx: ctx };
}
function clear(graphic) {
    graphic.ctx.clearRect(0, 0, graphic.canvas.width, graphic.canvas.height);
}


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addBranchesToGrowingFaces: () => (/* binding */ addBranchesToGrowingFaces),
/* harmony export */   addFacesToGrowingBranches: () => (/* binding */ addFacesToGrowingBranches),
/* harmony export */   cacheNormalizedSides: () => (/* binding */ cacheNormalizedSides),
/* harmony export */   draw: () => (/* binding */ draw),
/* harmony export */   killCoveredBranches: () => (/* binding */ killCoveredBranches),
/* harmony export */   killCoveredFaces: () => (/* binding */ killCoveredFaces),
/* harmony export */   reset: () => (/* binding */ reset),
/* harmony export */   zero: () => (/* binding */ zero)
/* harmony export */ });
/* harmony import */ var _Face__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _Branch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12);
/* harmony import */ var _Direction__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(10);
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
/* harmony import */ var _Side__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(13);





function reset(s) {
    s.faces.length = 1;
    s.faces[0] = _Face__WEBPACK_IMPORTED_MODULE_0__.zero();
    s.branches.length = 0;
    for (var i = 0; i < _Direction__WEBPACK_IMPORTED_MODULE_2__.values.length; ++i) {
        s.faceSideCache[i].length = 0;
        s.branchSideCache[i].length = 0;
    }
}
function draw(graphic, snowflake, deltaScale) {
    snowflake.faces.forEach(function (f) {
        if (f.growing) {
            _Face__WEBPACK_IMPORTED_MODULE_0__.draw(graphic, f, deltaScale);
        }
    });
    snowflake.branches.forEach(function (b) {
        if (b.growing) {
            _Branch__WEBPACK_IMPORTED_MODULE_1__.draw(graphic, b, deltaScale);
        }
    });
}
function zero() {
    return {
        faces: [_Face__WEBPACK_IMPORTED_MODULE_0__.zero()],
        branches: [],
        faceSideCache: (0,_Utils__WEBPACK_IMPORTED_MODULE_3__.makeArray6)(function () { return []; }),
        branchSideCache: (0,_Utils__WEBPACK_IMPORTED_MODULE_3__.makeArray6)(function () { return []; }),
    };
}
function addBranchesToFace(snowflake, face) {
    var initialFraction = 0.01;
    var sizeOfNewBranches = face.size * initialFraction;
    // This is the offset from the edge of the face that we add to the start of the branch
    // so that it does not overlap the face itself when it is first created. Without this,
    // overlap detection immediatelly kills freshly created branches.
    var safetyOffset = 0.001;
    var distFromCenter = safetyOffset + 1 * face.size * (1 - initialFraction);
    var cx = face.center.x;
    var cy = face.center.y;
    var _a = (function () {
        if (face.direction === 'none') {
            return [0, 6];
        }
        return [
            _Direction__WEBPACK_IMPORTED_MODULE_2__.previous(face.direction),
            3,
        ];
    })(), startDir = _a[0], numDirs = _a[1];
    var dir = startDir;
    var _loop_1 = function (i) {
        var x = cx + distFromCenter * Math.cos(_Direction__WEBPACK_IMPORTED_MODULE_2__.values[dir]);
        var y = cy + distFromCenter * Math.sin(_Direction__WEBPACK_IMPORTED_MODULE_2__.values[dir]);
        var growthScale = (function () {
            if (face.direction === 'none' || i === 1) {
                return face.growthScale * 0.9;
            }
            // const randomAdjust = Math.random();
            var randomAdjust = 1;
            return face.growthScale * 0.5 * randomAdjust;
        })();
        snowflake.branches.push({
            start: { x: x, y: y },
            size: sizeOfNewBranches,
            length: 0,
            direction: dir,
            growthScale: growthScale,
            growing: true,
        });
        dir = _Direction__WEBPACK_IMPORTED_MODULE_2__.next(dir);
    };
    for (var i = 0; i < numDirs; i += 1) {
        _loop_1(i);
    }
}
function addBranchesToGrowingFaces(snowflake) {
    snowflake.faces.forEach(function (face) {
        if (face.growing) {
            addBranchesToFace(snowflake, face);
            face.growing = false;
        }
    });
}
function addFaceToBranch(snowflake, branch) {
    snowflake.faces.push({
        center: _Branch__WEBPACK_IMPORTED_MODULE_1__.end(branch),
        size: branch.size,
        direction: branch.direction,
        growthScale: branch.growthScale,
        growing: true,
    });
}
function addFacesToGrowingBranches(snowflake) {
    snowflake.branches.forEach(function (branch) {
        if (branch.growing) {
            addFaceToBranch(snowflake, branch);
            branch.growing = false;
        }
    });
}
function cacheNormalizedSides(snowflake) {
    snowflake.faces.forEach(function (f, fi) {
        if (f.growing) {
            _Side__WEBPACK_IMPORTED_MODULE_4__.normalizedFaceSides(f).forEach(function (s, i) {
                var absoluteDirection = (i + _Face__WEBPACK_IMPORTED_MODULE_0__.direction(f)) % _Direction__WEBPACK_IMPORTED_MODULE_2__.values.length;
                snowflake.faceSideCache[absoluteDirection][fi] = s;
            });
        }
    });
    snowflake.branches.forEach(function (b, bi) {
        if (b.growing) {
            _Side__WEBPACK_IMPORTED_MODULE_4__.normalizedBranchSides(b).forEach(function (s, i) {
                var absoluteDirection = (i + b.direction) % _Direction__WEBPACK_IMPORTED_MODULE_2__.values.length;
                snowflake.branchSideCache[absoluteDirection][bi] = s;
            });
        }
    });
}
function killCoveredFaces(snowflake) {
    snowflake.faces.forEach(function (f, fi) {
        if (!f.growing) {
            return;
        }
        var d = _Face__WEBPACK_IMPORTED_MODULE_0__.direction(f);
        var leftDirection = d;
        var rightDirection = (0,_Utils__WEBPACK_IMPORTED_MODULE_3__.rem)(d - 1, _Direction__WEBPACK_IMPORTED_MODULE_2__.values.length);
        var leftSide = snowflake.faceSideCache[leftDirection][fi];
        var rightSide = snowflake.faceSideCache[rightDirection][fi];
        var caches = [snowflake.faceSideCache, snowflake.branchSideCache];
        caches.forEach(function (cache, ci) {
            var otherLeftSides = cache[leftDirection];
            var otherRightSides = cache[rightDirection];
            var inFaceCache = ci === 0;
            for (var oi = 0; oi < otherLeftSides.length; ++oi) {
                if (inFaceCache && oi === fi) {
                    continue;
                }
                var otherLeftSide = otherLeftSides[oi];
                var distance = _Side__WEBPACK_IMPORTED_MODULE_4__.overlaps(otherLeftSide, leftSide);
                if (distance !== undefined) {
                    f.growing = false;
                    break;
                }
            }
            if (!f.growing) {
                return;
            }
            for (var oi = 0; oi < otherRightSides.length; ++oi) {
                if (inFaceCache && oi === fi) {
                    continue;
                }
                var otherRightSide = otherRightSides[oi];
                var distance = _Side__WEBPACK_IMPORTED_MODULE_4__.overlaps(otherRightSide, rightSide);
                if (distance !== undefined) {
                    f.growing = false;
                    break;
                }
            }
        });
    });
}
function killCoveredBranches(snowflake) {
    snowflake.branches.forEach(function (b, bi) {
        if (!b.growing) {
            return;
        }
        var d = b.direction;
        var leftDirection = d;
        var rightDirection = (0,_Utils__WEBPACK_IMPORTED_MODULE_3__.rem)(d - 1, _Direction__WEBPACK_IMPORTED_MODULE_2__.values.length);
        var leftSide = snowflake.branchSideCache[leftDirection][bi];
        var rightSide = snowflake.branchSideCache[rightDirection][bi];
        var caches = [snowflake.faceSideCache, snowflake.branchSideCache];
        caches.forEach(function (cache, ci) {
            var otherLeftSides = cache[leftDirection];
            var otherRightSides = cache[rightDirection];
            var inBranchCache = ci === 1;
            for (var oi = 0; oi < otherLeftSides.length; ++oi) {
                if (inBranchCache && oi === bi) {
                    continue;
                }
                var otherLeftSide = otherLeftSides[oi];
                var distance = _Side__WEBPACK_IMPORTED_MODULE_4__.overlaps(otherLeftSide, leftSide);
                if (distance !== undefined) {
                    b.growing = false;
                    break;
                }
            }
            if (!b.growing) {
                return;
            }
            for (var oi = 0; oi < otherRightSides.length; ++oi) {
                if (inBranchCache && oi === bi) {
                    continue;
                }
                var otherRightSide = otherRightSides[oi];
                var distance = _Side__WEBPACK_IMPORTED_MODULE_4__.overlaps(otherRightSide, rightSide);
                if (distance !== undefined) {
                    b.growing = false;
                    break;
                }
            }
        });
    });
}


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   direction: () => (/* binding */ direction),
/* harmony export */   draw: () => (/* binding */ draw),
/* harmony export */   enlarge: () => (/* binding */ enlarge),
/* harmony export */   points: () => (/* binding */ points),
/* harmony export */   zero: () => (/* binding */ zero)
/* harmony export */ });
/* harmony import */ var _Point__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9);
/* harmony import */ var _Direction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(10);
/* harmony import */ var _CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(11);
/* harmony import */ var _Constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(4);
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(5);





function zero() {
    return {
        center: _Point__WEBPACK_IMPORTED_MODULE_0__.zero(),
        size: 0.0025,
        direction: 'none',
        growthScale: 1,
        growing: true,
    };
}
;
function direction(face) {
    return face.direction === "none" ? 0 : face.direction;
}
// Points are returned in order of relative direction:
//
//      [2]-----[1]
//      /         \
//     /           \
//   [3]           [0] --- direction --->
//     \           /
//      \         /
//      [4]-----[5]
function points(face) {
    var dir = face.direction === 'none' ? 0 : face.direction;
    var result = (0,_Utils__WEBPACK_IMPORTED_MODULE_4__.makeArray6)(_Point__WEBPACK_IMPORTED_MODULE_0__.zero);
    for (var i = 0; i < _Direction__WEBPACK_IMPORTED_MODULE_1__.values.length; i += 1) {
        var d = _Direction__WEBPACK_IMPORTED_MODULE_1__.values[(dir + i) % _Direction__WEBPACK_IMPORTED_MODULE_1__.values.length];
        result[i].x = face.center.x + face.size * Math.cos(d);
        result[i].y = face.center.y + face.size * Math.sin(d);
    }
    return result;
}
function draw(graphic, face, deltaScale) {
    var dir = face.direction === "none" ? 0 : face.direction;
    graphic.ctx.beginPath();
    var ps = points(face);
    var tps = ps.map(function (p) { return (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, p); });
    var p0 = (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, ps[0]);
    var p1 = (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, ps[1]);
    var p2 = (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, ps[2]);
    var p3 = (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, ps[3]);
    var p4 = (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, ps[4]);
    var p5 = (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, ps[5]);
    var p31 = (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, _Point__WEBPACK_IMPORTED_MODULE_0__.midpointT(ps[3], ps[1], 0.2));
    var p30 = (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, _Point__WEBPACK_IMPORTED_MODULE_0__.midpointT(ps[3], ps[0], 0.2));
    var p35 = (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, _Point__WEBPACK_IMPORTED_MODULE_0__.midpointT(ps[3], ps[5], 0.2));
    if (face.direction === "none") {
        graphic.ctx.strokeStyle = "rgba(255, 255, 255, ".concat(deltaScale * 0.08, ")");
        ps.forEach(function (p, i) {
            var _a = (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, p), x = _a.x, y = _a.y;
            if (i === 0) {
                graphic.ctx.moveTo(x, y);
            }
            else {
                graphic.ctx.lineTo(x, y);
            }
        });
        graphic.ctx.closePath();
        graphic.ctx.stroke();
        var c_1 = (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, face.center);
        tps.forEach(function (p) {
            graphic.ctx.beginPath();
            graphic.ctx.moveTo(c_1.x, c_1.y);
            graphic.ctx.lineTo(p.x, p.y);
            graphic.ctx.stroke();
        });
    }
    else {
        graphic.ctx.strokeStyle = "rgba(255, 255, 255, ".concat(deltaScale * 0.08, ")");
        graphic.ctx.beginPath();
        var p45 = (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, _Point__WEBPACK_IMPORTED_MODULE_0__.midpoint(ps[4], ps[5]));
        graphic.ctx.moveTo(p45.x, p45.y);
        graphic.ctx.lineTo(p5.x, p5.y);
        graphic.ctx.stroke();
        graphic.ctx.beginPath();
        var p21 = (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, _Point__WEBPACK_IMPORTED_MODULE_0__.midpoint(ps[2], ps[1]));
        graphic.ctx.moveTo(p21.x, p21.y);
        graphic.ctx.lineTo(p1.x, p1.y);
        graphic.ctx.stroke();
        for (var i = 0; i < 3; ++i) {
            var _a = (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, ps[(0,_Utils__WEBPACK_IMPORTED_MODULE_4__.rem)(i - 1, ps.length)]), x = _a.x, y = _a.y;
            if (i === 0) {
                graphic.ctx.moveTo(x, y);
            }
            else {
                graphic.ctx.lineTo(x, y);
            }
        }
        ;
        graphic.ctx.stroke();
        graphic.ctx.beginPath();
        graphic.ctx.moveTo(p31.x, p31.y);
        graphic.ctx.lineTo(p1.x, p1.y);
        graphic.ctx.stroke();
        graphic.ctx.beginPath();
        graphic.ctx.moveTo(p30.x, p30.y);
        graphic.ctx.lineTo(p0.x, p0.y);
        graphic.ctx.stroke();
        graphic.ctx.beginPath();
        graphic.ctx.moveTo(p35.x, p35.y);
        graphic.ctx.lineTo(p5.x, p5.y);
        graphic.ctx.stroke();
    }
}
function enlarge(face, scale, deltaScale) {
    face.size += deltaScale * 0.75 * scale * _Constants__WEBPACK_IMPORTED_MODULE_3__.growthScalar * face.growthScale;
    if (face.direction !== 'none') {
        var dx = 0.75 * 1 * scale * _Constants__WEBPACK_IMPORTED_MODULE_3__.growthScalar * Math.cos(_Direction__WEBPACK_IMPORTED_MODULE_1__.values[face.direction]) * face.growthScale;
        var dy = 0.75 * 1 * scale * _Constants__WEBPACK_IMPORTED_MODULE_3__.growthScalar * Math.sin(_Direction__WEBPACK_IMPORTED_MODULE_1__.values[face.direction]) * face.growthScale;
        face.center.x += deltaScale * dx;
        face.center.y += deltaScale * dy;
    }
}


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   add: () => (/* binding */ add),
/* harmony export */   copy: () => (/* binding */ copy),
/* harmony export */   make: () => (/* binding */ make),
/* harmony export */   midpoint: () => (/* binding */ midpoint),
/* harmony export */   midpointT: () => (/* binding */ midpointT),
/* harmony export */   negate: () => (/* binding */ negate),
/* harmony export */   rotate: () => (/* binding */ rotate),
/* harmony export */   scale: () => (/* binding */ scale),
/* harmony export */   subtract: () => (/* binding */ subtract),
/* harmony export */   translate: () => (/* binding */ translate),
/* harmony export */   zero: () => (/* binding */ zero)
/* harmony export */ });
/* harmony import */ var _Direction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);

function zero() {
    return { x: 0, y: 0 };
}
;
function make(x, y) {
    return { x: x, y: y };
}
function copy(p) {
    return { x: p.x, y: p.y };
}
function add(p1, p2) {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
}
function negate(p) {
    return { x: -p.x, y: -p.y };
}
function subtract(p1, p2) {
    return add(p1, negate(p2));
}
function midpoint(p1, p2) {
    return {
        x: p1.x + 0.5 * (p2.x - p1.x),
        y: p1.y + 0.5 * (p2.y - p1.y)
    };
}
/** Returns the point that is `percent` between `p1` and `p2`. `percent`
 * should be `>= 0` and `<= 1`.
 */
function midpointT(p1, p2, percent) {
    return add(scale(p1, 1 - percent), scale(p2, percent));
}
function scale(p, scalar) {
    return { x: scalar * p.x, y: scalar * p.y };
}
function translate(p, direction, distance) {
    return {
        x: p.x + distance * Math.cos(_Direction__WEBPACK_IMPORTED_MODULE_0__.values[direction]),
        y: p.y + distance * Math.sin(_Direction__WEBPACK_IMPORTED_MODULE_0__.values[direction]),
    };
}
// Rotates 'point' by 'theta' around (0,0) counterclockwise.
function rotate(point, theta) {
    return {
        x: point.x * Math.cos(theta) - point.y * Math.sin(theta),
        y: point.x * Math.sin(theta) + point.y * Math.cos(theta),
    };
}


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   next: () => (/* binding */ next),
/* harmony export */   previous: () => (/* binding */ previous),
/* harmony export */   values: () => (/* binding */ values)
/* harmony export */ });
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _Constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);


function is(i) {
    return i === 0 || i === 1 || i === 2 ||
        i === 3 || i === 4 || i === 5;
}
var values = [
    0 * _Constants__WEBPACK_IMPORTED_MODULE_1__.oneSixthCircle,
    1 * _Constants__WEBPACK_IMPORTED_MODULE_1__.oneSixthCircle,
    2 * _Constants__WEBPACK_IMPORTED_MODULE_1__.oneSixthCircle,
    3 * _Constants__WEBPACK_IMPORTED_MODULE_1__.oneSixthCircle,
    4 * _Constants__WEBPACK_IMPORTED_MODULE_1__.oneSixthCircle,
    5 * _Constants__WEBPACK_IMPORTED_MODULE_1__.oneSixthCircle,
];
function next(d) {
    return ((d + 1) % values.length);
}
function previous(d) {
    return (0,_Utils__WEBPACK_IMPORTED_MODULE_0__.rem)(d - 1, values.length);
}


/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   worldToViewTransform: () => (/* binding */ worldToViewTransform)
/* harmony export */ });
// Coordinate system(s):
//
// 1: "World" space. This is two dimensional (x,y) with the origin,
// (0,0), in the center. X values increase towards positive infinity
// to the right and decrease to negative infinity to the left. Y
// values increase towards positive infinity going up and decrease to
// negative infinity going down. Radians refer to the angle that lines
// make with the line starting at (0,0) and extending directly right
// towards positive 'X', counterclockwise. So, for example, a vector
// emerging from the origin and going straight up (towards positive Y)
// would be at pi/2 radians. The part of the world that is visible on
// view is a 2x2 square centered at the origin.
//
// 2: "View" space. This is two dimensional (x,y) with the origin,
// (0,0), in the top left corner. X values increase towards positive
// infinity to the right and decrease to negative infinity to the
// left. Y values increase going *down* towards positive infinity and
// decrease towards negative infinity going *up*.
//
// World space is used for doing all the logical calculations
// necessary to grow the snowflake. All coordinates stored in objects
// are in world space. View space is used to draw the snowflake on
// the View and these coordinates are never saved anywhere.
function worldToViewTransform(graphic, p) {
    var w = graphic.canvas.width;
    var h = graphic.canvas.height;
    // affine transform:
    // |r.x|   |w/2   0   w/2|   |p.x|
    // |r.y| = |0   -h/2  h/2| * |p.y|
    // | 1 |   |0     0    1 |   | 1 |
    var r = {
        x: p.x * w * 0.5 + w * 0.5,
        y: p.y * -h * 0.5 + h * 0.5,
    };
    return r;
}


/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   draw: () => (/* binding */ draw),
/* harmony export */   end: () => (/* binding */ end),
/* harmony export */   enlarge: () => (/* binding */ enlarge),
/* harmony export */   points: () => (/* binding */ points)
/* harmony export */ });
/* harmony import */ var _Point__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9);
/* harmony import */ var _Direction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(10);
/* harmony import */ var _CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(11);
/* harmony import */ var _Face__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(8);
/* harmony import */ var _Constants__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(4);
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(5);
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};






function end(branch) {
    var d = _Direction__WEBPACK_IMPORTED_MODULE_1__.values[branch.direction];
    var l = branch.length;
    var x = branch.start.x + l * Math.cos(d);
    var y = branch.start.y + l * Math.sin(d);
    return { x: x, y: y };
}
function startFace(branch) {
    return __assign(__assign({}, _Face__WEBPACK_IMPORTED_MODULE_3__.zero()), { center: _Point__WEBPACK_IMPORTED_MODULE_0__.copy(branch.start), size: branch.size, direction: branch.direction });
}
function endFace(branch) {
    return __assign(__assign({}, _Face__WEBPACK_IMPORTED_MODULE_3__.zero()), { center: _Point__WEBPACK_IMPORTED_MODULE_0__.add(branch.start, {
            x: branch.length * Math.cos(_Direction__WEBPACK_IMPORTED_MODULE_1__.values[branch.direction]),
            y: branch.length * Math.sin(_Direction__WEBPACK_IMPORTED_MODULE_1__.values[branch.direction]),
        }), size: branch.size, direction: branch.direction });
}
// Points are returned in order of relative direction:
//
//      [2]------------------------------[1]
//      /                                  \
//     /                                    \
//   [3]                                    [0] --- direction --->
//     \                                    /
//      \                                  /
//      [4]------------------------------[5]
function points(branch) {
    var startPoints = _Face__WEBPACK_IMPORTED_MODULE_3__.points(startFace(branch));
    var endPoints = _Face__WEBPACK_IMPORTED_MODULE_3__.points(endFace(branch));
    return [
        endPoints[0],
        endPoints[1],
        startPoints[2],
        startPoints[3],
        startPoints[4],
        endPoints[5],
    ];
}
function draw(graphic, branch, deltaScale) {
    graphic.ctx.beginPath();
    var ps = points(branch);
    for (var i = 0; i < 3; ++i) {
        var _a = (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, ps[(0,_Utils__WEBPACK_IMPORTED_MODULE_5__.rem)(i - 1, ps.length)]), x = _a.x, y = _a.y;
        if (i === 0) {
            graphic.ctx.moveTo(x, y);
        }
        else {
            graphic.ctx.lineTo(x, y);
        }
    }
    graphic.ctx.strokeStyle = "rgba(255, 255, 255, ".concat(deltaScale * 0.2, ")");
    graphic.ctx.stroke();
    graphic.ctx.strokeStyle = "rgba(255, 255, 255, ".concat(deltaScale * 0.08, ")");
    graphic.ctx.beginPath();
    var p45 = (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, _Point__WEBPACK_IMPORTED_MODULE_0__.midpoint(ps[4], ps[5]));
    graphic.ctx.moveTo(p45.x, p45.y);
    var p5 = (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, ps[5]);
    graphic.ctx.lineTo(p5.x, p5.y);
    graphic.ctx.stroke();
    graphic.ctx.beginPath();
    var p21 = (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, _Point__WEBPACK_IMPORTED_MODULE_0__.midpoint(ps[2], ps[1]));
    graphic.ctx.moveTo(p21.x, p21.y);
    var p1 = (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, ps[1]);
    graphic.ctx.lineTo(p1.x, p1.y);
    graphic.ctx.stroke();
    graphic.ctx.strokeStyle = "rgba(255, 255, 255, ".concat(deltaScale * 0.2, ")");
    graphic.ctx.beginPath();
    var p0 = (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, ps[0]);
    graphic.ctx.moveTo(p0.x, p0.y);
    var p3 = (0,_CoordinateSystem__WEBPACK_IMPORTED_MODULE_2__.worldToViewTransform)(graphic, _Point__WEBPACK_IMPORTED_MODULE_0__.midpoint(ps[3], ps[0]));
    graphic.ctx.lineTo(p3.x, p3.y);
    graphic.ctx.stroke();
}
function enlarge(branch, scale, deltaScale) {
    var lengthScalar = -1.5 * scale + 1.5;
    var sizeScalar = 1.5 * scale;
    branch.size += deltaScale * sizeScalar * _Constants__WEBPACK_IMPORTED_MODULE_4__.branchGrowthScalar * branch.growthScale;
    branch.length += deltaScale * lengthScalar * _Constants__WEBPACK_IMPORTED_MODULE_4__.growthScalar * branch.growthScale;
}


/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   normalizeRelativeSide2Ds: () => (/* binding */ normalizeRelativeSide2Ds),
/* harmony export */   normalizeSide2D: () => (/* binding */ normalizeSide2D),
/* harmony export */   normalizedBranchSides: () => (/* binding */ normalizedBranchSides),
/* harmony export */   normalizedFaceSides: () => (/* binding */ normalizedFaceSides),
/* harmony export */   overlaps: () => (/* binding */ overlaps)
/* harmony export */ });
/* harmony import */ var _Constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/* harmony import */ var _Point__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9);
/* harmony import */ var _Side2D__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(14);
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
/* harmony import */ var _Direction__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(10);
/* harmony import */ var _Face__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(8);






// Returns a Side calculated by rotating a 'Side2d' around the origin
// counterclockwise until it is horizontal. 'absoluteDirection' should be the
// non-relative number of the side, starting from the rightmost upward
// side and going counterclockwise. 'absoluteDirection' is zero indexed.
//
// absoluteDirection = ...
//
//         1
//       -----
//    2 /     \  0
//     /       \
//     \       /
//   3  \     /  5
//       -----
//         4
function normalizeSide2D(side2d, absoluteDirection) {
    var theta = _Constants__WEBPACK_IMPORTED_MODULE_0__.oneSixthCircle * (1 - absoluteDirection);
    var left = _Point__WEBPACK_IMPORTED_MODULE_1__.rotate(side2d.left, theta);
    var right = _Point__WEBPACK_IMPORTED_MODULE_1__.rotate(side2d.right, theta);
    return {
        left: left.x,
        right: right.x,
        height: left.y,
    };
}
function normalizeRelativeSide2Ds(side2Ds, shapeDir) {
    return (0,_Utils__WEBPACK_IMPORTED_MODULE_3__.mapArray6)(side2Ds, function (s, i) { return normalizeSide2D(s, (i + shapeDir) % _Direction__WEBPACK_IMPORTED_MODULE_4__.values.length); });
}
// Normalizes the sides of a face. Sides are returned in relative order to their
// un-normalized counterparts.
//         1
//       -----
//    2 /     \  0
//     /       \ _____direction___>
//     \       /
//   3  \     /  5
//       -----
//         4
function normalizedFaceSides(face) {
    return normalizeRelativeSide2Ds(_Side2D__WEBPACK_IMPORTED_MODULE_2__.ofFace(face), _Face__WEBPACK_IMPORTED_MODULE_5__.direction(face));
}
// Normalizes the sides of a face. Sides are returned in relative order to their
// un-normalized counterparts.
//                  1
//       -------------------------
//    2 /                         \  0
//     /                           \ _____direction___>
//     \                           /
//   3  \                         /  5
//       -------------------------
//                  4
function normalizedBranchSides(branch) {
    return normalizeRelativeSide2Ds(_Side2D__WEBPACK_IMPORTED_MODULE_2__.ofBranch(branch), branch.direction);
}
// Returns how far above s1 is from s2 if s1 is above and overlapping
// s2, otherwise returns undefined.
function overlaps(s1, s2) {
    if (s1.height > s2.height &&
        (s1.left < s2.left && s1.right > s2.left ||
            s1.left > s2.left && s2.right > s1.left ||
            s1.left < s2.left && s1.right > s2.right ||
            s1.left > s2.left && s1.right < s2.right)) {
        return s1.height - s2.height;
    }
    return undefined;
}


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ofBranch: () => (/* binding */ ofBranch),
/* harmony export */   ofFace: () => (/* binding */ ofFace),
/* harmony export */   zero: () => (/* binding */ zero)
/* harmony export */ });
/* harmony import */ var _Face__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _Direction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(10);
/* harmony import */ var _Point__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9);
/* harmony import */ var _Branch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(12);
/* harmony import */ var _Utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(5);





function zero() {
    return { left: _Point__WEBPACK_IMPORTED_MODULE_2__.zero(), right: _Point__WEBPACK_IMPORTED_MODULE_2__.zero() };
}
function ofPoints(points) {
    var result = (0,_Utils__WEBPACK_IMPORTED_MODULE_4__.makeArray6)(zero);
    for (var i = 0; i < _Direction__WEBPACK_IMPORTED_MODULE_1__.values.length; i += 1) {
        result[i].left = points[(i + 1) % _Direction__WEBPACK_IMPORTED_MODULE_1__.values.length];
        result[i].right = points[i];
    }
    return result;
}
// Side2Ds are returned in relative order:
//         1
//       -----
//    2 /     \  0
//     /       \ _____direction___>
//     \       /
//   3  \     /  5
//       -----
//         4
function ofFace(face) {
    return ofPoints(_Face__WEBPACK_IMPORTED_MODULE_0__.points(face));
}
// Side2Ds are returned in relative order:
//               1
//       -----------------
//    2 /                 \  0
//     /                   \ _____direction___>
//     \                   /
//   3  \                 /  5
//       -----------------
//               4
function ofBranch(branch) {
    return ofPoints(_Branch__WEBPACK_IMPORTED_MODULE_3__.points(branch));
}


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
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
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   main: () => (/* binding */ main)
/* harmony export */ });
/* harmony import */ var _Controller__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);

function main() {
    return _Controller__WEBPACK_IMPORTED_MODULE_0__.make();
}

})();

Main = __webpack_exports__;
/******/ })()
;