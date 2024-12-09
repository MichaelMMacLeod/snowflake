(()=>{"use strict";var t=2*Math.PI/6,e=.001,n=[-1,-.75,-.5,-.25,0,.25,.5,.75,1];function r(t,e){return(t%e+e)%e}function i(t,e,n){return(1-n)*t+n*e}function o(t){return[t(),t(),t(),t(),t(),t()]}function a(t,e,n,r,i){var o=t.ctx.fillStyle,a=t.ctx.strokeStyle,c=t.ctx.getLineDash(),h="black",g=r?8:5,l=i?[2,2]:[];t.ctx.beginPath(),t.ctx.arc(e,n,3,0,2*Math.PI),t.ctx.closePath(),t.ctx.fillStyle=h,t.ctx.fill(),t.ctx.closePath(),t.ctx.beginPath(),t.ctx.arc(e,n,g,0,2*Math.PI),t.ctx.strokeStyle=h,t.ctx.setLineDash(l),t.ctx.stroke(),t.ctx.fillStyle=o,t.ctx.strokeStyle=a,t.ctx.setLineDash(c)}var c=function(){for(var t=[0],e=0;e<16;e++)t[e]=Math.floor(9*Math.random());return t}();function h(t,e,r,i){return{x:t/(c.length-1)*i+r,y:4*n[c[i]]*(e/n.length)+.5*e}}function g(t){t.ctx.clearRect(0,0,t.canvas.width,t.canvas.height)}var l=[0*t,1*t,2*t,3*t,4*t,5*t];function s(){return{x:0,y:0}}function u(t,e){return{x:t.x*Math.cos(e)-t.y*Math.sin(e),y:t.x*Math.sin(e)+t.y*Math.cos(e)}}function f(t,e){var n=t.canvas.width,r=t.canvas.height;return{x:e.x*n*.5+.5*n,y:e.y*-r*.5+.5*r}}function d(t){return"none"===t.direction?0:t.direction}function v(t){for(var e="none"===t.direction?0:t.direction,n=o(s),r=0;r<l.length;r+=1){var i=l[(e+r)%l.length];n[r].x=t.center.x+t.size*Math.cos(i),n[r].y=t.center.y+t.size*Math.sin(i)}return n}var x,p=function(){return p=Object.assign||function(t){for(var e,n=1,r=arguments.length;n<r;n++)for(var i in e=arguments[n])Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i]);return t},p.apply(this,arguments)};function y(t){var e=l[t.direction],n=t.length;return{x:t.start.x+n*Math.cos(e),y:t.start.y+n*Math.sin(e)}}function w(t){var e=v(function(t){return p(p({},{center:{x:0,y:0},size:.0025,direction:"none",growthScale:1,growing:!0}),{center:(e=t.start,{x:e.x,y:e.y}),size:t.size,direction:t.direction});var e}(t)),n=v(function(t){return p(p({},{center:{x:0,y:0},size:.0025,direction:"none",growthScale:1,growing:!0}),{center:(e=t.start,n={x:t.length*Math.cos(l[t.direction]),y:t.length*Math.sin(l[t.direction])},{x:e.x+n.x,y:e.y+n.y}),size:t.size,direction:t.direction});var e,n}(t));return[n[0],n[1],e[2],e[3],e[4],n[5]]}function b(){return{left:{x:0,y:0},right:{x:0,y:0}}}function m(t){for(var e=o(b),n=0;n<l.length;n+=1)e[n].left=t[(n+1)%l.length],e[n].right=t[n];return e}function M(e,n){return r=function(e,r){return o=t*(1-(r+n)%l.length),a=u((i=e).left,o),c=u(i.right,o),{left:a.x,right:c.x,height:a.y};var i,o,a,c},e.map(r,undefined);var r}function E(t,e){if(t.height>e.height&&(t.left<e.left&&t.right>e.left||t.left>e.left&&e.right>t.left||t.left<e.left&&t.right>e.right||t.left>e.left&&t.right<e.right))return t.height-e.height}function S(t,e){for(var n=t.writableGraphWidth,r=t.writableGraphHeight,i=t.graphMargin,o=1/0,a=0,g=0;g<c.length;g+=1){var l=h(n,r,i,g).x-e.x,s=l*l;s<o&&(o=s,a=g)}return a}function k(t){var o,s,u,x,p=t.snowflake,b=t.graph,k=t.graphic,T=t.maxSteps,G=t.controls;if(t.step<T&&G.playing){t.step+=1;var z=(o=function(t){return t.step/t.maxSteps}(t),u=function(t){return t%1}(s=i(0,c.length-1,o)),x=i(n[c[Math.floor(s)]],n[c[Math.ceil(s)]],u),{scale:(-.01*s+1)*Math.abs(x),growthType:x>0?"branching":"faceting"});void 0===t.currentGrowthType&&(t.currentGrowthType=z.growthType),t.currentGrowthType!==z.growthType&&(t.currentGrowthType=z.growthType,"branching"===t.currentGrowthType?function(t){t.faces.forEach((function(e){e.growing&&(function(t,e){for(var n,i=.01*e.size,o=.001+1*e.size*.99,a=e.center.x,c=e.center.y,h="none"===e.direction?[0,6]:[(n=e.direction,r(n-1,l.length)),3],g=h[1],s=h[0],u=function(n){var r=a+o*Math.cos(l[s]),h=c+o*Math.sin(l[s]),g="none"===e.direction||1===n?.9*e.growthScale:.5*e.growthScale*1;t.branches.push({start:{x:r,y:h},size:i,length:0,direction:s,growthScale:g,growing:!0}),s=function(t){return(t+1)%l.length}(s)},f=0;f<g;f+=1)u(f)}(t,e),e.growing=!1)}))}(p):function(t){t.branches.forEach((function(e){e.growing&&(function(t,e){t.faces.push({center:y(e),size:e.size,direction:e.direction,growthScale:e.growthScale,growing:!0})}(t,e),e.growing=!1)}))}(p));var B=function(t){var e=[[],[],[],[],[],[]];return t.faces.forEach((function(t){var n;(n=t,M(function(t){return m(v(t))}(n),d(n))).forEach((function(n,r){var i=(r+d(t))%l.length;e[i].push(n)}))})),t.branches.forEach((function(t){var n;(n=t,M(function(t){return m(w(t))}(n),n.direction)).forEach((function(n,r){var i=(r+t.direction)%l.length;e[i].push(n)}))})),e}(p);"branching"===t.currentGrowthType?(function(t,e){t.branches.forEach((function(n,i){if(i+=t.faces.length,n.growing){for(var o=n.direction,a=o,c=r(o-1,l.length),h=e[a][i],g=e[c][i],s=e[a],u=e[c],f=0;f<s.length;++f)if(f!==i&&void 0!==E(s[f],h)){n.growing=!1;break}if(n.growing)for(f=0;f<u.length;++f)if(f!==i&&void 0!==E(u[f],g)){n.growing=!1;break}}}))}(p,B),p.branches.forEach((function(t){var n,r,i,o;t.growing&&(i=-1.5*(r=z.scale)+1.5,o=1.5*r,(n=t).size+=3e-4*o*n.growthScale,n.length+=i*e*n.growthScale)}))):(function(t,e){t.faces.forEach((function(t,n){if(t.growing){for(var i=d(t),o=i,a=r(i-1,l.length),c=e[o][n],h=e[a][n],g=e[o],s=e[a],u=0;u<g.length;++u)if(u!==n&&void 0!==E(g[u],c)){t.growing=!1;break}if(t.growing)for(u=0;u<s.length;++u)if(u!==n&&void 0!==E(s[u],h)){t.growing=!1;break}}}))}(p,B),p.faces.forEach((function(t){t.growing&&function(t,n){if(t.size+=.75*n*e*t.growthScale,"none"!==t.direction){var r=.75*n*e*Math.cos(l[t.direction])*t.growthScale,i=.75*n*e*Math.sin(l[t.direction])*t.growthScale;t.center.x+=r,t.center.y+=i}}(t,z.scale)}))),g(k),function(t,e){e.faces.forEach((function(e){return function(t,e){"none"===e.direction||e.direction,t.ctx.beginPath(),v(e).forEach((function(e,n){var r=f(t,e),i=r.x,o=r.y;0===n?t.ctx.moveTo(i,o):t.ctx.lineTo(i,o)})),t.ctx.closePath(),t.ctx.fillStyle="rgba(203, 203, 255, 1)",t.ctx.fill()}(t,e)})),e.branches.forEach((function(e){return function(t,e){t.ctx.beginPath(),w(e).forEach((function(e,n){var r=f(t,e),i=r.x,o=r.y;0===n?t.ctx.moveTo(i,o):t.ctx.lineTo(i,o)})),t.ctx.closePath(),t.ctx.fill()}(t,e)}))}(k,p)}(function(t){var e,r,i=t.graph,o=t.writableGraphHeight;if(void 0!==i.handleBeingDragged||i.mouseRecentlyExitedGraph){i.mouseRecentlyExitedGraph=!1;var a="needs lookup"===i.handleBeingDragged&&void 0!==i.graphMouse?S(t,i.graphMouse):i.handleBeingDragged;if("needs lookup"===i.handleBeingDragged&&(i.handleBeingDragged=a),void 0!==i.graphMouse&&"needs lookup"!==a){var h=o/n.length,g=Math.floor(i.graphMouse.y/h);void 0!==a&&(c[a]=(e=g,r=n.length-1,Math.min(Math.max(e,0),r)))}}var l=void 0!==i.handleBeingDragged?"none":"auto",s=function(t){return t.setAttribute("style","user-select: ".concat(l))};Array.from(document.getElementsByClassName("graphLabel")).forEach(s),Array.from(document.getElementsByClassName("control")).forEach(s);var u=document.getElementById("controlContainer");null!==u&&s(u)})(t),b.ctx.clearRect(0,0,b.canvas.width,b.canvas.height),function(t){var e=t.graph,n=t.writableGraphWidth,r=t.writableGraphHeight,i=t.graphMargin,o=t.step/t.maxSteps,g=e.ctx.fillStyle;e.ctx.fillStyle=e.background,e.ctx.fillRect(i,0,n*o,r),e.ctx.fillStyle=g,e.ctx.beginPath();var l=h(n,r,i,0);e.ctx.moveTo(l.x,l.y);for(var s=1;s<c.length;s+=1)l=h(n,r,i,s),e.ctx.lineTo(l.x,l.y);for(e.ctx.strokeStyle="black",e.ctx.stroke(),s=0;s<c.length;s+=1)if(l=h(n,r,i,s),void 0!==e.graphMouse){var u=S(t,e.graphMouse);a(e,l.x,l.y,s===u,s===e.handleBeingDragged)}else a(e,l.x,l.y,!1,!1);e.ctx.beginPath();var f=n*o+i;e.ctx.moveTo(f,0),e.ctx.lineTo(f,r),e.ctx.strokeStyle="blue",e.ctx.stroke(),e.ctx.beginPath();var d=.5*r;e.ctx.moveTo(i,d),e.ctx.lineTo(n+i,d),e.ctx.strokeStyle="black",e.ctx.setLineDash([2,2]),e.ctx.stroke(),e.ctx.setLineDash([])}(t)}void 0!==(x=function(){var t=function(){var t=document.getElementById("graph"),e=t.getContext("2d");if(null!==e){var n={canvas:t,ctx:e,handleBeingDragged:void 0,mouseRecentlyExitedGraph:!1,graphMouse:void 0,background:"rgba(203, 203, 255, 1)"};return t.addEventListener("mousemove",(function(t){n.graphMouse={x:t.offsetX,y:t.offsetY}})),t.addEventListener("mousedown",(function(t){n.handleBeingDragged="needs lookup"})),document.addEventListener("mouseup",(function(t){n.handleBeingDragged=void 0,n.graphMouse=void 0})),t.addEventListener("mouseleave",(function(t){n.mouseRecentlyExitedGraph=!0})),n}}(),e=function(){var t=document.getElementById("snowflake"),e=t.getContext("2d");if(null!==e)return e.fillStyle="rgba(90, 211, 255, 1.0)",{canvas:t,ctx:e}}();if(void 0!==t&&void 0!==e)return{graph:t,graphic:e,snowflake:{faces:[{center:{x:0,y:0},size:.0025,direction:"none",growthScale:1,growing:!0}],branches:[]},currentGrowthType:void 0,graphMargin:10,writableGraphWidth:t.canvas.width-20,writableGraphHeight:t.canvas.height,controls:{pause:document.getElementById("pause"),reset:document.getElementById("reset"),playing:!0},step:0,intervalId:void 0,updateInterval:5,maxSteps:1e3};console.error("Couldn't get drawing context")}())&&(function(t){var e=t.controls,n=t.graphic;e.pause.addEventListener("click",(function(t){e.playing=!e.playing,e.playing?(e.pause.innerHTML="pause",n.canvas.className=""):(e.pause.innerHTML="play",n.canvas.className="paused")})),e.reset.addEventListener("click",(function(e){!function(t){var e;(e=t.snowflake).faces.length=1,e.faces[0]={center:{x:0,y:0},size:.0025,direction:"none",growthScale:1,growing:!0},e.branches.length=0,t.step=0,t.currentGrowthType=void 0,g(t.graphic)}(t)}))}(x),x.intervalId=window.setInterval((function(){return k(x)}),x.updateInterval))})();