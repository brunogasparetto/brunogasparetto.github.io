!function(e){if(void 0===e)throw new TypeError("Bootstrap's JavaScript requires jQuery. jQuery must be included before Bootstrap's JavaScript.");var t=e.fn.jquery.split(" ")[0].split(".");if(t[0]<2&&t[1]<9||1===t[0]&&9===t[1]&&t[2]<1||4<=t[0])throw new Error("Bootstrap's JavaScript requires at least jQuery v1.9.1 but less than v4.0.0")}($),function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t(require("jquery")):"function"==typeof define&&define.amd?define(["jquery"],t):(e="undefined"!=typeof globalThis?globalThis:e||self).Util=t(e.jQuery)}(this,function(o){"use strict";o=o&&Object.prototype.hasOwnProperty.call(o,"default")?o.default:o;var t="transitionend";function e(e){var t=this,n=!1;return o(this).one(s.TRANSITION_END,function(){n=!0}),setTimeout(function(){n||s.triggerTransitionEnd(t)},e),this}var s={TRANSITION_END:"bsTransitionEnd",getUID:function(e){for(;e+=~~(1e6*Math.random()),document.getElementById(e););return e},getSelectorFromElement:function(e){var t=e.getAttribute("data-target");if(!t||"#"===t){var n=e.getAttribute("href");t=n&&"#"!==n?n.trim():""}try{return document.querySelector(t)?t:null}catch(e){return null}},getTransitionDurationFromElement:function(e){if(!e)return 0;var t=o(e).css("transition-duration"),n=o(e).css("transition-delay"),r=parseFloat(t),i=parseFloat(n);return r||i?(t=t.split(",")[0],n=n.split(",")[0],1e3*(parseFloat(t)+parseFloat(n))):0},reflow:function(e){return e.offsetHeight},triggerTransitionEnd:function(e){o(e).trigger(t)},supportsTransitionEnd:function(){return Boolean(t)},isElement:function(e){return(e[0]||e).nodeType},typeCheckConfig:function(e,t,n){for(var r in n)if(Object.prototype.hasOwnProperty.call(n,r)){var i=n[r],o=t[r],a=o&&s.isElement(o)?"element":null==(l=o)?""+l:{}.toString.call(l).match(/\s([a-z]+)/i)[1].toLowerCase();if(!new RegExp(i).test(a))throw new Error(e.toUpperCase()+': Option "'+r+'" provided type "'+a+'" but expected type "'+i+'".')}var l},findShadowRoot:function(e){if(!document.documentElement.attachShadow)return null;if("function"!=typeof e.getRootNode)return e instanceof ShadowRoot?e:e.parentNode?s.findShadowRoot(e.parentNode):null;var t=e.getRootNode();return t instanceof ShadowRoot?t:null},jQueryDetection:function(){if(void 0===o)throw new TypeError("Bootstrap's JavaScript requires jQuery. jQuery must be included before Bootstrap's JavaScript.");var e=o.fn.jquery.split(" ")[0].split(".");if(e[0]<2&&e[1]<9||1===e[0]&&9===e[1]&&e[2]<1||4<=e[0])throw new Error("Bootstrap's JavaScript requires at least jQuery v1.9.1 but less than v4.0.0")}};return s.jQueryDetection(),o.fn.emulateTransitionEnd=e,o.event.special[s.TRANSITION_END]={bindType:t,delegateType:t,handle:function(e){if(o(e.target).is(this))return e.handleObj.handler.apply(this,arguments)}},s}),function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t(require("jquery"),require("./util.js")):"function"==typeof define&&define.amd?define(["jquery","./util.js"],t):(e="undefined"!=typeof globalThis?globalThis:e||self).Collapse=t(e.jQuery,e.Util)}(this,function(s,u){"use strict";function i(){return(i=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}s=s&&Object.prototype.hasOwnProperty.call(s,"default")?s.default:s,u=u&&Object.prototype.hasOwnProperty.call(u,"default")?u.default:u;var t="collapse",c="bs.collapse",e=s.fn[t],o={toggle:!0,parent:""},n={toggle:"boolean",parent:"(string|element)"},f="show",h="collapse",g="collapsing",d="collapsed",p='[data-toggle="collapse"]',a=function(){function l(t,e){this._isTransitioning=!1,this._element=t,this._config=this._getConfig(e),this._triggerArray=[].slice.call(document.querySelectorAll('[data-toggle="collapse"][href="#'+t.id+'"],[data-toggle="collapse"][data-target="#'+t.id+'"]'));for(var n=[].slice.call(document.querySelectorAll(p)),r=0,i=n.length;r<i;r++){var o=n[r],a=u.getSelectorFromElement(o),l=[].slice.call(document.querySelectorAll(a)).filter(function(e){return e===t});null!==a&&0<l.length&&(this._selector=a,this._triggerArray.push(o))}this._parent=this._config.parent?this._getParent():null,this._config.parent||this._addAriaAndCollapsedClass(this._element,this._triggerArray),this._config.toggle&&this.toggle()}var e=l.prototype;return e.toggle=function(){s(this._element).hasClass(f)?this.hide():this.show()},e.show=function(){var e,t,n=this;if(!this._isTransitioning&&!s(this._element).hasClass(f)&&(this._parent&&0===(e=[].slice.call(this._parent.querySelectorAll(".show, .collapsing")).filter(function(e){return"string"==typeof n._config.parent?e.getAttribute("data-parent")===n._config.parent:e.classList.contains(h)})).length&&(e=null),!(e&&(t=s(e).not(this._selector).data(c))&&t._isTransitioning))){var r=s.Event("show.bs.collapse");if(s(this._element).trigger(r),!r.isDefaultPrevented()){e&&(l._jQueryInterface.call(s(e).not(this._selector),"hide"),t||s(e).data(c,null));var i=this._getDimension();s(this._element).removeClass(h).addClass(g),this._element.style[i]=0,this._triggerArray.length&&s(this._triggerArray).removeClass(d).attr("aria-expanded",!0),this.setTransitioning(!0);var o="scroll"+(i[0].toUpperCase()+i.slice(1)),a=u.getTransitionDurationFromElement(this._element);s(this._element).one(u.TRANSITION_END,function(){s(n._element).removeClass(g).addClass(h+" "+f),n._element.style[i]="",n.setTransitioning(!1),s(n._element).trigger("shown.bs.collapse")}).emulateTransitionEnd(a),this._element.style[i]=this._element[o]+"px"}}},e.hide=function(){var e=this;if(!this._isTransitioning&&s(this._element).hasClass(f)){var t=s.Event("hide.bs.collapse");if(s(this._element).trigger(t),!t.isDefaultPrevented()){var n=this._getDimension();this._element.style[n]=this._element.getBoundingClientRect()[n]+"px",u.reflow(this._element),s(this._element).addClass(g).removeClass(h+" "+f);var r=this._triggerArray.length;if(0<r)for(var i=0;i<r;i++){var o=this._triggerArray[i],a=u.getSelectorFromElement(o);if(null!==a)s([].slice.call(document.querySelectorAll(a))).hasClass(f)||s(o).addClass(d).attr("aria-expanded",!1)}this.setTransitioning(!0);this._element.style[n]="";var l=u.getTransitionDurationFromElement(this._element);s(this._element).one(u.TRANSITION_END,function(){e.setTransitioning(!1),s(e._element).removeClass(g).addClass(h).trigger("hidden.bs.collapse")}).emulateTransitionEnd(l)}}},e.setTransitioning=function(e){this._isTransitioning=e},e.dispose=function(){s.removeData(this._element,c),this._config=null,this._parent=null,this._element=null,this._triggerArray=null,this._isTransitioning=null},e._getConfig=function(e){return(e=i({},o,e)).toggle=Boolean(e.toggle),u.typeCheckConfig(t,e,n),e},e._getDimension=function(){return s(this._element).hasClass("width")?"width":"height"},e._getParent=function(){var e,n=this;u.isElement(this._config.parent)?(e=this._config.parent,void 0!==this._config.parent.jquery&&(e=this._config.parent[0])):e=document.querySelector(this._config.parent);var t='[data-toggle="collapse"][data-parent="'+this._config.parent+'"]',r=[].slice.call(e.querySelectorAll(t));return s(r).each(function(e,t){n._addAriaAndCollapsedClass(l._getTargetFromElement(t),[t])}),e},e._addAriaAndCollapsedClass=function(e,t){var n=s(e).hasClass(f);t.length&&s(t).toggleClass(d,!n).attr("aria-expanded",n)},l._getTargetFromElement=function(e){var t=u.getSelectorFromElement(e);return t?document.querySelector(t):null},l._jQueryInterface=function(r){return this.each(function(){var e=s(this),t=e.data(c),n=i({},o,e.data(),"object"==typeof r&&r?r:{});if(!t&&n.toggle&&"string"==typeof r&&/show|hide/.test(r)&&(n.toggle=!1),t||(t=new l(this,n),e.data(c,t)),"string"==typeof r){if(void 0===t[r])throw new TypeError('No method named "'+r+'"');t[r]()}})},function(e,t,n){t&&r(e.prototype,t),n&&r(e,n)}(l,null,[{key:"VERSION",get:function(){return"4.5.2"}},{key:"Default",get:function(){return o}}]),l}();return s(document).on("click.bs.collapse.data-api",p,function(e){"A"===e.currentTarget.tagName&&e.preventDefault();var n=s(this),t=u.getSelectorFromElement(this),r=[].slice.call(document.querySelectorAll(t));s(r).each(function(){var e=s(this),t=e.data(c)?"toggle":n.data();a._jQueryInterface.call(e,t)})}),s.fn[t]=a._jQueryInterface,s.fn[t].Constructor=a,s.fn[t].noConflict=function(){return s.fn[t]=e,a._jQueryInterface},a});