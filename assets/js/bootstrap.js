!function(e){if(void 0===e)throw new TypeError("Bootstrap's JavaScript requires jQuery. jQuery must be included before Bootstrap's JavaScript.");var t=e.fn.jquery.split(" ")[0].split(".");if(t[0]<2&&t[1]<9||1===t[0]&&9===t[1]&&t[2]<1||4<=t[0])throw new Error("Bootstrap's JavaScript requires at least jQuery v1.9.1 but less than v4.0.0")}($),function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t(require("jquery")):"function"==typeof define&&define.amd?define(["jquery"],t):e.Util=t(e.jQuery)}(this,function(e){"use strict";return function(r){var t="transitionend";function e(e){var t=this,n=!1;return r(this).one(s.TRANSITION_END,function(){n=!0}),setTimeout(function(){n||s.triggerTransitionEnd(t)},e),this}var s={TRANSITION_END:"bsTransitionEnd",getUID:function(e){for(;e+=~~(1e6*Math.random()),document.getElementById(e););return e},getSelectorFromElement:function(e){var t=e.getAttribute("data-target");t&&"#"!==t||(t=e.getAttribute("href")||"");try{return document.querySelector(t)?t:null}catch(e){return null}},getTransitionDurationFromElement:function(e){if(!e)return 0;var t=r(e).css("transition-duration");return parseFloat(t)?(t=t.split(",")[0],1e3*parseFloat(t)):0},reflow:function(e){return e.offsetHeight},triggerTransitionEnd:function(e){r(e).trigger(t)},supportsTransitionEnd:function(){return Boolean(t)},isElement:function(e){return(e[0]||e).nodeType},typeCheckConfig:function(e,t,n){for(var r in n)if(Object.prototype.hasOwnProperty.call(n,r)){var i=n[r],a=t[r],o=a&&s.isElement(a)?"element":(l=a,{}.toString.call(l).match(/\s([a-z]+)/i)[1].toLowerCase());if(!new RegExp(i).test(o))throw new Error(e.toUpperCase()+': Option "'+r+'" provided type "'+o+'" but expected type "'+i+'".')}var l}};return r.fn.emulateTransitionEnd=e,r.event.special[s.TRANSITION_END]={bindType:t,delegateType:t,handle:function(e){if(r(e.target).is(this))return e.handleObj.handler.apply(this,arguments)}},s}(e=e&&e.hasOwnProperty("default")?e.default:e)}),function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t(require("jquery"),require("./util.js")):"function"==typeof define&&define.amd?define(["jquery","./util.js"],t):e.Collapse=t(e.jQuery,e.Util)}(this,function(e,s){"use strict";function i(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function a(i){for(var e=1;e<arguments.length;e++){var a=null!=arguments[e]?arguments[e]:{},t=Object.keys(a);"function"==typeof Object.getOwnPropertySymbols&&(t=t.concat(Object.getOwnPropertySymbols(a).filter(function(e){return Object.getOwnPropertyDescriptor(a,e).enumerable}))),t.forEach(function(e){var t,n,r;t=i,r=a[n=e],n in t?Object.defineProperty(t,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[n]=r})}return i}var u,o,c,t,n,g,f,h,d,p,m,_,y,v,C,T,l;return e=e&&e.hasOwnProperty("default")?e.default:e,s=s&&s.hasOwnProperty("default")?s.default:s,o="collapse",t="."+(c="bs.collapse"),n=(u=e).fn[o],g={toggle:!0,parent:""},f={toggle:"boolean",parent:"(string|element)"},h={SHOW:"show"+t,SHOWN:"shown"+t,HIDE:"hide"+t,HIDDEN:"hidden"+t,CLICK_DATA_API:"click"+t+".data-api"},d="show",p="collapse",m="collapsing",_="collapsed",y="width",v="height",C=".show, .collapsing",T='[data-toggle="collapse"]',l=function(){function l(t,e){this._isTransitioning=!1,this._element=t,this._config=this._getConfig(e),this._triggerArray=u.makeArray(document.querySelectorAll('[data-toggle="collapse"][href="#'+t.id+'"],[data-toggle="collapse"][data-target="#'+t.id+'"]'));for(var n=[].slice.call(document.querySelectorAll(T)),r=0,i=n.length;r<i;r++){var a=n[r],o=s.getSelectorFromElement(a),l=[].slice.call(document.querySelectorAll(o)).filter(function(e){return e===t});null!==o&&0<l.length&&(this._selector=o,this._triggerArray.push(a))}this._parent=this._config.parent?this._getParent():null,this._config.parent||this._addAriaAndCollapsedClass(this._element,this._triggerArray),this._config.toggle&&this.toggle()}var e,t,n,r=l.prototype;return r.toggle=function(){u(this._element).hasClass(d)?this.hide():this.show()},r.show=function(){var e,t,n=this;if(!this._isTransitioning&&!u(this._element).hasClass(d)&&(this._parent&&0===(e=[].slice.call(this._parent.querySelectorAll(C)).filter(function(e){return e.getAttribute("data-parent")===n._config.parent})).length&&(e=null),!(e&&(t=u(e).not(this._selector).data(c))&&t._isTransitioning))){var r=u.Event(h.SHOW);if(u(this._element).trigger(r),!r.isDefaultPrevented()){e&&(l._jQueryInterface.call(u(e).not(this._selector),"hide"),t||u(e).data(c,null));var i=this._getDimension();u(this._element).removeClass(p).addClass(m),this._element.style[i]=0,this._triggerArray.length&&u(this._triggerArray).removeClass(_).attr("aria-expanded",!0),this.setTransitioning(!0);var a="scroll"+(i[0].toUpperCase()+i.slice(1)),o=s.getTransitionDurationFromElement(this._element);u(this._element).one(s.TRANSITION_END,function(){u(n._element).removeClass(m).addClass(p).addClass(d),n._element.style[i]="",n.setTransitioning(!1),u(n._element).trigger(h.SHOWN)}).emulateTransitionEnd(o),this._element.style[i]=this._element[a]+"px"}}},r.hide=function(){var e=this;if(!this._isTransitioning&&u(this._element).hasClass(d)){var t=u.Event(h.HIDE);if(u(this._element).trigger(t),!t.isDefaultPrevented()){var n=this._getDimension();this._element.style[n]=this._element.getBoundingClientRect()[n]+"px",s.reflow(this._element),u(this._element).addClass(m).removeClass(p).removeClass(d);var r=this._triggerArray.length;if(0<r)for(var i=0;i<r;i++){var a=this._triggerArray[i],o=s.getSelectorFromElement(a);if(null!==o)u([].slice.call(document.querySelectorAll(o))).hasClass(d)||u(a).addClass(_).attr("aria-expanded",!1)}this.setTransitioning(!0);this._element.style[n]="";var l=s.getTransitionDurationFromElement(this._element);u(this._element).one(s.TRANSITION_END,function(){e.setTransitioning(!1),u(e._element).removeClass(m).addClass(p).trigger(h.HIDDEN)}).emulateTransitionEnd(l)}}},r.setTransitioning=function(e){this._isTransitioning=e},r.dispose=function(){u.removeData(this._element,c),this._config=null,this._parent=null,this._element=null,this._triggerArray=null,this._isTransitioning=null},r._getConfig=function(e){return(e=a({},g,e)).toggle=Boolean(e.toggle),s.typeCheckConfig(o,e,f),e},r._getDimension=function(){return u(this._element).hasClass(y)?y:v},r._getParent=function(){var n=this,e=null;s.isElement(this._config.parent)?(e=this._config.parent,void 0!==this._config.parent.jquery&&(e=this._config.parent[0])):e=document.querySelector(this._config.parent);var t='[data-toggle="collapse"][data-parent="'+this._config.parent+'"]',r=[].slice.call(e.querySelectorAll(t));return u(r).each(function(e,t){n._addAriaAndCollapsedClass(l._getTargetFromElement(t),[t])}),e},r._addAriaAndCollapsedClass=function(e,t){if(e){var n=u(e).hasClass(d);t.length&&u(t).toggleClass(_,!n).attr("aria-expanded",n)}},l._getTargetFromElement=function(e){var t=s.getSelectorFromElement(e);return t?document.querySelector(t):null},l._jQueryInterface=function(r){return this.each(function(){var e=u(this),t=e.data(c),n=a({},g,e.data(),"object"==typeof r&&r?r:{});if(!t&&n.toggle&&/show|hide/.test(r)&&(n.toggle=!1),t||(t=new l(this,n),e.data(c,t)),"string"==typeof r){if(void 0===t[r])throw new TypeError('No method named "'+r+'"');t[r]()}})},e=l,n=[{key:"VERSION",get:function(){return"4.1.3"}},{key:"Default",get:function(){return g}}],(t=null)&&i(e.prototype,t),n&&i(e,n),l}(),u(document).on(h.CLICK_DATA_API,T,function(e){"A"===e.currentTarget.tagName&&e.preventDefault();var n=u(this),t=s.getSelectorFromElement(this),r=[].slice.call(document.querySelectorAll(t));u(r).each(function(){var e=u(this),t=e.data(c)?"toggle":n.data();l._jQueryInterface.call(e,t)})}),u.fn[o]=l._jQueryInterface,u.fn[o].Constructor=l,u.fn[o].noConflict=function(){return u.fn[o]=n,l._jQueryInterface},l});