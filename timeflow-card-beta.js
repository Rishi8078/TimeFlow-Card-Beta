function e(e,t,i,s){var r,o=arguments.length,a=o<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(a=(o<3?r(a):o>3?r(t,i,a):r(t,i))||a);return o>3&&a&&Object.defineProperty(t,i,a),a}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),r=new WeakMap;let o=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=r.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(t,e))}return e}toString(){return this.cssText}};const a=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[s+1],e[0]);return new o(i,e,s)},n=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new o("string"==typeof e?e:e+"",void 0,s))(t)})(e):e,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:h,getOwnPropertySymbols:u,getPrototypeOf:p}=Object,g=globalThis,m=g.trustedTypes,f=m?m.emptyScript:"",_=g.reactiveElementPolyfillSupport,y=(e,t)=>e,v={toAttribute(e,t){switch(t){case Boolean:e=e?f:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},b=(e,t)=>!l(e,t),w={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:b};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=w){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);void 0!==s&&c(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:r}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:s,set(t){const o=s?.call(this);r?.call(this,t),this.requestUpdate(e,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??w}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const e=p(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const e=this.properties,t=[...h(e),...u(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const e=this._$Eu(t,i);void 0!==e&&this._$Eh.set(e,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(n(e))}else void 0!==e&&t.push(n(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,s)=>{if(i)e.adoptedStyleSheets=s.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of s){const s=document.createElement("style"),r=t.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=i.cssText,e.appendChild(s)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(void 0!==s&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:v).toAttribute(t,i.type);this._$Em=e,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(void 0!==s&&this._$Em!==s){const e=i.getPropertyOptions(s),r="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:v;this._$Em=s;const o=r.fromAttribute(t,e.type);this[s]=o??this._$Ej?.get(s)??o,this._$Em=null}}requestUpdate(e,t,i){if(void 0!==e){const s=this.constructor,r=this[e];if(i??=s.getPropertyOptions(e),!((i.hasChanged??b)(r,t)||i.useDefault&&i.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:r},o){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),!0!==r||void 0!==o)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===s&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,s=this[t];!0!==e||this._$AL.has(t)||void 0===s||this.C(t,void 0,i,s)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[y("elementProperties")]=new Map,$[y("finalized")]=new Map,_?.({ReactiveElement:$}),(g.reactiveElementVersions??=[]).push("2.1.1");const x=globalThis,S=x.trustedTypes,C=S?S.createPolicy("lit-html",{createHTML:e=>e}):void 0,T="$lit$",A=`lit$${Math.random().toFixed(9).slice(2)}$`,E="?"+A,k=`<${E}>`,D=document,M=()=>D.createComment(""),N=e=>null===e||"object"!=typeof e&&"function"!=typeof e,R=Array.isArray,I="[ \t\n\f\r]",P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,z=/>/g,U=RegExp(`>|${I}(?:([^\\s"'>=/]+)(${I}*=${I}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),F=/'/g,H=/"/g,V=/^(?:script|style|textarea|title)$/i,j=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),L=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),B=new WeakMap,q=D.createTreeWalker(D,129);function K(e,t){if(!R(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==C?C.createHTML(t):t}const Z=(e,t)=>{const i=e.length-1,s=[];let r,o=2===t?"<svg>":3===t?"<math>":"",a=P;for(let n=0;n<i;n++){const t=e[n];let i,l,c=-1,d=0;for(;d<t.length&&(a.lastIndex=d,l=a.exec(t),null!==l);)d=a.lastIndex,a===P?"!--"===l[1]?a=O:void 0!==l[1]?a=z:void 0!==l[2]?(V.test(l[2])&&(r=RegExp("</"+l[2],"g")),a=U):void 0!==l[3]&&(a=U):a===U?">"===l[0]?(a=r??P,c=-1):void 0===l[1]?c=-2:(c=a.lastIndex-l[2].length,i=l[1],a=void 0===l[3]?U:'"'===l[3]?H:F):a===H||a===F?a=U:a===O||a===z?a=P:(a=U,r=void 0);const h=a===U&&e[n+1].startsWith("/>")?" ":"";o+=a===P?t+k:c>=0?(s.push(i),t.slice(0,c)+T+t.slice(c)+A+h):t+A+(-2===c?n:h)}return[K(e,o+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),s]};class X{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let r=0,o=0;const a=e.length-1,n=this.parts,[l,c]=Z(e,t);if(this.el=X.createElement(l,i),q.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(s=q.nextNode())&&n.length<a;){if(1===s.nodeType){if(s.hasAttributes())for(const e of s.getAttributeNames())if(e.endsWith(T)){const t=c[o++],i=s.getAttribute(e).split(A),a=/([.?@])?(.*)/.exec(t);n.push({type:1,index:r,name:a[2],strings:i,ctor:"."===a[1]?ee:"?"===a[1]?te:"@"===a[1]?ie:Q}),s.removeAttribute(e)}else e.startsWith(A)&&(n.push({type:6,index:r}),s.removeAttribute(e));if(V.test(s.tagName)){const e=s.textContent.split(A),t=e.length-1;if(t>0){s.textContent=S?S.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],M()),q.nextNode(),n.push({type:2,index:++r});s.append(e[t],M())}}}else if(8===s.nodeType)if(s.data===E)n.push({type:2,index:r});else{let e=-1;for(;-1!==(e=s.data.indexOf(A,e+1));)n.push({type:7,index:r}),e+=A.length-1}r++}}static createElement(e,t){const i=D.createElement("template");return i.innerHTML=e,i}}function J(e,t,i=e,s){if(t===L)return t;let r=void 0!==s?i._$Co?.[s]:i._$Cl;const o=N(t)?void 0:t._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),void 0===o?r=void 0:(r=new o(e),r._$AT(e,i,s)),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(t=J(e,r._$AS(e,t.values),r,s)),t}class Y{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??D).importNode(t,!0);q.currentNode=s;let r=q.nextNode(),o=0,a=0,n=i[0];for(;void 0!==n;){if(o===n.index){let t;2===n.type?t=new G(r,r.nextSibling,this,e):1===n.type?t=new n.ctor(r,n.name,n.strings,this,e):6===n.type&&(t=new se(r,this,e)),this._$AV.push(t),n=i[++a]}o!==n?.index&&(r=q.nextNode(),o++)}return q.currentNode=D,s}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class G{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=J(this,e,t),N(e)?e===W||null==e||""===e?(this._$AH!==W&&this._$AR(),this._$AH=W):e!==this._$AH&&e!==L&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>R(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==W&&N(this._$AH)?this._$AA.nextSibling.data=e:this.T(D.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=X.createElement(K(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const e=new Y(s,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=B.get(e.strings);return void 0===t&&B.set(e.strings,t=new X(e)),t}k(e){R(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const r of e)s===t.length?t.push(i=new G(this.O(M()),this.O(M()),this,this.options)):i=t[s],i._$AI(r),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class Q{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,r){this.type=1,this._$AH=W,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=W}_$AI(e,t=this,i,s){const r=this.strings;let o=!1;if(void 0===r)e=J(this,e,t,0),o=!N(e)||e!==this._$AH&&e!==L,o&&(this._$AH=e);else{const s=e;let a,n;for(e=r[0],a=0;a<r.length-1;a++)n=J(this,s[i+a],t,a),n===L&&(n=this._$AH[a]),o||=!N(n)||n!==this._$AH[a],n===W?e=W:e!==W&&(e+=(n??"")+r[a+1]),this._$AH[a]=n}o&&!s&&this.j(e)}j(e){e===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ee extends Q{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===W?void 0:e}}class te extends Q{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==W)}}class ie extends Q{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){if((e=J(this,e,t,0)??W)===L)return;const i=this._$AH,s=e===W&&i!==W||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==W&&(i===W||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class se{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const re=x.litHtmlPolyfillSupport;re?.(X,G),(x.litHtmlVersions??=[]).push("3.3.1");const oe=globalThis;class ae extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const s=i?.renderBefore??t;let r=s._$litPart$;if(void 0===r){const e=i?.renderBefore??null;s._$litPart$=r=new G(t.insertBefore(M(),e),e,void 0,i??{})}return r._$AI(e),r})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return L}}ae._$litElement$=!0,ae.finalized=!0,oe.litElementHydrateSupport?.({LitElement:ae});const ne=oe.litElementPolyfillSupport;ne?.({LitElement:ae}),(oe.litElementVersions??=[]).push("4.2.1");const le={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:b},ce=(e=le,t,i)=>{const{kind:s,metadata:r}=i;let o=globalThis.litPropertyMetadata.get(r);if(void 0===o&&globalThis.litPropertyMetadata.set(r,o=new Map),"setter"===s&&((e=Object.create(e)).wrapped=!0),o.set(i.name,e),"accessor"===s){const{name:s}=i;return{set(i){const r=t.get.call(this);t.set.call(this,i),this.requestUpdate(s,r,e)},init(t){return void 0!==t&&this.C(s,void 0,e,t),t}}}if("setter"===s){const{name:s}=i;return function(i){const r=this[s];t.call(this,i),this.requestUpdate(s,r,e)}}throw Error("Unsupported decorator location: "+s)};function de(e){return(t,i)=>"object"==typeof i?ce(e,t,i):((e,t,i)=>{const s=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),s?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function he(e){return de({...e,state:!0,attribute:!1})}class ue{static isTimerEntity(e){return!!e&&(!!e.startsWith("timer.")||!!(e.includes("_next_timer")||e.includes("alexa_timer")||e.startsWith("sensor.")&&e.includes("timer")))}static isAlexaTimer(e){return e.includes("_next_timer")||e.includes("alexa_timer")||e.startsWith("sensor.")&&e.includes("alexa")&&e.includes("timer")}static getTimerData(e,t){if(!t||!e||!this.isTimerEntity(e))return null;const i=t.states[e];return i?this.isAlexaTimer(e)?this.getAlexaTimerData(e,i,t):this.getStandardTimerData(e,i):(console.warn(`Timer entity ${e} not found`),null)}static getAlexaTimerData(e,t,i){const s=t.state,r=t.attributes;let o=0,a=0,n=null,l=!1;if(s&&"unavailable"!==s&&"unknown"!==s)if(this.isISOTimestamp(s)){if(n=new Date(s),!isNaN(n.getTime())){const e=Date.now();o=Math.max(0,Math.floor((n.getTime()-e)/1e3)),l=o>0}}else isNaN(parseFloat(s))?"string"==typeof s&&s.includes(":")&&(o=this.parseDuration(s),l=o>0):(o=Math.max(0,parseFloat(s)),l=o>0);let c=!1;r.original_duration?(a=this.parseDuration(r.original_duration),c=!0):r.duration?(a=this.parseDuration(r.duration),c=!0):(a=o>0?o:0,c=!1);let d=0;if(c&&a>0)if(l){const e=a-o;d=Math.min(100,Math.max(0,e/a*100))}else 0===o&&(d=100);else if(l&&o>0){const e=Math.max(2*o,300),t=e-o;d=Math.min(100,Math.max(0,t/e*100))}else d=l||0!==o?0:100;return{isActive:l,isPaused:!1,duration:a,remaining:o,finishesAt:n,progress:d,isAlexaTimer:!0,alexaDevice:this.extractAlexaDevice(e,r),timerLabel:r.friendly_name||r.timer_label||this.formatAlexaTimerName(e)}}static getStandardTimerData(e,t){const i=t.state,s=t.attributes,r="active"===i,o="paused"===i,a="idle"===i;let n=0;s.duration&&(n=this.parseDuration(s.duration));let l=0,c=null;(r||o)&&(s.finishes_at?(c=new Date(s.finishes_at),isNaN(c.getTime())||(l=Math.max(0,Math.floor((c.getTime()-Date.now())/1e3)))):s.remaining&&(l=this.parseDuration(s.remaining)));let d=0;if(n>0)if(a)d=0;else{const e=n-l;d=Math.min(100,Math.max(0,e/n*100))}return{isActive:r,isPaused:o,duration:n,remaining:l,finishesAt:c,progress:d,isAlexaTimer:!1}}static isISOTimestamp(e){return/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2}|Z)?$/.test(e)}static extractAlexaDevice(e,t){if(e.includes("echo")){const t=e.match(/echo[^_]*(?:_\w+)*/);if(t)return t[0].replace(/_/g," ")}return t.device_name?t.device_name:t.device?t.device:"Alexa Device"}static formatAlexaTimerName(e){return e.replace(/^sensor\./,"").replace(/_next_timer$/,"").replace(/_timer$/,"").replace(/_/g," ").replace(/\b\w/g,e=>e.toUpperCase())}static parseDuration(e){if("number"==typeof e)return e;if("string"!=typeof e)return 0;if(e.includes(":")){const t=e.split(":").map(Number);if(3===t.length)return 3600*t[0]+60*t[1]+t[2];if(2===t.length)return 60*t[0]+t[1]}const t=parseFloat(e);return isNaN(t)?0:t}static formatRemainingTime(e,t=!0){if(e<=0)return"0:00";const i=Math.floor(e/3600),s=Math.floor(e%3600/60),r=Math.floor(e%60);return i>0?t?`${i}:${s.toString().padStart(2,"0")}:${r.toString().padStart(2,"0")}`:`${i}:${s.toString().padStart(2,"0")}`:t?`${s}:${r.toString().padStart(2,"0")}`:`${s}m`}static getTimerTitle(e,t,i){if(i)return i;if(!t||!e)return"Timer";const s=t.states[e];if(!s)return"Timer";if(this.isAlexaTimer(e)){const i=this.getAlexaTimerData(e,s,t);return(null==i?void 0:i.timerLabel)?i.timerLabel:this.formatAlexaTimerName(e)}return s.attributes.friendly_name||e.replace("timer.","").replace(/_/g," ")}static getTimerSubtitle(e,t=!0){if(!e)return"Timer not found";if(e.isAlexaTimer){if(e.isActive&&e.remaining>0){return`${this.formatRemainingTime(e.remaining,t)} remaining${e.alexaDevice?` on ${e.alexaDevice}`:""}`}return 0===e.remaining&&e.progress>=100?"Timer finished"+(e.alexaDevice?` on ${e.alexaDevice}`:""):"Timer ready"+(e.alexaDevice?` on ${e.alexaDevice}`:"")}if(e.isActive){return`${this.formatRemainingTime(e.remaining,t)} remaining`}if(e.isPaused){return`Paused - ${this.formatRemainingTime(e.remaining,t)} left`}if(e.duration>0){return`Ready - ${this.formatRemainingTime(e.duration,t)}`}return"Timer ready"}static isTimerExpired(e){return!!e&&(e.isAlexaTimer?0===e.remaining&&e.progress>=100:!e.isActive&&!e.isPaused&&e.progress>=100)}static getTimerStateColor(e,t="#4caf50"){return e?e.isAlexaTimer?e.isActive&&e.remaining>0?"#00d4ff":this.isTimerExpired(e)?"#ff4444":"#888888":e.isActive?"#4caf50":e.isPaused?"#ff9800":this.isTimerExpired(e)?"#f44336":"#9e9e9e":t}static discoverAlexaTimers(e){if(!e||!e.states)return[];const t=[];for(const i in e.states)if(this.isAlexaTimer(i)){const s=e.states[i];s.state&&"unavailable"!==s.state&&"unknown"!==s.state&&"none"!==s.state&&t.push(i)}return t}}class pe{static parseISODate(e){try{const t=this.parseISODateManual(e);if(!isNaN(t))return t}catch(T){}const t=new Date(e);return!isNaN(t.getTime())&&this.isValidDateResult(t,e)?t.getTime():this.parseISODateFallback(e)}static isValidDateResult(e,t){const i=e.getTime(),s=new Date("1970-01-01").getTime(),r=new Date("2100-12-31").getTime();if(i<s||i>r)return!1;if("string"==typeof t&&t.includes("02-29")){const t=e.getFullYear();if(!this.isLeapYear(t))return!1}return!0}static isLeapYear(e){return e%4==0&&e%100!=0||e%400==0}static parseISODateManual(e){if("string"==typeof e&&e.includes("T")){if(/[+-]\d{2}:\d{2}$|Z$/.test(e))return new Date(e).getTime();{const[t,i]=e.split("T"),[s,r,o]=t.split("-").map(Number);if(!this.isValidDateComponents(s,r,o))throw new Error("Invalid date components");if(i&&i.includes(":")){const[e,t,a]=i.split(":").map(parseFloat);if(!this.isValidTimeComponents(e,t,a))throw new Error("Invalid time components");return new Date(s,r-1,o,e,t,a||0).getTime()}return new Date(s,r-1,o).getTime()}}return new Date(e).getTime()}static isValidDateComponents(e,t,i){if(isNaN(e)||isNaN(t)||isNaN(i))return!1;if(e<1970||e>2100)return!1;if(t<1||t>12)return!1;if(i<1||i>31)return!1;return!(i>[31,this.isLeapYear(e)?29:28,31,30,31,30,31,31,30,31,30,31][t-1])}static isValidTimeComponents(e,t,i){const s=parseInt(e),r=parseInt(t),o=parseInt(i);return!(isNaN(s)||isNaN(r)||isNaN(o))&&(!(s<0||s>23)&&(!(r<0||r>59)&&!(o<0||o>59)))}static parseISODateFallback(e){try{const t=Date.parse(e);return isNaN(t)?(console.warn("TimeFlow Card: Could not parse date, using current time as fallback:",e),Date.now()):t}catch(t){return console.error("TimeFlow Card: All date parsing methods failed:",t),Date.now()}}}class ge{static validateConfig(e){const t=[];if(!e)return t.push({field:"config",message:"Configuration object is missing or empty",severity:"critical",suggestion:"Provide a valid configuration object with at least a target_date field.",value:e}),{isValid:!1,errors:t,hasCriticalErrors:!0,hasWarnings:!1};e.target_date?this.isValidDateInput(e.target_date)||t.push({field:"target_date",message:"Invalid target_date format",severity:"critical",suggestion:'Use ISO date string (2025-12-31T23:59:59), entity ID (sensor.my_date), or template ({{ states("sensor.date") }}).',value:e.target_date}):t.push({field:"target_date",message:'Required field "target_date" is missing',severity:"critical",suggestion:'Add target_date field with a valid date value like "2025-12-31T23:59:59".',value:void 0}),e.creation_date&&!this.isValidDateInput(e.creation_date)&&t.push({field:"creation_date",message:"Invalid creation_date format",severity:"warning",suggestion:"Use ISO date string, entity ID, or template. This field is optional.",value:e.creation_date});["color","background_color","progress_color"].forEach(i=>{e[i]&&!this.isValidColorInput(e[i])&&t.push({field:i,message:`Invalid ${i} format`,severity:"warning",suggestion:"Use hex (#ff0000), rgb/rgba, hsl/hsla, CSS color name, entity ID, or template.",value:e[i]})});["width","height","icon_size"].forEach(i=>{e[i]&&!this.isValidDimensionInput(e[i])&&t.push({field:i,message:`Invalid ${i} format`,severity:"warning",suggestion:"Use pixel values (100px), percentages (50%), or CSS units (2rem).",value:e[i]})}),e.aspect_ratio&&!this.isValidAspectRatioInput(e.aspect_ratio)&&t.push({field:"aspect_ratio",message:"Invalid aspect_ratio format",severity:"warning",suggestion:'Use format like "16/9", "4/3", or "1/1".',value:e.aspect_ratio}),void 0===e.stroke_width||this.isValidNumberInput(e.stroke_width,1,50)||t.push({field:"stroke_width",message:"Invalid stroke_width value",severity:"warning",suggestion:"Must be a number between 1 and 50.",value:e.stroke_width});["show_months","show_days","show_hours","show_minutes","show_seconds","expired_animation","show_progress_text"].forEach(i=>{void 0===e[i]||this.isValidBooleanInput(e[i])||t.push({field:i,message:`Invalid ${i} value`,severity:"warning",suggestion:"Must be true or false (boolean value).",value:e[i]})});["title","subtitle","expired_text"].forEach(i=>{e[i]&&!this.isValidTextInput(e[i])&&t.push({field:i,message:`Invalid ${i} - contains potentially unsafe content`,severity:"critical",suggestion:"Remove script tags, javascript: URLs, and event handlers for security.",value:e[i]})}),e.styles&&!this.isValidStylesInput(e.styles)&&t.push({field:"styles",message:"Invalid styles object structure",severity:"warning",suggestion:"Must contain valid style arrays for card, title, subtitle, or progress_circle.",value:e.styles}),this._addHelpfulValidations(e,t);const i=this._generateSafeConfig(e,t),s=t.filter(e=>"critical"===e.severity),r=t.filter(e=>"warning"===e.severity);return{isValid:0===t.length,errors:t,hasCriticalErrors:s.length>0,hasWarnings:r.length>0,safeConfig:i}}static _addHelpfulValidations(e,t){if(e.target_date&&"string"==typeof e.target_date){const i=new Date(e.target_date);if(!isNaN(i.getTime())){i<new Date&&t.push({field:"target_date",message:"Target date is in the past",severity:"info",suggestion:"Consider setting a future date for countdown functionality.",value:e.target_date})}}const i=["type","target_date","creation_date","timer_entity","title","subtitle","show_months","show_days","show_hours","show_minutes","show_seconds","color","background_color","progress_color","primary_color","secondary_color","stroke_width","icon_size","width","height","aspect_ratio","expired_animation","expired_text","show_progress_text","styles"];Object.keys(e).forEach(s=>{i.includes(s)||s.startsWith("_")||t.push({field:s,message:`Unknown configuration field "${s}"`,severity:"info",suggestion:"This field may be ignored or cause unexpected behavior. Check documentation for valid fields.",value:e[s]})})}static _generateSafeConfig(e,t){const i={...e};return t.forEach(e=>{if("critical"===e.severity||"warning"===e.severity)switch(e.field){case"target_date":if(!i.target_date||!this.isValidDateInput(i.target_date)){const e=new Date;e.setDate(e.getDate()+1),i.target_date=e.toISOString()}break;case"background_color":this.isValidColorInput(i.background_color)||(i.background_color="#1a1a1a");break;case"progress_color":this.isValidColorInput(i.progress_color)||(i.progress_color="#4caf50");break;case"stroke_width":this.isValidNumberInput(i.stroke_width,1,50)||(i.stroke_width=15);break;case"icon_size":this.isValidDimensionInput(i.icon_size)||(i.icon_size=100)}}),i}static validateConfigLegacy(e){const t=this.validateConfig(e);if(t.hasCriticalErrors){const e=t.errors.filter(e=>"critical"===e.severity);throw new Error(`Configuration validation failed:\n• ${e.map(e=>e.message).join("\n• ")}`)}}static isValidDateInput(e){if(!e)return!1;if(this.isTemplate(e))return!0;if("string"==typeof e&&e.includes("."))return!0;if("string"==typeof e)try{const t=new Date(e);return!isNaN(t.getTime())}catch(T){return!1}return!1}static isValidColorInput(e){if(!e)return!1;if(this.isTemplate(e)||"string"==typeof e&&e.includes("."))return!0;if("string"!=typeof e)return!1;if(/^#([0-9A-F]{3}){1,2}$/i.test(e))return!0;if(/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/i.test(e))return!0;if(/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+\s*)?\)$/i.test(e))return!0;return["red","blue","green","yellow","orange","purple","pink","brown","black","white","gray","grey","cyan","magenta","lime","maroon","navy","olive","teal","silver","gold","indigo","violet","transparent","currentColor","inherit","initial","unset"].includes(e.toLowerCase())}static isValidDimensionInput(e){if(!e)return!1;if(this.isTemplate(e)||"string"==typeof e&&e.includes("."))return!0;if("number"==typeof e)return!0;if("string"!=typeof e)return!1;const t=e.match(/^(\d+(?:\.\d+)?)px$/i);if(t){const e=parseFloat(t[1]);return e>=0&&e<=1e4}const i=e.match(/^(\d+(?:\.\d+)?)%$/i);if(i){const e=parseFloat(i[1]);return e>=0&&e<=1e3}const s=["em","rem","vh","vw","vmin","vmax","ch","ex"];for(const r of s){const t=new RegExp(`^(\\d+(?:\\.\\d+)?)${r}$`,"i"),i=e.match(t);if(i){const e=parseFloat(i[1]);return e>=0&&e<=1e3}}return["auto","fit-content","min-content","max-content"].includes(e.toLowerCase())}static isValidAspectRatioInput(e){if(!e)return!1;if(this.isTemplate(e)||"string"==typeof e&&e.includes("."))return!0;if("string"!=typeof e)return!1;const t=e.match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);if(t){const e=parseFloat(t[1]),i=parseFloat(t[2]);return e>0&&i>0&&e<=20&&i<=20}return!1}static isValidNumberInput(e,t=-1/0,i=1/0){if(null==e)return!1;if("string"==typeof e){if(this.isTemplate(e)||e.includes("."))return!0;const s=parseFloat(e);return!isNaN(s)&&s>=t&&s<=i}return"number"==typeof e&&!isNaN(e)&&e>=t&&e<=i}static isValidBooleanInput(e){return"boolean"==typeof e}static isValidTextInput(e){if(!e)return!0;if(this.isTemplate(e)||"string"==typeof e&&e.includes("."))return!0;if("string"!=typeof e)return!1;return![/<script/i,/javascript:/i,/vbscript:/i,/on\w+\s*=/i,/<iframe/i,/<object/i,/<embed/i,/<form/i].some(t=>t.test(e))}static isValidStylesInput(e){if(!e||"object"!=typeof e)return!1;const t=["card","title","subtitle","progress_circle"],i=Object.keys(e);return!!i.every(e=>t.includes(e))&&i.every(t=>Array.isArray(e[t]))}static isTemplate(e){return"string"==typeof e&&e.includes("{{")&&e.includes("}}")}}class me{constructor(){this.templateResults=new Map,this.templateCacheLimit=100}async evaluateTemplate(e,t){if(!t||!e)return e;const i=e;if(this.templateResults.has(i)){const e=this.templateResults.get(i);if(e&&Date.now()-e.timestamp<5e3)return e.result}try{if(!this.isValidTemplate(e))throw new Error("Invalid template format");const s=await t.callApi("POST","template",{template:e});if("unknown"===s||"unavailable"===s||""===s||null===s){const t=this.extractFallbackFromTemplate(e);if(t&&t!==e)return this.templateResults.set(i,{result:t,timestamp:Date.now()}),this.enforceTemplateCacheLimit(),t}return this.templateResults.set(i,{result:s,timestamp:Date.now()}),this.enforceTemplateCacheLimit(),s}catch(s){console.warn("TimeFlow Card: Template evaluation failed, using fallback:",(null==s?void 0:s.message)||s);const t=this.extractFallbackFromTemplate(e);return this.templateResults.set(i,{result:t,timestamp:Date.now()}),this.enforceTemplateCacheLimit(),t}}extractFallbackFromTemplate(e){if(!e||"string"!=typeof e)return e;try{const t=e.replace(/^\{\{\s*/,"").replace(/\s*\}\}$/,"").trim(),i=/^(.+?)\s+or\s+['"`]([^'"`]+)['"`]$/,s=t.match(i);if(s&&s[2])return s[2];const r=/^(.+?)\s+or\s+(.+?)\s+or\s+['"`]([^'"`]+)['"`]$/,o=t.match(r);if(o&&o[3])return o[3];const a=/^['"`]([^'"`]+)['"`]\s+if\s+(.+?)\s+else\s+['"`]([^'"`]+)['"`]$/,n=t.match(a);if(n&&n[3])return n[3];const l=/^(.+?)\s+if\s+(.+?)\s+else\s+['"`]([^'"`]+)['"`]$/,c=t.match(l);return c&&c[3]?c[3]:"Unavailable"}catch(t){return console.warn("TimeFlow Card: Error extracting fallback from template:",t),"Template Error"}}isTemplate(e){return"string"==typeof e&&e.includes("{{")&&e.includes("}}")}isValidTemplate(e){if(!e||"string"!=typeof e)return!1;if(!e.includes("{{")||!e.includes("}}"))return!1;if((e.match(/\{\{/g)||[]).length!==(e.match(/\}\}/g)||[]).length)return!1;return!!e.replace(/\{\{\s*/,"").replace(/\s*\}\}/,"").trim()}async resolveValue(e){var t,i;if(!e)return;if(this.isTemplate(e)){const i=(null===(t=this.card)||void 0===t?void 0:t.hass)||null;return await this.evaluateTemplate(e,i)||void 0}const s=null===(i=this.card)||void 0===i?void 0:i.hass;if("string"==typeof e&&e.includes(".")&&s&&s.states[e]){const t=s.states[e];return t?t.state:void console.warn(`Entity ${e} not found`)}return e}clearTemplateCache(){this.templateResults.clear()}enforceTemplateCacheLimit(){if(this.templateResults.size<=this.templateCacheLimit)return;const e=Array.from(this.templateResults.entries()).sort((e,t)=>e[1].timestamp-t[1].timestamp),t=e.length-this.templateCacheLimit;for(let i=0;i<t;i++)this.templateResults.delete(e[i][0])}hasTemplatesInConfig(e){if(!e)return!1;return["target_date","creation_date","title","subtitle","color","background_color","progress_color","primary_color","secondary_color"].some(t=>e[t]&&this.isTemplate(e[t]))}escapeHtml(e){return null==e||void 0===e?"":String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}}class fe{constructor(e,t){this.templateService=e,this.dateParser=t,this.timeRemaining={months:0,days:0,hours:0,minutes:0,seconds:0,total:0},this.expired=!1}async updateCountdown(e,t){try{if(e.timer_entity&&t){const i=ue.getTimerData(e.timer_entity,t);if(i)return this.timeRemaining=this._timerDataToCountdownState(i),this.expired=ue.isTimerExpired(i),this.timeRemaining}if(!e.timer_entity&&e.auto_discover_alexa&&t){const e=ue.discoverAlexaTimers(t);if(e.length>0){const i=e.find(e=>{const i=ue.getTimerData(e,t);return i&&i.isActive});if(i){const e=ue.getTimerData(i,t);if(e)return this.timeRemaining=this._timerDataToCountdownState(e),this.expired=ue.isTimerExpired(e),this.timeRemaining}}}if(!e.target_date)return this.timeRemaining;const i=(new Date).getTime(),s=await this.templateService.resolveValue(e.target_date);if(!s)return console.warn("TimeFlow Card: Target date could not be resolved. Check your entity or date format."),this.timeRemaining;const r=this.dateParser.parseISODate(s);if(isNaN(r))return console.warn("TimeFlow Card: Invalid target date format:",s),this.timeRemaining;const o=r-i;if(o>0){const{show_months:t,show_days:i,show_hours:s,show_minutes:r,show_seconds:a}=e;let n=o,l=0,c=0,d=0,h=0,u=0;if(t&&(l=Math.floor(n/2630016e3),n%=2630016e3),i)c=Math.floor(n/864e5),n%=864e5;else if(t&&!i){const e=Math.floor(n/864e5);l+=Math.floor(e/30.44),n%=864e5}if(s)d=Math.floor(n/36e5),n%=36e5;else if((t||i)&&!s){const e=Math.floor(n/36e5);i?c+=Math.floor(e/24):t&&(l+=Math.floor(e/(24*30.44))),n%=36e5}if(r)h=Math.floor(n/6e4),n%=6e4;else if((t||i||s)&&!r){const e=Math.floor(n/6e4);s?d+=Math.floor(e/60):i?c+=Math.floor(e/1440):t&&(l+=Math.floor(e/43833.6)),n%=6e4}if(a)u=Math.floor(n/1e3);else if((t||i||s||r)&&!a){const e=Math.floor(n/1e3);r?h+=Math.floor(e/60):s?d+=Math.floor(e/3600):i?c+=Math.floor(e/86400):t&&(l+=Math.floor(e/2630016))}this.timeRemaining={months:l,days:c,hours:d,minutes:h,seconds:u,total:o},this.expired=!1}else this.timeRemaining={months:0,days:0,hours:0,minutes:0,seconds:0,total:0},this.expired=!0;return this.timeRemaining}catch(i){return console.error("TimeFlow Card: Error in updateCountdown:",i),this.timeRemaining}}async calculateProgress(e,t){if(e.timer_entity&&t){const i=ue.getTimerData(e.timer_entity,t);return i?i.progress:0}if(!e.timer_entity&&e.auto_discover_alexa&&t){const e=ue.discoverAlexaTimers(t);if(e.length>0){const i=e.find(e=>{const i=ue.getTimerData(e,t);return i&&i.isActive});if(i){const e=ue.getTimerData(i,t);if(e)return e.progress}}}const i=await this.templateService.resolveValue(e.target_date);if(!i)return 0;const s=this.dateParser.parseISODate(i),r=Date.now();let o;if(e.creation_date){const t=await this.templateService.resolveValue(e.creation_date);o=t?this.dateParser.parseISODate(t):r}else o=r;const a=s-o;if(a<=0)return 100;const n=r-o,l=Math.min(100,Math.max(0,n/a*100));return this.expired?100:l}getMainDisplay(e,t){if(e.timer_entity&&t){const i=ue.getTimerData(e.timer_entity,t);if(i){const{hours:e,minutes:t,seconds:s}=this.timeRemaining;return i.isAlexaTimer?ue.isTimerExpired(i)?{value:"🔔",label:"Timer finished!"}:e>0?{value:e.toString(),label:1===e?"hour left":"hours left"}:t>0?{value:t.toString(),label:1===t?"minute left":"minutes left"}:{value:s.toString(),label:1===s?"second left":"seconds left"}:e>0?{value:e.toString(),label:1===e?"hour":"hours"}:t>0?{value:t.toString(),label:1===t?"minute":"minutes"}:{value:s.toString(),label:1===s?"second":"seconds"}}}if(!e.timer_entity&&e.auto_discover_alexa&&t){const e=ue.discoverAlexaTimers(t);if(e.length>0){const i=e.find(e=>{const i=ue.getTimerData(e,t);return i&&i.isActive});if(i){const e=ue.getTimerData(i,t);if(e){const{hours:t,minutes:i,seconds:s}=this.timeRemaining;return ue.isTimerExpired(e)?{value:"🔔",label:"Alexa timer finished!"}:t>0?{value:t.toString(),label:1===t?"hour left":"hours left"}:i>0?{value:i.toString(),label:1===i?"minute left":"minutes left"}:{value:s.toString(),label:1===s?"second left":"seconds left"}}}}}const{show_months:i,show_days:s,show_hours:r,show_minutes:o,show_seconds:a}=e,{months:n,days:l,hours:c,minutes:d,seconds:h}=this.timeRemaining;return this.expired?{value:"🎉",label:"Completed!"}:i&&n>0?{value:n.toString(),label:1===n?"month left":"months left"}:s&&l>0?{value:l.toString(),label:1===l?"day left":"days left"}:r&&c>0?{value:c.toString(),label:1===c?"hour left":"hours left"}:o&&d>0?{value:d.toString(),label:1===d?"minute left":"minutes left"}:a&&h>=0?{value:h.toString(),label:1===h?"second left":"seconds left"}:{value:"0",label:"seconds left"}}getSubtitle(e,t){if(e.timer_entity&&t){const i=ue.getTimerData(e.timer_entity,t);return i?ue.getTimerSubtitle(i,!1!==e.show_seconds):"Timer not found"}if(!e.timer_entity&&e.auto_discover_alexa&&t){const i=ue.discoverAlexaTimers(t);if(i.length>0){const s=i.find(e=>{const i=ue.getTimerData(e,t);return i&&i.isActive});if(s){const i=ue.getTimerData(s,t);if(i)return ue.getTimerSubtitle(i,!1!==e.show_seconds)}else if(i.length>0)return`${i.length} Alexa timer${1===i.length?"":"s"} available`}}if(this.expired){const{expired_text:t="Completed! 🎉"}=e;return t}const{months:i,days:s,hours:r,minutes:o,seconds:a}=this.timeRemaining||{months:0,days:0,hours:0,minutes:0,seconds:0},{show_months:n,show_days:l,show_hours:c,show_minutes:d,show_seconds:h}=e,u=[];n&&i>0&&u.push({value:i,unit:1===i?"month":"months"}),l&&s>0&&u.push({value:s,unit:1===s?"day":"days"}),c&&r>0&&u.push({value:r,unit:1===r?"hour":"hours"}),d&&o>0&&u.push({value:o,unit:1===o?"minute":"minutes"}),h&&a>0&&u.push({value:a,unit:1===a?"second":"seconds"}),0===u.length&&(n?u.push({value:i,unit:1===i?"month":"months"}):l?u.push({value:s,unit:1===s?"day":"days"}):c?u.push({value:r,unit:1===r?"hour":"hours"}):d?u.push({value:o,unit:1===o?"minute":"minutes"}):h&&u.push({value:a,unit:1===a?"second":"seconds"}));if([n,l,c,d,h].filter(Boolean).length<=2&&u.length>0){if(1===u.length)return`${u[0].value} ${u[0].unit}`;if(2===u.length)return`${u[0].value} ${u[0].unit} and ${u[1].value} ${u[1].unit}`}return u.map(e=>{const t=e.unit.charAt(0);return`${e.value}${t}`}).join(" ")||"0s"}_timerDataToCountdownState(e){return{months:0,days:0,hours:Math.floor(e.remaining/3600),minutes:Math.floor(e.remaining%3600/60),seconds:Math.floor(e.remaining%60),total:1e3*e.remaining}}getTimeRemaining(){return this.timeRemaining}isExpired(){return this.expired}getAvailableAlexaTimers(e){return e?ue.discoverAlexaTimers(e):[]}}class _e{constructor(){this.cache={dynamicIconSize:null,dynamicStrokeWidth:null,customStyles:null,lastConfigHash:null}}processStyles(e){return e&&Array.isArray(e)?e.map(e=>{try{return"string"==typeof e?e:"object"==typeof e&&null!==e?Object.entries(e).map(([e,t])=>`${e}: ${t}`).join("; "):""}catch(T){return console.warn("TimeFlow Card: Error processing style:",e,T),""}}).join("; "):""}buildStylesObject(e){const t=JSON.stringify(e.styles||{});if(null!==this.cache.customStyles&&this.cache.lastConfigHash===t)return this.cache.customStyles;const{styles:i={}}=e;try{const e={card:this.processStyles(i.card),title:this.processStyles(i.title),subtitle:this.processStyles(i.subtitle),progress_circle:this.processStyles(i.progress_circle)};return this.cache.customStyles=e,this.cache.lastConfigHash=t,e}catch(T){return console.warn("TimeFlow Card: Error building styles object:",T),this.cache.customStyles={card:"",title:"",subtitle:"",progress_circle:""},this.cache.customStyles}}_getCardDimensions(e,t,i){const s=300,r=150;let o=s,a=r;if(e&&t){o=this.parseDimension(e)||s,a=this.parseDimension(t)||r}else if(e&&i){o=this.parseDimension(e)||s;const[t,r]=i.split("/").map(parseFloat);!isNaN(t)&&!isNaN(r)&&t>0&&(a=o*(r/t))}else if(t&&i){a=this.parseDimension(t)||r;const[e,s]=i.split("/").map(parseFloat);!isNaN(e)&&!isNaN(s)&&s>0&&(o=a*(e/s))}else if(i){const[e,t]=i.split("/").map(parseFloat);!isNaN(e)&&!isNaN(t)&&e>0&&(a=s*(t/e)),o=s}return(!o||isNaN(o)||o<=0)&&(o=s),(!a||isNaN(a)||a<=0)&&(a=r),{cardWidth:o,cardHeight:a}}calculateDynamicIconSize(e,t,i,s){const r=JSON.stringify({width:e,height:t,aspect_ratio:i,icon_size:s});if(null!==this.cache.dynamicIconSize&&this.cache.lastIconConfigHash===r)return this.cache.dynamicIconSize;try{const{cardWidth:o,cardHeight:a}=this._getCardDimensions(e,t,i),n=.4*Math.min(o,a);let l=n;if(s&&"100px"!==s){const e="string"==typeof s?parseInt(s.replace("px","")):"number"==typeof s?s:n;l=isNaN(e)?n:e}return this.cache.dynamicIconSize=Math.max(_e.MIN_ICON_SIZE,Math.min(l,_e.MAX_ICON_SIZE)),this.cache.lastIconConfigHash=r,this.cache.dynamicIconSize}catch(o){return console.warn("TimeFlow Card: Error calculating dynamic icon size:",o),this.cache.dynamicIconSize=_e.MIN_ICON_SIZE,this.cache.dynamicIconSize}}calculateDynamicStrokeWidth(e,t){const i=JSON.stringify({iconSize:e,stroke_width:t});if(null!==this.cache.dynamicStrokeWidth&&this.cache.lastStrokeConfigHash===i)return this.cache.dynamicStrokeWidth;try{if(t&&"number"==typeof t)this.cache.dynamicStrokeWidth=Math.max(_e.MIN_STROKE,Math.min(t,_e.MAX_STROKE));else{const t=.15,i=Math.round(e*t);this.cache.dynamicStrokeWidth=Math.max(_e.MIN_STROKE,Math.min(i,_e.MAX_STROKE))}return this.cache.lastStrokeConfigHash=i,this.cache.dynamicStrokeWidth}catch(s){return console.warn("TimeFlow Card: Error calculating dynamic stroke width:",s),this.cache.dynamicStrokeWidth=_e.MIN_STROKE,this.cache.dynamicStrokeWidth}}calculateProportionalSizes(e,t,i){try{const{cardWidth:s,cardHeight:r}=this._getCardDimensions(e,t,i),o=45e3,a=Math.sqrt(s*r/o);return{titleSize:Math.max(1.2,Math.min(2.2,1.6*a)),subtitleSize:Math.max(.9,Math.min(1.4,1.1*a)),cardWidth:s,cardHeight:r}}catch(s){return console.warn("TimeFlow Card: Error calculating proportional sizes:",s),{titleSize:1.6,subtitleSize:1.1,cardWidth:300,cardHeight:150}}}parseDimension(e){try{if("number"==typeof e)return e;if("string"!=typeof e)return null;const t=e.toLowerCase();if(t.includes("%")){const e=parseFloat(t.replace("%",""));return isNaN(e)?null:e/100*300}if(t.includes("px")){const e=parseFloat(t.replace("px",""));return isNaN(e)?null:e}const i=parseFloat(t);return isNaN(i)?null:i}catch(t){return console.warn("TimeFlow Card: Error parsing dimension:",e,t),null}}generateCardDimensionStyles(e,t,i){const s=[];if(e){const t=this._formatDimensionValue(e);t&&s.push(`width: ${t}`)}if(t){const e=this._formatDimensionValue(t);e&&s.push(`height: ${e}`)}else i&&!t&&s.push(`aspect-ratio: ${i}`);return t||i||s.push("min-height: 120px"),s}_formatDimensionValue(e){if(!e)return null;const t=String(e).trim();if(/^[\d.]+\s*(px|%|em|rem|vh|vw|vmin|vmax|ch|ex)$/i.test(t))return t;const i=parseFloat(t);return isNaN(i)?null:`${i}px`}clearCache(){this.cache={dynamicIconSize:null,dynamicStrokeWidth:null,customStyles:null,lastConfigHash:null}}getCardDimensions(e,t,i){return this._getCardDimensions(e,t,i)}}_e.MIN_ICON_SIZE=40,_e.MAX_ICON_SIZE=300,_e.MIN_STROKE=4,_e.MAX_STROKE=50;class ye extends ae{constructor(){super(...arguments),this.errors=[],this.title="Configuration Error",this.allowReset=!0,this.allowSafeMode=!0,this._showDetails=!1,this._showSuggestions=!0}static get styles(){return a`
      :host {
        display: block;
        font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif);
      }

      .error-container {
        background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        border: 2px solid #f87171;
        border-radius: 16px;
        padding: 20px;
        margin: 8px;
        box-shadow: 0 4px 12px rgba(248, 113, 113, 0.15);
        color: #7f1d1d;
      }

      .error-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }

      .error-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
        color: #991b1b;
      }

      .error-icon {
        font-size: 1.5rem;
      }

      .error-summary {
        background: rgba(255, 255, 255, 0.7);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 16px;
        border-left: 4px solid #ef4444;
      }

      .error-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .error-item {
        background: rgba(255, 255, 255, 0.5);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 8px;
        border-left: 3px solid var(--error-color);
      }

      .error-item.critical {
        --error-color: #dc2626;
        background: rgba(220, 38, 38, 0.1);
      }

      .error-item.warning {
        --error-color: #d97706;
        background: rgba(217, 119, 6, 0.1);
        color: #92400e;
      }

      .error-item.info {
        --error-color: #2563eb;
        background: rgba(37, 99, 235, 0.1);
        color: #1e40af;
      }

      .error-field {
        font-weight: 600;
        font-family: 'Courier New', monospace;
        background: rgba(0, 0, 0, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.9em;
      }

      .error-message {
        margin: 4px 0;
        line-height: 1.4;
      }

      .error-suggestion {
        margin-top: 8px;
        padding: 8px;
        background: rgba(34, 197, 94, 0.1);
        border-radius: 6px;
        border-left: 3px solid #22c55e;
        font-size: 0.9em;
        color: #15803d;
      }

      .error-suggestion::before {
        content: "💡 ";
        margin-right: 4px;
      }

      .error-value {
        margin-top: 4px;
        font-family: 'Courier New', monospace;
        background: rgba(0, 0, 0, 0.05);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.85em;
        word-break: break-all;
      }

      .error-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
        flex-wrap: wrap;
      }

      .error-button {
        background: #dc2626;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .error-button:hover {
        background: #b91c1c;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
      }

      .error-button.secondary {
        background: #6b7280;
      }

      .error-button.secondary:hover {
        background: #4b5563;
      }

      .error-button.safe-mode {
        background: #059669;
      }

      .error-button.safe-mode:hover {
        background: #047857;
      }

      .toggle-button {
        background: transparent;
        border: 1px solid #dc2626;
        color: #dc2626;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.85rem;
        transition: all 0.2s ease;
      }

      .toggle-button:hover {
        background: #dc2626;
        color: white;
      }

      .details-section {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(220, 38, 38, 0.2);
      }

      .technical-details {
        background: rgba(0, 0, 0, 0.05);
        border-radius: 6px;
        padding: 12px;
        font-family: 'Courier New', monospace;
        font-size: 0.8rem;
        white-space: pre-wrap;
        word-break: break-word;
        max-height: 200px;
        overflow-y: auto;
      }

      .severity-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .severity-critical {
        background: #dc2626;
        color: white;
      }

      .severity-warning {
        background: #d97706;
        color: white;
      }

      .severity-info {
        background: #2563eb;
        color: white;
      }

      .no-errors {
        text-align: center;
        color: #22c55e;
        font-weight: 500;
        padding: 20px;
      }

      @media (max-width: 480px) {
        .error-container {
          margin: 4px;
          padding: 16px;
        }
        
        .error-actions {
          flex-direction: column;
        }
        
        .error-button {
          justify-content: center;
        }
      }
    `}render(){if(!this.errors||0===this.errors.length)return j`
        <div class="error-container">
          <div class="no-errors">
            ✅ Configuration is valid
          </div>
        </div>
      `;const e=this.errors.filter(e=>"critical"===e.severity),t=this.errors.filter(e=>"warning"===e.severity),i=this.errors.filter(e=>"info"===e.severity);return j`
      <div class="error-container">
        <div class="error-header">
          <h3 class="error-title">
            <span class="error-icon">⚠️</span>
            ${this.title}
          </h3>
          <button
            class="toggle-button"
            @click="${this._toggleDetails}"
          >
            ${this._showDetails?"Hide Details":"Show Details"}
          </button>
        </div>

        <div class="error-summary">
          <strong>Found ${this.errors.length} issue${1!==this.errors.length?"s":""}:</strong>
          ${e.length>0?j`<br>• ${e.length} critical error${1!==e.length?"s":""} (prevents card from loading)`:""}
          ${t.length>0?j`<br>• ${t.length} warning${1!==t.length?"s":""} (may cause unexpected behavior)`:""}
          ${i.length>0?j`<br>• ${i.length} info message${1!==i.length?"s":""} (recommendations)`:""}
        </div>

        <ul class="error-list">
          ${this.errors.map(e=>j`
            <li class="error-item ${e.severity}">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span class="severity-badge severity-${e.severity}">
                  ${e.severity}
                </span>
                <span class="error-field">${e.field}</span>
              </div>
              <div class="error-message">${e.message}</div>
              ${void 0!==e.value?j`
                <div class="error-value">
                  Current value: ${"object"==typeof e.value?JSON.stringify(e.value):String(e.value)}
                </div>
              `:""}
              ${e.suggestion&&this._showSuggestions?j`
                <div class="error-suggestion">${e.suggestion}</div>
              `:""}
            </li>
          `)}
        </ul>

        ${this._showDetails?j`
          <div class="details-section">
            <h4>Technical Details:</h4>
            <div class="technical-details">${this._getTechnicalDetails()}</div>
          </div>
        `:""}

        <div class="error-actions">
          ${this.allowReset?j`
            <button
              class="error-button"
              @click="${this._handleReset}"
            >
              🔄 Reset to Default
            </button>
          `:""}
          
          ${this.allowSafeMode&&0===e.length?j`
            <button
              class="error-button safe-mode"
              @click="${this._handleSafeMode}"
            >
              🛡️ Load Safe Mode
            </button>
          `:""}
          
          <button
            class="error-button secondary"
            @click="${()=>this._showSuggestions=!this._showSuggestions}"
          >
            ${this._showSuggestions?"🙈 Hide":"💡 Show"} Suggestions
          </button>
        </div>
      </div>
    `}_toggleDetails(){this._showDetails=!this._showDetails}_handleReset(){this.dispatchEvent(new CustomEvent("config-reset",{bubbles:!0,composed:!0}))}_handleSafeMode(){this.dispatchEvent(new CustomEvent("config-safe-mode",{bubbles:!0,composed:!0}))}_getTechnicalDetails(){return this.errors.map(e=>`[${e.severity.toUpperCase()}] ${e.field}: ${e.message}\n`+(void 0!==e.value?`  Value: ${JSON.stringify(e.value)}\n`:"")+(e.suggestion?`  Suggestion: ${e.suggestion}\n`:"")).join("\n")}}e([de({type:Array})],ye.prototype,"errors",void 0),e([de({type:String})],ye.prototype,"title",void 0),e([de({type:Boolean})],ye.prototype,"allowReset",void 0),e([de({type:Boolean})],ye.prototype,"allowSafeMode",void 0),e([he()],ye.prototype,"_showDetails",void 0),e([he()],ye.prototype,"_showSuggestions",void 0),customElements.define("error-display",ye);class ve extends ae{static get styles(){return a`
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        color: var(--primary-text-color, #222);
        --progress-color: var(--progress-color, #4caf50);
      }
      
      /* FIXED: Set initial background immediately to prevent white flash */
      ha-card {
        display: flex;
        flex-direction: column;
        padding: 0;
        border-radius: 22px;
        position: relative;
        overflow: hidden;
        /* IMPORTANT: Set default background immediately */
        background: var(--card-background, var(--primary-background-color, #1a1a1a));
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        border: none;
        /* REMOVED: transition that causes flash - only animate specific properties if needed */
        /* transition: background-color 0.3s ease; */
        min-height: 120px; /* Prevent layout shift */
      }
      
      /* Error message styling */
      .error {
        color: #721c24;
        padding: 12px;
        border-radius: 16px;
        white-space: pre-wrap;
        word-break: break-word;
      }
      
      /* FIXED: Only show card after initialization to prevent white flash */
      ha-card:not(.initialized) {
        opacity: 0;
      }
      
      ha-card.initialized {
        opacity: 1;
        transition: opacity 0.2s ease-in;
      }
      
      ha-card.safe-mode {
        border: 2px solid #059669;
        box-shadow: 0 2px 10px rgba(5, 150, 105, 0.2);
      }
      
      ha-card.expired {
        animation: celebration 0.8s ease-in-out;
      }
      
      .card-content {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 20px;
        height: 100%;
        /* FIXED: Ensure content has proper background inheritance */
        background: inherit;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0;
      }
      
      .title-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      
      .title {
        font-size: var(--timeflow-title-size, 1.5rem);
        font-weight: 500;
        margin: 0;
        opacity: 0.9;
        line-height: 1.3;
        letter-spacing: -0.01em;
        color: var(--timeflow-card-text-color, inherit);
      }
      
      .subtitle {
        font-size: var(--timeflow-subtitle-size, 1rem);
        opacity: 0.65;
        margin: 0;
        font-weight: 400;
        line-height: 1.2;
        color: var(--timeflow-card-text-color, inherit);
      }
      
      .progress-section {
        flex-shrink: 0;
        margin-left: auto;
      }
      
      .content {
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        margin-top: auto;
        padding-top: 12px;
      }
      
      .progress-circle {
        opacity: 0.9;
      }
      
      @keyframes celebration {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        ha-card {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
      }
    `}constructor(){super(),this.hass=null,this.config=this.getStubConfig(),this._resolvedConfig=this.getStubConfig(),this._progress=0,this._countdown={months:0,days:0,hours:0,minutes:0,seconds:0,total:0},this._expired=!1,this._validationResult=null,this._safeMode=!1,this._initialized=!1,this._timerId=null,this.templateService=new me,this.countdownService=new fe(this.templateService,pe),this.styleManager=new _e;const e=this.getStubConfig();this.config=e,this._resolvedConfig=e}static getStubConfig(){return{type:"custom:timeflow-card-beta",target_date:"2025-12-31T23:59:59",creation_date:"2024-12-31T23:59:59",timer_entity:"",title:"New Year Countdown",show_days:!0,show_hours:!0,show_minutes:!0,show_seconds:!0,progress_color:"#C0F950",background_color:"#1a1a1a",stroke_width:15,icon_size:100,expired_animation:!0,expired_text:"Completed! 🎉",show_progress_text:!1}}getStubConfig(){return ve.getStubConfig()}setConfig(e){try{const t=ge.validateConfig(e);this._validationResult=t,t.hasCriticalErrors?(this.config=t.safeConfig||this.getStubConfig(),this._resolvedConfig={...this.config},this._safeMode=!1):(t.hasWarnings,this.config={...e},this._resolvedConfig={...e},this._safeMode=!1),this._initialized=!1,this.templateService.clearTemplateCache(),this.styleManager.clearCache(),this._updateCountdownAndRender().then(()=>{this._initialized=!0,this.requestUpdate()})}catch(t){console.error("TimeFlow Card: Unexpected configuration error:",t),this._validationResult={isValid:!1,errors:[{field:"config",message:t.message||"Unexpected configuration error",severity:"critical",suggestion:"Check console for details and verify your configuration syntax.",value:e}],hasCriticalErrors:!0,hasWarnings:!1,safeConfig:this.getStubConfig()},this.config=this.getStubConfig(),this._resolvedConfig={...this.config},this._safeMode=!1,this._initialized=!0,this.requestUpdate()}}firstUpdated(){this.templateService.card=this,this._updateCountdownAndRender().then(()=>{this._initialized=!0,this.requestUpdate(),this._startCountdownUpdates()})}disconnectedCallback(){super.disconnectedCallback(),this._stopCountdownUpdates()}updated(e){(e.has("hass")||e.has("config"))&&(this.templateService.clearTemplateCache(),this._updateCountdownAndRender())}_startCountdownUpdates(){this._stopCountdownUpdates(),this._timerId=setInterval(()=>{this._updateCountdownAndRender().catch(console.error)},1e3)}_stopCountdownUpdates(){this._timerId&&(clearInterval(this._timerId),this._timerId=null)}async _updateCountdownAndRender(){var e;if(null===(e=this._validationResult)||void 0===e?void 0:e.hasCriticalErrors)return;const t={...this.config},i=["target_date","creation_date","timer_entity","title","subtitle","color","background_color","progress_color","primary_color","secondary_color","expired_text"];for(const s of i)if("string"==typeof t[s]&&this.templateService.isTemplate(t[s])){const e=await this.templateService.resolveValue(t[s]);t[s]=e||void 0}this._resolvedConfig=t,await this.countdownService.updateCountdown(t,this.hass),this._countdown={...this.countdownService.getTimeRemaining()},this._expired=this.countdownService.isExpired(),this._progress=await this.countdownService.calculateProgress(t,this.hass),this.requestUpdate()}render(){if(this._validationResult&&!this._validationResult.isValid){if(this._validationResult.hasCriticalErrors)return j`
          <error-display
            .errors="${this._validationResult.errors}"
            .title="${"TimeFlow Card Configuration Error"}"
            .allowReset="${!0}"
            .allowSafeMode="${!1}"
            @config-reset="${this._handleConfigReset}"
          ></error-display>
        `;if(this._validationResult.hasWarnings&&!this._safeMode)return j`
          <div>
            <error-display
              .errors="${this._validationResult.errors.filter(e=>"warning"===e.severity||"info"===e.severity)}"
              .title="${"Configuration Warnings"}"
              .allowReset="${!0}"
              .allowSafeMode="${!0}"
              @config-reset="${this._handleConfigReset}"
              @config-safe-mode="${this._handleSafeMode}"
            ></error-display>
            ${this._renderCard()}
          </div>
        `}return this._renderCard()}_renderCard(){const{title:e,subtitle:t,color:i,background_color:s,progress_color:r,stroke_width:o,icon_size:a,expired_animation:n=!0,expired_text:l="Completed! 🎉",width:c,height:d,aspect_ratio:h,show_progress_text:u=!1}=this._resolvedConfig,p=s||"var(--card-background, var(--primary-background-color, #1a1a1a))",g=i||"var(--primary-text-color, #fff)",m=r||i||"var(--progress-color, #4caf50)",f=this.styleManager.calculateDynamicIconSize(c,d,h,a),_=this.styleManager.calculateDynamicStrokeWidth(f,o),y=this.styleManager.calculateProportionalSizes(c,d,h),v=this.styleManager.generateCardDimensionStyles(c,d,h),b=[`background: ${p}`,`color: ${g}`,`--timeflow-card-background-color: ${p}`,`--timeflow-card-text-color: ${g}`,`--timeflow-card-progress-color: ${m}`,`--timeflow-card-icon-size: ${f}px`,`--timeflow-card-stroke-width: ${_}`,`--timeflow-title-size: ${y.titleSize}rem`,`--timeflow-subtitle-size: ${y.subtitleSize}rem`,`--progress-text-color: ${g}`,...v].join("; "),w=this._expired?l:t||(this._resolvedConfig.timer_entity&&this.hass?ue.getTimerSubtitle(ue.getTimerData(this._resolvedConfig.timer_entity,this.hass),!1!==this._resolvedConfig.show_seconds):this.countdownService.getSubtitle(this._resolvedConfig,this.hass));let $=e;(null==$||"string"==typeof $&&""===$.trim())&&($=this._resolvedConfig.timer_entity&&this.hass?ue.getTimerTitle(this._resolvedConfig.timer_entity,this.hass):this._expired?l:"Countdown Timer");const x=[this._initialized?"initialized":"",this._expired&&n?"expired":"",this._safeMode?"safe-mode":""].filter(Boolean).join(" ");return console.log("TimeFlowCard render - show_progress_text:",u,typeof u),j`
      <ha-card class="${x}" style="${b}">
        ${this._safeMode?j`
          <div style="position: absolute; top: 8px; right: 8px; background: #059669; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
            🛡️ SAFE MODE
          </div>
        `:""}
        
        <div class="card-content">
          <header class="header">
            <div class="title-section">
              <h2 class="title" aria-live="polite">${$}</h2>
              <p class="subtitle" aria-live="polite">${w}</p>
            </div>
          </header>
          
          <div class="content" role="group" aria-label="Countdown Progress">
            <div class="progress-section">
              <progress-circle-beta
                class="progress-circle"
                .progress="${this._progress}"
                .color="${m}"
                .size="${f}"
                .strokeWidth="${_}"
                .showProgressText="${!0===u}"
                aria-label="Countdown progress: ${Math.round(this._progress)}%"
              ></progress-circle-beta>
            </div>
          </div>
        </div>
      </ha-card>
    `}_handleConfigReset(){console.log("Resetting TimeFlow Card configuration to default");const e=this.getStubConfig();this.setConfig(e)}_handleSafeMode(){var e;console.log("Activating TimeFlow Card safe mode"),(null===(e=this._validationResult)||void 0===e?void 0:e.safeConfig)&&(this._safeMode=!0,this.config={...this._validationResult.safeConfig},this._resolvedConfig={...this._validationResult.safeConfig},this.templateService.clearTemplateCache(),this.styleManager.clearCache(),this._updateCountdownAndRender().then(()=>{this.requestUpdate()}))}getCardSize(){const{aspect_ratio:e="2/1",height:t}=this.config;if(t){const e=parseInt("string"==typeof t?t:t.toString());return e<=100?1:e<=150?2:e<=200?3:4}if(e){const[t,i]=e.split("/").map(Number);if(!t||!i)return 3;const s=i/t;return s>=1.5?4:s>=1?3:2}return 3}static get version(){return"1.2.0-lit"}}e([de({type:Object})],ve.prototype,"hass",void 0),e([de({type:Object})],ve.prototype,"config",void 0),e([he()],ve.prototype,"_resolvedConfig",void 0),e([he()],ve.prototype,"_progress",void 0),e([he()],ve.prototype,"_countdown",void 0),e([he()],ve.prototype,"_expired",void 0),e([he()],ve.prototype,"_validationResult",void 0),e([he()],ve.prototype,"_safeMode",void 0),e([he()],ve.prototype,"_initialized",void 0);class be extends ae{static get styles(){return a`
      :host {
        display: inline-block;
        vertical-align: middle;
      }
      .progress-wrapper {
        position: relative;
      }
      svg {
        display: block;
        margin: 0 auto;
      }
      .progress-text {
        font-size: 16px;  
        font-weight: bold;
        fill: var(--progress-text-color, #f4f5f4ff);
        dominant-baseline: middle;
        text-anchor: middle;
        pointer-events: none;
        user-select: none;
      }
      .updating {
        transition: stroke-dashoffset 0.3s ease;
      }
    `}constructor(){super(),this.progress=0,this.color="#4CAF50",this.size=100,this.strokeWidth=15,this.showProgressText=!1,this.progress=0,this.color="#4CAF50",this.size=100,this.strokeWidth=15,this.showProgressText=!1}updated(e){var t;if(e.has("showProgressText")&&console.log("ProgressCircle - showProgressText changed to:",this.showProgressText,typeof this.showProgressText),e.has("progress")){const e=null===(t=this.renderRoot)||void 0===t?void 0:t.querySelector(".progress-bar");e&&(e.classList.add("updating"),setTimeout(()=>{e&&e.classList.remove("updating")},400))}}willUpdate(e){e.has("showProgressText")&&console.log("ProgressCircle willUpdate - showProgressText:",this.showProgressText)}updateProgress(e,t=!0){var i;if(t)this.progress=e;else{const t=null===(i=this.renderRoot)||void 0===i?void 0:i.querySelector(".progress-bar");this.progress=e,t&&(t.style.transition="none"),setTimeout(()=>{t&&(t.style.transition="")},20)}}getProgress(){return this.progress}render(){const e=Math.max(0,Math.min(100,Number(this.progress)||0)),t=Number(this.size)||100,i=Number(this.strokeWidth)||15,s=(t-i)/2,r=2*Math.PI*s,o=r-e/100*r,a=Math.max(10,Math.min(24,.16*t));return console.log("ProgressCircle render - showProgressText:",this.showProgressText,"progress:",e),j`
      <div class="progress-wrapper" style="width:${t}px; height:${t}px;">
        <svg
          class="progress-circle-beta"
          height="${t}" width="${t}"
          style="overflow:visible;"
        >
          <circle
            class="progress-bg"
            cx="${t/2}" cy="${t/2}"
            r="${s}"
            fill="none"
            stroke="#FFFFFF1A"
            stroke-width="${i}"
          ></circle>
          <circle
            class="progress-bar"
            cx="${t/2}" cy="${t/2}"
            r="${s}"
            fill="none"
            stroke="${this.color}"
            stroke-width="${i}"
            stroke-linecap="round"
            style="
              stroke-dasharray: ${r};
              stroke-dashoffset: ${o};
              transition: stroke-dashoffset 0.3s ease;
              transform: rotate(-90deg);
              transform-origin: ${t/2}px ${t/2}px;
            "
          ></circle>

          ${this.showProgressText?j`
                <text
                  x="50%" y="50%"
                  class="progress-text"
                  dy="2"
                  style="font-size: ${a}px;"
                >
                  ${Math.round(e)}%
                </text>
              `:j`<!-- showProgressText is false -->`}
        </svg>
      </div>
    `}}e([de({type:Number})],be.prototype,"progress",void 0),e([de({type:String})],be.prototype,"color",void 0),e([de({type:Number})],be.prototype,"size",void 0),e([de({type:Number})],be.prototype,"strokeWidth",void 0),e([de({type:Boolean})],be.prototype,"showProgressText",void 0),customElements.get("error-display")?console.debug("TimeFlow Card: error-display component already registered"):(customElements.define("error-display",ye),console.debug("TimeFlow Card: Registered error-display component")),customElements.get("progress-circle-beta")?console.debug("TimeFlow Card: progress-circle-beta component already registered"):(customElements.define("progress-circle-beta",be),console.debug("TimeFlow Card: Registered progress-circle-beta component")),customElements.get("timeflow-card-beta")?console.debug("TimeFlow Card: timeflow-card-beta component already registered"):(customElements.define("timeflow-card-beta",ve),console.debug("TimeFlow Card: Registered timeflow-card-beta component")),window.customCards=window.customCards||[],window.customCards.push({type:"timeflow-card-beta",name:"TimeFlow Card (Lit Version)",description:"A beautiful countdown timer card with progress circle for Home Assistant, using Lit",preview:!0,documentationURL:"https://github.com/Rishi8078/TimeFlow-Card"}),console.info("%c TIMEFLOW-CARD (Lit) \n%c Version 1.2.0 ","color: orange; font-weight: bold; background: black","color: white; font-weight: bold; background: dimgray");export{ye as ErrorDisplay,be as ProgressCircleBeta,ve as TimeFlowCardBeta};
//# sourceMappingURL=timeflow-card-beta.js.map
