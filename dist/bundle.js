var Main;(()=>{"use strict";var t={d:(n,e)=>{for(var r in e)t.o(e,r)&&!t.o(n,r)&&Object.defineProperty(n,r,{enumerable:!0,get:e[r]})},o:(t,n)=>Object.prototype.hasOwnProperty.call(t,n),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},n={};t.r(n),t.d(n,{main:()=>I});var e=2*Math.PI/6,r=.001,o=.3*r,i=[-1,-.75,-.5,-.25,0,.25,.5,.75,1];function a(t,n){return(t%n+n)%n}function c(t,n,e){return(1-e)*t+e*n}function h(t){return[t(),t(),t(),t(),t(),t()]}function l(t){var n=t.r,e=t.g,r=t.b,o=t.a;return"rgba(".concat(n,", ").concat(e,", ").concat(r,", ").concat(o,")")}function g(){for(var t=[0],n=1;n<16;n++)t[n]=Math.floor(9*Math.random());return t[0]=Math.floor(4*Math.random()),t}function u(t,n,e,r,o,i){var a=n.ctx.fillStyle,c=n.ctx.strokeStyle,h=n.ctx.getLineDash(),g=t.options.foregroundColor,u=o?8:5,f=i?[2,2]:[];n.ctx.beginPath(),n.ctx.arc(e,r,3,0,2*Math.PI),n.ctx.closePath(),n.ctx.fillStyle=l(g),n.ctx.fill(),n.ctx.closePath(),n.ctx.beginPath(),n.ctx.arc(e,r,u,0,2*Math.PI),n.ctx.strokeStyle=l(g),n.ctx.setLineDash(f),n.ctx.stroke(),n.ctx.fillStyle=a,n.ctx.strokeStyle=c,n.ctx.setLineDash(h)}function f(t,n,e){var r=n.writableGraphWidth,o=n.writableGraphHeight,a=n.graphMargin;return{x:r/(t.growthInput.length-1)*e+a,y:4*i[t.growthInput[e]]*(o/i.length)+.5*o}}function s(t,n,e){for(var r=1/0,o=0,i=0;i<t.growthInput.length;i+=1){var a=f(t,n,i).x-e.x,c=a*a;c<r&&(r=c,o=i)}return o}var d=[0*e,1*e,2*e,3*e,4*e,5*e];function v(){return{x:0,y:0}}function x(t,n){return{x:t.x*Math.cos(n)-t.y*Math.sin(n),y:t.x*Math.sin(n)+t.y*Math.cos(n)}}function p(t,n){var e=t.canvas.width,r=t.canvas.height;return{x:n.x*e*.5+.5*e,y:n.y*-r*.5+.5*r}}function y(t){return"none"===t.direction?0:t.direction}function w(t){for(var n="none"===t.direction?0:t.direction,e=h(v),r=0;r<d.length;r+=1){var o=d[(n+r)%d.length];e[r].x=t.center.x+t.size*Math.cos(o),e[r].y=t.center.y+t.size*Math.sin(o)}return e}var b=function(){return b=Object.assign||function(t){for(var n,e=1,r=arguments.length;e<r;e++)for(var o in n=arguments[e])Object.prototype.hasOwnProperty.call(n,o)&&(t[o]=n[o]);return t},b.apply(this,arguments)};function m(t){var n=d[t.direction],e=t.length;return{x:t.start.x+e*Math.cos(n),y:t.start.y+e*Math.sin(n)}}function M(t){var n=w(function(t){return b(b({},{center:{x:0,y:0},size:.0025,direction:"none",growthScale:1,growing:!0}),{center:(n=t.start,{x:n.x,y:n.y}),size:t.size,direction:t.direction});var n}(t)),e=w(function(t){return b(b({},{center:{x:0,y:0},size:.0025,direction:"none",growthScale:1,growing:!0}),{center:(n=t.start,e={x:t.length*Math.cos(d[t.direction]),y:t.length*Math.sin(d[t.direction])},{x:n.x+e.x,y:n.y+e.y}),size:t.size,direction:t.direction});var n,e}(t));return[e[0],e[1],n[2],n[3],n[4],e[5]]}function S(){return{left:{x:0,y:0},right:{x:0,y:0}}}function E(t){for(var n=h(S),e=0;e<d.length;e+=1)n[e].left=t[(e+1)%d.length],n[e].right=t[e];return n}function T(t,n){return r=function(t,r){return o=t,i=(r+n)%d.length,a=e*(1-i),c=x(o.left,a),h=x(o.right,a),{left:c.x,right:h.x,height:c.y};var o,i,a,c,h},t.map(r,undefined);var r}function k(t,n){if(t.height>n.height&&(t.left<n.left&&t.right>n.left||t.left>n.left&&n.right>t.left||t.left<n.left&&t.right>n.right||t.left>n.left&&t.right<n.right))return t.height-n.height}function C(t){!function(t){var n=t.snowflake,e=t.graph,h=t.graphic,g=t.maxSteps,v=t.playing;if(t.step<g&&v){t.step+=1;var x=function(t,n){var e=c(0,t.growthInput.length-1,n),r=function(t){return t%1}(e),o=c(i[t.growthInput[Math.floor(e)]],i[t.growthInput[Math.ceil(e)]],r);return{scale:(-.01*e+1)*Math.abs(o),growthType:o>0?"branching":"faceting"}}(e,function(t){return t.step/t.maxSteps}(t));void 0===t.currentGrowthType&&(t.currentGrowthType=x.growthType),t.currentGrowthType!==x.growthType&&(t.currentGrowthType=x.growthType,"branching"===t.currentGrowthType?function(t){t.faces.forEach((function(n){n.growing&&(function(t,n){for(var e,r=.01*n.size,o=.001+1*n.size*.99,i=n.center.x,c=n.center.y,h="none"===n.direction?[0,6]:[(e=n.direction,a(e-1,d.length)),3],l=h[1],g=h[0],u=function(e){var a=i+o*Math.cos(d[g]),h=c+o*Math.sin(d[g]),l="none"===n.direction||1===e?.9*n.growthScale:.5*n.growthScale*1;t.branches.push({start:{x:a,y:h},size:r,length:0,direction:g,growthScale:l,growing:!0}),g=function(t){return(t+1)%d.length}(g)},f=0;f<l;f+=1)u(f)}(t,n),n.growing=!1)}))}(n):function(t){t.branches.forEach((function(n){n.growing&&(function(t,n){t.faces.push({center:m(n),size:n.size,direction:n.direction,growthScale:n.growthScale,growing:!0})}(t,n),n.growing=!1)}))}(n));var b=function(t){var n=[[],[],[],[],[],[]];return t.faces.forEach((function(t){var e;(e=t,T(function(t){return E(w(t))}(e),y(e))).forEach((function(e,r){var o=(r+y(t))%d.length;n[o].push(e)}))})),t.branches.forEach((function(t){var e;(e=t,T(function(t){return E(M(t))}(e),e.direction)).forEach((function(e,r){var o=(r+t.direction)%d.length;n[o].push(e)}))})),n}(n);"branching"===t.currentGrowthType?(function(t,n){t.branches.forEach((function(e,r){if(r+=t.faces.length,e.growing){for(var o=e.direction,i=o,c=a(o-1,d.length),h=n[i][r],l=n[c][r],g=n[i],u=n[c],f=0;f<g.length;++f)if(f!==r&&void 0!==k(g[f],h)){e.growing=!1;break}if(e.growing)for(f=0;f<u.length;++f)if(f!==r&&void 0!==k(u[f],l)){e.growing=!1;break}}}))}(n,b),n.branches.forEach((function(t){var n,e,i,a;t.growing&&(n=t,i=-1.5*(e=x.scale)+1.5,a=1.5*e,n.size+=a*o*n.growthScale,n.length+=i*r*n.growthScale)}))):(function(t,n){t.faces.forEach((function(t,e){if(t.growing){for(var r=y(t),o=r,i=a(r-1,d.length),c=n[o][e],h=n[i][e],l=n[o],g=n[i],u=0;u<l.length;++u)if(u!==e&&void 0!==k(l[u],c)){t.growing=!1;break}if(t.growing)for(u=0;u<g.length;++u)if(u!==e&&void 0!==k(g[u],h)){t.growing=!1;break}}}))}(n,b),n.faces.forEach((function(t){t.growing&&function(t,n){if(t.size+=.75*n*r*t.growthScale,"none"!==t.direction){var e=.75*n*r*Math.cos(d[t.direction])*t.growthScale,o=.75*n*r*Math.sin(d[t.direction])*t.growthScale;t.center.x+=e,t.center.y+=o}}(t,x.scale)}))),void 0!==h&&(function(t){t.ctx.clearRect(0,0,t.canvas.width,t.canvas.height)}(h),function(t,n){n.faces.forEach((function(n){return function(t,n){"none"===n.direction||n.direction,t.ctx.beginPath(),w(n).forEach((function(n,e){var r=p(t,n),o=r.x,i=r.y;0===e?t.ctx.moveTo(o,i):t.ctx.lineTo(o,i)})),t.ctx.closePath(),t.ctx.fillStyle="rgba(255, 255, 255, 1)",t.ctx.fill()}(t,n)})),n.branches.forEach((function(n){return function(t,n){t.ctx.beginPath(),M(n).forEach((function(n,e){var r=p(t,n),o=r.x,i=r.y;0===e?t.ctx.moveTo(o,i):t.ctx.lineTo(o,i)})),t.ctx.closePath(),t.ctx.fillStyle="rgba(255, 255, 255, 1)",t.ctx.fill()}(t,n)}))}(h,n))}!function(t,n){!function(t,n,e){void 0===t.installation?e():n(t.installation)}(t,n,(function(){}))}(e,(function(n){(function(t,n){if(void 0!==n.handleBeingDragged||n.mouseRecentlyExitedGraph){n.mouseRecentlyExitedGraph=!1;var e="needs lookup"===n.handleBeingDragged&&void 0!==n.graphMouse?s(t,n,n.graphMouse):n.handleBeingDragged;if("needs lookup"===n.handleBeingDragged&&(n.handleBeingDragged=e),void 0!==n.graphMouse&&"needs lookup"!==e){var r=n.writableGraphHeight/i.length,o=Math.floor(n.graphMouse.y/r);void 0!==e&&(t.growthInput[e]=(a=o,c=i.length-1,Math.min(Math.max(a,0),c)))}}var a,c,h=void 0!==n.handleBeingDragged?"none":"auto",l=function(t){return t.setAttribute("style","user-select: ".concat(h))};Array.from(document.getElementsByClassName("graphLabel")).forEach(l),Array.from(document.getElementsByClassName("control")).forEach(l);var g=document.getElementById("controlContainer");null!==g&&l(g)})(e,n),n.ctx.clearRect(0,0,n.canvas.width,n.canvas.height),function(t,n,e,r){var o=n.writableGraphWidth,i=n.writableGraphHeight,a=n.graphMargin,c=e/r,h=n.ctx.fillStyle;n.ctx.fillStyle=l(t.options.progressColor),n.ctx.fillRect(a,0,o*c,i),n.ctx.fillStyle=h,n.ctx.beginPath();var g=f(t,n,0);n.ctx.moveTo(g.x,g.y);for(var d=1;d<t.growthInput.length;d+=1)g=f(t,n,d),n.ctx.lineTo(g.x,g.y);for(n.ctx.strokeStyle=l(t.options.foregroundColor),n.ctx.stroke(),d=0;d<t.growthInput.length;d+=1)if(g=f(t,n,d),void 0!==n.graphMouse){var v=s(t,n,n.graphMouse);u(t,n,g.x,g.y,d===v,d===n.handleBeingDragged)}else u(t,n,g.x,g.y,!1,!1);n.ctx.beginPath();var x=o*c+a;n.ctx.moveTo(x,0),n.ctx.lineTo(x,i),n.ctx.strokeStyle=l(t.options.progressLineColor),n.ctx.stroke(),n.ctx.beginPath();var p=.5*i;n.ctx.moveTo(a,p),n.ctx.lineTo(o+a,p),n.ctx.strokeStyle=l(t.options.foregroundColor),n.ctx.setLineDash([2,2]),n.ctx.stroke(),n.ctx.setLineDash([])}(e,n,t.step,g)}))}(t),t.eventQueue.forEach((function(n){return function(t,n){if(void 0===t.eventHandlers)throw new Error("state.eventHandlers is undefined");t.eventHandlers[n.type](n.data)}(t,n)})),t.eventQueue.length=0}function P(){var t,n={graph:{options:{progressColor:{r:255,g:255,b:255,a:1},progressLineColor:{r:255,g:255,b:255,a:1},backgroundColor:{r:0,g:0,b:0,a:1},foregroundColor:{r:0,g:0,b:0,a:1}},growthInput:g(),installation:void 0},graphic:void 0,snowflake:{faces:[{center:{x:0,y:0},size:.0025,direction:"none",growthScale:1,growing:!0}],branches:[]},currentGrowthType:void 0,playing:!0,step:0,intervalId:void 0,maxSteps:1e3,eventQueue:[],eventHandlers:void 0,eventHandlerTimeout:void 0};return n.eventHandlers=(t=n,{installSnowflake:function(n){if(void 0!==t.graphic)throw new Error("snowflake already installed");t.graphic=function(t){var n=document.createElement("canvas");n.width=t.width,n.height=t.height,n.className=t.className;var e=n.getContext("2d");if(null!==e)return{canvas:n,ctx:e}}(n.options),void 0===t.graphic?n.onNoContextFailure():n.installCanvas(t.graphic.canvas)}}),n.eventHandlerTimeout=setInterval((function(){return C(n)}),1e3/60),n}function I(){var t,n=(t=P(),{handle:function(n){return function(t,n){t.eventQueue.push(n)}(t,n)}});return n.handle({type:"installSnowflake",data:{options:{className:"snowflake",width:800,height:800},installCanvas:function(t){var n;null===(n=document.getElementById("canvasContainer"))||void 0===n||n.appendChild(t)},onNoContextFailure:function(){throw new Error("error getting canvas context")}}}),n}Main=n})();