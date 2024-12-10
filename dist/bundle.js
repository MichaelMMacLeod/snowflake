var Main;(()=>{"use strict";var t={d:(e,n)=>{for(var r in n)t.o(n,r)&&!t.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:n[r]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},e={};t.r(e),t.d(e,{main:()=>P});var n=2*Math.PI/6,r=.001,o=.3*r,i=[-1,-.75,-.5,-.25,0,.25,.5,.75,1];function a(t,e){return(t%e+e)%e}function c(t,e,n){return(1-n)*t+n*e}function l(t){return[t(),t(),t(),t(),t(),t()]}function h(t){var e=t.r,n=t.g,r=t.b,o=t.a;return"rgba(".concat(e,", ").concat(n,", ").concat(r,", ").concat(o,")")}function g(){for(var t=[0],e=1;e<16;e++)t[e]=Math.floor(9*Math.random());return t[0]=Math.floor(4*Math.random()),t}function s(t,e,n,r,o,i){var a=e.ctx.fillStyle,c=e.ctx.strokeStyle,l=e.ctx.getLineDash(),g=t.options.foregroundColor,s=o?8:5,u=i?[2,2]:[];e.ctx.beginPath(),e.ctx.arc(n,r,3,0,2*Math.PI),e.ctx.closePath(),e.ctx.fillStyle=h(g),e.ctx.fill(),e.ctx.closePath(),e.ctx.beginPath(),e.ctx.arc(n,r,s,0,2*Math.PI),e.ctx.strokeStyle=h(g),e.ctx.setLineDash(u),e.ctx.stroke(),e.ctx.fillStyle=a,e.ctx.strokeStyle=c,e.ctx.setLineDash(l)}function u(t,e,n){var r=e.writableGraphWidth,o=e.writableGraphHeight,a=e.graphMargin;return{x:r/(t.growthInput.length-1)*n+a,y:4*i[t.growthInput[n]]*(o/i.length)+.5*o}}function f(t,e,n){for(var r=1/0,o=0,i=0;i<t.growthInput.length;i+=1){var a=u(t,e,i).x-n.x,c=a*a;c<r&&(r=c,o=i)}return o}var d=[0*n,1*n,2*n,3*n,4*n,5*n];function v(){return{x:0,y:0}}function p(t,e){return{x:t.x*Math.cos(e)-t.y*Math.sin(e),y:t.x*Math.sin(e)+t.y*Math.cos(e)}}function x(t,e){var n=t.canvas.width,r=t.canvas.height;return{x:e.x*n*.5+.5*n,y:e.y*-r*.5+.5*r}}function y(t){return"none"===t.direction?0:t.direction}function w(t){for(var e="none"===t.direction?0:t.direction,n=l(v),r=0;r<d.length;r+=1){var o=d[(e+r)%d.length];n[r].x=t.center.x+t.size*Math.cos(o),n[r].y=t.center.y+t.size*Math.sin(o)}return n}var m=function(){return m=Object.assign||function(t){for(var e,n=1,r=arguments.length;n<r;n++)for(var o in e=arguments[n])Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o]);return t},m.apply(this,arguments)};function b(t){var e=d[t.direction],n=t.length;return{x:t.start.x+n*Math.cos(e),y:t.start.y+n*Math.sin(e)}}function M(t){var e=w(function(t){return m(m({},{center:{x:0,y:0},size:.0025,direction:"none",growthScale:1,growing:!0}),{center:(e=t.start,{x:e.x,y:e.y}),size:t.size,direction:t.direction});var e}(t)),n=w(function(t){return m(m({},{center:{x:0,y:0},size:.0025,direction:"none",growthScale:1,growing:!0}),{center:(e=t.start,n={x:t.length*Math.cos(d[t.direction]),y:t.length*Math.sin(d[t.direction])},{x:e.x+n.x,y:e.y+n.y}),size:t.size,direction:t.direction});var e,n}(t));return[n[0],n[1],e[2],e[3],e[4],n[5]]}function E(){return{left:{x:0,y:0},right:{x:0,y:0}}}function S(t){for(var e=l(E),n=0;n<d.length;n+=1)e[n].left=t[(n+1)%d.length],e[n].right=t[n];return e}function T(t,e){return r=function(t,r){return o=t,i=(r+e)%d.length,a=n*(1-i),c=p(o.left,a),l=p(o.right,a),{left:c.x,right:l.x,height:c.y};var o,i,a,c,l},t.map(r,undefined);var r}function k(t,e){if(t.height>e.height&&(t.left<e.left&&t.right>e.left||t.left>e.left&&e.right>t.left||t.left<e.left&&t.right>e.right||t.left>e.left&&t.right<e.right))return t.height-e.height}function G(t){t.eventQueue.forEach((function(e){return function(t,e){if(void 0===t.eventHandlers)throw new Error("state.eventHandlers is undefined");t.eventHandlers[e.kind](e)}(t,e)})),t.eventQueue.length=0,function(t){var e=t.snowflake,n=t.graph,l=t.graphic,g=t.maxSteps,v=t.playing;if(t.step<g&&v){t.step+=1;var p=function(t,e){var n=c(0,t.growthInput.length-1,e),r=function(t){return t%1}(n),o=c(i[t.growthInput[Math.floor(n)]],i[t.growthInput[Math.ceil(n)]],r);return{scale:(-.01*n+1)*Math.abs(o),growthType:o>0?"branching":"faceting"}}(n,function(t){return t.step/t.maxSteps}(t));void 0===t.currentGrowthType&&(t.currentGrowthType=p.growthType),t.currentGrowthType!==p.growthType&&(t.currentGrowthType=p.growthType,"branching"===t.currentGrowthType?function(t){t.faces.forEach((function(e){e.growing&&(function(t,e){for(var n,r=.01*e.size,o=.001+1*e.size*.99,i=e.center.x,c=e.center.y,l="none"===e.direction?[0,6]:[(n=e.direction,a(n-1,d.length)),3],h=l[1],g=l[0],s=function(n){var a=i+o*Math.cos(d[g]),l=c+o*Math.sin(d[g]),h="none"===e.direction||1===n?.9*e.growthScale:.5*e.growthScale*1;t.branches.push({start:{x:a,y:l},size:r,length:0,direction:g,growthScale:h,growing:!0}),g=function(t){return(t+1)%d.length}(g)},u=0;u<h;u+=1)s(u)}(t,e),e.growing=!1)}))}(e):function(t){t.branches.forEach((function(e){e.growing&&(function(t,e){t.faces.push({center:b(e),size:e.size,direction:e.direction,growthScale:e.growthScale,growing:!0})}(t,e),e.growing=!1)}))}(e));var m=function(t){var e=[[],[],[],[],[],[]];return t.faces.forEach((function(t){var n;(n=t,T(function(t){return S(w(t))}(n),y(n))).forEach((function(n,r){var o=(r+y(t))%d.length;e[o].push(n)}))})),t.branches.forEach((function(t){var n;(n=t,T(function(t){return S(M(t))}(n),n.direction)).forEach((function(n,r){var o=(r+t.direction)%d.length;e[o].push(n)}))})),e}(e);"branching"===t.currentGrowthType?(function(t,e){t.branches.forEach((function(n,r){if(r+=t.faces.length,n.growing){for(var o=n.direction,i=o,c=a(o-1,d.length),l=e[i][r],h=e[c][r],g=e[i],s=e[c],u=0;u<g.length;++u)if(u!==r&&void 0!==k(g[u],l)){n.growing=!1;break}if(n.growing)for(u=0;u<s.length;++u)if(u!==r&&void 0!==k(s[u],h)){n.growing=!1;break}}}))}(e,m),e.branches.forEach((function(t){var e,n,i,a;t.growing&&(e=t,i=-1.5*(n=p.scale)+1.5,a=1.5*n,e.size+=a*o*e.growthScale,e.length+=i*r*e.growthScale)}))):(function(t,e){t.faces.forEach((function(t,n){if(t.growing){for(var r=y(t),o=r,i=a(r-1,d.length),c=e[o][n],l=e[i][n],h=e[o],g=e[i],s=0;s<h.length;++s)if(s!==n&&void 0!==k(h[s],c)){t.growing=!1;break}if(t.growing)for(s=0;s<g.length;++s)if(s!==n&&void 0!==k(g[s],l)){t.growing=!1;break}}}))}(e,m),e.faces.forEach((function(t){t.growing&&function(t,e){if(t.size+=.75*e*r*t.growthScale,"none"!==t.direction){var n=.75*e*r*Math.cos(d[t.direction])*t.growthScale,o=.75*e*r*Math.sin(d[t.direction])*t.growthScale;t.center.x+=n,t.center.y+=o}}(t,p.scale)}))),void 0!==l&&function(t,e){e.faces.forEach((function(e){e.growing&&function(t,e){"none"===e.direction||e.direction,t.ctx.beginPath(),w(e).forEach((function(e,n){var r=x(t,e),o=r.x,i=r.y;0===n?t.ctx.moveTo(o,i):t.ctx.lineTo(o,i)})),t.ctx.closePath(),t.ctx.fillStyle="rgba(255, 255, 255, 0.025)",t.ctx.fill()}(t,e)})),e.branches.forEach((function(e){e.growing&&function(t,e){t.ctx.beginPath(),M(e).forEach((function(e,n){var r=x(t,e),o=r.x,i=r.y;0===n?t.ctx.moveTo(o,i):t.ctx.lineTo(o,i)})),t.ctx.closePath(),t.ctx.fillStyle="rgba(255, 255, 255, 0.025)",t.ctx.fill()}(t,e)}))}(l,e)}!function(t,e){!function(t,e,n){void 0===t.installation?n():e(t.installation)}(t,e,(function(){}))}(n,(function(e){(function(t,e){if(void 0!==e.handleBeingDragged||e.mouseRecentlyExitedGraph){e.mouseRecentlyExitedGraph=!1;var n="needs lookup"===e.handleBeingDragged&&void 0!==e.graphMouse?f(t,e,e.graphMouse):e.handleBeingDragged;if("needs lookup"===e.handleBeingDragged&&(e.handleBeingDragged=n),void 0!==e.graphMouse&&"needs lookup"!==n){var r=e.writableGraphHeight/i.length,o=Math.floor(e.graphMouse.y/r);void 0!==n&&(t.growthInput[n]=(a=o,c=i.length-1,Math.min(Math.max(a,0),c)))}}var a,c,l=void 0!==e.handleBeingDragged?"none":"auto",h=function(t){return t.setAttribute("style","user-select: ".concat(l))};Array.from(document.getElementsByClassName("graphLabel")).forEach(h),Array.from(document.getElementsByClassName("control")).forEach(h);var g=document.getElementById("controlContainer");null!==g&&h(g)})(n,e),e.ctx.clearRect(0,0,e.canvas.width,e.canvas.height),function(t,e,n,r){var o=e.writableGraphWidth,i=e.writableGraphHeight,a=e.graphMargin,c=n/r,l=e.ctx.fillStyle;e.ctx.fillStyle=h(t.options.progressColor),e.ctx.fillRect(a,0,o*c,i),e.ctx.fillStyle=l,e.ctx.beginPath();var g=u(t,e,0);e.ctx.moveTo(g.x,g.y);for(var d=1;d<t.growthInput.length;d+=1)g=u(t,e,d),e.ctx.lineTo(g.x,g.y);for(e.ctx.strokeStyle=h(t.options.foregroundColor),e.ctx.stroke(),d=0;d<t.growthInput.length;d+=1)if(g=u(t,e,d),void 0!==e.graphMouse){var v=f(t,e,e.graphMouse);s(t,e,g.x,g.y,d===v,d===e.handleBeingDragged)}else s(t,e,g.x,g.y,!1,!1);e.ctx.beginPath();var p=o*c+a;e.ctx.moveTo(p,0),e.ctx.lineTo(p,i),e.ctx.strokeStyle=h(t.options.progressLineColor),e.ctx.stroke(),e.ctx.beginPath();var x=.5*i;e.ctx.moveTo(a,x),e.ctx.lineTo(o+a,x),e.ctx.strokeStyle=h(t.options.foregroundColor),e.ctx.setLineDash([2,2]),e.ctx.stroke(),e.ctx.setLineDash([])}(n,e,t.step,g)}))}(t)}function L(){var t,e={graph:{options:{progressColor:{r:255,g:255,b:255,a:1},progressLineColor:{r:255,g:255,b:255,a:1},backgroundColor:{r:0,g:0,b:0,a:1},foregroundColor:{r:0,g:0,b:0,a:1}},growthInput:g(),installation:void 0},graphic:void 0,snowflake:{faces:[{center:{x:0,y:0},size:.0025,direction:"none",growthScale:1,growing:!0}],branches:[]},currentGrowthType:void 0,playing:!1,step:0,maxSteps:1e3,eventQueue:[],eventHandlers:void 0,eventHandlerTimeout:void 0};return e.eventHandlers=(t=e,{installSnowflake:function(e){var n=e.options,r=e.installCanvas,o=e.onNoContextFailure;if(void 0!==t.graphic)throw new Error("snowflake already installed");t.graphic=function(t){var e=document.createElement("canvas");e.width=t.width,e.height=t.height,e.className=t.className;var n=e.getContext("2d");if(null!==n)return{canvas:e,ctx:n}}(n),void 0===t.graphic?o():r(t.graphic.canvas)},installGraph:function(e){var n=e.options,r=e.installCanvas,o=e.onNoContextFailure;!function(t,e){if(void 0===t.installation){var n=document.createElement("canvas");n.width=e.canvasWidth,n.height=e.canvasHeight,n.className=e.canvasClassName;var r=n.getContext("2d");null!==r&&(n.addEventListener("mousemove",o),n.addEventListener("mousedown",i),n.addEventListener("mouseleave",c),e.mouseUpEventListenerNode.addEventListener("mouseup",a),t.installation={options:e,canvas:n,ctx:r,handleBeingDragged:void 0,mouseRecentlyExitedGraph:!1,graphMouse:void 0,graphMargin:10,writableGraphWidth:n.width-20,writableGraphHeight:n.height,removeEventListeners:function(){n.removeEventListener("mousemove",o),n.removeEventListener("mousedown",i),n.removeEventListener("mouseleave",c),e.mouseUpEventListenerNode.removeEventListener("mouseup",a)}})}else console.error("attempt to install graph twice");function o(e){void 0!==t.installation&&(t.installation.graphMouse={x:e.offsetX,y:e.offsetY})}function i(){void 0!==t.installation&&(t.installation.handleBeingDragged="needs lookup")}function a(){void 0!==t.installation&&(t.installation.handleBeingDragged=void 0,t.installation.graphMouse=void 0)}function c(){void 0!==t.installation&&(t.installation.mouseRecentlyExitedGraph=!0)}}(t.graph,n),void 0===t.graph.installation?o():r(t.graph.installation.canvas)},play:function(e){var n=e.play;t.playing="toggle"===n?!t.playing:n},reset:function(e){var n,r;(n=t.snowflake).faces.length=1,n.faces[0]={center:{x:0,y:0},size:.0025,direction:"none",growthScale:1,growing:!0},n.branches.length=0,t.step=0,t.currentGrowthType=void 0,void 0!==t.graphic&&(r=t.graphic).ctx.clearRect(0,0,r.canvas.width,r.canvas.height)},randomize:function(e){t.graph.growthInput=g()},halt:function(e){var n;clearInterval(t.eventHandlerTimeout),null===(n=t.graph.installation)||void 0===n||n.removeEventListeners()}}),e.eventHandlerTimeout=setInterval((function(){return G(e)}),1e3/120),e}function C(t,e){t.eventQueue.push(e)}function P(){return t=L(),{handle:function(e){return C(t,e)},handleAll:function(e){return e.forEach((function(e){return C(t,e)}))}};var t}Main=e})();