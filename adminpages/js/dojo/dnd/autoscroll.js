/*
	Copyright (c) 2004-2016, The JS Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/dnd/autoscroll","../_base/lang ../sniff ../_base/window ../dom-geometry ../dom-style ../window".split(" "),function(u,p,l,r,v,q){var a={};u.setObject("dojo.dnd.autoscroll",a);a.getViewport=q.getBox;a.V_TRIGGER_AUTOSCROLL=32;a.H_TRIGGER_AUTOSCROLL=32;a.V_AUTOSCROLL_VALUE=16;a.H_AUTOSCROLL_VALUE=16;var m,e=l.doc,s=Infinity,t=Infinity;a.autoScrollStart=function(a){e=a;m=q.getBox(e);a=l.body(e).parentNode;s=Math.max(a.scrollHeight-m.h,0);t=Math.max(a.scrollWidth-m.w,0)};a.autoScroll=function(h){var f=
m||q.getBox(e),k=l.body(e).parentNode,b=0,d=0;h.clientX<a.H_TRIGGER_AUTOSCROLL?b=-a.H_AUTOSCROLL_VALUE:h.clientX>f.w-a.H_TRIGGER_AUTOSCROLL&&(b=Math.min(a.H_AUTOSCROLL_VALUE,t-k.scrollLeft));h.clientY<a.V_TRIGGER_AUTOSCROLL?d=-a.V_AUTOSCROLL_VALUE:h.clientY>f.h-a.V_TRIGGER_AUTOSCROLL&&(d=Math.min(a.V_AUTOSCROLL_VALUE,s-k.scrollTop));window.scrollBy(b,d)};a._validNodes={div:1,p:1,td:1};a._validOverflow={auto:1,scroll:1};a.autoScrollNodes=function(h){for(var f,k,b,d,g,e=0,n=0,c=h.target;c;){if(1==c.nodeType&&
c.tagName.toLowerCase()in a._validNodes){b=v.getComputedStyle(c);g=b.overflowX.toLowerCase()in a._validOverflow;d=b.overflowY.toLowerCase()in a._validOverflow;if(g||d)f=r.getContentBox(c,b),k=r.position(c,!0);if(g){b=Math.min(a.H_TRIGGER_AUTOSCROLL,f.w/2);g=h.pageX-k.x;if(p("webkit")||p("opera"))g+=l.body().scrollLeft;e=0;0<g&&g<f.w&&(g<b?e=-b:g>f.w-b&&(e=b),c.scrollLeft+=e)}if(d){d=Math.min(a.V_TRIGGER_AUTOSCROLL,f.h/2);b=h.pageY-k.y;if(p("webkit")||p("opera"))b+=l.body().scrollTop;n=0;0<b&&b<f.h&&
(b<d?n=-d:b>f.h-d&&(n=d),c.scrollTop+=n)}if(e||n)return}try{c=c.parentNode}catch(m){c=null}}a.autoScroll(h)};return a});
//# sourceMappingURL=autoscroll.js.map