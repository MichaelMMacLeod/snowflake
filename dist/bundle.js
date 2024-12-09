var Main;(()=>{"use strict";var t={d:(e,n)=>{for(var r in n)t.o(n,r)&&!t.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:n[r]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},e={};t.r(e),t.d(e,{main:()=>L});var n=2*Math.PI/6,r=.001,o=.3*r,i=[-1,-.75,-.5,-.25,0,.25,.5,.75,1];function a(t,e){return(t%e+e)%e}function c(t,e,n){return(1-n)*t+n*e}function l(t){return[t(),t(),t(),t(),t(),t()]}function g(t){var e=t.r,n=t.g,r=t.b,o=t.a;return"rgba(".concat(e,", ").concat(n,", ").concat(r,", ").concat(o,")")}function h(){for(var t=[0],e=0;e<16;e++)t[e]=Math.floor(9*Math.random());return t}function s(t,e,n,r,o){var i=t.ctx.fillStyle,a=t.ctx.strokeStyle,c=t.ctx.getLineDash(),l=t.options.foregroundColor,h=r?8:5,s=o?[2,2]:[];t.ctx.beginPath(),t.ctx.arc(e,n,3,0,2*Math.PI),t.ctx.closePath(),t.ctx.fillStyle=g(l),t.ctx.fill(),t.ctx.closePath(),t.ctx.beginPath(),t.ctx.arc(e,n,h,0,2*Math.PI),t.ctx.strokeStyle=g(l),t.ctx.setLineDash(s),t.ctx.stroke(),t.ctx.fillStyle=i,t.ctx.strokeStyle=a,t.ctx.setLineDash(c)}function u(t,e,n,r,o){return{x:e/(t.growthInput.length-1)*o+r,y:4*i[t.growthInput[o]]*(n/i.length)+.5*n}}function f(t){t.ctx.clearRect(0,0,t.canvas.width,t.canvas.height)}var d=[0*n,1*n,2*n,3*n,4*n,5*n];function p(){return{x:0,y:0}}function v(t,e){return{x:t.x*Math.cos(e)-t.y*Math.sin(e),y:t.x*Math.sin(e)+t.y*Math.cos(e)}}function y(t,e){var n=t.canvas.width,r=t.canvas.height;return{x:e.x*n*.5+.5*n,y:e.y*-r*.5+.5*r}}function x(t){return"none"===t.direction?0:t.direction}function w(t){for(var e="none"===t.direction?0:t.direction,n=l(p),r=0;r<d.length;r+=1){var o=d[(e+r)%d.length];n[r].x=t.center.x+t.size*Math.cos(o),n[r].y=t.center.y+t.size*Math.sin(o)}return n}var b=function(){return b=Object.assign||function(t){for(var e,n=1,r=arguments.length;n<r;n++)for(var o in e=arguments[n])Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o]);return t},b.apply(this,arguments)};function m(t){var e=d[t.direction],n=t.length;return{x:t.start.x+n*Math.cos(e),y:t.start.y+n*Math.sin(e)}}function M(t){var e=w(function(t){return b(b({},{center:{x:0,y:0},size:.0025,direction:"none",growthScale:1,growing:!0}),{center:(e=t.start,{x:e.x,y:e.y}),size:t.size,direction:t.direction});var e}(t)),n=w(function(t){return b(b({},{center:{x:0,y:0},size:.0025,direction:"none",growthScale:1,growing:!0}),{center:(e=t.start,n={x:t.length*Math.cos(d[t.direction]),y:t.length*Math.sin(d[t.direction])},{x:e.x+n.x,y:e.y+n.y}),size:t.size,direction:t.direction});var e,n}(t));return[n[0],n[1],e[2],e[3],e[4],n[5]]}function E(){return{left:{x:0,y:0},right:{x:0,y:0}}}function S(t){for(var e=l(E),n=0;n<d.length;n+=1)e[n].left=t[(n+1)%d.length],e[n].right=t[n];return e}function I(t,e){return r=function(t,r){return o=t,i=(r+e)%d.length,a=n*(1-i),c=v(o.left,a),l=v(o.right,a),{left:c.x,right:l.x,height:c.y};var o,i,a,c,l},t.map(r,undefined);var r}function k(t,e){if(t.height>e.height&&(t.left<e.left&&t.right>e.left||t.left>e.left&&e.right>t.left||t.left<e.left&&t.right>e.right||t.left>e.left&&t.right<e.right))return t.height-e.height}function T(t,e){for(var n=t.writableGraphWidth,r=t.writableGraphHeight,o=t.graphMargin,i=t.graph,a=1/0,c=0,l=0;l<i.growthInput.length;l+=1){var g=u(i,n,r,o,l).x-e.x,h=g*g;h<a&&(a=h,c=l)}return c}function C(t){var e=t.snowflake,n=t.graph,l=t.graphic,h=t.maxSteps,p=t.controls;if(t.step<h&&p.playing){t.step+=1;var v=function(t,e){var n=c(0,t.growthInput.length-1,e),r=function(t){return t%1}(n),o=c(i[t.growthInput[Math.floor(n)]],i[t.growthInput[Math.ceil(n)]],r);return{scale:(-.01*n+1)*Math.abs(o),growthType:o>0?"branching":"faceting"}}(n,function(t){return t.step/t.maxSteps}(t));void 0===t.currentGrowthType&&(t.currentGrowthType=v.growthType),t.currentGrowthType!==v.growthType&&(t.currentGrowthType=v.growthType,"branching"===t.currentGrowthType?function(t){t.faces.forEach((function(e){e.growing&&(function(t,e){for(var n,r=.01*e.size,o=.001+1*e.size*.99,i=e.center.x,c=e.center.y,l="none"===e.direction?[0,6]:[(n=e.direction,a(n-1,d.length)),3],g=l[1],h=l[0],s=function(n){var a=i+o*Math.cos(d[h]),l=c+o*Math.sin(d[h]),g="none"===e.direction||1===n?.9*e.growthScale:.5*e.growthScale*1;t.branches.push({start:{x:a,y:l},size:r,length:0,direction:h,growthScale:g,growing:!0}),h=function(t){return(t+1)%d.length}(h)},u=0;u<g;u+=1)s(u)}(t,e),e.growing=!1)}))}(e):function(t){t.branches.forEach((function(e){e.growing&&(function(t,e){t.faces.push({center:m(e),size:e.size,direction:e.direction,growthScale:e.growthScale,growing:!0})}(t,e),e.growing=!1)}))}(e));var b=function(t){var e=[[],[],[],[],[],[]];return t.faces.forEach((function(t){var n;(n=t,I(function(t){return S(w(t))}(n),x(n))).forEach((function(n,r){var o=(r+x(t))%d.length;e[o].push(n)}))})),t.branches.forEach((function(t){var n;(n=t,I(function(t){return S(M(t))}(n),n.direction)).forEach((function(n,r){var o=(r+t.direction)%d.length;e[o].push(n)}))})),e}(e);"branching"===t.currentGrowthType?(function(t,e){t.branches.forEach((function(n,r){if(r+=t.faces.length,n.growing){for(var o=n.direction,i=o,c=a(o-1,d.length),l=e[i][r],g=e[c][r],h=e[i],s=e[c],u=0;u<h.length;++u)if(u!==r&&void 0!==k(h[u],l)){n.growing=!1;break}if(n.growing)for(u=0;u<s.length;++u)if(u!==r&&void 0!==k(s[u],g)){n.growing=!1;break}}}))}(e,b),e.branches.forEach((function(t){var e,n,i,a;t.growing&&(e=t,i=-1.5*(n=v.scale)+1.5,a=1.5*n,e.size+=a*o*e.growthScale,e.length+=i*r*e.growthScale)}))):(function(t,e){t.faces.forEach((function(t,n){if(t.growing){for(var r=x(t),o=r,i=a(r-1,d.length),c=e[o][n],l=e[i][n],g=e[o],h=e[i],s=0;s<g.length;++s)if(s!==n&&void 0!==k(g[s],c)){t.growing=!1;break}if(t.growing)for(s=0;s<h.length;++s)if(s!==n&&void 0!==k(h[s],l)){t.growing=!1;break}}}))}(e,b),e.faces.forEach((function(t){t.growing&&function(t,e){if(t.size+=.75*e*r*t.growthScale,"none"!==t.direction){var n=.75*e*r*Math.cos(d[t.direction])*t.growthScale,o=.75*e*r*Math.sin(d[t.direction])*t.growthScale;t.center.x+=n,t.center.y+=o}}(t,v.scale)}))),f(l),function(t,e){e.faces.forEach((function(e){return function(t,e){"none"===e.direction||e.direction,t.ctx.beginPath(),w(e).forEach((function(e,n){var r=y(t,e),o=r.x,i=r.y;0===n?t.ctx.moveTo(o,i):t.ctx.lineTo(o,i)})),t.ctx.closePath(),t.ctx.fillStyle="rgba(255, 255, 255, 1)",t.ctx.fill()}(t,e)})),e.branches.forEach((function(e){return function(t,e){t.ctx.beginPath(),M(e).forEach((function(e,n){var r=y(t,e),o=r.x,i=r.y;0===n?t.ctx.moveTo(o,i):t.ctx.lineTo(o,i)})),t.ctx.closePath(),t.ctx.fillStyle="rgba(255, 255, 255, 1)",t.ctx.fill()}(t,e)}))}(l,e)}(function(t){var e,n,r=t.graph,o=t.writableGraphHeight;if(void 0!==r.handleBeingDragged||r.mouseRecentlyExitedGraph){r.mouseRecentlyExitedGraph=!1;var a="needs lookup"===r.handleBeingDragged&&void 0!==r.graphMouse?T(t,r.graphMouse):r.handleBeingDragged;if("needs lookup"===r.handleBeingDragged&&(r.handleBeingDragged=a),void 0!==r.graphMouse&&"needs lookup"!==a){var c=o/i.length,l=Math.floor(r.graphMouse.y/c);void 0!==a&&(r.growthInput[a]=(e=l,n=i.length-1,Math.min(Math.max(e,0),n)))}}var g=void 0!==r.handleBeingDragged?"none":"auto",h=function(t){return t.setAttribute("style","user-select: ".concat(g))};Array.from(document.getElementsByClassName("graphLabel")).forEach(h),Array.from(document.getElementsByClassName("control")).forEach(h);var s=document.getElementById("controlContainer");null!==s&&h(s)})(t),n.ctx.clearRect(0,0,n.canvas.width,n.canvas.height),function(t){var e=t.graph,n=t.writableGraphWidth,r=t.writableGraphHeight,o=t.graphMargin,i=t.step/t.maxSteps,a=e.ctx.fillStyle;e.ctx.fillStyle=g(e.options.progressColor),e.ctx.fillRect(o,0,n*i,r),e.ctx.fillStyle=a,e.ctx.beginPath();var c=u(e,n,r,o,0);e.ctx.moveTo(c.x,c.y);for(var l=1;l<e.growthInput.length;l+=1)c=u(e,n,r,o,l),e.ctx.lineTo(c.x,c.y);for(e.ctx.strokeStyle=g(e.options.foregroundColor),e.ctx.stroke(),l=0;l<e.growthInput.length;l+=1)if(c=u(e,n,r,o,l),void 0!==e.graphMouse){var h=T(t,e.graphMouse);s(e,c.x,c.y,l===h,l===e.handleBeingDragged)}else s(e,c.x,c.y,!1,!1);e.ctx.beginPath();var f=n*i+o;e.ctx.moveTo(f,0),e.ctx.lineTo(f,r),e.ctx.strokeStyle=g(e.options.progressLineColor),e.ctx.stroke(),e.ctx.beginPath();var d=.5*r;e.ctx.moveTo(o,d),e.ctx.lineTo(n+o,d),e.ctx.strokeStyle=g(e.options.foregroundColor),e.ctx.setLineDash([2,2]),e.ctx.stroke(),e.ctx.setLineDash([])}(t)}function G(t){var e=t;return(null!==e&&"object"==typeof e||"function"==typeof e)&&"number"==typeof e.r&&"number"==typeof e.g&&"number"==typeof e.b&&"number"==typeof e.a}function L(t){var e,n,r,o=t({snowflakeInstallationElement:document.body,controlsInstallationElement:document.body,graphOptions:{progressColor:{r:255,g:255,b:255,a:1},progressLineColor:{r:255,g:255,b:255,a:1},backgroundColor:{r:0,g:0,b:0,a:1},foregroundColor:{r:0,g:0,b:0,a:1}}});if((null!==(i=o)&&"object"==typeof i||"function"==typeof i)&&i.snowflakeInstallationElement instanceof HTMLElement&&(void 0===i.controlsInstallationElement||i.controlsInstallationElement instanceof HTMLElement)&&(null!==i.graphOptions&&"object"==typeof i.graphOptions||"function"==typeof i.graphOptions)&&G(i.graphOptions.progressColor)&&G(i.graphOptions.progressLineColor)&&G(i.graphOptions.backgroundColor)&&G(i.graphOptions.foregroundColor)){var i,a=function(t){var e=function(t){var e=document.getElementById("graph"),n=e.getContext("2d");if(null!==n){var r={options:t,canvas:e,ctx:n,handleBeingDragged:void 0,mouseRecentlyExitedGraph:!1,graphMouse:void 0,growthInput:h()};return e.addEventListener("mousemove",(function(t){r.graphMouse={x:t.offsetX,y:t.offsetY}})),e.addEventListener("mousedown",(function(t){r.handleBeingDragged="needs lookup"})),document.addEventListener("mouseup",(function(t){r.handleBeingDragged=void 0,r.graphMouse=void 0})),e.addEventListener("mouseleave",(function(t){r.mouseRecentlyExitedGraph=!0})),r}}(t.graphOptions),n=function(){var t=document.getElementById("snowflake"),e=t.getContext("2d");if(null!==e)return e.fillStyle="rgba(90, 211, 255, 1.0)",{canvas:t,ctx:e}}();if(void 0!==e&&void 0!==n)return{graph:e,graphic:n,snowflake:{faces:[{center:{x:0,y:0},size:.0025,direction:"none",growthScale:1,growing:!0}],branches:[]},currentGrowthType:void 0,graphMargin:10,writableGraphWidth:e.canvas.width-20,writableGraphHeight:e.canvas.height,controls:{pause:document.getElementById("pause"),reset:document.getElementById("reset"),playing:!0},step:0,intervalId:void 0,updateInterval:5,maxSteps:1e3};console.error("Couldn't get drawing context")}(o);void 0!==a&&(n=(e=a).controls,r=e.graphic,n.pause.addEventListener("click",(function(t){n.playing=!n.playing,n.playing?(n.pause.innerHTML="pause",r.canvas.className=""):(n.pause.innerHTML="play",r.canvas.className="paused")})),n.reset.addEventListener("click",(function(t){!function(t){var e;(e=t.snowflake).faces.length=1,e.faces[0]={center:{x:0,y:0},size:.0025,direction:"none",growthScale:1,growing:!0},e.branches.length=0,t.step=0,t.currentGrowthType=void 0,f(t.graphic)}(e)})),a.intervalId=window.setInterval((function(){return C(a)}),a.updateInterval))}else console.error("Recived bad StateOptions from onInit")}Main=e})();