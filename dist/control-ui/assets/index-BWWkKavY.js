(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();const ts=globalThis,Ki=ts.ShadowRoot&&(ts.ShadyCSS===void 0||ts.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Wi=Symbol(),eo=new WeakMap;let Pr=class{constructor(t,n,s){if(this._$cssResult$=!0,s!==Wi)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=n}get styleSheet(){let t=this.o;const n=this.t;if(Ki&&t===void 0){const s=n!==void 0&&n.length===1;s&&(t=eo.get(n)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&eo.set(n,t))}return t}toString(){return this.cssText}};const Bc=e=>new Pr(typeof e=="string"?e:e+"",void 0,Wi),zc=(e,...t)=>{const n=e.length===1?e[0]:t.reduce((s,i,a)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[a+1],e[0]);return new Pr(n,e,Wi)},Uc=(e,t)=>{if(Ki)e.adoptedStyleSheets=t.map(n=>n instanceof CSSStyleSheet?n:n.styleSheet);else for(const n of t){const s=document.createElement("style"),i=ts.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=n.cssText,e.appendChild(s)}},to=Ki?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let n="";for(const s of t.cssRules)n+=s.cssText;return Bc(n)})(e):e;const{is:Hc,defineProperty:jc,getOwnPropertyDescriptor:Kc,getOwnPropertyNames:Wc,getOwnPropertySymbols:qc,getPrototypeOf:Vc}=Object,$s=globalThis,no=$s.trustedTypes,Gc=no?no.emptyScript:"",Qc=$s.reactiveElementPolyfillSupport,xn=(e,t)=>e,ls={toAttribute(e,t){switch(t){case Boolean:e=e?Gc:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},qi=(e,t)=>!Hc(e,t),so={attribute:!0,type:String,converter:ls,reflect:!1,useDefault:!1,hasChanged:qi};Symbol.metadata??=Symbol("metadata"),$s.litPropertyMetadata??=new WeakMap;let Qt=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,n=so){if(n.state&&(n.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((n=Object.create(n)).wrapped=!0),this.elementProperties.set(t,n),!n.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,n);i!==void 0&&jc(this.prototype,t,i)}}static getPropertyDescriptor(t,n,s){const{get:i,set:a}=Kc(this.prototype,t)??{get(){return this[n]},set(o){this[n]=o}};return{get:i,set(o){const r=i?.call(this);a?.call(this,o),this.requestUpdate(t,r,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??so}static _$Ei(){if(this.hasOwnProperty(xn("elementProperties")))return;const t=Vc(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(xn("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(xn("properties"))){const n=this.properties,s=[...Wc(n),...qc(n)];for(const i of s)this.createProperty(i,n[i])}const t=this[Symbol.metadata];if(t!==null){const n=litPropertyMetadata.get(t);if(n!==void 0)for(const[s,i]of n)this.elementProperties.set(s,i)}this._$Eh=new Map;for(const[n,s]of this.elementProperties){const i=this._$Eu(n,s);i!==void 0&&this._$Eh.set(i,n)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const n=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const i of s)n.unshift(to(i))}else t!==void 0&&n.push(to(t));return n}static _$Eu(t,n){const s=n.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,n=this.constructor.elementProperties;for(const s of n.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Uc(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,n,s){this._$AK(t,s)}_$ET(t,n){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){const a=(s.converter?.toAttribute!==void 0?s.converter:ls).toAttribute(n,s.type);this._$Em=t,a==null?this.removeAttribute(i):this.setAttribute(i,a),this._$Em=null}}_$AK(t,n){const s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){const a=s.getPropertyOptions(i),o=typeof a.converter=="function"?{fromAttribute:a.converter}:a.converter?.fromAttribute!==void 0?a.converter:ls;this._$Em=i;const r=o.fromAttribute(n,a.type);this[i]=r??this._$Ej?.get(i)??r,this._$Em=null}}requestUpdate(t,n,s,i=!1,a){if(t!==void 0){const o=this.constructor;if(i===!1&&(a=this[t]),s??=o.getPropertyOptions(t),!((s.hasChanged??qi)(a,n)||s.useDefault&&s.reflect&&a===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,s))))return;this.C(t,n,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,n,{useDefault:s,reflect:i,wrapped:a},o){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??n??this[t]),a!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(n=void 0),this._$AL.set(t,n)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(n){Promise.reject(n)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[i,a]of this._$Ep)this[i]=a;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[i,a]of s){const{wrapped:o}=a,r=this[i];o!==!0||this._$AL.has(i)||r===void 0||this.C(i,void 0,a,r)}}let t=!1;const n=this._$AL;try{t=this.shouldUpdate(n),t?(this.willUpdate(n),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(n)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(n)}willUpdate(t){}_$AE(t){this._$EO?.forEach(n=>n.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(n=>this._$ET(n,this[n])),this._$EM()}updated(t){}firstUpdated(t){}};Qt.elementStyles=[],Qt.shadowRootOptions={mode:"open"},Qt[xn("elementProperties")]=new Map,Qt[xn("finalized")]=new Map,Qc?.({ReactiveElement:Qt}),($s.reactiveElementVersions??=[]).push("2.1.2");const Vi=globalThis,io=e=>e,cs=Vi.trustedTypes,ao=cs?cs.createPolicy("lit-html",{createHTML:e=>e}):void 0,Dr="$lit$",gt=`lit$${Math.random().toFixed(9).slice(2)}$`,Fr="?"+gt,Yc=`<${Fr}>`,Ft=document,An=()=>Ft.createComment(""),Cn=e=>e===null||typeof e!="object"&&typeof e!="function",Gi=Array.isArray,Zc=e=>Gi(e)||typeof e?.[Symbol.iterator]=="function",qs=`[ 	
\f\r]`,ln=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,oo=/-->/g,ro=/>/g,kt=RegExp(`>|${qs}(?:([^\\s"'>=/]+)(${qs}*=${qs}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),lo=/'/g,co=/"/g,Nr=/^(?:script|style|textarea|title)$/i,Or=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),l=Or(1),St=Or(2),vt=Symbol.for("lit-noChange"),v=Symbol.for("lit-nothing"),uo=new WeakMap,Pt=Ft.createTreeWalker(Ft,129);function Br(e,t){if(!Gi(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return ao!==void 0?ao.createHTML(t):t}const Jc=(e,t)=>{const n=e.length-1,s=[];let i,a=t===2?"<svg>":t===3?"<math>":"",o=ln;for(let r=0;r<n;r++){const c=e[r];let d,g,p=-1,h=0;for(;h<c.length&&(o.lastIndex=h,g=o.exec(c),g!==null);)h=o.lastIndex,o===ln?g[1]==="!--"?o=oo:g[1]!==void 0?o=ro:g[2]!==void 0?(Nr.test(g[2])&&(i=RegExp("</"+g[2],"g")),o=kt):g[3]!==void 0&&(o=kt):o===kt?g[0]===">"?(o=i??ln,p=-1):g[1]===void 0?p=-2:(p=o.lastIndex-g[2].length,d=g[1],o=g[3]===void 0?kt:g[3]==='"'?co:lo):o===co||o===lo?o=kt:o===oo||o===ro?o=ln:(o=kt,i=void 0);const u=o===kt&&e[r+1].startsWith("/>")?" ":"";a+=o===ln?c+Yc:p>=0?(s.push(d),c.slice(0,p)+Dr+c.slice(p)+gt+u):c+gt+(p===-2?r:u)}return[Br(e,a+(e[n]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]};class Tn{constructor({strings:t,_$litType$:n},s){let i;this.parts=[];let a=0,o=0;const r=t.length-1,c=this.parts,[d,g]=Jc(t,n);if(this.el=Tn.createElement(d,s),Pt.currentNode=this.el.content,n===2||n===3){const p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(i=Pt.nextNode())!==null&&c.length<r;){if(i.nodeType===1){if(i.hasAttributes())for(const p of i.getAttributeNames())if(p.endsWith(Dr)){const h=g[o++],u=i.getAttribute(p).split(gt),f=/([.?@])?(.*)/.exec(h);c.push({type:1,index:a,name:f[2],strings:u,ctor:f[1]==="."?ed:f[1]==="?"?td:f[1]==="@"?nd:ks}),i.removeAttribute(p)}else p.startsWith(gt)&&(c.push({type:6,index:a}),i.removeAttribute(p));if(Nr.test(i.tagName)){const p=i.textContent.split(gt),h=p.length-1;if(h>0){i.textContent=cs?cs.emptyScript:"";for(let u=0;u<h;u++)i.append(p[u],An()),Pt.nextNode(),c.push({type:2,index:++a});i.append(p[h],An())}}}else if(i.nodeType===8)if(i.data===Fr)c.push({type:2,index:a});else{let p=-1;for(;(p=i.data.indexOf(gt,p+1))!==-1;)c.push({type:7,index:a}),p+=gt.length-1}a++}}static createElement(t,n){const s=Ft.createElement("template");return s.innerHTML=t,s}}function en(e,t,n=e,s){if(t===vt)return t;let i=s!==void 0?n._$Co?.[s]:n._$Cl;const a=Cn(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,s)),s!==void 0?(n._$Co??=[])[s]=i:n._$Cl=i),i!==void 0&&(t=en(e,i._$AS(e,t.values),i,s)),t}class Xc{constructor(t,n){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=n}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:n},parts:s}=this._$AD,i=(t?.creationScope??Ft).importNode(n,!0);Pt.currentNode=i;let a=Pt.nextNode(),o=0,r=0,c=s[0];for(;c!==void 0;){if(o===c.index){let d;c.type===2?d=new ws(a,a.nextSibling,this,t):c.type===1?d=new c.ctor(a,c.name,c.strings,this,t):c.type===6&&(d=new sd(a,this,t)),this._$AV.push(d),c=s[++r]}o!==c?.index&&(a=Pt.nextNode(),o++)}return Pt.currentNode=Ft,i}p(t){let n=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,n),n+=s.strings.length-2):s._$AI(t[n])),n++}}let ws=class zr{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,n,s,i){this.type=2,this._$AH=v,this._$AN=void 0,this._$AA=t,this._$AB=n,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const n=this._$AM;return n!==void 0&&t?.nodeType===11&&(t=n.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,n=this){t=en(this,t,n),Cn(t)?t===v||t==null||t===""?(this._$AH!==v&&this._$AR(),this._$AH=v):t!==this._$AH&&t!==vt&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Zc(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==v&&Cn(this._$AH)?this._$AA.nextSibling.data=t:this.T(Ft.createTextNode(t)),this._$AH=t}$(t){const{values:n,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=Tn.createElement(Br(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(n);else{const a=new Xc(i,this),o=a.u(this.options);a.p(n),this.T(o),this._$AH=a}}_$AC(t){let n=uo.get(t.strings);return n===void 0&&uo.set(t.strings,n=new Tn(t)),n}k(t){Gi(this._$AH)||(this._$AH=[],this._$AR());const n=this._$AH;let s,i=0;for(const a of t)i===n.length?n.push(s=new zr(this.O(An()),this.O(An()),this,this.options)):s=n[i],s._$AI(a),i++;i<n.length&&(this._$AR(s&&s._$AB.nextSibling,i),n.length=i)}_$AR(t=this._$AA.nextSibling,n){for(this._$AP?.(!1,!0,n);t!==this._$AB;){const s=io(t).nextSibling;io(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},ks=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,n,s,i,a){this.type=1,this._$AH=v,this._$AN=void 0,this.element=t,this.name=n,this._$AM=i,this.options=a,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=v}_$AI(t,n=this,s,i){const a=this.strings;let o=!1;if(a===void 0)t=en(this,t,n,0),o=!Cn(t)||t!==this._$AH&&t!==vt,o&&(this._$AH=t);else{const r=t;let c,d;for(t=a[0],c=0;c<a.length-1;c++)d=en(this,r[s+c],n,c),d===vt&&(d=this._$AH[c]),o||=!Cn(d)||d!==this._$AH[c],d===v?t=v:t!==v&&(t+=(d??"")+a[c+1]),this._$AH[c]=d}o&&!i&&this.j(t)}j(t){t===v?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},ed=class extends ks{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===v?void 0:t}},td=class extends ks{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==v)}},nd=class extends ks{constructor(t,n,s,i,a){super(t,n,s,i,a),this.type=5}_$AI(t,n=this){if((t=en(this,t,n,0)??v)===vt)return;const s=this._$AH,i=t===v&&s!==v||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,a=t!==v&&(s===v||i);i&&this.element.removeEventListener(this.name,this,s),a&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},sd=class{constructor(t,n,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=n,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){en(this,t)}};const id={I:ws},ad=Vi.litHtmlPolyfillSupport;ad?.(Tn,ws),(Vi.litHtmlVersions??=[]).push("3.3.2");const od=(e,t,n)=>{const s=n?.renderBefore??t;let i=s._$litPart$;if(i===void 0){const a=n?.renderBefore??null;s._$litPart$=i=new ws(t.insertBefore(An(),a),a,void 0,n??{})}return i._$AI(e),i};const Qi=globalThis;let Jt=class extends Qt{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const n=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=od(n,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return vt}};Jt._$litElement$=!0,Jt.finalized=!0,Qi.litElementHydrateSupport?.({LitElement:Jt});const rd=Qi.litElementPolyfillSupport;rd?.({LitElement:Jt});(Qi.litElementVersions??=[]).push("4.2.2");const Ur=e=>(t,n)=>{n!==void 0?n.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)};const ld={attribute:!0,type:String,converter:ls,reflect:!1,hasChanged:qi},cd=(e=ld,t,n)=>{const{kind:s,metadata:i}=n;let a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),s==="setter"&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),s==="accessor"){const{name:o}=n;return{set(r){const c=t.get.call(this);t.set.call(this,r),this.requestUpdate(o,c,e,!0,r)},init(r){return r!==void 0&&this.C(o,void 0,e,r),r}}}if(s==="setter"){const{name:o}=n;return function(r){const c=this[o];t.call(this,r),this.requestUpdate(o,c,e,!0,r)}}throw Error("Unsupported decorator location: "+s)};function Ss(e){return(t,n)=>typeof n=="object"?cd(e,t,n):((s,i,a)=>{const o=i.hasOwnProperty(a);return i.constructor.createProperty(a,s),o?Object.getOwnPropertyDescriptor(i,a):void 0})(e,t,n)}function $(e){return Ss({...e,state:!0,attribute:!1})}const Vs="oc-voice-speaker-enabled",Gs="oc-voice-bt-devices",go="oc-voice-mode-active";class dd{constructor(){this._recognition=null,this._listening=!1,this._speakerEnabled=!1,this._voiceModeActive=!1,this._btAutoDevices=[],this._onTranscript=null,this._onStateChange=null,this._supported=!1,this._synthSupported=!1,this._useServerSTT=!1,this._mediaRecorder=null,this._audioChunks=[],this._mediaStream=null,this._sttFailCount=0,this._autoSend=!1,this._onAutoSend=null,this._speakerEnabled=localStorage.getItem(Vs)==="true",this._voiceModeActive=localStorage.getItem(go)==="true";try{this._btAutoDevices=JSON.parse(localStorage.getItem(Gs)||"[]")}catch{this._btAutoDevices=[]}const t=window.SpeechRecognition||window.webkitSpeechRecognition,n=!!t;this._synthSupported="speechSynthesis"in window,n?(this._supported=!0,this._useServerSTT=!1,this._recognition=new t,this._recognition.continuous=!0,this._recognition.interimResults=!1,this._recognition.lang="en-US",this._recognition.onresult=s=>{const i=s.results[s.results.length-1];if(i?.isFinal){const a=i[0]?.transcript??"";a&&this._onTranscript&&this._onTranscript(a)}},this._recognition.onend=()=>{const s=this._listening;this._listening=!1,this._notify(),s&&this._voiceModeActive&&setTimeout(()=>this.startListening(),300)},this._recognition.onerror=s=>{s.error!=="no-speech"&&s.error!=="aborted"&&console.warn("[voice] Recognition error:",s.error),!(s.error==="no-speech"&&this._listening&&this._voiceModeActive)&&(this._listening=!1,this._notify())}):typeof MediaRecorder<"u"&&navigator.mediaDevices?.getUserMedia&&(this._supported=!0,this._useServerSTT=!0),this._initBluetoothDetection()}get supported(){return this._supported}get synthSupported(){return this._synthSupported}get listening(){return this._listening}get speakerEnabled(){return this._speakerEnabled}get voiceModeActive(){return this._voiceModeActive}get btAutoDevices(){return[...this._btAutoDevices]}setOnTranscript(t){this._onTranscript=t}setOnStateChange(t){this._onStateChange=t}startListening(){if(!(!this._supported||this._listening)){if(this._useServerSTT){this._startServerSTT();return}if(this._recognition)try{this._recognition.start(),this._listening=!0,this._notify()}catch(t){console.warn("[voice] Could not start recognition:",t)}}}stopListening(){if(this._listening){if(this._useServerSTT){this._stopServerSTT();return}if(this._recognition){try{this._recognition.stop()}catch{}this._listening=!1,this._notify()}}}async _startServerSTT(){try{this._audioChunks=[],this._mediaStream=await navigator.mediaDevices.getUserMedia({audio:!0});const t=MediaRecorder.isTypeSupported("audio/webm;codecs=opus")?"audio/webm;codecs=opus":MediaRecorder.isTypeSupported("audio/webm")?"audio/webm":"audio/ogg;codecs=opus";this._mediaRecorder=new MediaRecorder(this._mediaStream,{mimeType:t}),this._mediaRecorder.ondataavailable=n=>{n.data.size>0&&this._audioChunks.push(n.data)},this._mediaRecorder.onstop=()=>{this._sendAudioToServer()},this._mediaRecorder.start(),this._listening=!0,this._notify()}catch(t){console.warn("[voice] Could not start recording:",t),this._listening=!1,this._notify()}}_stopServerSTT(){this._mediaRecorder&&this._mediaRecorder.state!=="inactive"&&this._mediaRecorder.stop(),this._mediaStream&&(this._mediaStream.getTracks().forEach(t=>t.stop()),this._mediaStream=null),this._listening=!1,this._notify()}async _sendAudioToServer(){if(this._audioChunks.length===0)return;const t=new Blob(this._audioChunks,{type:this._audioChunks[0].type||"audio/webm"});if(this._audioChunks=[],t.size<1e3)return;const n=t.type.includes("ogg")?"ogg":t.type.includes("mp4")?"mp4":"webm",s=new FormData;s.append("file",t,`recording.${n}`);try{const i=localStorage.getItem("oc-token")||document.cookie.split(";").map(r=>r.trim()).find(r=>r.startsWith("oc-token="))?.split("=")[1]||"",o=await(await fetch("/api/voice/transcribe",{method:"POST",headers:i?{Authorization:"Bearer "+i}:{},body:s})).json();o.ok&&o.text&&o.text.trim()?(this._onTranscript?.(o.text.trim()),this._sttFailCount=0):o.error&&(console.warn("[voice] Server transcription error:",o.error),this._sttFailCount++)}catch(i){console.warn("[voice] Server transcription failed:",i),this._sttFailCount++}if(this._voiceModeActive&&this._sttFailCount<5){const i=Math.min(300*Math.pow(2,this._sttFailCount),1e4);setTimeout(()=>this.startListening(),i)}else this._sttFailCount>=5&&(console.warn("[voice] Too many STT failures, stopping voice mode"),this.setVoiceMode(!1))}toggleListening(){this._listening?this.stopListening():this.startListening()}toggleSpeaker(){this._speakerEnabled=!this._speakerEnabled,localStorage.setItem(Vs,String(this._speakerEnabled)),this._speakerEnabled||this.stopSpeaking(),this._notify()}setSpeaker(t){this._speakerEnabled=t,localStorage.setItem(Vs,String(t)),t||this.stopSpeaking(),this._notify()}speak(t){!this._synthSupported||!this._speakerEnabled||this._doSpeak(t)}speakDirect(t){this._synthSupported&&this._doSpeak(t)}_doSpeak(t){this.stopSpeaking();const n=t.replace(/```[\s\S]*?```/g,"").replace(/`[^`]+`/g,"").replace(/\[([^\]]+)\]\([^)]+\)/g,"$1").replace(/[#*_~>|]/g,"").replace(/\n+/g,". ").trim();if(!n)return;const s=new SpeechSynthesisUtterance(n);s.rate=1,s.pitch=1,speechSynthesis.speak(s)}get isSpeaking(){return this._synthSupported&&speechSynthesis.speaking}get autoSend(){return this._autoSend}setAutoSend(t){this._autoSend=t,this._notify()}setOnAutoSend(t){this._onAutoSend=t}stopSpeaking(){this._synthSupported&&speechSynthesis.speaking&&speechSynthesis.cancel()}setVoiceMode(t){this._voiceModeActive=t,localStorage.setItem(go,String(t)),t?(this.setSpeaker(!0),this.startListening()):this.stopListening(),this._notify()}toggleVoiceMode(){this.setVoiceMode(!this._voiceModeActive)}addBtDevice(t){const n=t.trim();!n||this._btAutoDevices.includes(n)||(this._btAutoDevices.push(n),localStorage.setItem(Gs,JSON.stringify(this._btAutoDevices)),this._notify())}removeBtDevice(t){this._btAutoDevices=this._btAutoDevices.filter(n=>n!==t),localStorage.setItem(Gs,JSON.stringify(this._btAutoDevices)),this._notify()}_notify(){this._onStateChange?.()}async _initBluetoothDetection(){if(!navigator.mediaDevices?.enumerateDevices)return;const t=async()=>{try{const i=(await navigator.mediaDevices.enumerateDevices()).filter(a=>a.kind==="audiooutput").some(a=>{const o=(a.label||"").toLowerCase();return this._btAutoDevices.length>0?this._btAutoDevices.some(r=>o.includes(r.toLowerCase())):o.includes("bluetooth")||o.includes("car")||o.includes("handsfree")||o.includes("carplay")||o.includes("android auto")});i&&!this._voiceModeActive?this.setVoiceMode(!0):!i&&this._voiceModeActive&&this._btAutoDevices.length>0&&this.setVoiceMode(!1)}catch{}};navigator.mediaDevices.addEventListener("devicechange",t),t()}}const ne=new dd,ud="modulepreload",gd=function(e,t){return new URL(e,t).href},po={},Qs=function(t,n,s){let i=Promise.resolve();if(n&&n.length>0){let d=function(g){return Promise.all(g.map(p=>Promise.resolve(p).then(h=>({status:"fulfilled",value:h}),h=>({status:"rejected",reason:h}))))};const o=document.getElementsByTagName("link"),r=document.querySelector("meta[property=csp-nonce]"),c=r?.nonce||r?.getAttribute("nonce");i=d(n.map(g=>{if(g=gd(g,s),g in po)return;po[g]=!0;const p=g.endsWith(".css"),h=p?'[rel="stylesheet"]':"";if(s)for(let f=o.length-1;f>=0;f--){const m=o[f];if(m.href===g&&(!p||m.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${g}"]${h}`))return;const u=document.createElement("link");if(u.rel=p?"stylesheet":ud,p||(u.as="script"),u.crossOrigin="",u.href=g,c&&u.setAttribute("nonce",c),document.head.appendChild(u),p)return new Promise((f,m)=>{u.addEventListener("load",f),u.addEventListener("error",()=>m(new Error(`Unable to preload CSS for ${g}`)))})}))}function a(o){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=o,window.dispatchEvent(r),!r.defaultPrevented)throw o}return i.then(o=>{for(const r of o||[])r.status==="rejected"&&a(r.reason);return t().catch(a)})},pd={common:{health:"Health",ok:"OK",offline:"Offline",connect:"Connect",refresh:"Refresh",enabled:"Enabled",disabled:"Disabled",na:"n/a",docs:"Docs",resources:"Resources"},nav:{chat:"Chat",control:"Control",agent:"Agent",settings:"Settings",expand:"Expand sidebar",collapse:"Collapse sidebar"},tabs:{agents:"Agents",overview:"Overview",channels:"Channels",instances:"Instances",sessions:"Sessions",usage:"Usage",cron:"Cron Jobs",skills:"Skills",nodes:"Nodes",chat:"Chat",config:"Config",debug:"Debug",logs:"Logs"},subtitles:{agents:"Manage agent workspaces, tools, and identities.",overview:"Gateway status, entry points, and a fast health read.",channels:"Manage channels and settings.",instances:"Presence beacons from connected clients and nodes.",sessions:"Inspect active sessions and adjust per-session defaults.",usage:"Monitor API usage and costs.",cron:"Schedule wakeups and recurring agent runs.",skills:"Manage skill availability and API key injection.",nodes:"Paired devices, capabilities, and command exposure.",chat:"Direct gateway chat session for quick interventions.",config:"Edit ~/.openclaw/openclaw.json safely.",debug:"Gateway snapshots, events, and manual RPC calls.",logs:"Live tail of the gateway file logs."},overview:{access:{title:"Gateway Access",subtitle:"Where the dashboard connects and how it authenticates.",wsUrl:"WebSocket URL",token:"Gateway Token",password:"Password (not stored)",sessionKey:"Default Session Key",language:"Language",connectHint:"Click Connect to apply connection changes.",trustedProxy:"Authenticated via trusted proxy."},snapshot:{title:"Snapshot",subtitle:"Latest gateway handshake information.",status:"Status",uptime:"Uptime",tickInterval:"Tick Interval",lastChannelsRefresh:"Last Channels Refresh",channelsHint:"Use Channels to link WhatsApp, Telegram, Discord, Signal, or iMessage."},stats:{instances:"Instances",instancesHint:"Presence beacons in the last 5 minutes.",sessions:"Sessions",sessionsHint:"Recent session keys tracked by the gateway.",cron:"Cron",cronNext:"Next wake {time}"},notes:{title:"Notes",subtitle:"Quick reminders for remote control setups.",tailscaleTitle:"Tailscale serve",tailscaleText:"Prefer serve mode to keep the gateway on loopback with tailnet auth.",sessionTitle:"Session hygiene",sessionText:"Use /new or sessions.patch to reset context.",cronTitle:"Cron reminders",cronText:"Use isolated sessions for recurring runs."},auth:{required:"This gateway requires auth. Add a token or password, then click Connect.",failed:"Auth failed. Re-copy a tokenized URL with {command}, or update the token, then click Connect."},insecure:{hint:"This page is HTTP, so the browser blocks device identity. Use HTTPS (Tailscale Serve) or open {url} on the gateway host.",stayHttp:"If you must stay on HTTP, set {config} (token-only)."}},chat:{disconnected:"Disconnected from gateway.",refreshTitle:"Refresh chat data",thinkingToggle:"Toggle assistant thinking/working output",focusToggle:"Toggle focus mode (hide sidebar + page header)",onboardingDisabled:"Disabled during onboarding"},languages:{en:"English",zhCN:"简体中文 (Simplified Chinese)",zhTW:"繁體中文 (Traditional Chinese)",ptBR:"Português (Brazilian Portuguese)"}},fd=["en","zh-CN","zh-TW","pt-BR"];function Yi(e){return e!=null&&fd.includes(e)}class hd{constructor(){this.locale="en",this.translations={en:pd},this.subscribers=new Set,this.loadLocale()}loadLocale(){const t=localStorage.getItem("openclaw.i18n.locale");if(Yi(t))this.locale=t;else{const n=navigator.language;n.startsWith("zh")?this.locale=n==="zh-TW"||n==="zh-HK"?"zh-TW":"zh-CN":n.startsWith("pt")?this.locale="pt-BR":this.locale="en"}}getLocale(){return this.locale}async setLocale(t){if(this.locale!==t){if(!this.translations[t])try{let n;if(t==="zh-CN")n=await Qs(()=>import("./zh-CN-CGVPSYVJ.js"),[],import.meta.url);else if(t==="zh-TW")n=await Qs(()=>import("./zh-TW-BVv_0_oO.js"),[],import.meta.url);else if(t==="pt-BR")n=await Qs(()=>import("./pt-BR-jDuotdpV.js"),[],import.meta.url);else return;this.translations[t]=n[t.replace("-","_")]}catch(n){console.error(`Failed to load locale: ${t}`,n);return}this.locale=t,localStorage.setItem("openclaw.i18n.locale",t),this.notify()}}registerTranslation(t,n){this.translations[t]=n}subscribe(t){return this.subscribers.add(t),()=>this.subscribers.delete(t)}notify(){this.subscribers.forEach(t=>t(this.locale))}t(t,n){const s=t.split(".");let i=this.translations[this.locale]||this.translations.en;for(const a of s)if(i&&typeof i=="object")i=i[a];else{i=void 0;break}if(i===void 0&&this.locale!=="en"){i=this.translations.en;for(const a of s)if(i&&typeof i=="object")i=i[a];else{i=void 0;break}}return typeof i!="string"?t:n?i.replace(/\{(\w+)\}/g,(a,o)=>n[o]||`{${o}}`):i}}const _n=new hd,P=(e,t)=>_n.t(e,t);class vd{constructor(t){this.host=t,this.host.addController(this)}hostConnected(){this.unsubscribe=_n.subscribe(()=>{this.host.requestUpdate()})}hostDisconnected(){this.unsubscribe?.()}}async function Te(e,t){if(!(!e.client||!e.connected)&&!e.channelsLoading){e.channelsLoading=!0,e.channelsError=null;try{const n=await e.client.request("channels.status",{probe:t,timeoutMs:8e3});e.channelsSnapshot=n,e.channelsLastSuccess=Date.now()}catch(n){e.channelsError=String(n)}finally{e.channelsLoading=!1}}}async function md(e,t){if(!(!e.client||!e.connected||e.whatsappBusy)){e.whatsappBusy=!0;try{const n=await e.client.request("web.login.start",{force:t,timeoutMs:3e4});e.whatsappLoginMessage=n.message??null,e.whatsappLoginQrDataUrl=n.qrDataUrl??null,e.whatsappLoginConnected=null}catch(n){e.whatsappLoginMessage=String(n),e.whatsappLoginQrDataUrl=null,e.whatsappLoginConnected=null}finally{e.whatsappBusy=!1}}}async function bd(e){if(!(!e.client||!e.connected||e.whatsappBusy)){e.whatsappBusy=!0;try{const t=await e.client.request("web.login.wait",{timeoutMs:12e4});e.whatsappLoginMessage=t.message??null,e.whatsappLoginConnected=t.connected??null,t.connected&&(e.whatsappLoginQrDataUrl=null)}catch(t){e.whatsappLoginMessage=String(t),e.whatsappLoginConnected=null}finally{e.whatsappBusy=!1}}}async function yd(e){if(!(!e.client||!e.connected||e.whatsappBusy)){e.whatsappBusy=!0;try{await e.client.request("channels.logout",{channel:"whatsapp"}),e.whatsappLoginMessage="Logged out.",e.whatsappLoginQrDataUrl=null,e.whatsappLoginConnected=null}catch(t){e.whatsappLoginMessage=String(t)}finally{e.whatsappBusy=!1}}}function Le(e){if(e)return Array.isArray(e.type)?e.type.filter(n=>n!=="null")[0]??e.type[0]:e.type}function Hr(e){if(!e)return"";if(e.default!==void 0)return e.default;switch(Le(e)){case"object":return{};case"array":return[];case"boolean":return!1;case"number":case"integer":return 0;case"string":return"";default:return""}}function Zi(e){return e.filter(t=>typeof t=="string").join(".")}function Re(e,t){const n=Zi(e),s=t[n];if(s)return s;const i=n.split(".");for(const[a,o]of Object.entries(t)){if(!a.includes("*"))continue;const r=a.split(".");if(r.length!==i.length)continue;let c=!0;for(let d=0;d<i.length;d+=1)if(r[d]!=="*"&&r[d]!==i[d]){c=!1;break}if(c)return o}}function st(e){return e.replace(/_/g," ").replace(/([a-z0-9])([A-Z])/g,"$1 $2").replace(/\s+/g," ").replace(/^./,t=>t.toUpperCase())}function fo(e,t){const n=e.trim();if(n==="")return;const s=Number(n);return!Number.isFinite(s)||t&&!Number.isInteger(s)?e:s}function ho(e){const t=e.trim();return t==="true"?!0:t==="false"?!1:e}function ut(e,t){if(e==null)return e;if(t.allOf&&t.allOf.length>0){let s=e;for(const i of t.allOf)s=ut(s,i);return s}const n=Le(t);if(t.anyOf||t.oneOf){const s=(t.anyOf??t.oneOf??[]).filter(i=>!(i.type==="null"||Array.isArray(i.type)&&i.type.includes("null")));if(s.length===1)return ut(e,s[0]);if(typeof e=="string")for(const i of s){const a=Le(i);if(a==="number"||a==="integer"){const o=fo(e,a==="integer");if(o===void 0||typeof o=="number")return o}if(a==="boolean"){const o=ho(e);if(typeof o=="boolean")return o}}for(const i of s){const a=Le(i);if(a==="object"&&typeof e=="object"&&!Array.isArray(e)||a==="array"&&Array.isArray(e))return ut(e,i)}return e}if(n==="number"||n==="integer"){if(typeof e=="string"){const s=fo(e,n==="integer");if(s===void 0||typeof s=="number")return s}return e}if(n==="boolean"){if(typeof e=="string"){const s=ho(e);if(typeof s=="boolean")return s}return e}if(n==="object"){if(typeof e!="object"||Array.isArray(e))return e;const s=e,i=t.properties??{},a=t.additionalProperties&&typeof t.additionalProperties=="object"?t.additionalProperties:null,o={};for(const[r,c]of Object.entries(s)){const d=i[r]??a,g=d?ut(c,d):c;g!==void 0&&(o[r]=g)}return o}if(n==="array"){if(!Array.isArray(e))return e;if(Array.isArray(t.items)){const i=t.items;return e.map((a,o)=>{const r=o<i.length?i[o]:void 0;return r?ut(a,r):a})}const s=t.items;return s?e.map(i=>ut(i,s)).filter(i=>i!==void 0):e}return e}function Nt(e){return typeof structuredClone=="function"?structuredClone(e):JSON.parse(JSON.stringify(e))}function En(e){return`${JSON.stringify(e,null,2).trimEnd()}
`}function jr(e,t,n){if(t.length===0)return;let s=e;for(let a=0;a<t.length-1;a+=1){const o=t[a],r=t[a+1];if(typeof o=="number"){if(!Array.isArray(s))return;s[o]==null&&(s[o]=typeof r=="number"?[]:{}),s=s[o]}else{if(typeof s!="object"||s==null)return;const c=s;c[o]==null&&(c[o]=typeof r=="number"?[]:{}),s=c[o]}}const i=t[t.length-1];if(typeof i=="number"){Array.isArray(s)&&(s[i]=n);return}typeof s=="object"&&s!=null&&(s[i]=n)}function Kr(e,t){if(t.length===0)return;let n=e;for(let i=0;i<t.length-1;i+=1){const a=t[i];if(typeof a=="number"){if(!Array.isArray(n))return;n=n[a]}else{if(typeof n!="object"||n==null)return;n=n[a]}if(n==null)return}const s=t[t.length-1];if(typeof s=="number"){Array.isArray(n)&&n.splice(s,1);return}typeof n=="object"&&n!=null&&delete n[s]}async function Be(e){if(!(!e.client||!e.connected)){e.configLoading=!0,e.lastError=null;try{const t=await e.client.request("config.get",{});$d(e,t)}catch(t){e.lastError=String(t)}finally{e.configLoading=!1}}}async function Wr(e){if(!(!e.client||!e.connected)&&!e.configSchemaLoading){e.configSchemaLoading=!0;try{const t=await e.client.request("config.schema",{});xd(e,t)}catch(t){e.lastError=String(t)}finally{e.configSchemaLoading=!1}}}function xd(e,t){e.configSchema=t.schema??null,e.configUiHints=t.uiHints??{},e.configSchemaVersion=t.version??null}function $d(e,t){e.configSnapshot=t;const n=typeof t.raw=="string"?t.raw:t.config&&typeof t.config=="object"?En(t.config):e.configRaw;!e.configFormDirty||e.configFormMode==="raw"?e.configRaw=n:e.configForm?e.configRaw=En(e.configForm):e.configRaw=n,e.configValid=typeof t.valid=="boolean"?t.valid:null,e.configIssues=Array.isArray(t.issues)?t.issues:[],e.configFormDirty||(e.configForm=Nt(t.config??{}),e.configFormOriginal=Nt(t.config??{}),e.configRawOriginal=n)}function wd(e){return!e||typeof e!="object"||Array.isArray(e)?null:e}function qr(e){if(e.configFormMode!=="form"||!e.configForm)return e.configRaw;const t=wd(e.configSchema),n=t?ut(e.configForm,t):e.configForm;return En(n)}async function ns(e){if(!(!e.client||!e.connected)){e.configSaving=!0,e.lastError=null;try{const t=qr(e),n=e.configSnapshot?.hash;if(!n){e.lastError="Config hash missing; reload and retry.";return}await e.client.request("config.set",{raw:t,baseHash:n}),e.configFormDirty=!1,await Be(e)}catch(t){e.lastError=String(t)}finally{e.configSaving=!1}}}async function kd(e){if(!(!e.client||!e.connected)){e.configApplying=!0,e.lastError=null;try{const t=qr(e),n=e.configSnapshot?.hash;if(!n){e.lastError="Config hash missing; reload and retry.";return}await e.client.request("config.apply",{raw:t,baseHash:n,sessionKey:e.applySessionKey}),e.configFormDirty=!1,await Be(e)}catch(t){e.lastError=String(t)}finally{e.configApplying=!1}}}async function Sd(e){if(!(!e.client||!e.connected)){e.updateRunning=!0,e.lastError=null;try{await e.client.request("update.run",{sessionKey:e.applySessionKey})}catch(t){e.lastError=String(t)}finally{e.updateRunning=!1}}}function Ee(e,t,n){const s=Nt(e.configForm??e.configSnapshot?.config??{});jr(s,t,n),e.configForm=s,e.configFormDirty=!0,e.configFormMode==="form"&&(e.configRaw=En(s))}function et(e,t){const n=Nt(e.configForm??e.configSnapshot?.config??{});Kr(n,t),e.configForm=n,e.configFormDirty=!0,e.configFormMode==="form"&&(e.configRaw=En(n))}function Ad(e){const{values:t,original:n}=e;return t.name!==n.name||t.displayName!==n.displayName||t.about!==n.about||t.picture!==n.picture||t.banner!==n.banner||t.website!==n.website||t.nip05!==n.nip05||t.lud16!==n.lud16}function Cd(e){const{state:t,callbacks:n,accountId:s}=e,i=Ad(t),a=(r,c,d={})=>{const{type:g="text",placeholder:p,maxLength:h,help:u}=d,f=t.values[r]??"",m=t.fieldErrors[r],w=`nostr-profile-${r}`;return g==="textarea"?l`
        <div class="form-field" style="margin-bottom: 12px;">
          <label for="${w}" style="display: block; margin-bottom: 4px; font-weight: 500;">
            ${c}
          </label>
          <textarea
            id="${w}"
            .value=${f}
            placeholder=${p??""}
            maxlength=${h??2e3}
            rows="3"
            style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; resize: vertical; font-family: inherit;"
            @input=${A=>{const C=A.target;n.onFieldChange(r,C.value)}}
            ?disabled=${t.saving}
          ></textarea>
          ${u?l`<div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${u}</div>`:v}
          ${m?l`<div style="font-size: 12px; color: var(--danger-color); margin-top: 2px;">${m}</div>`:v}
        </div>
      `:l`
      <div class="form-field" style="margin-bottom: 12px;">
        <label for="${w}" style="display: block; margin-bottom: 4px; font-weight: 500;">
          ${c}
        </label>
        <input
          id="${w}"
          type=${g}
          .value=${f}
          placeholder=${p??""}
          maxlength=${h??256}
          style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;"
          @input=${A=>{const C=A.target;n.onFieldChange(r,C.value)}}
          ?disabled=${t.saving}
        />
        ${u?l`<div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${u}</div>`:v}
        ${m?l`<div style="font-size: 12px; color: var(--danger-color); margin-top: 2px;">${m}</div>`:v}
      </div>
    `},o=()=>{const r=t.values.picture;return r?l`
      <div style="margin-bottom: 12px;">
        <img
          src=${r}
          alt="Profile picture preview"
          style="max-width: 80px; max-height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-color);"
          @error=${c=>{const d=c.target;d.style.display="none"}}
          @load=${c=>{const d=c.target;d.style.display="block"}}
        />
      </div>
    `:v};return l`
    <div class="nostr-profile-form" style="padding: 16px; background: var(--bg-secondary); border-radius: 8px; margin-top: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div style="font-weight: 600; font-size: 16px;">Edit Profile</div>
        <div style="font-size: 12px; color: var(--text-muted);">Account: ${s}</div>
      </div>

      ${t.error?l`<div class="callout danger" style="margin-bottom: 12px;">${t.error}</div>`:v}

      ${t.success?l`<div class="callout success" style="margin-bottom: 12px;">${t.success}</div>`:v}

      ${o()}

      ${a("name","Username",{placeholder:"satoshi",maxLength:256,help:"Short username (e.g., satoshi)"})}

      ${a("displayName","Display Name",{placeholder:"Satoshi Nakamoto",maxLength:256,help:"Your full display name"})}

      ${a("about","Bio",{type:"textarea",placeholder:"Tell people about yourself...",maxLength:2e3,help:"A brief bio or description"})}

      ${a("picture","Avatar URL",{type:"url",placeholder:"https://example.com/avatar.jpg",help:"HTTPS URL to your profile picture"})}

      ${t.showAdvanced?l`
            <div style="border-top: 1px solid var(--border-color); padding-top: 12px; margin-top: 12px;">
              <div style="font-weight: 500; margin-bottom: 12px; color: var(--text-muted);">Advanced</div>

              ${a("banner","Banner URL",{type:"url",placeholder:"https://example.com/banner.jpg",help:"HTTPS URL to a banner image"})}

              ${a("website","Website",{type:"url",placeholder:"https://example.com",help:"Your personal website"})}

              ${a("nip05","NIP-05 Identifier",{placeholder:"you@example.com",help:"Verifiable identifier (e.g., you@domain.com)"})}

              ${a("lud16","Lightning Address",{placeholder:"you@getalby.com",help:"Lightning address for tips (LUD-16)"})}
            </div>
          `:v}

      <div style="display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap;">
        <button
          class="btn primary"
          @click=${n.onSave}
          ?disabled=${t.saving||!i}
        >
          ${t.saving?"Saving...":"Save & Publish"}
        </button>

        <button
          class="btn"
          @click=${n.onImport}
          ?disabled=${t.importing||t.saving}
        >
          ${t.importing?"Importing...":"Import from Relays"}
        </button>

        <button
          class="btn"
          @click=${n.onToggleAdvanced}
        >
          ${t.showAdvanced?"Hide Advanced":"Show Advanced"}
        </button>

        <button
          class="btn"
          @click=${n.onCancel}
          ?disabled=${t.saving}
        >
          Cancel
        </button>
      </div>

      ${i?l`
              <div style="font-size: 12px; color: var(--warning-color); margin-top: 8px">
                You have unsaved changes
              </div>
            `:v}
    </div>
  `}function Td(e){const t={name:e?.name??"",displayName:e?.displayName??"",about:e?.about??"",picture:e?.picture??"",banner:e?.banner??"",website:e?.website??"",nip05:e?.nip05??"",lud16:e?.lud16??""};return{values:t,original:{...t},saving:!1,importing:!1,error:null,success:null,fieldErrors:{},showAdvanced:!!(e?.banner||e?.website||e?.nip05||e?.lud16)}}async function _d(e,t){await md(e,t),await Te(e,!0)}async function Ed(e){await bd(e),await Te(e,!0)}async function Ld(e){await yd(e),await Te(e,!0)}async function Md(e){await ns(e),await Be(e),await Te(e,!0)}async function Id(e){await Be(e),await Te(e,!0)}function Rd(e){if(!Array.isArray(e))return{};const t={};for(const n of e){if(typeof n!="string")continue;const[s,...i]=n.split(":");if(!s||i.length===0)continue;const a=s.trim(),o=i.join(":").trim();a&&o&&(t[a]=o)}return t}function Vr(e){return(e.channelsSnapshot?.channelAccounts?.nostr??[])[0]?.accountId??e.nostrProfileAccountId??"default"}function Gr(e,t=""){return`/api/channels/nostr/${encodeURIComponent(e)}/profile${t}`}function Pd(e){const t=e.hello?.auth?.deviceToken?.trim();if(t)return`Bearer ${t}`;const n=e.settings.token.trim();if(n)return`Bearer ${n}`;const s=e.password.trim();return s?`Bearer ${s}`:null}function Qr(e){const t=Pd(e);return t?{Authorization:t}:{}}function Dd(e,t,n){e.nostrProfileAccountId=t,e.nostrProfileFormState=Td(n??void 0)}function Fd(e){e.nostrProfileFormState=null,e.nostrProfileAccountId=null}function Nd(e,t,n){const s=e.nostrProfileFormState;s&&(e.nostrProfileFormState={...s,values:{...s.values,[t]:n},fieldErrors:{...s.fieldErrors,[t]:""}})}function Od(e){const t=e.nostrProfileFormState;t&&(e.nostrProfileFormState={...t,showAdvanced:!t.showAdvanced})}async function Bd(e){const t=e.nostrProfileFormState;if(!t||t.saving)return;const n=Vr(e);e.nostrProfileFormState={...t,saving:!0,error:null,success:null,fieldErrors:{}};try{const s=await fetch(Gr(n),{method:"PUT",headers:{"Content-Type":"application/json",...Qr(e)},body:JSON.stringify(t.values)}),i=await s.json().catch(()=>null);if(!s.ok||i?.ok===!1||!i){const a=i?.error??`Profile update failed (${s.status})`;e.nostrProfileFormState={...t,saving:!1,error:a,success:null,fieldErrors:Rd(i?.details)};return}if(!i.persisted){e.nostrProfileFormState={...t,saving:!1,error:"Profile publish failed on all relays.",success:null};return}e.nostrProfileFormState={...t,saving:!1,error:null,success:"Profile published to relays.",fieldErrors:{},original:{...t.values}},await Te(e,!0)}catch(s){e.nostrProfileFormState={...t,saving:!1,error:`Profile update failed: ${String(s)}`,success:null}}}async function zd(e){const t=e.nostrProfileFormState;if(!t||t.importing)return;const n=Vr(e);e.nostrProfileFormState={...t,importing:!0,error:null,success:null};try{const s=await fetch(Gr(n,"/import"),{method:"POST",headers:{"Content-Type":"application/json",...Qr(e)},body:JSON.stringify({autoMerge:!0})}),i=await s.json().catch(()=>null);if(!s.ok||i?.ok===!1||!i){const c=i?.error??`Profile import failed (${s.status})`;e.nostrProfileFormState={...t,importing:!1,error:c,success:null};return}const a=i.merged??i.imported??null,o=a?{...t.values,...a}:t.values,r=!!(o.banner||o.website||o.nip05||o.lud16);e.nostrProfileFormState={...t,importing:!1,values:o,error:null,success:i.saved?"Profile imported from relays. Review and publish.":"Profile imported. Review and publish.",showAdvanced:r},i.saved&&await Te(e,!0)}catch(s){e.nostrProfileFormState={...t,importing:!1,error:`Profile import failed: ${String(s)}`,success:null}}}function Yr(e){const t=(e??"").trim();if(!t)return null;const n=t.split(":").filter(Boolean);if(n.length<3||n[0]!=="agent")return null;const s=n[1]?.trim(),i=n.slice(2).join(":");return!s||!i?null:{agentId:s,rest:i}}const xi=450;function Rn(e,t=!1,n=!1){e.chatScrollFrame&&cancelAnimationFrame(e.chatScrollFrame),e.chatScrollTimeout!=null&&(clearTimeout(e.chatScrollTimeout),e.chatScrollTimeout=null);const s=()=>{const i=e.querySelector(".chat-thread");if(i){const a=getComputedStyle(i).overflowY;if(a==="auto"||a==="scroll"||i.scrollHeight-i.clientHeight>1)return i}return document.scrollingElement??document.documentElement};e.updateComplete.then(()=>{e.chatScrollFrame=requestAnimationFrame(()=>{e.chatScrollFrame=null;const i=s();if(!i)return;const a=i.scrollHeight-i.scrollTop-i.clientHeight,o=t&&!e.chatHasAutoScrolled;if(!(o||e.chatUserNearBottom||a<xi)){e.chatNewMessagesBelow=!0;return}o&&(e.chatHasAutoScrolled=!0);const c=n&&(typeof window>"u"||typeof window.matchMedia!="function"||!window.matchMedia("(prefers-reduced-motion: reduce)").matches),d=i.scrollHeight;typeof i.scrollTo=="function"?i.scrollTo({top:d,behavior:c?"smooth":"auto"}):i.scrollTop=d,e.chatUserNearBottom=!0,e.chatNewMessagesBelow=!1;const g=o?150:120;e.chatScrollTimeout=window.setTimeout(()=>{e.chatScrollTimeout=null;const p=s();if(!p)return;const h=p.scrollHeight-p.scrollTop-p.clientHeight;(o||e.chatUserNearBottom||h<xi)&&(p.scrollTop=p.scrollHeight,e.chatUserNearBottom=!0)},g)})})}function Zr(e,t=!1){e.logsScrollFrame&&cancelAnimationFrame(e.logsScrollFrame),e.updateComplete.then(()=>{e.logsScrollFrame=requestAnimationFrame(()=>{e.logsScrollFrame=null;const n=e.querySelector(".log-stream");if(!n)return;const s=n.scrollHeight-n.scrollTop-n.clientHeight;(t||s<80)&&(n.scrollTop=n.scrollHeight)})})}function Ud(e,t){const n=t.currentTarget;if(!n)return;const s=n.scrollHeight-n.scrollTop-n.clientHeight;e.chatUserNearBottom=s<xi,e.chatUserNearBottom&&(e.chatNewMessagesBelow=!1)}function Hd(e,t){const n=t.currentTarget;if(!n)return;const s=n.scrollHeight-n.scrollTop-n.clientHeight;e.logsAtBottom=s<80}function vo(e){e.chatHasAutoScrolled=!1,e.chatUserNearBottom=!0,e.chatNewMessagesBelow=!1}function jd(e,t){if(e.length===0)return;const n=new Blob([`${e.join(`
`)}
`],{type:"text/plain"}),s=URL.createObjectURL(n),i=document.createElement("a"),a=new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");i.href=s,i.download=`openclaw-logs-${t}-${a}.log`,i.click(),URL.revokeObjectURL(s)}function Kd(e){if(typeof ResizeObserver>"u")return;const t=e.querySelector(".topbar");if(!t)return;const n=()=>{const{height:s}=t.getBoundingClientRect();e.style.setProperty("--topbar-height",`${s}px`)};n(),e.topbarObserver=new ResizeObserver(()=>n()),e.topbarObserver.observe(t)}async function As(e){if(!(!e.client||!e.connected)&&!e.debugLoading){e.debugLoading=!0;try{const[t,n,s,i]=await Promise.all([e.client.request("status",{}),e.client.request("health",{}),e.client.request("models.list",{}),e.client.request("last-heartbeat",{})]);e.debugStatus=t,e.debugHealth=n;const a=s;e.debugModels=Array.isArray(a?.models)?a?.models:[],e.debugHeartbeat=i}catch(t){e.debugCallError=String(t)}finally{e.debugLoading=!1}}}async function Wd(e){if(!(!e.client||!e.connected)){e.debugCallError=null,e.debugCallResult=null;try{const t=e.debugCallParams.trim()?JSON.parse(e.debugCallParams):{},n=await e.client.request(e.debugCallMethod.trim(),t);e.debugCallResult=JSON.stringify(n,null,2)}catch(t){e.debugCallError=String(t)}}}const qd=2e3,Vd=new Set(["trace","debug","info","warn","error","fatal"]);function Gd(e){if(typeof e!="string")return null;const t=e.trim();if(!t.startsWith("{")||!t.endsWith("}"))return null;try{const n=JSON.parse(t);return!n||typeof n!="object"?null:n}catch{return null}}function Qd(e){if(typeof e!="string")return null;const t=e.toLowerCase();return Vd.has(t)?t:null}function Yd(e){if(!e.trim())return{raw:e,message:e};try{const t=JSON.parse(e),n=t&&typeof t._meta=="object"&&t._meta!==null?t._meta:null,s=typeof t.time=="string"?t.time:typeof n?.date=="string"?n?.date:null,i=Qd(n?.logLevelName??n?.level),a=typeof t[0]=="string"?t[0]:typeof n?.name=="string"?n?.name:null,o=Gd(a);let r=null;o&&(typeof o.subsystem=="string"?r=o.subsystem:typeof o.module=="string"&&(r=o.module)),!r&&a&&a.length<120&&(r=a);let c=null;return typeof t[1]=="string"?c=t[1]:!o&&typeof t[0]=="string"?c=t[0]:typeof t.message=="string"&&(c=t.message),{raw:e,time:s,level:i,subsystem:r,message:c??e,meta:n??void 0}}catch{return{raw:e,message:e}}}async function Ji(e,t){if(!(!e.client||!e.connected)&&!(e.logsLoading&&!t?.quiet)){t?.quiet||(e.logsLoading=!0),e.logsError=null;try{const s=await e.client.request("logs.tail",{cursor:t?.reset?void 0:e.logsCursor??void 0,limit:e.logsLimit,maxBytes:e.logsMaxBytes}),a=(Array.isArray(s.lines)?s.lines.filter(r=>typeof r=="string"):[]).map(Yd),o=!!(t?.reset||s.reset||e.logsCursor==null);e.logsEntries=o?a:[...e.logsEntries,...a].slice(-qd),typeof s.cursor=="number"&&(e.logsCursor=s.cursor),typeof s.file=="string"&&(e.logsFile=s.file),e.logsTruncated=!!s.truncated,e.logsLastFetchAt=Date.now()}catch(n){e.logsError=String(n)}finally{t?.quiet||(e.logsLoading=!1)}}}async function Cs(e,t){if(!(!e.client||!e.connected)&&!e.nodesLoading){e.nodesLoading=!0,t?.quiet||(e.lastError=null);try{const n=await e.client.request("node.list",{});e.nodes=Array.isArray(n.nodes)?n.nodes:[]}catch(n){t?.quiet||(e.lastError=String(n))}finally{e.nodesLoading=!1}}}function Zd(e){e.nodesPollInterval==null&&(e.nodesPollInterval=window.setInterval(()=>{Cs(e,{quiet:!0})},5e3))}function Jd(e){e.nodesPollInterval!=null&&(clearInterval(e.nodesPollInterval),e.nodesPollInterval=null)}function Xi(e){e.logsPollInterval==null&&(e.logsPollInterval=window.setInterval(()=>{e.tab==="logs"&&Ji(e,{quiet:!0})},2e3))}function ea(e){e.logsPollInterval!=null&&(clearInterval(e.logsPollInterval),e.logsPollInterval=null)}function ta(e){e.debugPollInterval==null&&(e.debugPollInterval=window.setInterval(()=>{e.tab==="debug"&&As(e)},3e3))}function na(e){e.debugPollInterval!=null&&(clearInterval(e.debugPollInterval),e.debugPollInterval=null)}async function Jr(e,t){if(!(!e.client||!e.connected||e.agentIdentityLoading)&&!e.agentIdentityById[t]){e.agentIdentityLoading=!0,e.agentIdentityError=null;try{const n=await e.client.request("agent.identity.get",{agentId:t});n&&(e.agentIdentityById={...e.agentIdentityById,[t]:n})}catch(n){e.agentIdentityError=String(n)}finally{e.agentIdentityLoading=!1}}}async function Xr(e,t){if(!e.client||!e.connected||e.agentIdentityLoading)return;const n=t.filter(s=>!e.agentIdentityById[s]);if(n.length!==0){e.agentIdentityLoading=!0,e.agentIdentityError=null;try{for(const s of n){const i=await e.client.request("agent.identity.get",{agentId:s});i&&(e.agentIdentityById={...e.agentIdentityById,[s]:i})}}catch(s){e.agentIdentityError=String(s)}finally{e.agentIdentityLoading=!1}}}async function ss(e,t){if(!(!e.client||!e.connected)&&!e.agentSkillsLoading){e.agentSkillsLoading=!0,e.agentSkillsError=null;try{const n=await e.client.request("skills.status",{agentId:t});n&&(e.agentSkillsReport=n,e.agentSkillsAgentId=t)}catch(n){e.agentSkillsError=String(n)}finally{e.agentSkillsLoading=!1}}}async function sa(e){if(!(!e.client||!e.connected)&&!e.agentsLoading){e.agentsLoading=!0,e.agentsError=null;try{const t=await e.client.request("agents.list",{});if(t){e.agentsList=t;const n=e.agentsSelectedId,s=t.agents.some(i=>i.id===n);(!n||!s)&&(e.agentsSelectedId=t.defaultId??t.agents[0]?.id??null)}}catch(t){e.agentsError=String(t)}finally{e.agentsLoading=!1}}}function ia(e,t){if(e==null||!Number.isFinite(e)||e<=0)return;if(e<1e3)return`${Math.round(e)}ms`;const n=t?.spaced?" ":"",s=Math.round(e/1e3),i=Math.floor(s/3600),a=Math.floor(s%3600/60),o=s%60;if(i>=24){const r=Math.floor(i/24),c=i%24;return c>0?`${r}d${n}${c}h`:`${r}d`}return i>0?a>0?`${i}h${n}${a}m`:`${i}h`:a>0?o>0?`${a}m${n}${o}s`:`${a}m`:`${o}s`}function aa(e,t="n/a"){if(e==null||!Number.isFinite(e)||e<0)return t;if(e<1e3)return`${Math.round(e)}ms`;const n=Math.round(e/1e3);if(n<60)return`${n}s`;const s=Math.round(n/60);if(s<60)return`${s}m`;const i=Math.round(s/60);return i<24?`${i}h`:`${Math.round(i/24)}d`}function ee(e,t){const n=t?.fallback??"n/a";if(e==null||!Number.isFinite(e))return n;const s=Date.now()-e,i=Math.abs(s),a=s>=0,o=Math.round(i/1e3);if(o<60)return a?"just now":"in <1m";const r=Math.round(o/60);if(r<60)return a?`${r}m ago`:`in ${r}m`;const c=Math.round(r/60);if(c<48)return a?`${c}h ago`:`in ${c}h`;const d=Math.round(c/24);return a?`${d}d ago`:`in ${d}d`}const Xd=/<\s*\/?\s*(?:think(?:ing)?|thought|antthinking|final)\b/i,Un=/<\s*\/?\s*final\b[^<>]*>/gi,mo=/<\s*(\/?)\s*(?:think(?:ing)?|thought|antthinking)\b[^<>]*>/gi;function bo(e){const t=[],n=/(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;for(const i of e.matchAll(n)){const a=(i.index??0)+i[1].length;t.push({start:a,end:a+i[0].length-i[1].length})}const s=/`+[^`]+`+/g;for(const i of e.matchAll(s)){const a=i.index??0,o=a+i[0].length;t.some(c=>a>=c.start&&o<=c.end)||t.push({start:a,end:o})}return t.sort((i,a)=>i.start-a.start),t}function yo(e,t){return t.some(n=>e>=n.start&&e<n.end)}function eu(e,t){return e.trimStart()}function tu(e,t){if(!e||!Xd.test(e))return e;let n=e;if(Un.test(n)){Un.lastIndex=0;const r=[],c=bo(n);for(const d of n.matchAll(Un)){const g=d.index??0;r.push({start:g,length:d[0].length,inCode:yo(g,c)})}for(let d=r.length-1;d>=0;d--){const g=r[d];g.inCode||(n=n.slice(0,g.start)+n.slice(g.start+g.length))}}else Un.lastIndex=0;const s=bo(n);mo.lastIndex=0;let i="",a=0,o=!1;for(const r of n.matchAll(mo)){const c=r.index??0,d=r[1]==="/";yo(c,s)||(o?d&&(o=!1):(i+=n.slice(a,c),d||(o=!0)),a=c+r[0].length)}return i+=n.slice(a),eu(i)}function Ot(e){return!e&&e!==0?"n/a":new Date(e).toLocaleString()}function $i(e){return!e||e.length===0?"none":e.filter(t=>!!(t&&t.trim())).join(", ")}function wi(e,t=120){return e.length<=t?e:`${e.slice(0,Math.max(0,t-1))}…`}function el(e,t){return e.length<=t?{text:e,truncated:!1,total:e.length}:{text:e.slice(0,Math.max(0,t)),truncated:!0,total:e.length}}function ds(e,t){const n=Number(e);return Number.isFinite(n)?n:t}function Ys(e){return tu(e)}function nu(e){return e.sessionTarget==="isolated"&&e.payloadKind==="agentTurn"}function tl(e){return e.deliveryMode!=="announce"||nu(e)?e:{...e,deliveryMode:"none"}}async function Pn(e){if(!(!e.client||!e.connected))try{const t=await e.client.request("cron.status",{});e.cronStatus=t}catch(t){e.cronError=String(t)}}async function Ts(e){if(!(!e.client||!e.connected)&&!e.cronLoading){e.cronLoading=!0,e.cronError=null;try{const t=await e.client.request("cron.list",{includeDisabled:!0});e.cronJobs=Array.isArray(t.jobs)?t.jobs:[]}catch(t){e.cronError=String(t)}finally{e.cronLoading=!1}}}function su(e){if(e.scheduleKind==="at"){const n=Date.parse(e.scheduleAt);if(!Number.isFinite(n))throw new Error("Invalid run time.");return{kind:"at",at:new Date(n).toISOString()}}if(e.scheduleKind==="every"){const n=ds(e.everyAmount,0);if(n<=0)throw new Error("Invalid interval amount.");const s=e.everyUnit;return{kind:"every",everyMs:n*(s==="minutes"?6e4:s==="hours"?36e5:864e5)}}const t=e.cronExpr.trim();if(!t)throw new Error("Cron expression required.");return{kind:"cron",expr:t,tz:e.cronTz.trim()||void 0}}function iu(e){if(e.payloadKind==="systemEvent"){const i=e.payloadText.trim();if(!i)throw new Error("System event text required.");return{kind:"systemEvent",text:i}}const t=e.payloadText.trim();if(!t)throw new Error("Agent message required.");const n={kind:"agentTurn",message:t},s=ds(e.timeoutSeconds,0);return s>0&&(n.timeoutSeconds=s),n}async function au(e){if(!(!e.client||!e.connected||e.cronBusy)){e.cronBusy=!0,e.cronError=null;try{const t=tl(e.cronForm);t!==e.cronForm&&(e.cronForm=t);const n=su(t),s=iu(t),i=t.deliveryMode,a=i&&i!=="none"?{mode:i,channel:i==="announce"?t.deliveryChannel.trim()||"last":void 0,to:t.deliveryTo.trim()||void 0}:void 0,o=t.agentId.trim(),r={name:t.name.trim(),description:t.description.trim()||void 0,agentId:o||void 0,enabled:t.enabled,schedule:n,sessionTarget:t.sessionTarget,wakeMode:t.wakeMode,payload:s,delivery:a};if(!r.name)throw new Error("Name required.");await e.client.request("cron.add",r),e.cronForm={...e.cronForm,name:"",description:"",payloadText:""},await Ts(e),await Pn(e)}catch(t){e.cronError=String(t)}finally{e.cronBusy=!1}}}async function ou(e,t,n){if(!(!e.client||!e.connected||e.cronBusy)){e.cronBusy=!0,e.cronError=null;try{await e.client.request("cron.update",{id:t.id,patch:{enabled:n}}),await Ts(e),await Pn(e)}catch(s){e.cronError=String(s)}finally{e.cronBusy=!1}}}async function ru(e,t){if(!(!e.client||!e.connected||e.cronBusy)){e.cronBusy=!0,e.cronError=null;try{await e.client.request("cron.run",{id:t.id,mode:"force"}),await nl(e,t.id)}catch(n){e.cronError=String(n)}finally{e.cronBusy=!1}}}async function lu(e,t){if(!(!e.client||!e.connected||e.cronBusy)){e.cronBusy=!0,e.cronError=null;try{await e.client.request("cron.remove",{id:t.id}),e.cronRunsJobId===t.id&&(e.cronRunsJobId=null,e.cronRuns=[]),await Ts(e),await Pn(e)}catch(n){e.cronError=String(n)}finally{e.cronBusy=!1}}}async function nl(e,t){if(!(!e.client||!e.connected))try{const n=await e.client.request("cron.runs",{id:t,limit:50});e.cronRunsJobId=t,e.cronRuns=Array.isArray(n.entries)?n.entries:[]}catch(n){e.cronError=String(n)}}function oa(e){return e.trim()}function cu(e){if(!Array.isArray(e))return[];const t=new Set;for(const n of e){const s=n.trim();s&&t.add(s)}return[...t].toSorted()}const sl="openclaw.device.auth.v1";function ra(){try{const e=window.localStorage.getItem(sl);if(!e)return null;const t=JSON.parse(e);return!t||t.version!==1||!t.deviceId||typeof t.deviceId!="string"||!t.tokens||typeof t.tokens!="object"?null:t}catch{return null}}function il(e){try{window.localStorage.setItem(sl,JSON.stringify(e))}catch{}}function du(e){const t=ra();if(!t||t.deviceId!==e.deviceId)return null;const n=oa(e.role),s=t.tokens[n];return!s||typeof s.token!="string"?null:s}function al(e){const t=oa(e.role),n={version:1,deviceId:e.deviceId,tokens:{}},s=ra();s&&s.deviceId===e.deviceId&&(n.tokens={...s.tokens});const i={token:e.token,role:t,scopes:cu(e.scopes),updatedAtMs:Date.now()};return n.tokens[t]=i,il(n),i}function ol(e){const t=ra();if(!t||t.deviceId!==e.deviceId)return;const n=oa(e.role);if(!t.tokens[n])return;const s={...t,tokens:{...t.tokens}};delete s.tokens[n],il(s)}const rl={p:0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffedn,n:0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3edn,h:8n,a:0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffecn,d:0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3n,Gx:0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51an,Gy:0x6666666666666666666666666666666666666666666666666666666666666658n},{p:xe,n:is,Gx:xo,Gy:$o,a:Zs,d:Js,h:uu}=rl,Bt=32,la=64,gu=(...e)=>{"captureStackTrace"in Error&&typeof Error.captureStackTrace=="function"&&Error.captureStackTrace(...e)},fe=(e="")=>{const t=new Error(e);throw gu(t,fe),t},pu=e=>typeof e=="bigint",fu=e=>typeof e=="string",hu=e=>e instanceof Uint8Array||ArrayBuffer.isView(e)&&e.constructor.name==="Uint8Array",yt=(e,t,n="")=>{const s=hu(e),i=e?.length,a=t!==void 0;if(!s||a&&i!==t){const o=n&&`"${n}" `,r=a?` of length ${t}`:"",c=s?`length=${i}`:`type=${typeof e}`;fe(o+"expected Uint8Array"+r+", got "+c)}return e},_s=e=>new Uint8Array(e),ll=e=>Uint8Array.from(e),cl=(e,t)=>e.toString(16).padStart(t,"0"),dl=e=>Array.from(yt(e)).map(t=>cl(t,2)).join(""),tt={_0:48,_9:57,A:65,F:70,a:97,f:102},wo=e=>{if(e>=tt._0&&e<=tt._9)return e-tt._0;if(e>=tt.A&&e<=tt.F)return e-(tt.A-10);if(e>=tt.a&&e<=tt.f)return e-(tt.a-10)},ul=e=>{const t="hex invalid";if(!fu(e))return fe(t);const n=e.length,s=n/2;if(n%2)return fe(t);const i=_s(s);for(let a=0,o=0;a<s;a++,o+=2){const r=wo(e.charCodeAt(o)),c=wo(e.charCodeAt(o+1));if(r===void 0||c===void 0)return fe(t);i[a]=r*16+c}return i},gl=()=>globalThis?.crypto,vu=()=>gl()?.subtle??fe("crypto.subtle must be defined, consider polyfill"),Ln=(...e)=>{const t=_s(e.reduce((s,i)=>s+yt(i).length,0));let n=0;return e.forEach(s=>{t.set(s,n),n+=s.length}),t},mu=(e=Bt)=>gl().getRandomValues(_s(e)),us=BigInt,Et=(e,t,n,s="bad number: out of range")=>pu(e)&&t<=e&&e<n?e:fe(s),N=(e,t=xe)=>{const n=e%t;return n>=0n?n:t+n},pl=e=>N(e,is),bu=(e,t)=>{(e===0n||t<=0n)&&fe("no inverse n="+e+" mod="+t);let n=N(e,t),s=t,i=0n,a=1n;for(;n!==0n;){const o=s/n,r=s%n,c=i-a*o;s=n,n=r,i=a,a=c}return s===1n?N(i,t):fe("no inverse")},yu=e=>{const t=ml[e];return typeof t!="function"&&fe("hashes."+e+" not set"),t},Xs=e=>e instanceof Ie?e:fe("Point expected"),ki=2n**256n;class Ie{static BASE;static ZERO;X;Y;Z;T;constructor(t,n,s,i){const a=ki;this.X=Et(t,0n,a),this.Y=Et(n,0n,a),this.Z=Et(s,1n,a),this.T=Et(i,0n,a),Object.freeze(this)}static CURVE(){return rl}static fromAffine(t){return new Ie(t.x,t.y,1n,N(t.x*t.y))}static fromBytes(t,n=!1){const s=Js,i=ll(yt(t,Bt)),a=t[31];i[31]=a&-129;const o=hl(i);Et(o,0n,n?ki:xe);const c=N(o*o),d=N(c-1n),g=N(s*c+1n);let{isValid:p,value:h}=$u(d,g);p||fe("bad point: y not sqrt");const u=(h&1n)===1n,f=(a&128)!==0;return!n&&h===0n&&f&&fe("bad point: x==0, isLastByteOdd"),f!==u&&(h=N(-h)),new Ie(h,o,1n,N(h*o))}static fromHex(t,n){return Ie.fromBytes(ul(t),n)}get x(){return this.toAffine().x}get y(){return this.toAffine().y}assertValidity(){const t=Zs,n=Js,s=this;if(s.is0())return fe("bad point: ZERO");const{X:i,Y:a,Z:o,T:r}=s,c=N(i*i),d=N(a*a),g=N(o*o),p=N(g*g),h=N(c*t),u=N(g*N(h+d)),f=N(p+N(n*N(c*d)));if(u!==f)return fe("bad point: equation left != right (1)");const m=N(i*a),w=N(o*r);return m!==w?fe("bad point: equation left != right (2)"):this}equals(t){const{X:n,Y:s,Z:i}=this,{X:a,Y:o,Z:r}=Xs(t),c=N(n*r),d=N(a*i),g=N(s*r),p=N(o*i);return c===d&&g===p}is0(){return this.equals(Zt)}negate(){return new Ie(N(-this.X),this.Y,this.Z,N(-this.T))}double(){const{X:t,Y:n,Z:s}=this,i=Zs,a=N(t*t),o=N(n*n),r=N(2n*N(s*s)),c=N(i*a),d=t+n,g=N(N(d*d)-a-o),p=c+o,h=p-r,u=c-o,f=N(g*h),m=N(p*u),w=N(g*u),A=N(h*p);return new Ie(f,m,A,w)}add(t){const{X:n,Y:s,Z:i,T:a}=this,{X:o,Y:r,Z:c,T:d}=Xs(t),g=Zs,p=Js,h=N(n*o),u=N(s*r),f=N(a*p*d),m=N(i*c),w=N((n+s)*(o+r)-h-u),A=N(m-f),C=N(m+f),k=N(u-g*h),S=N(w*A),E=N(C*k),T=N(w*k),I=N(A*C);return new Ie(S,E,I,T)}subtract(t){return this.add(Xs(t).negate())}multiply(t,n=!0){if(!n&&(t===0n||this.is0()))return Zt;if(Et(t,1n,is),t===1n)return this;if(this.equals(zt))return Iu(t).p;let s=Zt,i=zt;for(let a=this;t>0n;a=a.double(),t>>=1n)t&1n?s=s.add(a):n&&(i=i.add(a));return s}multiplyUnsafe(t){return this.multiply(t,!1)}toAffine(){const{X:t,Y:n,Z:s}=this;if(this.equals(Zt))return{x:0n,y:1n};const i=bu(s,xe);N(s*i)!==1n&&fe("invalid inverse");const a=N(t*i),o=N(n*i);return{x:a,y:o}}toBytes(){const{x:t,y:n}=this.assertValidity().toAffine(),s=fl(n);return s[31]|=t&1n?128:0,s}toHex(){return dl(this.toBytes())}clearCofactor(){return this.multiply(us(uu),!1)}isSmallOrder(){return this.clearCofactor().is0()}isTorsionFree(){let t=this.multiply(is/2n,!1).double();return is%2n&&(t=t.add(this)),t.is0()}}const zt=new Ie(xo,$o,1n,N(xo*$o)),Zt=new Ie(0n,1n,1n,0n);Ie.BASE=zt;Ie.ZERO=Zt;const fl=e=>ul(cl(Et(e,0n,ki),la)).reverse(),hl=e=>us("0x"+dl(ll(yt(e)).reverse())),je=(e,t)=>{let n=e;for(;t-- >0n;)n*=n,n%=xe;return n},xu=e=>{const n=e*e%xe*e%xe,s=je(n,2n)*n%xe,i=je(s,1n)*e%xe,a=je(i,5n)*i%xe,o=je(a,10n)*a%xe,r=je(o,20n)*o%xe,c=je(r,40n)*r%xe,d=je(c,80n)*c%xe,g=je(d,80n)*c%xe,p=je(g,10n)*a%xe;return{pow_p_5_8:je(p,2n)*e%xe,b2:n}},ko=0x2b8324804fc1df0b2b4d00993dfbd7a72f431806ad2fe478c4ee1b274a0ea0b0n,$u=(e,t)=>{const n=N(t*t*t),s=N(n*n*t),i=xu(e*s).pow_p_5_8;let a=N(e*n*i);const o=N(t*a*a),r=a,c=N(a*ko),d=o===e,g=o===N(-e),p=o===N(-e*ko);return d&&(a=r),(g||p)&&(a=c),(N(a)&1n)===1n&&(a=N(-a)),{isValid:d||g,value:a}},Si=e=>pl(hl(e)),ca=(...e)=>ml.sha512Async(Ln(...e)),wu=(...e)=>yu("sha512")(Ln(...e)),vl=e=>{const t=e.slice(0,Bt);t[0]&=248,t[31]&=127,t[31]|=64;const n=e.slice(Bt,la),s=Si(t),i=zt.multiply(s),a=i.toBytes();return{head:t,prefix:n,scalar:s,point:i,pointBytes:a}},da=e=>ca(yt(e,Bt)).then(vl),ku=e=>vl(wu(yt(e,Bt))),Su=e=>da(e).then(t=>t.pointBytes),Au=e=>ca(e.hashable).then(e.finish),Cu=(e,t,n)=>{const{pointBytes:s,scalar:i}=e,a=Si(t),o=zt.multiply(a).toBytes();return{hashable:Ln(o,s,n),finish:d=>{const g=pl(a+Si(d)*i);return yt(Ln(o,fl(g)),la)}}},Tu=async(e,t)=>{const n=yt(e),s=await da(t),i=await ca(s.prefix,n);return Au(Cu(s,i,n))},ml={sha512Async:async e=>{const t=vu(),n=Ln(e);return _s(await t.digest("SHA-512",n.buffer))},sha512:void 0},_u=(e=mu(Bt))=>e,Eu={getExtendedPublicKeyAsync:da,getExtendedPublicKey:ku,randomSecretKey:_u},gs=8,Lu=256,bl=Math.ceil(Lu/gs)+1,Ai=2**(gs-1),Mu=()=>{const e=[];let t=zt,n=t;for(let s=0;s<bl;s++){n=t,e.push(n);for(let i=1;i<Ai;i++)n=n.add(t),e.push(n);t=n.double()}return e};let So;const Ao=(e,t)=>{const n=t.negate();return e?n:t},Iu=e=>{const t=So||(So=Mu());let n=Zt,s=zt;const i=2**gs,a=i,o=us(i-1),r=us(gs);for(let c=0;c<bl;c++){let d=Number(e&o);e>>=r,d>Ai&&(d-=a,e+=1n);const g=c*Ai,p=g,h=g+Math.abs(d)-1,u=c%2!==0,f=d<0;d===0?s=s.add(Ao(u,t[p])):n=n.add(Ao(f,t[h]))}return e!==0n&&fe("invalid wnaf"),{p:n,f:s}},ei="openclaw-device-identity-v1";function Ci(e){let t="";for(const n of e)t+=String.fromCharCode(n);return btoa(t).replaceAll("+","-").replaceAll("/","_").replace(/=+$/g,"")}function yl(e){const t=e.replaceAll("-","+").replaceAll("_","/"),n=t+"=".repeat((4-t.length%4)%4),s=atob(n),i=new Uint8Array(s.length);for(let a=0;a<s.length;a+=1)i[a]=s.charCodeAt(a);return i}function Ru(e){return Array.from(e).map(t=>t.toString(16).padStart(2,"0")).join("")}async function xl(e){const t=await crypto.subtle.digest("SHA-256",e.slice().buffer);return Ru(new Uint8Array(t))}async function Pu(){const e=Eu.randomSecretKey(),t=await Su(e);return{deviceId:await xl(t),publicKey:Ci(t),privateKey:Ci(e)}}async function ua(){try{const n=localStorage.getItem(ei);if(n){const s=JSON.parse(n);if(s?.version===1&&typeof s.deviceId=="string"&&typeof s.publicKey=="string"&&typeof s.privateKey=="string"){const i=await xl(yl(s.publicKey));if(i!==s.deviceId){const a={...s,deviceId:i};return localStorage.setItem(ei,JSON.stringify(a)),{deviceId:i,publicKey:s.publicKey,privateKey:s.privateKey}}return{deviceId:s.deviceId,publicKey:s.publicKey,privateKey:s.privateKey}}}}catch{}const e=await Pu(),t={version:1,deviceId:e.deviceId,publicKey:e.publicKey,privateKey:e.privateKey,createdAtMs:Date.now()};return localStorage.setItem(ei,JSON.stringify(t)),e}async function Du(e,t){const n=yl(e),s=new TextEncoder().encode(t),i=await Tu(s,n);return Ci(i)}async function xt(e,t){if(!(!e.client||!e.connected)&&!e.devicesLoading){e.devicesLoading=!0,t?.quiet||(e.devicesError=null);try{const n=await e.client.request("device.pair.list",{});e.devicesList={pending:Array.isArray(n?.pending)?n.pending:[],paired:Array.isArray(n?.paired)?n.paired:[]}}catch(n){t?.quiet||(e.devicesError=String(n))}finally{e.devicesLoading=!1}}}async function Fu(e,t){if(!(!e.client||!e.connected))try{await e.client.request("device.pair.approve",{requestId:t}),await xt(e)}catch(n){e.devicesError=String(n)}}async function Nu(e,t){if(!(!e.client||!e.connected||!window.confirm("Reject this device pairing request?")))try{await e.client.request("device.pair.reject",{requestId:t}),await xt(e)}catch(s){e.devicesError=String(s)}}async function Ou(e,t){if(!(!e.client||!e.connected))try{const n=await e.client.request("device.token.rotate",t);if(n?.token){const s=await ua(),i=n.role??t.role;(n.deviceId===s.deviceId||t.deviceId===s.deviceId)&&al({deviceId:s.deviceId,role:i,token:n.token,scopes:n.scopes??t.scopes??[]}),window.prompt("New device token (copy and store securely):",n.token)}await xt(e)}catch(n){e.devicesError=String(n)}}async function Bu(e,t){if(!(!e.client||!e.connected||!window.confirm(`Revoke token for ${t.deviceId} (${t.role})?`)))try{await e.client.request("device.token.revoke",t);const s=await ua();t.deviceId===s.deviceId&&ol({deviceId:s.deviceId,role:t.role}),await xt(e)}catch(s){e.devicesError=String(s)}}function zu(e){if(!e||e.kind==="gateway")return{method:"exec.approvals.get",params:{}};const t=e.nodeId.trim();return t?{method:"exec.approvals.node.get",params:{nodeId:t}}:null}function Uu(e,t){if(!e||e.kind==="gateway")return{method:"exec.approvals.set",params:t};const n=e.nodeId.trim();return n?{method:"exec.approvals.node.set",params:{...t,nodeId:n}}:null}async function ga(e,t){if(!(!e.client||!e.connected)&&!e.execApprovalsLoading){e.execApprovalsLoading=!0,e.lastError=null;try{const n=zu(t);if(!n){e.lastError="Select a node before loading exec approvals.";return}const s=await e.client.request(n.method,n.params);Hu(e,s)}catch(n){e.lastError=String(n)}finally{e.execApprovalsLoading=!1}}}function Hu(e,t){e.execApprovalsSnapshot=t,e.execApprovalsDirty||(e.execApprovalsForm=Nt(t.file??{}))}async function ju(e,t){if(!(!e.client||!e.connected)){e.execApprovalsSaving=!0,e.lastError=null;try{const n=e.execApprovalsSnapshot?.hash;if(!n){e.lastError="Exec approvals hash missing; reload and retry.";return}const s=e.execApprovalsForm??e.execApprovalsSnapshot?.file??{},i=Uu(t,{file:s,baseHash:n});if(!i){e.lastError="Select a node before saving exec approvals.";return}await e.client.request(i.method,i.params),e.execApprovalsDirty=!1,await ga(e,t)}catch(n){e.lastError=String(n)}finally{e.execApprovalsSaving=!1}}}function Ku(e,t,n){const s=Nt(e.execApprovalsForm??e.execApprovalsSnapshot?.file??{});jr(s,t,n),e.execApprovalsForm=s,e.execApprovalsDirty=!0}function Wu(e,t){const n=Nt(e.execApprovalsForm??e.execApprovalsSnapshot?.file??{});Kr(n,t),e.execApprovalsForm=n,e.execApprovalsDirty=!0}async function pa(e){if(!(!e.client||!e.connected)&&!e.presenceLoading){e.presenceLoading=!0,e.presenceError=null,e.presenceStatus=null;try{const t=await e.client.request("system-presence",{});Array.isArray(t)?(e.presenceEntries=t,e.presenceStatus=t.length===0?"No instances yet.":null):(e.presenceEntries=[],e.presenceStatus="No presence payload.")}catch(t){e.presenceError=String(t)}finally{e.presenceLoading=!1}}}async function Ht(e,t){if(!(!e.client||!e.connected)&&!e.sessionsLoading){e.sessionsLoading=!0,e.sessionsError=null;try{const n=t?.includeGlobal??e.sessionsIncludeGlobal,s=t?.includeUnknown??e.sessionsIncludeUnknown,i=t?.activeMinutes??ds(e.sessionsFilterActive,0),a=t?.limit??ds(e.sessionsFilterLimit,0),o={includeGlobal:n,includeUnknown:s};i>0&&(o.activeMinutes=i),a>0&&(o.limit=a);const r=await e.client.request("sessions.list",o);r&&(e.sessionsResult=r)}catch(n){e.sessionsError=String(n)}finally{e.sessionsLoading=!1}}}async function qu(e,t,n){if(!e.client||!e.connected)return;const s={key:t};"label"in n&&(s.label=n.label),"thinkingLevel"in n&&(s.thinkingLevel=n.thinkingLevel),"verboseLevel"in n&&(s.verboseLevel=n.verboseLevel),"reasoningLevel"in n&&(s.reasoningLevel=n.reasoningLevel);try{await e.client.request("sessions.patch",s),await Ht(e)}catch(i){e.sessionsError=String(i)}}async function Vu(e,t){if(!e.client||!e.connected||e.sessionsLoading||!window.confirm(`Delete session "${t}"?

Deletes the session entry and archives its transcript.`))return!1;e.sessionsLoading=!0,e.sessionsError=null;try{return await e.client.request("sessions.delete",{key:t,deleteTranscript:!0}),!0}catch(s){return e.sessionsError=String(s),!1}finally{e.sessionsLoading=!1}}async function Gu(e,t){return await Vu(e,t)?(await Ht(e),!0):!1}function tn(e,t,n){if(!t.trim())return;const s={...e.skillMessages};n?s[t]=n:delete s[t],e.skillMessages=s}function Es(e){return e instanceof Error?e.message:String(e)}async function Dn(e,t){if(t?.clearMessages&&Object.keys(e.skillMessages).length>0&&(e.skillMessages={}),!(!e.client||!e.connected)&&!e.skillsLoading){e.skillsLoading=!0,e.skillsError=null;try{const n=await e.client.request("skills.status",{});n&&(e.skillsReport=n)}catch(n){e.skillsError=Es(n)}finally{e.skillsLoading=!1}}}function Qu(e,t,n){e.skillEdits={...e.skillEdits,[t]:n}}async function Yu(e,t,n){if(!(!e.client||!e.connected)){e.skillsBusyKey=t,e.skillsError=null;try{await e.client.request("skills.update",{skillKey:t,enabled:n}),await Dn(e),tn(e,t,{kind:"success",message:n?"Skill enabled":"Skill disabled"})}catch(s){const i=Es(s);e.skillsError=i,tn(e,t,{kind:"error",message:i})}finally{e.skillsBusyKey=null}}}async function Zu(e,t){if(!(!e.client||!e.connected)){e.skillsBusyKey=t,e.skillsError=null;try{const n=e.skillEdits[t]??"";await e.client.request("skills.update",{skillKey:t,apiKey:n}),await Dn(e),tn(e,t,{kind:"success",message:"API key saved"})}catch(n){const s=Es(n);e.skillsError=s,tn(e,t,{kind:"error",message:s})}finally{e.skillsBusyKey=null}}}async function Ju(e,t,n,s){if(!(!e.client||!e.connected)){e.skillsBusyKey=t,e.skillsError=null;try{const i=await e.client.request("skills.install",{name:n,installId:s,timeoutMs:12e4});await Dn(e),tn(e,t,{kind:"success",message:i?.message??"Installed"})}catch(i){const a=Es(i);e.skillsError=a,tn(e,t,{kind:"error",message:a})}finally{e.skillsBusyKey=null}}}const Xu=[{label:"chat",tabs:["chat"]},{label:"control",tabs:["overview","channels","instances","sessions","usage","cron"]},{label:"agent",tabs:["agents","skills","nodes"]},{label:"settings",tabs:["config","debug","logs"]}],$l={agents:"/agents",overview:"/overview",channels:"/channels",instances:"/instances",sessions:"/sessions",usage:"/usage",cron:"/cron",skills:"/skills",nodes:"/nodes",chat:"/chat",config:"/config",debug:"/debug",logs:"/logs"},wl=new Map(Object.entries($l).map(([e,t])=>[t,e]));function sn(e){if(!e)return"";let t=e.trim();return t.startsWith("/")||(t=`/${t}`),t==="/"?"":(t.endsWith("/")&&(t=t.slice(0,-1)),t)}function Mn(e){if(!e)return"/";let t=e.trim();return t.startsWith("/")||(t=`/${t}`),t.length>1&&t.endsWith("/")&&(t=t.slice(0,-1)),t}function Ls(e,t=""){const n=sn(t),s=$l[e];return n?`${n}${s}`:s}function kl(e,t=""){const n=sn(t);let s=e||"/";n&&(s===n?s="/":s.startsWith(`${n}/`)&&(s=s.slice(n.length)));let i=Mn(s).toLowerCase();return i.endsWith("/index.html")&&(i="/"),i==="/"?"chat":wl.get(i)??null}function eg(e){let t=Mn(e);if(t.endsWith("/index.html")&&(t=Mn(t.slice(0,-11))),t==="/")return"";const n=t.split("/").filter(Boolean);if(n.length===0)return"";for(let s=0;s<n.length;s++){const i=`/${n.slice(s).join("/")}`.toLowerCase();if(wl.has(i)){const a=n.slice(0,s);return a.length?`/${a.join("/")}`:""}}return`/${n.join("/")}`}function tg(e){switch(e){case"agents":return"folder";case"chat":return"messageSquare";case"overview":return"barChart";case"channels":return"link";case"instances":return"radio";case"sessions":return"fileText";case"usage":return"barChart";case"cron":return"loader";case"skills":return"zap";case"nodes":return"monitor";case"config":return"settings";case"debug":return"bug";case"logs":return"scrollText";default:return"folder"}}function Ti(e){return P(`tabs.${e}`)}function ng(e){return P(`subtitles.${e}`)}const Sl="openclaw.control.settings.v1";function sg(){const t={gatewayUrl:`${location.protocol==="https:"?"wss":"ws"}://${location.host}`,token:"",sessionKey:"main",lastActiveSessionKey:"main",theme:"system",chatFocusMode:!1,chatShowThinking:!0,splitRatio:.6,navCollapsed:!1,navGroupsCollapsed:{}};try{const n=localStorage.getItem(Sl);if(!n)return t;const s=JSON.parse(n);return{gatewayUrl:typeof s.gatewayUrl=="string"&&s.gatewayUrl.trim()?s.gatewayUrl.trim():t.gatewayUrl,token:typeof s.token=="string"?s.token:t.token,sessionKey:typeof s.sessionKey=="string"&&s.sessionKey.trim()?s.sessionKey.trim():t.sessionKey,lastActiveSessionKey:typeof s.lastActiveSessionKey=="string"&&s.lastActiveSessionKey.trim()?s.lastActiveSessionKey.trim():typeof s.sessionKey=="string"&&s.sessionKey.trim()||t.lastActiveSessionKey,theme:s.theme==="light"||s.theme==="dark"||s.theme==="system"?s.theme:t.theme,chatFocusMode:typeof s.chatFocusMode=="boolean"?s.chatFocusMode:t.chatFocusMode,chatShowThinking:typeof s.chatShowThinking=="boolean"?s.chatShowThinking:t.chatShowThinking,splitRatio:typeof s.splitRatio=="number"&&s.splitRatio>=.4&&s.splitRatio<=.7?s.splitRatio:t.splitRatio,navCollapsed:typeof s.navCollapsed=="boolean"?s.navCollapsed:t.navCollapsed,navGroupsCollapsed:typeof s.navGroupsCollapsed=="object"&&s.navGroupsCollapsed!==null?s.navGroupsCollapsed:t.navGroupsCollapsed,locale:Yi(s.locale)?s.locale:void 0}}catch{return t}}function ig(e){localStorage.setItem(Sl,JSON.stringify(e))}const Hn=e=>Number.isNaN(e)?.5:e<=0?0:e>=1?1:e,ag=()=>typeof window>"u"||typeof window.matchMedia!="function"?!1:window.matchMedia("(prefers-reduced-motion: reduce)").matches??!1,jn=e=>{e.classList.remove("theme-transition"),e.style.removeProperty("--theme-switch-x"),e.style.removeProperty("--theme-switch-y")},og=({nextTheme:e,applyTheme:t,context:n,currentTheme:s})=>{if(s===e)return;const i=globalThis.document??null;if(!i){t();return}const a=i.documentElement,o=i,r=ag();if(!!o.startViewTransition&&!r){let d=.5,g=.5;if(n?.pointerClientX!==void 0&&n?.pointerClientY!==void 0&&typeof window<"u")d=Hn(n.pointerClientX/window.innerWidth),g=Hn(n.pointerClientY/window.innerHeight);else if(n?.element){const p=n.element.getBoundingClientRect();p.width>0&&p.height>0&&typeof window<"u"&&(d=Hn((p.left+p.width/2)/window.innerWidth),g=Hn((p.top+p.height/2)/window.innerHeight))}a.style.setProperty("--theme-switch-x",`${d*100}%`),a.style.setProperty("--theme-switch-y",`${g*100}%`),a.classList.add("theme-transition");try{const p=o.startViewTransition?.(()=>{t()});p?.finished?p.finished.finally(()=>jn(a)):jn(a)}catch{jn(a),t()}return}t(),jn(a)};function rg(){return typeof window>"u"||typeof window.matchMedia!="function"||window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}function fa(e){return e==="system"?rg():e}function mt(e,t){const n={...t,lastActiveSessionKey:t.lastActiveSessionKey?.trim()||t.sessionKey.trim()||"main"};e.settings=n,ig(n),t.theme!==e.theme&&(e.theme=t.theme,Ms(e,fa(t.theme))),e.applySessionKey=e.settings.lastActiveSessionKey}function Al(e,t){const n=t.trim();n&&e.settings.lastActiveSessionKey!==n&&mt(e,{...e.settings,lastActiveSessionKey:n})}function lg(e){if(!window.location.search&&!window.location.hash)return;const t=new URL(window.location.href),n=new URLSearchParams(t.search),s=new URLSearchParams(t.hash.startsWith("#")?t.hash.slice(1):t.hash),i=n.get("token")??s.get("token"),a=n.get("password")??s.get("password"),o=n.get("session")??s.get("session"),r=n.get("gatewayUrl")??s.get("gatewayUrl");let c=!1;if(i!=null){const g=i.trim();g&&g!==e.settings.token&&mt(e,{...e.settings,token:g}),n.delete("token"),s.delete("token"),c=!0}if(a!=null&&(n.delete("password"),s.delete("password"),c=!0),o!=null){const g=o.trim();g&&(e.sessionKey=g,mt(e,{...e.settings,sessionKey:g,lastActiveSessionKey:g}))}if(r!=null){const g=r.trim();g&&g!==e.settings.gatewayUrl&&(e.pendingGatewayUrl=g),n.delete("gatewayUrl"),s.delete("gatewayUrl"),c=!0}if(!c)return;t.search=n.toString();const d=s.toString();t.hash=d?`#${d}`:"",window.history.replaceState({},"",t.toString())}function cg(e,t){e.tab!==t&&(e.tab=t),t==="chat"&&(e.chatHasAutoScrolled=!1),t==="logs"?Xi(e):ea(e),t==="debug"?ta(e):na(e),ha(e),Tl(e,t,!1)}function dg(e,t,n){og({nextTheme:t,applyTheme:()=>{e.theme=t,mt(e,{...e.settings,theme:t}),Ms(e,fa(t))},context:n,currentTheme:e.theme})}async function ha(e){if(e.tab==="overview"&&await _l(e),e.tab==="channels"&&await bg(e),e.tab==="instances"&&await pa(e),e.tab==="sessions"&&await Ht(e),e.tab==="cron"&&await ps(e),e.tab==="skills"&&await Dn(e),e.tab==="agents"){await sa(e),await Be(e);const t=e.agentsList?.agents?.map(s=>s.id)??[];t.length>0&&Xr(e,t);const n=e.agentsSelectedId??e.agentsList?.defaultId??e.agentsList?.agents?.[0]?.id;n&&(Jr(e,n),e.agentsPanel==="skills"&&ss(e,n),e.agentsPanel==="channels"&&Te(e,!1),e.agentsPanel==="cron"&&ps(e))}e.tab==="nodes"&&(await Cs(e),await xt(e),await Be(e),await ga(e)),e.tab==="chat"&&(await Dl(e),Rn(e,!e.chatHasAutoScrolled)),e.tab==="config"&&(await Wr(e),await Be(e)),e.tab==="debug"&&(await As(e),e.eventLog=e.eventLogBuffer),e.tab==="logs"&&(e.logsAtBottom=!0,await Ji(e,{reset:!0}),Zr(e,!0))}function ug(){if(typeof window>"u")return"";const e=window.__OPENCLAW_CONTROL_UI_BASE_PATH__;return typeof e=="string"&&e.trim()?sn(e):eg(window.location.pathname)}function gg(e){e.theme=e.settings.theme??"system",Ms(e,fa(e.theme))}function Ms(e,t){if(e.themeResolved=t,typeof document>"u")return;const n=document.documentElement;n.dataset.theme=t,n.style.colorScheme=t}function pg(e){if(typeof window>"u"||typeof window.matchMedia!="function")return;if(e.themeMedia=window.matchMedia("(prefers-color-scheme: dark)"),e.themeMediaHandler=n=>{e.theme==="system"&&Ms(e,n.matches?"dark":"light")},typeof e.themeMedia.addEventListener=="function"){e.themeMedia.addEventListener("change",e.themeMediaHandler);return}e.themeMedia.addListener(e.themeMediaHandler)}function fg(e){if(!e.themeMedia||!e.themeMediaHandler)return;if(typeof e.themeMedia.removeEventListener=="function"){e.themeMedia.removeEventListener("change",e.themeMediaHandler);return}e.themeMedia.removeListener(e.themeMediaHandler),e.themeMedia=null,e.themeMediaHandler=null}function hg(e,t){if(typeof window>"u")return;const n=kl(window.location.pathname,e.basePath)??"chat";Cl(e,n),Tl(e,n,t)}function vg(e){if(typeof window>"u")return;const t=kl(window.location.pathname,e.basePath);if(!t)return;const s=new URL(window.location.href).searchParams.get("session")?.trim();s&&(e.sessionKey=s,mt(e,{...e.settings,sessionKey:s,lastActiveSessionKey:s})),Cl(e,t)}function Cl(e,t){e.tab!==t&&(e.tab=t),t==="chat"&&(e.chatHasAutoScrolled=!1),t==="logs"?Xi(e):ea(e),t==="debug"?ta(e):na(e),e.connected&&ha(e)}function Tl(e,t,n){if(typeof window>"u")return;const s=Mn(Ls(t,e.basePath)),i=Mn(window.location.pathname),a=new URL(window.location.href);t==="chat"&&e.sessionKey?a.searchParams.set("session",e.sessionKey):a.searchParams.delete("session"),i!==s&&(a.pathname=s),n?window.history.replaceState({},"",a.toString()):window.history.pushState({},"",a.toString())}function mg(e,t,n){if(typeof window>"u")return;const s=new URL(window.location.href);s.searchParams.set("session",t),window.history.replaceState({},"",s.toString())}async function _l(e){await Promise.all([Te(e,!1),pa(e),Ht(e),Pn(e),As(e)])}async function bg(e){await Promise.all([Te(e,!0),Wr(e),Be(e)])}async function ps(e){await Promise.all([Te(e,!1),Pn(e),Ts(e)])}const Co=50,yg=80,xg=12e4;function $g(e){if(!e||typeof e!="object")return null;const t=e;if(typeof t.text=="string")return t.text;const n=t.content;if(!Array.isArray(n))return null;const s=n.map(i=>{if(!i||typeof i!="object")return null;const a=i;return a.type==="text"&&typeof a.text=="string"?a.text:null}).filter(i=>!!i);return s.length===0?null:s.join(`
`)}function To(e){if(e==null)return null;if(typeof e=="number"||typeof e=="boolean")return String(e);const t=$g(e);let n;if(typeof e=="string")n=e;else if(t)n=t;else try{n=JSON.stringify(e,null,2)}catch{n=String(e)}const s=el(n,xg);return s.truncated?`${s.text}

… truncated (${s.total} chars, showing first ${s.text.length}).`:s.text}function wg(e){const t=[];return t.push({type:"toolcall",name:e.name,arguments:e.args??{}}),e.output&&t.push({type:"toolresult",name:e.name,text:e.output}),{role:"assistant",toolCallId:e.toolCallId,runId:e.runId,content:t,timestamp:e.startedAt}}function kg(e){if(e.toolStreamOrder.length<=Co)return;const t=e.toolStreamOrder.length-Co,n=e.toolStreamOrder.splice(0,t);for(const s of n)e.toolStreamById.delete(s)}function Sg(e){e.chatToolMessages=e.toolStreamOrder.map(t=>e.toolStreamById.get(t)?.message).filter(t=>!!t)}function _i(e){e.toolStreamSyncTimer!=null&&(clearTimeout(e.toolStreamSyncTimer),e.toolStreamSyncTimer=null),Sg(e)}function Ag(e,t=!1){if(t){_i(e);return}e.toolStreamSyncTimer==null&&(e.toolStreamSyncTimer=window.setTimeout(()=>_i(e),yg))}function Is(e){e.toolStreamById.clear(),e.toolStreamOrder=[],e.chatToolMessages=[],_i(e)}const Cg=5e3;function Tg(e,t){const n=t.data??{},s=typeof n.phase=="string"?n.phase:"";e.compactionClearTimer!=null&&(window.clearTimeout(e.compactionClearTimer),e.compactionClearTimer=null),s==="start"?e.compactionStatus={active:!0,startedAt:Date.now(),completedAt:null}:s==="end"&&(e.compactionStatus={active:!1,startedAt:e.compactionStatus?.startedAt??null,completedAt:Date.now()},e.compactionClearTimer=window.setTimeout(()=>{e.compactionStatus=null,e.compactionClearTimer=null},Cg))}function _g(e,t){if(!t)return;if(t.stream==="compaction"){Tg(e,t);return}if(t.stream!=="tool")return;const n=typeof t.sessionKey=="string"?t.sessionKey:void 0;if(n&&n!==e.sessionKey||!n&&e.chatRunId&&t.runId!==e.chatRunId||e.chatRunId&&t.runId!==e.chatRunId||!e.chatRunId)return;const s=t.data??{},i=typeof s.toolCallId=="string"?s.toolCallId:"";if(!i)return;const a=typeof s.name=="string"?s.name:"tool",o=typeof s.phase=="string"?s.phase:"",r=o==="start"?s.args:void 0,c=o==="update"?To(s.partialResult):o==="result"?To(s.result):void 0,d=Date.now();let g=e.toolStreamById.get(i);g?(g.name=a,r!==void 0&&(g.args=r),c!==void 0&&(g.output=c||void 0),g.updatedAt=d):(g={toolCallId:i,runId:t.runId,sessionKey:n,name:a,args:r,output:c||void 0,startedAt:typeof t.ts=="number"?t.ts:d,updatedAt:d,message:{}},e.toolStreamById.set(i,g),e.toolStreamOrder.push(i)),g.message=wg(g),kg(e),Ag(e,o==="result")}const Eg=/^\[([^\]]+)\]\s*/,Lg=["WebChat","WhatsApp","Telegram","Signal","Slack","Discord","Google Chat","iMessage","Teams","Matrix","Zalo","Zalo Personal","BlueBubbles"];function Mg(e){return/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z\b/.test(e)||/\d{4}-\d{2}-\d{2} \d{2}:\d{2}\b/.test(e)?!0:Lg.some(t=>e.startsWith(`${t} `))}function ti(e){const t=e.match(Eg);if(!t)return e;const n=t[1]??"";return Mg(n)?e.slice(t[0].length):e}const ni=new WeakMap,si=new WeakMap;function fs(e){const t=e,n=typeof t.role=="string"?t.role:"",s=t.content;if(typeof s=="string")return n==="assistant"?Ys(s):ti(s);if(Array.isArray(s)){const i=s.map(a=>{const o=a;return o.type==="text"&&typeof o.text=="string"?o.text:null}).filter(a=>typeof a=="string");if(i.length>0){const a=i.join(`
`);return n==="assistant"?Ys(a):ti(a)}}return typeof t.text=="string"?n==="assistant"?Ys(t.text):ti(t.text):null}function El(e){if(!e||typeof e!="object")return fs(e);const t=e;if(ni.has(t))return ni.get(t)??null;const n=fs(e);return ni.set(t,n),n}function _o(e){const n=e.content,s=[];if(Array.isArray(n))for(const r of n){const c=r;if(c.type==="thinking"&&typeof c.thinking=="string"){const d=c.thinking.trim();d&&s.push(d)}}if(s.length>0)return s.join(`
`);const i=Rg(e);if(!i)return null;const o=[...i.matchAll(/<\s*think(?:ing)?\s*>([\s\S]*?)<\s*\/\s*think(?:ing)?\s*>/gi)].map(r=>(r[1]??"").trim()).filter(Boolean);return o.length>0?o.join(`
`):null}function Ig(e){if(!e||typeof e!="object")return _o(e);const t=e;if(si.has(t))return si.get(t)??null;const n=_o(e);return si.set(t,n),n}function Rg(e){const t=e,n=t.content;if(typeof n=="string")return n;if(Array.isArray(n)){const s=n.map(i=>{const a=i;return a.type==="text"&&typeof a.text=="string"?a.text:null}).filter(i=>typeof i=="string");if(s.length>0)return s.join(`
`)}return typeof t.text=="string"?t.text:null}function Pg(e){const t=e.trim();if(!t)return"";const n=t.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).map(s=>`_${s}_`);return n.length?["_Reasoning:_",...n].join(`
`):""}let Eo=!1;function Lo(e){e[6]=e[6]&15|64,e[8]=e[8]&63|128;let t="";for(let n=0;n<e.length;n++)t+=e[n].toString(16).padStart(2,"0");return`${t.slice(0,8)}-${t.slice(8,12)}-${t.slice(12,16)}-${t.slice(16,20)}-${t.slice(20)}`}function Dg(){const e=new Uint8Array(16),t=Date.now();for(let n=0;n<e.length;n++)e[n]=Math.floor(Math.random()*256);return e[0]^=t&255,e[1]^=t>>>8&255,e[2]^=t>>>16&255,e[3]^=t>>>24&255,e}function Fg(){Eo||(Eo=!0,console.warn("[uuid] crypto API missing; falling back to weak randomness"))}function va(e=globalThis.crypto){if(e&&typeof e.randomUUID=="function")return e.randomUUID();if(e&&typeof e.getRandomValues=="function"){const t=new Uint8Array(16);return e.getRandomValues(t),Lo(t)}return Fg(),Lo(Dg())}async function Xt(e){if(!(!e.client||!e.connected)){e.chatLoading=!0,e.lastError=null;try{const t=await e.client.request("chat.history",{sessionKey:e.sessionKey,limit:200});e.chatMessages=Array.isArray(t.messages)?t.messages:[],e.chatThinkingLevel=t.thinkingLevel??null}catch(t){e.lastError=String(t)}finally{e.chatLoading=!1}}}function Ng(e){const t=/^data:([^;]+);base64,(.+)$/.exec(e);return t?{mimeType:t[1],content:t[2]}:null}function Og(e){if(!e||typeof e!="object")return null;const t=e;return t.role!=="assistant"||!("content"in t)||!Array.isArray(t.content)?null:t}async function Bg(e,t,n){if(!e.client||!e.connected)return null;const s=t.trim(),i=n&&n.length>0;if(!s&&!i)return null;const a=Date.now(),o=[];if(s&&o.push({type:"text",text:s}),i)for(const d of n)o.push({type:"image",source:{type:"base64",media_type:d.mimeType,data:d.dataUrl}});e.chatMessages=[...e.chatMessages,{role:"user",content:o,timestamp:a}],e.chatSending=!0,e.lastError=null;const r=va();e.chatRunId=r,e.chatStream="",e.chatStreamStartedAt=a;const c=i?n.map(d=>{const g=Ng(d.dataUrl);return g?{type:"image",mimeType:g.mimeType,content:g.content}:null}).filter(d=>d!==null):void 0;try{return await e.client.request("chat.send",{sessionKey:e.sessionKey,message:s,deliver:!1,idempotencyKey:r,attachments:c}),r}catch(d){const g=String(d);return e.chatRunId=null,e.chatStream=null,e.chatStreamStartedAt=null,e.lastError=g,e.chatMessages=[...e.chatMessages,{role:"assistant",content:[{type:"text",text:"Error: "+g}],timestamp:Date.now()}],null}finally{e.chatSending=!1}}async function zg(e){if(!e.client||!e.connected)return!1;const t=e.chatRunId;try{return await e.client.request("chat.abort",t?{sessionKey:e.sessionKey,runId:t}:{sessionKey:e.sessionKey}),!0}catch(n){return e.lastError=String(n),!1}}function Ug(e,t){if(!t||t.sessionKey!==e.sessionKey)return null;if(t.runId&&e.chatRunId&&t.runId!==e.chatRunId)return t.state==="final"?"final":null;if(t.state==="delta"){const n=fs(t.message);if(typeof n=="string"){const s=e.chatStream??"";(!s||n.length>=s.length)&&(e.chatStream=n)}}else if(t.state==="final"){const n=fs(t.message);typeof n=="string"&&n.trim()&&ne.speak(n),e.chatStream=null,e.chatRunId=null,e.chatStreamStartedAt=null}else if(t.state==="aborted"){const n=Og(t.message);if(n)e.chatMessages=[...e.chatMessages,n];else{const s=e.chatStream??"";s.trim()&&(e.chatMessages=[...e.chatMessages,{role:"assistant",content:[{type:"text",text:s}],timestamp:Date.now()}])}e.chatStream=null,e.chatRunId=null,e.chatStreamStartedAt=null}else t.state==="error"&&(e.chatStream=null,e.chatRunId=null,e.chatStreamStartedAt=null,e.lastError=t.errorMessage??"chat error");return t.state}const Ll=120;function Ml(e){return e.chatSending||!!e.chatRunId}function Hg(e){const t=e.trim();if(!t)return!1;const n=t.toLowerCase();return n==="/stop"?!0:n==="stop"||n==="esc"||n==="abort"||n==="wait"||n==="exit"}function jg(e){const t=e.trim();if(!t)return!1;const n=t.toLowerCase();return n==="/new"||n==="/reset"?!0:n.startsWith("/new ")||n.startsWith("/reset ")}async function Il(e){e.connected&&(e.chatMessage="",await zg(e))}function Kg(e,t,n,s){const i=t.trim(),a=!!(n&&n.length>0);!i&&!a||(e.chatQueue=[...e.chatQueue,{id:va(),text:i,createdAt:Date.now(),attachments:a?n?.map(o=>({...o})):void 0,refreshSessions:s}])}async function Rl(e,t,n){Is(e);const s=await Bg(e,t,n?.attachments),i=!!s;return!i&&n?.previousDraft!=null&&(e.chatMessage=n.previousDraft),!i&&n?.previousAttachments&&(e.chatAttachments=n.previousAttachments),i&&Al(e,e.sessionKey),i&&n?.restoreDraft&&n.previousDraft?.trim()&&(e.chatMessage=n.previousDraft),i&&n?.restoreAttachments&&n.previousAttachments?.length&&(e.chatAttachments=n.previousAttachments),Rn(e),i&&!e.chatRunId&&Pl(e),i&&n?.refreshSessions&&s&&e.refreshSessionsAfterChat.add(s),i}async function Pl(e){if(!e.connected||Ml(e))return;const[t,...n]=e.chatQueue;if(!t)return;e.chatQueue=n,await Rl(e,t.text,{attachments:t.attachments,refreshSessions:t.refreshSessions})||(e.chatQueue=[t,...e.chatQueue])}function Wg(e,t){e.chatQueue=e.chatQueue.filter(n=>n.id!==t)}async function qg(e,t,n){if(!e.connected)return;const s=e.chatMessage,i=(t??e.chatMessage).trim(),a=e.chatAttachments??[],o=t==null?a:[],r=o.length>0;if(!i&&!r)return;if(Hg(i)){await Il(e);return}const c=jg(i);if(t==null&&(e.chatMessage="",e.chatAttachments=[]),Ml(e)){Kg(e,i,o,c);return}await Rl(e,i,{previousDraft:t==null?s:void 0,restoreDraft:!!(t&&n?.restoreDraft),attachments:r?o:void 0,previousAttachments:t==null?a:void 0,restoreAttachments:!!(t&&n?.restoreDraft),refreshSessions:c})}async function Dl(e,t){await Promise.all([Xt(e),Ht(e,{activeMinutes:Ll}),as(e)]),t?.scheduleScroll!==!1&&Rn(e)}const Vg=Pl;function Gg(e){const t=Yr(e.sessionKey);return t?.agentId?t.agentId:e.hello?.snapshot?.sessionDefaults?.defaultAgentId?.trim()||"main"}function Qg(e,t){const n=sn(e),s=encodeURIComponent(t);return n?`${n}/avatar/${s}?meta=1`:`/avatar/${s}?meta=1`}async function as(e){if(!e.connected){e.chatAvatarUrl=null;return}const t=Gg(e);if(!t){e.chatAvatarUrl=null;return}e.chatAvatarUrl=null;const n=Qg(e.basePath,t);try{const s=await fetch(n,{method:"GET"});if(!s.ok){e.chatAvatarUrl=null;return}const i=await s.json(),a=typeof i.avatarUrl=="string"?i.avatarUrl.trim():"";e.chatAvatarUrl=a||null}catch{e.chatAvatarUrl=null}}const Yg={trace:!0,debug:!0,info:!0,warn:!0,error:!0,fatal:!0},Zg={name:"",description:"",agentId:"",enabled:!0,scheduleKind:"every",scheduleAt:"",everyAmount:"30",everyUnit:"minutes",cronExpr:"0 7 * * *",cronTz:"",sessionTarget:"isolated",wakeMode:"now",payloadKind:"agentTurn",payloadText:"",deliveryMode:"announce",deliveryChannel:"last",deliveryTo:"",timeoutSeconds:""},Jg=50,Xg=200,ep="Assistant";function Mo(e,t){if(typeof e!="string")return;const n=e.trim();if(n)return n.length<=t?n:n.slice(0,t)}function ma(e){const t=Mo(e?.name,Jg)??ep,n=Mo(e?.avatar??void 0,Xg)??null;return{agentId:typeof e?.agentId=="string"&&e.agentId.trim()?e.agentId.trim():null,name:t,avatar:n}}async function Fl(e,t){if(!e.client||!e.connected)return;const n=e.sessionKey.trim(),s=n?{sessionKey:n}:{};try{const i=await e.client.request("agent.identity.get",s);if(!i)return;const a=ma(i);e.assistantName=a.name,e.assistantAvatar=a.avatar,e.assistantAgentId=a.agentId??null}catch{}}function Ei(e){return typeof e=="object"&&e!==null}function tp(e){if(!Ei(e))return null;const t=typeof e.id=="string"?e.id.trim():"",n=e.request;if(!t||!Ei(n))return null;const s=typeof n.command=="string"?n.command.trim():"";if(!s)return null;const i=typeof e.createdAtMs=="number"?e.createdAtMs:0,a=typeof e.expiresAtMs=="number"?e.expiresAtMs:0;return!i||!a?null:{id:t,request:{command:s,cwd:typeof n.cwd=="string"?n.cwd:null,host:typeof n.host=="string"?n.host:null,security:typeof n.security=="string"?n.security:null,ask:typeof n.ask=="string"?n.ask:null,agentId:typeof n.agentId=="string"?n.agentId:null,resolvedPath:typeof n.resolvedPath=="string"?n.resolvedPath:null,sessionKey:typeof n.sessionKey=="string"?n.sessionKey:null},createdAtMs:i,expiresAtMs:a}}function np(e){if(!Ei(e))return null;const t=typeof e.id=="string"?e.id.trim():"";return t?{id:t,decision:typeof e.decision=="string"?e.decision:null,resolvedBy:typeof e.resolvedBy=="string"?e.resolvedBy:null,ts:typeof e.ts=="number"?e.ts:null}:null}function Nl(e){const t=Date.now();return e.filter(n=>n.expiresAtMs>t)}function sp(e,t){const n=Nl(e).filter(s=>s.id!==t.id);return n.push(t),n}function Io(e,t){return Nl(e).filter(n=>n.id!==t)}function ip(e){const t=e.version??(e.nonce?"v2":"v1"),n=e.scopes.join(","),s=e.token??"",i=[t,e.deviceId,e.clientId,e.clientMode,e.role,n,String(e.signedAtMs),s];return t==="v2"&&i.push(e.nonce??""),i.join("|")}const Ol={WEBCHAT_UI:"webchat-ui",CONTROL_UI:"openclaw-control-ui",WEBCHAT:"webchat",CLI:"cli",GATEWAY_CLIENT:"gateway-client",MACOS_APP:"openclaw-macos",IOS_APP:"openclaw-ios",ANDROID_APP:"openclaw-android",NODE_HOST:"node-host",TEST:"test",FINGERPRINT:"fingerprint",PROBE:"openclaw-probe"},Ro=Ol,Li={WEBCHAT:"webchat",CLI:"cli",UI:"ui",BACKEND:"backend",NODE:"node",PROBE:"probe",TEST:"test"};new Set(Object.values(Ol));new Set(Object.values(Li));const ap=4008;class op{constructor(t){this.opts=t,this.ws=null,this.pending=new Map,this.closed=!1,this.lastSeq=null,this.connectNonce=null,this.connectSent=!1,this.connectTimer=null,this.backoffMs=800}start(){this.closed=!1,this.connect()}stop(){this.closed=!0,this.ws?.close(),this.ws=null,this.flushPending(new Error("gateway client stopped"))}get connected(){return this.ws?.readyState===WebSocket.OPEN}connect(){this.closed||(this.ws=new WebSocket(this.opts.url),this.ws.addEventListener("open",()=>this.queueConnect()),this.ws.addEventListener("message",t=>this.handleMessage(String(t.data??""))),this.ws.addEventListener("close",t=>{const n=String(t.reason??"");this.ws=null,this.flushPending(new Error(`gateway closed (${t.code}): ${n}`)),this.opts.onClose?.({code:t.code,reason:n}),this.scheduleReconnect()}),this.ws.addEventListener("error",()=>{}))}scheduleReconnect(){if(this.closed)return;const t=this.backoffMs;this.backoffMs=Math.min(this.backoffMs*1.7,15e3),window.setTimeout(()=>this.connect(),t)}flushPending(t){for(const[,n]of this.pending)n.reject(t);this.pending.clear()}async sendConnect(){if(this.connectSent)return;this.connectSent=!0,this.connectTimer!==null&&(window.clearTimeout(this.connectTimer),this.connectTimer=null);const t=typeof crypto<"u"&&!!crypto.subtle,n=["operator.admin","operator.approvals","operator.pairing"],s="operator";let i=null,a=!1,o=this.opts.token;if(t){i=await ua();const g=du({deviceId:i.deviceId,role:s})?.token;o=g??this.opts.token,a=!!(g&&this.opts.token)}const r=o||this.opts.password?{token:o,password:this.opts.password}:void 0;let c;if(t&&i){const g=Date.now(),p=this.connectNonce??void 0,h=ip({deviceId:i.deviceId,clientId:this.opts.clientName??Ro.CONTROL_UI,clientMode:this.opts.mode??Li.WEBCHAT,role:s,scopes:n,signedAtMs:g,token:o??null,nonce:p}),u=await Du(i.privateKey,h);c={id:i.deviceId,publicKey:i.publicKey,signature:u,signedAt:g,nonce:p}}const d={minProtocol:3,maxProtocol:3,client:{id:this.opts.clientName??Ro.CONTROL_UI,version:this.opts.clientVersion??"dev",platform:this.opts.platform??navigator.platform??"web",mode:this.opts.mode??Li.WEBCHAT,instanceId:this.opts.instanceId},role:s,scopes:n,device:c,caps:[],auth:r,userAgent:navigator.userAgent,locale:navigator.language};this.request("connect",d).then(g=>{g?.auth?.deviceToken&&i&&al({deviceId:i.deviceId,role:g.auth.role??s,token:g.auth.deviceToken,scopes:g.auth.scopes??[]}),this.backoffMs=800,this.opts.onHello?.(g)}).catch(()=>{a&&i&&ol({deviceId:i.deviceId,role:s}),this.ws?.close(ap,"connect failed")})}handleMessage(t){let n;try{n=JSON.parse(t)}catch{return}const s=n;if(s.type==="event"){const i=n;if(i.event==="connect.challenge"){const o=i.payload,r=o&&typeof o.nonce=="string"?o.nonce:null;r&&(this.connectNonce=r,this.sendConnect());return}const a=typeof i.seq=="number"?i.seq:null;a!==null&&(this.lastSeq!==null&&a>this.lastSeq+1&&this.opts.onGap?.({expected:this.lastSeq+1,received:a}),this.lastSeq=a);try{this.opts.onEvent?.(i)}catch(o){console.error("[gateway] event handler error:",o)}return}if(s.type==="res"){const i=n,a=this.pending.get(i.id);if(!a)return;this.pending.delete(i.id),i.ok?a.resolve(i.payload):a.reject(new Error(i.error?.message??"request failed"));return}}request(t,n){if(!this.ws||this.ws.readyState!==WebSocket.OPEN)return Promise.reject(new Error("gateway not connected"));const s=va(),i={type:"req",id:s,method:t,params:n},a=new Promise((o,r)=>{this.pending.set(s,{resolve:c=>o(c),reject:r})});return this.ws.send(JSON.stringify(i)),a}queueConnect(){this.connectNonce=null,this.connectSent=!1,this.connectTimer!==null&&window.clearTimeout(this.connectTimer),this.connectTimer=window.setTimeout(()=>{this.sendConnect()},750)}}function ii(e,t){const n=(e??"").trim(),s=t.mainSessionKey?.trim();if(!s)return n;if(!n)return s;const i=t.mainKey?.trim()||"main",a=t.defaultAgentId?.trim();return n==="main"||n===i||a&&(n===`agent:${a}:main`||n===`agent:${a}:${i}`)?s:n}function rp(e,t){if(!t?.mainSessionKey)return;const n=ii(e.sessionKey,t),s=ii(e.settings.sessionKey,t),i=ii(e.settings.lastActiveSessionKey,t),a=n||s||e.sessionKey,o={...e.settings,sessionKey:s||a,lastActiveSessionKey:i||a},r=o.sessionKey!==e.settings.sessionKey||o.lastActiveSessionKey!==e.settings.lastActiveSessionKey;a!==e.sessionKey&&(e.sessionKey=a),r&&mt(e,o)}function Bl(e){e.lastError=null,e.hello=null,e.connected=!1,e.execApprovalQueue=[],e.execApprovalError=null;const t=e.client,n=new op({url:e.settings.gatewayUrl,token:e.settings.token.trim()?e.settings.token:void 0,password:e.password.trim()?e.password:void 0,clientName:"openclaw-control-ui",mode:"webchat",onHello:s=>{e.client===n&&(e.connected=!0,e.lastError=null,e.hello=s,dp(e,s),e.chatRunId=null,e.chatStream=null,e.chatStreamStartedAt=null,Is(e),Fl(e),sa(e),Cs(e,{quiet:!0}),xt(e,{quiet:!0}),ha(e))},onClose:({code:s,reason:i})=>{e.client===n&&(e.connected=!1,s!==1012&&(e.lastError=`disconnected (${s}): ${i||"no reason"}`))},onEvent:s=>{e.client===n&&lp(e,s)},onGap:({expected:s,received:i})=>{e.client===n&&(e.lastError=`event gap detected (expected seq ${s}, got ${i}); refresh recommended`)}});e.client=n,t?.stop(),n.start()}function lp(e,t){try{cp(e,t)}catch(n){console.error("[gateway] handleGatewayEvent error:",t.event,n)}}function cp(e,t){if(e.eventLogBuffer=[{ts:Date.now(),event:t.event,payload:t.payload},...e.eventLogBuffer].slice(0,250),e.tab==="debug"&&(e.eventLog=e.eventLogBuffer),t.event==="agent"){if(e.onboarding)return;_g(e,t.payload);return}if(t.event==="chat"){const n=t.payload;n?.sessionKey&&Al(e,n.sessionKey);const s=Ug(e,n);if(s==="final"||s==="error"||s==="aborted"){Is(e),Vg(e);const i=n?.runId;i&&e.refreshSessionsAfterChat.has(i)&&(e.refreshSessionsAfterChat.delete(i),s==="final"&&Ht(e,{activeMinutes:Ll}))}s==="final"&&Xt(e);return}if(t.event==="presence"){const n=t.payload;n?.presence&&Array.isArray(n.presence)&&(e.presenceEntries=n.presence,e.presenceError=null,e.presenceStatus=null);return}if(t.event==="cron"&&e.tab==="cron"&&ps(e),(t.event==="device.pair.requested"||t.event==="device.pair.resolved")&&xt(e,{quiet:!0}),t.event==="exec.approval.requested"){const n=tp(t.payload);if(n){e.execApprovalQueue=sp(e.execApprovalQueue,n),e.execApprovalError=null;const s=Math.max(0,n.expiresAtMs-Date.now()+500);window.setTimeout(()=>{e.execApprovalQueue=Io(e.execApprovalQueue,n.id)},s)}return}if(t.event==="exec.approval.resolved"){const n=np(t.payload);n&&(e.execApprovalQueue=Io(e.execApprovalQueue,n.id))}}function dp(e,t){const n=t.snapshot;n?.presence&&Array.isArray(n.presence)&&(e.presenceEntries=n.presence),n?.health&&(e.debugHealth=n.health),n?.sessionDefaults&&rp(e,n.sessionDefaults)}const Po="/__openclaw/control-ui-config.json";async function up(e){if(typeof window>"u"||typeof fetch!="function")return;const t=sn(e.basePath??""),n=t?`${t}${Po}`:Po;try{const s=await fetch(n,{method:"GET",headers:{Accept:"application/json"},credentials:"same-origin"});if(!s.ok)return;const i=await s.json(),a=ma({agentId:i.assistantAgentId??null,name:i.assistantName,avatar:i.assistantAvatar??null});e.assistantName=a.name,e.assistantAvatar=a.avatar,e.assistantAgentId=a.agentId??null}catch{}}function gp(e){e.basePath=ug(),up(e),lg(e),hg(e,!0),gg(e),pg(e),window.addEventListener("popstate",e.popStateHandler),Bl(e),Zd(e),e.tab==="logs"&&Xi(e),e.tab==="debug"&&ta(e)}function pp(e){Kd(e)}function fp(e){window.removeEventListener("popstate",e.popStateHandler),Jd(e),ea(e),na(e),fg(e),e.topbarObserver?.disconnect(),e.topbarObserver=null}function hp(e,t){if(!(e.tab==="chat"&&e.chatManualRefreshInFlight)){if(e.tab==="chat"&&(t.has("chatMessages")||t.has("chatToolMessages")||t.has("chatStream")||t.has("chatLoading")||t.has("tab"))){const n=t.has("tab"),s=t.has("chatLoading")&&t.get("chatLoading")===!0&&!e.chatLoading;Rn(e,n||s||!e.chatHasAutoScrolled)}e.tab==="logs"&&(t.has("logsEntries")||t.has("logsAutoFollow")||t.has("tab"))&&e.logsAutoFollow&&e.logsAtBottom&&Zr(e,t.has("tab")||t.has("logsAutoFollow"))}}async function zl(e,t){if(!(!e.client||!e.connected)&&!e.usageLoading){e.usageLoading=!0,e.usageError=null;try{const n=t?.startDate??e.usageStartDate,s=t?.endDate??e.usageEndDate,[i,a]=await Promise.all([e.client.request("sessions.usage",{startDate:n,endDate:s,limit:1e3,includeContextWeight:!0}),e.client.request("usage.cost",{startDate:n,endDate:s})]);i&&(e.usageResult=i),a&&(e.usageCostSummary=a)}catch(n){e.usageError=String(n)}finally{e.usageLoading=!1}}}async function vp(e,t){if(!(!e.client||!e.connected)&&!e.usageTimeSeriesLoading){e.usageTimeSeriesLoading=!0,e.usageTimeSeries=null;try{const n=await e.client.request("sessions.usage.timeseries",{key:t});n&&(e.usageTimeSeries=n)}catch{e.usageTimeSeries=null}finally{e.usageTimeSeriesLoading=!1}}}async function mp(e,t){if(!(!e.client||!e.connected)&&!e.usageSessionLogsLoading){e.usageSessionLogsLoading=!0,e.usageSessionLogs=null;try{const n=await e.client.request("sessions.usage.logs",{key:t,limit:1e3});n&&Array.isArray(n.logs)&&(e.usageSessionLogs=n.logs)}catch{e.usageSessionLogs=null}finally{e.usageSessionLogsLoading=!1}}}const bp=new Set(["agent","channel","chat","provider","model","tool","label","key","session","id","has","mintokens","maxtokens","mincost","maxcost","minmessages","maxmessages"]),hs=e=>e.trim().toLowerCase(),yp=e=>{const t=e.replace(/[.+^${}()|[\]\\]/g,"\\$&").replace(/\*/g,".*").replace(/\?/g,".");return new RegExp(`^${t}$`,"i")},Lt=e=>{let t=e.trim().toLowerCase();if(!t)return null;t.startsWith("$")&&(t=t.slice(1));let n=1;t.endsWith("k")?(n=1e3,t=t.slice(0,-1)):t.endsWith("m")&&(n=1e6,t=t.slice(0,-1));const s=Number(t);return Number.isFinite(s)?s*n:null},ba=e=>(e.match(/"[^"]+"|\S+/g)??[]).map(n=>{const s=n.replace(/^"|"$/g,""),i=s.indexOf(":");if(i>0){const a=s.slice(0,i),o=s.slice(i+1);return{key:a,value:o,raw:s}}return{value:s,raw:s}}),xp=e=>[e.label,e.key,e.sessionId].filter(n=>!!n).map(n=>n.toLowerCase()),Do=e=>{const t=new Set;e.modelProvider&&t.add(e.modelProvider.toLowerCase()),e.providerOverride&&t.add(e.providerOverride.toLowerCase()),e.origin?.provider&&t.add(e.origin.provider.toLowerCase());for(const n of e.usage?.modelUsage??[])n.provider&&t.add(n.provider.toLowerCase());return Array.from(t)},Fo=e=>{const t=new Set;e.model&&t.add(e.model.toLowerCase());for(const n of e.usage?.modelUsage??[])n.model&&t.add(n.model.toLowerCase());return Array.from(t)},$p=e=>(e.usage?.toolUsage?.tools??[]).map(t=>t.name.toLowerCase()),wp=(e,t)=>{const n=hs(t.value??"");if(!n)return!0;if(!t.key)return xp(e).some(i=>i.includes(n));switch(hs(t.key)){case"agent":return e.agentId?.toLowerCase().includes(n)??!1;case"channel":return e.channel?.toLowerCase().includes(n)??!1;case"chat":return e.chatType?.toLowerCase().includes(n)??!1;case"provider":return Do(e).some(i=>i.includes(n));case"model":return Fo(e).some(i=>i.includes(n));case"tool":return $p(e).some(i=>i.includes(n));case"label":return e.label?.toLowerCase().includes(n)??!1;case"key":case"session":case"id":if(n.includes("*")||n.includes("?")){const i=yp(n);return i.test(e.key)||(e.sessionId?i.test(e.sessionId):!1)}return e.key.toLowerCase().includes(n)||(e.sessionId?.toLowerCase().includes(n)??!1);case"has":switch(n){case"tools":return(e.usage?.toolUsage?.totalCalls??0)>0;case"errors":return(e.usage?.messageCounts?.errors??0)>0;case"context":return!!e.contextWeight;case"usage":return!!e.usage;case"model":return Fo(e).length>0;case"provider":return Do(e).length>0;default:return!0}case"mintokens":{const i=Lt(n);return i===null?!0:(e.usage?.totalTokens??0)>=i}case"maxtokens":{const i=Lt(n);return i===null?!0:(e.usage?.totalTokens??0)<=i}case"mincost":{const i=Lt(n);return i===null?!0:(e.usage?.totalCost??0)>=i}case"maxcost":{const i=Lt(n);return i===null?!0:(e.usage?.totalCost??0)<=i}case"minmessages":{const i=Lt(n);return i===null?!0:(e.usage?.messageCounts?.total??0)>=i}case"maxmessages":{const i=Lt(n);return i===null?!0:(e.usage?.messageCounts?.total??0)<=i}default:return!0}},kp=(e,t)=>{const n=ba(t);if(n.length===0)return{sessions:e,warnings:[]};const s=[];for(const a of n){if(!a.key)continue;const o=hs(a.key);if(!bp.has(o)){s.push(`Unknown filter: ${a.key}`);continue}if(a.value===""&&s.push(`Missing value for ${a.key}`),o==="has"){const r=new Set(["tools","errors","context","usage","model","provider"]);a.value&&!r.has(hs(a.value))&&s.push(`Unknown has:${a.value}`)}["mintokens","maxtokens","mincost","maxcost","minmessages","maxmessages"].includes(o)&&a.value&&Lt(a.value)===null&&s.push(`Invalid number for ${a.key}`)}return{sessions:e.filter(a=>n.every(o=>wp(a,o))),warnings:s}};function Ul(e){const t=e.split(`
`),n=new Map,s=[];for(const r of t){const c=/^\[Tool:\s*([^\]]+)\]/.exec(r.trim());if(c){const d=c[1];n.set(d,(n.get(d)??0)+1);continue}r.trim().startsWith("[Tool Result]")||s.push(r)}const i=Array.from(n.entries()).toSorted((r,c)=>c[1]-r[1]),a=i.reduce((r,[,c])=>r+c,0),o=i.length>0?`Tools: ${i.map(([r,c])=>`${r}×${c}`).join(", ")} (${a} calls)`:"";return{tools:i,summary:o,cleanContent:s.join(`
`).trim()}}function Sp(e){return{byChannel:Array.from(e.byChannelMap.entries()).map(([t,n])=>({channel:t,totals:n})).toSorted((t,n)=>n.totals.totalCost-t.totals.totalCost),latency:e.latencyTotals.count>0?{count:e.latencyTotals.count,avgMs:e.latencyTotals.sum/e.latencyTotals.count,minMs:e.latencyTotals.min===Number.POSITIVE_INFINITY?0:e.latencyTotals.min,maxMs:e.latencyTotals.max,p95Ms:e.latencyTotals.p95Max}:void 0,dailyLatency:Array.from(e.dailyLatencyMap.values()).map(t=>({date:t.date,count:t.count,avgMs:t.count?t.sum/t.count:0,minMs:t.min===Number.POSITIVE_INFINITY?0:t.min,maxMs:t.max,p95Ms:t.p95Max})).toSorted((t,n)=>t.date.localeCompare(n.date)),modelDaily:Array.from(e.modelDailyMap.values()).toSorted((t,n)=>t.date.localeCompare(n.date)||n.cost-t.cost),daily:Array.from(e.dailyMap.values()).toSorted((t,n)=>t.date.localeCompare(n.date))}}const Ap=4;function At(e){return Math.round(e/Ap)}function B(e){return e>=1e6?`${(e/1e6).toFixed(1)}M`:e>=1e3?`${(e/1e3).toFixed(1)}K`:String(e)}function Cp(e){const t=new Date;return t.setHours(e,0,0,0),t.toLocaleTimeString(void 0,{hour:"numeric"})}function Tp(e,t){const n=Array.from({length:24},()=>0),s=Array.from({length:24},()=>0);for(const i of e){const a=i.usage;if(!a?.messageCounts||a.messageCounts.total===0)continue;const o=a.firstActivity??i.updatedAt,r=a.lastActivity??i.updatedAt;if(!o||!r)continue;const c=Math.min(o,r),d=Math.max(o,r),p=Math.max(d-c,1)/6e4;let h=c;for(;h<d;){const u=new Date(h),f=ya(u,t),m=xa(u,t),w=Math.min(m.getTime(),d),C=Math.max((w-h)/6e4,0)/p;n[f]+=a.messageCounts.errors*C,s[f]+=a.messageCounts.total*C,h=w+1}}return s.map((i,a)=>{const o=n[a],r=i>0?o/i:0;return{hour:a,rate:r,errors:o,msgs:i}}).filter(i=>i.msgs>0&&i.errors>0).toSorted((i,a)=>a.rate-i.rate).slice(0,5).map(i=>({label:Cp(i.hour),value:`${(i.rate*100).toFixed(2)}%`,sub:`${Math.round(i.errors)} errors · ${Math.round(i.msgs)} msgs`}))}const _p=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];function ya(e,t){return t==="utc"?e.getUTCHours():e.getHours()}function Ep(e,t){return t==="utc"?e.getUTCDay():e.getDay()}function xa(e,t){const n=new Date(e);return t==="utc"?n.setUTCMinutes(59,59,999):n.setMinutes(59,59,999),n}function Lp(e,t){const n=Array.from({length:24},()=>0),s=Array.from({length:7},()=>0);let i=0,a=!1;for(const r of e){const c=r.usage;if(!c||!c.totalTokens||c.totalTokens<=0)continue;i+=c.totalTokens;const d=c.firstActivity??r.updatedAt,g=c.lastActivity??r.updatedAt;if(!d||!g)continue;a=!0;const p=Math.min(d,g),h=Math.max(d,g),f=Math.max(h-p,1)/6e4;let m=p;for(;m<h;){const w=new Date(m),A=ya(w,t),C=Ep(w,t),k=xa(w,t),S=Math.min(k.getTime(),h),T=Math.max((S-m)/6e4,0)/f;n[A]+=c.totalTokens*T,s[C]+=c.totalTokens*T,m=S+1}}const o=_p.map((r,c)=>({label:r,tokens:s[c]}));return{hasData:a,totalTokens:i,hourTotals:n,weekdayTotals:o}}function Mp(e,t,n,s){const i=Lp(e,t);if(!i.hasData)return l`
      <div class="card usage-mosaic">
        <div class="usage-mosaic-header">
          <div>
            <div class="usage-mosaic-title">Activity by Time</div>
            <div class="usage-mosaic-sub">Estimates require session timestamps.</div>
          </div>
          <div class="usage-mosaic-total">${B(0)} tokens</div>
        </div>
        <div class="muted" style="padding: 12px; text-align: center;">No timeline data yet.</div>
      </div>
    `;const a=Math.max(...i.hourTotals,1),o=Math.max(...i.weekdayTotals.map(r=>r.tokens),1);return l`
    <div class="card usage-mosaic">
      <div class="usage-mosaic-header">
        <div>
          <div class="usage-mosaic-title">Activity by Time</div>
          <div class="usage-mosaic-sub">
            Estimated from session spans (first/last activity). Time zone: ${t==="utc"?"UTC":"Local"}.
          </div>
        </div>
        <div class="usage-mosaic-total">${B(i.totalTokens)} tokens</div>
      </div>
      <div class="usage-mosaic-grid">
        <div class="usage-mosaic-section">
          <div class="usage-mosaic-section-title">Day of Week</div>
          <div class="usage-daypart-grid">
            ${i.weekdayTotals.map(r=>{const c=Math.min(r.tokens/o,1),d=r.tokens>0?`rgba(255, 77, 77, ${.12+c*.6})`:"transparent";return l`
                <div class="usage-daypart-cell" style="background: ${d};">
                  <div class="usage-daypart-label">${r.label}</div>
                  <div class="usage-daypart-value">${B(r.tokens)}</div>
                </div>
              `})}
          </div>
        </div>
        <div class="usage-mosaic-section">
          <div class="usage-mosaic-section-title">
            <span>Hours</span>
            <span class="usage-mosaic-sub">0 → 23</span>
          </div>
          <div class="usage-hour-grid">
            ${i.hourTotals.map((r,c)=>{const d=Math.min(r/a,1),g=r>0?`rgba(255, 77, 77, ${.08+d*.7})`:"transparent",p=`${c}:00 · ${B(r)} tokens`,h=d>.7?"rgba(255, 77, 77, 0.6)":"rgba(255, 77, 77, 0.2)",u=n.includes(c);return l`
                <div
                  class="usage-hour-cell ${u?"selected":""}"
                  style="background: ${g}; border-color: ${h};"
                  title="${p}"
                  @click=${f=>s(c,f.shiftKey)}
                ></div>
              `})}
          </div>
          <div class="usage-hour-labels">
            <span>Midnight</span>
            <span>4am</span>
            <span>8am</span>
            <span>Noon</span>
            <span>4pm</span>
            <span>8pm</span>
          </div>
          <div class="usage-hour-legend">
            <span></span>
            Low → High token density
          </div>
        </div>
      </div>
    </div>
  `}function X(e,t=2){return`$${e.toFixed(t)}`}function ai(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function Hl(e){const t=/^(\d{4})-(\d{2})-(\d{2})$/.exec(e);if(!t)return null;const[,n,s,i]=t,a=new Date(Date.UTC(Number(n),Number(s)-1,Number(i)));return Number.isNaN(a.valueOf())?null:a}function jl(e){const t=Hl(e);return t?t.toLocaleDateString(void 0,{month:"short",day:"numeric"}):e}function Ip(e){const t=Hl(e);return t?t.toLocaleDateString(void 0,{month:"long",day:"numeric",year:"numeric"}):e}const Kn=()=>({input:0,output:0,cacheRead:0,cacheWrite:0,totalTokens:0,totalCost:0,inputCost:0,outputCost:0,cacheReadCost:0,cacheWriteCost:0,missingCostEntries:0}),Wn=(e,t)=>{e.input+=t.input??0,e.output+=t.output??0,e.cacheRead+=t.cacheRead??0,e.cacheWrite+=t.cacheWrite??0,e.totalTokens+=t.totalTokens??0,e.totalCost+=t.totalCost??0,e.inputCost+=t.inputCost??0,e.outputCost+=t.outputCost??0,e.cacheReadCost+=t.cacheReadCost??0,e.cacheWriteCost+=t.cacheWriteCost??0,e.missingCostEntries+=t.missingCostEntries??0},Rp=(e,t)=>{if(e.length===0)return t??{messages:{total:0,user:0,assistant:0,toolCalls:0,toolResults:0,errors:0},tools:{totalCalls:0,uniqueTools:0,tools:[]},byModel:[],byProvider:[],byAgent:[],byChannel:[],daily:[]};const n={total:0,user:0,assistant:0,toolCalls:0,toolResults:0,errors:0},s=new Map,i=new Map,a=new Map,o=new Map,r=new Map,c=new Map,d=new Map,g=new Map,p={count:0,sum:0,min:Number.POSITIVE_INFINITY,max:0,p95Max:0};for(const u of e){const f=u.usage;if(f){if(f.messageCounts&&(n.total+=f.messageCounts.total,n.user+=f.messageCounts.user,n.assistant+=f.messageCounts.assistant,n.toolCalls+=f.messageCounts.toolCalls,n.toolResults+=f.messageCounts.toolResults,n.errors+=f.messageCounts.errors),f.toolUsage)for(const m of f.toolUsage.tools)s.set(m.name,(s.get(m.name)??0)+m.count);if(f.modelUsage)for(const m of f.modelUsage){const w=`${m.provider??"unknown"}::${m.model??"unknown"}`,A=i.get(w)??{provider:m.provider,model:m.model,count:0,totals:Kn()};A.count+=m.count,Wn(A.totals,m.totals),i.set(w,A);const C=m.provider??"unknown",k=a.get(C)??{provider:m.provider,model:void 0,count:0,totals:Kn()};k.count+=m.count,Wn(k.totals,m.totals),a.set(C,k)}if(f.latency){const{count:m,avgMs:w,minMs:A,maxMs:C,p95Ms:k}=f.latency;m>0&&(p.count+=m,p.sum+=w*m,p.min=Math.min(p.min,A),p.max=Math.max(p.max,C),p.p95Max=Math.max(p.p95Max,k))}if(u.agentId){const m=o.get(u.agentId)??Kn();Wn(m,f),o.set(u.agentId,m)}if(u.channel){const m=r.get(u.channel)??Kn();Wn(m,f),r.set(u.channel,m)}for(const m of f.dailyBreakdown??[]){const w=c.get(m.date)??{date:m.date,tokens:0,cost:0,messages:0,toolCalls:0,errors:0};w.tokens+=m.tokens,w.cost+=m.cost,c.set(m.date,w)}for(const m of f.dailyMessageCounts??[]){const w=c.get(m.date)??{date:m.date,tokens:0,cost:0,messages:0,toolCalls:0,errors:0};w.messages+=m.total,w.toolCalls+=m.toolCalls,w.errors+=m.errors,c.set(m.date,w)}for(const m of f.dailyLatency??[]){const w=d.get(m.date)??{date:m.date,count:0,sum:0,min:Number.POSITIVE_INFINITY,max:0,p95Max:0};w.count+=m.count,w.sum+=m.avgMs*m.count,w.min=Math.min(w.min,m.minMs),w.max=Math.max(w.max,m.maxMs),w.p95Max=Math.max(w.p95Max,m.p95Ms),d.set(m.date,w)}for(const m of f.dailyModelUsage??[]){const w=`${m.date}::${m.provider??"unknown"}::${m.model??"unknown"}`,A=g.get(w)??{date:m.date,provider:m.provider,model:m.model,tokens:0,cost:0,count:0};A.tokens+=m.tokens,A.cost+=m.cost,A.count+=m.count,g.set(w,A)}}}const h=Sp({byChannelMap:r,latencyTotals:p,dailyLatencyMap:d,modelDailyMap:g,dailyMap:c});return{messages:n,tools:{totalCalls:Array.from(s.values()).reduce((u,f)=>u+f,0),uniqueTools:s.size,tools:Array.from(s.entries()).map(([u,f])=>({name:u,count:f})).toSorted((u,f)=>f.count-u.count)},byModel:Array.from(i.values()).toSorted((u,f)=>f.totals.totalCost-u.totals.totalCost),byProvider:Array.from(a.values()).toSorted((u,f)=>f.totals.totalCost-u.totals.totalCost),byAgent:Array.from(o.entries()).map(([u,f])=>({agentId:u,totals:f})).toSorted((u,f)=>f.totals.totalCost-u.totals.totalCost),...h}},Pp=(e,t,n)=>{let s=0,i=0;for(const g of e){const p=g.usage?.durationMs??0;p>0&&(s+=p,i+=1)}const a=i?s/i:0,o=t&&s>0?t.totalTokens/(s/6e4):void 0,r=t&&s>0?t.totalCost/(s/6e4):void 0,c=n.messages.total?n.messages.errors/n.messages.total:0,d=n.daily.filter(g=>g.messages>0&&g.errors>0).map(g=>({date:g.date,errors:g.errors,messages:g.messages,rate:g.errors/g.messages})).toSorted((g,p)=>p.rate-g.rate||p.errors-g.errors)[0];return{durationSumMs:s,durationCount:i,avgDurationMs:a,throughputTokensPerMin:o,throughputCostPerMin:r,errorRate:c,peakErrorDay:d}};function oi(e,t,n="text/plain"){const s=new Blob([t],{type:`${n};charset=utf-8`}),i=URL.createObjectURL(s),a=document.createElement("a");a.href=i,a.download=e,a.click(),URL.revokeObjectURL(i)}function Dp(e){return/[",\n]/.test(e)?`"${e.replaceAll('"','""')}"`:e}function vs(e){return e.map(t=>t==null?"":Dp(String(t))).join(",")}const Fp=e=>{const t=[vs(["key","label","agentId","channel","provider","model","updatedAt","durationMs","messages","errors","toolCalls","inputTokens","outputTokens","cacheReadTokens","cacheWriteTokens","totalTokens","totalCost"])];for(const n of e){const s=n.usage;t.push(vs([n.key,n.label??"",n.agentId??"",n.channel??"",n.modelProvider??n.providerOverride??"",n.model??n.modelOverride??"",n.updatedAt?new Date(n.updatedAt).toISOString():"",s?.durationMs??"",s?.messageCounts?.total??"",s?.messageCounts?.errors??"",s?.messageCounts?.toolCalls??"",s?.input??"",s?.output??"",s?.cacheRead??"",s?.cacheWrite??"",s?.totalTokens??"",s?.totalCost??""]))}return t.join(`
`)},Np=e=>{const t=[vs(["date","inputTokens","outputTokens","cacheReadTokens","cacheWriteTokens","totalTokens","inputCost","outputCost","cacheReadCost","cacheWriteCost","totalCost"])];for(const n of e)t.push(vs([n.date,n.input,n.output,n.cacheRead,n.cacheWrite,n.totalTokens,n.inputCost??"",n.outputCost??"",n.cacheReadCost??"",n.cacheWriteCost??"",n.totalCost]));return t.join(`
`)},Op=(e,t,n)=>{const s=e.trim();if(!s)return[];const i=s.length?s.split(/\s+/):[],a=i.length?i[i.length-1]:"",[o,r]=a.includes(":")?[a.slice(0,a.indexOf(":")),a.slice(a.indexOf(":")+1)]:["",""],c=o.toLowerCase(),d=r.toLowerCase(),g=C=>{const k=new Set;for(const S of C)S&&k.add(S);return Array.from(k)},p=g(t.map(C=>C.agentId)).slice(0,6),h=g(t.map(C=>C.channel)).slice(0,6),u=g([...t.map(C=>C.modelProvider),...t.map(C=>C.providerOverride),...n?.byProvider.map(C=>C.provider)??[]]).slice(0,6),f=g([...t.map(C=>C.model),...n?.byModel.map(C=>C.model)??[]]).slice(0,6),m=g(n?.tools.tools.map(C=>C.name)??[]).slice(0,6);if(!c)return[{label:"agent:",value:"agent:"},{label:"channel:",value:"channel:"},{label:"provider:",value:"provider:"},{label:"model:",value:"model:"},{label:"tool:",value:"tool:"},{label:"has:errors",value:"has:errors"},{label:"has:tools",value:"has:tools"},{label:"minTokens:",value:"minTokens:"},{label:"maxCost:",value:"maxCost:"}];const w=[],A=(C,k)=>{for(const S of k)(!d||S.toLowerCase().includes(d))&&w.push({label:`${C}:${S}`,value:`${C}:${S}`})};switch(c){case"agent":A("agent",p);break;case"channel":A("channel",h);break;case"provider":A("provider",u);break;case"model":A("model",f);break;case"tool":A("tool",m);break;case"has":["errors","tools","context","usage","model","provider"].forEach(C=>{(!d||C.includes(d))&&w.push({label:`has:${C}`,value:`has:${C}`})});break}return w},Bp=(e,t)=>{const n=e.trim();if(!n)return`${t} `;const s=n.split(/\s+/);return s[s.length-1]=t,`${s.join(" ")} `},Mt=e=>e.trim().toLowerCase(),zp=(e,t)=>{const n=e.trim();if(!n)return`${t} `;const s=n.split(/\s+/),i=s[s.length-1]??"",a=t.includes(":")?t.split(":")[0]:null,o=i.includes(":")?i.split(":")[0]:null;return i.endsWith(":")&&a&&o===a?(s[s.length-1]=t,`${s.join(" ")} `):s.includes(t)?`${s.join(" ")} `:`${s.join(" ")} ${t} `},No=(e,t)=>{const s=e.trim().split(/\s+/).filter(Boolean).filter(i=>i!==t);return s.length?`${s.join(" ")} `:""},Oo=(e,t,n)=>{const s=Mt(t),a=[...ba(e).filter(o=>Mt(o.key??"")!==s).map(o=>o.raw),...n.map(o=>`${t}:${o}`)];return a.length?`${a.join(" ")} `:""};function pt(e,t){return t===0?0:e/t*100}function Up(e){const t=e.totalCost||0;return{input:{tokens:e.input,cost:e.inputCost||0,pct:pt(e.inputCost||0,t)},output:{tokens:e.output,cost:e.outputCost||0,pct:pt(e.outputCost||0,t)},cacheRead:{tokens:e.cacheRead,cost:e.cacheReadCost||0,pct:pt(e.cacheReadCost||0,t)},cacheWrite:{tokens:e.cacheWrite,cost:e.cacheWriteCost||0,pct:pt(e.cacheWriteCost||0,t)},totalCost:t}}function Hp(e,t,n,s,i,a,o,r){if(!(e.length>0||t.length>0||n.length>0))return v;const d=n.length===1?s.find(f=>f.key===n[0]):null,g=d?(d.label||d.key).slice(0,20)+((d.label||d.key).length>20?"…":""):n.length===1?n[0].slice(0,8)+"…":`${n.length} sessions`,p=d?d.label||d.key:n.length===1?n[0]:n.join(", "),h=e.length===1?e[0]:`${e.length} days`,u=t.length===1?`${t[0]}:00`:`${t.length} hours`;return l`
    <div class="active-filters">
      ${e.length>0?l`
            <div class="filter-chip">
              <span class="filter-chip-label">Days: ${h}</span>
              <button class="filter-chip-remove" @click=${i} title="Remove filter">×</button>
            </div>
          `:v}
      ${t.length>0?l`
            <div class="filter-chip">
              <span class="filter-chip-label">Hours: ${u}</span>
              <button class="filter-chip-remove" @click=${a} title="Remove filter">×</button>
            </div>
          `:v}
      ${n.length>0?l`
            <div class="filter-chip" title="${p}">
              <span class="filter-chip-label">Session: ${g}</span>
              <button class="filter-chip-remove" @click=${o} title="Remove filter">×</button>
            </div>
          `:v}
      ${(e.length>0||t.length>0)&&n.length>0?l`
            <button class="btn btn-sm filter-clear-btn" @click=${r}>
              Clear All
            </button>
          `:v}
    </div>
  `}function jp(e,t,n,s,i,a){if(!e.length)return l`
      <div class="daily-chart-compact">
        <div class="sessions-panel-title">Daily Usage</div>
        <div class="muted" style="padding: 20px; text-align: center">No data</div>
      </div>
    `;const o=n==="tokens",r=e.map(p=>o?p.totalTokens:p.totalCost),c=Math.max(...r,o?1:1e-4),d=e.length>30?12:e.length>20?18:e.length>14?24:32,g=e.length<=14;return l`
    <div class="daily-chart-compact">
      <div class="daily-chart-header">
        <div class="chart-toggle small sessions-toggle">
          <button
            class="toggle-btn ${s==="total"?"active":""}"
            @click=${()=>i("total")}
          >
            Total
          </button>
          <button
            class="toggle-btn ${s==="by-type"?"active":""}"
            @click=${()=>i("by-type")}
          >
            By Type
          </button>
        </div>
        <div class="card-title">Daily ${o?"Token":"Cost"} Usage</div>
      </div>
      <div class="daily-chart">
        <div class="daily-chart-bars" style="--bar-max-width: ${d}px">
          ${e.map((p,h)=>{const f=r[h]/c*100,m=t.includes(p.date),w=jl(p.date),A=e.length>20?String(parseInt(p.date.slice(8),10)):w,C=e.length>20?"font-size: 8px":"",k=s==="by-type"?o?[{value:p.output,class:"output"},{value:p.input,class:"input"},{value:p.cacheWrite,class:"cache-write"},{value:p.cacheRead,class:"cache-read"}]:[{value:p.outputCost??0,class:"output"},{value:p.inputCost??0,class:"input"},{value:p.cacheWriteCost??0,class:"cache-write"},{value:p.cacheReadCost??0,class:"cache-read"}]:[],S=s==="by-type"?o?[`Output ${B(p.output)}`,`Input ${B(p.input)}`,`Cache write ${B(p.cacheWrite)}`,`Cache read ${B(p.cacheRead)}`]:[`Output ${X(p.outputCost??0)}`,`Input ${X(p.inputCost??0)}`,`Cache write ${X(p.cacheWriteCost??0)}`,`Cache read ${X(p.cacheReadCost??0)}`]:[],E=o?B(p.totalTokens):X(p.totalCost);return l`
              <div
                class="daily-bar-wrapper ${m?"selected":""}"
                @click=${T=>a(p.date,T.shiftKey)}
              >
                ${s==="by-type"?l`
                        <div
                          class="daily-bar"
                          style="height: ${f.toFixed(1)}%; display: flex; flex-direction: column;"
                        >
                          ${(()=>{const T=k.reduce((I,H)=>I+H.value,0)||1;return k.map(I=>l`
                                <div
                                  class="cost-segment ${I.class}"
                                  style="height: ${I.value/T*100}%"
                                ></div>
                              `)})()}
                        </div>
                      `:l`
                        <div class="daily-bar" style="height: ${f.toFixed(1)}%"></div>
                      `}
                ${g?l`<div class="daily-bar-total">${E}</div>`:v}
                <div class="daily-bar-label" style="${C}">${A}</div>
                <div class="daily-bar-tooltip">
                  <strong>${Ip(p.date)}</strong><br />
                  ${B(p.totalTokens)} tokens<br />
                  ${X(p.totalCost)}
                  ${S.length?l`${S.map(T=>l`<div>${T}</div>`)}`:v}
                </div>
              </div>
            `})}
        </div>
      </div>
    </div>
  `}function Kp(e,t){const n=Up(e),s=t==="tokens",i=e.totalTokens||1,a={output:pt(e.output,i),input:pt(e.input,i),cacheWrite:pt(e.cacheWrite,i),cacheRead:pt(e.cacheRead,i)};return l`
    <div class="cost-breakdown cost-breakdown-compact">
      <div class="cost-breakdown-header">${s?"Tokens":"Cost"} by Type</div>
      <div class="cost-breakdown-bar">
        <div class="cost-segment output" style="width: ${(s?a.output:n.output.pct).toFixed(1)}%"
          title="Output: ${s?B(e.output):X(n.output.cost)}"></div>
        <div class="cost-segment input" style="width: ${(s?a.input:n.input.pct).toFixed(1)}%"
          title="Input: ${s?B(e.input):X(n.input.cost)}"></div>
        <div class="cost-segment cache-write" style="width: ${(s?a.cacheWrite:n.cacheWrite.pct).toFixed(1)}%"
          title="Cache Write: ${s?B(e.cacheWrite):X(n.cacheWrite.cost)}"></div>
        <div class="cost-segment cache-read" style="width: ${(s?a.cacheRead:n.cacheRead.pct).toFixed(1)}%"
          title="Cache Read: ${s?B(e.cacheRead):X(n.cacheRead.cost)}"></div>
      </div>
      <div class="cost-breakdown-legend">
        <span class="legend-item"><span class="legend-dot output"></span>Output ${s?B(e.output):X(n.output.cost)}</span>
        <span class="legend-item"><span class="legend-dot input"></span>Input ${s?B(e.input):X(n.input.cost)}</span>
        <span class="legend-item"><span class="legend-dot cache-write"></span>Cache Write ${s?B(e.cacheWrite):X(n.cacheWrite.cost)}</span>
        <span class="legend-item"><span class="legend-dot cache-read"></span>Cache Read ${s?B(e.cacheRead):X(n.cacheRead.cost)}</span>
      </div>
      <div class="cost-breakdown-total">
        Total: ${s?B(e.totalTokens):X(e.totalCost)}
      </div>
    </div>
  `}function It(e,t,n){return l`
    <div class="usage-insight-card">
      <div class="usage-insight-title">${e}</div>
      ${t.length===0?l`<div class="muted">${n}</div>`:l`
              <div class="usage-list">
                ${t.map(s=>l`
                    <div class="usage-list-item">
                      <span>${s.label}</span>
                      <span class="usage-list-value">
                        <span>${s.value}</span>
                        ${s.sub?l`<span class="usage-list-sub">${s.sub}</span>`:v}
                      </span>
                    </div>
                  `)}
              </div>
            `}
    </div>
  `}function Bo(e,t,n){return l`
    <div class="usage-insight-card">
      <div class="usage-insight-title">${e}</div>
      ${t.length===0?l`<div class="muted">${n}</div>`:l`
              <div class="usage-error-list">
                ${t.map(s=>l`
                    <div class="usage-error-row">
                      <div class="usage-error-date">${s.label}</div>
                      <div class="usage-error-rate">${s.value}</div>
                      ${s.sub?l`<div class="usage-error-sub">${s.sub}</div>`:v}
                    </div>
                  `)}
              </div>
            `}
    </div>
  `}function Wp(e,t,n,s,i,a,o){if(!e)return v;const r=t.messages.total?Math.round(e.totalTokens/t.messages.total):0,c=t.messages.total?e.totalCost/t.messages.total:0,d=e.input+e.cacheRead,g=d>0?e.cacheRead/d:0,p=d>0?`${(g*100).toFixed(1)}%`:"—",h=n.errorRate*100,u=n.throughputTokensPerMin!==void 0?`${B(Math.round(n.throughputTokensPerMin))} tok/min`:"—",f=n.throughputCostPerMin!==void 0?`${X(n.throughputCostPerMin,4)} / min`:"—",m=n.durationCount>0?ia(n.avgDurationMs,{spaced:!0})??"—":"—",w="Cache hit rate = cache read / (input + cache read). Higher is better.",A="Error rate = errors / total messages. Lower is better.",C="Throughput shows tokens per minute over active time. Higher is better.",k="Average tokens per message in this range.",S=s?"Average cost per message when providers report costs. Cost data is missing for some or all sessions in this range.":"Average cost per message when providers report costs.",E=t.daily.filter(R=>R.messages>0&&R.errors>0).map(R=>{const q=R.errors/R.messages;return{label:jl(R.date),value:`${(q*100).toFixed(2)}%`,sub:`${R.errors} errors · ${R.messages} msgs · ${B(R.tokens)}`,rate:q}}).toSorted((R,q)=>q.rate-R.rate).slice(0,5).map(({rate:R,...q})=>q),T=t.byModel.slice(0,5).map(R=>({label:R.model??"unknown",value:X(R.totals.totalCost),sub:`${B(R.totals.totalTokens)} · ${R.count} msgs`})),I=t.byProvider.slice(0,5).map(R=>({label:R.provider??"unknown",value:X(R.totals.totalCost),sub:`${B(R.totals.totalTokens)} · ${R.count} msgs`})),H=t.tools.tools.slice(0,6).map(R=>({label:R.name,value:`${R.count}`,sub:"calls"})),Z=t.byAgent.slice(0,5).map(R=>({label:R.agentId,value:X(R.totals.totalCost),sub:B(R.totals.totalTokens)})),te=t.byChannel.slice(0,5).map(R=>({label:R.channel,value:X(R.totals.totalCost),sub:B(R.totals.totalTokens)}));return l`
    <section class="card" style="margin-top: 16px;">
      <div class="card-title">Usage Overview</div>
      <div class="usage-summary-grid">
        <div class="usage-summary-card">
          <div class="usage-summary-title">
            Messages
            <span class="usage-summary-hint" title="Total user + assistant messages in range.">?</span>
          </div>
          <div class="usage-summary-value">${t.messages.total}</div>
          <div class="usage-summary-sub">
            ${t.messages.user} user · ${t.messages.assistant} assistant
          </div>
        </div>
        <div class="usage-summary-card">
          <div class="usage-summary-title">
            Tool Calls
            <span class="usage-summary-hint" title="Total tool call count across sessions.">?</span>
          </div>
          <div class="usage-summary-value">${t.tools.totalCalls}</div>
          <div class="usage-summary-sub">${t.tools.uniqueTools} tools used</div>
        </div>
        <div class="usage-summary-card">
          <div class="usage-summary-title">
            Errors
            <span class="usage-summary-hint" title="Total message/tool errors in range.">?</span>
          </div>
          <div class="usage-summary-value">${t.messages.errors}</div>
          <div class="usage-summary-sub">${t.messages.toolResults} tool results</div>
        </div>
        <div class="usage-summary-card">
          <div class="usage-summary-title">
            Avg Tokens / Msg
            <span class="usage-summary-hint" title=${k}>?</span>
          </div>
          <div class="usage-summary-value">${B(r)}</div>
          <div class="usage-summary-sub">Across ${t.messages.total||0} messages</div>
        </div>
        <div class="usage-summary-card">
          <div class="usage-summary-title">
            Avg Cost / Msg
            <span class="usage-summary-hint" title=${S}>?</span>
          </div>
          <div class="usage-summary-value">${X(c,4)}</div>
          <div class="usage-summary-sub">${X(e.totalCost)} total</div>
        </div>
        <div class="usage-summary-card">
          <div class="usage-summary-title">
            Sessions
            <span class="usage-summary-hint" title="Distinct sessions in the range.">?</span>
          </div>
          <div class="usage-summary-value">${a}</div>
          <div class="usage-summary-sub">of ${o} in range</div>
        </div>
        <div class="usage-summary-card">
          <div class="usage-summary-title">
            Throughput
            <span class="usage-summary-hint" title=${C}>?</span>
          </div>
          <div class="usage-summary-value">${u}</div>
          <div class="usage-summary-sub">${f}</div>
        </div>
        <div class="usage-summary-card">
          <div class="usage-summary-title">
            Error Rate
            <span class="usage-summary-hint" title=${A}>?</span>
          </div>
          <div class="usage-summary-value ${h>5?"bad":h>1?"warn":"good"}">${h.toFixed(2)}%</div>
          <div class="usage-summary-sub">
            ${t.messages.errors} errors · ${m} avg session
          </div>
        </div>
        <div class="usage-summary-card">
          <div class="usage-summary-title">
            Cache Hit Rate
            <span class="usage-summary-hint" title=${w}>?</span>
          </div>
          <div class="usage-summary-value ${g>.6?"good":g>.3?"warn":"bad"}">${p}</div>
          <div class="usage-summary-sub">
            ${B(e.cacheRead)} cached · ${B(d)} prompt
          </div>
        </div>
      </div>
      <div class="usage-insights-grid">
        ${It("Top Models",T,"No model data")}
        ${It("Top Providers",I,"No provider data")}
        ${It("Top Tools",H,"No tool calls")}
        ${It("Top Agents",Z,"No agent data")}
        ${It("Top Channels",te,"No channel data")}
        ${Bo("Peak Error Days",E,"No error data")}
        ${Bo("Peak Error Hours",i,"No error data")}
      </div>
    </section>
  `}function qp(e,t,n,s,i,a,o,r,c,d,g,p,h,u,f){const m=_=>h.includes(_),w=_=>{const j=_.label||_.key;return j.startsWith("agent:")&&j.includes("?token=")?j.slice(0,j.indexOf("?token=")):j},A=async _=>{const j=w(_);try{await navigator.clipboard.writeText(j)}catch{}},C=_=>{const j=[];return m("channel")&&_.channel&&j.push(`channel:${_.channel}`),m("agent")&&_.agentId&&j.push(`agent:${_.agentId}`),m("provider")&&(_.modelProvider||_.providerOverride)&&j.push(`provider:${_.modelProvider??_.providerOverride}`),m("model")&&_.model&&j.push(`model:${_.model}`),m("messages")&&_.usage?.messageCounts&&j.push(`msgs:${_.usage.messageCounts.total}`),m("tools")&&_.usage?.toolUsage&&j.push(`tools:${_.usage.toolUsage.totalCalls}`),m("errors")&&_.usage?.messageCounts&&j.push(`errors:${_.usage.messageCounts.errors}`),m("duration")&&_.usage?.durationMs&&j.push(`dur:${ia(_.usage.durationMs,{spaced:!0})??"—"}`),j},k=_=>{const j=_.usage;if(!j)return 0;if(n.length>0&&j.dailyBreakdown&&j.dailyBreakdown.length>0){const Q=j.dailyBreakdown.filter(ce=>n.includes(ce.date));return s?Q.reduce((ce,he)=>ce+he.tokens,0):Q.reduce((ce,he)=>ce+he.cost,0)}return s?j.totalTokens??0:j.totalCost??0},S=[...e].toSorted((_,j)=>{switch(i){case"recent":return(j.updatedAt??0)-(_.updatedAt??0);case"messages":return(j.usage?.messageCounts?.total??0)-(_.usage?.messageCounts?.total??0);case"errors":return(j.usage?.messageCounts?.errors??0)-(_.usage?.messageCounts?.errors??0);case"cost":return k(j)-k(_);default:return k(j)-k(_)}}),E=a==="asc"?S.toReversed():S,T=E.reduce((_,j)=>_+k(j),0),I=E.length?T/E.length:0,H=E.reduce((_,j)=>_+(j.usage?.messageCounts?.errors??0),0),Z=(_,j)=>{const Q=k(_),ce=w(_),he=C(_);return l`
      <div
        class="session-bar-row ${j?"selected":""}"
        @click=${M=>c(_.key,M.shiftKey)}
        title="${_.key}"
      >
        <div class="session-bar-label">
          <div class="session-bar-title">${ce}</div>
          ${he.length>0?l`<div class="session-bar-meta">${he.join(" · ")}</div>`:v}
        </div>
        <div class="session-bar-track" style="display: none;"></div>
        <div class="session-bar-actions">
          <button
            class="session-copy-btn"
            title="Copy session name"
            @click=${M=>{M.stopPropagation(),A(_)}}
          >
            Copy
          </button>
          <div class="session-bar-value">${s?B(Q):X(Q)}</div>
        </div>
      </div>
    `},te=new Set(t),R=E.filter(_=>te.has(_.key)),q=R.length,ie=new Map(E.map(_=>[_.key,_])),le=o.map(_=>ie.get(_)).filter(_=>!!_);return l`
    <div class="card sessions-card">
      <div class="sessions-card-header">
        <div class="card-title">Sessions</div>
        <div class="sessions-card-count">
          ${e.length} shown${u!==e.length?` · ${u} total`:""}
        </div>
      </div>
      <div class="sessions-card-meta">
        <div class="sessions-card-stats">
          <span>${s?B(I):X(I)} avg</span>
          <span>${H} errors</span>
        </div>
        <div class="chart-toggle small">
          <button
            class="toggle-btn ${r==="all"?"active":""}"
            @click=${()=>p("all")}
          >
            All
          </button>
          <button
            class="toggle-btn ${r==="recent"?"active":""}"
            @click=${()=>p("recent")}
          >
            Recently viewed
          </button>
        </div>
        <label class="sessions-sort">
          <span>Sort</span>
          <select
            @change=${_=>d(_.target.value)}
          >
            <option value="cost" ?selected=${i==="cost"}>Cost</option>
            <option value="errors" ?selected=${i==="errors"}>Errors</option>
            <option value="messages" ?selected=${i==="messages"}>Messages</option>
            <option value="recent" ?selected=${i==="recent"}>Recent</option>
            <option value="tokens" ?selected=${i==="tokens"}>Tokens</option>
          </select>
        </label>
        <button
          class="btn btn-sm sessions-action-btn icon"
          @click=${()=>g(a==="desc"?"asc":"desc")}
          title=${a==="desc"?"Descending":"Ascending"}
        >
          ${a==="desc"?"↓":"↑"}
        </button>
        ${q>0?l`
                <button class="btn btn-sm sessions-action-btn sessions-clear-btn" @click=${f}>
                  Clear Selection
                </button>
              `:v}
      </div>
      ${r==="recent"?le.length===0?l`
                <div class="muted" style="padding: 20px; text-align: center">No recent sessions</div>
              `:l`
	                <div class="session-bars" style="max-height: 220px; margin-top: 6px;">
	                  ${le.map(_=>Z(_,te.has(_.key)))}
	                </div>
	              `:e.length===0?l`
                <div class="muted" style="padding: 20px; text-align: center">No sessions in range</div>
              `:l`
	                <div class="session-bars">
	                  ${E.slice(0,50).map(_=>Z(_,te.has(_.key)))}
	                  ${e.length>50?l`<div class="muted" style="padding: 8px; text-align: center; font-size: 11px;">+${e.length-50} more</div>`:v}
	                </div>
	              `}
      ${q>1?l`
              <div style="margin-top: 10px;">
                <div class="sessions-card-count">Selected (${q})</div>
                <div class="session-bars" style="max-height: 160px; margin-top: 6px;">
                  ${R.map(_=>Z(_,!0))}
                </div>
              </div>
            `:v}
    </div>
  `}const Vp=.75,Gp=8,Qp=.06,qn=5,Me=12,dt=.7;function ft(e,t){return!t||t<=0?0:e/t*100}function Yp(){return v}function Kl(e){return e<1e12?e*1e3:e}function Zp(e,t,n){const s=Math.min(t,n),i=Math.max(t,n);return e.filter(a=>{if(a.timestamp<=0)return!0;const o=Kl(a.timestamp);return o>=s&&o<=i})}function Jp(e,t,n){const s=t||e.usage;if(!s)return l`
      <div class="muted">No usage data for this session.</div>
    `;const i=p=>p?new Date(p).toLocaleString():"—",a=[];e.channel&&a.push(`channel:${e.channel}`),e.agentId&&a.push(`agent:${e.agentId}`),(e.modelProvider||e.providerOverride)&&a.push(`provider:${e.modelProvider??e.providerOverride}`),e.model&&a.push(`model:${e.model}`);const o=s.toolUsage?.tools.slice(0,6)??[];let r,c,d;if(n){const p=new Map;for(const h of n){const{tools:u}=Ul(h.content);for(const[f]of u)p.set(f,(p.get(f)||0)+1)}d=o.map(h=>({label:h.name,value:`${p.get(h.name)??0}`,sub:"calls"})),r=[...p.values()].reduce((h,u)=>h+u,0),c=p.size}else d=o.map(p=>({label:p.name,value:`${p.count}`,sub:"calls"})),r=s.toolUsage?.totalCalls??0,c=s.toolUsage?.uniqueTools??0;const g=s.modelUsage?.slice(0,6).map(p=>({label:p.model??"unknown",value:X(p.totals.totalCost),sub:B(p.totals.totalTokens)}))??[];return l`
    ${a.length>0?l`<div class="usage-badges">${a.map(p=>l`<span class="usage-badge">${p}</span>`)}</div>`:v}
    <div class="session-summary-grid">
      <div class="session-summary-card">
        <div class="session-summary-title">Messages</div>
        <div class="session-summary-value">${s.messageCounts?.total??0}</div>
        <div class="session-summary-meta">${s.messageCounts?.user??0} user · ${s.messageCounts?.assistant??0} assistant</div>
      </div>
      <div class="session-summary-card">
        <div class="session-summary-title">Tool Calls</div>
        <div class="session-summary-value">${r}</div>
        <div class="session-summary-meta">${c} tools</div>
      </div>
      <div class="session-summary-card">
        <div class="session-summary-title">Errors</div>
        <div class="session-summary-value">${s.messageCounts?.errors??0}</div>
        <div class="session-summary-meta">${s.messageCounts?.toolResults??0} tool results</div>
      </div>
      <div class="session-summary-card">
        <div class="session-summary-title">Duration</div>
        <div class="session-summary-value">${ia(s.durationMs,{spaced:!0})??"—"}</div>
        <div class="session-summary-meta">${i(s.firstActivity)} → ${i(s.lastActivity)}</div>
      </div>
    </div>
    <div class="usage-insights-grid" style="margin-top: 12px;">
      ${It("Top Tools",d,"No tool calls")}
      ${It("Model Mix",g,"No model data")}
    </div>
  `}function Xp(e,t,n,s){const i=Math.min(n,s),a=Math.max(n,s),o=t.filter(m=>m.timestamp>=i&&m.timestamp<=a);if(o.length===0)return;let r=0,c=0,d=0,g=0,p=0,h=0,u=0,f=0;for(const m of o)r+=m.totalTokens||0,c+=m.cost||0,p+=m.input||0,h+=m.output||0,u+=m.cacheRead||0,f+=m.cacheWrite||0,m.output>0&&g++,m.input>0&&d++;return{...e,totalTokens:r,totalCost:c,input:p,output:h,cacheRead:u,cacheWrite:f,durationMs:o[o.length-1].timestamp-o[0].timestamp,firstActivity:o[0].timestamp,lastActivity:o[o.length-1].timestamp,messageCounts:{total:o.length,user:d,assistant:g,toolCalls:0,toolResults:0,errors:0}}}function ef(e,t,n,s,i,a,o,r,c,d,g,p,h,u,f,m,w,A,C,k,S,E,T,I,H,Z){const te=e.label||e.key,R=te.length>50?te.slice(0,50)+"…":te,q=e.usage,ie=r!==null&&c!==null,le=r!==null&&c!==null&&t?.points&&q?Xp(q,t.points,r,c):void 0,_=le?{totalTokens:le.totalTokens,totalCost:le.totalCost}:{totalTokens:q?.totalTokens??0,totalCost:q?.totalCost??0},j=le?" (filtered)":"";return l`
    <div class="card session-detail-panel">
      <div class="session-detail-header">
        <div class="session-detail-header-left">
          <div class="session-detail-title">
            ${R}
            ${j?l`<span style="font-size: 11px; color: var(--muted); margin-left: 8px;">${j}</span>`:v}
          </div>
        </div>
        <div class="session-detail-stats">
          ${q?l`
            <span><strong>${B(_.totalTokens)}</strong> tokens${j}</span>
            <span><strong>${X(_.totalCost)}</strong>${j}</span>
          `:v}
        </div>
        <button class="session-close-btn" @click=${Z} title="Close session details">×</button>
      </div>
      <div class="session-detail-content">
        ${Jp(e,le,r!=null&&c!=null&&u?Zp(u,r,c):void 0)}
        <div class="session-detail-row">
          ${tf(t,n,s,i,a,o,g,p,h,r,c,d)}
        </div>
        <div class="session-detail-bottom">
          ${sf(u,f,m,w,A,C,k,S,E,T,ie?r:null,ie?c:null)}
          ${nf(e.contextWeight,q,I,H)}
        </div>
      </div>
    </div>
  `}function tf(e,t,n,s,i,a,o,r,c,d,g,p){if(t)return l`
      <div class="session-timeseries-compact">
        <div class="muted" style="padding: 20px; text-align: center">Loading...</div>
      </div>
    `;if(!e||e.points.length<2)return l`
      <div class="session-timeseries-compact">
        <div class="muted" style="padding: 20px; text-align: center">No timeline data</div>
      </div>
    `;let h=e.points;if(o||r||c&&c.length>0){const U=o?new Date(o+"T00:00:00").getTime():0,oe=r?new Date(r+"T23:59:59").getTime():1/0;h=e.points.filter(de=>{if(de.timestamp<U||de.timestamp>oe)return!1;if(c&&c.length>0){const ve=new Date(de.timestamp),_e=`${ve.getFullYear()}-${String(ve.getMonth()+1).padStart(2,"0")}-${String(ve.getDate()).padStart(2,"0")}`;return c.includes(_e)}return!0})}if(h.length<2)return l`
      <div class="session-timeseries-compact">
        <div class="muted" style="padding: 20px; text-align: center">No data in range</div>
      </div>
    `;let u=0,f=0,m=0,w=0,A=0,C=0;h=h.map(U=>(u+=U.totalTokens,f+=U.cost,m+=U.output,w+=U.input,A+=U.cacheRead,C+=U.cacheWrite,{...U,cumulativeTokens:u,cumulativeCost:f}));const k=d!=null&&g!=null,S=k?Math.min(d,g):0,E=k?Math.max(d,g):1/0;let T=0,I=h.length;if(k){T=h.findIndex(oe=>oe.timestamp>=S),T===-1&&(T=h.length);const U=h.findIndex(oe=>oe.timestamp>E);I=U===-1?h.length:U}const H=k?h.slice(T,I):h;let Z=0,te=0,R=0,q=0;for(const U of H)Z+=U.output,te+=U.input,R+=U.cacheRead,q+=U.cacheWrite;const ie=400,le=100,_={top:8,right:4,bottom:14,left:30},j=ie-_.left-_.right,Q=le-_.top-_.bottom,ce=n==="cumulative",he=n==="per-turn"&&i==="by-type",M=Z+te+R+q,D=h.map(U=>ce?U.cumulativeTokens:he?U.input+U.output+U.cacheRead+U.cacheWrite:U.totalTokens),F=Math.max(...D,1),K=j/h.length,ue=Math.min(Gp,Math.max(1,K*Vp)),J=K-ue,ae=_.left+T*(ue+J),V=I>=h.length?_.left+(h.length-1)*(ue+J)+ue:_.left+(I-1)*(ue+J)+ue;return l`
    <div class="session-timeseries-compact">
      <div class="timeseries-header-row">
        <div class="card-title" style="font-size: 12px; color: var(--text);">Usage Over Time</div>
        <div class="timeseries-controls">
          ${k?l`
            <div class="chart-toggle small">
              <button class="toggle-btn active" @click=${()=>p?.(null,null)}>Reset</button>
            </div>
          `:v}
          <div class="chart-toggle small">
            <button
              class="toggle-btn ${ce?"":"active"}"
              @click=${()=>s("per-turn")}
            >
              Per Turn
            </button>
            <button
              class="toggle-btn ${ce?"active":""}"
              @click=${()=>s("cumulative")}
            >
              Cumulative
            </button>
          </div>
          ${ce?v:l`
                  <div class="chart-toggle small">
                    <button
                      class="toggle-btn ${i==="total"?"active":""}"
                      @click=${()=>a("total")}
                    >
                      Total
                    </button>
                    <button
                      class="toggle-btn ${i==="by-type"?"active":""}"
                      @click=${()=>a("by-type")}
                    >
                      By Type
                    </button>
                  </div>
                `}
        </div>
      </div>
      <div class="timeseries-chart-wrapper" style="position: relative; cursor: crosshair;">
        <svg 
          viewBox="0 0 ${ie} ${le+18}" 
          class="timeseries-svg" 
          style="width: 100%; height: auto; display: block;"
        >
          <!-- Y axis -->
          <line x1="${_.left}" y1="${_.top}" x2="${_.left}" y2="${_.top+Q}" stroke="var(--border)" />
          <!-- X axis -->
          <line x1="${_.left}" y1="${_.top+Q}" x2="${ie-_.right}" y2="${_.top+Q}" stroke="var(--border)" />
          <!-- Y axis labels -->
          <text x="${_.left-4}" y="${_.top+5}" text-anchor="end" class="ts-axis-label">${B(F)}</text>
          <text x="${_.left-4}" y="${_.top+Q}" text-anchor="end" class="ts-axis-label">0</text>
          <!-- X axis labels (first and last) -->
          ${h.length>0?St`
            <text x="${_.left}" y="${_.top+Q+10}" text-anchor="start" class="ts-axis-label">${new Date(h[0].timestamp).toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"})}</text>
            <text x="${ie-_.right}" y="${_.top+Q+10}" text-anchor="end" class="ts-axis-label">${new Date(h[h.length-1].timestamp).toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"})}</text>
          `:v}
          <!-- Bars -->
          ${h.map((U,oe)=>{const de=D[oe],ve=_.left+oe*(ue+J),_e=de/F*Q,Ve=_.top+Q-_e,me=[new Date(U.timestamp).toLocaleDateString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}),`${B(de)} tokens`];he&&(me.push(`Out ${B(U.output)}`),me.push(`In ${B(U.input)}`),me.push(`CW ${B(U.cacheWrite)}`),me.push(`CR ${B(U.cacheRead)}`));const ze=me.join(" · "),Ge=k&&(oe<T||oe>=I);if(!he)return St`<rect x="${ve}" y="${Ve}" width="${ue}" height="${_e}" class="ts-bar${Ge?" dimmed":""}" rx="1"><title>${ze}</title></rect>`;const Qe=[{value:U.output,cls:"output"},{value:U.input,cls:"input"},{value:U.cacheWrite,cls:"cache-write"},{value:U.cacheRead,cls:"cache-read"}];let Ye=_.top+Q;const ot=Ge?" dimmed":"";return St`
              ${Qe.map(rt=>{if(rt.value<=0||de<=0)return v;const $t=_e*(rt.value/de);return Ye-=$t,St`<rect x="${ve}" y="${Ye}" width="${ue}" height="${$t}" class="ts-bar ${rt.cls}${ot}" rx="1"><title>${ze}</title></rect>`})}
            `})}
          <!-- Selection highlight overlay (always visible between handles) -->
          ${St`
            <rect 
              x="${ae}" 
              y="${_.top}" 
              width="${Math.max(1,V-ae)}" 
              height="${Q}" 
              fill="var(--accent)" 
              opacity="${Qp}" 
              pointer-events="none"
            />
          `}
          <!-- Left cursor line + handle -->
          ${St`
            <line x1="${ae}" y1="${_.top}" x2="${ae}" y2="${_.top+Q}" stroke="var(--accent)" stroke-width="0.8" opacity="0.7" />
            <rect x="${ae-qn/2}" y="${_.top+Q/2-Me/2}" width="${qn}" height="${Me}" rx="1.5" fill="var(--accent)" class="cursor-handle" />
            <line x1="${ae-dt}" y1="${_.top+Q/2-Me/5}" x2="${ae-dt}" y2="${_.top+Q/2+Me/5}" stroke="var(--bg)" stroke-width="0.4" pointer-events="none" />
            <line x1="${ae+dt}" y1="${_.top+Q/2-Me/5}" x2="${ae+dt}" y2="${_.top+Q/2+Me/5}" stroke="var(--bg)" stroke-width="0.4" pointer-events="none" />
          `}
          <!-- Right cursor line + handle -->
          ${St`
            <line x1="${V}" y1="${_.top}" x2="${V}" y2="${_.top+Q}" stroke="var(--accent)" stroke-width="0.8" opacity="0.7" />
            <rect x="${V-qn/2}" y="${_.top+Q/2-Me/2}" width="${qn}" height="${Me}" rx="1.5" fill="var(--accent)" class="cursor-handle" />
            <line x1="${V-dt}" y1="${_.top+Q/2-Me/5}" x2="${V-dt}" y2="${_.top+Q/2+Me/5}" stroke="var(--bg)" stroke-width="0.4" pointer-events="none" />
            <line x1="${V+dt}" y1="${_.top+Q/2-Me/5}" x2="${V+dt}" y2="${_.top+Q/2+Me/5}" stroke="var(--bg)" stroke-width="0.4" pointer-events="none" />
          `}
        </svg>
        <!-- Handle drag zones (only on handles, not full chart) -->
        ${(()=>{const U=`${(ae/ie*100).toFixed(1)}%`,oe=`${(V/ie*100).toFixed(1)}%`,de=ve=>_e=>{if(!p)return;_e.preventDefault(),_e.stopPropagation();const at=_e.currentTarget.closest(".timeseries-chart-wrapper")?.querySelector("svg");if(!at)return;const me=at.getBoundingClientRect(),ze=me.width,Ge=_.left/ie*ze,Ye=(ie-_.right)/ie*ze-Ge,ot=Ue=>{const Ae=Math.max(0,Math.min(1,(Ue-me.left-Ge)/Ye));return Math.min(Math.floor(Ae*h.length),h.length-1)},rt=ve==="left"?ae:V,$t=me.left+rt/ie*ze,Bs=_e.clientX-$t;document.body.style.cursor="col-resize";const Kt=Ue=>{const Ae=Ue.clientX-Bs,on=ot(Ae),Wt=h[on];if(Wt)if(ve==="left"){const ct=g??h[h.length-1].timestamp;p(Math.min(Wt.timestamp,ct),ct)}else{const ct=d??h[0].timestamp;p(ct,Math.max(Wt.timestamp,ct))}},lt=()=>{document.body.style.cursor="",document.removeEventListener("mousemove",Kt),document.removeEventListener("mouseup",lt)};document.addEventListener("mousemove",Kt),document.addEventListener("mouseup",lt)};return l`
            <div class="chart-handle-zone chart-handle-left" 
                 style="left: ${U};"
                 @mousedown=${de("left")}></div>
            <div class="chart-handle-zone chart-handle-right" 
                 style="left: ${oe};"
                 @mousedown=${de("right")}></div>
          `})()}
      </div>
      <div class="timeseries-summary">
        ${k?l`
              <span style="color: var(--accent);">▶ Turns ${T+1}–${I} of ${h.length}</span> · 
              ${new Date(S).toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"})}–${new Date(E).toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"})} · 
              ${B(Z+te+R+q)} · 
              ${X(H.reduce((U,oe)=>U+(oe.cost||0),0))}
            `:l`${h.length} msgs · ${B(u)} · ${X(f)}`}
      </div>
      ${he?l`
              <div style="margin-top: 8px;">
                <div class="card-title" style="font-size: 12px; margin-bottom: 6px; color: var(--text);">Tokens by Type</div>
                <div class="cost-breakdown-bar" style="height: 18px;">
                  <div class="cost-segment output" style="width: ${ft(Z,M).toFixed(1)}%"></div>
                  <div class="cost-segment input" style="width: ${ft(te,M).toFixed(1)}%"></div>
                  <div class="cost-segment cache-write" style="width: ${ft(q,M).toFixed(1)}%"></div>
                  <div class="cost-segment cache-read" style="width: ${ft(R,M).toFixed(1)}%"></div>
                </div>
                <div class="cost-breakdown-legend">
                  <div class="legend-item" title="Assistant output tokens">
                    <span class="legend-dot output"></span>Output ${B(Z)}
                  </div>
                  <div class="legend-item" title="User + tool input tokens">
                    <span class="legend-dot input"></span>Input ${B(te)}
                  </div>
                  <div class="legend-item" title="Tokens written to cache">
                    <span class="legend-dot cache-write"></span>Cache Write ${B(q)}
                  </div>
                  <div class="legend-item" title="Tokens read from cache">
                    <span class="legend-dot cache-read"></span>Cache Read ${B(R)}
                  </div>
                </div>
                <div class="cost-breakdown-total">Total: ${B(M)}</div>
              </div>
            `:v}
    </div>
  `}function nf(e,t,n,s){if(!e)return l`
      <div class="context-details-panel">
        <div class="muted" style="padding: 20px; text-align: center">No context data</div>
      </div>
    `;const i=At(e.systemPrompt.chars),a=At(e.skills.promptChars),o=At(e.tools.listChars+e.tools.schemaChars),r=At(e.injectedWorkspaceFiles.reduce((k,S)=>k+S.injectedChars,0)),c=i+a+o+r;let d="";if(t&&t.totalTokens>0){const k=t.input+t.cacheRead;k>0&&(d=`~${Math.min(c/k*100,100).toFixed(0)}% of input`)}const g=e.skills.entries.toSorted((k,S)=>S.blockChars-k.blockChars),p=e.tools.entries.toSorted((k,S)=>S.summaryChars+S.schemaChars-(k.summaryChars+k.schemaChars)),h=e.injectedWorkspaceFiles.toSorted((k,S)=>S.injectedChars-k.injectedChars),u=4,f=n,m=f?g:g.slice(0,u),w=f?p:p.slice(0,u),A=f?h:h.slice(0,u),C=g.length>u||p.length>u||h.length>u;return l`
    <div class="context-details-panel">
      <div class="context-breakdown-header">
        <div class="card-title" style="font-size: 12px; color: var(--text);">System Prompt Breakdown</div>
        ${C?l`<button class="context-expand-btn" @click=${s}>
                ${f?"Collapse":"Expand all"}
              </button>`:v}
      </div>
      <p class="context-weight-desc">
        ${d||"Base context per message"}
      </p>
      <div class="context-stacked-bar">
        <div class="context-segment system" style="width: ${ft(i,c).toFixed(1)}%" title="System: ~${B(i)}"></div>
        <div class="context-segment skills" style="width: ${ft(a,c).toFixed(1)}%" title="Skills: ~${B(a)}"></div>
        <div class="context-segment tools" style="width: ${ft(o,c).toFixed(1)}%" title="Tools: ~${B(o)}"></div>
        <div class="context-segment files" style="width: ${ft(r,c).toFixed(1)}%" title="Files: ~${B(r)}"></div>
      </div>
      <div class="context-legend">
        <span class="legend-item"><span class="legend-dot system"></span>Sys ~${B(i)}</span>
        <span class="legend-item"><span class="legend-dot skills"></span>Skills ~${B(a)}</span>
        <span class="legend-item"><span class="legend-dot tools"></span>Tools ~${B(o)}</span>
        <span class="legend-item"><span class="legend-dot files"></span>Files ~${B(r)}</span>
      </div>
      <div class="context-total">Total: ~${B(c)}</div>
      <div class="context-breakdown-grid">
        ${g.length>0?(()=>{const k=g.length-m.length;return l`
                  <div class="context-breakdown-card">
                    <div class="context-breakdown-title">Skills (${g.length})</div>
                    <div class="context-breakdown-list">
                      ${m.map(S=>l`
                          <div class="context-breakdown-item">
                            <span class="mono">${S.name}</span>
                            <span class="muted">~${B(At(S.blockChars))}</span>
                          </div>
                        `)}
                    </div>
                    ${k>0?l`<div class="context-breakdown-more">+${k} more</div>`:v}
                  </div>
                `})():v}
        ${p.length>0?(()=>{const k=p.length-w.length;return l`
                  <div class="context-breakdown-card">
                    <div class="context-breakdown-title">Tools (${p.length})</div>
                    <div class="context-breakdown-list">
                      ${w.map(S=>l`
                          <div class="context-breakdown-item">
                            <span class="mono">${S.name}</span>
                            <span class="muted">~${B(At(S.summaryChars+S.schemaChars))}</span>
                          </div>
                        `)}
                    </div>
                    ${k>0?l`<div class="context-breakdown-more">+${k} more</div>`:v}
                  </div>
                `})():v}
        ${h.length>0?(()=>{const k=h.length-A.length;return l`
                  <div class="context-breakdown-card">
                    <div class="context-breakdown-title">Files (${h.length})</div>
                    <div class="context-breakdown-list">
                      ${A.map(S=>l`
                          <div class="context-breakdown-item">
                            <span class="mono">${S.name}</span>
                            <span class="muted">~${B(At(S.injectedChars))}</span>
                          </div>
                        `)}
                    </div>
                    ${k>0?l`<div class="context-breakdown-more">+${k} more</div>`:v}
                  </div>
                `})():v}
      </div>
    </div>
  `}function sf(e,t,n,s,i,a,o,r,c,d,g,p){if(t)return l`
      <div class="session-logs-compact">
        <div class="session-logs-header">Conversation</div>
        <div class="muted" style="padding: 20px; text-align: center">Loading...</div>
      </div>
    `;if(!e||e.length===0)return l`
      <div class="session-logs-compact">
        <div class="session-logs-header">Conversation</div>
        <div class="muted" style="padding: 20px; text-align: center">No messages</div>
      </div>
    `;const h=i.query.trim().toLowerCase(),u=e.map(E=>{const T=Ul(E.content),I=T.cleanContent||E.content;return{log:E,toolInfo:T,cleanContent:I}}),f=Array.from(new Set(u.flatMap(E=>E.toolInfo.tools.map(([T])=>T)))).toSorted((E,T)=>E.localeCompare(T)),m=u.filter(E=>{if(g!=null&&p!=null){const T=E.log.timestamp;if(T>0){const I=Math.min(g,p),H=Math.max(g,p),Z=Kl(T);if(Z<I||Z>H)return!1}}return!(i.roles.length>0&&!i.roles.includes(E.log.role)||i.hasTools&&E.toolInfo.tools.length===0||i.tools.length>0&&!E.toolInfo.tools.some(([I])=>i.tools.includes(I))||h&&!E.cleanContent.toLowerCase().includes(h))}),w=i.roles.length>0||i.tools.length>0||i.hasTools||h,A=g!=null&&p!=null,C=w||A?`${m.length} of ${e.length} ${A?"(timeline filtered)":""}`:`${e.length}`,k=new Set(i.roles),S=new Set(i.tools);return l`
    <div class="session-logs-compact">
      <div class="session-logs-header">
        <span>Conversation <span style="font-weight: normal; color: var(--muted);">(${C} messages)</span></span>
        <button class="btn btn-sm usage-action-btn usage-secondary-btn" @click=${s}>
          ${n?"Collapse All":"Expand All"}
        </button>
      </div>
      <div class="usage-filters-inline" style="margin: 10px 12px;">
        <select
          multiple
          size="4"
          @change=${E=>a(Array.from(E.target.selectedOptions).map(T=>T.value))}
        >
          <option value="user" ?selected=${k.has("user")}>User</option>
          <option value="assistant" ?selected=${k.has("assistant")}>Assistant</option>
          <option value="tool" ?selected=${k.has("tool")}>Tool</option>
          <option value="toolResult" ?selected=${k.has("toolResult")}>Tool result</option>
        </select>
        <select
          multiple
          size="4"
          @change=${E=>o(Array.from(E.target.selectedOptions).map(T=>T.value))}
        >
          ${f.map(E=>l`<option value=${E} ?selected=${S.has(E)}>${E}</option>`)}
        </select>
        <label class="usage-filters-inline" style="gap: 6px;">
          <input
            type="checkbox"
            .checked=${i.hasTools}
            @change=${E=>r(E.target.checked)}
          />
          Has tools
        </label>
        <input
          type="text"
          placeholder="Search conversation"
          .value=${i.query}
          @input=${E=>c(E.target.value)}
        />
        <button class="btn btn-sm usage-action-btn usage-secondary-btn" @click=${d}>
          Clear
        </button>
      </div>
      <div class="session-logs-list">
        ${m.map(E=>{const{log:T,toolInfo:I,cleanContent:H}=E,Z=T.role==="user"?"user":"assistant",te=T.role==="user"?"You":T.role==="assistant"?"Assistant":"Tool";return l`
          <div class="session-log-entry ${Z}">
            <div class="session-log-meta">
              <span class="session-log-role">${te}</span>
              <span>${new Date(T.timestamp).toLocaleString()}</span>
              ${T.tokens?l`<span>${B(T.tokens)}</span>`:v}
            </div>
            <div class="session-log-content">${H}</div>
            ${I.tools.length>0?l`
                    <details class="session-log-tools" ?open=${n}>
                      <summary>${I.summary}</summary>
                      <div class="session-log-tools-list">
                        ${I.tools.map(([R,q])=>l`
                            <span class="session-log-tools-pill">${R} × ${q}</span>
                          `)}
                      </div>
                    </details>
                  `:v}
          </div>
        `})}
        ${m.length===0?l`
                <div class="muted" style="padding: 12px">No messages match the filters.</div>
              `:v}
      </div>
    </div>
  `}const af=`
  .usage-page-header {
    margin: 4px 0 12px;
  }
  .usage-page-title {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 4px;
  }
  .usage-page-subtitle {
    font-size: 13px;
    color: var(--muted);
    margin: 0 0 12px;
  }
  /* ===== FILTERS & HEADER ===== */
  .usage-filters-inline {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
  .usage-filters-inline select {
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg);
    color: var(--text);
    font-size: 13px;
  }
  .usage-filters-inline input[type="date"] {
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg);
    color: var(--text);
    font-size: 13px;
  }
  .usage-filters-inline input[type="text"] {
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg);
    color: var(--text);
    font-size: 13px;
    min-width: 180px;
  }
  .usage-filters-inline .btn-sm {
    padding: 6px 12px;
    font-size: 14px;
  }
  .usage-refresh-indicator {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: rgba(255, 77, 77, 0.1);
    border-radius: 4px;
    font-size: 12px;
    color: #ff4d4d;
  }
  .usage-refresh-indicator::before {
    content: "";
    width: 10px;
    height: 10px;
    border: 2px solid #ff4d4d;
    border-top-color: transparent;
    border-radius: 50%;
    animation: usage-spin 0.6s linear infinite;
  }
  @keyframes usage-spin {
    to { transform: rotate(360deg); }
  }
  .active-filters {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .filter-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px 4px 12px;
    background: var(--accent-subtle);
    border: 1px solid var(--accent);
    border-radius: 16px;
    font-size: 12px;
  }
  .filter-chip-label {
    color: var(--accent);
    font-weight: 500;
  }
  .filter-chip-remove {
    background: none;
    border: none;
    color: var(--accent);
    cursor: pointer;
    padding: 2px 4px;
    font-size: 14px;
    line-height: 1;
    opacity: 0.7;
    transition: opacity 0.15s;
  }
  .filter-chip-remove:hover {
    opacity: 1;
  }
  .filter-clear-btn {
    padding: 4px 10px !important;
    font-size: 12px !important;
    line-height: 1 !important;
    margin-left: 8px;
  }
  .usage-query-bar {
    display: grid;
    grid-template-columns: minmax(220px, 1fr) auto;
    gap: 10px;
    align-items: center;
    /* Keep the dropdown filter row from visually touching the query row. */
    margin-bottom: 10px;
  }
  .usage-query-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: nowrap;
    justify-self: end;
  }
  .usage-query-actions .btn {
    height: 34px;
    padding: 0 14px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 13px;
    line-height: 1;
    border: 1px solid var(--border);
    background: var(--bg-secondary);
    color: var(--text);
    box-shadow: none;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }
  .usage-query-actions .btn:hover {
    background: var(--bg);
    border-color: var(--border-strong);
  }
  .usage-action-btn {
    height: 34px;
    padding: 0 14px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 13px;
    line-height: 1;
    border: 1px solid var(--border);
    background: var(--bg-secondary);
    color: var(--text);
    box-shadow: none;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }
  .usage-action-btn:hover {
    background: var(--bg);
    border-color: var(--border-strong);
  }
  .usage-primary-btn {
    background: #ff4d4d;
    color: #fff;
    border-color: #ff4d4d;
    box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.12);
  }
  .btn.usage-primary-btn {
    background: #ff4d4d !important;
    border-color: #ff4d4d !important;
    color: #fff !important;
  }
  .usage-primary-btn:hover {
    background: #e64545;
    border-color: #e64545;
  }
  .btn.usage-primary-btn:hover {
    background: #e64545 !important;
    border-color: #e64545 !important;
  }
  .usage-primary-btn:disabled {
    background: rgba(255, 77, 77, 0.18);
    border-color: rgba(255, 77, 77, 0.3);
    color: #ff4d4d;
    box-shadow: none;
    cursor: default;
    opacity: 1;
  }
  .usage-primary-btn[disabled] {
    background: rgba(255, 77, 77, 0.18) !important;
    border-color: rgba(255, 77, 77, 0.3) !important;
    color: #ff4d4d !important;
    opacity: 1 !important;
  }
  .usage-secondary-btn {
    background: var(--bg-secondary);
    color: var(--text);
    border-color: var(--border);
  }
  .usage-query-input {
    width: 100%;
    min-width: 220px;
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg);
    color: var(--text);
    font-size: 13px;
  }
  .usage-query-suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 6px;
  }
  .usage-query-suggestion {
    padding: 4px 8px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--bg-secondary);
    font-size: 11px;
    color: var(--text);
    cursor: pointer;
    transition: background 0.15s;
  }
  .usage-query-suggestion:hover {
    background: var(--bg-hover);
  }
  .usage-filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-top: 14px;
  }
  details.usage-filter-select {
    position: relative;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 6px 10px;
    background: var(--bg);
    font-size: 12px;
    min-width: 140px;
  }
  details.usage-filter-select summary {
    cursor: pointer;
    list-style: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    font-weight: 500;
  }
  details.usage-filter-select summary::-webkit-details-marker {
    display: none;
  }
  .usage-filter-badge {
    font-size: 11px;
    color: var(--muted);
  }
  .usage-filter-popover {
    position: absolute;
    left: 0;
    top: calc(100% + 6px);
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    min-width: 220px;
    z-index: 20;
  }
  .usage-filter-actions {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
  }
  .usage-filter-actions button {
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 11px;
  }
  .usage-filter-options {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 200px;
    overflow: auto;
  }
  .usage-filter-option {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
  }
  .usage-query-hint {
    font-size: 11px;
    color: var(--muted);
  }
  .usage-query-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 6px;
  }
  .usage-query-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--bg-secondary);
    font-size: 11px;
  }
  .usage-query-chip button {
    background: none;
    border: none;
    color: var(--muted);
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }
  .usage-header {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: var(--bg);
  }
  .usage-header.pinned {
    position: sticky;
    top: 12px;
    z-index: 6;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  }
  .usage-pin-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--bg-secondary);
    font-size: 11px;
    color: var(--text);
    cursor: pointer;
  }
  .usage-pin-btn.active {
    background: var(--accent-subtle);
    border-color: var(--accent);
    color: var(--accent);
  }
  .usage-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .usage-header-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .usage-header-metrics {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .usage-metric-badge {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: transparent;
    font-size: 11px;
    color: var(--muted);
  }
  .usage-metric-badge strong {
    font-size: 12px;
    color: var(--text);
  }
  .usage-controls {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .usage-controls .active-filters {
    flex: 1 1 100%;
  }
  .usage-controls input[type="date"] {
    min-width: 140px;
  }
  .usage-presets {
    display: inline-flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .usage-presets .btn {
    padding: 4px 8px;
    font-size: 11px;
  }
  .usage-quick-filters {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
  .usage-select {
    min-width: 120px;
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg);
    color: var(--text);
    font-size: 12px;
  }
  .usage-export-menu summary {
    cursor: pointer;
    font-weight: 500;
    color: var(--text);
    list-style: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .usage-export-menu summary::-webkit-details-marker {
    display: none;
  }
  .usage-export-menu {
    position: relative;
  }
  .usage-export-button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg);
    font-size: 12px;
  }
  .usage-export-popover {
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 8px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    min-width: 160px;
    z-index: 10;
  }
  .usage-export-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .usage-export-item {
    text-align: left;
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg-secondary);
    font-size: 12px;
  }
  .usage-summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin-top: 12px;
  }
  .usage-summary-card {
    padding: 12px;
    border-radius: 8px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }
  .usage-mosaic {
    margin-top: 16px;
    padding: 16px;
  }
  .usage-mosaic-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }
  .usage-mosaic-title {
    font-weight: 600;
  }
  .usage-mosaic-sub {
    font-size: 12px;
    color: var(--muted);
  }
  .usage-mosaic-grid {
    display: grid;
    grid-template-columns: minmax(200px, 1fr) minmax(260px, 2fr);
    gap: 16px;
    align-items: start;
  }
  .usage-mosaic-section {
    background: var(--bg-subtle);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px;
  }
  .usage-mosaic-section-title {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .usage-mosaic-total {
    font-size: 20px;
    font-weight: 700;
  }
  .usage-daypart-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
    gap: 8px;
  }
  .usage-daypart-cell {
    border-radius: 8px;
    padding: 10px;
    color: var(--text);
    background: rgba(255, 77, 77, 0.08);
    border: 1px solid rgba(255, 77, 77, 0.2);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .usage-daypart-label {
    font-size: 12px;
    font-weight: 600;
  }
  .usage-daypart-value {
    font-size: 14px;
  }
  .usage-hour-grid {
    display: grid;
    grid-template-columns: repeat(24, minmax(6px, 1fr));
    gap: 4px;
  }
  .usage-hour-cell {
    height: 28px;
    border-radius: 6px;
    background: rgba(255, 77, 77, 0.1);
    border: 1px solid rgba(255, 77, 77, 0.2);
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .usage-hour-cell.selected {
    border-color: rgba(255, 77, 77, 0.8);
    box-shadow: 0 0 0 2px rgba(255, 77, 77, 0.2);
  }
  .usage-hour-labels {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 6px;
    margin-top: 8px;
    font-size: 11px;
    color: var(--muted);
  }
  .usage-hour-legend {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 10px;
    font-size: 11px;
    color: var(--muted);
  }
  .usage-hour-legend span {
    display: inline-block;
    width: 14px;
    height: 10px;
    border-radius: 4px;
    background: rgba(255, 77, 77, 0.15);
    border: 1px solid rgba(255, 77, 77, 0.2);
  }
  .usage-calendar-labels {
    display: grid;
    grid-template-columns: repeat(7, minmax(10px, 1fr));
    gap: 6px;
    font-size: 10px;
    color: var(--muted);
    margin-bottom: 6px;
  }
  .usage-calendar {
    display: grid;
    grid-template-columns: repeat(7, minmax(10px, 1fr));
    gap: 6px;
  }
  .usage-calendar-cell {
    height: 18px;
    border-radius: 4px;
    border: 1px solid rgba(255, 77, 77, 0.2);
    background: rgba(255, 77, 77, 0.08);
  }
  .usage-calendar-cell.empty {
    background: transparent;
    border-color: transparent;
  }
  .usage-summary-title {
    font-size: 11px;
    color: var(--muted);
    margin-bottom: 6px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .usage-info {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    margin-left: 6px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--bg);
    font-size: 10px;
    color: var(--muted);
    cursor: help;
  }
  .usage-summary-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-strong);
  }
  .usage-summary-value.good {
    color: #1f8f4e;
  }
  .usage-summary-value.warn {
    color: #c57a00;
  }
  .usage-summary-value.bad {
    color: #c9372c;
  }
  .usage-summary-hint {
    font-size: 10px;
    color: var(--muted);
    cursor: help;
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 0 6px;
    line-height: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .usage-summary-sub {
    font-size: 11px;
    color: var(--muted);
    margin-top: 4px;
  }
  .usage-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .usage-list-item {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 12px;
    color: var(--text);
    align-items: flex-start;
  }
  .usage-list-value {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    text-align: right;
  }
  .usage-list-sub {
    font-size: 11px;
    color: var(--muted);
  }
  .usage-list-item.button {
    border: none;
    background: transparent;
    padding: 0;
    text-align: left;
    cursor: pointer;
  }
  .usage-list-item.button:hover {
    color: var(--text-strong);
  }
`,of=`
  .usage-list-item .muted {
    font-size: 11px;
  }
  .usage-error-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .usage-error-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
    align-items: center;
    font-size: 12px;
  }
  .usage-error-date {
    font-weight: 600;
  }
  .usage-error-rate {
    font-variant-numeric: tabular-nums;
  }
  .usage-error-sub {
    grid-column: 1 / -1;
    font-size: 11px;
    color: var(--muted);
  }
  .usage-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
  }
  .usage-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    border: 1px solid var(--border);
    border-radius: 999px;
    font-size: 11px;
    background: var(--bg);
    color: var(--text);
  }
  .usage-meta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;
  }
  .usage-meta-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
  }
  .usage-meta-item span {
    color: var(--muted);
    font-size: 11px;
  }
  .usage-insights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin-top: 12px;
  }
  .usage-insight-card {
    padding: 14px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--bg-secondary);
  }
  .usage-insight-title {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 10px;
  }
  .usage-insight-subtitle {
    font-size: 11px;
    color: var(--muted);
    margin-top: 6px;
  }
  /* ===== CHART TOGGLE ===== */
  .chart-toggle {
    display: flex;
    background: var(--bg);
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid var(--border);
  }
  .chart-toggle .toggle-btn {
    padding: 6px 14px;
    font-size: 13px;
    background: transparent;
    border: none;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s;
  }
  .chart-toggle .toggle-btn:hover {
    color: var(--text);
  }
  .chart-toggle .toggle-btn.active {
    background: #ff4d4d;
    color: white;
  }
  .chart-toggle.small .toggle-btn {
    padding: 4px 8px;
    font-size: 11px;
  }
  .sessions-toggle {
    border-radius: 4px;
  }
  .sessions-toggle .toggle-btn {
    border-radius: 4px;
  }
  .daily-chart-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    margin-bottom: 6px;
  }

  /* ===== DAILY BAR CHART ===== */
  .daily-chart {
    margin-top: 12px;
  }
  .daily-chart-bars {
    display: flex;
    align-items: flex-end;
    height: 200px;
    gap: 4px;
    padding: 8px 4px 36px;
  }
  .daily-bar-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    justify-content: flex-end;
    cursor: pointer;
    position: relative;
    border-radius: 4px 4px 0 0;
    transition: background 0.15s;
    min-width: 0;
  }
  .daily-bar-wrapper:hover {
    background: var(--bg-hover);
  }
  .daily-bar-wrapper.selected {
    background: var(--accent-subtle);
  }
  .daily-bar-wrapper.selected .daily-bar {
    background: var(--accent);
  }
  .daily-bar {
    width: 100%;
    max-width: var(--bar-max-width, 32px);
    background: #ff4d4d;
    border-radius: 3px 3px 0 0;
    min-height: 2px;
    transition: all 0.15s;
    overflow: hidden;
  }
  .daily-bar-wrapper:hover .daily-bar {
    background: #cc3d3d;
  }
  .daily-bar-label {
    position: absolute;
    bottom: -28px;
    font-size: 10px;
    color: var(--muted);
    white-space: nowrap;
    text-align: center;
    transform: rotate(-35deg);
    transform-origin: top center;
  }
  .daily-bar-total {
    position: absolute;
    top: -16px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10px;
    color: var(--muted);
    white-space: nowrap;
  }
  .daily-bar-tooltip {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
  }
  .daily-bar-wrapper:hover .daily-bar-tooltip {
    opacity: 1;
  }

  /* ===== COST/TOKEN BREAKDOWN BAR ===== */
  .cost-breakdown {
    margin-top: 18px;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: 8px;
  }
  .cost-breakdown-header {
    font-weight: 600;
    font-size: 15px;
    letter-spacing: -0.02em;
    margin-bottom: 12px;
    color: var(--text-strong);
  }
  .cost-breakdown-bar {
    height: 28px;
    background: var(--bg);
    border-radius: 6px;
    overflow: hidden;
    display: flex;
  }
  .cost-segment {
    height: 100%;
    transition: width 0.3s ease;
    position: relative;
  }
  .cost-segment.output {
    background: #ef4444;
  }
  .cost-segment.input {
    background: #f59e0b;
  }
  .cost-segment.cache-write {
    background: #10b981;
  }
  .cost-segment.cache-read {
    background: #06b6d4;
  }
  .cost-breakdown-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 12px;
  }
  .cost-breakdown-total {
    margin-top: 10px;
    font-size: 12px;
    color: var(--muted);
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text);
    cursor: help;
  }
  .legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    flex-shrink: 0;
  }
  .legend-dot.output {
    background: #ef4444;
  }
  .legend-dot.input {
    background: #f59e0b;
  }
  .legend-dot.cache-write {
    background: #10b981;
  }
  .legend-dot.cache-read {
    background: #06b6d4;
  }
  .legend-dot.system {
    background: #ff4d4d;
  }
  .legend-dot.skills {
    background: #8b5cf6;
  }
  .legend-dot.tools {
    background: #ec4899;
  }
  .legend-dot.files {
    background: #f59e0b;
  }
  .cost-breakdown-note {
    margin-top: 10px;
    font-size: 11px;
    color: var(--muted);
    line-height: 1.4;
  }

  /* ===== SESSION BARS (scrollable list) ===== */
  .session-bars {
    margin-top: 16px;
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
  }
  .session-bar-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.15s;
  }
  .session-bar-row:last-child {
    border-bottom: none;
  }
  .session-bar-row:hover {
    background: var(--bg-hover);
  }
  .session-bar-row.selected {
    background: var(--accent-subtle);
  }
  .session-bar-label {
    flex: 1 1 auto;
    min-width: 0;
    font-size: 13px;
    color: var(--text);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .session-bar-title {
    /* Prefer showing the full name; wrap instead of truncating. */
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  .session-bar-meta {
    font-size: 10px;
    color: var(--muted);
    font-weight: 400;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .session-bar-track {
    flex: 0 0 90px;
    height: 6px;
    background: var(--bg-secondary);
    border-radius: 4px;
    overflow: hidden;
    opacity: 0.6;
  }
  .session-bar-fill {
    height: 100%;
    background: rgba(255, 77, 77, 0.7);
    border-radius: 4px;
    transition: width 0.3s ease;
  }
  .session-bar-value {
    flex: 0 0 70px;
    text-align: right;
    font-size: 12px;
    font-family: var(--font-mono);
    color: var(--muted);
  }
  .session-bar-actions {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
  }
  .session-copy-btn {
    height: 26px;
    padding: 0 10px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--bg-secondary);
    font-size: 11px;
    font-weight: 600;
    color: var(--muted);
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }
  .session-copy-btn:hover {
    background: var(--bg);
    border-color: var(--border-strong);
    color: var(--text);
  }

  /* ===== TIME SERIES CHART ===== */
  .session-timeseries {
    margin-top: 24px;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: 8px;
  }
  .timeseries-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .timeseries-controls {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .timeseries-header {
    font-weight: 600;
    color: var(--text);
  }
  .timeseries-chart {
    width: 100%;
    overflow: hidden;
  }
  .timeseries-svg {
    width: 100%;
    height: auto;
    display: block;
  }
  .timeseries-svg .axis-label {
    font-size: 10px;
    fill: var(--muted);
  }
  .timeseries-svg .ts-area {
    fill: #ff4d4d;
    fill-opacity: 0.1;
  }
  .timeseries-svg .ts-line {
    fill: none;
    stroke: #ff4d4d;
    stroke-width: 2;
  }
  .timeseries-svg .ts-dot {
    fill: #ff4d4d;
    transition: r 0.15s, fill 0.15s;
  }
  .timeseries-svg .ts-dot:hover {
    r: 5;
  }
  .timeseries-svg .ts-bar {
    fill: #ff4d4d;
    transition: fill 0.15s;
  }
  .timeseries-svg .ts-bar:hover {
    fill: #cc3d3d;
  }
  .timeseries-svg .ts-bar.output { fill: #ef4444; }
  .timeseries-svg .ts-bar.input { fill: #f59e0b; }
  .timeseries-svg .ts-bar.cache-write { fill: #10b981; }
  .timeseries-svg .ts-bar.cache-read { fill: #06b6d4; }
  .timeseries-summary {
    margin-top: 12px;
    font-size: 13px;
    color: var(--muted);
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .timeseries-loading {
    padding: 24px;
    text-align: center;
    color: var(--muted);
  }

  /* ===== SESSION LOGS ===== */
  .session-logs {
    margin-top: 24px;
    background: var(--bg-secondary);
    border-radius: 8px;
    overflow: hidden;
  }
  .session-logs-header {
    padding: 10px 14px;
    font-weight: 600;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    background: var(--bg-secondary);
  }
  .session-logs-loading {
    padding: 24px;
    text-align: center;
    color: var(--muted);
  }
  .session-logs-list {
    max-height: 400px;
    overflow-y: auto;
  }
  .session-log-entry {
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: var(--bg);
  }
  .session-log-entry:last-child {
    border-bottom: none;
  }
  .session-log-entry.user {
    border-left: 3px solid var(--accent);
  }
  .session-log-entry.assistant {
    border-left: 3px solid var(--border-strong);
  }
  .session-log-meta {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 11px;
    color: var(--muted);
    flex-wrap: wrap;
  }
  .session-log-role {
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 999px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }
  .session-log-entry.user .session-log-role {
    color: var(--accent);
  }
  .session-log-entry.assistant .session-log-role {
    color: var(--muted);
  }
  .session-log-content {
    font-size: 13px;
    line-height: 1.5;
    color: var(--text);
    white-space: pre-wrap;
    word-break: break-word;
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 8px 10px;
    border: 1px solid var(--border);
    max-height: 220px;
    overflow-y: auto;
  }

  /* ===== CONTEXT WEIGHT BREAKDOWN ===== */
  .context-weight-breakdown {
    margin-top: 24px;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: 8px;
  }
  .context-weight-breakdown .context-weight-header {
    font-weight: 600;
    font-size: 13px;
    margin-bottom: 4px;
    color: var(--text);
  }
  .context-weight-desc {
    font-size: 12px;
    color: var(--muted);
    margin: 0 0 12px 0;
  }
  .context-stacked-bar {
    height: 24px;
    background: var(--bg);
    border-radius: 6px;
    overflow: hidden;
    display: flex;
  }
  .context-segment {
    height: 100%;
    transition: width 0.3s ease;
  }
  .context-segment.system {
    background: #ff4d4d;
  }
  .context-segment.skills {
    background: #8b5cf6;
  }
  .context-segment.tools {
    background: #ec4899;
  }
  .context-segment.files {
    background: #f59e0b;
  }
  .context-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 12px;
  }
  .context-total {
    margin-top: 10px;
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
  }
  .context-details {
    margin-top: 12px;
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
  }
  .context-details summary {
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
  }
  .context-details[open] summary {
    border-bottom: 1px solid var(--border);
  }
  .context-list {
    max-height: 200px;
    overflow-y: auto;
  }
  .context-list-header {
    display: flex;
    justify-content: space-between;
    padding: 8px 14px;
    font-size: 11px;
    text-transform: uppercase;
    color: var(--muted);
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
  }
  .context-list-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 14px;
    font-size: 12px;
    border-bottom: 1px solid var(--border);
  }
  .context-list-item:last-child {
    border-bottom: none;
  }
  .context-list-item .mono {
    font-family: var(--font-mono);
    color: var(--text);
  }
  .context-list-item .muted {
    color: var(--muted);
    font-family: var(--font-mono);
  }

  /* ===== NO CONTEXT NOTE ===== */
  .no-context-note {
    margin-top: 24px;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: 8px;
    font-size: 13px;
    color: var(--muted);
    line-height: 1.5;
  }

  /* ===== TWO COLUMN LAYOUT ===== */
  .usage-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    margin-top: 18px;
    align-items: stretch;
  }
  .usage-grid-left {
    display: flex;
    flex-direction: column;
  }
  .usage-grid-right {
    display: flex;
    flex-direction: column;
  }
  
  /* ===== LEFT CARD (Daily + Breakdown) ===== */
  .usage-left-card {
    /* inherits background, border, shadow from .card */
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .usage-left-card .daily-chart-bars {
    flex: 1;
    min-height: 200px;
  }
  .usage-left-card .sessions-panel-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 12px;
  }
`,rf=`
  
  /* ===== COMPACT DAILY CHART ===== */
  .daily-chart-compact {
    margin-bottom: 16px;
  }
  .daily-chart-compact .sessions-panel-title {
    margin-bottom: 8px;
  }
  .daily-chart-compact .daily-chart-bars {
    height: 100px;
    padding-bottom: 20px;
  }
  
  /* ===== COMPACT COST BREAKDOWN ===== */
  .cost-breakdown-compact {
    padding: 0;
    margin: 0;
    background: transparent;
    border-top: 1px solid var(--border);
    padding-top: 12px;
  }
  .cost-breakdown-compact .cost-breakdown-header {
    margin-bottom: 8px;
  }
  .cost-breakdown-compact .cost-breakdown-legend {
    gap: 12px;
  }
  .cost-breakdown-compact .cost-breakdown-note {
    display: none;
  }
  
  /* ===== SESSIONS CARD ===== */
  .sessions-card {
    /* inherits background, border, shadow from .card */
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .sessions-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .sessions-card-title {
    font-weight: 600;
    font-size: 14px;
  }
  .sessions-card-count {
    font-size: 12px;
    color: var(--muted);
  }
  .sessions-card-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 8px 0 10px;
    font-size: 12px;
    color: var(--muted);
  }
  .sessions-card-stats {
    display: inline-flex;
    gap: 12px;
  }
  .sessions-sort {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--muted);
  }
  .sessions-sort select {
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    font-size: 12px;
  }
  .sessions-action-btn {
    height: 28px;
    padding: 0 10px;
    border-radius: 8px;
    font-size: 12px;
    line-height: 1;
  }
  .sessions-action-btn.icon {
    width: 32px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .sessions-card-hint {
    font-size: 11px;
    color: var(--muted);
    margin-bottom: 8px;
  }
  .sessions-card .session-bars {
    max-height: 280px;
    background: var(--bg);
    border-radius: 6px;
    border: 1px solid var(--border);
    margin: 0;
    overflow-y: auto;
    padding: 8px;
  }
  .sessions-card .session-bar-row {
    padding: 6px 8px;
    border-radius: 6px;
    margin-bottom: 3px;
    border: 1px solid transparent;
    transition: all 0.15s;
  }
  .sessions-card .session-bar-row:hover {
    border-color: var(--border);
    background: var(--bg-hover);
  }
  .sessions-card .session-bar-row.selected {
    border-color: var(--accent);
    background: var(--accent-subtle);
    box-shadow: inset 0 0 0 1px rgba(255, 77, 77, 0.15);
  }
  .sessions-card .session-bar-label {
    flex: 1 1 auto;
    min-width: 140px;
    font-size: 12px;
  }
  .sessions-card .session-bar-value {
    flex: 0 0 60px;
    font-size: 11px;
    font-weight: 600;
  }
  .sessions-card .session-bar-track {
    flex: 0 0 70px;
    height: 5px;
    opacity: 0.5;
  }
  .sessions-card .session-bar-fill {
    background: rgba(255, 77, 77, 0.55);
  }
  .sessions-clear-btn {
    margin-left: auto;
  }
  
  /* ===== EMPTY DETAIL STATE ===== */
  .session-detail-empty {
    margin-top: 18px;
    background: var(--bg-secondary);
    border-radius: 8px;
    border: 2px dashed var(--border);
    padding: 32px;
    text-align: center;
  }
  .session-detail-empty-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 8px;
  }
  .session-detail-empty-desc {
    font-size: 13px;
    color: var(--muted);
    margin-bottom: 16px;
    line-height: 1.5;
  }
  .session-detail-empty-features {
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
  }
  .session-detail-empty-feature {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--muted);
  }
  .session-detail-empty-feature .icon {
    font-size: 16px;
  }
  
  /* ===== SESSION DETAIL PANEL ===== */
  .session-detail-panel {
    margin-top: 12px;
    /* inherits background, border-radius, shadow from .card */
    border: 2px solid var(--accent) !important;
  }
  .session-detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
  }
  .session-detail-header:hover {
    background: var(--bg-hover);
  }
  .session-detail-title {
    font-weight: 600;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .session-detail-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .session-close-btn {
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--text);
    cursor: pointer;
    padding: 2px 8px;
    font-size: 16px;
    line-height: 1;
    border-radius: 4px;
    transition: background 0.15s, color 0.15s;
  }
  .session-close-btn:hover {
    background: var(--bg-hover);
    color: var(--text);
    border-color: var(--accent);
  }
  .session-detail-stats {
    display: flex;
    gap: 10px;
    font-size: 12px;
    color: var(--muted);
  }
  .session-detail-stats strong {
    color: var(--text);
    font-family: var(--font-mono);
  }
  .session-detail-content {
    padding: 12px;
  }
  .session-summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 8px;
    margin-bottom: 12px;
  }
  .session-summary-card {
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px;
    background: var(--bg-secondary);
  }
  .session-summary-title {
    font-size: 11px;
    color: var(--muted);
    margin-bottom: 4px;
  }
  .session-summary-value {
    font-size: 14px;
    font-weight: 600;
  }
  .session-summary-meta {
    font-size: 11px;
    color: var(--muted);
    margin-top: 4px;
  }
  .session-detail-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    /* Separate "Usage Over Time" from the summary + Top Tools/Model Mix cards above. */
    margin-top: 12px;
    margin-bottom: 10px;
  }
  .session-detail-bottom {
    display: grid;
    grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr);
    gap: 10px;
    align-items: stretch;
  }
  .session-detail-bottom .session-logs-compact {
    margin: 0;
    display: flex;
    flex-direction: column;
  }
  .session-detail-bottom .session-logs-compact .session-logs-list {
    flex: 1 1 auto;
    max-height: none;
  }
  .context-details-panel {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--bg);
    border-radius: 6px;
    border: 1px solid var(--border);
    padding: 12px;
  }
  .context-breakdown-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 10px;
    margin-top: 8px;
  }
  .context-breakdown-card {
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px;
    background: var(--bg-secondary);
  }
  .context-breakdown-title {
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 6px;
  }
  .context-breakdown-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 11px;
  }
  .context-breakdown-item {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }
  .context-breakdown-more {
    font-size: 10px;
    color: var(--muted);
    margin-top: 4px;
  }
  .context-breakdown-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .context-expand-btn {
    border: 1px solid var(--border);
    background: var(--bg-secondary);
    color: var(--muted);
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .context-expand-btn:hover {
    color: var(--text);
    border-color: var(--border-strong);
    background: var(--bg);
  }
  
  /* ===== COMPACT TIMESERIES ===== */
  .session-timeseries-compact {
    background: var(--bg);
    border-radius: 6px;
    border: 1px solid var(--border);
    padding: 12px;
    margin: 0;
  }
  .session-timeseries-compact .timeseries-header-row {
    margin-bottom: 8px;
  }
  .session-timeseries-compact .timeseries-header {
    font-size: 12px;
  }
  .session-timeseries-compact .timeseries-summary {
    font-size: 11px;
    margin-top: 8px;
  }
  
  /* ===== COMPACT CONTEXT ===== */
  .context-weight-compact {
    background: var(--bg);
    border-radius: 6px;
    border: 1px solid var(--border);
    padding: 12px;
    margin: 0;
  }
  .context-weight-compact .context-weight-header {
    font-size: 12px;
    margin-bottom: 4px;
  }
  .context-weight-compact .context-weight-desc {
    font-size: 11px;
    margin-bottom: 8px;
  }
  .context-weight-compact .context-stacked-bar {
    height: 16px;
  }
  .context-weight-compact .context-legend {
    font-size: 11px;
    gap: 10px;
    margin-top: 8px;
  }
  .context-weight-compact .context-total {
    font-size: 11px;
    margin-top: 6px;
  }
  .context-weight-compact .context-details {
    margin-top: 8px;
  }
  .context-weight-compact .context-details summary {
    font-size: 12px;
    padding: 6px 10px;
  }
  
  /* ===== COMPACT LOGS ===== */
  .session-logs-compact {
    background: var(--bg);
    border-radius: 10px;
    border: 1px solid var(--border);
    overflow: hidden;
    margin: 0;
    display: flex;
    flex-direction: column;
  }
  .session-logs-compact .session-logs-header {
    padding: 10px 12px;
    font-size: 12px;
  }
  .session-logs-compact .session-logs-list {
    max-height: none;
    flex: 1 1 auto;
    overflow: auto;
  }
  .session-logs-compact .session-log-entry {
    padding: 8px 12px;
  }
  .session-logs-compact .session-log-content {
    font-size: 12px;
    max-height: 160px;
  }
  .session-log-tools {
    margin-top: 6px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg-secondary);
    padding: 6px 8px;
    font-size: 11px;
    color: var(--text);
  }
  .session-log-tools summary {
    cursor: pointer;
    list-style: none;
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
  }
  .session-log-tools summary::-webkit-details-marker {
    display: none;
  }
  .session-log-tools-list {
    margin-top: 6px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .session-log-tools-pill {
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 2px 8px;
    font-size: 10px;
    background: var(--bg);
    color: var(--text);
  }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 900px) {
    .usage-grid {
      grid-template-columns: 1fr;
    }
    .session-detail-row {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 600px) {
    .session-bar-label {
      flex: 0 0 100px;
    }
    .cost-breakdown-legend {
      gap: 10px;
    }
    .legend-item {
      font-size: 11px;
    }
    .daily-chart-bars {
      height: 170px;
      gap: 6px;
      padding-bottom: 40px;
    }
    .daily-bar-label {
      font-size: 8px;
      bottom: -30px;
      transform: rotate(-45deg);
    }
    .usage-mosaic-grid {
      grid-template-columns: 1fr;
    }
    .usage-hour-grid {
      grid-template-columns: repeat(12, minmax(10px, 1fr));
    }
    .usage-hour-cell {
      height: 22px;
    }
  }

  /* ===== CHART AXIS ===== */
  .ts-axis-label {
    font-size: 5px;
    fill: var(--muted);
  }

  /* ===== RANGE SELECTION HANDLES ===== */
  .chart-handle-zone {
    position: absolute;
    top: 0;
    width: 16px;
    height: 100%;
    cursor: col-resize;
    z-index: 10;
    transform: translateX(-50%);
  }

  .timeseries-chart-wrapper {
    position: relative;
  }

  .timeseries-reset-btn {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 2px 10px;
    font-size: 11px;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s ease;
    margin-left: 8px;
  }

  .timeseries-reset-btn:hover {
    background: var(--bg-hover);
    color: var(--text);
    border-color: var(--border-strong);
  }
`,lf=[af,of,rf].join(`
`);function cf(e){if(e.loading&&!e.totals)return l`
      <style>
        @keyframes initial-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes initial-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      </style>
      <section class="card">
        <div class="row" style="justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
          <div style="flex: 1; min-width: 250px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 2px;">
              <div class="card-title" style="margin: 0;">Token Usage</div>
              <span style="
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                background: rgba(255, 77, 77, 0.1);
                border-radius: 4px;
                font-size: 12px;
                color: #ff4d4d;
              ">
                <span style="
                  width: 10px;
                  height: 10px;
                  border: 2px solid #ff4d4d;
                  border-top-color: transparent;
                  border-radius: 50%;
                  animation: initial-spin 0.6s linear infinite;
                "></span>
                Loading
              </span>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
            <div style="display: flex; gap: 8px; align-items: center;">
              <input type="date" .value=${e.startDate} disabled style="padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); color: var(--text); font-size: 13px; opacity: 0.6;" />
              <span style="color: var(--muted);">to</span>
              <input type="date" .value=${e.endDate} disabled style="padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); color: var(--text); font-size: 13px; opacity: 0.6;" />
            </div>
          </div>
        </div>
      </section>
    `;const t=e.chartMode==="tokens",n=e.query.trim().length>0,s=e.queryDraft.trim().length>0,i=[...e.sessions].toSorted((M,D)=>{const F=t?M.usage?.totalTokens??0:M.usage?.totalCost??0;return(t?D.usage?.totalTokens??0:D.usage?.totalCost??0)-F}),a=e.selectedDays.length>0?i.filter(M=>{if(M.usage?.activityDates?.length)return M.usage.activityDates.some(K=>e.selectedDays.includes(K));if(!M.updatedAt)return!1;const D=new Date(M.updatedAt),F=`${D.getFullYear()}-${String(D.getMonth()+1).padStart(2,"0")}-${String(D.getDate()).padStart(2,"0")}`;return e.selectedDays.includes(F)}):i,o=(M,D)=>{if(D.length===0)return!0;const F=M.usage,K=F?.firstActivity??M.updatedAt,ue=F?.lastActivity??M.updatedAt;if(!K||!ue)return!1;const J=Math.min(K,ue),ae=Math.max(K,ue);let V=J;for(;V<=ae;){const U=new Date(V),oe=ya(U,e.timeZone);if(D.includes(oe))return!0;const de=xa(U,e.timeZone);V=Math.min(de.getTime(),ae)+1}return!1},r=e.selectedHours.length>0?a.filter(M=>o(M,e.selectedHours)):a,c=kp(r,e.query),d=c.sessions,g=c.warnings,p=Op(e.queryDraft,i,e.aggregates),h=ba(e.query),u=M=>{const D=Mt(M);return h.filter(F=>Mt(F.key??"")===D).map(F=>F.value).filter(Boolean)},f=M=>{const D=new Set;for(const F of M)F&&D.add(F);return Array.from(D)},m=f(i.map(M=>M.agentId)).slice(0,12),w=f(i.map(M=>M.channel)).slice(0,12),A=f([...i.map(M=>M.modelProvider),...i.map(M=>M.providerOverride),...e.aggregates?.byProvider.map(M=>M.provider)??[]]).slice(0,12),C=f([...i.map(M=>M.model),...e.aggregates?.byModel.map(M=>M.model)??[]]).slice(0,12),k=f(e.aggregates?.tools.tools.map(M=>M.name)??[]).slice(0,12),S=e.selectedSessions.length===1?e.sessions.find(M=>M.key===e.selectedSessions[0])??d.find(M=>M.key===e.selectedSessions[0]):null,E=M=>M.reduce((D,F)=>(F.usage&&(D.input+=F.usage.input,D.output+=F.usage.output,D.cacheRead+=F.usage.cacheRead,D.cacheWrite+=F.usage.cacheWrite,D.totalTokens+=F.usage.totalTokens,D.totalCost+=F.usage.totalCost,D.inputCost+=F.usage.inputCost??0,D.outputCost+=F.usage.outputCost??0,D.cacheReadCost+=F.usage.cacheReadCost??0,D.cacheWriteCost+=F.usage.cacheWriteCost??0,D.missingCostEntries+=F.usage.missingCostEntries??0),D),{input:0,output:0,cacheRead:0,cacheWrite:0,totalTokens:0,totalCost:0,inputCost:0,outputCost:0,cacheReadCost:0,cacheWriteCost:0,missingCostEntries:0}),T=M=>e.costDaily.filter(F=>M.includes(F.date)).reduce((F,K)=>(F.input+=K.input,F.output+=K.output,F.cacheRead+=K.cacheRead,F.cacheWrite+=K.cacheWrite,F.totalTokens+=K.totalTokens,F.totalCost+=K.totalCost,F.inputCost+=K.inputCost??0,F.outputCost+=K.outputCost??0,F.cacheReadCost+=K.cacheReadCost??0,F.cacheWriteCost+=K.cacheWriteCost??0,F),{input:0,output:0,cacheRead:0,cacheWrite:0,totalTokens:0,totalCost:0,inputCost:0,outputCost:0,cacheReadCost:0,cacheWriteCost:0,missingCostEntries:0});let I,H;const Z=i.length;if(e.selectedSessions.length>0){const M=d.filter(D=>e.selectedSessions.includes(D.key));I=E(M),H=M.length}else e.selectedDays.length>0&&e.selectedHours.length===0?(I=T(e.selectedDays),H=d.length):e.selectedHours.length>0||n?(I=E(d),H=d.length):(I=e.totals,H=Z);const te=e.selectedSessions.length>0?d.filter(M=>e.selectedSessions.includes(M.key)):n||e.selectedHours.length>0?d:e.selectedDays.length>0?a:i,R=Rp(te,e.aggregates),q=e.selectedSessions.length>0?(()=>{const M=d.filter(F=>e.selectedSessions.includes(F.key)),D=new Set;for(const F of M)for(const K of F.usage?.activityDates??[])D.add(K);return D.size>0?e.costDaily.filter(F=>D.has(F.date)):e.costDaily})():e.costDaily,ie=Pp(te,I,R),le=!e.loading&&!e.totals&&e.sessions.length===0,_=(I?.missingCostEntries??0)>0||(I?I.totalTokens>0&&I.totalCost===0&&I.input+I.output+I.cacheRead+I.cacheWrite>0:!1),j=[{label:"Today",days:1},{label:"7d",days:7},{label:"30d",days:30}],Q=M=>{const D=new Date,F=new Date;F.setDate(F.getDate()-(M-1)),e.onStartDateChange(ai(F)),e.onEndDateChange(ai(D))},ce=(M,D,F)=>{if(F.length===0)return v;const K=u(M),ue=new Set(K.map(V=>Mt(V))),J=F.length>0&&F.every(V=>ue.has(Mt(V))),ae=K.length;return l`
      <details
        class="usage-filter-select"
        @toggle=${V=>{const U=V.currentTarget;if(!U.open)return;const oe=de=>{de.composedPath().includes(U)||(U.open=!1,window.removeEventListener("click",oe,!0))};window.addEventListener("click",oe,!0)}}
      >
        <summary>
          <span>${D}</span>
          ${ae>0?l`<span class="usage-filter-badge">${ae}</span>`:l`
                  <span class="usage-filter-badge">All</span>
                `}
        </summary>
        <div class="usage-filter-popover">
          <div class="usage-filter-actions">
            <button
              class="btn btn-sm"
              @click=${V=>{V.preventDefault(),V.stopPropagation(),e.onQueryDraftChange(Oo(e.queryDraft,M,F))}}
              ?disabled=${J}
            >
              Select All
            </button>
            <button
              class="btn btn-sm"
              @click=${V=>{V.preventDefault(),V.stopPropagation(),e.onQueryDraftChange(Oo(e.queryDraft,M,[]))}}
              ?disabled=${ae===0}
            >
              Clear
            </button>
          </div>
          <div class="usage-filter-options">
            ${F.map(V=>{const U=ue.has(Mt(V));return l`
                <label class="usage-filter-option">
                  <input
                    type="checkbox"
                    .checked=${U}
                    @change=${oe=>{const de=oe.target,ve=`${M}:${V}`;e.onQueryDraftChange(de.checked?zp(e.queryDraft,ve):No(e.queryDraft,ve))}}
                  />
                  <span>${V}</span>
                </label>
              `})}
          </div>
        </div>
      </details>
    `},he=ai(new Date);return l`
    <style>${lf}</style>

    <section class="usage-page-header">
      <div class="usage-page-title">Usage</div>
      <div class="usage-page-subtitle">See where tokens go, when sessions spike, and what drives cost.</div>
    </section>

    <section class="card usage-header ${e.headerPinned?"pinned":""}">
      <div class="usage-header-row">
        <div class="usage-header-title">
          <div class="card-title" style="margin: 0;">Filters</div>
          ${e.loading?l`
                  <span class="usage-refresh-indicator">Loading</span>
                `:v}
          ${le?l`
                  <span class="usage-query-hint">Select a date range and click Refresh to load usage.</span>
                `:v}
        </div>
        <div class="usage-header-metrics">
          ${I?l`
                <span class="usage-metric-badge">
                  <strong>${B(I.totalTokens)}</strong> tokens
                </span>
                <span class="usage-metric-badge">
                  <strong>${X(I.totalCost)}</strong> cost
                </span>
                <span class="usage-metric-badge">
                  <strong>${H}</strong>
                  session${H!==1?"s":""}
                </span>
              `:v}
          <button
            class="usage-pin-btn ${e.headerPinned?"active":""}"
            title=${e.headerPinned?"Unpin filters":"Pin filters"}
            @click=${e.onToggleHeaderPinned}
          >
            ${e.headerPinned?"Pinned":"Pin"}
          </button>
          <details
            class="usage-export-menu"
            @toggle=${M=>{const D=M.currentTarget;if(!D.open)return;const F=K=>{K.composedPath().includes(D)||(D.open=!1,window.removeEventListener("click",F,!0))};window.addEventListener("click",F,!0)}}
          >
            <summary class="usage-export-button">Export ▾</summary>
            <div class="usage-export-popover">
              <div class="usage-export-list">
                <button
                  class="usage-export-item"
                  @click=${()=>oi(`openclaw-usage-sessions-${he}.csv`,Fp(d),"text/csv")}
                  ?disabled=${d.length===0}
                >
                  Sessions CSV
                </button>
                <button
                  class="usage-export-item"
                  @click=${()=>oi(`openclaw-usage-daily-${he}.csv`,Np(q),"text/csv")}
                  ?disabled=${q.length===0}
                >
                  Daily CSV
                </button>
                <button
                  class="usage-export-item"
                  @click=${()=>oi(`openclaw-usage-${he}.json`,JSON.stringify({totals:I,sessions:d,daily:q,aggregates:R},null,2),"application/json")}
                  ?disabled=${d.length===0&&q.length===0}
                >
                  JSON
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>
      <div class="usage-header-row">
        <div class="usage-controls">
          ${Hp(e.selectedDays,e.selectedHours,e.selectedSessions,e.sessions,e.onClearDays,e.onClearHours,e.onClearSessions,e.onClearFilters)}
          <div class="usage-presets">
            ${j.map(M=>l`
                <button class="btn btn-sm" @click=${()=>Q(M.days)}>
                  ${M.label}
                </button>
              `)}
          </div>
          <input
            type="date"
            .value=${e.startDate}
            title="Start Date"
            @change=${M=>e.onStartDateChange(M.target.value)}
          />
          <span style="color: var(--muted);">to</span>
          <input
            type="date"
            .value=${e.endDate}
            title="End Date"
            @change=${M=>e.onEndDateChange(M.target.value)}
          />
          <select
            title="Time zone"
            .value=${e.timeZone}
            @change=${M=>e.onTimeZoneChange(M.target.value)}
          >
            <option value="local">Local</option>
            <option value="utc">UTC</option>
          </select>
          <div class="chart-toggle">
            <button
              class="toggle-btn ${t?"active":""}"
              @click=${()=>e.onChartModeChange("tokens")}
            >
              Tokens
            </button>
            <button
              class="toggle-btn ${t?"":"active"}"
              @click=${()=>e.onChartModeChange("cost")}
            >
              Cost
            </button>
          </div>
          <button
            class="btn btn-sm usage-action-btn usage-primary-btn"
            @click=${e.onRefresh}
            ?disabled=${e.loading}
          >
            Refresh
          </button>
        </div>
        
      </div>

      <div style="margin-top: 12px;">
          <div class="usage-query-bar">
          <input
            class="usage-query-input"
            type="text"
            .value=${e.queryDraft}
            placeholder="Filter sessions (e.g. key:agent:main:cron* model:gpt-4o has:errors minTokens:2000)"
            @input=${M=>e.onQueryDraftChange(M.target.value)}
            @keydown=${M=>{M.key==="Enter"&&(M.preventDefault(),e.onApplyQuery())}}
          />
          <div class="usage-query-actions">
            <button
              class="btn btn-sm usage-action-btn usage-secondary-btn"
              @click=${e.onApplyQuery}
              ?disabled=${e.loading||!s&&!n}
            >
              Filter (client-side)
            </button>
            ${s||n?l`<button class="btn btn-sm usage-action-btn usage-secondary-btn" @click=${e.onClearQuery}>Clear</button>`:v}
            <span class="usage-query-hint">
              ${n?`${d.length} of ${Z} sessions match`:`${Z} sessions in range`}
            </span>
          </div>
        </div>
        <div class="usage-filter-row">
          ${ce("agent","Agent",m)}
          ${ce("channel","Channel",w)}
          ${ce("provider","Provider",A)}
          ${ce("model","Model",C)}
          ${ce("tool","Tool",k)}
          <span class="usage-query-hint">
            Tip: use filters or click bars to filter days.
          </span>
        </div>
        ${h.length>0?l`
                <div class="usage-query-chips">
                  ${h.map(M=>{const D=M.raw;return l`
                      <span class="usage-query-chip">
                        ${D}
                        <button
                          title="Remove filter"
                          @click=${()=>e.onQueryDraftChange(No(e.queryDraft,D))}
                        >
                          ×
                        </button>
                      </span>
                    `})}
                </div>
              `:v}
        ${p.length>0?l`
                <div class="usage-query-suggestions">
                  ${p.map(M=>l`
                      <button
                        class="usage-query-suggestion"
                        @click=${()=>e.onQueryDraftChange(Bp(e.queryDraft,M.value))}
                      >
                        ${M.label}
                      </button>
                    `)}
                </div>
              `:v}
        ${g.length>0?l`
                <div class="callout warning" style="margin-top: 8px;">
                  ${g.join(" · ")}
                </div>
              `:v}
      </div>

      ${e.error?l`<div class="callout danger" style="margin-top: 12px;">${e.error}</div>`:v}

      ${e.sessionsLimitReached?l`
              <div class="callout warning" style="margin-top: 12px">
                Showing first 1,000 sessions. Narrow date range for complete results.
              </div>
            `:v}
    </section>

    ${Wp(I,R,ie,_,Tp(te,e.timeZone),H,Z)}

    ${Mp(te,e.timeZone,e.selectedHours,e.onSelectHour)}

    <!-- Two-column layout: Daily+Breakdown on left, Sessions on right -->
    <div class="usage-grid">
      <div class="usage-grid-left">
        <div class="card usage-left-card">
          ${jp(q,e.selectedDays,e.chartMode,e.dailyChartMode,e.onDailyChartModeChange,e.onSelectDay)}
          ${I?Kp(I,e.chartMode):v}
        </div>
      </div>
      <div class="usage-grid-right">
        ${qp(d,e.selectedSessions,e.selectedDays,t,e.sessionSort,e.sessionSortDir,e.recentSessions,e.sessionsTab,e.onSelectSession,e.onSessionSortChange,e.onSessionSortDirChange,e.onSessionsTabChange,e.visibleColumns,Z,e.onClearSessions)}
      </div>
    </div>

    <!-- Session Detail Panel (when selected) or Empty State -->
    ${S?ef(S,e.timeSeries,e.timeSeriesLoading,e.timeSeriesMode,e.onTimeSeriesModeChange,e.timeSeriesBreakdownMode,e.onTimeSeriesBreakdownChange,e.timeSeriesCursorStart,e.timeSeriesCursorEnd,e.onTimeSeriesCursorRangeChange,e.startDate,e.endDate,e.selectedDays,e.sessionLogs,e.sessionLogsLoading,e.sessionLogsExpanded,e.onToggleSessionLogsExpanded,{roles:e.logFilterRoles,tools:e.logFilterTools,hasTools:e.logFilterHasTools,query:e.logFilterQuery},e.onLogFilterRolesChange,e.onLogFilterToolsChange,e.onLogFilterHasToolsChange,e.onLogFilterQueryChange,e.onLogFilterClear,e.contextExpanded,e.onToggleContextExpanded,e.onClearSessions):Yp()}
  `}let ri=null;const zo=e=>{ri&&clearTimeout(ri),ri=window.setTimeout(()=>{zl(e)},400)};function df(e){return e.tab!=="usage"?v:cf({loading:e.usageLoading,error:e.usageError,startDate:e.usageStartDate,endDate:e.usageEndDate,sessions:e.usageResult?.sessions??[],sessionsLimitReached:(e.usageResult?.sessions?.length??0)>=1e3,totals:e.usageResult?.totals??null,aggregates:e.usageResult?.aggregates??null,costDaily:e.usageCostSummary?.daily??[],selectedSessions:e.usageSelectedSessions,selectedDays:e.usageSelectedDays,selectedHours:e.usageSelectedHours,chartMode:e.usageChartMode,dailyChartMode:e.usageDailyChartMode,timeSeriesMode:e.usageTimeSeriesMode,timeSeriesBreakdownMode:e.usageTimeSeriesBreakdownMode,timeSeries:e.usageTimeSeries,timeSeriesLoading:e.usageTimeSeriesLoading,timeSeriesCursorStart:e.usageTimeSeriesCursorStart,timeSeriesCursorEnd:e.usageTimeSeriesCursorEnd,sessionLogs:e.usageSessionLogs,sessionLogsLoading:e.usageSessionLogsLoading,sessionLogsExpanded:e.usageSessionLogsExpanded,logFilterRoles:e.usageLogFilterRoles,logFilterTools:e.usageLogFilterTools,logFilterHasTools:e.usageLogFilterHasTools,logFilterQuery:e.usageLogFilterQuery,query:e.usageQuery,queryDraft:e.usageQueryDraft,sessionSort:e.usageSessionSort,sessionSortDir:e.usageSessionSortDir,recentSessions:e.usageRecentSessions,sessionsTab:e.usageSessionsTab,visibleColumns:e.usageVisibleColumns,timeZone:e.usageTimeZone,contextExpanded:e.usageContextExpanded,headerPinned:e.usageHeaderPinned,onStartDateChange:t=>{e.usageStartDate=t,e.usageSelectedDays=[],e.usageSelectedHours=[],e.usageSelectedSessions=[],zo(e)},onEndDateChange:t=>{e.usageEndDate=t,e.usageSelectedDays=[],e.usageSelectedHours=[],e.usageSelectedSessions=[],zo(e)},onRefresh:()=>zl(e),onTimeZoneChange:t=>{e.usageTimeZone=t},onToggleContextExpanded:()=>{e.usageContextExpanded=!e.usageContextExpanded},onToggleSessionLogsExpanded:()=>{e.usageSessionLogsExpanded=!e.usageSessionLogsExpanded},onLogFilterRolesChange:t=>{e.usageLogFilterRoles=t},onLogFilterToolsChange:t=>{e.usageLogFilterTools=t},onLogFilterHasToolsChange:t=>{e.usageLogFilterHasTools=t},onLogFilterQueryChange:t=>{e.usageLogFilterQuery=t},onLogFilterClear:()=>{e.usageLogFilterRoles=[],e.usageLogFilterTools=[],e.usageLogFilterHasTools=!1,e.usageLogFilterQuery=""},onToggleHeaderPinned:()=>{e.usageHeaderPinned=!e.usageHeaderPinned},onSelectHour:(t,n)=>{if(n&&e.usageSelectedHours.length>0){const s=Array.from({length:24},(r,c)=>c),i=e.usageSelectedHours[e.usageSelectedHours.length-1],a=s.indexOf(i),o=s.indexOf(t);if(a!==-1&&o!==-1){const[r,c]=a<o?[a,o]:[o,a],d=s.slice(r,c+1);e.usageSelectedHours=[...new Set([...e.usageSelectedHours,...d])]}}else e.usageSelectedHours.includes(t)?e.usageSelectedHours=e.usageSelectedHours.filter(s=>s!==t):e.usageSelectedHours=[...e.usageSelectedHours,t]},onQueryDraftChange:t=>{e.usageQueryDraft=t,e.usageQueryDebounceTimer&&window.clearTimeout(e.usageQueryDebounceTimer),e.usageQueryDebounceTimer=window.setTimeout(()=>{e.usageQuery=e.usageQueryDraft,e.usageQueryDebounceTimer=null},250)},onApplyQuery:()=>{e.usageQueryDebounceTimer&&(window.clearTimeout(e.usageQueryDebounceTimer),e.usageQueryDebounceTimer=null),e.usageQuery=e.usageQueryDraft},onClearQuery:()=>{e.usageQueryDebounceTimer&&(window.clearTimeout(e.usageQueryDebounceTimer),e.usageQueryDebounceTimer=null),e.usageQueryDraft="",e.usageQuery=""},onSessionSortChange:t=>{e.usageSessionSort=t},onSessionSortDirChange:t=>{e.usageSessionSortDir=t},onSessionsTabChange:t=>{e.usageSessionsTab=t},onToggleColumn:t=>{e.usageVisibleColumns.includes(t)?e.usageVisibleColumns=e.usageVisibleColumns.filter(n=>n!==t):e.usageVisibleColumns=[...e.usageVisibleColumns,t]},onSelectSession:(t,n)=>{if(e.usageTimeSeries=null,e.usageSessionLogs=null,e.usageRecentSessions=[t,...e.usageRecentSessions.filter(s=>s!==t)].slice(0,8),n&&e.usageSelectedSessions.length>0){const s=e.usageChartMode==="tokens",a=[...e.usageResult?.sessions??[]].toSorted((d,g)=>{const p=s?d.usage?.totalTokens??0:d.usage?.totalCost??0;return(s?g.usage?.totalTokens??0:g.usage?.totalCost??0)-p}).map(d=>d.key),o=e.usageSelectedSessions[e.usageSelectedSessions.length-1],r=a.indexOf(o),c=a.indexOf(t);if(r!==-1&&c!==-1){const[d,g]=r<c?[r,c]:[c,r],p=a.slice(d,g+1),h=[...new Set([...e.usageSelectedSessions,...p])];e.usageSelectedSessions=h}}else e.usageSelectedSessions.length===1&&e.usageSelectedSessions[0]===t?e.usageSelectedSessions=[]:e.usageSelectedSessions=[t];e.usageTimeSeriesCursorStart=null,e.usageTimeSeriesCursorEnd=null,e.usageSelectedSessions.length===1&&(vp(e,e.usageSelectedSessions[0]),mp(e,e.usageSelectedSessions[0]))},onSelectDay:(t,n)=>{if(n&&e.usageSelectedDays.length>0){const s=(e.usageCostSummary?.daily??[]).map(r=>r.date),i=e.usageSelectedDays[e.usageSelectedDays.length-1],a=s.indexOf(i),o=s.indexOf(t);if(a!==-1&&o!==-1){const[r,c]=a<o?[a,o]:[o,a],d=s.slice(r,c+1),g=[...new Set([...e.usageSelectedDays,...d])];e.usageSelectedDays=g}}else e.usageSelectedDays.includes(t)?e.usageSelectedDays=e.usageSelectedDays.filter(s=>s!==t):e.usageSelectedDays=[t]},onChartModeChange:t=>{e.usageChartMode=t},onDailyChartModeChange:t=>{e.usageDailyChartMode=t},onTimeSeriesModeChange:t=>{e.usageTimeSeriesMode=t},onTimeSeriesBreakdownChange:t=>{e.usageTimeSeriesBreakdownMode=t},onTimeSeriesCursorRangeChange:(t,n)=>{e.usageTimeSeriesCursorStart=t,e.usageTimeSeriesCursorEnd=n},onClearDays:()=>{e.usageSelectedDays=[]},onClearHours:()=>{e.usageSelectedHours=[]},onClearSessions:()=>{e.usageSelectedSessions=[],e.usageTimeSeries=null,e.usageSessionLogs=null},onClearFilters:()=>{e.usageSelectedDays=[],e.usageSelectedHours=[],e.usageSelectedSessions=[],e.usageTimeSeries=null,e.usageSessionLogs=null}})}const $a={CHILD:2},wa=e=>(...t)=>({_$litDirective$:e,values:t});let ka=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,n,s){this._$Ct=t,this._$AM=n,this._$Ci=s}_$AS(t,n){return this.update(t,n)}update(t,n){return this.render(...n)}};const{I:uf}=id,Uo=e=>e,gf=e=>e.strings===void 0,Ho=()=>document.createComment(""),cn=(e,t,n)=>{const s=e._$AA.parentNode,i=t===void 0?e._$AB:t._$AA;if(n===void 0){const a=s.insertBefore(Ho(),i),o=s.insertBefore(Ho(),i);n=new uf(a,o,e,e.options)}else{const a=n._$AB.nextSibling,o=n._$AM,r=o!==e;if(r){let c;n._$AQ?.(e),n._$AM=e,n._$AP!==void 0&&(c=e._$AU)!==o._$AU&&n._$AP(c)}if(a!==i||r){let c=n._$AA;for(;c!==a;){const d=Uo(c).nextSibling;Uo(s).insertBefore(c,i),c=d}}}return n},Ct=(e,t,n=e)=>(e._$AI(t,n),e),pf={},ff=(e,t=pf)=>e._$AH=t,hf=e=>e._$AH,li=e=>{e._$AR(),e._$AA.remove()};const jo=(e,t,n)=>{const s=new Map;for(let i=t;i<=n;i++)s.set(e[i],i);return s},Wl=wa(class extends ka{constructor(e){if(super(e),e.type!==$a.CHILD)throw Error("repeat() can only be used in text expressions")}dt(e,t,n){let s;n===void 0?n=t:t!==void 0&&(s=t);const i=[],a=[];let o=0;for(const r of e)i[o]=s?s(r,o):o,a[o]=n(r,o),o++;return{values:a,keys:i}}render(e,t,n){return this.dt(e,t,n).values}update(e,[t,n,s]){const i=hf(e),{values:a,keys:o}=this.dt(t,n,s);if(!Array.isArray(i))return this.ut=o,a;const r=this.ut??=[],c=[];let d,g,p=0,h=i.length-1,u=0,f=a.length-1;for(;p<=h&&u<=f;)if(i[p]===null)p++;else if(i[h]===null)h--;else if(r[p]===o[u])c[u]=Ct(i[p],a[u]),p++,u++;else if(r[h]===o[f])c[f]=Ct(i[h],a[f]),h--,f--;else if(r[p]===o[f])c[f]=Ct(i[p],a[f]),cn(e,c[f+1],i[p]),p++,f--;else if(r[h]===o[u])c[u]=Ct(i[h],a[u]),cn(e,i[p],i[h]),h--,u++;else if(d===void 0&&(d=jo(o,u,f),g=jo(r,p,h)),d.has(r[p]))if(d.has(r[h])){const m=g.get(o[u]),w=m!==void 0?i[m]:null;if(w===null){const A=cn(e,i[p]);Ct(A,a[u]),c[u]=A}else c[u]=Ct(w,a[u]),cn(e,i[p],w),i[m]=null;u++}else li(i[h]),h--;else li(i[p]),p++;for(;u<=f;){const m=cn(e,c[f+1]);Ct(m,a[u]),c[u++]=m}for(;p<=h;){const m=i[p++];m!==null&&li(m)}return this.ut=o,ff(e,c),vt}}),se={messageSquare:l`
    <svg viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  `,barChart:l`
    <svg viewBox="0 0 24 24">
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  `,link:l`
    <svg viewBox="0 0 24 24">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  `,radio:l`
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="2" />
      <path
        d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"
      />
    </svg>
  `,fileText:l`
    <svg viewBox="0 0 24 24">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  `,zap:l`
    <svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
  `,monitor:l`
    <svg viewBox="0 0 24 24">
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  `,settings:l`
    <svg viewBox="0 0 24 24">
      <path
        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  `,bug:l`
    <svg viewBox="0 0 24 24">
      <path d="m8 2 1.88 1.88" />
      <path d="M14.12 3.88 16 2" />
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
      <path d="M12 20v-9" />
      <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
      <path d="M6 13H2" />
      <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
      <path d="M22 13h-4" />
      <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </svg>
  `,scrollText:l`
    <svg viewBox="0 0 24 24">
      <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
      <path d="M19 17V5a2 2 0 0 0-2-2H4" />
      <path d="M15 8h-5" />
      <path d="M15 12h-5" />
    </svg>
  `,folder:l`
    <svg viewBox="0 0 24 24">
      <path
        d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"
      />
    </svg>
  `,menu:l`
    <svg viewBox="0 0 24 24">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  `,x:l`
    <svg viewBox="0 0 24 24">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  `,check:l`
    <svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
  `,arrowDown:l`
    <svg viewBox="0 0 24 24">
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  `,copy:l`
    <svg viewBox="0 0 24 24">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  `,search:l`
    <svg viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  `,brain:l`
    <svg viewBox="0 0 24 24">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
      <path d="M6 18a4 4 0 0 1-1.967-.516" />
      <path d="M19.967 17.484A4 4 0 0 1 18 18" />
    </svg>
  `,book:l`
    <svg viewBox="0 0 24 24">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  `,loader:l`
    <svg viewBox="0 0 24 24">
      <path d="M12 2v4" />
      <path d="m16.2 7.8 2.9-2.9" />
      <path d="M18 12h4" />
      <path d="m16.2 16.2 2.9 2.9" />
      <path d="M12 18v4" />
      <path d="m4.9 19.1 2.9-2.9" />
      <path d="M2 12h4" />
      <path d="m4.9 4.9 2.9 2.9" />
    </svg>
  `,wrench:l`
    <svg viewBox="0 0 24 24">
      <path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
      />
    </svg>
  `,fileCode:l`
    <svg viewBox="0 0 24 24">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m10 13-2 2 2 2" />
      <path d="m14 17 2-2-2-2" />
    </svg>
  `,edit:l`
    <svg viewBox="0 0 24 24">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  `,penLine:l`
    <svg viewBox="0 0 24 24">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  `,paperclip:l`
    <svg viewBox="0 0 24 24">
      <path
        d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"
      />
    </svg>
  `,globe:l`
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  `,image:l`
    <svg viewBox="0 0 24 24">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  `,smartphone:l`
    <svg viewBox="0 0 24 24">
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  `,plug:l`
    <svg viewBox="0 0 24 24">
      <path d="M12 22v-5" />
      <path d="M9 8V2" />
      <path d="M15 8V2" />
      <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
    </svg>
  `,circle:l`
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
  `,puzzle:l`
    <svg viewBox="0 0 24 24">
      <path
        d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.076.874.54 1.02 1.02a2.5 2.5 0 1 0 3.237-3.237c-.48-.146-.944-.505-1.02-1.02a.98.98 0 0 1 .303-.917l1.526-1.526A2.402 2.402 0 0 1 11.998 2c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.236 3.236c-.464.18-.894.527-.967 1.02Z"
      />
    </svg>
  `,mic:l`
    <svg viewBox="0 0 24 24">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  `,micOff:l`
    <svg viewBox="0 0 24 24">
      <line x1="2" x2="22" y1="2" y2="22" />
      <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
      <path d="M5 10v2a7 7 0 0 0 12 5" />
      <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  `,volume2:l`
    <svg viewBox="0 0 24 24">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  `,volumeX:l`
    <svg viewBox="0 0 24 24">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="22" x2="16" y1="9" y2="15" />
      <line x1="16" x2="22" y1="9" y2="15" />
    </svg>
  `,bluetooth:l`
    <svg viewBox="0 0 24 24">
      <polyline points="7 7 17 17 12 22 12 2 17 7 7 17" />
    </svg>
  `};function vf(e){const t=e.hello?.snapshot,n=t?.sessionDefaults?.mainSessionKey?.trim();if(n)return n;const s=t?.sessionDefaults?.mainKey?.trim();return s||"main"}function mf(e,t){e.sessionKey=t,e.chatMessage="",e.chatStream=null,e.chatStreamStartedAt=null,e.chatRunId=null,e.resetToolStream(),e.resetChatScroll(),e.applySettings({...e.settings,sessionKey:t,lastActiveSessionKey:t})}function bf(e,t){const n=Ls(t,e.basePath);return l`
    <a
      href=${n}
      class="nav-item ${e.tab===t?"active":""}"
      @click=${s=>{if(!(s.defaultPrevented||s.button!==0||s.metaKey||s.ctrlKey||s.shiftKey||s.altKey)){if(s.preventDefault(),t==="chat"){const i=vf(e);e.sessionKey!==i&&(mf(e,i),e.loadAssistantIdentity())}e.setTab(t)}}}
      title=${Ti(t)}
    >
      <span class="nav-item__icon" aria-hidden="true">${se[tg(t)]}</span>
      <span class="nav-item__text">${Ti(t)}</span>
    </a>
  `}function yf(e){const t=xf(e.hello,e.sessionsResult),n=kf(e.sessionKey,e.sessionsResult,t),s=e.onboarding,i=e.onboarding,a=e.onboarding?!1:e.settings.chatShowThinking,o=e.onboarding?!0:e.settings.chatFocusMode,r=l`
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
      <path d="M21 3v5h-5"></path>
    </svg>
  `,c=l`
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M4 7V4h3"></path>
      <path d="M20 7V4h-3"></path>
      <path d="M4 17v3h3"></path>
      <path d="M20 17v3h-3"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  `;return l`
    <div class="chat-controls">
      <label class="field chat-controls__session">
        <select
          .value=${e.sessionKey}
          ?disabled=${!e.connected}
          @change=${d=>{const g=d.target.value;e.sessionKey=g,e.chatMessage="",e.chatStream=null,e.chatStreamStartedAt=null,e.chatRunId=null,e.resetToolStream(),e.resetChatScroll(),e.applySettings({...e.settings,sessionKey:g,lastActiveSessionKey:g}),e.loadAssistantIdentity(),mg(e,g),Xt(e)}}
        >
          ${Wl(n,d=>d.key,d=>l`<option value=${d.key} title=${d.key}>
                ${d.displayName??d.key}
              </option>`)}
        </select>
      </label>
      <button
        class="btn btn--sm btn--icon"
        ?disabled=${e.chatLoading||!e.connected}
        @click=${async()=>{const d=e;d.chatManualRefreshInFlight=!0,d.chatNewMessagesBelow=!1,await d.updateComplete,d.resetToolStream();try{await Dl(e,{scheduleScroll:!1}),d.scrollToBottom({smooth:!0})}finally{requestAnimationFrame(()=>{d.chatManualRefreshInFlight=!1,d.chatNewMessagesBelow=!1})}}}
        title=${P("chat.refreshTitle")}
      >
        ${r}
      </button>
      <span class="chat-controls__separator">|</span>
      <button
        class="btn btn--sm btn--icon ${a?"active":""}"
        ?disabled=${s}
        @click=${()=>{s||e.applySettings({...e.settings,chatShowThinking:!e.settings.chatShowThinking})}}
        aria-pressed=${a}
        title=${P(s?"chat.onboardingDisabled":"chat.thinkingToggle")}
      >
        ${se.brain}
      </button>
      <button
        class="btn btn--sm btn--icon ${o?"active":""}"
        ?disabled=${i}
        @click=${()=>{i||e.applySettings({...e.settings,chatFocusMode:!e.settings.chatFocusMode})}}
        aria-pressed=${o}
        title=${P(i?"chat.onboardingDisabled":"chat.focusToggle")}
      >
        ${c}
      </button>
    </div>
  `}function xf(e,t){const n=e?.snapshot,s=n?.sessionDefaults?.mainSessionKey?.trim();if(s)return s;const i=n?.sessionDefaults?.mainKey?.trim();return i||(t?.sessions?.some(a=>a.key==="main")?"main":null)}const os={bluebubbles:"iMessage",telegram:"Telegram",discord:"Discord",signal:"Signal",slack:"Slack",whatsapp:"WhatsApp",matrix:"Matrix",email:"Email",sms:"SMS"},$f=Object.keys(os);function Ko(e){return e.charAt(0).toUpperCase()+e.slice(1)}function wf(e){if(e==="main"||e==="agent:main:main")return{prefix:"",fallbackName:"Main Session"};if(e.includes(":subagent:"))return{prefix:"Subagent:",fallbackName:"Subagent:"};if(e.includes(":cron:"))return{prefix:"Cron:",fallbackName:"Cron Job:"};const t=e.match(/^agent:[^:]+:([^:]+):direct:(.+)$/);if(t){const s=t[1],i=t[2];return{prefix:"",fallbackName:`${os[s]??Ko(s)} · ${i}`}}const n=e.match(/^agent:[^:]+:([^:]+):group:(.+)$/);if(n){const s=n[1];return{prefix:"",fallbackName:`${os[s]??Ko(s)} Group`}}for(const s of $f)if(e===s||e.startsWith(`${s}:`))return{prefix:"",fallbackName:`${os[s]} Session`};return{prefix:"",fallbackName:e}}function ci(e,t){const n=t?.label?.trim()||"",s=t?.displayName?.trim()||"",{prefix:i,fallbackName:a}=wf(e),o=r=>i?new RegExp(`^${i.replace(/[.*+?^${}()|[\\]\\]/g,"\\$&")}\\s*`,"i").test(r)?r:`${i} ${r}`:r;return n&&n!==e?o(n):s&&s!==e?o(s):a}function kf(e,t,n){const s=new Set,i=[],a=n&&t?.sessions?.find(r=>r.key===n),o=t?.sessions?.find(r=>r.key===e);if(n&&(s.add(n),i.push({key:n,displayName:ci(n,a||void 0)})),s.has(e)||(s.add(e),i.push({key:e,displayName:ci(e,o)})),t?.sessions)for(const r of t.sessions)s.has(r.key)||(s.add(r.key),i.push({key:r.key,displayName:ci(r.key,r)}));return i}const Sf=["system","light","dark"];function Af(e){const t=Math.max(0,Sf.indexOf(e.theme)),n=s=>i=>{const o={element:i.currentTarget};(i.clientX||i.clientY)&&(o.pointerClientX=i.clientX,o.pointerClientY=i.clientY),e.setTheme(s,o)};return l`
    <div class="theme-toggle" style="--theme-index: ${t};">
      <div class="theme-toggle__track" role="group" aria-label="Theme">
        <span class="theme-toggle__indicator"></span>
        <button
          class="theme-toggle__button ${e.theme==="system"?"active":""}"
          @click=${n("system")}
          aria-pressed=${e.theme==="system"}
          aria-label="System theme"
          title="System"
        >
          ${_f()}
        </button>
        <button
          class="theme-toggle__button ${e.theme==="light"?"active":""}"
          @click=${n("light")}
          aria-pressed=${e.theme==="light"}
          aria-label="Light theme"
          title="Light"
        >
          ${Cf()}
        </button>
        <button
          class="theme-toggle__button ${e.theme==="dark"?"active":""}"
          @click=${n("dark")}
          aria-pressed=${e.theme==="dark"}
          aria-label="Dark theme"
          title="Dark"
        >
          ${Tf()}
        </button>
      </div>
    </div>
  `}function Cf(){return l`
    <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="m6.34 17.66-1.41 1.41"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
  `}function Tf(){return l`
    <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"
      ></path>
    </svg>
  `}function _f(){return l`
    <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="20" height="14" x="2" y="3" rx="2"></rect>
      <line x1="8" x2="16" y1="21" y2="21"></line>
      <line x1="12" x2="12" y1="17" y2="21"></line>
    </svg>
  `}function ql(e,t){if(!e)return e;const s=e.files.some(i=>i.name===t.name)?e.files.map(i=>i.name===t.name?t:i):[...e.files,t];return{...e,files:s}}async function di(e,t){if(!(!e.client||!e.connected||e.agentFilesLoading)){e.agentFilesLoading=!0,e.agentFilesError=null;try{const n=await e.client.request("agents.files.list",{agentId:t});n&&(e.agentFilesList=n,e.agentFileActive&&!n.files.some(s=>s.name===e.agentFileActive)&&(e.agentFileActive=null))}catch(n){e.agentFilesError=String(n)}finally{e.agentFilesLoading=!1}}}async function Ef(e,t,n,s){if(!(!e.client||!e.connected||e.agentFilesLoading)&&!Object.hasOwn(e.agentFileContents,n)){e.agentFilesLoading=!0,e.agentFilesError=null;try{const i=await e.client.request("agents.files.get",{agentId:t,name:n});if(i?.file){const a=i.file.content??"",o=e.agentFileContents[n]??"",r=e.agentFileDrafts[n],c=s?.preserveDraft??!0;e.agentFilesList=ql(e.agentFilesList,i.file),e.agentFileContents={...e.agentFileContents,[n]:a},(!c||!Object.hasOwn(e.agentFileDrafts,n)||r===o)&&(e.agentFileDrafts={...e.agentFileDrafts,[n]:a})}}catch(i){e.agentFilesError=String(i)}finally{e.agentFilesLoading=!1}}}async function Lf(e,t,n,s){if(!(!e.client||!e.connected||e.agentFileSaving)){e.agentFileSaving=!0,e.agentFilesError=null;try{const i=await e.client.request("agents.files.set",{agentId:t,name:n,content:s});i?.file&&(e.agentFilesList=ql(e.agentFilesList,i.file),e.agentFileContents={...e.agentFileContents,[n]:s},e.agentFileDrafts={...e.agentFileDrafts,[n]:s})}catch(i){e.agentFilesError=String(i)}finally{e.agentFileSaving=!1}}}function Mf(e){const t=e.host??"unknown",n=e.ip?`(${e.ip})`:"",s=e.mode??"",i=e.version??"";return`${t} ${n} ${s} ${i}`.trim()}function If(e){const t=e.ts??null;return t?ee(t):"n/a"}function Sa(e){return e?`${Ot(e)} (${ee(e)})`:"n/a"}function Rf(e){if(e.totalTokens==null)return"n/a";const t=e.totalTokens??0,n=e.contextTokens??0;return n?`${t} / ${n}`:String(t)}function Pf(e){if(e==null)return"";try{return JSON.stringify(e,null,2)}catch{return String(e)}}function Df(e){const t=e.state??{},n=t.nextRunAtMs?Ot(t.nextRunAtMs):"n/a",s=t.lastRunAtMs?Ot(t.lastRunAtMs):"n/a";return`${t.lastStatus??"n/a"} · next ${n} · last ${s}`}function Vl(e){const t=e.schedule;if(t.kind==="at"){const n=Date.parse(t.at);return Number.isFinite(n)?`At ${Ot(n)}`:`At ${t.at}`}return t.kind==="every"?`Every ${aa(t.everyMs)}`:`Cron ${t.expr}${t.tz?` (${t.tz})`:""}`}function Ff(e){const t=e.payload;if(t.kind==="systemEvent")return`System: ${t.text}`;const n=`Agent: ${t.message}`,s=e.delivery;if(s&&s.mode!=="none"){const i=s.mode==="webhook"?s.to?` (${s.to})`:"":s.channel||s.to?` (${s.channel??"last"}${s.to?` -> ${s.to}`:""})`:"";return`${n} · ${s.mode}${i}`}return n}const Nf={bash:"exec","apply-patch":"apply_patch"},Of={"group:memory":["memory_search","memory_get"],"group:web":["web_search","web_fetch"],"group:fs":["read","write","edit","apply_patch"],"group:runtime":["exec","process"],"group:sessions":["sessions_list","sessions_history","sessions_send","sessions_spawn","subagents","session_status"],"group:ui":["browser","canvas"],"group:automation":["cron","gateway"],"group:messaging":["message"],"group:nodes":["nodes"],"group:openclaw":["browser","canvas","nodes","cron","message","gateway","agents_list","sessions_list","sessions_history","sessions_send","sessions_spawn","subagents","session_status","memory_search","memory_get","web_search","web_fetch","image"]},Bf={minimal:{allow:["session_status"]},coding:{allow:["group:fs","group:runtime","group:sessions","group:memory","image"]},messaging:{allow:["group:messaging","sessions_list","sessions_history","sessions_send","session_status"]},full:{}};function qe(e){const t=e.trim().toLowerCase();return Nf[t]??t}function zf(e){return e?e.map(qe).filter(Boolean):[]}function Uf(e){const t=zf(e),n=[];for(const s of t){const i=Of[s];if(i){n.push(...i);continue}n.push(s)}return Array.from(new Set(n))}function Hf(e){if(!e)return;const t=Bf[e];if(t&&!(!t.allow&&!t.deny))return{allow:t.allow?[...t.allow]:void 0,deny:t.deny?[...t.deny]:void 0}}const Wo=[{id:"fs",label:"Files",tools:[{id:"read",label:"read",description:"Read file contents"},{id:"write",label:"write",description:"Create or overwrite files"},{id:"edit",label:"edit",description:"Make precise edits"},{id:"apply_patch",label:"apply_patch",description:"Patch files (OpenAI)"}]},{id:"runtime",label:"Runtime",tools:[{id:"exec",label:"exec",description:"Run shell commands"},{id:"process",label:"process",description:"Manage background processes"}]},{id:"web",label:"Web",tools:[{id:"web_search",label:"web_search",description:"Search the web"},{id:"web_fetch",label:"web_fetch",description:"Fetch web content"}]},{id:"memory",label:"Memory",tools:[{id:"memory_search",label:"memory_search",description:"Semantic search"},{id:"memory_get",label:"memory_get",description:"Read memory files"}]},{id:"sessions",label:"Sessions",tools:[{id:"sessions_list",label:"sessions_list",description:"List sessions"},{id:"sessions_history",label:"sessions_history",description:"Session history"},{id:"sessions_send",label:"sessions_send",description:"Send to session"},{id:"sessions_spawn",label:"sessions_spawn",description:"Spawn sub-agent"},{id:"session_status",label:"session_status",description:"Session status"}]},{id:"ui",label:"UI",tools:[{id:"browser",label:"browser",description:"Control web browser"},{id:"canvas",label:"canvas",description:"Control canvases"}]},{id:"messaging",label:"Messaging",tools:[{id:"message",label:"message",description:"Send messages"}]},{id:"automation",label:"Automation",tools:[{id:"cron",label:"cron",description:"Schedule tasks"},{id:"gateway",label:"gateway",description:"Gateway control"}]},{id:"nodes",label:"Nodes",tools:[{id:"nodes",label:"nodes",description:"Nodes + devices"}]},{id:"agents",label:"Agents",tools:[{id:"agents_list",label:"agents_list",description:"List agents"}]},{id:"media",label:"Media",tools:[{id:"image",label:"image",description:"Image understanding"}]}],jf=[{id:"minimal",label:"Minimal"},{id:"coding",label:"Coding"},{id:"messaging",label:"Messaging"},{id:"full",label:"Full"}];function Mi(e){return e.name?.trim()||e.identity?.name?.trim()||e.id}function Vn(e){const t=e.trim();if(!t||t.length>16)return!1;let n=!1;for(let s=0;s<t.length;s+=1)if(t.charCodeAt(s)>127){n=!0;break}return!(!n||t.includes("://")||t.includes("/")||t.includes("."))}function Rs(e,t){const n=t?.emoji?.trim();if(n&&Vn(n))return n;const s=e.identity?.emoji?.trim();if(s&&Vn(s))return s;const i=t?.avatar?.trim();if(i&&Vn(i))return i;const a=e.identity?.avatar?.trim();return a&&Vn(a)?a:""}function Gl(e,t){return t&&e===t?"default":null}function Kf(e){if(e==null||!Number.isFinite(e))return"-";if(e<1024)return`${e} B`;const t=["KB","MB","GB","TB"];let n=e/1024,s=0;for(;n>=1024&&s<t.length-1;)n/=1024,s+=1;return`${n.toFixed(n<10?1:0)} ${t[s]}`}function Ps(e,t){const n=e;return{entry:(n?.agents?.list??[]).find(a=>a?.id===t),defaults:n?.agents?.defaults,globalTools:n?.tools}}function qo(e,t,n,s,i){const a=Ps(t,e.id),r=(n&&n.agentId===e.id?n.workspace:null)||a.entry?.workspace||a.defaults?.workspace||"default",c=a.entry?.model?$n(a.entry?.model):$n(a.defaults?.model),d=i?.name?.trim()||e.identity?.name?.trim()||e.name?.trim()||a.entry?.name||e.id,g=Rs(e,i)||"-",p=Array.isArray(a.entry?.skills)?a.entry?.skills:null,h=p?.length??null;return{workspace:r,model:c,identityName:d,identityEmoji:g,skillsLabel:p?`${h} selected`:"all skills",isDefault:!!(s&&e.id===s)}}function $n(e){if(!e)return"-";if(typeof e=="string")return e.trim()||"-";if(typeof e=="object"&&e){const t=e,n=t.primary?.trim();if(n){const s=Array.isArray(t.fallbacks)?t.fallbacks.length:0;return s>0?`${n} (+${s} fallback)`:n}}return"-"}function Vo(e){const t=e.match(/^(.+) \(\+\d+ fallback\)$/);return t?t[1]:e}function Go(e){if(!e)return null;if(typeof e=="string")return e.trim()||null;if(typeof e=="object"&&e){const t=e;return(typeof t.primary=="string"?t.primary:typeof t.model=="string"?t.model:typeof t.id=="string"?t.id:typeof t.value=="string"?t.value:null)?.trim()||null}return null}function Wf(e){if(!e||typeof e=="string")return null;if(typeof e=="object"&&e){const t=e,n=Array.isArray(t.fallbacks)?t.fallbacks:Array.isArray(t.fallback)?t.fallback:null;return n?n.filter(s=>typeof s=="string"):null}return null}function qf(e){return e.split(",").map(t=>t.trim()).filter(Boolean)}function Vf(e){const n=e?.agents?.defaults?.models;if(!n||typeof n!="object")return[];const s=[];for(const[i,a]of Object.entries(n)){const o=i.trim();if(!o)continue;const r=a&&typeof a=="object"&&"alias"in a&&typeof a.alias=="string"?a.alias?.trim():void 0,c=r&&r!==o?`${r} (${o})`:o;s.push({value:o,label:c})}return s}function Gf(e,t){const n=Vf(e),s=t?n.some(i=>i.value===t):!1;return t&&!s&&n.unshift({value:t,label:`Current (${t})`}),n.length===0?l`
      <option value="" disabled>No configured models</option>
    `:n.map(i=>l`<option value=${i.value}>${i.label}</option>`)}function Qf(e){const t=qe(e);if(!t)return{kind:"exact",value:""};if(t==="*")return{kind:"all"};if(!t.includes("*"))return{kind:"exact",value:t};const n=t.replace(/[.*+?^${}()|[\\]\\]/g,"\\$&");return{kind:"regex",value:new RegExp(`^${n.replaceAll("\\*",".*")}$`)}}function Ii(e){return Array.isArray(e)?Uf(e).map(Qf).filter(t=>t.kind!=="exact"||t.value.length>0):[]}function wn(e,t){for(const n of t)if(n.kind==="all"||n.kind==="exact"&&e===n.value||n.kind==="regex"&&n.value.test(e))return!0;return!1}function Yf(e,t){if(!t)return!0;const n=qe(e),s=Ii(t.deny);if(wn(n,s))return!1;const i=Ii(t.allow);return!!(i.length===0||wn(n,i)||n==="apply_patch"&&wn("exec",i))}function Qo(e,t){if(!Array.isArray(t)||t.length===0)return!1;const n=qe(e),s=Ii(t);return!!(wn(n,s)||n==="apply_patch"&&wn("exec",s))}function Zf(e){return Hf(e)??void 0}function Ql(e,t){return l`
    <section class="card">
      <div class="card-title">Agent Context</div>
      <div class="card-sub">${t}</div>
      <div class="agents-overview-grid" style="margin-top: 16px;">
        <div class="agent-kv">
          <div class="label">Workspace</div>
          <div class="mono">${e.workspace}</div>
        </div>
        <div class="agent-kv">
          <div class="label">Primary Model</div>
          <div class="mono">${e.model}</div>
        </div>
        <div class="agent-kv">
          <div class="label">Identity Name</div>
          <div>${e.identityName}</div>
        </div>
        <div class="agent-kv">
          <div class="label">Identity Emoji</div>
          <div>${e.identityEmoji}</div>
        </div>
        <div class="agent-kv">
          <div class="label">Skills Filter</div>
          <div>${e.skillsLabel}</div>
        </div>
        <div class="agent-kv">
          <div class="label">Default</div>
          <div>${e.isDefault?"yes":"no"}</div>
        </div>
      </div>
    </section>
  `}function Jf(e,t){const n=e.channelMeta?.find(s=>s.id===t);return n?.label?n.label:e.channelLabels?.[t]??t}function Xf(e){if(!e)return[];const t=new Set;for(const i of e.channelOrder??[])t.add(i);for(const i of e.channelMeta??[])t.add(i.id);for(const i of Object.keys(e.channelAccounts??{}))t.add(i);const n=[],s=e.channelOrder?.length?e.channelOrder:Array.from(t);for(const i of s)t.has(i)&&(n.push(i),t.delete(i));for(const i of t)n.push(i);return n.map(i=>({id:i,label:Jf(e,i),accounts:e.channelAccounts?.[i]??[]}))}const eh=["groupPolicy","streamMode","dmPolicy"];function th(e,t){if(!e)return null;const s=(e.channels??{})[t];if(s&&typeof s=="object")return s;const i=e[t];return i&&typeof i=="object"?i:null}function nh(e){if(e==null)return"n/a";if(typeof e=="string"||typeof e=="number"||typeof e=="boolean")return String(e);try{return JSON.stringify(e)}catch{return"n/a"}}function sh(e,t){const n=th(e,t);return n?eh.flatMap(s=>s in n?[{label:s,value:nh(n[s])}]:[]):[]}function ih(e){let t=0,n=0,s=0;for(const i of e){const a=i.probe&&typeof i.probe=="object"&&"ok"in i.probe?!!i.probe.ok:!1;(i.connected===!0||i.running===!0||a)&&(t+=1),i.configured&&(n+=1),i.enabled&&(s+=1)}return{total:e.length,connected:t,configured:n,enabled:s}}function ah(e){const t=Xf(e.snapshot),n=e.lastSuccess?ee(e.lastSuccess):"never";return l`
    <section class="grid grid-cols-2">
      ${Ql(e.context,"Workspace, identity, and model configuration.")}
      <section class="card">
        <div class="row" style="justify-content: space-between;">
          <div>
            <div class="card-title">Channels</div>
            <div class="card-sub">Gateway-wide channel status snapshot.</div>
          </div>
          <button class="btn btn--sm" ?disabled=${e.loading} @click=${e.onRefresh}>
            ${e.loading?"Refreshing…":"Refresh"}
          </button>
        </div>
        <div class="muted" style="margin-top: 8px;">
          Last refresh: ${n}
        </div>
        ${e.error?l`<div class="callout danger" style="margin-top: 12px;">${e.error}</div>`:v}
        ${e.snapshot?v:l`
                <div class="callout info" style="margin-top: 12px">Load channels to see live status.</div>
              `}
        ${t.length===0?l`
                <div class="muted" style="margin-top: 16px">No channels found.</div>
              `:l`
                <div class="list" style="margin-top: 16px;">
                  ${t.map(s=>{const i=ih(s.accounts),a=i.total?`${i.connected}/${i.total} connected`:"no accounts",o=i.configured?`${i.configured} configured`:"not configured",r=i.total?`${i.enabled} enabled`:"disabled",c=sh(e.configForm,s.id);return l`
                      <div class="list-item">
                        <div class="list-main">
                          <div class="list-title">${s.label}</div>
                          <div class="list-sub mono">${s.id}</div>
                        </div>
                        <div class="list-meta">
                          <div>${a}</div>
                          <div>${o}</div>
                          <div>${r}</div>
                          ${c.length>0?c.map(d=>l`<div>${d.label}: ${d.value}</div>`):v}
                        </div>
                      </div>
                    `})}
                </div>
              `}
      </section>
    </section>
  `}function oh(e){const t=e.jobs.filter(n=>n.agentId===e.agentId);return l`
    <section class="grid grid-cols-2">
      ${Ql(e.context,"Workspace and scheduling targets.")}
      <section class="card">
        <div class="row" style="justify-content: space-between;">
          <div>
            <div class="card-title">Scheduler</div>
            <div class="card-sub">Gateway cron status.</div>
          </div>
          <button class="btn btn--sm" ?disabled=${e.loading} @click=${e.onRefresh}>
            ${e.loading?"Refreshing…":"Refresh"}
          </button>
        </div>
        <div class="stat-grid" style="margin-top: 16px;">
          <div class="stat">
            <div class="stat-label">Enabled</div>
            <div class="stat-value">
              ${e.status?e.status.enabled?"Yes":"No":"n/a"}
            </div>
          </div>
          <div class="stat">
            <div class="stat-label">Jobs</div>
            <div class="stat-value">${e.status?.jobs??"n/a"}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Next wake</div>
            <div class="stat-value">${Sa(e.status?.nextWakeAtMs??null)}</div>
          </div>
        </div>
        ${e.error?l`<div class="callout danger" style="margin-top: 12px;">${e.error}</div>`:v}
      </section>
    </section>
    <section class="card">
      <div class="card-title">Agent Cron Jobs</div>
      <div class="card-sub">Scheduled jobs targeting this agent.</div>
      ${t.length===0?l`
              <div class="muted" style="margin-top: 16px">No jobs assigned.</div>
            `:l`
              <div class="list" style="margin-top: 16px;">
                ${t.map(n=>l`
                    <div class="list-item">
                      <div class="list-main">
                        <div class="list-title">${n.name}</div>
                        ${n.description?l`<div class="list-sub">${n.description}</div>`:v}
                        <div class="chip-row" style="margin-top: 6px;">
                          <span class="chip">${Vl(n)}</span>
                          <span class="chip ${n.enabled?"chip-ok":"chip-warn"}">
                            ${n.enabled?"enabled":"disabled"}
                          </span>
                          <span class="chip">${n.sessionTarget}</span>
                        </div>
                      </div>
                      <div class="list-meta">
                        <div class="mono">${Df(n)}</div>
                        <div class="muted">${Ff(n)}</div>
                      </div>
                    </div>
                  `)}
              </div>
            `}
    </section>
  `}function rh(e){const t=e.agentFilesList?.agentId===e.agentId?e.agentFilesList:null,n=t?.files??[],s=e.agentFileActive??null,i=s?n.find(c=>c.name===s)??null:null,a=s?e.agentFileContents[s]??"":"",o=s?e.agentFileDrafts[s]??a:"",r=s?o!==a:!1;return l`
    <section class="card">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">Core Files</div>
          <div class="card-sub">Bootstrap persona, identity, and tool guidance.</div>
        </div>
        <button
          class="btn btn--sm"
          ?disabled=${e.agentFilesLoading}
          @click=${()=>e.onLoadFiles(e.agentId)}
        >
          ${e.agentFilesLoading?"Loading…":"Refresh"}
        </button>
      </div>
      ${t?l`<div class="muted mono" style="margin-top: 8px;">Workspace: ${t.workspace}</div>`:v}
      ${e.agentFilesError?l`<div class="callout danger" style="margin-top: 12px;">${e.agentFilesError}</div>`:v}
      ${t?l`
              <div class="agent-files-grid" style="margin-top: 16px;">
                <div class="agent-files-list">
                  ${n.length===0?l`
                          <div class="muted">No files found.</div>
                        `:n.map(c=>lh(c,s,()=>e.onSelectFile(c.name)))}
                </div>
                <div class="agent-files-editor">
                  ${i?l`
                          <div class="agent-file-header">
                            <div>
                              <div class="agent-file-title mono">${i.name}</div>
                              <div class="agent-file-sub mono">${i.path}</div>
                            </div>
                            <div class="agent-file-actions">
                              <button
                                class="btn btn--sm"
                                ?disabled=${!r}
                                @click=${()=>e.onFileReset(i.name)}
                              >
                                Reset
                              </button>
                              <button
                                class="btn btn--sm primary"
                                ?disabled=${e.agentFileSaving||!r}
                                @click=${()=>e.onFileSave(i.name)}
                              >
                                ${e.agentFileSaving?"Saving…":"Save"}
                              </button>
                            </div>
                          </div>
                          ${i.missing?l`
                                  <div class="callout info" style="margin-top: 10px">
                                    This file is missing. Saving will create it in the agent workspace.
                                  </div>
                                `:v}
                          <label class="field" style="margin-top: 12px;">
                            <span>Content</span>
                            <textarea
                              .value=${o}
                              @input=${c=>e.onFileDraftChange(i.name,c.target.value)}
                            ></textarea>
                          </label>
                        `:l`
                          <div class="muted">Select a file to edit.</div>
                        `}
                </div>
              </div>
            `:l`
              <div class="callout info" style="margin-top: 12px">
                Load the agent workspace files to edit core instructions.
              </div>
            `}
    </section>
  `}function lh(e,t,n){const s=e.missing?"Missing":`${Kf(e.size)} · ${ee(e.updatedAtMs??null)}`;return l`
    <button
      type="button"
      class="agent-file-row ${t===e.name?"active":""}"
      @click=${n}
    >
      <div>
        <div class="agent-file-name mono">${e.name}</div>
        <div class="agent-file-meta">${s}</div>
      </div>
      ${e.missing?l`
              <span class="agent-pill warn">missing</span>
            `:v}
    </button>
  `}const Gn=[{id:"workspace",label:"Workspace Skills",sources:["openclaw-workspace"]},{id:"built-in",label:"Built-in Skills",sources:["openclaw-bundled"]},{id:"installed",label:"Installed Skills",sources:["openclaw-managed"]},{id:"extra",label:"Extra Skills",sources:["openclaw-extra"]}];function Yl(e){const t=new Map;for(const a of Gn)t.set(a.id,{id:a.id,label:a.label,skills:[]});const n=Gn.find(a=>a.id==="built-in"),s={id:"other",label:"Other Skills",skills:[]};for(const a of e){const o=a.bundled?n:Gn.find(r=>r.sources.includes(a.source));o?t.get(o.id)?.skills.push(a):s.skills.push(a)}const i=Gn.map(a=>t.get(a.id)).filter(a=>!!(a&&a.skills.length>0));return s.skills.length>0&&i.push(s),i}function Zl(e){return[...e.missing.bins.map(t=>`bin:${t}`),...e.missing.env.map(t=>`env:${t}`),...e.missing.config.map(t=>`config:${t}`),...e.missing.os.map(t=>`os:${t}`)]}function Jl(e){const t=[];return e.disabled&&t.push("disabled"),e.blockedByAllowlist&&t.push("blocked by allowlist"),t}function Xl(e){const t=e.skill,n=!!e.showBundledBadge;return l`
    <div class="chip-row" style="margin-top: 6px;">
      <span class="chip">${t.source}</span>
      ${n?l`
              <span class="chip">bundled</span>
            `:v}
      <span class="chip ${t.eligible?"chip-ok":"chip-warn"}">
        ${t.eligible?"eligible":"blocked"}
      </span>
      ${t.disabled?l`
              <span class="chip chip-warn">disabled</span>
            `:v}
    </div>
  `}function ch(e){const t=Ps(e.configForm,e.agentId),n=t.entry?.tools??{},s=t.globalTools??{},i=n.profile??s.profile??"full",a=n.profile?"agent override":s.profile?"global default":"default",o=Array.isArray(n.allow)&&n.allow.length>0,r=Array.isArray(s.allow)&&s.allow.length>0,c=!!e.configForm&&!e.configLoading&&!e.configSaving&&!o,d=o?[]:Array.isArray(n.alsoAllow)?n.alsoAllow:[],g=o?[]:Array.isArray(n.deny)?n.deny:[],p=o?{allow:n.allow??[],deny:n.deny??[]}:Zf(i)??void 0,h=Wo.flatMap(A=>A.tools.map(C=>C.id)),u=A=>{const C=Yf(A,p),k=Qo(A,d),S=Qo(A,g);return{allowed:(C||k)&&!S,baseAllowed:C,denied:S}},f=h.filter(A=>u(A).allowed).length,m=(A,C)=>{const k=new Set(d.map(I=>qe(I)).filter(I=>I.length>0)),S=new Set(g.map(I=>qe(I)).filter(I=>I.length>0)),E=u(A).baseAllowed,T=qe(A);C?(S.delete(T),E||k.add(T)):(k.delete(T),S.add(T)),e.onOverridesChange(e.agentId,[...k],[...S])},w=A=>{const C=new Set(d.map(S=>qe(S)).filter(S=>S.length>0)),k=new Set(g.map(S=>qe(S)).filter(S=>S.length>0));for(const S of h){const E=u(S).baseAllowed,T=qe(S);A?(k.delete(T),E||C.add(T)):(C.delete(T),k.add(T))}e.onOverridesChange(e.agentId,[...C],[...k])};return l`
    <section class="card">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">Tool Access</div>
          <div class="card-sub">
            Profile + per-tool overrides for this agent.
            <span class="mono">${f}/${h.length}</span> enabled.
          </div>
        </div>
        <div class="row" style="gap: 8px;">
          <button class="btn btn--sm" ?disabled=${!c} @click=${()=>w(!0)}>
            Enable All
          </button>
          <button class="btn btn--sm" ?disabled=${!c} @click=${()=>w(!1)}>
            Disable All
          </button>
          <button class="btn btn--sm" ?disabled=${e.configLoading} @click=${e.onConfigReload}>
            Reload Config
          </button>
          <button
            class="btn btn--sm primary"
            ?disabled=${e.configSaving||!e.configDirty}
            @click=${e.onConfigSave}
          >
            ${e.configSaving?"Saving…":"Save"}
          </button>
        </div>
      </div>

      ${e.configForm?v:l`
              <div class="callout info" style="margin-top: 12px">
                Load the gateway config to adjust tool profiles.
              </div>
            `}
      ${o?l`
              <div class="callout info" style="margin-top: 12px">
                This agent is using an explicit allowlist in config. Tool overrides are managed in the Config tab.
              </div>
            `:v}
      ${r?l`
              <div class="callout info" style="margin-top: 12px">
                Global tools.allow is set. Agent overrides cannot enable tools that are globally blocked.
              </div>
            `:v}

      <div class="agent-tools-meta" style="margin-top: 16px;">
        <div class="agent-kv">
          <div class="label">Profile</div>
          <div class="mono">${i}</div>
        </div>
        <div class="agent-kv">
          <div class="label">Source</div>
          <div>${a}</div>
        </div>
        ${e.configDirty?l`
                <div class="agent-kv">
                  <div class="label">Status</div>
                  <div class="mono">unsaved</div>
                </div>
              `:v}
      </div>

      <div class="agent-tools-presets" style="margin-top: 16px;">
        <div class="label">Quick Presets</div>
        <div class="agent-tools-buttons">
          ${jf.map(A=>l`
              <button
                class="btn btn--sm ${i===A.id?"active":""}"
                ?disabled=${!c}
                @click=${()=>e.onProfileChange(e.agentId,A.id,!0)}
              >
                ${A.label}
              </button>
            `)}
          <button
            class="btn btn--sm"
            ?disabled=${!c}
            @click=${()=>e.onProfileChange(e.agentId,null,!1)}
          >
            Inherit
          </button>
        </div>
      </div>

      <div class="agent-tools-grid" style="margin-top: 20px;">
        ${Wo.map(A=>l`
              <div class="agent-tools-section">
                <div class="agent-tools-header">${A.label}</div>
                <div class="agent-tools-list">
                  ${A.tools.map(C=>{const{allowed:k}=u(C.id);return l`
                      <div class="agent-tool-row">
                        <div>
                          <div class="agent-tool-title mono">${C.label}</div>
                          <div class="agent-tool-sub">${C.description}</div>
                        </div>
                        <label class="cfg-toggle">
                          <input
                            type="checkbox"
                            .checked=${k}
                            ?disabled=${!c}
                            @change=${S=>m(C.id,S.target.checked)}
                          />
                          <span class="cfg-toggle__track"></span>
                        </label>
                      </div>
                    `})}
                </div>
              </div>
            `)}
      </div>
    </section>
  `}function dh(e){const t=!!e.configForm&&!e.configLoading&&!e.configSaving,n=Ps(e.configForm,e.agentId),s=Array.isArray(n.entry?.skills)?n.entry?.skills:void 0,i=new Set((s??[]).map(u=>u.trim()).filter(Boolean)),a=s!==void 0,o=!!(e.report&&e.activeAgentId===e.agentId),r=o?e.report?.skills??[]:[],c=e.filter.trim().toLowerCase(),d=c?r.filter(u=>[u.name,u.description,u.source].join(" ").toLowerCase().includes(c)):r,g=Yl(d),p=a?r.filter(u=>i.has(u.name)).length:r.length,h=r.length;return l`
    <section class="card">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">Skills</div>
          <div class="card-sub">
            Per-agent skill allowlist and workspace skills.
            ${h>0?l`<span class="mono">${p}/${h}</span>`:v}
          </div>
        </div>
        <div class="row" style="gap: 8px;">
          <button class="btn btn--sm" ?disabled=${!t} @click=${()=>e.onClear(e.agentId)}>
            Use All
          </button>
          <button
            class="btn btn--sm"
            ?disabled=${!t}
            @click=${()=>e.onDisableAll(e.agentId)}
          >
            Disable All
          </button>
          <button class="btn btn--sm" ?disabled=${e.configLoading} @click=${e.onConfigReload}>
            Reload Config
          </button>
          <button class="btn btn--sm" ?disabled=${e.loading} @click=${e.onRefresh}>
            ${e.loading?"Loading…":"Refresh"}
          </button>
          <button
            class="btn btn--sm primary"
            ?disabled=${e.configSaving||!e.configDirty}
            @click=${e.onConfigSave}
          >
            ${e.configSaving?"Saving…":"Save"}
          </button>
        </div>
      </div>

      ${e.configForm?v:l`
              <div class="callout info" style="margin-top: 12px">
                Load the gateway config to set per-agent skills.
              </div>
            `}
      ${a?l`
              <div class="callout info" style="margin-top: 12px">This agent uses a custom skill allowlist.</div>
            `:l`
              <div class="callout info" style="margin-top: 12px">
                All skills are enabled. Disabling any skill will create a per-agent allowlist.
              </div>
            `}
      ${!o&&!e.loading?l`
              <div class="callout info" style="margin-top: 12px">
                Load skills for this agent to view workspace-specific entries.
              </div>
            `:v}
      ${e.error?l`<div class="callout danger" style="margin-top: 12px;">${e.error}</div>`:v}

      <div class="filters" style="margin-top: 14px;">
        <label class="field" style="flex: 1;">
          <span>Filter</span>
          <input
            .value=${e.filter}
            @input=${u=>e.onFilterChange(u.target.value)}
            placeholder="Search skills"
          />
        </label>
        <div class="muted">${d.length} shown</div>
      </div>

      ${d.length===0?l`
              <div class="muted" style="margin-top: 16px">No skills found.</div>
            `:l`
              <div class="agent-skills-groups" style="margin-top: 16px;">
                ${g.map(u=>uh(u,{agentId:e.agentId,allowSet:i,usingAllowlist:a,editable:t,onToggle:e.onToggle}))}
              </div>
            `}
    </section>
  `}function uh(e,t){const n=e.id==="workspace"||e.id==="built-in";return l`
    <details class="agent-skills-group" ?open=${!n}>
      <summary class="agent-skills-header">
        <span>${e.label}</span>
        <span class="muted">${e.skills.length}</span>
      </summary>
      <div class="list skills-grid">
        ${e.skills.map(s=>gh(s,{agentId:t.agentId,allowSet:t.allowSet,usingAllowlist:t.usingAllowlist,editable:t.editable,onToggle:t.onToggle}))}
      </div>
    </details>
  `}function gh(e,t){const n=t.usingAllowlist?t.allowSet.has(e.name):!0,s=Zl(e),i=Jl(e);return l`
    <div class="list-item agent-skill-row">
      <div class="list-main">
        <div class="list-title">${e.emoji?`${e.emoji} `:""}${e.name}</div>
        <div class="list-sub">${e.description}</div>
        ${Xl({skill:e})}
        ${s.length>0?l`<div class="muted" style="margin-top: 6px;">Missing: ${s.join(", ")}</div>`:v}
        ${i.length>0?l`<div class="muted" style="margin-top: 6px;">Reason: ${i.join(", ")}</div>`:v}
      </div>
      <div class="list-meta">
        <label class="cfg-toggle">
          <input
            type="checkbox"
            .checked=${n}
            ?disabled=${!t.editable}
            @change=${a=>t.onToggle(t.agentId,e.name,a.target.checked)}
          />
          <span class="cfg-toggle__track"></span>
        </label>
      </div>
    </div>
  `}function ph(e){const t=e.agentsList?.agents??[],n=e.agentsList?.defaultId??null,s=e.selectedAgentId??n??t[0]?.id??null,i=s?t.find(a=>a.id===s)??null:null;return l`
    <div class="agents-layout">
      <section class="card agents-sidebar">
        <div class="row" style="justify-content: space-between;">
          <div>
            <div class="card-title">Agents</div>
            <div class="card-sub">${t.length} configured.</div>
          </div>
          <button class="btn btn--sm" ?disabled=${e.loading} @click=${e.onRefresh}>
            ${e.loading?"Loading…":"Refresh"}
          </button>
        </div>
        ${e.error?l`<div class="callout danger" style="margin-top: 12px;">${e.error}</div>`:v}
        <div class="agent-list" style="margin-top: 12px;">
          ${t.length===0?l`
                  <div class="muted">No agents found.</div>
                `:t.map(a=>{const o=Gl(a.id,n),r=Rs(a,e.agentIdentityById[a.id]??null);return l`
                    <button
                      type="button"
                      class="agent-row ${s===a.id?"active":""}"
                      @click=${()=>e.onSelectAgent(a.id)}
                    >
                      <div class="agent-avatar">${r||Mi(a).slice(0,1)}</div>
                      <div class="agent-info">
                        <div class="agent-title">${Mi(a)}</div>
                        <div class="agent-sub mono">${a.id}</div>
                      </div>
                      ${o?l`<span class="agent-pill">${o}</span>`:v}
                    </button>
                  `})}
        </div>
      </section>
      <section class="agents-main">
        ${i?l`
                ${fh(i,n,e.agentIdentityById[i.id]??null)}
                ${hh(e.activePanel,a=>e.onSelectPanel(a))}
                ${e.activePanel==="overview"?vh({agent:i,defaultId:n,configForm:e.configForm,agentFilesList:e.agentFilesList,agentIdentity:e.agentIdentityById[i.id]??null,agentIdentityError:e.agentIdentityError,agentIdentityLoading:e.agentIdentityLoading,configLoading:e.configLoading,configSaving:e.configSaving,configDirty:e.configDirty,onConfigReload:e.onConfigReload,onConfigSave:e.onConfigSave,onModelChange:e.onModelChange,onModelFallbacksChange:e.onModelFallbacksChange}):v}
                ${e.activePanel==="files"?rh({agentId:i.id,agentFilesList:e.agentFilesList,agentFilesLoading:e.agentFilesLoading,agentFilesError:e.agentFilesError,agentFileActive:e.agentFileActive,agentFileContents:e.agentFileContents,agentFileDrafts:e.agentFileDrafts,agentFileSaving:e.agentFileSaving,onLoadFiles:e.onLoadFiles,onSelectFile:e.onSelectFile,onFileDraftChange:e.onFileDraftChange,onFileReset:e.onFileReset,onFileSave:e.onFileSave}):v}
                ${e.activePanel==="tools"?ch({agentId:i.id,configForm:e.configForm,configLoading:e.configLoading,configSaving:e.configSaving,configDirty:e.configDirty,onProfileChange:e.onToolsProfileChange,onOverridesChange:e.onToolsOverridesChange,onConfigReload:e.onConfigReload,onConfigSave:e.onConfigSave}):v}
                ${e.activePanel==="skills"?dh({agentId:i.id,report:e.agentSkillsReport,loading:e.agentSkillsLoading,error:e.agentSkillsError,activeAgentId:e.agentSkillsAgentId,configForm:e.configForm,configLoading:e.configLoading,configSaving:e.configSaving,configDirty:e.configDirty,filter:e.skillsFilter,onFilterChange:e.onSkillsFilterChange,onRefresh:e.onSkillsRefresh,onToggle:e.onAgentSkillToggle,onClear:e.onAgentSkillsClear,onDisableAll:e.onAgentSkillsDisableAll,onConfigReload:e.onConfigReload,onConfigSave:e.onConfigSave}):v}
                ${e.activePanel==="channels"?ah({context:qo(i,e.configForm,e.agentFilesList,n,e.agentIdentityById[i.id]??null),configForm:e.configForm,snapshot:e.channelsSnapshot,loading:e.channelsLoading,error:e.channelsError,lastSuccess:e.channelsLastSuccess,onRefresh:e.onChannelsRefresh}):v}
                ${e.activePanel==="cron"?oh({context:qo(i,e.configForm,e.agentFilesList,n,e.agentIdentityById[i.id]??null),agentId:i.id,jobs:e.cronJobs,status:e.cronStatus,loading:e.cronLoading,error:e.cronError,onRefresh:e.onCronRefresh}):v}
              `:l`
                <div class="card">
                  <div class="card-title">Select an agent</div>
                  <div class="card-sub">Pick an agent to inspect its workspace and tools.</div>
                </div>
              `}
      </section>
    </div>
  `}function fh(e,t,n){const s=Gl(e.id,t),i=Mi(e),a=e.identity?.theme?.trim()||"Agent workspace and routing.",o=Rs(e,n);return l`
    <section class="card agent-header">
      <div class="agent-header-main">
        <div class="agent-avatar agent-avatar--lg">${o||i.slice(0,1)}</div>
        <div>
          <div class="card-title">${i}</div>
          <div class="card-sub">${a}</div>
        </div>
      </div>
      <div class="agent-header-meta">
        <div class="mono">${e.id}</div>
        ${s?l`<span class="agent-pill">${s}</span>`:v}
      </div>
    </section>
  `}function hh(e,t){return l`
    <div class="agent-tabs">
      ${[{id:"overview",label:"Overview"},{id:"files",label:"Files"},{id:"tools",label:"Tools"},{id:"skills",label:"Skills"},{id:"channels",label:"Channels"},{id:"cron",label:"Cron Jobs"}].map(s=>l`
          <button
            class="agent-tab ${e===s.id?"active":""}"
            type="button"
            @click=${()=>t(s.id)}
          >
            ${s.label}
          </button>
        `)}
    </div>
  `}function vh(e){const{agent:t,configForm:n,agentFilesList:s,agentIdentity:i,agentIdentityLoading:a,agentIdentityError:o,configLoading:r,configSaving:c,configDirty:d,onConfigReload:g,onConfigSave:p,onModelChange:h,onModelFallbacksChange:u}=e,f=Ps(n,t.id),w=(s&&s.agentId===t.id?s.workspace:null)||f.entry?.workspace||f.defaults?.workspace||"default",A=f.entry?.model?$n(f.entry?.model):$n(f.defaults?.model),C=$n(f.defaults?.model),k=Go(f.entry?.model)||(A!=="-"?Vo(A):null),S=Go(f.defaults?.model)||(C!=="-"?Vo(C):null),E=k??S??null,T=Wf(f.entry?.model),I=T?T.join(", "):"",H=i?.name?.trim()||t.identity?.name?.trim()||t.name?.trim()||f.entry?.name||"-",te=Rs(t,i)||"-",R=Array.isArray(f.entry?.skills)?f.entry?.skills:null,q=R?.length??null,ie=a?"Loading…":o?"Unavailable":"",le=!!(e.defaultId&&t.id===e.defaultId);return l`
    <section class="card">
      <div class="card-title">Overview</div>
      <div class="card-sub">Workspace paths and identity metadata.</div>
      <div class="agents-overview-grid" style="margin-top: 16px;">
        <div class="agent-kv">
          <div class="label">Workspace</div>
          <div class="mono">${w}</div>
        </div>
        <div class="agent-kv">
          <div class="label">Primary Model</div>
          <div class="mono">${A}</div>
        </div>
        <div class="agent-kv">
          <div class="label">Identity Name</div>
          <div>${H}</div>
          ${ie?l`<div class="agent-kv-sub muted">${ie}</div>`:v}
        </div>
        <div class="agent-kv">
          <div class="label">Default</div>
          <div>${le?"yes":"no"}</div>
        </div>
        <div class="agent-kv">
          <div class="label">Identity Emoji</div>
          <div>${te}</div>
        </div>
        <div class="agent-kv">
          <div class="label">Skills Filter</div>
          <div>${R?`${q} selected`:"all skills"}</div>
        </div>
      </div>

      <div class="agent-model-select" style="margin-top: 20px;">
        <div class="label">Model Selection</div>
        <div class="row" style="gap: 12px; flex-wrap: wrap;">
          <label class="field" style="min-width: 260px; flex: 1;">
            <span>Primary model${le?" (default)":""}</span>
            <select
              .value=${E??""}
              ?disabled=${!n||r||c}
              @change=${_=>h(t.id,_.target.value||null)}
            >
              ${le?v:l`
                      <option value="">
                        ${S?`Inherit default (${S})`:"Inherit default"}
                      </option>
                    `}
              ${Gf(n,E??void 0)}
            </select>
          </label>
          <label class="field" style="min-width: 260px; flex: 1;">
            <span>Fallbacks (comma-separated)</span>
            <input
              .value=${I}
              ?disabled=${!n||r||c}
              placeholder="provider/model, provider/model"
              @input=${_=>u(t.id,qf(_.target.value))}
            />
          </label>
        </div>
        <div class="row" style="justify-content: flex-end; gap: 8px;">
          <button class="btn btn--sm" ?disabled=${r} @click=${g}>
            Reload Config
          </button>
          <button
            class="btn btn--sm primary"
            ?disabled=${c||!d}
            @click=${p}
          >
            ${c?"Saving…":"Save"}
          </button>
        </div>
      </div>
    </section>
  `}const mh=new Set(["title","description","default","nullable"]);function bh(e){return Object.keys(e??{}).filter(n=>!mh.has(n)).length===0}function yh(e){if(e===void 0)return"";try{return JSON.stringify(e,null,2)??""}catch{return""}}const In={chevronDown:l`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `,plus:l`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  `,minus:l`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  `,trash:l`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  `,edit:l`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  `};function bt(e){const{schema:t,value:n,path:s,hints:i,unsupported:a,disabled:o,onPatch:r}=e,c=e.showLabel??!0,d=Le(t),g=Re(s,i),p=g?.label??t.title??st(String(s.at(-1))),h=g?.help??t.description,u=Zi(s);if(a.has(u))return l`<div class="cfg-field cfg-field--error">
      <div class="cfg-field__label">${p}</div>
      <div class="cfg-field__error">Unsupported schema node. Use Raw mode.</div>
    </div>`;if(t.anyOf||t.oneOf){const m=(t.anyOf??t.oneOf??[]).filter(E=>!(E.type==="null"||Array.isArray(E.type)&&E.type.includes("null")));if(m.length===1)return bt({...e,schema:m[0]});const w=E=>{if(E.const!==void 0)return E.const;if(E.enum&&E.enum.length===1)return E.enum[0]},A=m.map(w),C=A.every(E=>E!==void 0);if(C&&A.length>0&&A.length<=5){const E=n??t.default;return l`
        <div class="cfg-field">
          ${c?l`<label class="cfg-field__label">${p}</label>`:v}
          ${h?l`<div class="cfg-field__help">${h}</div>`:v}
          <div class="cfg-segmented">
            ${A.map(T=>l`
              <button
                type="button"
                class="cfg-segmented__btn ${T===E||String(T)===String(E)?"active":""}"
                ?disabled=${o}
                @click=${()=>r(s,T)}
              >
                ${String(T)}
              </button>
            `)}
          </div>
        </div>
      `}if(C&&A.length>5)return Zo({...e,options:A,value:n??t.default});const k=new Set(m.map(E=>Le(E)).filter(Boolean)),S=new Set([...k].map(E=>E==="integer"?"number":E));if([...S].every(E=>["string","number","boolean"].includes(E))){const E=S.has("string"),T=S.has("number");if(S.has("boolean")&&S.size===1)return bt({...e,schema:{...t,type:"boolean",anyOf:void 0,oneOf:void 0}});if(E||T)return Yo({...e,inputType:T&&!E?"number":"text"})}}if(t.enum){const f=t.enum;if(f.length<=5){const m=n??t.default;return l`
        <div class="cfg-field">
          ${c?l`<label class="cfg-field__label">${p}</label>`:v}
          ${h?l`<div class="cfg-field__help">${h}</div>`:v}
          <div class="cfg-segmented">
            ${f.map(w=>l`
              <button
                type="button"
                class="cfg-segmented__btn ${w===m||String(w)===String(m)?"active":""}"
                ?disabled=${o}
                @click=${()=>r(s,w)}
              >
                ${String(w)}
              </button>
            `)}
          </div>
        </div>
      `}return Zo({...e,options:f,value:n??t.default})}if(d==="object")return $h(e);if(d==="array")return wh(e);if(d==="boolean"){const f=typeof n=="boolean"?n:typeof t.default=="boolean"?t.default:!1;return l`
      <label class="cfg-toggle-row ${o?"disabled":""}">
        <div class="cfg-toggle-row__content">
          <span class="cfg-toggle-row__label">${p}</span>
          ${h?l`<span class="cfg-toggle-row__help">${h}</span>`:v}
        </div>
        <div class="cfg-toggle">
          <input
            type="checkbox"
            .checked=${f}
            ?disabled=${o}
            @change=${m=>r(s,m.target.checked)}
          />
          <span class="cfg-toggle__track"></span>
        </div>
      </label>
    `}return d==="number"||d==="integer"?xh(e):d==="string"?Yo({...e,inputType:"text"}):l`
    <div class="cfg-field cfg-field--error">
      <div class="cfg-field__label">${p}</div>
      <div class="cfg-field__error">Unsupported type: ${d}. Use Raw mode.</div>
    </div>
  `}function Yo(e){const{schema:t,value:n,path:s,hints:i,disabled:a,onPatch:o,inputType:r}=e,c=e.showLabel??!0,d=Re(s,i),g=d?.label??t.title??st(String(s.at(-1))),p=d?.help??t.description,h=(d?.sensitive??!1)&&!/^\$\{[^}]*\}$/.test(String(n??"").trim()),u=d?.placeholder??(h?"••••":t.default!==void 0?`Default: ${String(t.default)}`:""),f=n??"";return l`
    <div class="cfg-field">
      ${c?l`<label class="cfg-field__label">${g}</label>`:v}
      ${p?l`<div class="cfg-field__help">${p}</div>`:v}
      <div class="cfg-input-wrap">
        <input
          type=${h?"password":r}
          class="cfg-input"
          placeholder=${u}
          .value=${f==null?"":String(f)}
          ?disabled=${a}
          @input=${m=>{const w=m.target.value;if(r==="number"){if(w.trim()===""){o(s,void 0);return}const A=Number(w);o(s,Number.isNaN(A)?w:A);return}o(s,w)}}
          @change=${m=>{if(r==="number")return;const w=m.target.value;o(s,w.trim())}}
        />
        ${t.default!==void 0?l`
          <button
            type="button"
            class="cfg-input__reset"
            title="Reset to default"
            ?disabled=${a}
            @click=${()=>o(s,t.default)}
          >↺</button>
        `:v}
      </div>
    </div>
  `}function xh(e){const{schema:t,value:n,path:s,hints:i,disabled:a,onPatch:o}=e,r=e.showLabel??!0,c=Re(s,i),d=c?.label??t.title??st(String(s.at(-1))),g=c?.help??t.description,p=n??t.default??"",h=typeof p=="number"?p:0;return l`
    <div class="cfg-field">
      ${r?l`<label class="cfg-field__label">${d}</label>`:v}
      ${g?l`<div class="cfg-field__help">${g}</div>`:v}
      <div class="cfg-number">
        <button
          type="button"
          class="cfg-number__btn"
          ?disabled=${a}
          @click=${()=>o(s,h-1)}
        >−</button>
        <input
          type="number"
          class="cfg-number__input"
          .value=${p==null?"":String(p)}
          ?disabled=${a}
          @input=${u=>{const f=u.target.value,m=f===""?void 0:Number(f);o(s,m)}}
        />
        <button
          type="button"
          class="cfg-number__btn"
          ?disabled=${a}
          @click=${()=>o(s,h+1)}
        >+</button>
      </div>
    </div>
  `}function Zo(e){const{schema:t,value:n,path:s,hints:i,disabled:a,options:o,onPatch:r}=e,c=e.showLabel??!0,d=Re(s,i),g=d?.label??t.title??st(String(s.at(-1))),p=d?.help??t.description,h=n??t.default,u=o.findIndex(m=>m===h||String(m)===String(h)),f="__unset__";return l`
    <div class="cfg-field">
      ${c?l`<label class="cfg-field__label">${g}</label>`:v}
      ${p?l`<div class="cfg-field__help">${p}</div>`:v}
      <select
        class="cfg-select"
        ?disabled=${a}
        .value=${u>=0?String(u):f}
        @change=${m=>{const w=m.target.value;r(s,w===f?void 0:o[Number(w)])}}
      >
        <option value=${f}>Select...</option>
        ${o.map((m,w)=>l`
          <option value=${String(w)}>${String(m)}</option>
        `)}
      </select>
    </div>
  `}function $h(e){const{schema:t,value:n,path:s,hints:i,unsupported:a,disabled:o,onPatch:r}=e,c=Re(s,i),d=c?.label??t.title??st(String(s.at(-1))),g=c?.help??t.description,p=n??t.default,h=p&&typeof p=="object"&&!Array.isArray(p)?p:{},u=t.properties??{},m=Object.entries(u).toSorted((S,E)=>{const T=Re([...s,S[0]],i)?.order??0,I=Re([...s,E[0]],i)?.order??0;return T!==I?T-I:S[0].localeCompare(E[0])}),w=new Set(Object.keys(u)),A=t.additionalProperties,C=!!A&&typeof A=="object",k=l`
    ${m.map(([S,E])=>bt({schema:E,value:h[S],path:[...s,S],hints:i,unsupported:a,disabled:o,onPatch:r}))}
    ${C?kh({schema:A,value:h,path:s,hints:i,unsupported:a,disabled:o,reservedKeys:w,onPatch:r}):v}
  `;return s.length===1?l`
      <div class="cfg-fields">
        ${k}
      </div>
    `:l`
    <details class="cfg-object" open>
      <summary class="cfg-object__header">
        <span class="cfg-object__title">${d}</span>
        <span class="cfg-object__chevron">${In.chevronDown}</span>
      </summary>
      ${g?l`<div class="cfg-object__help">${g}</div>`:v}
      <div class="cfg-object__content">
        ${k}
      </div>
    </details>
  `}function wh(e){const{schema:t,value:n,path:s,hints:i,unsupported:a,disabled:o,onPatch:r}=e,c=e.showLabel??!0,d=Re(s,i),g=d?.label??t.title??st(String(s.at(-1))),p=d?.help??t.description,h=Array.isArray(t.items)?t.items[0]:t.items;if(!h)return l`
      <div class="cfg-field cfg-field--error">
        <div class="cfg-field__label">${g}</div>
        <div class="cfg-field__error">Unsupported array schema. Use Raw mode.</div>
      </div>
    `;const u=Array.isArray(n)?n:Array.isArray(t.default)?t.default:[];return l`
    <div class="cfg-array">
      <div class="cfg-array__header">
        ${c?l`<span class="cfg-array__label">${g}</span>`:v}
        <span class="cfg-array__count">${u.length} item${u.length!==1?"s":""}</span>
        <button
          type="button"
          class="cfg-array__add"
          ?disabled=${o}
          @click=${()=>{const f=[...u,Hr(h)];r(s,f)}}
        >
          <span class="cfg-array__add-icon">${In.plus}</span>
          Add
        </button>
      </div>
      ${p?l`<div class="cfg-array__help">${p}</div>`:v}

      ${u.length===0?l`
              <div class="cfg-array__empty">No items yet. Click "Add" to create one.</div>
            `:l`
        <div class="cfg-array__items">
          ${u.map((f,m)=>l`
            <div class="cfg-array__item">
              <div class="cfg-array__item-header">
                <span class="cfg-array__item-index">#${m+1}</span>
                <button
                  type="button"
                  class="cfg-array__item-remove"
                  title="Remove item"
                  ?disabled=${o}
                  @click=${()=>{const w=[...u];w.splice(m,1),r(s,w)}}
                >
                  ${In.trash}
                </button>
              </div>
              <div class="cfg-array__item-content">
                ${bt({schema:h,value:f,path:[...s,m],hints:i,unsupported:a,disabled:o,showLabel:!1,onPatch:r})}
              </div>
            </div>
          `)}
        </div>
      `}
    </div>
  `}function kh(e){const{schema:t,value:n,path:s,hints:i,unsupported:a,disabled:o,reservedKeys:r,onPatch:c}=e,d=bh(t),g=Object.entries(n??{}).filter(([p])=>!r.has(p));return l`
    <div class="cfg-map">
      <div class="cfg-map__header">
        <span class="cfg-map__label">Custom entries</span>
        <button
          type="button"
          class="cfg-map__add"
          ?disabled=${o}
          @click=${()=>{const p={...n};let h=1,u=`custom-${h}`;for(;u in p;)h+=1,u=`custom-${h}`;p[u]=d?{}:Hr(t),c(s,p)}}
        >
          <span class="cfg-map__add-icon">${In.plus}</span>
          Add Entry
        </button>
      </div>

      ${g.length===0?l`
              <div class="cfg-map__empty">No custom entries.</div>
            `:l`
        <div class="cfg-map__items">
          ${g.map(([p,h])=>{const u=[...s,p],f=yh(h);return l`
              <div class="cfg-map__item">
                <div class="cfg-map__item-key">
                  <input
                    type="text"
                    class="cfg-input cfg-input--sm"
                    placeholder="Key"
                    .value=${p}
                    ?disabled=${o}
                    @change=${m=>{const w=m.target.value.trim();if(!w||w===p)return;const A={...n};w in A||(A[w]=A[p],delete A[p],c(s,A))}}
                  />
                </div>
                <div class="cfg-map__item-value">
                  ${d?l`
                        <textarea
                          class="cfg-textarea cfg-textarea--sm"
                          placeholder="JSON value"
                          rows="2"
                          .value=${f}
                          ?disabled=${o}
                          @change=${m=>{const w=m.target,A=w.value.trim();if(!A){c(u,void 0);return}try{c(u,JSON.parse(A))}catch{w.value=f}}}
                        ></textarea>
                      `:bt({schema:t,value:h,path:u,hints:i,unsupported:a,disabled:o,showLabel:!1,onPatch:c})}
                </div>
                <button
                  type="button"
                  class="cfg-map__item-remove"
                  title="Remove entry"
                  ?disabled=${o}
                  @click=${()=>{const m={...n};delete m[p],c(s,m)}}
                >
                  ${In.trash}
                </button>
              </div>
            `})}
        </div>
      `}
    </div>
  `}const Jo={env:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="12" cy="12" r="3"></circle>
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
      ></path>
    </svg>
  `,update:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  `,agents:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path
        d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"
      ></path>
      <circle cx="8" cy="14" r="1"></circle>
      <circle cx="16" cy="14" r="1"></circle>
    </svg>
  `,auth:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  `,channels:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `,messages:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  `,commands:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
  `,hooks:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
  `,skills:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      ></polygon>
    </svg>
  `,tools:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
      ></path>
    </svg>
  `,gateway:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path
        d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
      ></path>
    </svg>
  `,wizard:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M15 4V2"></path>
      <path d="M15 16v-2"></path>
      <path d="M8 9h2"></path>
      <path d="M20 9h2"></path>
      <path d="M17.8 11.8 19 13"></path>
      <path d="M15 9h0"></path>
      <path d="M17.8 6.2 19 5"></path>
      <path d="m3 21 9-9"></path>
      <path d="M12.2 6.2 11 5"></path>
    </svg>
  `,meta:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
    </svg>
  `,logging:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  `,browser:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="4"></circle>
      <line x1="21.17" y1="8" x2="12" y2="8"></line>
      <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
      <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
    </svg>
  `,ui:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="3" y1="9" x2="21" y2="9"></line>
      <line x1="9" y1="21" x2="9" y2="9"></line>
    </svg>
  `,models:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path
        d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
      ></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  `,bindings:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
      <line x1="6" y1="6" x2="6.01" y2="6"></line>
      <line x1="6" y1="18" x2="6.01" y2="18"></line>
    </svg>
  `,broadcast:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path>
      <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path>
      <circle cx="12" cy="12" r="2"></circle>
      <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path>
      <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"></path>
    </svg>
  `,audio:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M9 18V5l12-2v13"></path>
      <circle cx="6" cy="18" r="3"></circle>
      <circle cx="18" cy="16" r="3"></circle>
    </svg>
  `,session:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  `,cron:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  `,web:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path
        d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
      ></path>
    </svg>
  `,discovery:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  `,canvasHost:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  `,talk:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="23"></line>
      <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
  `,plugins:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M12 2v6"></path>
      <path d="m4.93 10.93 4.24 4.24"></path>
      <path d="M2 12h6"></path>
      <path d="m4.93 13.07 4.24-4.24"></path>
      <path d="M12 22v-6"></path>
      <path d="m19.07 13.07-4.24-4.24"></path>
      <path d="M22 12h-6"></path>
      <path d="m19.07 10.93-4.24 4.24"></path>
    </svg>
  `,default:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
    </svg>
  `},Aa={env:{label:"Environment Variables",description:"Environment variables passed to the gateway process"},update:{label:"Updates",description:"Auto-update settings and release channel"},agents:{label:"Agents",description:"Agent configurations, models, and identities"},auth:{label:"Authentication",description:"API keys and authentication profiles"},channels:{label:"Channels",description:"Messaging channels (Telegram, Discord, Slack, etc.)"},messages:{label:"Messages",description:"Message handling and routing settings"},commands:{label:"Commands",description:"Custom slash commands"},hooks:{label:"Hooks",description:"Webhooks and event hooks"},skills:{label:"Skills",description:"Skill packs and capabilities"},tools:{label:"Tools",description:"Tool configurations (browser, search, etc.)"},gateway:{label:"Gateway",description:"Gateway server settings (port, auth, binding)"},wizard:{label:"Setup Wizard",description:"Setup wizard state and history"},meta:{label:"Metadata",description:"Gateway metadata and version information"},logging:{label:"Logging",description:"Log levels and output configuration"},browser:{label:"Browser",description:"Browser automation settings"},ui:{label:"UI",description:"User interface preferences"},models:{label:"Models",description:"AI model configurations and providers"},bindings:{label:"Bindings",description:"Key bindings and shortcuts"},broadcast:{label:"Broadcast",description:"Broadcast and notification settings"},audio:{label:"Audio",description:"Audio input/output settings"},session:{label:"Session",description:"Session management and persistence"},cron:{label:"Cron",description:"Scheduled tasks and automation"},web:{label:"Web",description:"Web server and API settings"},discovery:{label:"Discovery",description:"Service discovery and networking"},canvasHost:{label:"Canvas Host",description:"Canvas rendering and display"},talk:{label:"Talk",description:"Voice and speech settings"},plugins:{label:"Plugins",description:"Plugin management and extensions"}};function Xo(e){return Jo[e]??Jo.default}function Sh(e,t,n){if(!n)return!0;const s=n.toLowerCase(),i=Aa[e];return e.toLowerCase().includes(s)||i&&(i.label.toLowerCase().includes(s)||i.description.toLowerCase().includes(s))?!0:mn(t,s)}function mn(e,t){if(e.title?.toLowerCase().includes(t)||e.description?.toLowerCase().includes(t)||e.enum?.some(s=>String(s).toLowerCase().includes(t)))return!0;if(e.properties){for(const[s,i]of Object.entries(e.properties))if(s.toLowerCase().includes(t)||mn(i,t))return!0}if(e.items){const s=Array.isArray(e.items)?e.items:[e.items];for(const i of s)if(i&&mn(i,t))return!0}if(e.additionalProperties&&typeof e.additionalProperties=="object"&&mn(e.additionalProperties,t))return!0;const n=e.anyOf??e.oneOf??e.allOf;if(n){for(const s of n)if(s&&mn(s,t))return!0}return!1}function Ah(e){if(!e.schema)return l`
      <div class="muted">Schema unavailable.</div>
    `;const t=e.schema,n=e.value??{};if(Le(t)!=="object"||!t.properties)return l`
      <div class="callout danger">Unsupported schema. Use Raw.</div>
    `;const s=new Set(e.unsupportedPaths??[]),i=t.properties,a=e.searchQuery??"",o=e.activeSection,r=e.activeSubsection??null,d=Object.entries(i).toSorted((p,h)=>{const u=Re([p[0]],e.uiHints)?.order??50,f=Re([h[0]],e.uiHints)?.order??50;return u!==f?u-f:p[0].localeCompare(h[0])}).filter(([p,h])=>!(o&&p!==o||a&&!Sh(p,h,a)));let g=null;if(o&&r&&d.length===1){const p=d[0]?.[1];p&&Le(p)==="object"&&p.properties&&p.properties[r]&&(g={sectionKey:o,subsectionKey:r,schema:p.properties[r]})}return d.length===0?l`
      <div class="config-empty">
        <div class="config-empty__icon">${se.search}</div>
        <div class="config-empty__text">
          ${a?`No settings match "${a}"`:"No settings in this section"}
        </div>
      </div>
    `:l`
    <div class="config-form config-form--modern">
      ${g?(()=>{const{sectionKey:p,subsectionKey:h,schema:u}=g,f=Re([p,h],e.uiHints),m=f?.label??u.title??st(h),w=f?.help??u.description??"",A=n[p],C=A&&typeof A=="object"?A[h]:void 0,k=`config-section-${p}-${h}`;return l`
              <section class="config-section-card" id=${k}>
                <div class="config-section-card__header">
                  <span class="config-section-card__icon">${Xo(p)}</span>
                  <div class="config-section-card__titles">
                    <h3 class="config-section-card__title">${m}</h3>
                    ${w?l`<p class="config-section-card__desc">${w}</p>`:v}
                  </div>
                </div>
                <div class="config-section-card__content">
                  ${bt({schema:u,value:C,path:[p,h],hints:e.uiHints,unsupported:s,disabled:e.disabled??!1,showLabel:!1,onPatch:e.onPatch})}
                </div>
              </section>
            `})():d.map(([p,h])=>{const u=Aa[p]??{label:p.charAt(0).toUpperCase()+p.slice(1),description:h.description??""};return l`
              <section class="config-section-card" id="config-section-${p}">
                <div class="config-section-card__header">
                  <span class="config-section-card__icon">${Xo(p)}</span>
                  <div class="config-section-card__titles">
                    <h3 class="config-section-card__title">${u.label}</h3>
                    ${u.description?l`<p class="config-section-card__desc">${u.description}</p>`:v}
                  </div>
                </div>
                <div class="config-section-card__content">
                  ${bt({schema:h,value:n[p],path:[p],hints:e.uiHints,unsupported:s,disabled:e.disabled??!1,showLabel:!1,onPatch:e.onPatch})}
                </div>
              </section>
            `})}
    </div>
  `}const Ch=new Set(["title","description","default","nullable"]);function Th(e){return Object.keys(e??{}).filter(n=>!Ch.has(n)).length===0}function ec(e){const t=e.filter(i=>i!=null),n=t.length!==e.length,s=[];for(const i of t)s.some(a=>Object.is(a,i))||s.push(i);return{enumValues:s,nullable:n}}function tc(e){return!e||typeof e!="object"?{schema:null,unsupportedPaths:["<root>"]}:kn(e,[])}function kn(e,t){const n=new Set,s={...e},i=Zi(t)||"<root>";if(e.anyOf||e.oneOf||e.allOf){const r=_h(e,t);return r||{schema:e,unsupportedPaths:[i]}}const a=Array.isArray(e.type)&&e.type.includes("null"),o=Le(e)??(e.properties||e.additionalProperties?"object":void 0);if(s.type=o??e.type,s.nullable=a||e.nullable,s.enum){const{enumValues:r,nullable:c}=ec(s.enum);s.enum=r,c&&(s.nullable=!0),r.length===0&&n.add(i)}if(o==="object"){const r=e.properties??{},c={};for(const[d,g]of Object.entries(r)){const p=kn(g,[...t,d]);p.schema&&(c[d]=p.schema);for(const h of p.unsupportedPaths)n.add(h)}if(s.properties=c,e.additionalProperties===!0)n.add(i);else if(e.additionalProperties===!1)s.additionalProperties=!1;else if(e.additionalProperties&&typeof e.additionalProperties=="object"&&!Th(e.additionalProperties)){const d=kn(e.additionalProperties,[...t,"*"]);s.additionalProperties=d.schema??e.additionalProperties,d.unsupportedPaths.length>0&&n.add(i)}}else if(o==="array"){const r=Array.isArray(e.items)?e.items[0]:e.items;if(!r)n.add(i);else{const c=kn(r,[...t,"*"]);s.items=c.schema??r,c.unsupportedPaths.length>0&&n.add(i)}}else o!=="string"&&o!=="number"&&o!=="integer"&&o!=="boolean"&&!s.enum&&n.add(i);return{schema:s,unsupportedPaths:Array.from(n)}}function _h(e,t){if(e.allOf)return null;const n=e.anyOf??e.oneOf;if(!n)return null;const s=[],i=[];let a=!1;for(const r of n){if(!r||typeof r!="object")return null;if(Array.isArray(r.enum)){const{enumValues:c,nullable:d}=ec(r.enum);s.push(...c),d&&(a=!0);continue}if("const"in r){if(r.const==null){a=!0;continue}s.push(r.const);continue}if(Le(r)==="null"){a=!0;continue}i.push(r)}if(s.length>0&&i.length===0){const r=[];for(const c of s)r.some(d=>Object.is(d,c))||r.push(c);return{schema:{...e,enum:r,nullable:a,anyOf:void 0,oneOf:void 0,allOf:void 0},unsupportedPaths:[]}}if(i.length===1){const r=kn(i[0],t);return r.schema&&(r.schema.nullable=a||r.schema.nullable),r}const o=new Set(["string","number","integer","boolean"]);return i.length>0&&s.length===0&&i.every(r=>r.type&&o.has(String(r.type)))?{schema:{...e,nullable:a},unsupportedPaths:[]}:null}function Eh(e,t){let n=e;for(const s of t){if(!n)return null;const i=Le(n);if(i==="object"){const a=n.properties??{};if(typeof s=="string"&&a[s]){n=a[s];continue}const o=n.additionalProperties;if(typeof s=="string"&&o&&typeof o=="object"){n=o;continue}return null}if(i==="array"){if(typeof s!="number")return null;n=(Array.isArray(n.items)?n.items[0]:n.items)??null;continue}return null}return n}function Lh(e,t){const s=(e.channels??{})[t],i=e[t];return(s&&typeof s=="object"?s:null)??(i&&typeof i=="object"?i:null)??{}}const Mh=["groupPolicy","streamMode","dmPolicy"];function Ih(e){if(e==null)return"n/a";if(typeof e=="string"||typeof e=="number"||typeof e=="boolean")return String(e);try{return JSON.stringify(e)}catch{return"n/a"}}function Rh(e){const t=Mh.flatMap(n=>n in e?[[n,e[n]]]:[]);return t.length===0?null:l`
    <div class="status-list" style="margin-top: 12px;">
      ${t.map(([n,s])=>l`
          <div>
            <span class="label">${n}</span>
            <span>${Ih(s)}</span>
          </div>
        `)}
    </div>
  `}function Ph(e){const t=tc(e.schema),n=t.schema;if(!n)return l`
      <div class="callout danger">Schema unavailable. Use Raw.</div>
    `;const s=Eh(n,["channels",e.channelId]);if(!s)return l`
      <div class="callout danger">Channel config schema unavailable.</div>
    `;const i=e.configValue??{},a=Lh(i,e.channelId);return l`
    <div class="config-form">
      ${bt({schema:s,value:a,path:["channels",e.channelId],hints:e.uiHints,unsupported:new Set(t.unsupportedPaths),disabled:e.disabled,showLabel:!1,onPatch:e.onPatch})}
    </div>
    ${Rh(a)}
  `}function it(e){const{channelId:t,props:n}=e,s=n.configSaving||n.configSchemaLoading;return l`
    <div style="margin-top: 16px;">
      ${n.configSchemaLoading?l`
              <div class="muted">Loading config schema…</div>
            `:Ph({channelId:t,configValue:n.configForm,schema:n.configSchema,uiHints:n.configUiHints,disabled:s,onPatch:n.onConfigPatch})}
      <div class="row" style="margin-top: 12px;">
        <button
          class="btn primary"
          ?disabled=${s||!n.configFormDirty}
          @click=${()=>n.onConfigSave()}
        >
          ${n.configSaving?"Saving…":"Save"}
        </button>
        <button
          class="btn"
          ?disabled=${s}
          @click=${()=>n.onConfigReload()}
        >
          Reload
        </button>
      </div>
    </div>
  `}function Dh(e){const{props:t,discord:n,accountCountLabel:s}=e;return l`
    <div class="card">
      <div class="card-title">Discord</div>
      <div class="card-sub">Bot status and channel configuration.</div>
      ${s}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">Configured</span>
          <span>${n?.configured?"Yes":"No"}</span>
        </div>
        <div>
          <span class="label">Running</span>
          <span>${n?.running?"Yes":"No"}</span>
        </div>
        <div>
          <span class="label">Last start</span>
          <span>${n?.lastStartAt?ee(n.lastStartAt):"n/a"}</span>
        </div>
        <div>
          <span class="label">Last probe</span>
          <span>${n?.lastProbeAt?ee(n.lastProbeAt):"n/a"}</span>
        </div>
      </div>

      ${n?.lastError?l`<div class="callout danger" style="margin-top: 12px;">
            ${n.lastError}
          </div>`:v}

      ${n?.probe?l`<div class="callout" style="margin-top: 12px;">
            Probe ${n.probe.ok?"ok":"failed"} ·
            ${n.probe.status??""} ${n.probe.error??""}
          </div>`:v}

      ${it({channelId:"discord",props:t})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>t.onRefresh(!0)}>
          Probe
        </button>
      </div>
    </div>
  `}function Fh(e){const{props:t,googleChat:n,accountCountLabel:s}=e;return l`
    <div class="card">
      <div class="card-title">Google Chat</div>
      <div class="card-sub">Chat API webhook status and channel configuration.</div>
      ${s}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">Configured</span>
          <span>${n?n.configured?"Yes":"No":"n/a"}</span>
        </div>
        <div>
          <span class="label">Running</span>
          <span>${n?n.running?"Yes":"No":"n/a"}</span>
        </div>
        <div>
          <span class="label">Credential</span>
          <span>${n?.credentialSource??"n/a"}</span>
        </div>
        <div>
          <span class="label">Audience</span>
          <span>
            ${n?.audienceType?`${n.audienceType}${n.audience?` · ${n.audience}`:""}`:"n/a"}
          </span>
        </div>
        <div>
          <span class="label">Last start</span>
          <span>${n?.lastStartAt?ee(n.lastStartAt):"n/a"}</span>
        </div>
        <div>
          <span class="label">Last probe</span>
          <span>${n?.lastProbeAt?ee(n.lastProbeAt):"n/a"}</span>
        </div>
      </div>

      ${n?.lastError?l`<div class="callout danger" style="margin-top: 12px;">
            ${n.lastError}
          </div>`:v}

      ${n?.probe?l`<div class="callout" style="margin-top: 12px;">
            Probe ${n.probe.ok?"ok":"failed"} ·
            ${n.probe.status??""} ${n.probe.error??""}
          </div>`:v}

      ${it({channelId:"googlechat",props:t})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>t.onRefresh(!0)}>
          Probe
        </button>
      </div>
    </div>
  `}function Nh(e){const{props:t,imessage:n,accountCountLabel:s}=e;return l`
    <div class="card">
      <div class="card-title">iMessage</div>
      <div class="card-sub">macOS bridge status and channel configuration.</div>
      ${s}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">Configured</span>
          <span>${n?.configured?"Yes":"No"}</span>
        </div>
        <div>
          <span class="label">Running</span>
          <span>${n?.running?"Yes":"No"}</span>
        </div>
        <div>
          <span class="label">Last start</span>
          <span>${n?.lastStartAt?ee(n.lastStartAt):"n/a"}</span>
        </div>
        <div>
          <span class="label">Last probe</span>
          <span>${n?.lastProbeAt?ee(n.lastProbeAt):"n/a"}</span>
        </div>
      </div>

      ${n?.lastError?l`<div class="callout danger" style="margin-top: 12px;">
            ${n.lastError}
          </div>`:v}

      ${n?.probe?l`<div class="callout" style="margin-top: 12px;">
            Probe ${n.probe.ok?"ok":"failed"} ·
            ${n.probe.error??""}
          </div>`:v}

      ${it({channelId:"imessage",props:t})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>t.onRefresh(!0)}>
          Probe
        </button>
      </div>
    </div>
  `}function er(e){return e?e.length<=20?e:`${e.slice(0,8)}...${e.slice(-8)}`:"n/a"}function Oh(e){const{props:t,nostr:n,nostrAccounts:s,accountCountLabel:i,profileFormState:a,profileFormCallbacks:o,onEditProfile:r}=e,c=s[0],d=n?.configured??c?.configured??!1,g=n?.running??c?.running??!1,p=n?.publicKey??c?.publicKey,h=n?.lastStartAt??c?.lastStartAt??null,u=n?.lastError??c?.lastError??null,f=s.length>1,m=a!=null,w=C=>{const k=C.publicKey,S=C.profile,E=S?.displayName??S?.name??C.name??C.accountId;return l`
      <div class="account-card">
        <div class="account-card-header">
          <div class="account-card-title">${E}</div>
          <div class="account-card-id">${C.accountId}</div>
        </div>
        <div class="status-list account-card-status">
          <div>
            <span class="label">Running</span>
            <span>${C.running?"Yes":"No"}</span>
          </div>
          <div>
            <span class="label">Configured</span>
            <span>${C.configured?"Yes":"No"}</span>
          </div>
          <div>
            <span class="label">Public Key</span>
            <span class="monospace" title="${k??""}">${er(k)}</span>
          </div>
          <div>
            <span class="label">Last inbound</span>
            <span>${C.lastInboundAt?ee(C.lastInboundAt):"n/a"}</span>
          </div>
          ${C.lastError?l`
                <div class="account-card-error">${C.lastError}</div>
              `:v}
        </div>
      </div>
    `},A=()=>{if(m&&o)return Cd({state:a,callbacks:o,accountId:s[0]?.accountId??"default"});const C=c?.profile??n?.profile,{name:k,displayName:S,about:E,picture:T,nip05:I}=C??{},H=k||S||E||T||I;return l`
      <div style="margin-top: 16px; padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="font-weight: 500;">Profile</div>
          ${d?l`
                <button
                  class="btn btn-sm"
                  @click=${r}
                  style="font-size: 12px; padding: 4px 8px;"
                >
                  Edit Profile
                </button>
              `:v}
        </div>
        ${H?l`
              <div class="status-list">
                ${T?l`
                      <div style="margin-bottom: 8px;">
                        <img
                          src=${T}
                          alt="Profile picture"
                          style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-color);"
                          @error=${Z=>{Z.target.style.display="none"}}
                        />
                      </div>
                    `:v}
                ${k?l`<div><span class="label">Name</span><span>${k}</span></div>`:v}
                ${S?l`<div><span class="label">Display Name</span><span>${S}</span></div>`:v}
                ${E?l`<div><span class="label">About</span><span style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">${E}</span></div>`:v}
                ${I?l`<div><span class="label">NIP-05</span><span>${I}</span></div>`:v}
              </div>
            `:l`
                <div style="color: var(--text-muted); font-size: 13px">
                  No profile set. Click "Edit Profile" to add your name, bio, and avatar.
                </div>
              `}
      </div>
    `};return l`
    <div class="card">
      <div class="card-title">Nostr</div>
      <div class="card-sub">Decentralized DMs via Nostr relays (NIP-04).</div>
      ${i}

      ${f?l`
            <div class="account-card-list">
              ${s.map(C=>w(C))}
            </div>
          `:l`
            <div class="status-list" style="margin-top: 16px;">
              <div>
                <span class="label">Configured</span>
                <span>${d?"Yes":"No"}</span>
              </div>
              <div>
                <span class="label">Running</span>
                <span>${g?"Yes":"No"}</span>
              </div>
              <div>
                <span class="label">Public Key</span>
                <span class="monospace" title="${p??""}"
                  >${er(p)}</span
                >
              </div>
              <div>
                <span class="label">Last start</span>
                <span>${h?ee(h):"n/a"}</span>
              </div>
            </div>
          `}

      ${u?l`<div class="callout danger" style="margin-top: 12px;">${u}</div>`:v}

      ${A()}

      ${it({channelId:"nostr",props:t})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>t.onRefresh(!1)}>Refresh</button>
      </div>
    </div>
  `}function Bh(e,t){const n=t.snapshot,s=n?.channels;if(!n||!s)return!1;const i=s[e],a=typeof i?.configured=="boolean"&&i.configured,o=typeof i?.running=="boolean"&&i.running,r=typeof i?.connected=="boolean"&&i.connected,d=(n.channelAccounts?.[e]??[]).some(g=>g.configured||g.running||g.connected);return a||o||r||d}function zh(e,t){return t?.[e]?.length??0}function nc(e,t){const n=zh(e,t);return n<2?v:l`<div class="account-count">Accounts (${n})</div>`}function Uh(e){const{props:t,signal:n,accountCountLabel:s}=e;return l`
    <div class="card">
      <div class="card-title">Signal</div>
      <div class="card-sub">signal-cli status and channel configuration.</div>
      ${s}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">Configured</span>
          <span>${n?.configured?"Yes":"No"}</span>
        </div>
        <div>
          <span class="label">Running</span>
          <span>${n?.running?"Yes":"No"}</span>
        </div>
        <div>
          <span class="label">Base URL</span>
          <span>${n?.baseUrl??"n/a"}</span>
        </div>
        <div>
          <span class="label">Last start</span>
          <span>${n?.lastStartAt?ee(n.lastStartAt):"n/a"}</span>
        </div>
        <div>
          <span class="label">Last probe</span>
          <span>${n?.lastProbeAt?ee(n.lastProbeAt):"n/a"}</span>
        </div>
      </div>

      ${n?.lastError?l`<div class="callout danger" style="margin-top: 12px;">
            ${n.lastError}
          </div>`:v}

      ${n?.probe?l`<div class="callout" style="margin-top: 12px;">
            Probe ${n.probe.ok?"ok":"failed"} ·
            ${n.probe.status??""} ${n.probe.error??""}
          </div>`:v}

      ${it({channelId:"signal",props:t})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>t.onRefresh(!0)}>
          Probe
        </button>
      </div>
    </div>
  `}function Hh(e){const{props:t,slack:n,accountCountLabel:s}=e;return l`
    <div class="card">
      <div class="card-title">Slack</div>
      <div class="card-sub">Socket mode status and channel configuration.</div>
      ${s}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">Configured</span>
          <span>${n?.configured?"Yes":"No"}</span>
        </div>
        <div>
          <span class="label">Running</span>
          <span>${n?.running?"Yes":"No"}</span>
        </div>
        <div>
          <span class="label">Last start</span>
          <span>${n?.lastStartAt?ee(n.lastStartAt):"n/a"}</span>
        </div>
        <div>
          <span class="label">Last probe</span>
          <span>${n?.lastProbeAt?ee(n.lastProbeAt):"n/a"}</span>
        </div>
      </div>

      ${n?.lastError?l`<div class="callout danger" style="margin-top: 12px;">
            ${n.lastError}
          </div>`:v}

      ${n?.probe?l`<div class="callout" style="margin-top: 12px;">
            Probe ${n.probe.ok?"ok":"failed"} ·
            ${n.probe.status??""} ${n.probe.error??""}
          </div>`:v}

      ${it({channelId:"slack",props:t})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>t.onRefresh(!0)}>
          Probe
        </button>
      </div>
    </div>
  `}function jh(e){const{props:t,telegram:n,telegramAccounts:s,accountCountLabel:i}=e,a=s.length>1,o=r=>{const d=r.probe?.bot?.username,g=r.name||r.accountId;return l`
      <div class="account-card">
        <div class="account-card-header">
          <div class="account-card-title">
            ${d?`@${d}`:g}
          </div>
          <div class="account-card-id">${r.accountId}</div>
        </div>
        <div class="status-list account-card-status">
          <div>
            <span class="label">Running</span>
            <span>${r.running?"Yes":"No"}</span>
          </div>
          <div>
            <span class="label">Configured</span>
            <span>${r.configured?"Yes":"No"}</span>
          </div>
          <div>
            <span class="label">Last inbound</span>
            <span>${r.lastInboundAt?ee(r.lastInboundAt):"n/a"}</span>
          </div>
          ${r.lastError?l`
                <div class="account-card-error">
                  ${r.lastError}
                </div>
              `:v}
        </div>
      </div>
    `};return l`
    <div class="card">
      <div class="card-title">Telegram</div>
      <div class="card-sub">Bot status and channel configuration.</div>
      ${i}

      ${a?l`
            <div class="account-card-list">
              ${s.map(r=>o(r))}
            </div>
          `:l`
            <div class="status-list" style="margin-top: 16px;">
              <div>
                <span class="label">Configured</span>
                <span>${n?.configured?"Yes":"No"}</span>
              </div>
              <div>
                <span class="label">Running</span>
                <span>${n?.running?"Yes":"No"}</span>
              </div>
              <div>
                <span class="label">Mode</span>
                <span>${n?.mode??"n/a"}</span>
              </div>
              <div>
                <span class="label">Last start</span>
                <span>${n?.lastStartAt?ee(n.lastStartAt):"n/a"}</span>
              </div>
              <div>
                <span class="label">Last probe</span>
                <span>${n?.lastProbeAt?ee(n.lastProbeAt):"n/a"}</span>
              </div>
            </div>
          `}

      ${n?.lastError?l`<div class="callout danger" style="margin-top: 12px;">
            ${n.lastError}
          </div>`:v}

      ${n?.probe?l`<div class="callout" style="margin-top: 12px;">
            Probe ${n.probe.ok?"ok":"failed"} ·
            ${n.probe.status??""} ${n.probe.error??""}
          </div>`:v}

      ${it({channelId:"telegram",props:t})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>t.onRefresh(!0)}>
          Probe
        </button>
      </div>
    </div>
  `}function Kh(e){const{props:t,whatsapp:n,accountCountLabel:s}=e;return l`
    <div class="card">
      <div class="card-title">WhatsApp</div>
      <div class="card-sub">Link WhatsApp Web and monitor connection health.</div>
      ${s}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">Configured</span>
          <span>${n?.configured?"Yes":"No"}</span>
        </div>
        <div>
          <span class="label">Linked</span>
          <span>${n?.linked?"Yes":"No"}</span>
        </div>
        <div>
          <span class="label">Running</span>
          <span>${n?.running?"Yes":"No"}</span>
        </div>
        <div>
          <span class="label">Connected</span>
          <span>${n?.connected?"Yes":"No"}</span>
        </div>
        <div>
          <span class="label">Last connect</span>
          <span>
            ${n?.lastConnectedAt?ee(n.lastConnectedAt):"n/a"}
          </span>
        </div>
        <div>
          <span class="label">Last message</span>
          <span>
            ${n?.lastMessageAt?ee(n.lastMessageAt):"n/a"}
          </span>
        </div>
        <div>
          <span class="label">Auth age</span>
          <span>
            ${n?.authAgeMs!=null?aa(n.authAgeMs):"n/a"}
          </span>
        </div>
      </div>

      ${n?.lastError?l`<div class="callout danger" style="margin-top: 12px;">
            ${n.lastError}
          </div>`:v}

      ${t.whatsappMessage?l`<div class="callout" style="margin-top: 12px;">
            ${t.whatsappMessage}
          </div>`:v}

      ${t.whatsappQrDataUrl?l`<div class="qr-wrap">
            <img src=${t.whatsappQrDataUrl} alt="WhatsApp QR" />
          </div>`:v}

      <div class="row" style="margin-top: 14px; flex-wrap: wrap;">
        <button
          class="btn primary"
          ?disabled=${t.whatsappBusy}
          @click=${()=>t.onWhatsAppStart(!1)}
        >
          ${t.whatsappBusy?"Working…":"Show QR"}
        </button>
        <button
          class="btn"
          ?disabled=${t.whatsappBusy}
          @click=${()=>t.onWhatsAppStart(!0)}
        >
          Relink
        </button>
        <button
          class="btn"
          ?disabled=${t.whatsappBusy}
          @click=${()=>t.onWhatsAppWait()}
        >
          Wait for scan
        </button>
        <button
          class="btn danger"
          ?disabled=${t.whatsappBusy}
          @click=${()=>t.onWhatsAppLogout()}
        >
          Logout
        </button>
        <button class="btn" @click=${()=>t.onRefresh(!0)}>
          Refresh
        </button>
      </div>

      ${it({channelId:"whatsapp",props:t})}
    </div>
  `}function Wh(e){const t=e.snapshot?.channels,n=t?.whatsapp??void 0,s=t?.telegram??void 0,i=t?.discord??null,a=t?.googlechat??null,o=t?.slack??null,r=t?.signal??null,c=t?.imessage??null,d=t?.nostr??null,p=qh(e.snapshot).map((h,u)=>({key:h,enabled:Bh(h,e),order:u})).toSorted((h,u)=>h.enabled!==u.enabled?h.enabled?-1:1:h.order-u.order);return l`
    <section class="grid grid-cols-2">
      ${p.map(h=>Vh(h.key,e,{whatsapp:n,telegram:s,discord:i,googlechat:a,slack:o,signal:r,imessage:c,nostr:d,channelAccounts:e.snapshot?.channelAccounts??null}))}
    </section>

    <section class="card" style="margin-top: 18px;">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">Channel health</div>
          <div class="card-sub">Channel status snapshots from the gateway.</div>
        </div>
        <div class="muted">${e.lastSuccessAt?ee(e.lastSuccessAt):"n/a"}</div>
      </div>
      ${e.lastError?l`<div class="callout danger" style="margin-top: 12px;">
            ${e.lastError}
          </div>`:v}
      <pre class="code-block" style="margin-top: 12px;">
${e.snapshot?JSON.stringify(e.snapshot,null,2):"No snapshot yet."}
      </pre>
    </section>
  `}function qh(e){return e?.channelMeta?.length?e.channelMeta.map(t=>t.id):e?.channelOrder?.length?e.channelOrder:["whatsapp","telegram","discord","googlechat","slack","signal","imessage","nostr"]}function Vh(e,t,n){const s=nc(e,n.channelAccounts);switch(e){case"whatsapp":return Kh({props:t,whatsapp:n.whatsapp,accountCountLabel:s});case"telegram":return jh({props:t,telegram:n.telegram,telegramAccounts:n.channelAccounts?.telegram??[],accountCountLabel:s});case"discord":return Dh({props:t,discord:n.discord,accountCountLabel:s});case"googlechat":return Fh({props:t,googleChat:n.googlechat,accountCountLabel:s});case"slack":return Hh({props:t,slack:n.slack,accountCountLabel:s});case"signal":return Uh({props:t,signal:n.signal,accountCountLabel:s});case"imessage":return Nh({props:t,imessage:n.imessage,accountCountLabel:s});case"nostr":{const i=n.channelAccounts?.nostr??[],a=i[0],o=a?.accountId??"default",r=a?.profile??null,c=t.nostrProfileAccountId===o?t.nostrProfileFormState:null,d=c?{onFieldChange:t.onNostrProfileFieldChange,onSave:t.onNostrProfileSave,onImport:t.onNostrProfileImport,onCancel:t.onNostrProfileCancel,onToggleAdvanced:t.onNostrProfileToggleAdvanced}:null;return Oh({props:t,nostr:n.nostr,nostrAccounts:i,accountCountLabel:s,profileFormState:c,profileFormCallbacks:d,onEditProfile:()=>t.onNostrProfileEdit(o,r)})}default:return Gh(e,t,n.channelAccounts??{})}}function Gh(e,t,n){const s=Yh(t.snapshot,e),i=t.snapshot?.channels?.[e],a=typeof i?.configured=="boolean"?i.configured:void 0,o=typeof i?.running=="boolean"?i.running:void 0,r=typeof i?.connected=="boolean"?i.connected:void 0,c=typeof i?.lastError=="string"?i.lastError:void 0,d=n[e]??[],g=nc(e,n);return l`
    <div class="card">
      <div class="card-title">${s}</div>
      <div class="card-sub">Channel status and configuration.</div>
      ${g}

      ${d.length>0?l`
            <div class="account-card-list">
              ${d.map(p=>ev(p))}
            </div>
          `:l`
            <div class="status-list" style="margin-top: 16px;">
              <div>
                <span class="label">Configured</span>
                <span>${a==null?"n/a":a?"Yes":"No"}</span>
              </div>
              <div>
                <span class="label">Running</span>
                <span>${o==null?"n/a":o?"Yes":"No"}</span>
              </div>
              <div>
                <span class="label">Connected</span>
                <span>${r==null?"n/a":r?"Yes":"No"}</span>
              </div>
            </div>
          `}

      ${c?l`<div class="callout danger" style="margin-top: 12px;">
            ${c}
          </div>`:v}

      ${it({channelId:e,props:t})}
    </div>
  `}function Qh(e){return e?.channelMeta?.length?Object.fromEntries(e.channelMeta.map(t=>[t.id,t])):{}}function Yh(e,t){return Qh(e)[t]?.label??e?.channelLabels?.[t]??t}const Zh=600*1e3;function sc(e){return e.lastInboundAt?Date.now()-e.lastInboundAt<Zh:!1}function Jh(e){return e.running?"Yes":sc(e)?"Active":"No"}function Xh(e){return e.connected===!0?"Yes":e.connected===!1?"No":sc(e)?"Active":"n/a"}function ev(e){const t=Jh(e),n=Xh(e);return l`
    <div class="account-card">
      <div class="account-card-header">
        <div class="account-card-title">${e.name||e.accountId}</div>
        <div class="account-card-id">${e.accountId}</div>
      </div>
      <div class="status-list account-card-status">
        <div>
          <span class="label">Running</span>
          <span>${t}</span>
        </div>
        <div>
          <span class="label">Configured</span>
          <span>${e.configured?"Yes":"No"}</span>
        </div>
        <div>
          <span class="label">Connected</span>
          <span>${n}</span>
        </div>
        <div>
          <span class="label">Last inbound</span>
          <span>${e.lastInboundAt?ee(e.lastInboundAt):"n/a"}</span>
        </div>
        ${e.lastError?l`
              <div class="account-card-error">
                ${e.lastError}
              </div>
            `:v}
      </div>
    </div>
  `}const Sn=(e,t)=>{const n=e._$AN;if(n===void 0)return!1;for(const s of n)s._$AO?.(t,!1),Sn(s,t);return!0},ms=e=>{let t,n;do{if((t=e._$AM)===void 0)break;n=t._$AN,n.delete(e),e=t}while(n?.size===0)},ic=e=>{for(let t;t=e._$AM;e=t){let n=t._$AN;if(n===void 0)t._$AN=n=new Set;else if(n.has(e))break;n.add(e),sv(t)}};function tv(e){this._$AN!==void 0?(ms(this),this._$AM=e,ic(this)):this._$AM=e}function nv(e,t=!1,n=0){const s=this._$AH,i=this._$AN;if(i!==void 0&&i.size!==0)if(t)if(Array.isArray(s))for(let a=n;a<s.length;a++)Sn(s[a],!1),ms(s[a]);else s!=null&&(Sn(s,!1),ms(s));else Sn(this,e)}const sv=e=>{e.type==$a.CHILD&&(e._$AP??=nv,e._$AQ??=tv)};class iv extends ka{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,n,s){super._$AT(t,n,s),ic(this),this.isConnected=t._$AU}_$AO(t,n=!0){t!==this.isConnected&&(this.isConnected=t,t?this.reconnected?.():this.disconnected?.()),n&&(Sn(this,t),ms(this))}setValue(t){if(gf(this._$Ct))this._$Ct._$AI(t,this);else{const n=[...this._$Ct._$AH];n[this._$Ci]=t,this._$Ct._$AI(n,this,0)}}disconnected(){}reconnected(){}}const ui=new WeakMap,av=wa(class extends iv{render(e){return v}update(e,[t]){const n=t!==this.G;return n&&this.G!==void 0&&this.rt(void 0),(n||this.lt!==this.ct)&&(this.G=t,this.ht=e.options?.host,this.rt(this.ct=e.element)),v}rt(e){if(this.isConnected||(e=void 0),typeof this.G=="function"){const t=this.ht??globalThis;let n=ui.get(t);n===void 0&&(n=new WeakMap,ui.set(t,n)),n.get(this.G)!==void 0&&this.G.call(this.ht,void 0),n.set(this.G,e),e!==void 0&&this.G.call(this.ht,e)}else this.G.value=e}get lt(){return typeof this.G=="function"?ui.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}});class Ri extends ka{constructor(t){if(super(t),this.it=v,t.type!==$a.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===v||t==null)return this._t=void 0,this.it=t;if(t===vt)return t;if(typeof t!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.it)return this._t;this.it=t;const n=[t];return n.raw=n,this._t={_$litType$:this.constructor.resultType,strings:n,values:[]}}}Ri.directiveName="unsafeHTML",Ri.resultType=1;const Pi=wa(Ri);const{entries:ac,setPrototypeOf:tr,isFrozen:ov,getPrototypeOf:rv,getOwnPropertyDescriptor:lv}=Object;let{freeze:ke,seal:Pe,create:Di}=Object,{apply:Fi,construct:Ni}=typeof Reflect<"u"&&Reflect;ke||(ke=function(t){return t});Pe||(Pe=function(t){return t});Fi||(Fi=function(t,n){for(var s=arguments.length,i=new Array(s>2?s-2:0),a=2;a<s;a++)i[a-2]=arguments[a];return t.apply(n,i)});Ni||(Ni=function(t){for(var n=arguments.length,s=new Array(n>1?n-1:0),i=1;i<n;i++)s[i-1]=arguments[i];return new t(...s)});const Qn=Se(Array.prototype.forEach),cv=Se(Array.prototype.lastIndexOf),nr=Se(Array.prototype.pop),dn=Se(Array.prototype.push),dv=Se(Array.prototype.splice),rs=Se(String.prototype.toLowerCase),gi=Se(String.prototype.toString),pi=Se(String.prototype.match),un=Se(String.prototype.replace),uv=Se(String.prototype.indexOf),gv=Se(String.prototype.trim),De=Se(Object.prototype.hasOwnProperty),$e=Se(RegExp.prototype.test),gn=pv(TypeError);function Se(e){return function(t){t instanceof RegExp&&(t.lastIndex=0);for(var n=arguments.length,s=new Array(n>1?n-1:0),i=1;i<n;i++)s[i-1]=arguments[i];return Fi(e,t,s)}}function pv(e){return function(){for(var t=arguments.length,n=new Array(t),s=0;s<t;s++)n[s]=arguments[s];return Ni(e,n)}}function W(e,t){let n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:rs;tr&&tr(e,null);let s=t.length;for(;s--;){let i=t[s];if(typeof i=="string"){const a=n(i);a!==i&&(ov(t)||(t[s]=a),i=a)}e[i]=!0}return e}function fv(e){for(let t=0;t<e.length;t++)De(e,t)||(e[t]=null);return e}function Ke(e){const t=Di(null);for(const[n,s]of ac(e))De(e,n)&&(Array.isArray(s)?t[n]=fv(s):s&&typeof s=="object"&&s.constructor===Object?t[n]=Ke(s):t[n]=s);return t}function pn(e,t){for(;e!==null;){const s=lv(e,t);if(s){if(s.get)return Se(s.get);if(typeof s.value=="function")return Se(s.value)}e=rv(e)}function n(){return null}return n}const sr=ke(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),fi=ke(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),hi=ke(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),hv=ke(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),vi=ke(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),vv=ke(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),ir=ke(["#text"]),ar=ke(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns","slot"]),mi=ke(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),or=ke(["accent","accentunder","align","bevelled","close","columnsalign","columnlines","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lspace","lquote","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),Yn=ke(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),mv=Pe(/\{\{[\w\W]*|[\w\W]*\}\}/gm),bv=Pe(/<%[\w\W]*|[\w\W]*%>/gm),yv=Pe(/\$\{[\w\W]*/gm),xv=Pe(/^data-[\-\w.\u00B7-\uFFFF]+$/),$v=Pe(/^aria-[\-\w]+$/),oc=Pe(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),wv=Pe(/^(?:\w+script|data):/i),kv=Pe(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),rc=Pe(/^html$/i),Sv=Pe(/^[a-z][.\w]*(-[.\w]+)+$/i);var rr=Object.freeze({__proto__:null,ARIA_ATTR:$v,ATTR_WHITESPACE:kv,CUSTOM_ELEMENT:Sv,DATA_ATTR:xv,DOCTYPE_NAME:rc,ERB_EXPR:bv,IS_ALLOWED_URI:oc,IS_SCRIPT_OR_DATA:wv,MUSTACHE_EXPR:mv,TMPLIT_EXPR:yv});const fn={element:1,text:3,progressingInstruction:7,comment:8,document:9},Av=function(){return typeof window>"u"?null:window},Cv=function(t,n){if(typeof t!="object"||typeof t.createPolicy!="function")return null;let s=null;const i="data-tt-policy-suffix";n&&n.hasAttribute(i)&&(s=n.getAttribute(i));const a="dompurify"+(s?"#"+s:"");try{return t.createPolicy(a,{createHTML(o){return o},createScriptURL(o){return o}})}catch{return console.warn("TrustedTypes policy "+a+" could not be created."),null}},lr=function(){return{afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}};function lc(){let e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:Av();const t=z=>lc(z);if(t.version="3.3.1",t.removed=[],!e||!e.document||e.document.nodeType!==fn.document||!e.Element)return t.isSupported=!1,t;let{document:n}=e;const s=n,i=s.currentScript,{DocumentFragment:a,HTMLTemplateElement:o,Node:r,Element:c,NodeFilter:d,NamedNodeMap:g=e.NamedNodeMap||e.MozNamedAttrMap,HTMLFormElement:p,DOMParser:h,trustedTypes:u}=e,f=c.prototype,m=pn(f,"cloneNode"),w=pn(f,"remove"),A=pn(f,"nextSibling"),C=pn(f,"childNodes"),k=pn(f,"parentNode");if(typeof o=="function"){const z=n.createElement("template");z.content&&z.content.ownerDocument&&(n=z.content.ownerDocument)}let S,E="";const{implementation:T,createNodeIterator:I,createDocumentFragment:H,getElementsByTagName:Z}=n,{importNode:te}=s;let R=lr();t.isSupported=typeof ac=="function"&&typeof k=="function"&&T&&T.createHTMLDocument!==void 0;const{MUSTACHE_EXPR:q,ERB_EXPR:ie,TMPLIT_EXPR:le,DATA_ATTR:_,ARIA_ATTR:j,IS_SCRIPT_OR_DATA:Q,ATTR_WHITESPACE:ce,CUSTOM_ELEMENT:he}=rr;let{IS_ALLOWED_URI:M}=rr,D=null;const F=W({},[...sr,...fi,...hi,...vi,...ir]);let K=null;const ue=W({},[...ar,...mi,...or,...Yn]);let J=Object.seal(Di(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),ae=null,V=null;const U=Object.seal(Di(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let oe=!0,de=!0,ve=!1,_e=!0,Ve=!1,at=!0,me=!1,ze=!1,Ge=!1,Qe=!1,Ye=!1,ot=!1,rt=!0,$t=!1;const Bs="user-content-";let Kt=!0,lt=!1,Ue={},Ae=null;const on=W({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","style","svg","template","thead","title","video","xmp"]);let Wt=null;const ct=W({},["audio","video","img","source","image","track"]);let zs=null;const Ua=W({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),Nn="http://www.w3.org/1998/Math/MathML",On="http://www.w3.org/2000/svg",Ze="http://www.w3.org/1999/xhtml";let qt=Ze,Us=!1,Hs=null;const Ic=W({},[Nn,On,Ze],gi);let Bn=W({},["mi","mo","mn","ms","mtext"]),zn=W({},["annotation-xml"]);const Rc=W({},["title","style","font","a","script"]);let rn=null;const Pc=["application/xhtml+xml","text/html"],Dc="text/html";let pe=null,Vt=null;const Fc=n.createElement("form"),Ha=function(b){return b instanceof RegExp||b instanceof Function},js=function(){let b=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};if(!(Vt&&Vt===b)){if((!b||typeof b!="object")&&(b={}),b=Ke(b),rn=Pc.indexOf(b.PARSER_MEDIA_TYPE)===-1?Dc:b.PARSER_MEDIA_TYPE,pe=rn==="application/xhtml+xml"?gi:rs,D=De(b,"ALLOWED_TAGS")?W({},b.ALLOWED_TAGS,pe):F,K=De(b,"ALLOWED_ATTR")?W({},b.ALLOWED_ATTR,pe):ue,Hs=De(b,"ALLOWED_NAMESPACES")?W({},b.ALLOWED_NAMESPACES,gi):Ic,zs=De(b,"ADD_URI_SAFE_ATTR")?W(Ke(Ua),b.ADD_URI_SAFE_ATTR,pe):Ua,Wt=De(b,"ADD_DATA_URI_TAGS")?W(Ke(ct),b.ADD_DATA_URI_TAGS,pe):ct,Ae=De(b,"FORBID_CONTENTS")?W({},b.FORBID_CONTENTS,pe):on,ae=De(b,"FORBID_TAGS")?W({},b.FORBID_TAGS,pe):Ke({}),V=De(b,"FORBID_ATTR")?W({},b.FORBID_ATTR,pe):Ke({}),Ue=De(b,"USE_PROFILES")?b.USE_PROFILES:!1,oe=b.ALLOW_ARIA_ATTR!==!1,de=b.ALLOW_DATA_ATTR!==!1,ve=b.ALLOW_UNKNOWN_PROTOCOLS||!1,_e=b.ALLOW_SELF_CLOSE_IN_ATTR!==!1,Ve=b.SAFE_FOR_TEMPLATES||!1,at=b.SAFE_FOR_XML!==!1,me=b.WHOLE_DOCUMENT||!1,Qe=b.RETURN_DOM||!1,Ye=b.RETURN_DOM_FRAGMENT||!1,ot=b.RETURN_TRUSTED_TYPE||!1,Ge=b.FORCE_BODY||!1,rt=b.SANITIZE_DOM!==!1,$t=b.SANITIZE_NAMED_PROPS||!1,Kt=b.KEEP_CONTENT!==!1,lt=b.IN_PLACE||!1,M=b.ALLOWED_URI_REGEXP||oc,qt=b.NAMESPACE||Ze,Bn=b.MATHML_TEXT_INTEGRATION_POINTS||Bn,zn=b.HTML_INTEGRATION_POINTS||zn,J=b.CUSTOM_ELEMENT_HANDLING||{},b.CUSTOM_ELEMENT_HANDLING&&Ha(b.CUSTOM_ELEMENT_HANDLING.tagNameCheck)&&(J.tagNameCheck=b.CUSTOM_ELEMENT_HANDLING.tagNameCheck),b.CUSTOM_ELEMENT_HANDLING&&Ha(b.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)&&(J.attributeNameCheck=b.CUSTOM_ELEMENT_HANDLING.attributeNameCheck),b.CUSTOM_ELEMENT_HANDLING&&typeof b.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements=="boolean"&&(J.allowCustomizedBuiltInElements=b.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements),Ve&&(de=!1),Ye&&(Qe=!0),Ue&&(D=W({},ir),K=[],Ue.html===!0&&(W(D,sr),W(K,ar)),Ue.svg===!0&&(W(D,fi),W(K,mi),W(K,Yn)),Ue.svgFilters===!0&&(W(D,hi),W(K,mi),W(K,Yn)),Ue.mathMl===!0&&(W(D,vi),W(K,or),W(K,Yn))),b.ADD_TAGS&&(typeof b.ADD_TAGS=="function"?U.tagCheck=b.ADD_TAGS:(D===F&&(D=Ke(D)),W(D,b.ADD_TAGS,pe))),b.ADD_ATTR&&(typeof b.ADD_ATTR=="function"?U.attributeCheck=b.ADD_ATTR:(K===ue&&(K=Ke(K)),W(K,b.ADD_ATTR,pe))),b.ADD_URI_SAFE_ATTR&&W(zs,b.ADD_URI_SAFE_ATTR,pe),b.FORBID_CONTENTS&&(Ae===on&&(Ae=Ke(Ae)),W(Ae,b.FORBID_CONTENTS,pe)),b.ADD_FORBID_CONTENTS&&(Ae===on&&(Ae=Ke(Ae)),W(Ae,b.ADD_FORBID_CONTENTS,pe)),Kt&&(D["#text"]=!0),me&&W(D,["html","head","body"]),D.table&&(W(D,["tbody"]),delete ae.tbody),b.TRUSTED_TYPES_POLICY){if(typeof b.TRUSTED_TYPES_POLICY.createHTML!="function")throw gn('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if(typeof b.TRUSTED_TYPES_POLICY.createScriptURL!="function")throw gn('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');S=b.TRUSTED_TYPES_POLICY,E=S.createHTML("")}else S===void 0&&(S=Cv(u,i)),S!==null&&typeof E=="string"&&(E=S.createHTML(""));ke&&ke(b),Vt=b}},ja=W({},[...fi,...hi,...hv]),Ka=W({},[...vi,...vv]),Nc=function(b){let L=k(b);(!L||!L.tagName)&&(L={namespaceURI:qt,tagName:"template"});const O=rs(b.tagName),re=rs(L.tagName);return Hs[b.namespaceURI]?b.namespaceURI===On?L.namespaceURI===Ze?O==="svg":L.namespaceURI===Nn?O==="svg"&&(re==="annotation-xml"||Bn[re]):!!ja[O]:b.namespaceURI===Nn?L.namespaceURI===Ze?O==="math":L.namespaceURI===On?O==="math"&&zn[re]:!!Ka[O]:b.namespaceURI===Ze?L.namespaceURI===On&&!zn[re]||L.namespaceURI===Nn&&!Bn[re]?!1:!Ka[O]&&(Rc[O]||!ja[O]):!!(rn==="application/xhtml+xml"&&Hs[b.namespaceURI]):!1},He=function(b){dn(t.removed,{element:b});try{k(b).removeChild(b)}catch{w(b)}},wt=function(b,L){try{dn(t.removed,{attribute:L.getAttributeNode(b),from:L})}catch{dn(t.removed,{attribute:null,from:L})}if(L.removeAttribute(b),b==="is")if(Qe||Ye)try{He(L)}catch{}else try{L.setAttribute(b,"")}catch{}},Wa=function(b){let L=null,O=null;if(Ge)b="<remove></remove>"+b;else{const ge=pi(b,/^[\r\n\t ]+/);O=ge&&ge[0]}rn==="application/xhtml+xml"&&qt===Ze&&(b='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+b+"</body></html>");const re=S?S.createHTML(b):b;if(qt===Ze)try{L=new h().parseFromString(re,rn)}catch{}if(!L||!L.documentElement){L=T.createDocument(qt,"template",null);try{L.documentElement.innerHTML=Us?E:re}catch{}}const ye=L.body||L.documentElement;return b&&O&&ye.insertBefore(n.createTextNode(O),ye.childNodes[0]||null),qt===Ze?Z.call(L,me?"html":"body")[0]:me?L.documentElement:ye},qa=function(b){return I.call(b.ownerDocument||b,b,d.SHOW_ELEMENT|d.SHOW_COMMENT|d.SHOW_TEXT|d.SHOW_PROCESSING_INSTRUCTION|d.SHOW_CDATA_SECTION,null)},Ks=function(b){return b instanceof p&&(typeof b.nodeName!="string"||typeof b.textContent!="string"||typeof b.removeChild!="function"||!(b.attributes instanceof g)||typeof b.removeAttribute!="function"||typeof b.setAttribute!="function"||typeof b.namespaceURI!="string"||typeof b.insertBefore!="function"||typeof b.hasChildNodes!="function")},Va=function(b){return typeof r=="function"&&b instanceof r};function Je(z,b,L){Qn(z,O=>{O.call(t,b,L,Vt)})}const Ga=function(b){let L=null;if(Je(R.beforeSanitizeElements,b,null),Ks(b))return He(b),!0;const O=pe(b.nodeName);if(Je(R.uponSanitizeElement,b,{tagName:O,allowedTags:D}),at&&b.hasChildNodes()&&!Va(b.firstElementChild)&&$e(/<[/\w!]/g,b.innerHTML)&&$e(/<[/\w!]/g,b.textContent)||b.nodeType===fn.progressingInstruction||at&&b.nodeType===fn.comment&&$e(/<[/\w]/g,b.data))return He(b),!0;if(!(U.tagCheck instanceof Function&&U.tagCheck(O))&&(!D[O]||ae[O])){if(!ae[O]&&Ya(O)&&(J.tagNameCheck instanceof RegExp&&$e(J.tagNameCheck,O)||J.tagNameCheck instanceof Function&&J.tagNameCheck(O)))return!1;if(Kt&&!Ae[O]){const re=k(b)||b.parentNode,ye=C(b)||b.childNodes;if(ye&&re){const ge=ye.length;for(let Ce=ge-1;Ce>=0;--Ce){const Xe=m(ye[Ce],!0);Xe.__removalCount=(b.__removalCount||0)+1,re.insertBefore(Xe,A(b))}}}return He(b),!0}return b instanceof c&&!Nc(b)||(O==="noscript"||O==="noembed"||O==="noframes")&&$e(/<\/no(script|embed|frames)/i,b.innerHTML)?(He(b),!0):(Ve&&b.nodeType===fn.text&&(L=b.textContent,Qn([q,ie,le],re=>{L=un(L,re," ")}),b.textContent!==L&&(dn(t.removed,{element:b.cloneNode()}),b.textContent=L)),Je(R.afterSanitizeElements,b,null),!1)},Qa=function(b,L,O){if(rt&&(L==="id"||L==="name")&&(O in n||O in Fc))return!1;if(!(de&&!V[L]&&$e(_,L))){if(!(oe&&$e(j,L))){if(!(U.attributeCheck instanceof Function&&U.attributeCheck(L,b))){if(!K[L]||V[L]){if(!(Ya(b)&&(J.tagNameCheck instanceof RegExp&&$e(J.tagNameCheck,b)||J.tagNameCheck instanceof Function&&J.tagNameCheck(b))&&(J.attributeNameCheck instanceof RegExp&&$e(J.attributeNameCheck,L)||J.attributeNameCheck instanceof Function&&J.attributeNameCheck(L,b))||L==="is"&&J.allowCustomizedBuiltInElements&&(J.tagNameCheck instanceof RegExp&&$e(J.tagNameCheck,O)||J.tagNameCheck instanceof Function&&J.tagNameCheck(O))))return!1}else if(!zs[L]){if(!$e(M,un(O,ce,""))){if(!((L==="src"||L==="xlink:href"||L==="href")&&b!=="script"&&uv(O,"data:")===0&&Wt[b])){if(!(ve&&!$e(Q,un(O,ce,"")))){if(O)return!1}}}}}}}return!0},Ya=function(b){return b!=="annotation-xml"&&pi(b,he)},Za=function(b){Je(R.beforeSanitizeAttributes,b,null);const{attributes:L}=b;if(!L||Ks(b))return;const O={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:K,forceKeepAttr:void 0};let re=L.length;for(;re--;){const ye=L[re],{name:ge,namespaceURI:Ce,value:Xe}=ye,Gt=pe(ge),Ws=Xe;let be=ge==="value"?Ws:gv(Ws);if(O.attrName=Gt,O.attrValue=be,O.keepAttr=!0,O.forceKeepAttr=void 0,Je(R.uponSanitizeAttribute,b,O),be=O.attrValue,$t&&(Gt==="id"||Gt==="name")&&(wt(ge,b),be=Bs+be),at&&$e(/((--!?|])>)|<\/(style|title|textarea)/i,be)){wt(ge,b);continue}if(Gt==="attributename"&&pi(be,"href")){wt(ge,b);continue}if(O.forceKeepAttr)continue;if(!O.keepAttr){wt(ge,b);continue}if(!_e&&$e(/\/>/i,be)){wt(ge,b);continue}Ve&&Qn([q,ie,le],Xa=>{be=un(be,Xa," ")});const Ja=pe(b.nodeName);if(!Qa(Ja,Gt,be)){wt(ge,b);continue}if(S&&typeof u=="object"&&typeof u.getAttributeType=="function"&&!Ce)switch(u.getAttributeType(Ja,Gt)){case"TrustedHTML":{be=S.createHTML(be);break}case"TrustedScriptURL":{be=S.createScriptURL(be);break}}if(be!==Ws)try{Ce?b.setAttributeNS(Ce,ge,be):b.setAttribute(ge,be),Ks(b)?He(b):nr(t.removed)}catch{wt(ge,b)}}Je(R.afterSanitizeAttributes,b,null)},Oc=function z(b){let L=null;const O=qa(b);for(Je(R.beforeSanitizeShadowDOM,b,null);L=O.nextNode();)Je(R.uponSanitizeShadowNode,L,null),Ga(L),Za(L),L.content instanceof a&&z(L.content);Je(R.afterSanitizeShadowDOM,b,null)};return t.sanitize=function(z){let b=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},L=null,O=null,re=null,ye=null;if(Us=!z,Us&&(z="<!-->"),typeof z!="string"&&!Va(z))if(typeof z.toString=="function"){if(z=z.toString(),typeof z!="string")throw gn("dirty is not a string, aborting")}else throw gn("toString is not a function");if(!t.isSupported)return z;if(ze||js(b),t.removed=[],typeof z=="string"&&(lt=!1),lt){if(z.nodeName){const Xe=pe(z.nodeName);if(!D[Xe]||ae[Xe])throw gn("root node is forbidden and cannot be sanitized in-place")}}else if(z instanceof r)L=Wa("<!---->"),O=L.ownerDocument.importNode(z,!0),O.nodeType===fn.element&&O.nodeName==="BODY"||O.nodeName==="HTML"?L=O:L.appendChild(O);else{if(!Qe&&!Ve&&!me&&z.indexOf("<")===-1)return S&&ot?S.createHTML(z):z;if(L=Wa(z),!L)return Qe?null:ot?E:""}L&&Ge&&He(L.firstChild);const ge=qa(lt?z:L);for(;re=ge.nextNode();)Ga(re),Za(re),re.content instanceof a&&Oc(re.content);if(lt)return z;if(Qe){if(Ye)for(ye=H.call(L.ownerDocument);L.firstChild;)ye.appendChild(L.firstChild);else ye=L;return(K.shadowroot||K.shadowrootmode)&&(ye=te.call(s,ye,!0)),ye}let Ce=me?L.outerHTML:L.innerHTML;return me&&D["!doctype"]&&L.ownerDocument&&L.ownerDocument.doctype&&L.ownerDocument.doctype.name&&$e(rc,L.ownerDocument.doctype.name)&&(Ce="<!DOCTYPE "+L.ownerDocument.doctype.name+`>
`+Ce),Ve&&Qn([q,ie,le],Xe=>{Ce=un(Ce,Xe," ")}),S&&ot?S.createHTML(Ce):Ce},t.setConfig=function(){let z=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};js(z),ze=!0},t.clearConfig=function(){Vt=null,ze=!1},t.isValidAttribute=function(z,b,L){Vt||js({});const O=pe(z),re=pe(b);return Qa(O,re,L)},t.addHook=function(z,b){typeof b=="function"&&dn(R[z],b)},t.removeHook=function(z,b){if(b!==void 0){const L=cv(R[z],b);return L===-1?void 0:dv(R[z],L,1)[0]}return nr(R[z])},t.removeHooks=function(z){R[z]=[]},t.removeAllHooks=function(){R=lr()},t}var Oi=lc();function Ca(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var jt=Ca();function cc(e){jt=e}var Rt={exec:()=>null};function G(e,t=""){let n=typeof e=="string"?e:e.source,s={replace:(i,a)=>{let o=typeof a=="string"?a:a.source;return o=o.replace(we.caret,"$1"),n=n.replace(i,o),s},getRegex:()=>new RegExp(n,t)};return s}var Tv=(()=>{try{return!!new RegExp("(?<=1)(?<!1)")}catch{return!1}})(),we={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] +\S/,listReplaceTask:/^\[[ xX]\] +/,listTaskCheckbox:/\[[ xX]\]/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,unescapeTest:/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:e=>new RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}#`),htmlBeginRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}<(?:[a-z].*>|!--)`,"i"),blockquoteBeginRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}>`)},_v=/^(?:[ \t]*(?:\n|$))+/,Ev=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,Lv=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,Fn=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,Mv=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,Ta=/ {0,3}(?:[*+-]|\d{1,9}[.)])/,dc=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,uc=G(dc).replace(/bull/g,Ta).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),Iv=G(dc).replace(/bull/g,Ta).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),_a=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,Rv=/^[^\n]+/,Ea=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,Pv=G(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",Ea).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),Dv=G(/^(bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,Ta).getRegex(),Ds="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",La=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Fv=G("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",La).replace("tag",Ds).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),gc=G(_a).replace("hr",Fn).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Ds).getRegex(),Nv=G(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",gc).getRegex(),Ma={blockquote:Nv,code:Ev,def:Pv,fences:Lv,heading:Mv,hr:Fn,html:Fv,lheading:uc,list:Dv,newline:_v,paragraph:gc,table:Rt,text:Rv},cr=G("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",Fn).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Ds).getRegex(),Ov={...Ma,lheading:Iv,table:cr,paragraph:G(_a).replace("hr",Fn).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",cr).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Ds).getRegex()},Bv={...Ma,html:G(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",La).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:Rt,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:G(_a).replace("hr",Fn).replace("heading",` *#{1,6} *[^
]`).replace("lheading",uc).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},zv=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,Uv=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,pc=/^( {2,}|\\)\n(?!\s*$)/,Hv=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,Fs=/[\p{P}\p{S}]/u,Ia=/[\s\p{P}\p{S}]/u,fc=/[^\s\p{P}\p{S}]/u,jv=G(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,Ia).getRegex(),hc=/(?!~)[\p{P}\p{S}]/u,Kv=/(?!~)[\s\p{P}\p{S}]/u,Wv=/(?:[^\s\p{P}\p{S}]|~)/u,vc=/(?![*_])[\p{P}\p{S}]/u,qv=/(?![*_])[\s\p{P}\p{S}]/u,Vv=/(?:[^\s\p{P}\p{S}]|[*_])/u,Gv=G(/link|precode-code|html/,"g").replace("link",/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-",Tv?"(?<!`)()":"(^^|[^`])").replace("code",/(?<b>`+)[^`]+\k<b>(?!`)/).replace("html",/<(?! )[^<>]*?>/).getRegex(),mc=/^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/,Qv=G(mc,"u").replace(/punct/g,Fs).getRegex(),Yv=G(mc,"u").replace(/punct/g,hc).getRegex(),bc="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",Zv=G(bc,"gu").replace(/notPunctSpace/g,fc).replace(/punctSpace/g,Ia).replace(/punct/g,Fs).getRegex(),Jv=G(bc,"gu").replace(/notPunctSpace/g,Wv).replace(/punctSpace/g,Kv).replace(/punct/g,hc).getRegex(),Xv=G("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,fc).replace(/punctSpace/g,Ia).replace(/punct/g,Fs).getRegex(),em=G(/^~~?(?:((?!~)punct)|[^\s~])/,"u").replace(/punct/g,vc).getRegex(),tm="^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)",nm=G(tm,"gu").replace(/notPunctSpace/g,Vv).replace(/punctSpace/g,qv).replace(/punct/g,vc).getRegex(),sm=G(/\\(punct)/,"gu").replace(/punct/g,Fs).getRegex(),im=G(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),am=G(La).replace("(?:-->|$)","-->").getRegex(),om=G("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",am).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),bs=/(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+[^`]*?`+(?!`)|[^\[\]\\`])*?/,rm=G(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label",bs).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),yc=G(/^!?\[(label)\]\[(ref)\]/).replace("label",bs).replace("ref",Ea).getRegex(),xc=G(/^!?\[(ref)\](?:\[\])?/).replace("ref",Ea).getRegex(),lm=G("reflink|nolink(?!\\()","g").replace("reflink",yc).replace("nolink",xc).getRegex(),dr=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,Ra={_backpedal:Rt,anyPunctuation:sm,autolink:im,blockSkip:Gv,br:pc,code:Uv,del:Rt,delLDelim:Rt,delRDelim:Rt,emStrongLDelim:Qv,emStrongRDelimAst:Zv,emStrongRDelimUnd:Xv,escape:zv,link:rm,nolink:xc,punctuation:jv,reflink:yc,reflinkSearch:lm,tag:om,text:Hv,url:Rt},cm={...Ra,link:G(/^!?\[(label)\]\((.*?)\)/).replace("label",bs).getRegex(),reflink:G(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",bs).getRegex()},Bi={...Ra,emStrongRDelimAst:Jv,emStrongLDelim:Yv,delLDelim:em,delRDelim:nm,url:G(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol",dr).replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:G(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol",dr).getRegex()},dm={...Bi,br:G(pc).replace("{2,}","*").getRegex(),text:G(Bi.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},Zn={normal:Ma,gfm:Ov,pedantic:Bv},hn={normal:Ra,gfm:Bi,breaks:dm,pedantic:cm},um={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},ur=e=>um[e];function We(e,t){if(t){if(we.escapeTest.test(e))return e.replace(we.escapeReplace,ur)}else if(we.escapeTestNoEncode.test(e))return e.replace(we.escapeReplaceNoEncode,ur);return e}function gr(e){try{e=encodeURI(e).replace(we.percentDecode,"%")}catch{return null}return e}function pr(e,t){let n=e.replace(we.findPipe,(a,o,r)=>{let c=!1,d=o;for(;--d>=0&&r[d]==="\\";)c=!c;return c?"|":" |"}),s=n.split(we.splitPipe),i=0;if(s[0].trim()||s.shift(),s.length>0&&!s.at(-1)?.trim()&&s.pop(),t)if(s.length>t)s.splice(t);else for(;s.length<t;)s.push("");for(;i<s.length;i++)s[i]=s[i].trim().replace(we.slashPipe,"|");return s}function vn(e,t,n){let s=e.length;if(s===0)return"";let i=0;for(;i<s&&e.charAt(s-i-1)===t;)i++;return e.slice(0,s-i)}function gm(e,t){if(e.indexOf(t[1])===-1)return-1;let n=0;for(let s=0;s<e.length;s++)if(e[s]==="\\")s++;else if(e[s]===t[0])n++;else if(e[s]===t[1]&&(n--,n<0))return s;return n>0?-2:-1}function pm(e,t=0){let n=t,s="";for(let i of e)if(i==="	"){let a=4-n%4;s+=" ".repeat(a),n+=a}else s+=i,n++;return s}function fr(e,t,n,s,i){let a=t.href,o=t.title||null,r=e[1].replace(i.other.outputLinkReplace,"$1");s.state.inLink=!0;let c={type:e[0].charAt(0)==="!"?"image":"link",raw:n,href:a,title:o,text:r,tokens:s.inlineTokens(r)};return s.state.inLink=!1,c}function fm(e,t,n){let s=e.match(n.other.indentCodeCompensation);if(s===null)return t;let i=s[1];return t.split(`
`).map(a=>{let o=a.match(n.other.beginningSpace);if(o===null)return a;let[r]=o;return r.length>=i.length?a.slice(i.length):a}).join(`
`)}var ys=class{options;rules;lexer;constructor(e){this.options=e||jt}space(e){let t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:"space",raw:t[0]}}code(e){let t=this.rules.block.code.exec(e);if(t){let n=t[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:t[0],codeBlockStyle:"indented",text:this.options.pedantic?n:vn(n,`
`)}}}fences(e){let t=this.rules.block.fences.exec(e);if(t){let n=t[0],s=fm(n,t[3]||"",this.rules);return{type:"code",raw:n,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):t[2],text:s}}}heading(e){let t=this.rules.block.heading.exec(e);if(t){let n=t[2].trim();if(this.rules.other.endingHash.test(n)){let s=vn(n,"#");(this.options.pedantic||!s||this.rules.other.endingSpaceChar.test(s))&&(n=s.trim())}return{type:"heading",raw:t[0],depth:t[1].length,text:n,tokens:this.lexer.inline(n)}}}hr(e){let t=this.rules.block.hr.exec(e);if(t)return{type:"hr",raw:vn(t[0],`
`)}}blockquote(e){let t=this.rules.block.blockquote.exec(e);if(t){let n=vn(t[0],`
`).split(`
`),s="",i="",a=[];for(;n.length>0;){let o=!1,r=[],c;for(c=0;c<n.length;c++)if(this.rules.other.blockquoteStart.test(n[c]))r.push(n[c]),o=!0;else if(!o)r.push(n[c]);else break;n=n.slice(c);let d=r.join(`
`),g=d.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");s=s?`${s}
${d}`:d,i=i?`${i}
${g}`:g;let p=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(g,a,!0),this.lexer.state.top=p,n.length===0)break;let h=a.at(-1);if(h?.type==="code")break;if(h?.type==="blockquote"){let u=h,f=u.raw+`
`+n.join(`
`),m=this.blockquote(f);a[a.length-1]=m,s=s.substring(0,s.length-u.raw.length)+m.raw,i=i.substring(0,i.length-u.text.length)+m.text;break}else if(h?.type==="list"){let u=h,f=u.raw+`
`+n.join(`
`),m=this.list(f);a[a.length-1]=m,s=s.substring(0,s.length-h.raw.length)+m.raw,i=i.substring(0,i.length-u.raw.length)+m.raw,n=f.substring(a.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:s,tokens:a,text:i}}}list(e){let t=this.rules.block.list.exec(e);if(t){let n=t[1].trim(),s=n.length>1,i={type:"list",raw:"",ordered:s,start:s?+n.slice(0,-1):"",loose:!1,items:[]};n=s?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=s?n:"[*+-]");let a=this.rules.other.listItemRegex(n),o=!1;for(;e;){let c=!1,d="",g="";if(!(t=a.exec(e))||this.rules.block.hr.test(e))break;d=t[0],e=e.substring(d.length);let p=pm(t[2].split(`
`,1)[0],t[1].length),h=e.split(`
`,1)[0],u=!p.trim(),f=0;if(this.options.pedantic?(f=2,g=p.trimStart()):u?f=t[1].length+1:(f=p.search(this.rules.other.nonSpaceChar),f=f>4?1:f,g=p.slice(f),f+=t[1].length),u&&this.rules.other.blankLine.test(h)&&(d+=h+`
`,e=e.substring(h.length+1),c=!0),!c){let m=this.rules.other.nextBulletRegex(f),w=this.rules.other.hrRegex(f),A=this.rules.other.fencesBeginRegex(f),C=this.rules.other.headingBeginRegex(f),k=this.rules.other.htmlBeginRegex(f),S=this.rules.other.blockquoteBeginRegex(f);for(;e;){let E=e.split(`
`,1)[0],T;if(h=E,this.options.pedantic?(h=h.replace(this.rules.other.listReplaceNesting,"  "),T=h):T=h.replace(this.rules.other.tabCharGlobal,"    "),A.test(h)||C.test(h)||k.test(h)||S.test(h)||m.test(h)||w.test(h))break;if(T.search(this.rules.other.nonSpaceChar)>=f||!h.trim())g+=`
`+T.slice(f);else{if(u||p.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||A.test(p)||C.test(p)||w.test(p))break;g+=`
`+h}u=!h.trim(),d+=E+`
`,e=e.substring(E.length+1),p=T.slice(f)}}i.loose||(o?i.loose=!0:this.rules.other.doubleBlankLine.test(d)&&(o=!0)),i.items.push({type:"list_item",raw:d,task:!!this.options.gfm&&this.rules.other.listIsTask.test(g),loose:!1,text:g,tokens:[]}),i.raw+=d}let r=i.items.at(-1);if(r)r.raw=r.raw.trimEnd(),r.text=r.text.trimEnd();else return;i.raw=i.raw.trimEnd();for(let c of i.items){if(this.lexer.state.top=!1,c.tokens=this.lexer.blockTokens(c.text,[]),c.task){if(c.text=c.text.replace(this.rules.other.listReplaceTask,""),c.tokens[0]?.type==="text"||c.tokens[0]?.type==="paragraph"){c.tokens[0].raw=c.tokens[0].raw.replace(this.rules.other.listReplaceTask,""),c.tokens[0].text=c.tokens[0].text.replace(this.rules.other.listReplaceTask,"");for(let g=this.lexer.inlineQueue.length-1;g>=0;g--)if(this.rules.other.listIsTask.test(this.lexer.inlineQueue[g].src)){this.lexer.inlineQueue[g].src=this.lexer.inlineQueue[g].src.replace(this.rules.other.listReplaceTask,"");break}}let d=this.rules.other.listTaskCheckbox.exec(c.raw);if(d){let g={type:"checkbox",raw:d[0]+" ",checked:d[0]!=="[ ]"};c.checked=g.checked,i.loose?c.tokens[0]&&["paragraph","text"].includes(c.tokens[0].type)&&"tokens"in c.tokens[0]&&c.tokens[0].tokens?(c.tokens[0].raw=g.raw+c.tokens[0].raw,c.tokens[0].text=g.raw+c.tokens[0].text,c.tokens[0].tokens.unshift(g)):c.tokens.unshift({type:"paragraph",raw:g.raw,text:g.raw,tokens:[g]}):c.tokens.unshift(g)}}if(!i.loose){let d=c.tokens.filter(p=>p.type==="space"),g=d.length>0&&d.some(p=>this.rules.other.anyLine.test(p.raw));i.loose=g}}if(i.loose)for(let c of i.items){c.loose=!0;for(let d of c.tokens)d.type==="text"&&(d.type="paragraph")}return i}}html(e){let t=this.rules.block.html.exec(e);if(t)return{type:"html",block:!0,raw:t[0],pre:t[1]==="pre"||t[1]==="script"||t[1]==="style",text:t[0]}}def(e){let t=this.rules.block.def.exec(e);if(t){let n=t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),s=t[2]?t[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",i=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):t[3];return{type:"def",tag:n,raw:t[0],href:s,title:i}}}table(e){let t=this.rules.block.table.exec(e);if(!t||!this.rules.other.tableDelimiter.test(t[2]))return;let n=pr(t[1]),s=t[2].replace(this.rules.other.tableAlignChars,"").split("|"),i=t[3]?.trim()?t[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],a={type:"table",raw:t[0],header:[],align:[],rows:[]};if(n.length===s.length){for(let o of s)this.rules.other.tableAlignRight.test(o)?a.align.push("right"):this.rules.other.tableAlignCenter.test(o)?a.align.push("center"):this.rules.other.tableAlignLeft.test(o)?a.align.push("left"):a.align.push(null);for(let o=0;o<n.length;o++)a.header.push({text:n[o],tokens:this.lexer.inline(n[o]),header:!0,align:a.align[o]});for(let o of i)a.rows.push(pr(o,a.header.length).map((r,c)=>({text:r,tokens:this.lexer.inline(r),header:!1,align:a.align[c]})));return a}}lheading(e){let t=this.rules.block.lheading.exec(e);if(t)return{type:"heading",raw:t[0],depth:t[2].charAt(0)==="="?1:2,text:t[1],tokens:this.lexer.inline(t[1])}}paragraph(e){let t=this.rules.block.paragraph.exec(e);if(t){let n=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:"paragraph",raw:t[0],text:n,tokens:this.lexer.inline(n)}}}text(e){let t=this.rules.block.text.exec(e);if(t)return{type:"text",raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){let t=this.rules.inline.escape.exec(e);if(t)return{type:"escape",raw:t[0],text:t[1]}}tag(e){let t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&this.rules.other.startATag.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){let t=this.rules.inline.link.exec(e);if(t){let n=t[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(n)){if(!this.rules.other.endAngleBracket.test(n))return;let a=vn(n.slice(0,-1),"\\");if((n.length-a.length)%2===0)return}else{let a=gm(t[2],"()");if(a===-2)return;if(a>-1){let o=(t[0].indexOf("!")===0?5:4)+t[1].length+a;t[2]=t[2].substring(0,a),t[0]=t[0].substring(0,o).trim(),t[3]=""}}let s=t[2],i="";if(this.options.pedantic){let a=this.rules.other.pedanticHrefTitle.exec(s);a&&(s=a[1],i=a[3])}else i=t[3]?t[3].slice(1,-1):"";return s=s.trim(),this.rules.other.startAngleBracket.test(s)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(n)?s=s.slice(1):s=s.slice(1,-1)),fr(t,{href:s&&s.replace(this.rules.inline.anyPunctuation,"$1"),title:i&&i.replace(this.rules.inline.anyPunctuation,"$1")},t[0],this.lexer,this.rules)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){let s=(n[2]||n[1]).replace(this.rules.other.multipleSpaceGlobal," "),i=t[s.toLowerCase()];if(!i){let a=n[0].charAt(0);return{type:"text",raw:a,text:a}}return fr(n,i,n[0],this.lexer,this.rules)}}emStrong(e,t,n=""){let s=this.rules.inline.emStrongLDelim.exec(e);if(!(!s||s[3]&&n.match(this.rules.other.unicodeAlphaNumeric))&&(!(s[1]||s[2])||!n||this.rules.inline.punctuation.exec(n))){let i=[...s[0]].length-1,a,o,r=i,c=0,d=s[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(d.lastIndex=0,t=t.slice(-1*e.length+i);(s=d.exec(t))!=null;){if(a=s[1]||s[2]||s[3]||s[4]||s[5]||s[6],!a)continue;if(o=[...a].length,s[3]||s[4]){r+=o;continue}else if((s[5]||s[6])&&i%3&&!((i+o)%3)){c+=o;continue}if(r-=o,r>0)continue;o=Math.min(o,o+r+c);let g=[...s[0]][0].length,p=e.slice(0,i+s.index+g+o);if(Math.min(i,o)%2){let u=p.slice(1,-1);return{type:"em",raw:p,text:u,tokens:this.lexer.inlineTokens(u)}}let h=p.slice(2,-2);return{type:"strong",raw:p,text:h,tokens:this.lexer.inlineTokens(h)}}}}codespan(e){let t=this.rules.inline.code.exec(e);if(t){let n=t[2].replace(this.rules.other.newLineCharGlobal," "),s=this.rules.other.nonSpaceChar.test(n),i=this.rules.other.startingSpaceChar.test(n)&&this.rules.other.endingSpaceChar.test(n);return s&&i&&(n=n.substring(1,n.length-1)),{type:"codespan",raw:t[0],text:n}}}br(e){let t=this.rules.inline.br.exec(e);if(t)return{type:"br",raw:t[0]}}del(e,t,n=""){let s=this.rules.inline.delLDelim.exec(e);if(s&&(!s[1]||!n||this.rules.inline.punctuation.exec(n))){let i=[...s[0]].length-1,a,o,r=i,c=this.rules.inline.delRDelim;for(c.lastIndex=0,t=t.slice(-1*e.length+i);(s=c.exec(t))!=null;){if(a=s[1]||s[2]||s[3]||s[4]||s[5]||s[6],!a||(o=[...a].length,o!==i))continue;if(s[3]||s[4]){r+=o;continue}if(r-=o,r>0)continue;o=Math.min(o,o+r);let d=[...s[0]][0].length,g=e.slice(0,i+s.index+d+o),p=g.slice(i,-i);return{type:"del",raw:g,text:p,tokens:this.lexer.inlineTokens(p)}}}}autolink(e){let t=this.rules.inline.autolink.exec(e);if(t){let n,s;return t[2]==="@"?(n=t[1],s="mailto:"+n):(n=t[1],s=n),{type:"link",raw:t[0],text:n,href:s,tokens:[{type:"text",raw:n,text:n}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let n,s;if(t[2]==="@")n=t[0],s="mailto:"+n;else{let i;do i=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??"";while(i!==t[0]);n=t[0],t[1]==="www."?s="http://"+t[0]:s=t[0]}return{type:"link",raw:t[0],text:n,href:s,tokens:[{type:"text",raw:n,text:n}]}}}inlineText(e){let t=this.rules.inline.text.exec(e);if(t){let n=this.lexer.state.inRawBlock;return{type:"text",raw:t[0],text:t[0],escaped:n}}}},Fe=class zi{tokens;options;state;inlineQueue;tokenizer;constructor(t){this.tokens=[],this.tokens.links=Object.create(null),this.options=t||jt,this.options.tokenizer=this.options.tokenizer||new ys,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let n={other:we,block:Zn.normal,inline:hn.normal};this.options.pedantic?(n.block=Zn.pedantic,n.inline=hn.pedantic):this.options.gfm&&(n.block=Zn.gfm,this.options.breaks?n.inline=hn.breaks:n.inline=hn.gfm),this.tokenizer.rules=n}static get rules(){return{block:Zn,inline:hn}}static lex(t,n){return new zi(n).lex(t)}static lexInline(t,n){return new zi(n).inlineTokens(t)}lex(t){t=t.replace(we.carriageReturn,`
`),this.blockTokens(t,this.tokens);for(let n=0;n<this.inlineQueue.length;n++){let s=this.inlineQueue[n];this.inlineTokens(s.src,s.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(t,n=[],s=!1){for(this.options.pedantic&&(t=t.replace(we.tabCharGlobal,"    ").replace(we.spaceLine,""));t;){let i;if(this.options.extensions?.block?.some(o=>(i=o.call({lexer:this},t,n))?(t=t.substring(i.raw.length),n.push(i),!0):!1))continue;if(i=this.tokenizer.space(t)){t=t.substring(i.raw.length);let o=n.at(-1);i.raw.length===1&&o!==void 0?o.raw+=`
`:n.push(i);continue}if(i=this.tokenizer.code(t)){t=t.substring(i.raw.length);let o=n.at(-1);o?.type==="paragraph"||o?.type==="text"?(o.raw+=(o.raw.endsWith(`
`)?"":`
`)+i.raw,o.text+=`
`+i.text,this.inlineQueue.at(-1).src=o.text):n.push(i);continue}if(i=this.tokenizer.fences(t)){t=t.substring(i.raw.length),n.push(i);continue}if(i=this.tokenizer.heading(t)){t=t.substring(i.raw.length),n.push(i);continue}if(i=this.tokenizer.hr(t)){t=t.substring(i.raw.length),n.push(i);continue}if(i=this.tokenizer.blockquote(t)){t=t.substring(i.raw.length),n.push(i);continue}if(i=this.tokenizer.list(t)){t=t.substring(i.raw.length),n.push(i);continue}if(i=this.tokenizer.html(t)){t=t.substring(i.raw.length),n.push(i);continue}if(i=this.tokenizer.def(t)){t=t.substring(i.raw.length);let o=n.at(-1);o?.type==="paragraph"||o?.type==="text"?(o.raw+=(o.raw.endsWith(`
`)?"":`
`)+i.raw,o.text+=`
`+i.raw,this.inlineQueue.at(-1).src=o.text):this.tokens.links[i.tag]||(this.tokens.links[i.tag]={href:i.href,title:i.title},n.push(i));continue}if(i=this.tokenizer.table(t)){t=t.substring(i.raw.length),n.push(i);continue}if(i=this.tokenizer.lheading(t)){t=t.substring(i.raw.length),n.push(i);continue}let a=t;if(this.options.extensions?.startBlock){let o=1/0,r=t.slice(1),c;this.options.extensions.startBlock.forEach(d=>{c=d.call({lexer:this},r),typeof c=="number"&&c>=0&&(o=Math.min(o,c))}),o<1/0&&o>=0&&(a=t.substring(0,o+1))}if(this.state.top&&(i=this.tokenizer.paragraph(a))){let o=n.at(-1);s&&o?.type==="paragraph"?(o.raw+=(o.raw.endsWith(`
`)?"":`
`)+i.raw,o.text+=`
`+i.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=o.text):n.push(i),s=a.length!==t.length,t=t.substring(i.raw.length);continue}if(i=this.tokenizer.text(t)){t=t.substring(i.raw.length);let o=n.at(-1);o?.type==="text"?(o.raw+=(o.raw.endsWith(`
`)?"":`
`)+i.raw,o.text+=`
`+i.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=o.text):n.push(i);continue}if(t){let o="Infinite loop on byte: "+t.charCodeAt(0);if(this.options.silent){console.error(o);break}else throw new Error(o)}}return this.state.top=!0,n}inline(t,n=[]){return this.inlineQueue.push({src:t,tokens:n}),n}inlineTokens(t,n=[]){let s=t,i=null;if(this.tokens.links){let c=Object.keys(this.tokens.links);if(c.length>0)for(;(i=this.tokenizer.rules.inline.reflinkSearch.exec(s))!=null;)c.includes(i[0].slice(i[0].lastIndexOf("[")+1,-1))&&(s=s.slice(0,i.index)+"["+"a".repeat(i[0].length-2)+"]"+s.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(i=this.tokenizer.rules.inline.anyPunctuation.exec(s))!=null;)s=s.slice(0,i.index)+"++"+s.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);let a;for(;(i=this.tokenizer.rules.inline.blockSkip.exec(s))!=null;)a=i[2]?i[2].length:0,s=s.slice(0,i.index+a)+"["+"a".repeat(i[0].length-a-2)+"]"+s.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);s=this.options.hooks?.emStrongMask?.call({lexer:this},s)??s;let o=!1,r="";for(;t;){o||(r=""),o=!1;let c;if(this.options.extensions?.inline?.some(g=>(c=g.call({lexer:this},t,n))?(t=t.substring(c.raw.length),n.push(c),!0):!1))continue;if(c=this.tokenizer.escape(t)){t=t.substring(c.raw.length),n.push(c);continue}if(c=this.tokenizer.tag(t)){t=t.substring(c.raw.length),n.push(c);continue}if(c=this.tokenizer.link(t)){t=t.substring(c.raw.length),n.push(c);continue}if(c=this.tokenizer.reflink(t,this.tokens.links)){t=t.substring(c.raw.length);let g=n.at(-1);c.type==="text"&&g?.type==="text"?(g.raw+=c.raw,g.text+=c.text):n.push(c);continue}if(c=this.tokenizer.emStrong(t,s,r)){t=t.substring(c.raw.length),n.push(c);continue}if(c=this.tokenizer.codespan(t)){t=t.substring(c.raw.length),n.push(c);continue}if(c=this.tokenizer.br(t)){t=t.substring(c.raw.length),n.push(c);continue}if(c=this.tokenizer.del(t,s,r)){t=t.substring(c.raw.length),n.push(c);continue}if(c=this.tokenizer.autolink(t)){t=t.substring(c.raw.length),n.push(c);continue}if(!this.state.inLink&&(c=this.tokenizer.url(t))){t=t.substring(c.raw.length),n.push(c);continue}let d=t;if(this.options.extensions?.startInline){let g=1/0,p=t.slice(1),h;this.options.extensions.startInline.forEach(u=>{h=u.call({lexer:this},p),typeof h=="number"&&h>=0&&(g=Math.min(g,h))}),g<1/0&&g>=0&&(d=t.substring(0,g+1))}if(c=this.tokenizer.inlineText(d)){t=t.substring(c.raw.length),c.raw.slice(-1)!=="_"&&(r=c.raw.slice(-1)),o=!0;let g=n.at(-1);g?.type==="text"?(g.raw+=c.raw,g.text+=c.text):n.push(c);continue}if(t){let g="Infinite loop on byte: "+t.charCodeAt(0);if(this.options.silent){console.error(g);break}else throw new Error(g)}}return n}},xs=class{options;parser;constructor(e){this.options=e||jt}space(e){return""}code({text:e,lang:t,escaped:n}){let s=(t||"").match(we.notSpaceStart)?.[0],i=e.replace(we.endingNewline,"")+`
`;return s?'<pre><code class="language-'+We(s)+'">'+(n?i:We(i,!0))+`</code></pre>
`:"<pre><code>"+(n?i:We(i,!0))+`</code></pre>
`}blockquote({tokens:e}){return`<blockquote>
${this.parser.parse(e)}</blockquote>
`}html({text:e}){return e}def(e){return""}heading({tokens:e,depth:t}){return`<h${t}>${this.parser.parseInline(e)}</h${t}>
`}hr(e){return`<hr>
`}list(e){let t=e.ordered,n=e.start,s="";for(let o=0;o<e.items.length;o++){let r=e.items[o];s+=this.listitem(r)}let i=t?"ol":"ul",a=t&&n!==1?' start="'+n+'"':"";return"<"+i+a+`>
`+s+"</"+i+`>
`}listitem(e){return`<li>${this.parser.parse(e.tokens)}</li>
`}checkbox({checked:e}){return"<input "+(e?'checked="" ':"")+'disabled="" type="checkbox"> '}paragraph({tokens:e}){return`<p>${this.parser.parseInline(e)}</p>
`}table(e){let t="",n="";for(let i=0;i<e.header.length;i++)n+=this.tablecell(e.header[i]);t+=this.tablerow({text:n});let s="";for(let i=0;i<e.rows.length;i++){let a=e.rows[i];n="";for(let o=0;o<a.length;o++)n+=this.tablecell(a[o]);s+=this.tablerow({text:n})}return s&&(s=`<tbody>${s}</tbody>`),`<table>
<thead>
`+t+`</thead>
`+s+`</table>
`}tablerow({text:e}){return`<tr>
${e}</tr>
`}tablecell(e){let t=this.parser.parseInline(e.tokens),n=e.header?"th":"td";return(e.align?`<${n} align="${e.align}">`:`<${n}>`)+t+`</${n}>
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${We(e,!0)}</code>`}br(e){return"<br>"}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,tokens:n}){let s=this.parser.parseInline(n),i=gr(e);if(i===null)return s;e=i;let a='<a href="'+e+'"';return t&&(a+=' title="'+We(t)+'"'),a+=">"+s+"</a>",a}image({href:e,title:t,text:n,tokens:s}){s&&(n=this.parser.parseInline(s,this.parser.textRenderer));let i=gr(e);if(i===null)return We(n);e=i;let a=`<img src="${e}" alt="${We(n)}"`;return t&&(a+=` title="${We(t)}"`),a+=">",a}text(e){return"tokens"in e&&e.tokens?this.parser.parseInline(e.tokens):"escaped"in e&&e.escaped?e.text:We(e.text)}},Pa=class{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return""+e}image({text:e}){return""+e}br(){return""}checkbox({raw:e}){return e}},Ne=class Ui{options;renderer;textRenderer;constructor(t){this.options=t||jt,this.options.renderer=this.options.renderer||new xs,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new Pa}static parse(t,n){return new Ui(n).parse(t)}static parseInline(t,n){return new Ui(n).parseInline(t)}parse(t){let n="";for(let s=0;s<t.length;s++){let i=t[s];if(this.options.extensions?.renderers?.[i.type]){let o=i,r=this.options.extensions.renderers[o.type].call({parser:this},o);if(r!==!1||!["space","hr","heading","code","table","blockquote","list","html","def","paragraph","text"].includes(o.type)){n+=r||"";continue}}let a=i;switch(a.type){case"space":{n+=this.renderer.space(a);break}case"hr":{n+=this.renderer.hr(a);break}case"heading":{n+=this.renderer.heading(a);break}case"code":{n+=this.renderer.code(a);break}case"table":{n+=this.renderer.table(a);break}case"blockquote":{n+=this.renderer.blockquote(a);break}case"list":{n+=this.renderer.list(a);break}case"checkbox":{n+=this.renderer.checkbox(a);break}case"html":{n+=this.renderer.html(a);break}case"def":{n+=this.renderer.def(a);break}case"paragraph":{n+=this.renderer.paragraph(a);break}case"text":{n+=this.renderer.text(a);break}default:{let o='Token with "'+a.type+'" type was not found.';if(this.options.silent)return console.error(o),"";throw new Error(o)}}}return n}parseInline(t,n=this.renderer){let s="";for(let i=0;i<t.length;i++){let a=t[i];if(this.options.extensions?.renderers?.[a.type]){let r=this.options.extensions.renderers[a.type].call({parser:this},a);if(r!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(a.type)){s+=r||"";continue}}let o=a;switch(o.type){case"escape":{s+=n.text(o);break}case"html":{s+=n.html(o);break}case"link":{s+=n.link(o);break}case"image":{s+=n.image(o);break}case"checkbox":{s+=n.checkbox(o);break}case"strong":{s+=n.strong(o);break}case"em":{s+=n.em(o);break}case"codespan":{s+=n.codespan(o);break}case"br":{s+=n.br(o);break}case"del":{s+=n.del(o);break}case"text":{s+=n.text(o);break}default:{let r='Token with "'+o.type+'" type was not found.';if(this.options.silent)return console.error(r),"";throw new Error(r)}}}return s}},bn=class{options;block;constructor(e){this.options=e||jt}static passThroughHooks=new Set(["preprocess","postprocess","processAllTokens","emStrongMask"]);static passThroughHooksRespectAsync=new Set(["preprocess","postprocess","processAllTokens"]);preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}emStrongMask(e){return e}provideLexer(){return this.block?Fe.lex:Fe.lexInline}provideParser(){return this.block?Ne.parse:Ne.parseInline}},hm=class{defaults=Ca();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=Ne;Renderer=xs;TextRenderer=Pa;Lexer=Fe;Tokenizer=ys;Hooks=bn;constructor(...e){this.use(...e)}walkTokens(e,t){let n=[];for(let s of e)switch(n=n.concat(t.call(this,s)),s.type){case"table":{let i=s;for(let a of i.header)n=n.concat(this.walkTokens(a.tokens,t));for(let a of i.rows)for(let o of a)n=n.concat(this.walkTokens(o.tokens,t));break}case"list":{let i=s;n=n.concat(this.walkTokens(i.items,t));break}default:{let i=s;this.defaults.extensions?.childTokens?.[i.type]?this.defaults.extensions.childTokens[i.type].forEach(a=>{let o=i[a].flat(1/0);n=n.concat(this.walkTokens(o,t))}):i.tokens&&(n=n.concat(this.walkTokens(i.tokens,t)))}}return n}use(...e){let t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(n=>{let s={...n};if(s.async=this.defaults.async||s.async||!1,n.extensions&&(n.extensions.forEach(i=>{if(!i.name)throw new Error("extension name required");if("renderer"in i){let a=t.renderers[i.name];a?t.renderers[i.name]=function(...o){let r=i.renderer.apply(this,o);return r===!1&&(r=a.apply(this,o)),r}:t.renderers[i.name]=i.renderer}if("tokenizer"in i){if(!i.level||i.level!=="block"&&i.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let a=t[i.level];a?a.unshift(i.tokenizer):t[i.level]=[i.tokenizer],i.start&&(i.level==="block"?t.startBlock?t.startBlock.push(i.start):t.startBlock=[i.start]:i.level==="inline"&&(t.startInline?t.startInline.push(i.start):t.startInline=[i.start]))}"childTokens"in i&&i.childTokens&&(t.childTokens[i.name]=i.childTokens)}),s.extensions=t),n.renderer){let i=this.defaults.renderer||new xs(this.defaults);for(let a in n.renderer){if(!(a in i))throw new Error(`renderer '${a}' does not exist`);if(["options","parser"].includes(a))continue;let o=a,r=n.renderer[o],c=i[o];i[o]=(...d)=>{let g=r.apply(i,d);return g===!1&&(g=c.apply(i,d)),g||""}}s.renderer=i}if(n.tokenizer){let i=this.defaults.tokenizer||new ys(this.defaults);for(let a in n.tokenizer){if(!(a in i))throw new Error(`tokenizer '${a}' does not exist`);if(["options","rules","lexer"].includes(a))continue;let o=a,r=n.tokenizer[o],c=i[o];i[o]=(...d)=>{let g=r.apply(i,d);return g===!1&&(g=c.apply(i,d)),g}}s.tokenizer=i}if(n.hooks){let i=this.defaults.hooks||new bn;for(let a in n.hooks){if(!(a in i))throw new Error(`hook '${a}' does not exist`);if(["options","block"].includes(a))continue;let o=a,r=n.hooks[o],c=i[o];bn.passThroughHooks.has(a)?i[o]=d=>{if(this.defaults.async&&bn.passThroughHooksRespectAsync.has(a))return(async()=>{let p=await r.call(i,d);return c.call(i,p)})();let g=r.call(i,d);return c.call(i,g)}:i[o]=(...d)=>{if(this.defaults.async)return(async()=>{let p=await r.apply(i,d);return p===!1&&(p=await c.apply(i,d)),p})();let g=r.apply(i,d);return g===!1&&(g=c.apply(i,d)),g}}s.hooks=i}if(n.walkTokens){let i=this.defaults.walkTokens,a=n.walkTokens;s.walkTokens=function(o){let r=[];return r.push(a.call(this,o)),i&&(r=r.concat(i.call(this,o))),r}}this.defaults={...this.defaults,...s}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return Fe.lex(e,t??this.defaults)}parser(e,t){return Ne.parse(e,t??this.defaults)}parseMarkdown(e){return(t,n)=>{let s={...n},i={...this.defaults,...s},a=this.onError(!!i.silent,!!i.async);if(this.defaults.async===!0&&s.async===!1)return a(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof t>"u"||t===null)return a(new Error("marked(): input parameter is undefined or null"));if(typeof t!="string")return a(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(t)+", string expected"));if(i.hooks&&(i.hooks.options=i,i.hooks.block=e),i.async)return(async()=>{let o=i.hooks?await i.hooks.preprocess(t):t,r=await(i.hooks?await i.hooks.provideLexer():e?Fe.lex:Fe.lexInline)(o,i),c=i.hooks?await i.hooks.processAllTokens(r):r;i.walkTokens&&await Promise.all(this.walkTokens(c,i.walkTokens));let d=await(i.hooks?await i.hooks.provideParser():e?Ne.parse:Ne.parseInline)(c,i);return i.hooks?await i.hooks.postprocess(d):d})().catch(a);try{i.hooks&&(t=i.hooks.preprocess(t));let o=(i.hooks?i.hooks.provideLexer():e?Fe.lex:Fe.lexInline)(t,i);i.hooks&&(o=i.hooks.processAllTokens(o)),i.walkTokens&&this.walkTokens(o,i.walkTokens);let r=(i.hooks?i.hooks.provideParser():e?Ne.parse:Ne.parseInline)(o,i);return i.hooks&&(r=i.hooks.postprocess(r)),r}catch(o){return a(o)}}}onError(e,t){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,e){let s="<p>An error occurred:</p><pre>"+We(n.message+"",!0)+"</pre>";return t?Promise.resolve(s):s}if(t)return Promise.reject(n);throw n}}},Ut=new hm;function Y(e,t){return Ut.parse(e,t)}Y.options=Y.setOptions=function(e){return Ut.setOptions(e),Y.defaults=Ut.defaults,cc(Y.defaults),Y};Y.getDefaults=Ca;Y.defaults=jt;Y.use=function(...e){return Ut.use(...e),Y.defaults=Ut.defaults,cc(Y.defaults),Y};Y.walkTokens=function(e,t){return Ut.walkTokens(e,t)};Y.parseInline=Ut.parseInline;Y.Parser=Ne;Y.parser=Ne.parse;Y.Renderer=xs;Y.TextRenderer=Pa;Y.Lexer=Fe;Y.lexer=Fe.lex;Y.Tokenizer=ys;Y.Hooks=bn;Y.parse=Y;Y.options;Y.setOptions;Y.use;Y.walkTokens;Y.parseInline;Ne.parse;Fe.lex;Y.setOptions({gfm:!0,breaks:!0});const vm=["a","b","blockquote","br","code","del","div","em","h1","h2","h3","h4","hr","i","iframe","li","ol","p","pre","span","strong","table","tbody","td","th","thead","tr","ul","img"],mm=["class","href","rel","target","title","start","src","alt","style","width","height","frameborder","sandbox","loading"],hr={ALLOWED_TAGS:vm,ALLOWED_ATTR:mm,ADD_DATA_URI_TAGS:["img"]};let vr=!1;const bm=14e4,ym=4e4,xm=200,bi=5e4,Dt=new Map;function $m(e){const t=Dt.get(e);return t===void 0?null:(Dt.delete(e),Dt.set(e,t),t)}function mr(e,t){if(Dt.set(e,t),Dt.size<=xm)return;const n=Dt.keys().next().value;n&&Dt.delete(n)}const Da="/__openclaw__/canvas/";function wm(){vr||(vr=!0,Oi.addHook("afterSanitizeAttributes",e=>{if(e instanceof HTMLAnchorElement){if(!e.getAttribute("href"))return;e.setAttribute("rel","noreferrer noopener"),e.setAttribute("target","_blank")}if(e instanceof HTMLIFrameElement){if(!(e.getAttribute("src")||"").startsWith(Da)){e.remove();return}e.setAttribute("sandbox","allow-scripts allow-same-origin"),e.setAttribute("loading","lazy"),e.classList.contains("canvas-embed")||e.classList.add("canvas-embed")}}))}function Hi(e){const t=e.trim();if(!t)return"";if(wm(),t.length<=bi){const o=$m(t);if(o!==null)return o}const n=el(t,bm),s=n.truncated?`

… truncated (${n.total} chars, showing first ${n.text.length}).`:"";if(n.text.length>ym){const r=`<pre class="code-block">${Oe(`${n.text}${s}`)}</pre>`,c=Oi.sanitize(r,hr);return t.length<=bi&&mr(t,c),c}const i=Y.parse(`${n.text}${s}`,{renderer:Ns}),a=Oi.sanitize(i,hr);return t.length<=bi&&mr(t,a),a}const Ns=new Y.Renderer;Ns.html=({text:e})=>e.match(/<iframe\s[^>]*src=["'](\/__openclaw__\/canvas\/[^"']+)["'][^>]*>/i)?e:Oe(e);Ns.code=({text:e,lang:t})=>{if(t&&t.toLowerCase()==="clawscript"){const s=encodeURIComponent(e),i=`${Da}chat-clawscript-editor.html?code=${s}`;return`<pre class="code-block"><code class="language-clawscript">${Oe(e)}</code></pre><div class="clawscript-embed-action"><a class="clawscript-open-editor" href="${Oe(i)}" target="_blank" rel="noreferrer noopener">▶ Open in ClawScript Editor</a></div>`}return`<pre class="code-block"><code${t?` class="language-${Oe(t)}"`:""}>${Oe(e)}</code></pre>`};Ns.image=({href:e,title:t,text:n})=>{if(e&&e.startsWith(Da)){const i=n||t||"Canvas Page";return`<div class="canvas-embed-wrapper"><iframe class="canvas-embed" src="${Oe(e)}" frameborder="0" loading="lazy" sandbox="allow-scripts allow-same-origin"></iframe><div class="canvas-embed-label">${Oe(i)}</div></div>`}const s=t?` title="${Oe(t)}"`:"";return`<img src="${Oe(e)}" alt="${Oe(n)}"${s} />`};function Oe(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}const km=new RegExp("\\p{Script=Hebrew}|\\p{Script=Arabic}|\\p{Script=Syriac}|\\p{Script=Thaana}|\\p{Script=Nko}|\\p{Script=Samaritan}|\\p{Script=Mandaic}|\\p{Script=Adlam}|\\p{Script=Phoenician}|\\p{Script=Lydian}","u");function $c(e,t=/[\s\p{P}\p{S}]/u){if(!e)return"ltr";for(const n of e)if(!t.test(n))return km.test(n)?"rtl":"ltr";return"ltr"}const Sm=1500,Am=2e3,wc="Copy as markdown",Cm="Copied",Tm="Copy failed";async function _m(e){if(!e)return!1;try{return await navigator.clipboard.writeText(e),!0}catch{return!1}}function Jn(e,t){e.title=t,e.setAttribute("aria-label",t)}function Em(e){const t=e.label??wc;return l`
    <button
      class="chat-copy-btn"
      type="button"
      title=${t}
      aria-label=${t}
      @click=${async n=>{const s=n.currentTarget;if(!s||s.dataset.copying==="1")return;s.dataset.copying="1",s.setAttribute("aria-busy","true"),s.disabled=!0;const i=await _m(e.text());if(s.isConnected){if(delete s.dataset.copying,s.removeAttribute("aria-busy"),s.disabled=!1,!i){s.dataset.error="1",Jn(s,Tm),window.setTimeout(()=>{s.isConnected&&(delete s.dataset.error,Jn(s,t))},Am);return}s.dataset.copied="1",Jn(s,Cm),window.setTimeout(()=>{s.isConnected&&(delete s.dataset.copied,Jn(s,t))},Sm)}}}
    >
      <span class="chat-copy-btn__icon" aria-hidden="true">
        <span class="chat-copy-btn__icon-copy">${se.copy}</span>
        <span class="chat-copy-btn__icon-check">${se.check}</span>
      </span>
    </button>
  `}function Lm(e){return Em({text:()=>e,label:wc})}function kc(e){const t=e;let n=typeof t.role=="string"?t.role:"unknown";const s=typeof t.toolCallId=="string"||typeof t.tool_call_id=="string",i=t.content,a=Array.isArray(i)?i:null,o=Array.isArray(a)&&a.some(p=>{const h=p,u=(typeof h.type=="string"?h.type:"").toLowerCase();return u==="toolresult"||u==="tool_result"}),r=typeof t.toolName=="string"||typeof t.tool_name=="string";(s||o||r)&&(n="toolResult");let c=[];typeof t.content=="string"?c=[{type:"text",text:t.content}]:Array.isArray(t.content)?c=t.content.map(p=>({type:p.type||"text",text:p.text,name:p.name,args:p.args||p.arguments})):typeof t.text=="string"&&(c=[{type:"text",text:t.text}]);const d=typeof t.timestamp=="number"?t.timestamp:Date.now(),g=typeof t.id=="string"?t.id:void 0;return{role:n,content:c,timestamp:d,id:g}}function Fa(e){const t=e.toLowerCase();return e==="user"||e==="User"?e:e==="assistant"?"assistant":e==="system"?"system":t==="toolresult"||t==="tool_result"||t==="tool"||t==="function"?"tool":e}function Sc(e){const t=e,n=typeof t.role=="string"?t.role.toLowerCase():"";return n==="toolresult"||n==="tool_result"}function an(e){return e&&typeof e=="object"?e:void 0}function Mm(e){return(e??"tool").trim()}function Im(e){const t=e.replace(/_/g," ").trim();return t?t.split(/\s+/).map(n=>n.length<=2&&n.toUpperCase()===n?n:`${n.at(0)?.toUpperCase()??""}${n.slice(1)}`).join(" "):"Tool"}function Rm(e){const t=e?.trim();if(t)return t.replace(/_/g," ")}function Ac(e,t={}){const n=t.maxStringChars??160,s=t.maxArrayEntries??3;if(e!=null){if(typeof e=="string"){const i=e.trim();if(!i)return;const a=i.split(/\r?\n/)[0]?.trim()??"";return a?a.length>n?`${a.slice(0,Math.max(0,n-3))}…`:a:void 0}if(typeof e=="boolean")return!e&&!t.includeFalse?void 0:e?"true":"false";if(typeof e=="number")return Number.isFinite(e)?e===0&&!t.includeZero?void 0:String(e):t.includeNonFinite?String(e):void 0;if(Array.isArray(e)){const i=e.map(o=>Ac(o,t)).filter(o=>!!o);if(i.length===0)return;const a=i.slice(0,s).join(", ");return i.length>s?`${a}…`:a}}}function Pm(e,t){if(!e||typeof e!="object")return;let n=e;for(const s of t.split(".")){if(!s||!n||typeof n!="object")return;n=n[s]}return n}function Cc(e){const t=an(e);if(t)for(const n of[t.path,t.file_path,t.filePath]){if(typeof n!="string")continue;const s=n.trim();if(s)return s}}function Dm(e){const t=an(e);if(!t)return;const n=Cc(t);if(!n)return;const s=typeof t.offset=="number"&&Number.isFinite(t.offset)?Math.floor(t.offset):void 0,i=typeof t.limit=="number"&&Number.isFinite(t.limit)?Math.floor(t.limit):void 0,a=s!==void 0?Math.max(1,s):void 0,o=i!==void 0?Math.max(1,i):void 0;return a!==void 0&&o!==void 0?`${o===1?"line":"lines"} ${a}-${a+o-1} from ${n}`:a!==void 0?`from line ${a} in ${n}`:o!==void 0?`first ${o} ${o===1?"line":"lines"} of ${n}`:`from ${n}`}function Fm(e,t){const n=an(t);if(!n)return;const s=Cc(n)??(typeof n.url=="string"?n.url.trim():void 0);if(!s)return;if(e==="attach")return`from ${s}`;const i=e==="edit"?"in":"to",a=typeof n.content=="string"?n.content:typeof n.newText=="string"?n.newText:typeof n.new_string=="string"?n.new_string:void 0;return a&&a.length>0?`${i} ${s} (${a.length} chars)`:`${i} ${s}`}function Nm(e){const t=an(e);if(!t)return;const n=typeof t.query=="string"?t.query.trim():void 0,s=typeof t.count=="number"&&Number.isFinite(t.count)&&t.count>0?Math.floor(t.count):void 0;if(n)return s!==void 0?`for "${n}" (top ${s})`:`for "${n}"`}function Om(e){const t=an(e);if(!t)return;const n=typeof t.url=="string"?t.url.trim():void 0;if(!n)return;const s=typeof t.extractMode=="string"?t.extractMode.trim():void 0,i=typeof t.maxChars=="number"&&Number.isFinite(t.maxChars)&&t.maxChars>0?Math.floor(t.maxChars):void 0,a=[s?`mode ${s}`:void 0,i!==void 0?`max ${i} chars`:void 0].filter(o=>!!o).join(", ");return a?`from ${n} (${a})`:`from ${n}`}function Na(e){if(!e)return e;const t=e.trim();return t.length>=2&&(t.startsWith('"')&&t.endsWith('"')||t.startsWith("'")&&t.endsWith("'"))?t.slice(1,-1).trim():t}function yn(e,t=48){if(!e)return[];const n=[];let s="",i,a=!1;for(let o=0;o<e.length;o+=1){const r=e[o];if(a){s+=r,a=!1;continue}if(r==="\\"){a=!0;continue}if(i){r===i?i=void 0:s+=r;continue}if(r==='"'||r==="'"){i=r;continue}if(/\s/.test(r)){if(!s)continue;if(n.push(s),n.length>=t)return n;s="";continue}s+=r}return s&&n.push(s),n}function Oa(e){if(!e)return;const t=Na(e)??e;return(t.split(/[/]/).at(-1)??t).trim().toLowerCase()}function Tt(e,t){const n=new Set(t);for(let s=0;s<e.length;s+=1){const i=e[s];if(i){if(n.has(i)){const a=e[s+1];if(a&&!a.startsWith("-"))return a;continue}for(const a of t)if(a.startsWith("--")&&i.startsWith(`${a}=`))return i.slice(a.length+1)}}}function Yt(e,t=1,n=[]){const s=[],i=new Set(n);for(let a=t;a<e.length;a+=1){const o=e[a];if(o){if(o==="--"){for(let r=a+1;r<e.length;r+=1){const c=e[r];c&&s.push(c)}break}if(o.startsWith("--")){if(o.includes("="))continue;i.has(o)&&(a+=1);continue}if(o.startsWith("-")){i.has(o)&&(a+=1);continue}s.push(o)}}return s}function nt(e,t=1,n=[]){return Yt(e,t,n)[0]}function Xn(e){if(e.length===0)return e;let t=0;if(Oa(e[0])==="env"){for(t=1;t<e.length;){const n=e[t];if(!n)break;if(n.startsWith("-")){t+=1;continue}if(/^[A-Za-z_][A-Za-z0-9_]*=/.test(n)){t+=1;continue}break}return e.slice(t)}for(;t<e.length&&/^[A-Za-z_][A-Za-z0-9_]*=/.test(e[t]);)t+=1;return e.slice(t)}function Bm(e){const t=yn(e,10);if(t.length<3)return e;const n=Oa(t[0]);if(!(n==="bash"||n==="sh"||n==="zsh"||n==="fish"))return e;const s=t.findIndex((a,o)=>o>0&&(a==="-c"||a==="-lc"||a==="-ic"));if(s===-1)return e;const i=t.slice(s+1).join(" ").trim();return i?Na(i)??e:e}function Tc(e,t){let n,s=!1;for(let i=0;i<e.length;i+=1){const a=e[i];if(s){s=!1;continue}if(a==="\\"){s=!0;continue}if(n){a===n&&(n=void 0);continue}if(a==='"'||a==="'"){n=a;continue}if(t(a,i)===!1)return}}function zm(e){let t=-1;return Tc(e,(n,s)=>n===";"||(n==="&"||n==="|")&&e[s+1]===n?(t=s,!1):!0),t>=0?e.slice(0,t):e}function Um(e){const t=[];let n=0;return Tc(e,(s,i)=>(s==="|"&&e[i-1]!=="|"&&e[i+1]!=="|"&&(t.push(e.slice(n,i)),n=i+1),!0)),t.push(e.slice(n)),t.map(s=>s.trim()).filter(s=>s.length>0)}function Hm(e){let t=e.trim();for(let n=0;n<4;n+=1){const s=t.indexOf("&&"),i=t.indexOf(";"),a=t.indexOf(`
`),r=[{index:s,length:2},{index:i,length:1},{index:a,length:1}].filter(g=>g.index>=0).toSorted((g,p)=>g.index-p.index)[0],c=(r?t.slice(0,r.index):t).trim();if(!(c.startsWith("set ")||c.startsWith("export ")||c.startsWith("unset "))||(t=r?t.slice(r.index+r.length).trimStart():"",!t))break}return t.trim()}function es(e){if(e.length===0)return"run command";const t=Oa(e[0])??"command";if(t==="git"){const s=new Set(["-C","-c","--git-dir","--work-tree","--namespace","--config-env"]),i=Tt(e,["-C"]);let a;for(let r=1;r<e.length;r+=1){const c=e[r];if(c){if(c==="--"){a=nt(e,r+1);break}if(c.startsWith("--")){if(c.includes("="))continue;s.has(c)&&(r+=1);continue}if(c.startsWith("-")){s.has(c)&&(r+=1);continue}a=c;break}}const o={status:"check git status",diff:"check git diff",log:"view git history",show:"show git object",branch:"list git branches",checkout:"switch git branch",switch:"switch git branch",commit:"create git commit",pull:"pull git changes",push:"push git changes",fetch:"fetch git changes",merge:"merge git changes",rebase:"rebase git branch",add:"stage git changes",restore:"restore git files",reset:"reset git state",stash:"stash git changes"};return a&&o[a]?o[a]:!a||a.startsWith("/")||a.startsWith("~")||a.includes("/")?i?`run git command in ${i}`:"run git command":`run git ${a}`}if(t==="grep"||t==="rg"||t==="ripgrep"){const s=Yt(e,1,["-e","--regexp","-f","--file","-m","--max-count","-A","--after-context","-B","--before-context","-C","--context"]),i=Tt(e,["-e","--regexp"])??s[0],a=s.length>1?s.at(-1):void 0;return i?a?`search "${i}" in ${a}`:`search "${i}"`:"search text"}if(t==="find"){const s=e[1]&&!e[1].startsWith("-")?e[1]:".",i=Tt(e,["-name","-iname"]);return i?`find files named "${i}" in ${s}`:`find files in ${s}`}if(t==="ls"){const s=nt(e,1);return s?`list files in ${s}`:"list files"}if(t==="head"||t==="tail"){const s=Tt(e,["-n","--lines"])??e.slice(1).find(c=>/^-\d+$/.test(c))?.slice(1),i=Yt(e,1,["-n","--lines"]);let a=i.at(-1);a&&/^\d+$/.test(a)&&i.length===1&&(a=void 0);const o=t==="head"?"first":"last",r=s==="1"?"line":"lines";return s&&a?`show ${o} ${s} ${r} of ${a}`:s?`show ${o} ${s} ${r}`:a?`show ${a}`:`show ${t} output`}if(t==="cat"){const s=nt(e,1);return s?`show ${s}`:"show output"}if(t==="sed"){const s=Tt(e,["-e","--expression"]),i=Yt(e,1,["-e","--expression","-f","--file"]),a=s??i[0],o=s?i[0]:i[1];if(a){const r=(Na(a)??a).replace(/\s+/g,""),c=r.match(/^([0-9]+),([0-9]+)p$/);if(c)return o?`print lines ${c[1]}-${c[2]} from ${o}`:`print lines ${c[1]}-${c[2]}`;const d=r.match(/^([0-9]+)p$/);if(d)return o?`print line ${d[1]} from ${o}`:`print line ${d[1]}`}return o?`run sed on ${o}`:"run sed transform"}if(t==="printf"||t==="echo")return"print text";if(t==="cp"||t==="mv"){const s=Yt(e,1,["-t","--target-directory","-S","--suffix"]),i=s[0],a=s[1],o=t==="cp"?"copy":"move";return i&&a?`${o} ${i} to ${a}`:i?`${o} ${i}`:`${o} files`}if(t==="rm"){const s=nt(e,1);return s?`remove ${s}`:"remove files"}if(t==="mkdir"){const s=nt(e,1);return s?`create folder ${s}`:"create folder"}if(t==="touch"){const s=nt(e,1);return s?`create file ${s}`:"create file"}if(t==="curl"||t==="wget"){const s=e.find(i=>/^https?:\/\//i.test(i));return s?`fetch ${s}`:"fetch url"}if(t==="npm"||t==="pnpm"||t==="yarn"||t==="bun"){const s=Yt(e,1,["--prefix","-C","--cwd","--config"]),i=s[0]??"command";return{install:"install dependencies",test:"run tests",build:"run build",start:"start app",lint:"run lint",run:s[1]?`run ${s[1]}`:"run script"}[i]??`run ${t} ${i}`}if(t==="node"||t==="python"||t==="python3"||t==="ruby"||t==="php"){if(e.slice(1).find(c=>c.startsWith("<<")))return`run ${t} inline script (heredoc)`;if((t==="node"?Tt(e,["-e","--eval"]):t==="python"||t==="python3"?Tt(e,["-c"]):void 0)!==void 0)return`run ${t} inline script`;const r=nt(e,1,t==="node"?["-e","--eval","-m"]:["-c","-e","--eval","-m"]);return r?t==="node"?`${e.includes("--check")||e.includes("-c")?"check js syntax for":"run node script"} ${r}`:`run ${t} ${r}`:`run ${t}`}if(t==="openclaw"){const s=nt(e,1);return s?`run openclaw ${s}`:"run openclaw"}const n=nt(e,1);return!n||n.length>48?`run ${t}`:/^[A-Za-z0-9._/-]+$/.test(n)?`run ${t} ${n}`:`run ${t}`}function br(e){const t=Hm(e),n=zm(t).trim();if(!n)return t?es(Xn(yn(t))):void 0;const s=Um(n);if(s.length>1){const i=es(Xn(yn(s[0]))),a=es(Xn(yn(s[s.length-1]))),o=s.length>2?` (+${s.length-2} steps)`:"";return`${i} -> ${a}${o}`}return es(Xn(yn(n)))}function jm(e){const t=an(e);if(!t)return;const n=typeof t.command=="string"?t.command.trim():void 0;if(!n)return;const s=Bm(n),i=br(s)??br(n)??"run command",o=(typeof t.workdir=="string"?t.workdir:typeof t.cwd=="string"?t.cwd:void 0)?.trim();return o?`${i} (in ${o})`:i}function Km(e,t){if(!(!e||!t))return e.actions?.[t]??void 0}function Wm(e,t,n){{for(const s of t){const i=Pm(e,s),a=Ac(i,n.coerce);if(a)return a}return}}const qm={icon:"puzzle",detailKeys:["command","path","url","targetUrl","targetId","ref","element","node","nodeId","id","requestId","to","channelId","guildId","userId","name","query","pattern","messageId"]},Vm={bash:{icon:"wrench",title:"Bash",detailKeys:["command"]},process:{icon:"wrench",title:"Process",detailKeys:["sessionId"]},read:{icon:"fileText",title:"Read",detailKeys:["path"]},write:{icon:"edit",title:"Write",detailKeys:["path"]},edit:{icon:"penLine",title:"Edit",detailKeys:["path"]},attach:{icon:"paperclip",title:"Attach",detailKeys:["path","url","fileName"]},browser:{icon:"globe",title:"Browser",actions:{status:{label:"status"},start:{label:"start"},stop:{label:"stop"},tabs:{label:"tabs"},open:{label:"open",detailKeys:["targetUrl"]},focus:{label:"focus",detailKeys:["targetId"]},close:{label:"close",detailKeys:["targetId"]},snapshot:{label:"snapshot",detailKeys:["targetUrl","targetId","ref","element","format"]},screenshot:{label:"screenshot",detailKeys:["targetUrl","targetId","ref","element"]},navigate:{label:"navigate",detailKeys:["targetUrl","targetId"]},console:{label:"console",detailKeys:["level","targetId"]},pdf:{label:"pdf",detailKeys:["targetId"]},upload:{label:"upload",detailKeys:["paths","ref","inputRef","element","targetId"]},dialog:{label:"dialog",detailKeys:["accept","promptText","targetId"]},act:{label:"act",detailKeys:["request.kind","request.ref","request.selector","request.text","request.value"]}}},canvas:{icon:"image",title:"Canvas",actions:{present:{label:"present",detailKeys:["target","node","nodeId"]},hide:{label:"hide",detailKeys:["node","nodeId"]},navigate:{label:"navigate",detailKeys:["url","node","nodeId"]},eval:{label:"eval",detailKeys:["javaScript","node","nodeId"]},snapshot:{label:"snapshot",detailKeys:["format","node","nodeId"]},a2ui_push:{label:"A2UI push",detailKeys:["jsonlPath","node","nodeId"]},a2ui_reset:{label:"A2UI reset",detailKeys:["node","nodeId"]}}},nodes:{icon:"smartphone",title:"Nodes",actions:{status:{label:"status"},describe:{label:"describe",detailKeys:["node","nodeId"]},pending:{label:"pending"},approve:{label:"approve",detailKeys:["requestId"]},reject:{label:"reject",detailKeys:["requestId"]},notify:{label:"notify",detailKeys:["node","nodeId","title","body"]},camera_snap:{label:"camera snap",detailKeys:["node","nodeId","facing","deviceId"]},camera_list:{label:"camera list",detailKeys:["node","nodeId"]},camera_clip:{label:"camera clip",detailKeys:["node","nodeId","facing","duration","durationMs"]},screen_record:{label:"screen record",detailKeys:["node","nodeId","duration","durationMs","fps","screenIndex"]}}},cron:{icon:"loader",title:"Cron",actions:{status:{label:"status"},list:{label:"list"},add:{label:"add",detailKeys:["job.name","job.id","job.schedule","job.cron"]},update:{label:"update",detailKeys:["id"]},remove:{label:"remove",detailKeys:["id"]},run:{label:"run",detailKeys:["id"]},runs:{label:"runs",detailKeys:["id"]},wake:{label:"wake",detailKeys:["text","mode"]}}},gateway:{icon:"plug",title:"Gateway",actions:{restart:{label:"restart",detailKeys:["reason","delayMs"]},"config.get":{label:"config get"},"config.schema":{label:"config schema"},"config.apply":{label:"config apply",detailKeys:["restartDelayMs"]},"update.run":{label:"update run",detailKeys:["restartDelayMs"]}}},whatsapp_login:{icon:"circle",title:"WhatsApp Login",actions:{start:{label:"start"},wait:{label:"wait"}}},discord:{icon:"messageSquare",title:"Discord",actions:{react:{label:"react",detailKeys:["channelId","messageId","emoji"]},reactions:{label:"reactions",detailKeys:["channelId","messageId"]},sticker:{label:"sticker",detailKeys:["to","stickerIds"]},poll:{label:"poll",detailKeys:["question","to"]},permissions:{label:"permissions",detailKeys:["channelId"]},readMessages:{label:"read messages",detailKeys:["channelId","limit"]},sendMessage:{label:"send",detailKeys:["to","content"]},editMessage:{label:"edit",detailKeys:["channelId","messageId"]},deleteMessage:{label:"delete",detailKeys:["channelId","messageId"]},threadCreate:{label:"thread create",detailKeys:["channelId","name"]},threadList:{label:"thread list",detailKeys:["guildId","channelId"]},threadReply:{label:"thread reply",detailKeys:["channelId","content"]},pinMessage:{label:"pin",detailKeys:["channelId","messageId"]},unpinMessage:{label:"unpin",detailKeys:["channelId","messageId"]},listPins:{label:"list pins",detailKeys:["channelId"]},searchMessages:{label:"search",detailKeys:["guildId","content"]},memberInfo:{label:"member",detailKeys:["guildId","userId"]},roleInfo:{label:"roles",detailKeys:["guildId"]},emojiList:{label:"emoji list",detailKeys:["guildId"]},roleAdd:{label:"role add",detailKeys:["guildId","userId","roleId"]},roleRemove:{label:"role remove",detailKeys:["guildId","userId","roleId"]},channelInfo:{label:"channel",detailKeys:["channelId"]},channelList:{label:"channels",detailKeys:["guildId"]},voiceStatus:{label:"voice",detailKeys:["guildId","userId"]},eventList:{label:"events",detailKeys:["guildId"]},eventCreate:{label:"event create",detailKeys:["guildId","name"]},timeout:{label:"timeout",detailKeys:["guildId","userId"]},kick:{label:"kick",detailKeys:["guildId","userId"]},ban:{label:"ban",detailKeys:["guildId","userId"]}}},slack:{icon:"messageSquare",title:"Slack",actions:{react:{label:"react",detailKeys:["channelId","messageId","emoji"]},reactions:{label:"reactions",detailKeys:["channelId","messageId"]},sendMessage:{label:"send",detailKeys:["to","content"]},editMessage:{label:"edit",detailKeys:["channelId","messageId"]},deleteMessage:{label:"delete",detailKeys:["channelId","messageId"]},readMessages:{label:"read messages",detailKeys:["channelId","limit"]},pinMessage:{label:"pin",detailKeys:["channelId","messageId"]},unpinMessage:{label:"unpin",detailKeys:["channelId","messageId"]},listPins:{label:"list pins",detailKeys:["channelId"]},memberInfo:{label:"member",detailKeys:["userId"]},emojiList:{label:"emoji list"}}}},Gm={fallback:qm,tools:Vm},_c=Gm,yr=_c.fallback??{icon:"puzzle"},Qm=_c.tools??{};function Ym(e){if(!e)return e;const t=[{re:/^\/Users\/[^/]+(\/|$)/,replacement:"~$1"},{re:/^\/home\/[^/]+(\/|$)/,replacement:"~$1"},{re:/^C:\\Users\\[^\\]+(\\|$)/i,replacement:"~$1"}];for(const n of t)if(n.re.test(e))return e.replace(n.re,n.replacement);return e}function Zm(e){const t=Mm(e.name),n=t.toLowerCase(),s=Qm[n],i=s?.icon??yr.icon??"puzzle",a=s?.title??Im(t),o=s?.label??a,r=e.args&&typeof e.args=="object"?e.args.action:void 0,c=typeof r=="string"?r.trim():void 0,d=Km(s,c),g=n==="web_search"?"search":n==="web_fetch"?"fetch":n.replace(/_/g," ").replace(/\./g," "),p=Rm(d?.label??c??g);let h;n==="exec"&&(h=jm(e.args)),!h&&n==="read"&&(h=Dm(e.args)),!h&&(n==="write"||n==="edit"||n==="attach")&&(h=Fm(n,e.args)),!h&&n==="web_search"&&(h=Nm(e.args)),!h&&n==="web_fetch"&&(h=Om(e.args));const u=d?.detailKeys??s?.detailKeys??yr.detailKeys??[];return!h&&u.length>0&&(h=Wm(e.args,u,{coerce:{includeFalse:!0,includeZero:!0}})),!h&&e.meta&&(h=e.meta),h&&(h=Ym(h)),{name:t,icon:i,title:a,label:o,verb:p,detail:h}}function Jm(e){if(e.detail){if(e.detail.includes(" · ")){const t=e.detail.split(" · ").map(n=>n.trim()).filter(n=>n.length>0).join(", ");return t?`with ${t}`:void 0}return e.detail}}const Xm=80,eb=2,xr=100;function tb(e){const t=e.trim();if(t.startsWith("{")||t.startsWith("["))try{const n=JSON.parse(t);return"```json\n"+JSON.stringify(n,null,2)+"\n```"}catch{}return e}function nb(e){const t=e.split(`
`),n=t.slice(0,eb),s=n.join(`
`);return s.length>xr?s.slice(0,xr)+"…":n.length<t.length?s+"…":s}function sb(e){const t=e,n=ib(t.content),s=[];for(const i of n){const a=(typeof i.type=="string"?i.type:"").toLowerCase();(["toolcall","tool_call","tooluse","tool_use"].includes(a)||typeof i.name=="string"&&i.arguments!=null)&&s.push({kind:"call",name:i.name??"tool",args:ab(i.arguments??i.args)})}for(const i of n){const a=(typeof i.type=="string"?i.type:"").toLowerCase();if(a!=="toolresult"&&a!=="tool_result")continue;const o=ob(i),r=typeof i.name=="string"?i.name:"tool";s.push({kind:"result",name:r,text:o})}if(Sc(e)&&!s.some(i=>i.kind==="result")){const i=typeof t.toolName=="string"&&t.toolName||typeof t.tool_name=="string"&&t.tool_name||"tool",a=El(e)??void 0;s.push({kind:"result",name:i,text:a})}return s}function $r(e,t){const n=Zm({name:e.name,args:e.args}),s=Jm(n),i=!!e.text?.trim(),a=!!t,o=a?()=>{if(i){t(tb(e.text));return}const p=`## ${n.label}

${s?`**Command:** \`${s}\`

`:""}*No output — tool completed successfully.*`;t(p)}:void 0,r=i&&(e.text?.length??0)<=Xm,c=i&&!r,d=i&&r,g=!i;return l`
    <div
      class="chat-tool-card ${a?"chat-tool-card--clickable":""}"
      @click=${o}
      role=${a?"button":v}
      tabindex=${a?"0":v}
      @keydown=${a?p=>{p.key!=="Enter"&&p.key!==" "||(p.preventDefault(),o?.())}:v}
    >
      <div class="chat-tool-card__header">
        <div class="chat-tool-card__title">
          <span class="chat-tool-card__icon">${se[n.icon]}</span>
          <span>${n.label}</span>
        </div>
        ${a?l`<span class="chat-tool-card__action">${i?"View":""} ${se.check}</span>`:v}
        ${g&&!a?l`<span class="chat-tool-card__status">${se.check}</span>`:v}
      </div>
      ${s?l`<div class="chat-tool-card__detail">${s}</div>`:v}
      ${g?l`
              <div class="chat-tool-card__status-text muted">Completed</div>
            `:v}
      ${c?l`<div class="chat-tool-card__preview mono">${nb(e.text)}</div>`:v}
      ${d?l`<div class="chat-tool-card__inline mono">${e.text}</div>`:v}
    </div>
  `}function ib(e){return Array.isArray(e)?e.filter(Boolean):[]}function ab(e){if(typeof e!="string")return e;const t=e.trim();if(!t||!t.startsWith("{")&&!t.startsWith("["))return e;try{return JSON.parse(t)}catch{return e}}function ob(e){if(typeof e.text=="string")return e.text;if(typeof e.content=="string")return e.content}function rb(e){const n=e.content,s=[];if(Array.isArray(n))for(const i of n){if(typeof i!="object"||i===null)continue;const a=i;if(a.type==="image"){const o=a.source;if(o?.type==="base64"&&typeof o.data=="string"){const r=o.data,c=o.media_type||"image/png",d=r.startsWith("data:")?r:`data:${c};base64,${r}`;s.push({url:d})}else typeof a.url=="string"&&s.push({url:a.url})}else if(a.type==="image_url"){const o=a.image_url;typeof o?.url=="string"&&s.push({url:o.url})}}return s}function lb(e){return l`
    <div class="chat-group assistant">
      ${za("assistant",e)}
      <div class="chat-group-messages">
        <div class="chat-bubble chat-reading-indicator" aria-hidden="true">
          <span class="chat-reading-indicator__dots">
            <span></span><span></span><span></span>
          </span>
        </div>
      </div>
    </div>
  `}function cb(e,t,n,s){const i=new Date(t).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}),a=s?.name??"Assistant";return l`
    <div class="chat-group assistant">
      ${za("assistant",s)}
      <div class="chat-group-messages">
        ${Ec({role:"assistant",content:[{type:"text",text:e}],timestamp:t},{isStreaming:!0,showReasoning:!1},n)}
        <div class="chat-group-footer">
          <span class="chat-sender-name">${a}</span>
          <span class="chat-group-timestamp">${i}</span>
        </div>
      </div>
    </div>
  `}const Ba=["#e879f9","#38bdf8","#34d399","#fb923c","#a78bfa","#f472b6","#2dd4bf","#fbbf24","#818cf8","#4ade80"];function db(e){let t=0;for(let n=0;n<e.length;n++)t=(t<<5)-t+e.charCodeAt(n)|0;return Math.abs(t)%Ba.length}function ub(e){if(e.role!=="assistant"||!e.messages.length)return null;const t=e.messages[0]?.message;if(!t?.content)return null;const n=t.content;if(!Array.isArray(n))return null;for(const s of n)if(s.type==="text"&&typeof s.text=="string"){const i=s.text.match(/^\[([^\]]+)\]\s*\n/);if(i)return i[1]}return null}function gb(e,t){const n=Ba[t],s=e.split(/\s*→\s*/),a=(s[s.length-1]||e).charAt(0).toUpperCase();return l`<div class="chat-avatar injected" style="background: ${n}; color: #fff;">${a}</div>`}function pb(e,t){const n=Fa(e.role),s=t.assistantName??"Assistant",i=ub(e),a=i!==null,o=a?db(i):-1,r=a?i:n==="user"?"You":n==="assistant"?s:n,c=a?"injected":n==="user"?"user":n==="assistant"?"assistant":"other",d=new Date(e.timestamp).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}),g=a?`--injected-color: ${Ba[o]}`:"";return l`
    <div class="chat-group ${c}" style="${g}">
      ${a?gb(i,o):za(e.role,{name:s,avatar:t.assistantAvatar??null})}
      <div class="chat-group-messages">
        ${e.messages.map((p,h)=>Ec(p.message,{isStreaming:e.isStreaming&&h===e.messages.length-1,showReasoning:t.showReasoning},t.onOpenSidebar))}
        <div class="chat-group-footer">
          <span class="chat-sender-name">${r}</span>
          <span class="chat-group-timestamp">${d}</span>
        </div>
      </div>
    </div>
  `}function za(e,t){const n=Fa(e),s=t?.name?.trim()||"Assistant",i=t?.avatar?.trim()||"",a=n==="user"?"U":n==="assistant"?s.charAt(0).toUpperCase()||"A":n==="tool"?"⚙":"?",o=n==="user"?"user":n==="assistant"?"assistant":n==="tool"?"tool":"other";return i&&n==="assistant"?fb(i)?l`<img
        class="chat-avatar ${o}"
        src="${i}"
        alt="${s}"
      />`:l`<div class="chat-avatar ${o}">${i}</div>`:l`<div class="chat-avatar ${o}">${a}</div>`}function fb(e){return/^https?:\/\//i.test(e)||/^data:image\//i.test(e)||e.startsWith("/")}function hb(e){return e.length===0?v:l`
    <div class="chat-message-images">
      ${e.map(t=>l`
          <img
            src=${t.url}
            alt=${t.alt??"Attached image"}
            class="chat-message-image"
            @click=${()=>window.open(t.url,"_blank")}
          />
        `)}
    </div>
  `}function vb(e){return ne.synthSupported?l`
    <button
      class="chat-speak-btn"
      type="button"
      title="Read aloud"
      aria-label="Read aloud"
      @click=${t=>{const n=t.currentTarget;if(ne.isSpeaking)ne.stopSpeaking(),n.classList.remove("speaking");else{ne.speakDirect(e),n.classList.add("speaking");const s=setInterval(()=>{speechSynthesis.speaking||(n.classList.remove("speaking"),clearInterval(s))},200)}}}
    >
      <span class="chat-speak-btn__icon" aria-hidden="true">${se.volume2}</span>
    </button>
  `:v}function Ec(e,t,n){const s=e,i=typeof s.role=="string"?s.role:"unknown",a=Sc(e)||i.toLowerCase()==="toolresult"||i.toLowerCase()==="tool_result"||typeof s.toolCallId=="string"||typeof s.tool_call_id=="string",o=sb(e),r=o.length>0,c=rb(e),d=c.length>0,g=El(e),p=t.showReasoning&&i==="assistant"?Ig(e):null,h=g?.trim()?g:null,u=p?Pg(p):null,f=h,m=i==="assistant"&&!!f?.trim(),w=i==="assistant"&&!!f?.trim(),A=["chat-bubble",m?"has-copy":"",t.isStreaming?"streaming":"","fade-in"].filter(Boolean).join(" ");return!f&&r&&a?l`${o.map(C=>$r(C,n))}`:!f&&!r&&!d?v:l`
    <div class="${A}">
      ${m?Lm(f):v}
      ${w?vb(f):v}
      ${hb(c)}
      ${u?l`<div class="chat-thinking">${Pi(Hi(u))}</div>`:v}
      ${f?l`<div class="chat-text" dir="${$c(f)}">${Pi(Hi(f))}</div>`:v}
      ${o.map(C=>$r(C,n))}
    </div>
  `}function mb(e){return l`
    <div class="sidebar-panel">
      <div class="sidebar-header">
        <div class="sidebar-title">Tool Output</div>
        <button @click=${e.onClose} class="btn" title="Close sidebar">
          ${se.x}
        </button>
      </div>
      <div class="sidebar-content">
        ${e.error?l`
              <div class="callout danger">${e.error}</div>
              <button @click=${e.onViewRawText} class="btn" style="margin-top: 12px;">
                View Raw Text
              </button>
            `:e.content?l`<div class="sidebar-markdown">${Pi(Hi(e.content))}</div>`:l`
                  <div class="muted">No content available</div>
                `}
      </div>
    </div>
  `}var bb=Object.defineProperty,yb=Object.getOwnPropertyDescriptor,Os=(e,t,n,s)=>{for(var i=s>1?void 0:s?yb(t,n):t,a=e.length-1,o;a>=0;a--)(o=e[a])&&(i=(s?o(t,n,i):o(i))||i);return s&&i&&bb(t,n,i),i};let nn=class extends Jt{constructor(){super(...arguments),this.splitRatio=.6,this.minRatio=.4,this.maxRatio=.7,this.isDragging=!1,this.startX=0,this.startRatio=0,this.handleMouseDown=e=>{this.isDragging=!0,this.startX=e.clientX,this.startRatio=this.splitRatio,this.classList.add("dragging"),document.addEventListener("mousemove",this.handleMouseMove),document.addEventListener("mouseup",this.handleMouseUp),e.preventDefault()},this.handleMouseMove=e=>{if(!this.isDragging)return;const t=this.parentElement;if(!t)return;const n=t.getBoundingClientRect().width,i=(e.clientX-this.startX)/n;let a=this.startRatio+i;a=Math.max(this.minRatio,Math.min(this.maxRatio,a)),this.dispatchEvent(new CustomEvent("resize",{detail:{splitRatio:a},bubbles:!0,composed:!0}))},this.handleMouseUp=()=>{this.isDragging=!1,this.classList.remove("dragging"),document.removeEventListener("mousemove",this.handleMouseMove),document.removeEventListener("mouseup",this.handleMouseUp)}}render(){return v}connectedCallback(){super.connectedCallback(),this.addEventListener("mousedown",this.handleMouseDown)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("mousedown",this.handleMouseDown),document.removeEventListener("mousemove",this.handleMouseMove),document.removeEventListener("mouseup",this.handleMouseUp)}};nn.styles=zc`
    :host {
      width: 4px;
      cursor: col-resize;
      background: var(--border, #333);
      transition: background 150ms ease-out;
      flex-shrink: 0;
      position: relative;
    }
    :host::before {
      content: "";
      position: absolute;
      top: 0;
      left: -4px;
      right: -4px;
      bottom: 0;
    }
    :host(:hover) {
      background: var(--accent, #007bff);
    }
    :host(.dragging) {
      background: var(--accent, #007bff);
    }
  `;Os([Ss({type:Number})],nn.prototype,"splitRatio",2);Os([Ss({type:Number})],nn.prototype,"minRatio",2);Os([Ss({type:Number})],nn.prototype,"maxRatio",2);nn=Os([Ur("resizable-divider")],nn);const xb=5e3;function wr(e){e.style.height="auto",e.style.height=`${e.scrollHeight}px`}function $b(e){return e?e.active?l`
      <div class="compaction-indicator compaction-indicator--active" role="status" aria-live="polite">
        ${se.loader} Compacting context...
      </div>
    `:e.completedAt&&Date.now()-e.completedAt<xb?l`
        <div class="compaction-indicator compaction-indicator--complete" role="status" aria-live="polite">
          ${se.check} Context compacted
        </div>
      `:v:v}function Lc(){return`att-${Date.now()}-${Math.random().toString(36).slice(2,9)}`}function wb(e,t){const n=e.clipboardData?.items;if(!n||!t.onAttachmentsChange)return;const s=[];for(let i=0;i<n.length;i++){const a=n[i];a.type.startsWith("image/")&&s.push(a)}if(s.length!==0){e.preventDefault();for(const i of s){const a=i.getAsFile();if(!a)continue;const o=new FileReader;o.addEventListener("load",()=>{const r=o.result,c={id:Lc(),dataUrl:r,mimeType:a.type},d=t.attachments??[];t.onAttachmentsChange?.([...d,c])}),o.readAsDataURL(a)}}}function kb(e){if(!e.onAttachmentsChange)return;const t=document.createElement("input");t.type="file",t.accept="image/*",t.multiple=!0,t.addEventListener("change",()=>{const n=t.files;if(n)for(let s=0;s<n.length;s++){const i=n[s];if(!i.type.startsWith("image/"))continue;const a=new FileReader;a.addEventListener("load",()=>{const o=a.result,r={id:Lc(),dataUrl:o,mimeType:i.type},c=e.attachments??[];e.onAttachmentsChange?.([...c,r])}),a.readAsDataURL(i)}}),t.click()}function Sb(e){const t=e.attachments??[];return t.length===0?v:l`
    <div class="chat-attachments">
      ${t.map(n=>l`
          <div class="chat-attachment">
            <img
              src=${n.dataUrl}
              alt="Attachment preview"
              class="chat-attachment__img"
            />
            <button
              class="chat-attachment__remove"
              type="button"
              aria-label="Remove attachment"
              @click=${()=>{const s=(e.attachments??[]).filter(i=>i.id!==n.id);e.onAttachmentsChange?.(s)}}
            >
              ${se.x}
            </button>
          </div>
        `)}
    </div>
  `}function Ab(e){const t=e.connected,n=e.sending||e.stream!==null,s=!!(e.canAbort&&e.onAbort),a=e.sessions?.sessions?.find(f=>f.key===e.sessionKey)?.reasoningLevel??"off",o=e.showThinking&&a!=="off",r={name:e.assistantName,avatar:e.assistantAvatar??e.assistantAvatarUrl??null},c=(e.attachments?.length??0)>0,d=e.connected?c?"Add a message or paste more images...":"Message (↩ to send, Shift+↩ for line breaks, paste images)":"Connect to the gateway to start chatting…",g=e.splitRatio??.6,p=!!(e.sidebarOpen&&e.onCloseSidebar),h=Tb(e),u=l`
    <div
      class="chat-thread"
      role="log"
      aria-live="polite"
      @scroll=${e.onChatScroll}
    >
      ${e.loading?l`
              <div class="muted">Loading chat…</div>
            `:v}
      ${Wl(h,f=>f.key,f=>f.kind==="divider"?l`
              <div class="chat-divider" role="separator" data-ts=${String(f.timestamp)}>
                <span class="chat-divider__line"></span>
                <span class="chat-divider__label">${f.label}</span>
                <span class="chat-divider__line"></span>
              </div>
            `:f.kind==="reading-indicator"?lb(r):f.kind==="stream"?cb(f.text,f.startedAt,e.onOpenSidebar,r):f.kind==="group"?pb(f,{onOpenSidebar:e.onOpenSidebar,showReasoning:o,assistantName:e.assistantName,assistantAvatar:r.avatar}):v)}
    </div>
  `;return l`
    <section class="card chat">
      ${e.disabledReason?l`<div class="callout">${e.disabledReason}</div>`:v}

      ${e.error?l`<div class="callout danger">${e.error}</div>`:v}

      ${e.focusMode?l`
            <button
              class="chat-focus-exit"
              type="button"
              @click=${e.onToggleFocusMode}
              aria-label="Exit focus mode"
              title="Exit focus mode"
            >
              ${se.x}
            </button>
          `:v}

      <div
        class="chat-split-container ${p?"chat-split-container--open":""}"
      >
        <div
          class="chat-main"
          style="flex: ${p?`0 0 ${g*100}%`:"1 1 100%"}"
        >
          ${u}
        </div>

        ${p?l`
              <resizable-divider
                .splitRatio=${g}
                @resize=${f=>e.onSplitRatioChange?.(f.detail.splitRatio)}
              ></resizable-divider>
              <div class="chat-sidebar">
                ${mb({content:e.sidebarContent??null,error:e.sidebarError??null,onClose:e.onCloseSidebar,onViewRawText:()=>{!e.sidebarContent||!e.onOpenSidebar||e.onOpenSidebar(`\`\`\`
${e.sidebarContent}
\`\`\``)}})}
              </div>
            `:v}
      </div>

      ${e.queue.length?l`
            <div class="chat-queue" role="status" aria-live="polite">
              <div class="chat-queue__title">Queued (${e.queue.length})</div>
              <div class="chat-queue__list">
                ${e.queue.map(f=>l`
                    <div class="chat-queue__item">
                      <div class="chat-queue__text">
                        ${f.text||(f.attachments?.length?`Image (${f.attachments.length})`:"")}
                      </div>
                      <button
                        class="btn chat-queue__remove"
                        type="button"
                        aria-label="Remove queued message"
                        @click=${()=>e.onQueueRemove(f.id)}
                      >
                        ${se.x}
                      </button>
                    </div>
                  `)}
              </div>
            </div>
          `:v}

      ${$b(e.compactionStatus)}

      ${e.showNewMessages?l`
            <button
              class="btn chat-new-messages"
              type="button"
              @click=${e.onScrollToBottom}
            >
              New messages ${se.arrowDown}
            </button>
          `:v}

      <div class="chat-compose">
        ${Sb(e)}
        ${ne.voiceModeActive?l`<div class="chat-voice-indicator">
              ${se.bluetooth} Voice Mode Active
            </div>`:v}
        <div class="chat-compose__row">
          <div class="chat-compose__left-actions">
            <button
              class="btn btn-icon chat-upload-btn"
              type="button"
              title="Upload image"
              ?disabled=${!e.connected}
              @click=${()=>kb(e)}
            >
              ${se.paperclip}
            </button>
            ${ne.supported?l`<button
                  class="btn btn-icon chat-mic-btn ${ne.listening?"chat-mic-btn--active":""}"
                  type="button"
                  title="${ne.listening?"Stop recording":"Voice input"}"
                  ?disabled=${!e.connected}
                  @click=${()=>ne.toggleListening()}
                >
                  ${ne.listening?se.micOff:se.mic}
                </button>`:v}
            ${ne.synthSupported?l`<button
                  class="btn btn-icon chat-speaker-btn ${ne.speakerEnabled?"chat-speaker-btn--active":""}"
                  type="button"
                  title="${ne.speakerEnabled?"Disable voice output":"Enable voice output"}"
                  @click=${()=>ne.toggleSpeaker()}
                >
                  ${ne.speakerEnabled?se.volume2:se.volumeX}
                </button>`:v}
            ${ne.supported?l`<button
                  class="btn btn-icon chat-handsfree-btn ${ne.autoSend?"chat-handsfree-btn--active":""}"
                  type="button"
                  title="${ne.autoSend?"Disable hands-free (auto-send)":"Enable hands-free (auto-send after voice)"}"
                  @click=${()=>ne.setAutoSend(!ne.autoSend)}
                >
                  ${se.zap}
                </button>`:v}
          </div>
          <label class="field chat-compose__field">
            <span>Message</span>
            <textarea
              ${av(f=>f&&wr(f))}
              .value=${e.draft}
              dir=${$c(e.draft)}
              ?disabled=${!e.connected}
              @keydown=${f=>{f.key==="Enter"&&(f.isComposing||f.keyCode===229||f.shiftKey||e.connected&&(f.preventDefault(),t&&e.onSend()))}}
              @input=${f=>{const m=f.target;wr(m),e.onDraftChange(m.value)}}
              @paste=${f=>wb(f,e)}
              placeholder=${d}
            ></textarea>
          </label>
          <div class="chat-compose__actions">
            ${s?l`<button
                  class="btn"
                  ?disabled=${!e.connected}
                  @click=${e.onAbort}
                >Stop</button>`:l`<button
                    class="btn"
                    ?disabled=${!e.connected||e.sending}
                    @click=${e.onNewSession}
                    title="Start a new chat session"
                  >+ New</button>
                  ${(e.agentsList?.agents??[]).length>1?l`<select
                        class="chat-agent-select"
                        ?disabled=${!e.connected||e.sending}
                        @change=${f=>{const m=f.target,w=m.value;m.value="",w&&e.onSelectAgent&&e.onSelectAgent(w)}}
                      >
                        <option value="" disabled selected>Agent ▾</option>
                        ${(e.agentsList?.agents??[]).map(f=>{const m=f.identity?.name||f.name||f.id;return l`<option value=${f.id}>${m}</option>`})}
                      </select>`:v}`}
            <button
              class="btn primary"
              ?disabled=${!e.connected}
              @click=${e.onSend}
            >
              ${n?"Queue":"Send"}<kbd class="btn-kbd">↵</kbd>
            </button>
          </div>
        </div>
      </div>
    </section>
  `}const kr=200;function Cb(e){const t=[];let n=null;for(const s of e){if(s.kind!=="message"){n&&(t.push(n),n=null),t.push(s);continue}const i=kc(s.message),a=Fa(i.role),o=i.timestamp||Date.now();!n||n.role!==a?(n&&t.push(n),n={kind:"group",key:`group:${a}:${s.key}`,role:a,messages:[{message:s.message,key:s.key}],timestamp:o,isStreaming:!1}):n.messages.push({message:s.message,key:s.key})}return n&&t.push(n),t}function Tb(e){const t=[],n=Array.isArray(e.messages)?e.messages:[],s=Array.isArray(e.toolMessages)?e.toolMessages:[],i=Math.max(0,n.length-kr);i>0&&t.push({kind:"message",key:"chat:history:notice",message:{role:"system",content:`Showing last ${kr} messages (${i} hidden).`,timestamp:Date.now()}});for(let a=i;a<n.length;a++){const o=n[a],r=kc(o),d=o.__openclaw;if(d&&d.kind==="compaction"){t.push({kind:"divider",key:typeof d.id=="string"?`divider:compaction:${d.id}`:`divider:compaction:${r.timestamp}:${a}`,label:"Compaction",timestamp:r.timestamp??Date.now()});continue}!e.showThinking&&r.role.toLowerCase()==="toolresult"||t.push({kind:"message",key:Sr(o,a),message:o})}if(e.showThinking)for(let a=0;a<s.length;a++)t.push({kind:"message",key:Sr(s[a],a+n.length),message:s[a]});if(e.stream!==null){const a=`stream:${e.sessionKey}:${e.streamStartedAt??"live"}`;e.stream.trim().length>0?t.push({kind:"stream",key:a,text:e.stream,startedAt:e.streamStartedAt??Date.now()}):t.push({kind:"reading-indicator",key:a})}return Cb(t)}function Sr(e,t){const n=e,s=typeof n.toolCallId=="string"?n.toolCallId:"";if(s)return`tool:${s}`;const i=typeof n.id=="string"?n.id:"";if(i)return`msg:${i}`;const a=typeof n.messageId=="string"?n.messageId:"";if(a)return`msg:${a}`;const o=typeof n.timestamp=="number"?n.timestamp:null,r=typeof n.role=="string"?n.role:"unknown";return o!=null?`msg:${r}:${o}:${t}`:`msg:${r}:${t}`}const ji={all:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  `,env:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="3"></circle>
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
      ></path>
    </svg>
  `,update:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  `,agents:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path
        d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"
      ></path>
      <circle cx="8" cy="14" r="1"></circle>
      <circle cx="16" cy="14" r="1"></circle>
    </svg>
  `,auth:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  `,channels:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `,messages:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  `,commands:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
  `,hooks:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
  `,skills:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      ></polygon>
    </svg>
  `,tools:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
      ></path>
    </svg>
  `,gateway:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path
        d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
      ></path>
    </svg>
  `,wizard:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M15 4V2"></path>
      <path d="M15 16v-2"></path>
      <path d="M8 9h2"></path>
      <path d="M20 9h2"></path>
      <path d="M17.8 11.8 19 13"></path>
      <path d="M15 9h0"></path>
      <path d="M17.8 6.2 19 5"></path>
      <path d="m3 21 9-9"></path>
      <path d="M12.2 6.2 11 5"></path>
    </svg>
  `,meta:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
    </svg>
  `,logging:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  `,browser:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="4"></circle>
      <line x1="21.17" y1="8" x2="12" y2="8"></line>
      <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
      <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
    </svg>
  `,ui:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="3" y1="9" x2="21" y2="9"></line>
      <line x1="9" y1="21" x2="9" y2="9"></line>
    </svg>
  `,models:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path
        d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
      ></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  `,bindings:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
      <line x1="6" y1="6" x2="6.01" y2="6"></line>
      <line x1="6" y1="18" x2="6.01" y2="18"></line>
    </svg>
  `,broadcast:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path>
      <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path>
      <circle cx="12" cy="12" r="2"></circle>
      <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path>
      <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"></path>
    </svg>
  `,audio:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 18V5l12-2v13"></path>
      <circle cx="6" cy="18" r="3"></circle>
      <circle cx="18" cy="16" r="3"></circle>
    </svg>
  `,session:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  `,cron:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  `,web:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path
        d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
      ></path>
    </svg>
  `,discovery:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  `,canvasHost:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  `,talk:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="23"></line>
      <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
  `,plugins:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2v6"></path>
      <path d="m4.93 10.93 4.24 4.24"></path>
      <path d="M2 12h6"></path>
      <path d="m4.93 13.07 4.24-4.24"></path>
      <path d="M12 22v-6"></path>
      <path d="m19.07 13.07-4.24-4.24"></path>
      <path d="M22 12h-6"></path>
      <path d="m19.07 10.93-4.24 4.24"></path>
    </svg>
  `,default:l`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
    </svg>
  `},Ar=[{key:"env",label:"Environment"},{key:"update",label:"Updates"},{key:"agents",label:"Agents"},{key:"auth",label:"Authentication"},{key:"channels",label:"Channels"},{key:"messages",label:"Messages"},{key:"commands",label:"Commands"},{key:"hooks",label:"Hooks"},{key:"skills",label:"Skills"},{key:"tools",label:"Tools"},{key:"gateway",label:"Gateway"},{key:"wizard",label:"Setup Wizard"}],Cr="__all__";function Tr(e){return ji[e]??ji.default}function _b(e,t){const n=Aa[e];return n||{label:t?.title??st(e),description:t?.description??""}}function Eb(e){const{key:t,schema:n,uiHints:s}=e;if(!n||Le(n)!=="object"||!n.properties)return[];const i=Object.entries(n.properties).map(([a,o])=>{const r=Re([t,a],s),c=r?.label??o.title??st(a),d=r?.help??o.description??"",g=r?.order??50;return{key:a,label:c,description:d,order:g}});return i.sort((a,o)=>a.order!==o.order?a.order-o.order:a.key.localeCompare(o.key)),i}function Lb(e,t){if(!e||!t)return[];const n=[];function s(i,a,o){if(i===a)return;if(typeof i!=typeof a){n.push({path:o,from:i,to:a});return}if(typeof i!="object"||i===null||a===null){i!==a&&n.push({path:o,from:i,to:a});return}if(Array.isArray(i)&&Array.isArray(a)){JSON.stringify(i)!==JSON.stringify(a)&&n.push({path:o,from:i,to:a});return}const r=i,c=a,d=new Set([...Object.keys(r),...Object.keys(c)]);for(const g of d)s(r[g],c[g],o?`${o}.${g}`:g)}return s(e,t,""),n}function _r(e,t=40){let n;try{n=JSON.stringify(e)??String(e)}catch{n=String(e)}return n.length<=t?n:n.slice(0,t-3)+"..."}function Mb(e){const t=e.valid==null?"unknown":e.valid?"valid":"invalid",n=tc(e.schema),s=n.schema?n.unsupportedPaths.length>0:!1,i=n.schema?.properties??{},a=Ar.filter(T=>T.key in i),o=new Set(Ar.map(T=>T.key)),r=Object.keys(i).filter(T=>!o.has(T)).map(T=>({key:T,label:T.charAt(0).toUpperCase()+T.slice(1)})),c=[...a,...r],d=e.activeSection&&n.schema&&Le(n.schema)==="object"?n.schema.properties?.[e.activeSection]:void 0,g=e.activeSection?_b(e.activeSection,d):null,p=e.activeSection?Eb({key:e.activeSection,schema:d,uiHints:e.uiHints}):[],h=e.formMode==="form"&&!!e.activeSection&&p.length>0,u=e.activeSubsection===Cr,f=e.searchQuery||u?null:e.activeSubsection??p[0]?.key??null,m=e.formMode==="form"?Lb(e.originalValue,e.formValue):[],w=e.formMode==="raw"&&e.raw!==e.originalRaw,A=e.formMode==="form"?m.length>0:w,C=!!e.formValue&&!e.loading&&!!n.schema,k=e.connected&&!e.saving&&A&&(e.formMode==="raw"?!0:C),S=e.connected&&!e.applying&&!e.updating&&A&&(e.formMode==="raw"?!0:C),E=e.connected&&!e.applying&&!e.updating;return l`
    <div class="config-layout">
      <!-- Sidebar -->
      <aside class="config-sidebar">
        <div class="config-sidebar__header">
          <div class="config-sidebar__title">Settings</div>
          <span
            class="pill pill--sm ${t==="valid"?"pill--ok":t==="invalid"?"pill--danger":""}"
            >${t}</span
          >
        </div>

        <!-- Search -->
        <div class="config-search">
          <svg
            class="config-search__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            class="config-search__input"
            placeholder="Search settings..."
            .value=${e.searchQuery}
            @input=${T=>e.onSearchChange(T.target.value)}
          />
          ${e.searchQuery?l`
                <button
                  class="config-search__clear"
                  @click=${()=>e.onSearchChange("")}
                >
                  ×
                </button>
              `:v}
        </div>

        <!-- Section nav -->
        <nav class="config-nav">
          <button
            class="config-nav__item ${e.activeSection===null?"active":""}"
            @click=${()=>e.onSectionChange(null)}
          >
            <span class="config-nav__icon">${ji.all}</span>
            <span class="config-nav__label">All Settings</span>
          </button>
          ${c.map(T=>l`
              <button
                class="config-nav__item ${e.activeSection===T.key?"active":""}"
                @click=${()=>e.onSectionChange(T.key)}
              >
                <span class="config-nav__icon"
                  >${Tr(T.key)}</span
                >
                <span class="config-nav__label">${T.label}</span>
              </button>
            `)}
        </nav>

        <!-- Mode toggle at bottom -->
        <div class="config-sidebar__footer">
          <div class="config-mode-toggle">
            <button
              class="config-mode-toggle__btn ${e.formMode==="form"?"active":""}"
              ?disabled=${e.schemaLoading||!e.schema}
              @click=${()=>e.onFormModeChange("form")}
            >
              Form
            </button>
            <button
              class="config-mode-toggle__btn ${e.formMode==="raw"?"active":""}"
              @click=${()=>e.onFormModeChange("raw")}
            >
              Raw
            </button>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <main class="config-main">
        <!-- Action bar -->
        <div class="config-actions">
          <div class="config-actions__left">
            ${A?l`
                  <span class="config-changes-badge"
                    >${e.formMode==="raw"?"Unsaved changes":`${m.length} unsaved change${m.length!==1?"s":""}`}</span
                  >
                `:l`
                    <span class="config-status muted">No changes</span>
                  `}
          </div>
          <div class="config-actions__right">
            <button
              class="btn btn--sm"
              ?disabled=${e.loading}
              @click=${e.onReload}
            >
              ${e.loading?"Loading…":"Reload"}
            </button>
            <button
              class="btn btn--sm primary"
              ?disabled=${!k}
              @click=${e.onSave}
            >
              ${e.saving?"Saving…":"Save"}
            </button>
            <button
              class="btn btn--sm"
              ?disabled=${!S}
              @click=${e.onApply}
            >
              ${e.applying?"Applying…":"Apply"}
            </button>
            <button
              class="btn btn--sm"
              ?disabled=${!E}
              @click=${e.onUpdate}
            >
              ${e.updating?"Updating…":"Update"}
            </button>
          </div>
        </div>

        <!-- Diff panel (form mode only - raw mode doesn't have granular diff) -->
        ${A&&e.formMode==="form"?l`
              <details class="config-diff">
                <summary class="config-diff__summary">
                  <span
                    >View ${m.length} pending
                    change${m.length!==1?"s":""}</span
                  >
                  <svg
                    class="config-diff__chevron"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </summary>
                <div class="config-diff__content">
                  ${m.map(T=>l`
                      <div class="config-diff__item">
                        <div class="config-diff__path">${T.path}</div>
                        <div class="config-diff__values">
                          <span class="config-diff__from"
                            >${_r(T.from)}</span
                          >
                          <span class="config-diff__arrow">→</span>
                          <span class="config-diff__to"
                            >${_r(T.to)}</span
                          >
                        </div>
                      </div>
                    `)}
                </div>
              </details>
            `:v}
        ${g&&e.formMode==="form"?l`
              <div class="config-section-hero">
                <div class="config-section-hero__icon">
                  ${Tr(e.activeSection??"")}
                </div>
                <div class="config-section-hero__text">
                  <div class="config-section-hero__title">
                    ${g.label}
                  </div>
                  ${g.description?l`<div class="config-section-hero__desc">
                        ${g.description}
                      </div>`:v}
                </div>
              </div>
            `:v}
        ${h?l`
              <div class="config-subnav">
                <button
                  class="config-subnav__item ${f===null?"active":""}"
                  @click=${()=>e.onSubsectionChange(Cr)}
                >
                  All
                </button>
                ${p.map(T=>l`
                    <button
                      class="config-subnav__item ${f===T.key?"active":""}"
                      title=${T.description||T.label}
                      @click=${()=>e.onSubsectionChange(T.key)}
                    >
                      ${T.label}
                    </button>
                  `)}
              </div>
            `:v}

        <!-- Form content -->
        <div class="config-content">
          ${e.formMode==="form"?l`
                ${e.schemaLoading?l`
                        <div class="config-loading">
                          <div class="config-loading__spinner"></div>
                          <span>Loading schema…</span>
                        </div>
                      `:Ah({schema:n.schema,uiHints:e.uiHints,value:e.formValue,disabled:e.loading||!e.formValue,unsupportedPaths:n.unsupportedPaths,onPatch:e.onFormPatch,searchQuery:e.searchQuery,activeSection:e.activeSection,activeSubsection:f})}
                ${s?l`
                        <div class="callout danger" style="margin-top: 12px">
                          Form view can't safely edit some fields. Use Raw to avoid losing config entries.
                        </div>
                      `:v}
              `:l`
                <label class="field config-raw-field">
                  <span>Raw JSON5</span>
                  <textarea
                    .value=${e.raw}
                    @input=${T=>e.onRawChange(T.target.value)}
                  ></textarea>
                </label>
              `}
        </div>

        ${e.issues.length>0?l`<div class="callout danger" style="margin-top: 12px;">
              <pre class="code-block">
${JSON.stringify(e.issues,null,2)}</pre
              >
            </div>`:v}
      </main>
    </div>
  `}function Ib(e){const t=["last",...e.channels.filter(Boolean)],n=e.form.deliveryChannel?.trim();n&&!t.includes(n)&&t.push(n);const s=new Set;return t.filter(i=>s.has(i)?!1:(s.add(i),!0))}function Rb(e,t){if(t==="last")return"last";const n=e.channelMeta?.find(s=>s.id===t);return n?.label?n.label:e.channelLabels?.[t]??t}function Pb(e){const t=Ib(e),s=(e.runsJobId==null?void 0:e.jobs.find(r=>r.id===e.runsJobId))?.name??e.runsJobId??"(select a job)",i=e.runs.toSorted((r,c)=>c.ts-r.ts),a=e.form.sessionTarget==="isolated"&&e.form.payloadKind==="agentTurn",o=e.form.deliveryMode==="announce"&&!a?"none":e.form.deliveryMode;return l`
    <section class="grid grid-cols-2">
      <div class="card">
        <div class="card-title">Scheduler</div>
        <div class="card-sub">Gateway-owned cron scheduler status.</div>
        <div class="stat-grid" style="margin-top: 16px;">
          <div class="stat">
            <div class="stat-label">Enabled</div>
            <div class="stat-value">
              ${e.status?e.status.enabled?"Yes":"No":"n/a"}
            </div>
          </div>
          <div class="stat">
            <div class="stat-label">Jobs</div>
            <div class="stat-value">${e.status?.jobs??"n/a"}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Next wake</div>
            <div class="stat-value">${Sa(e.status?.nextWakeAtMs??null)}</div>
          </div>
        </div>
        <div class="row" style="margin-top: 12px;">
          <button class="btn" ?disabled=${e.loading} @click=${e.onRefresh}>
            ${e.loading?"Refreshing…":"Refresh"}
          </button>
          ${e.error?l`<span class="muted">${e.error}</span>`:v}
        </div>
      </div>

      <div class="card">
        <div class="card-title">New Job</div>
        <div class="card-sub">Create a scheduled wakeup or agent run.</div>
        <div class="form-grid" style="margin-top: 16px;">
          <label class="field">
            <span>Name</span>
            <input
              .value=${e.form.name}
              @input=${r=>e.onFormChange({name:r.target.value})}
            />
          </label>
          <label class="field">
            <span>Description</span>
            <input
              .value=${e.form.description}
              @input=${r=>e.onFormChange({description:r.target.value})}
            />
          </label>
          <label class="field">
            <span>Agent ID</span>
            <input
              .value=${e.form.agentId}
              @input=${r=>e.onFormChange({agentId:r.target.value})}
              placeholder="default"
            />
          </label>
          <label class="field checkbox">
            <span>Enabled</span>
            <input
              type="checkbox"
              .checked=${e.form.enabled}
              @change=${r=>e.onFormChange({enabled:r.target.checked})}
            />
          </label>
          <label class="field">
            <span>Schedule</span>
            <select
              .value=${e.form.scheduleKind}
              @change=${r=>e.onFormChange({scheduleKind:r.target.value})}
            >
              <option value="every">Every</option>
              <option value="at">At</option>
              <option value="cron">Cron</option>
            </select>
          </label>
        </div>
        ${Db(e)}
        <div class="form-grid" style="margin-top: 12px;">
          <label class="field">
            <span>Session</span>
            <select
              .value=${e.form.sessionTarget}
              @change=${r=>e.onFormChange({sessionTarget:r.target.value})}
            >
              <option value="main">Main</option>
              <option value="isolated">Isolated</option>
            </select>
          </label>
          <label class="field">
            <span>Wake mode</span>
            <select
              .value=${e.form.wakeMode}
              @change=${r=>e.onFormChange({wakeMode:r.target.value})}
            >
              <option value="now">Now</option>
              <option value="next-heartbeat">Next heartbeat</option>
            </select>
          </label>
          <label class="field">
            <span>Payload</span>
            <select
              .value=${e.form.payloadKind}
              @change=${r=>e.onFormChange({payloadKind:r.target.value})}
            >
              <option value="systemEvent">System event</option>
              <option value="agentTurn">Agent turn</option>
            </select>
          </label>
        </div>
        <label class="field" style="margin-top: 12px;">
          <span>${e.form.payloadKind==="systemEvent"?"System text":"Agent message"}</span>
          <textarea
            .value=${e.form.payloadText}
            @input=${r=>e.onFormChange({payloadText:r.target.value})}
            rows="4"
          ></textarea>
        </label>
        <div class="form-grid" style="margin-top: 12px;">
          <label class="field">
            <span>Delivery</span>
            <select
              .value=${o}
              @change=${r=>e.onFormChange({deliveryMode:r.target.value})}
            >
              ${a?l`
                      <option value="announce">Announce summary (default)</option>
                    `:v}
              <option value="webhook">Webhook POST</option>
              <option value="none">None (internal)</option>
            </select>
          </label>
          ${e.form.payloadKind==="agentTurn"?l`
                  <label class="field">
                    <span>Timeout (seconds)</span>
                    <input
                      .value=${e.form.timeoutSeconds}
                      @input=${r=>e.onFormChange({timeoutSeconds:r.target.value})}
                    />
                  </label>
                `:v}
          ${o!=="none"?l`
                  <label class="field">
                    <span>${o==="webhook"?"Webhook URL":"Channel"}</span>
                    ${o==="webhook"?l`
                            <input
                              .value=${e.form.deliveryTo}
                              @input=${r=>e.onFormChange({deliveryTo:r.target.value})}
                              placeholder="https://example.invalid/cron"
                            />
                          `:l`
                            <select
                              .value=${e.form.deliveryChannel||"last"}
                              @change=${r=>e.onFormChange({deliveryChannel:r.target.value})}
                            >
                              ${t.map(r=>l`<option value=${r}>
                                    ${Rb(e,r)}
                                  </option>`)}
                            </select>
                          `}
                  </label>
                  ${o==="announce"?l`
                          <label class="field">
                            <span>To</span>
                            <input
                              .value=${e.form.deliveryTo}
                              @input=${r=>e.onFormChange({deliveryTo:r.target.value})}
                              placeholder="+1555… or chat id"
                            />
                          </label>
                        `:v}
                `:v}
        </div>
        <div class="row" style="margin-top: 14px;">
          <button class="btn primary" ?disabled=${e.busy} @click=${e.onAdd}>
            ${e.busy?"Saving…":"Add job"}
          </button>
        </div>
      </div>
    </section>

    <section class="card" style="margin-top: 18px;">
      <div class="card-title">Jobs</div>
      <div class="card-sub">All scheduled jobs stored in the gateway.</div>
      ${e.jobs.length===0?l`
              <div class="muted" style="margin-top: 12px">No jobs yet.</div>
            `:l`
            <div class="list" style="margin-top: 12px;">
              ${e.jobs.map(r=>Fb(r,e))}
            </div>
          `}
    </section>

    <section class="card" style="margin-top: 18px;">
      <div class="card-title">Run history</div>
      <div class="card-sub">Latest runs for ${s}.</div>
      ${e.runsJobId==null?l`
              <div class="muted" style="margin-top: 12px">Select a job to inspect run history.</div>
            `:i.length===0?l`
                <div class="muted" style="margin-top: 12px">No runs yet.</div>
              `:l`
              <div class="list" style="margin-top: 12px;">
                ${i.map(r=>Bb(r,e.basePath))}
              </div>
            `}
    </section>
  `}function Db(e){const t=e.form;return t.scheduleKind==="at"?l`
      <label class="field" style="margin-top: 12px;">
        <span>Run at</span>
        <input
          type="datetime-local"
          .value=${t.scheduleAt}
          @input=${n=>e.onFormChange({scheduleAt:n.target.value})}
        />
      </label>
    `:t.scheduleKind==="every"?l`
      <div class="form-grid" style="margin-top: 12px;">
        <label class="field">
          <span>Every</span>
          <input
            .value=${t.everyAmount}
            @input=${n=>e.onFormChange({everyAmount:n.target.value})}
          />
        </label>
        <label class="field">
          <span>Unit</span>
          <select
            .value=${t.everyUnit}
            @change=${n=>e.onFormChange({everyUnit:n.target.value})}
          >
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
        </label>
      </div>
    `:l`
    <div class="form-grid" style="margin-top: 12px;">
      <label class="field">
        <span>Expression</span>
        <input
          .value=${t.cronExpr}
          @input=${n=>e.onFormChange({cronExpr:n.target.value})}
        />
      </label>
      <label class="field">
        <span>Timezone (optional)</span>
        <input
          .value=${t.cronTz}
          @input=${n=>e.onFormChange({cronTz:n.target.value})}
        />
      </label>
    </div>
  `}function Fb(e,t){const s=`list-item list-item-clickable cron-job${t.runsJobId===e.id?" list-item-selected":""}`;return l`
    <div class=${s} @click=${()=>t.onLoadRuns(e.id)}>
      <div class="list-main">
        <div class="list-title">${e.name}</div>
        <div class="list-sub">${Vl(e)}</div>
        ${Nb(e)}
        ${e.agentId?l`<div class="muted cron-job-agent">Agent: ${e.agentId}</div>`:v}
      </div>
      <div class="list-meta">
        ${Ob(e)}
      </div>
      <div class="cron-job-footer">
        <div class="chip-row cron-job-chips">
          <span class=${`chip ${e.enabled?"chip-ok":"chip-danger"}`}>
            ${e.enabled?"enabled":"disabled"}
          </span>
          <span class="chip">${e.sessionTarget}</span>
          <span class="chip">${e.wakeMode}</span>
        </div>
        <div class="row cron-job-actions">
          <button
            class="btn"
            ?disabled=${t.busy}
            @click=${i=>{i.stopPropagation(),t.onToggle(e,!e.enabled)}}
          >
            ${e.enabled?"Disable":"Enable"}
          </button>
          <button
            class="btn"
            ?disabled=${t.busy}
            @click=${i=>{i.stopPropagation(),t.onRun(e)}}
          >
            Run
          </button>
          <button
            class="btn"
            ?disabled=${t.busy}
            @click=${i=>{i.stopPropagation(),t.onLoadRuns(e.id)}}
          >
            History
          </button>
          <button
            class="btn danger"
            ?disabled=${t.busy}
            @click=${i=>{i.stopPropagation(),t.onRemove(e)}}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  `}function Nb(e){if(e.payload.kind==="systemEvent")return l`<div class="cron-job-detail">
      <span class="cron-job-detail-label">System</span>
      <span class="muted cron-job-detail-value">${e.payload.text}</span>
    </div>`;const t=e.delivery,n=t?.mode==="webhook"?t.to?` (${t.to})`:"":t?.channel||t?.to?` (${t.channel??"last"}${t.to?` -> ${t.to}`:""})`:"";return l`
    <div class="cron-job-detail">
      <span class="cron-job-detail-label">Prompt</span>
      <span class="muted cron-job-detail-value">${e.payload.message}</span>
    </div>
    ${t?l`<div class="cron-job-detail">
            <span class="cron-job-detail-label">Delivery</span>
            <span class="muted cron-job-detail-value">${t.mode}${n}</span>
          </div>`:v}
  `}function Er(e){return typeof e!="number"||!Number.isFinite(e)?"n/a":ee(e)}function Ob(e){const t=e.state?.lastStatus??"n/a",n=t==="ok"?"cron-job-status-ok":t==="error"?"cron-job-status-error":t==="skipped"?"cron-job-status-skipped":"cron-job-status-na",s=e.state?.nextRunAtMs,i=e.state?.lastRunAtMs;return l`
    <div class="cron-job-state">
      <div class="cron-job-state-row">
        <span class="cron-job-state-key">Status</span>
        <span class=${`cron-job-status-pill ${n}`}>${t}</span>
      </div>
      <div class="cron-job-state-row">
        <span class="cron-job-state-key">Next</span>
        <span class="cron-job-state-value" title=${Ot(s)}>
          ${Er(s)}
        </span>
      </div>
      <div class="cron-job-state-row">
        <span class="cron-job-state-key">Last</span>
        <span class="cron-job-state-value" title=${Ot(i)}>
          ${Er(i)}
        </span>
      </div>
    </div>
  `}function Bb(e,t){const n=typeof e.sessionKey=="string"&&e.sessionKey.trim().length>0?`${Ls("chat",t)}?session=${encodeURIComponent(e.sessionKey)}`:null;return l`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${e.status}</div>
        <div class="list-sub">${e.summary??""}</div>
      </div>
      <div class="list-meta">
        <div>${Ot(e.ts)}</div>
        <div class="muted">${e.durationMs??0}ms</div>
        ${n?l`<div><a class="session-link" href=${n}>Open run chat</a></div>`:v}
        ${e.error?l`<div class="muted">${e.error}</div>`:v}
      </div>
    </div>
  `}function zb(e){const n=(e.status&&typeof e.status=="object"?e.status.securityAudit:null)?.summary??null,s=n?.critical??0,i=n?.warn??0,a=n?.info??0,o=s>0?"danger":i>0?"warn":"success",r=s>0?`${s} critical`:i>0?`${i} warnings`:"No critical issues";return l`
    <section class="grid grid-cols-2">
      <div class="card">
        <div class="row" style="justify-content: space-between;">
          <div>
            <div class="card-title">Snapshots</div>
            <div class="card-sub">Status, health, and heartbeat data.</div>
          </div>
          <button class="btn" ?disabled=${e.loading} @click=${e.onRefresh}>
            ${e.loading?"Refreshing…":"Refresh"}
          </button>
        </div>
        <div class="stack" style="margin-top: 12px;">
          <div>
            <div class="muted">Status</div>
            ${n?l`<div class="callout ${o}" style="margin-top: 8px;">
                  Security audit: ${r}${a>0?` · ${a} info`:""}. Run
                  <span class="mono">openclaw security audit --deep</span> for details.
                </div>`:v}
            <pre class="code-block">${JSON.stringify(e.status??{},null,2)}</pre>
          </div>
          <div>
            <div class="muted">Health</div>
            <pre class="code-block">${JSON.stringify(e.health??{},null,2)}</pre>
          </div>
          <div>
            <div class="muted">Last heartbeat</div>
            <pre class="code-block">${JSON.stringify(e.heartbeat??{},null,2)}</pre>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Manual RPC</div>
        <div class="card-sub">Send a raw gateway method with JSON params.</div>
        <div class="form-grid" style="margin-top: 16px;">
          <label class="field">
            <span>Method</span>
            <input
              .value=${e.callMethod}
              @input=${c=>e.onCallMethodChange(c.target.value)}
              placeholder="system-presence"
            />
          </label>
          <label class="field">
            <span>Params (JSON)</span>
            <textarea
              .value=${e.callParams}
              @input=${c=>e.onCallParamsChange(c.target.value)}
              rows="6"
            ></textarea>
          </label>
        </div>
        <div class="row" style="margin-top: 12px;">
          <button class="btn primary" @click=${e.onCall}>Call</button>
        </div>
        ${e.callError?l`<div class="callout danger" style="margin-top: 12px;">
              ${e.callError}
            </div>`:v}
        ${e.callResult?l`<pre class="code-block" style="margin-top: 12px;">${e.callResult}</pre>`:v}
      </div>
    </section>

    <section class="card" style="margin-top: 18px;">
      <div class="card-title">Models</div>
      <div class="card-sub">Catalog from models.list.</div>
      <pre class="code-block" style="margin-top: 12px;">${JSON.stringify(e.models??[],null,2)}</pre>
    </section>

    <section class="card" style="margin-top: 18px;">
      <div class="card-title">Event Log</div>
      <div class="card-sub">Latest gateway events.</div>
      ${e.eventLog.length===0?l`
              <div class="muted" style="margin-top: 12px">No events yet.</div>
            `:l`
            <div class="list" style="margin-top: 12px;">
              ${e.eventLog.map(c=>l`
                  <div class="list-item">
                    <div class="list-main">
                      <div class="list-title">${c.event}</div>
                      <div class="list-sub">${new Date(c.ts).toLocaleTimeString()}</div>
                    </div>
                    <div class="list-meta">
                      <pre class="code-block">${Pf(c.payload)}</pre>
                    </div>
                  </div>
                `)}
            </div>
          `}
    </section>
  `}function Ub(e){const t=Math.max(0,e),n=Math.floor(t/1e3);if(n<60)return`${n}s`;const s=Math.floor(n/60);return s<60?`${s}m`:`${Math.floor(s/60)}h`}function _t(e,t){return t?l`<div class="exec-approval-meta-row"><span>${e}</span><span>${t}</span></div>`:v}function Hb(e){const t=e.execApprovalQueue[0];if(!t)return v;const n=t.request,s=t.expiresAtMs-Date.now(),i=s>0?`expires in ${Ub(s)}`:"expired",a=e.execApprovalQueue.length;return l`
    <div class="exec-approval-overlay" role="dialog" aria-live="polite">
      <div class="exec-approval-card">
        <div class="exec-approval-header">
          <div>
            <div class="exec-approval-title">Exec approval needed</div>
            <div class="exec-approval-sub">${i}</div>
          </div>
          ${a>1?l`<div class="exec-approval-queue">${a} pending</div>`:v}
        </div>
        <div class="exec-approval-command mono">${n.command}</div>
        <div class="exec-approval-meta">
          ${_t("Host",n.host)}
          ${_t("Agent",n.agentId)}
          ${_t("Session",n.sessionKey)}
          ${_t("CWD",n.cwd)}
          ${_t("Resolved",n.resolvedPath)}
          ${_t("Security",n.security)}
          ${_t("Ask",n.ask)}
        </div>
        ${e.execApprovalError?l`<div class="exec-approval-error">${e.execApprovalError}</div>`:v}
        <div class="exec-approval-actions">
          <button
            class="btn primary"
            ?disabled=${e.execApprovalBusy}
            @click=${()=>e.handleExecApprovalDecision("allow-once")}
          >
            Allow once
          </button>
          <button
            class="btn"
            ?disabled=${e.execApprovalBusy}
            @click=${()=>e.handleExecApprovalDecision("allow-always")}
          >
            Always allow
          </button>
          <button
            class="btn danger"
            ?disabled=${e.execApprovalBusy}
            @click=${()=>e.handleExecApprovalDecision("deny")}
          >
            Deny
          </button>
        </div>
      </div>
    </div>
  `}function jb(e){const{pendingGatewayUrl:t}=e;return t?l`
    <div class="exec-approval-overlay" role="dialog" aria-modal="true" aria-live="polite">
      <div class="exec-approval-card">
        <div class="exec-approval-header">
          <div>
            <div class="exec-approval-title">Change Gateway URL</div>
            <div class="exec-approval-sub">This will reconnect to a different gateway server</div>
          </div>
        </div>
        <div class="exec-approval-command mono">${t}</div>
        <div class="callout danger" style="margin-top: 12px;">
          Only confirm if you trust this URL. Malicious URLs can compromise your system.
        </div>
        <div class="exec-approval-actions">
          <button
            class="btn primary"
            @click=${()=>e.handleGatewayUrlConfirm()}
          >
            Confirm
          </button>
          <button
            class="btn"
            @click=${()=>e.handleGatewayUrlCancel()}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  `:v}function Kb(e){return l`
    <section class="card">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">Connected Instances</div>
          <div class="card-sub">Presence beacons from the gateway and clients.</div>
        </div>
        <button class="btn" ?disabled=${e.loading} @click=${e.onRefresh}>
          ${e.loading?"Loading…":"Refresh"}
        </button>
      </div>
      ${e.lastError?l`<div class="callout danger" style="margin-top: 12px;">
            ${e.lastError}
          </div>`:v}
      ${e.statusMessage?l`<div class="callout" style="margin-top: 12px;">
            ${e.statusMessage}
          </div>`:v}
      <div class="list" style="margin-top: 16px;">
        ${e.entries.length===0?l`
                <div class="muted">No instances reported yet.</div>
              `:e.entries.map(t=>Wb(t))}
      </div>
    </section>
  `}function Wb(e){const t=e.lastInputSeconds!=null?`${e.lastInputSeconds}s ago`:"n/a",n=e.mode??"unknown",s=Array.isArray(e.roles)?e.roles.filter(Boolean):[],i=Array.isArray(e.scopes)?e.scopes.filter(Boolean):[],a=i.length>0?i.length>3?`${i.length} scopes`:`scopes: ${i.join(", ")}`:null;return l`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${e.host??"unknown host"}</div>
        <div class="list-sub">${Mf(e)}</div>
        <div class="chip-row">
          <span class="chip">${n}</span>
          ${s.map(o=>l`<span class="chip">${o}</span>`)}
          ${a?l`<span class="chip">${a}</span>`:v}
          ${e.platform?l`<span class="chip">${e.platform}</span>`:v}
          ${e.deviceFamily?l`<span class="chip">${e.deviceFamily}</span>`:v}
          ${e.modelIdentifier?l`<span class="chip">${e.modelIdentifier}</span>`:v}
          ${e.version?l`<span class="chip">${e.version}</span>`:v}
        </div>
      </div>
      <div class="list-meta">
        <div>${If(e)}</div>
        <div class="muted">Last input ${t}</div>
        <div class="muted">Reason ${e.reason??""}</div>
      </div>
    </div>
  `}const Lr=["trace","debug","info","warn","error","fatal"];function qb(e){if(!e)return"";const t=new Date(e);return Number.isNaN(t.getTime())?e:t.toLocaleTimeString()}function Vb(e,t){return t?[e.message,e.subsystem,e.raw].filter(Boolean).join(" ").toLowerCase().includes(t):!0}function Gb(e){const t=e.filterText.trim().toLowerCase(),n=Lr.some(a=>!e.levelFilters[a]),s=e.entries.filter(a=>a.level&&!e.levelFilters[a.level]?!1:Vb(a,t)),i=t||n?"filtered":"visible";return l`
    <section class="card">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">Logs</div>
          <div class="card-sub">Gateway file logs (JSONL).</div>
        </div>
        <div class="row" style="gap: 8px;">
          <button class="btn" ?disabled=${e.loading} @click=${e.onRefresh}>
            ${e.loading?"Loading…":"Refresh"}
          </button>
          <button
            class="btn"
            ?disabled=${s.length===0}
            @click=${()=>e.onExport(s.map(a=>a.raw),i)}
          >
            Export ${i}
          </button>
        </div>
      </div>

      <div class="filters" style="margin-top: 14px;">
        <label class="field" style="min-width: 220px;">
          <span>Filter</span>
          <input
            .value=${e.filterText}
            @input=${a=>e.onFilterTextChange(a.target.value)}
            placeholder="Search logs"
          />
        </label>
        <label class="field checkbox">
          <span>Auto-follow</span>
          <input
            type="checkbox"
            .checked=${e.autoFollow}
            @change=${a=>e.onToggleAutoFollow(a.target.checked)}
          />
        </label>
      </div>

      <div class="chip-row" style="margin-top: 12px;">
        ${Lr.map(a=>l`
            <label class="chip log-chip ${a}">
              <input
                type="checkbox"
                .checked=${e.levelFilters[a]}
                @change=${o=>e.onLevelToggle(a,o.target.checked)}
              />
              <span>${a}</span>
            </label>
          `)}
      </div>

      ${e.file?l`<div class="muted" style="margin-top: 10px;">File: ${e.file}</div>`:v}
      ${e.truncated?l`
              <div class="callout" style="margin-top: 10px">Log output truncated; showing latest chunk.</div>
            `:v}
      ${e.error?l`<div class="callout danger" style="margin-top: 10px;">${e.error}</div>`:v}

      <div class="log-stream" style="margin-top: 12px;" @scroll=${e.onScroll}>
        ${s.length===0?l`
                <div class="muted" style="padding: 12px">No log entries.</div>
              `:s.map(a=>l`
                <div class="log-row">
                  <div class="log-time mono">${qb(a.time)}</div>
                  <div class="log-level ${a.level??""}">${a.level??""}</div>
                  <div class="log-subsystem mono">${a.subsystem??""}</div>
                  <div class="log-message mono">${a.message??a.raw}</div>
                </div>
              `)}
      </div>
    </section>
  `}const ht="__defaults__",Mr=[{value:"deny",label:"Deny"},{value:"allowlist",label:"Allowlist"},{value:"full",label:"Full"}],Qb=[{value:"off",label:"Off"},{value:"on-miss",label:"On miss"},{value:"always",label:"Always"}];function Ir(e){return e==="allowlist"||e==="full"||e==="deny"?e:"deny"}function Yb(e){return e==="always"||e==="off"||e==="on-miss"?e:"on-miss"}function Zb(e){const t=e?.defaults??{};return{security:Ir(t.security),ask:Yb(t.ask),askFallback:Ir(t.askFallback??"deny"),autoAllowSkills:!!(t.autoAllowSkills??!1)}}function Jb(e){const t=e?.agents??{},n=Array.isArray(t.list)?t.list:[],s=[];return n.forEach(i=>{if(!i||typeof i!="object")return;const a=i,o=typeof a.id=="string"?a.id.trim():"";if(!o)return;const r=typeof a.name=="string"?a.name.trim():void 0,c=a.default===!0;s.push({id:o,name:r||void 0,isDefault:c})}),s}function Xb(e,t){const n=Jb(e),s=Object.keys(t?.agents??{}),i=new Map;n.forEach(o=>i.set(o.id,o)),s.forEach(o=>{i.has(o)||i.set(o,{id:o})});const a=Array.from(i.values());return a.length===0&&a.push({id:"main",isDefault:!0}),a.sort((o,r)=>{if(o.isDefault&&!r.isDefault)return-1;if(!o.isDefault&&r.isDefault)return 1;const c=o.name?.trim()?o.name:o.id,d=r.name?.trim()?r.name:r.id;return c.localeCompare(d)}),a}function ey(e,t){return e===ht?ht:e&&t.some(n=>n.id===e)?e:ht}function ty(e){const t=e.execApprovalsForm??e.execApprovalsSnapshot?.file??null,n=!!t,s=Zb(t),i=Xb(e.configForm,t),a=ly(e.nodes),o=e.execApprovalsTarget;let r=o==="node"&&e.execApprovalsTargetNodeId?e.execApprovalsTargetNodeId:null;o==="node"&&r&&!a.some(p=>p.id===r)&&(r=null);const c=ey(e.execApprovalsSelectedAgent,i),d=c!==ht?(t?.agents??{})[c]??null:null,g=Array.isArray(d?.allowlist)?d.allowlist??[]:[];return{ready:n,disabled:e.execApprovalsSaving||e.execApprovalsLoading,dirty:e.execApprovalsDirty,loading:e.execApprovalsLoading,saving:e.execApprovalsSaving,form:t,defaults:s,selectedScope:c,selectedAgent:d,agents:i,allowlist:g,target:o,targetNodeId:r,targetNodes:a,onSelectScope:e.onExecApprovalsSelectAgent,onSelectTarget:e.onExecApprovalsTargetChange,onPatch:e.onExecApprovalsPatch,onRemove:e.onExecApprovalsRemove,onLoad:e.onLoadExecApprovals,onSave:e.onSaveExecApprovals}}function ny(e){const t=e.ready,n=e.target!=="node"||!!e.targetNodeId;return l`
    <section class="card">
      <div class="row" style="justify-content: space-between; align-items: center;">
        <div>
          <div class="card-title">Exec approvals</div>
          <div class="card-sub">
            Allowlist and approval policy for <span class="mono">exec host=gateway/node</span>.
          </div>
        </div>
        <button
          class="btn"
          ?disabled=${e.disabled||!e.dirty||!n}
          @click=${e.onSave}
        >
          ${e.saving?"Saving…":"Save"}
        </button>
      </div>

      ${sy(e)}

      ${t?l`
            ${iy(e)}
            ${ay(e)}
            ${e.selectedScope===ht?v:oy(e)}
          `:l`<div class="row" style="margin-top: 12px; gap: 12px;">
            <div class="muted">Load exec approvals to edit allowlists.</div>
            <button class="btn" ?disabled=${e.loading||!n} @click=${e.onLoad}>
              ${e.loading?"Loading…":"Load approvals"}
            </button>
          </div>`}
    </section>
  `}function sy(e){const t=e.targetNodes.length>0,n=e.targetNodeId??"";return l`
    <div class="list" style="margin-top: 12px;">
      <div class="list-item">
        <div class="list-main">
          <div class="list-title">Target</div>
          <div class="list-sub">
            Gateway edits local approvals; node edits the selected node.
          </div>
        </div>
        <div class="list-meta">
          <label class="field">
            <span>Host</span>
            <select
              ?disabled=${e.disabled}
              @change=${s=>{if(s.target.value==="node"){const o=e.targetNodes[0]?.id??null;e.onSelectTarget("node",n||o)}else e.onSelectTarget("gateway",null)}}
            >
              <option value="gateway" ?selected=${e.target==="gateway"}>Gateway</option>
              <option value="node" ?selected=${e.target==="node"}>Node</option>
            </select>
          </label>
          ${e.target==="node"?l`
                <label class="field">
                  <span>Node</span>
                  <select
                    ?disabled=${e.disabled||!t}
                    @change=${s=>{const a=s.target.value.trim();e.onSelectTarget("node",a||null)}}
                  >
                    <option value="" ?selected=${n===""}>Select node</option>
                    ${e.targetNodes.map(s=>l`<option
                          value=${s.id}
                          ?selected=${n===s.id}
                        >
                          ${s.label}
                        </option>`)}
                  </select>
                </label>
              `:v}
        </div>
      </div>
      ${e.target==="node"&&!t?l`
              <div class="muted">No nodes advertise exec approvals yet.</div>
            `:v}
    </div>
  `}function iy(e){return l`
    <div class="row" style="margin-top: 12px; gap: 8px; flex-wrap: wrap;">
      <span class="label">Scope</span>
      <div class="row" style="gap: 8px; flex-wrap: wrap;">
        <button
          class="btn btn--sm ${e.selectedScope===ht?"active":""}"
          @click=${()=>e.onSelectScope(ht)}
        >
          Defaults
        </button>
        ${e.agents.map(t=>{const n=t.name?.trim()?`${t.name} (${t.id})`:t.id;return l`
            <button
              class="btn btn--sm ${e.selectedScope===t.id?"active":""}"
              @click=${()=>e.onSelectScope(t.id)}
            >
              ${n}
            </button>
          `})}
      </div>
    </div>
  `}function ay(e){const t=e.selectedScope===ht,n=e.defaults,s=e.selectedAgent??{},i=t?["defaults"]:["agents",e.selectedScope],a=typeof s.security=="string"?s.security:void 0,o=typeof s.ask=="string"?s.ask:void 0,r=typeof s.askFallback=="string"?s.askFallback:void 0,c=t?n.security:a??"__default__",d=t?n.ask:o??"__default__",g=t?n.askFallback:r??"__default__",p=typeof s.autoAllowSkills=="boolean"?s.autoAllowSkills:void 0,h=p??n.autoAllowSkills,u=p==null;return l`
    <div class="list" style="margin-top: 16px;">
      <div class="list-item">
        <div class="list-main">
          <div class="list-title">Security</div>
          <div class="list-sub">
            ${t?"Default security mode.":`Default: ${n.security}.`}
          </div>
        </div>
        <div class="list-meta">
          <label class="field">
            <span>Mode</span>
            <select
              ?disabled=${e.disabled}
              @change=${f=>{const w=f.target.value;!t&&w==="__default__"?e.onRemove([...i,"security"]):e.onPatch([...i,"security"],w)}}
            >
              ${t?v:l`<option value="__default__" ?selected=${c==="__default__"}>
                    Use default (${n.security})
                  </option>`}
              ${Mr.map(f=>l`<option
                    value=${f.value}
                    ?selected=${c===f.value}
                  >
                    ${f.label}
                  </option>`)}
            </select>
          </label>
        </div>
      </div>

      <div class="list-item">
        <div class="list-main">
          <div class="list-title">Ask</div>
          <div class="list-sub">
            ${t?"Default prompt policy.":`Default: ${n.ask}.`}
          </div>
        </div>
        <div class="list-meta">
          <label class="field">
            <span>Mode</span>
            <select
              ?disabled=${e.disabled}
              @change=${f=>{const w=f.target.value;!t&&w==="__default__"?e.onRemove([...i,"ask"]):e.onPatch([...i,"ask"],w)}}
            >
              ${t?v:l`<option value="__default__" ?selected=${d==="__default__"}>
                    Use default (${n.ask})
                  </option>`}
              ${Qb.map(f=>l`<option
                    value=${f.value}
                    ?selected=${d===f.value}
                  >
                    ${f.label}
                  </option>`)}
            </select>
          </label>
        </div>
      </div>

      <div class="list-item">
        <div class="list-main">
          <div class="list-title">Ask fallback</div>
          <div class="list-sub">
            ${t?"Applied when the UI prompt is unavailable.":`Default: ${n.askFallback}.`}
          </div>
        </div>
        <div class="list-meta">
          <label class="field">
            <span>Fallback</span>
            <select
              ?disabled=${e.disabled}
              @change=${f=>{const w=f.target.value;!t&&w==="__default__"?e.onRemove([...i,"askFallback"]):e.onPatch([...i,"askFallback"],w)}}
            >
              ${t?v:l`<option value="__default__" ?selected=${g==="__default__"}>
                    Use default (${n.askFallback})
                  </option>`}
              ${Mr.map(f=>l`<option
                    value=${f.value}
                    ?selected=${g===f.value}
                  >
                    ${f.label}
                  </option>`)}
            </select>
          </label>
        </div>
      </div>

      <div class="list-item">
        <div class="list-main">
          <div class="list-title">Auto-allow skill CLIs</div>
          <div class="list-sub">
            ${t?"Allow skill executables listed by the Gateway.":u?`Using default (${n.autoAllowSkills?"on":"off"}).`:`Override (${h?"on":"off"}).`}
          </div>
        </div>
        <div class="list-meta">
          <label class="field">
            <span>Enabled</span>
            <input
              type="checkbox"
              ?disabled=${e.disabled}
              .checked=${h}
              @change=${f=>{const m=f.target;e.onPatch([...i,"autoAllowSkills"],m.checked)}}
            />
          </label>
          ${!t&&!u?l`<button
                class="btn btn--sm"
                ?disabled=${e.disabled}
                @click=${()=>e.onRemove([...i,"autoAllowSkills"])}
              >
                Use default
              </button>`:v}
        </div>
      </div>
    </div>
  `}function oy(e){const t=["agents",e.selectedScope,"allowlist"],n=e.allowlist;return l`
    <div class="row" style="margin-top: 18px; justify-content: space-between;">
      <div>
        <div class="card-title">Allowlist</div>
        <div class="card-sub">Case-insensitive glob patterns.</div>
      </div>
      <button
        class="btn btn--sm"
        ?disabled=${e.disabled}
        @click=${()=>{const s=[...n,{pattern:""}];e.onPatch(t,s)}}
      >
        Add pattern
      </button>
    </div>
    <div class="list" style="margin-top: 12px;">
      ${n.length===0?l`
              <div class="muted">No allowlist entries yet.</div>
            `:n.map((s,i)=>ry(e,s,i))}
    </div>
  `}function ry(e,t,n){const s=t.lastUsedAt?ee(t.lastUsedAt):"never",i=t.lastUsedCommand?wi(t.lastUsedCommand,120):null,a=t.lastResolvedPath?wi(t.lastResolvedPath,120):null;return l`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${t.pattern?.trim()?t.pattern:"New pattern"}</div>
        <div class="list-sub">Last used: ${s}</div>
        ${i?l`<div class="list-sub mono">${i}</div>`:v}
        ${a?l`<div class="list-sub mono">${a}</div>`:v}
      </div>
      <div class="list-meta">
        <label class="field">
          <span>Pattern</span>
          <input
            type="text"
            .value=${t.pattern??""}
            ?disabled=${e.disabled}
            @input=${o=>{const r=o.target;e.onPatch(["agents",e.selectedScope,"allowlist",n,"pattern"],r.value)}}
          />
        </label>
        <button
          class="btn btn--sm danger"
          ?disabled=${e.disabled}
          @click=${()=>{if(e.allowlist.length<=1){e.onRemove(["agents",e.selectedScope,"allowlist"]);return}e.onRemove(["agents",e.selectedScope,"allowlist",n])}}
        >
          Remove
        </button>
      </div>
    </div>
  `}function ly(e){const t=[];for(const n of e){if(!(Array.isArray(n.commands)?n.commands:[]).some(r=>String(r)==="system.execApprovals.get"||String(r)==="system.execApprovals.set"))continue;const a=typeof n.nodeId=="string"?n.nodeId.trim():"";if(!a)continue;const o=typeof n.displayName=="string"&&n.displayName.trim()?n.displayName.trim():a;t.push({id:a,label:o===a?a:`${o} · ${a}`})}return t.sort((n,s)=>n.label.localeCompare(s.label)),t}function cy(e){const t=fy(e),n=ty(e);return l`
    ${ny(n)}
    ${hy(t)}
    ${dy(e)}
    <section class="card">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">Nodes</div>
          <div class="card-sub">Paired devices and live links.</div>
        </div>
        <button class="btn" ?disabled=${e.loading} @click=${e.onRefresh}>
          ${e.loading?"Loading…":"Refresh"}
        </button>
      </div>
      <div class="list" style="margin-top: 16px;">
        ${e.nodes.length===0?l`
                <div class="muted">No nodes found.</div>
              `:e.nodes.map(s=>yy(s))}
      </div>
    </section>
  `}function dy(e){const t=e.devicesList??{pending:[],paired:[]},n=Array.isArray(t.pending)?t.pending:[],s=Array.isArray(t.paired)?t.paired:[];return l`
    <section class="card">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">Devices</div>
          <div class="card-sub">Pairing requests + role tokens.</div>
        </div>
        <button class="btn" ?disabled=${e.devicesLoading} @click=${e.onDevicesRefresh}>
          ${e.devicesLoading?"Loading…":"Refresh"}
        </button>
      </div>
      ${e.devicesError?l`<div class="callout danger" style="margin-top: 12px;">${e.devicesError}</div>`:v}
      <div class="list" style="margin-top: 16px;">
        ${n.length>0?l`
              <div class="muted" style="margin-bottom: 8px;">Pending</div>
              ${n.map(i=>uy(i,e))}
            `:v}
        ${s.length>0?l`
              <div class="muted" style="margin-top: 12px; margin-bottom: 8px;">Paired</div>
              ${s.map(i=>gy(i,e))}
            `:v}
        ${n.length===0&&s.length===0?l`
                <div class="muted">No paired devices.</div>
              `:v}
      </div>
    </section>
  `}function uy(e,t){const n=e.displayName?.trim()||e.deviceId,s=typeof e.ts=="number"?ee(e.ts):"n/a",i=e.role?.trim()?`role: ${e.role}`:"role: -",a=e.isRepair?" · repair":"",o=e.remoteIp?` · ${e.remoteIp}`:"";return l`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${n}</div>
        <div class="list-sub">${e.deviceId}${o}</div>
        <div class="muted" style="margin-top: 6px;">
          ${i} · requested ${s}${a}
        </div>
      </div>
      <div class="list-meta">
        <div class="row" style="justify-content: flex-end; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn--sm primary" @click=${()=>t.onDeviceApprove(e.requestId)}>
            Approve
          </button>
          <button class="btn btn--sm" @click=${()=>t.onDeviceReject(e.requestId)}>
            Reject
          </button>
        </div>
      </div>
    </div>
  `}function gy(e,t){const n=e.displayName?.trim()||e.deviceId,s=e.remoteIp?` · ${e.remoteIp}`:"",i=`roles: ${$i(e.roles)}`,a=`scopes: ${$i(e.scopes)}`,o=Array.isArray(e.tokens)?e.tokens:[];return l`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${n}</div>
        <div class="list-sub">${e.deviceId}${s}</div>
        <div class="muted" style="margin-top: 6px;">${i} · ${a}</div>
        ${o.length===0?l`
                <div class="muted" style="margin-top: 6px">Tokens: none</div>
              `:l`
              <div class="muted" style="margin-top: 10px;">Tokens</div>
              <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
                ${o.map(r=>py(e.deviceId,r,t))}
              </div>
            `}
      </div>
    </div>
  `}function py(e,t,n){const s=t.revokedAtMs?"revoked":"active",i=`scopes: ${$i(t.scopes)}`,a=ee(t.rotatedAtMs??t.createdAtMs??t.lastUsedAtMs??null);return l`
    <div class="row" style="justify-content: space-between; gap: 8px;">
      <div class="list-sub">${t.role} · ${s} · ${i} · ${a}</div>
      <div class="row" style="justify-content: flex-end; gap: 6px; flex-wrap: wrap;">
        <button
          class="btn btn--sm"
          @click=${()=>n.onDeviceRotate(e,t.role,t.scopes)}
        >
          Rotate
        </button>
        ${t.revokedAtMs?v:l`
              <button
                class="btn btn--sm danger"
                @click=${()=>n.onDeviceRevoke(e,t.role)}
              >
                Revoke
              </button>
            `}
      </div>
    </div>
  `}function fy(e){const t=e.configForm,n=my(e.nodes),{defaultBinding:s,agents:i}=by(t),a=!!t,o=e.configSaving||e.configFormMode==="raw";return{ready:a,disabled:o,configDirty:e.configDirty,configLoading:e.configLoading,configSaving:e.configSaving,defaultBinding:s,agents:i,nodes:n,onBindDefault:e.onBindDefault,onBindAgent:e.onBindAgent,onSave:e.onSaveBindings,onLoadConfig:e.onLoadConfig,formMode:e.configFormMode}}function hy(e){const t=e.nodes.length>0,n=e.defaultBinding??"";return l`
    <section class="card">
      <div class="row" style="justify-content: space-between; align-items: center;">
        <div>
          <div class="card-title">Exec node binding</div>
          <div class="card-sub">
            Pin agents to a specific node when using <span class="mono">exec host=node</span>.
          </div>
        </div>
        <button
          class="btn"
          ?disabled=${e.disabled||!e.configDirty}
          @click=${e.onSave}
        >
          ${e.configSaving?"Saving…":"Save"}
        </button>
      </div>

      ${e.formMode==="raw"?l`
              <div class="callout warn" style="margin-top: 12px">
                Switch the Config tab to <strong>Form</strong> mode to edit bindings here.
              </div>
            `:v}

      ${e.ready?l`
            <div class="list" style="margin-top: 16px;">
              <div class="list-item">
                <div class="list-main">
                  <div class="list-title">Default binding</div>
                  <div class="list-sub">Used when agents do not override a node binding.</div>
                </div>
                <div class="list-meta">
                  <label class="field">
                    <span>Node</span>
                    <select
                      ?disabled=${e.disabled||!t}
                      @change=${s=>{const a=s.target.value.trim();e.onBindDefault(a||null)}}
                    >
                      <option value="" ?selected=${n===""}>Any node</option>
                      ${e.nodes.map(s=>l`<option
                            value=${s.id}
                            ?selected=${n===s.id}
                          >
                            ${s.label}
                          </option>`)}
                    </select>
                  </label>
                  ${t?v:l`
                          <div class="muted">No nodes with system.run available.</div>
                        `}
                </div>
              </div>

              ${e.agents.length===0?l`
                      <div class="muted">No agents found.</div>
                    `:e.agents.map(s=>vy(s,e))}
            </div>
          `:l`<div class="row" style="margin-top: 12px; gap: 12px;">
            <div class="muted">Load config to edit bindings.</div>
            <button class="btn" ?disabled=${e.configLoading} @click=${e.onLoadConfig}>
              ${e.configLoading?"Loading…":"Load config"}
            </button>
          </div>`}
    </section>
  `}function vy(e,t){const n=e.binding??"__default__",s=e.name?.trim()?`${e.name} (${e.id})`:e.id,i=t.nodes.length>0;return l`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${s}</div>
        <div class="list-sub">
          ${e.isDefault?"default agent":"agent"} ·
          ${n==="__default__"?`uses default (${t.defaultBinding??"any"})`:`override: ${e.binding}`}
        </div>
      </div>
      <div class="list-meta">
        <label class="field">
          <span>Binding</span>
          <select
            ?disabled=${t.disabled||!i}
            @change=${a=>{const r=a.target.value.trim();t.onBindAgent(e.index,r==="__default__"?null:r)}}
          >
            <option value="__default__" ?selected=${n==="__default__"}>
              Use default
            </option>
            ${t.nodes.map(a=>l`<option
                  value=${a.id}
                  ?selected=${n===a.id}
                >
                  ${a.label}
                </option>`)}
          </select>
        </label>
      </div>
    </div>
  `}function my(e){const t=[];for(const n of e){if(!(Array.isArray(n.commands)?n.commands:[]).some(r=>String(r)==="system.run"))continue;const a=typeof n.nodeId=="string"?n.nodeId.trim():"";if(!a)continue;const o=typeof n.displayName=="string"&&n.displayName.trim()?n.displayName.trim():a;t.push({id:a,label:o===a?a:`${o} · ${a}`})}return t.sort((n,s)=>n.label.localeCompare(s.label)),t}function by(e){const t={id:"main",name:void 0,index:0,isDefault:!0,binding:null};if(!e||typeof e!="object")return{defaultBinding:null,agents:[t]};const s=(e.tools??{}).exec??{},i=typeof s.node=="string"&&s.node.trim()?s.node.trim():null,a=e.agents??{},o=Array.isArray(a.list)?a.list:[];if(o.length===0)return{defaultBinding:i,agents:[t]};const r=[];return o.forEach((c,d)=>{if(!c||typeof c!="object")return;const g=c,p=typeof g.id=="string"?g.id.trim():"";if(!p)return;const h=typeof g.name=="string"?g.name.trim():void 0,u=g.default===!0,m=(g.tools??{}).exec??{},w=typeof m.node=="string"&&m.node.trim()?m.node.trim():null;r.push({id:p,name:h||void 0,index:d,isDefault:u,binding:w})}),r.length===0&&r.push(t),{defaultBinding:i,agents:r}}function yy(e){const t=!!e.connected,n=!!e.paired,s=typeof e.displayName=="string"&&e.displayName.trim()||(typeof e.nodeId=="string"?e.nodeId:"unknown"),i=Array.isArray(e.caps)?e.caps:[],a=Array.isArray(e.commands)?e.commands:[];return l`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${s}</div>
        <div class="list-sub">
          ${typeof e.nodeId=="string"?e.nodeId:""}
          ${typeof e.remoteIp=="string"?` · ${e.remoteIp}`:""}
          ${typeof e.version=="string"?` · ${e.version}`:""}
        </div>
        <div class="chip-row" style="margin-top: 6px;">
          <span class="chip">${n?"paired":"unpaired"}</span>
          <span class="chip ${t?"chip-ok":"chip-warn"}">
            ${t?"connected":"offline"}
          </span>
          ${i.slice(0,12).map(o=>l`<span class="chip">${String(o)}</span>`)}
          ${a.slice(0,8).map(o=>l`<span class="chip">${String(o)}</span>`)}
        </div>
      </div>
    </div>
  `}function xy(e){const t=e.hello?.snapshot,n=t?.uptimeMs?aa(t.uptimeMs):P("common.na"),s=t?.policy?.tickIntervalMs?`${t.policy.tickIntervalMs}ms`:P("common.na"),a=t?.authMode==="trusted-proxy",o=(()=>{if(e.connected||!e.lastError)return null;const d=e.lastError.toLowerCase();if(!(d.includes("unauthorized")||d.includes("connect failed")))return null;const p=!!e.settings.token.trim(),h=!!e.password.trim();return!p&&!h?l`
        <div class="muted" style="margin-top: 8px">
          ${P("overview.auth.required")}
          <div style="margin-top: 6px">
            <span class="mono">openclaw dashboard --no-open</span> → tokenized URL<br />
            <span class="mono">openclaw doctor --generate-gateway-token</span> → set token
          </div>
          <div style="margin-top: 6px">
            <a
              class="session-link"
              href="https://docs.openclaw.ai/web/dashboard"
              target="_blank"
              rel="noreferrer"
              title="Control UI auth docs (opens in new tab)"
              >Docs: Control UI auth</a
            >
          </div>
        </div>
      `:l`
      <div class="muted" style="margin-top: 8px">
        ${P("overview.auth.failed",{command:"openclaw dashboard --no-open"})}
        <div style="margin-top: 6px">
          <a
            class="session-link"
            href="https://docs.openclaw.ai/web/dashboard"
            target="_blank"
            rel="noreferrer"
            title="Control UI auth docs (opens in new tab)"
            >Docs: Control UI auth</a
          >
        </div>
      </div>
    `})(),r=(()=>{if(e.connected||!e.lastError||(typeof window<"u"?window.isSecureContext:!0))return null;const g=e.lastError.toLowerCase();return!g.includes("secure context")&&!g.includes("device identity required")?null:l`
      <div class="muted" style="margin-top: 8px">
        ${P("overview.insecure.hint",{url:"http://127.0.0.1:18789"})}
        <div style="margin-top: 6px">
          ${P("overview.insecure.stayHttp",{config:"gateway.controlUi.allowInsecureAuth: true"})}
        </div>
        <div style="margin-top: 6px">
          <a
            class="session-link"
            href="https://docs.openclaw.ai/gateway/tailscale"
            target="_blank"
            rel="noreferrer"
            title="Tailscale Serve docs (opens in new tab)"
            >Docs: Tailscale Serve</a
          >
          <span class="muted"> · </span>
          <a
            class="session-link"
            href="https://docs.openclaw.ai/web/control-ui#insecure-http"
            target="_blank"
            rel="noreferrer"
            title="Insecure HTTP docs (opens in new tab)"
            >Docs: Insecure HTTP</a
          >
        </div>
      </div>
    `})(),c=_n.getLocale();return l`
    <section class="grid grid-cols-2">
      <div class="card">
        <div class="card-title">${P("overview.access.title")}</div>
        <div class="card-sub">${P("overview.access.subtitle")}</div>
        <div class="form-grid" style="margin-top: 16px;">
          <label class="field">
            <span>${P("overview.access.wsUrl")}</span>
            <input
              .value=${e.settings.gatewayUrl}
              @input=${d=>{const g=d.target.value;e.onSettingsChange({...e.settings,gatewayUrl:g})}}
              placeholder="ws://100.x.y.z:18789"
            />
          </label>
          ${a?"":l`
                <label class="field">
                  <span>${P("overview.access.token")}</span>
                  <input
                    .value=${e.settings.token}
                    @input=${d=>{const g=d.target.value;e.onSettingsChange({...e.settings,token:g})}}
                    placeholder="OPENCLAW_GATEWAY_TOKEN"
                  />
                </label>
                <label class="field">
                  <span>${P("overview.access.password")}</span>
                  <input
                    type="password"
                    .value=${e.password}
                    @input=${d=>{const g=d.target.value;e.onPasswordChange(g)}}
                    placeholder="system or shared password"
                  />
                </label>
              `}
          <label class="field">
            <span>${P("overview.access.sessionKey")}</span>
            <input
              .value=${e.settings.sessionKey}
              @input=${d=>{const g=d.target.value;e.onSessionKeyChange(g)}}
            />
          </label>
          <label class="field">
            <span>${P("overview.access.language")}</span>
            <select
              .value=${c}
              @change=${d=>{const g=d.target.value;_n.setLocale(g),e.onSettingsChange({...e.settings,locale:g})}}
            >
              <option value="en">${P("languages.en")}</option>
              <option value="zh-CN">${P("languages.zhCN")}</option>
              <option value="zh-TW">${P("languages.zhTW")}</option>
              <option value="pt-BR">${P("languages.ptBR")}</option>
            </select>
          </label>
        </div>
        <div class="row" style="margin-top: 14px;">
          <button class="btn" @click=${()=>e.onConnect()}>${P("common.connect")}</button>
          <button class="btn" @click=${()=>e.onRefresh()}>${P("common.refresh")}</button>
          <span class="muted">${P(a?"overview.access.trustedProxy":"overview.access.connectHint")}</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title">${P("overview.snapshot.title")}</div>
        <div class="card-sub">${P("overview.snapshot.subtitle")}</div>
        <div class="stat-grid" style="margin-top: 16px;">
          <div class="stat">
            <div class="stat-label">${P("overview.snapshot.status")}</div>
            <div class="stat-value ${e.connected?"ok":"warn"}">
              ${e.connected?P("common.ok"):P("common.offline")}
            </div>
          </div>
          <div class="stat">
            <div class="stat-label">${P("overview.snapshot.uptime")}</div>
            <div class="stat-value">${n}</div>
          </div>
          <div class="stat">
            <div class="stat-label">${P("overview.snapshot.tickInterval")}</div>
            <div class="stat-value">${s}</div>
          </div>
          <div class="stat">
            <div class="stat-label">${P("overview.snapshot.lastChannelsRefresh")}</div>
            <div class="stat-value">
              ${e.lastChannelsRefresh?ee(e.lastChannelsRefresh):P("common.na")}
            </div>
          </div>
        </div>
        ${e.lastError?l`<div class="callout danger" style="margin-top: 14px;">
              <div>${e.lastError}</div>
              ${o??""}
              ${r??""}
            </div>`:l`
                <div class="callout" style="margin-top: 14px">
                  ${P("overview.snapshot.channelsHint")}
                </div>
              `}
      </div>
    </section>

    <section class="grid grid-cols-3" style="margin-top: 18px;">
      <div class="card stat-card">
        <div class="stat-label">${P("overview.stats.instances")}</div>
        <div class="stat-value">${e.presenceCount}</div>
        <div class="muted">${P("overview.stats.instancesHint")}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">${P("overview.stats.sessions")}</div>
        <div class="stat-value">${e.sessionsCount??P("common.na")}</div>
        <div class="muted">${P("overview.stats.sessionsHint")}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">${P("overview.stats.cron")}</div>
        <div class="stat-value">
          ${e.cronEnabled==null?P("common.na"):e.cronEnabled?P("common.enabled"):P("common.disabled")}
        </div>
        <div class="muted">${P("overview.stats.cronNext",{time:Sa(e.cronNext)})}</div>
      </div>
    </section>

    <section class="card" style="margin-top: 18px;">
      <div class="card-title">${P("overview.notes.title")}</div>
      <div class="card-sub">${P("overview.notes.subtitle")}</div>
      <div class="note-grid" style="margin-top: 14px;">
        <div>
          <div class="note-title">${P("overview.notes.tailscaleTitle")}</div>
          <div class="muted">
            ${P("overview.notes.tailscaleText")}
          </div>
        </div>
        <div>
          <div class="note-title">${P("overview.notes.sessionTitle")}</div>
          <div class="muted">${P("overview.notes.sessionText")}</div>
        </div>
        <div>
          <div class="note-title">${P("overview.notes.cronTitle")}</div>
          <div class="muted">${P("overview.notes.cronText")}</div>
        </div>
      </div>
    </section>
  `}const $y=["","off","minimal","low","medium","high","xhigh"],wy=["","off","on"],ky=[{value:"",label:"inherit"},{value:"off",label:"off (explicit)"},{value:"on",label:"on"},{value:"full",label:"full"}],Sy=["","off","on","stream"];function Ay(e){if(!e)return"";const t=e.trim().toLowerCase();return t==="z.ai"||t==="z-ai"?"zai":t}function Mc(e){return Ay(e)==="zai"}function Cy(e){return Mc(e)?wy:$y}function Rr(e,t){return t?e.includes(t)?[...e]:[...e,t]:[...e]}function Ty(e,t){return t?e.some(n=>n.value===t)?[...e]:[...e,{value:t,label:`${t} (custom)`}]:[...e]}function _y(e,t){return!t||!e||e==="off"?e:"on"}function Ey(e,t){return e?t&&e==="on"?"low":e:null}function Ly(e){const t=e.result?.sessions??[];return l`
    <section class="card">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">Sessions</div>
          <div class="card-sub">Active session keys and per-session overrides.</div>
        </div>
        <button class="btn" ?disabled=${e.loading} @click=${e.onRefresh}>
          ${e.loading?"Loading…":"Refresh"}
        </button>
      </div>

      <div class="filters" style="margin-top: 14px;">
        <label class="field">
          <span>Active within (minutes)</span>
          <input
            .value=${e.activeMinutes}
            @input=${n=>e.onFiltersChange({activeMinutes:n.target.value,limit:e.limit,includeGlobal:e.includeGlobal,includeUnknown:e.includeUnknown})}
          />
        </label>
        <label class="field">
          <span>Limit</span>
          <input
            .value=${e.limit}
            @input=${n=>e.onFiltersChange({activeMinutes:e.activeMinutes,limit:n.target.value,includeGlobal:e.includeGlobal,includeUnknown:e.includeUnknown})}
          />
        </label>
        <label class="field checkbox">
          <span>Include global</span>
          <input
            type="checkbox"
            .checked=${e.includeGlobal}
            @change=${n=>e.onFiltersChange({activeMinutes:e.activeMinutes,limit:e.limit,includeGlobal:n.target.checked,includeUnknown:e.includeUnknown})}
          />
        </label>
        <label class="field checkbox">
          <span>Include unknown</span>
          <input
            type="checkbox"
            .checked=${e.includeUnknown}
            @change=${n=>e.onFiltersChange({activeMinutes:e.activeMinutes,limit:e.limit,includeGlobal:e.includeGlobal,includeUnknown:n.target.checked})}
          />
        </label>
      </div>

      ${e.error?l`<div class="callout danger" style="margin-top: 12px;">${e.error}</div>`:v}

      <div class="muted" style="margin-top: 12px;">
        ${e.result?`Store: ${e.result.path}`:""}
      </div>

      <div class="table" style="margin-top: 16px;">
        <div class="table-head">
          <div>Key</div>
          <div>Label</div>
          <div>Kind</div>
          <div>Updated</div>
          <div>Tokens</div>
          <div>Thinking</div>
          <div>Verbose</div>
          <div>Reasoning</div>
          <div>Actions</div>
        </div>
        ${t.length===0?l`
                <div class="muted">No sessions found.</div>
              `:t.map(n=>My(n,e.basePath,e.onPatch,e.onDelete,e.loading))}
      </div>
    </section>
  `}function My(e,t,n,s,i){const a=e.updatedAt?ee(e.updatedAt):"n/a",o=e.thinkingLevel??"",r=Mc(e.modelProvider),c=_y(o,r),d=Rr(Cy(e.modelProvider),c),g=e.verboseLevel??"",p=Ty(ky,g),h=e.reasoningLevel??"",u=Rr(Sy,h),f=typeof e.displayName=="string"&&e.displayName.trim().length>0?e.displayName.trim():null,m=typeof e.label=="string"?e.label.trim():"",w=!!(f&&f!==e.key&&f!==m),A=e.kind!=="global",C=A?`${Ls("chat",t)}?session=${encodeURIComponent(e.key)}`:null;return l`
    <div class="table-row">
      <div class="mono session-key-cell">
        ${A?l`<a href=${C} class="session-link">${e.key}</a>`:e.key}
        ${w?l`<span class="muted session-key-display-name">${f}</span>`:v}
      </div>
      <div>
        <input
          .value=${e.label??""}
          ?disabled=${i}
          placeholder="(optional)"
          @change=${k=>{const S=k.target.value.trim();n(e.key,{label:S||null})}}
        />
      </div>
      <div>${e.kind}</div>
      <div>${a}</div>
      <div>${Rf(e)}</div>
      <div>
        <select
          ?disabled=${i}
          @change=${k=>{const S=k.target.value;n(e.key,{thinkingLevel:Ey(S,r)})}}
        >
          ${d.map(k=>l`<option value=${k} ?selected=${c===k}>
                ${k||"inherit"}
              </option>`)}
        </select>
      </div>
      <div>
        <select
          ?disabled=${i}
          @change=${k=>{const S=k.target.value;n(e.key,{verboseLevel:S||null})}}
        >
          ${p.map(k=>l`<option value=${k.value} ?selected=${g===k.value}>
                ${k.label}
              </option>`)}
        </select>
      </div>
      <div>
        <select
          ?disabled=${i}
          @change=${k=>{const S=k.target.value;n(e.key,{reasoningLevel:S||null})}}
        >
          ${u.map(k=>l`<option value=${k} ?selected=${h===k}>
                ${k||"inherit"}
              </option>`)}
        </select>
      </div>
      <div>
        <button class="btn danger" ?disabled=${i} @click=${()=>s(e.key)}>
          Delete
        </button>
      </div>
    </div>
  `}function Iy(e){const t=e.report?.skills??[],n=e.filter.trim().toLowerCase(),s=n?t.filter(a=>[a.name,a.description,a.source].join(" ").toLowerCase().includes(n)):t,i=Yl(s);return l`
    <section class="card">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">Skills</div>
          <div class="card-sub">Bundled, managed, and workspace skills.</div>
        </div>
        <button class="btn" ?disabled=${e.loading} @click=${e.onRefresh}>
          ${e.loading?"Loading…":"Refresh"}
        </button>
      </div>

      <div class="filters" style="margin-top: 14px;">
        <label class="field" style="flex: 1;">
          <span>Filter</span>
          <input
            .value=${e.filter}
            @input=${a=>e.onFilterChange(a.target.value)}
            placeholder="Search skills"
          />
        </label>
        <div class="muted">${s.length} shown</div>
      </div>

      ${e.error?l`<div class="callout danger" style="margin-top: 12px;">${e.error}</div>`:v}

      ${s.length===0?l`
              <div class="muted" style="margin-top: 16px">No skills found.</div>
            `:l`
            <div class="agent-skills-groups" style="margin-top: 16px;">
              ${i.map(a=>{const o=a.id==="workspace"||a.id==="built-in";return l`
                  <details class="agent-skills-group" ?open=${!o}>
                    <summary class="agent-skills-header">
                      <span>${a.label}</span>
                      <span class="muted">${a.skills.length}</span>
                    </summary>
                    <div class="list skills-grid">
                      ${a.skills.map(r=>Ry(r,e))}
                    </div>
                  </details>
                `})}
            </div>
          `}
    </section>
  `}function Ry(e,t){const n=t.busyKey===e.skillKey,s=t.edits[e.skillKey]??"",i=t.messages[e.skillKey]??null,a=e.install.length>0&&e.missing.bins.length>0,o=!!(e.bundled&&e.source!=="openclaw-bundled"),r=Zl(e),c=Jl(e);return l`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">
          ${e.emoji?`${e.emoji} `:""}${e.name}
        </div>
        <div class="list-sub">${wi(e.description,140)}</div>
        ${Xl({skill:e,showBundledBadge:o})}
        ${r.length>0?l`
              <div class="muted" style="margin-top: 6px;">
                Missing: ${r.join(", ")}
              </div>
            `:v}
        ${c.length>0?l`
              <div class="muted" style="margin-top: 6px;">
                Reason: ${c.join(", ")}
              </div>
            `:v}
      </div>
      <div class="list-meta">
        <div class="row" style="justify-content: flex-end; flex-wrap: wrap;">
          <button
            class="btn"
            ?disabled=${n}
            @click=${()=>t.onToggle(e.skillKey,e.disabled)}
          >
            ${e.disabled?"Enable":"Disable"}
          </button>
          ${a?l`<button
                class="btn"
                ?disabled=${n}
                @click=${()=>t.onInstall(e.skillKey,e.name,e.install[0].id)}
              >
                ${n?"Installing…":e.install[0].label}
              </button>`:v}
        </div>
        ${i?l`<div
              class="muted"
              style="margin-top: 8px; color: ${i.kind==="error"?"var(--danger-color, #d14343)":"var(--success-color, #0a7f5a)"};"
            >
              ${i.message}
            </div>`:v}
        ${e.primaryEnv?l`
              <div class="field" style="margin-top: 10px;">
                <span>API key</span>
                <input
                  type="password"
                  .value=${s}
                  @input=${d=>t.onEdit(e.skillKey,d.target.value)}
                />
              </div>
              <button
                class="btn primary"
                style="margin-top: 8px;"
                ?disabled=${n}
                @click=${()=>t.onSaveKey(e.skillKey)}
              >
                Save key
              </button>
            `:v}
      </div>
    </div>
  `}const Py=/^data:/i,Dy=/^https?:\/\//i;function Fy(e){const t=e.agentsList?.agents??[],s=Yr(e.sessionKey)?.agentId??e.agentsList?.defaultId??"main",a=t.find(r=>r.id===s)?.identity,o=a?.avatarUrl??a?.avatar;if(o)return Py.test(o)||Dy.test(o)?o:a?.avatarUrl}function Ny(e){const t=e.presenceEntries.length,n=e.sessionsResult?.count??null,s=e.cronStatus?.nextWakeAtMs??null,i=e.connected?null:P("chat.disconnected"),a=e.tab==="chat",o=a&&(e.settings.chatFocusMode||e.onboarding),r=e.onboarding?!1:e.settings.chatShowThinking,c=Fy(e),d=e.chatAvatarUrl??c??null,g=e.configForm??e.configSnapshot?.config,p=sn(e.basePath??""),h=e.agentsSelectedId??e.agentsList?.defaultId??e.agentsList?.agents?.[0]?.id??null;return l`
    <div class="shell ${a?"shell--chat":""} ${o?"shell--chat-focus":""} ${e.settings.navCollapsed?"shell--nav-collapsed":""} ${e.onboarding?"shell--onboarding":""}">
      <header class="topbar">
        <div class="topbar-left">
          <button
            class="nav-collapse-toggle"
            @click=${()=>e.applySettings({...e.settings,navCollapsed:!e.settings.navCollapsed})}
            title="${e.settings.navCollapsed?P("nav.expand"):P("nav.collapse")}"
            aria-label="${e.settings.navCollapsed?P("nav.expand"):P("nav.collapse")}"
          >
            <span class="nav-collapse-toggle__icon">${se.menu}</span>
          </button>
          <div class="brand">
            <div class="brand-logo">
              <img src=${p?`${p}/favicon.svg`:"/favicon.svg"} alt="OpenClaw" />
            </div>
            <div class="brand-text">
              <div class="brand-title">OPENCLAW</div>
              <div class="brand-sub">Gateway Dashboard</div>
            </div>
          </div>
        </div>
        <div class="topbar-status">
          <div class="pill">
            <span class="statusDot ${e.connected?"ok":""}"></span>
            <span>${P("common.health")}</span>
            <span class="mono">${e.connected?P("common.ok"):P("common.offline")}</span>
          </div>
          ${Af(e)}
        </div>
      </header>
      <aside class="nav ${e.settings.navCollapsed?"nav--collapsed":""}">
        ${Xu.map(u=>{const f=e.settings.navGroupsCollapsed[u.label]??!1,m=u.tabs.some(w=>w===e.tab);return l`
            <div class="nav-group ${f&&!m?"nav-group--collapsed":""}">
              <button
                class="nav-label"
                @click=${()=>{const w={...e.settings.navGroupsCollapsed};w[u.label]=!f,e.applySettings({...e.settings,navGroupsCollapsed:w})}}
                aria-expanded=${!f}
              >
                <span class="nav-label__text">${P(`nav.${u.label}`)}</span>
                <span class="nav-label__chevron">${f?"+":"−"}</span>
              </button>
              <div class="nav-group__items">
                ${u.tabs.map(w=>bf(e,w))}
              </div>
            </div>
          `})}
        <div class="nav-group nav-group--links">
          <div class="nav-label nav-label--static">
            <span class="nav-label__text">${P("common.resources")}</span>
          </div>
          <div class="nav-group__items">
            <a
              class="nav-item nav-item--external"
              href="https://docs.openclaw.ai"
              target="_blank"
              rel="noreferrer"
              title="${P("common.docs")} (opens in new tab)"
            >
              <span class="nav-item__icon" aria-hidden="true">${se.book}</span>
              <span class="nav-item__text">${P("common.docs")}</span>
            </a>
          </div>
        </div>
      </aside>
      <main class="content ${a?"content--chat":""}">
        <section class="content-header">
          <div>
            ${e.tab==="usage"?v:l`<div class="page-title">${Ti(e.tab)}</div>`}
            ${e.tab==="usage"?v:l`<div class="page-sub">${ng(e.tab)}</div>`}
          </div>
          <div class="page-meta">
            ${e.lastError?l`<div class="pill danger">${e.lastError}</div>`:v}
            ${a?yf(e):v}
          </div>
        </section>

        ${e.tab==="overview"?xy({connected:e.connected,hello:e.hello,settings:e.settings,password:e.password,lastError:e.lastError,presenceCount:t,sessionsCount:n,cronEnabled:e.cronStatus?.enabled??null,cronNext:s,lastChannelsRefresh:e.channelsLastSuccess,onSettingsChange:u=>e.applySettings(u),onPasswordChange:u=>e.password=u,onSessionKeyChange:u=>{e.sessionKey=u,e.chatMessage="",e.resetToolStream(),e.applySettings({...e.settings,sessionKey:u,lastActiveSessionKey:u}),e.loadAssistantIdentity()},onConnect:()=>e.connect(),onRefresh:()=>e.loadOverview()}):v}

        ${e.tab==="channels"?Wh({connected:e.connected,loading:e.channelsLoading,snapshot:e.channelsSnapshot,lastError:e.channelsError,lastSuccessAt:e.channelsLastSuccess,whatsappMessage:e.whatsappLoginMessage,whatsappQrDataUrl:e.whatsappLoginQrDataUrl,whatsappConnected:e.whatsappLoginConnected,whatsappBusy:e.whatsappBusy,configSchema:e.configSchema,configSchemaLoading:e.configSchemaLoading,configForm:e.configForm,configUiHints:e.configUiHints,configSaving:e.configSaving,configFormDirty:e.configFormDirty,nostrProfileFormState:e.nostrProfileFormState,nostrProfileAccountId:e.nostrProfileAccountId,onRefresh:u=>Te(e,u),onWhatsAppStart:u=>e.handleWhatsAppStart(u),onWhatsAppWait:()=>e.handleWhatsAppWait(),onWhatsAppLogout:()=>e.handleWhatsAppLogout(),onConfigPatch:(u,f)=>Ee(e,u,f),onConfigSave:()=>e.handleChannelConfigSave(),onConfigReload:()=>e.handleChannelConfigReload(),onNostrProfileEdit:(u,f)=>e.handleNostrProfileEdit(u,f),onNostrProfileCancel:()=>e.handleNostrProfileCancel(),onNostrProfileFieldChange:(u,f)=>e.handleNostrProfileFieldChange(u,f),onNostrProfileSave:()=>e.handleNostrProfileSave(),onNostrProfileImport:()=>e.handleNostrProfileImport(),onNostrProfileToggleAdvanced:()=>e.handleNostrProfileToggleAdvanced()}):v}

        ${e.tab==="instances"?Kb({loading:e.presenceLoading,entries:e.presenceEntries,lastError:e.presenceError,statusMessage:e.presenceStatus,onRefresh:()=>pa(e)}):v}

        ${e.tab==="sessions"?Ly({loading:e.sessionsLoading,result:e.sessionsResult,error:e.sessionsError,activeMinutes:e.sessionsFilterActive,limit:e.sessionsFilterLimit,includeGlobal:e.sessionsIncludeGlobal,includeUnknown:e.sessionsIncludeUnknown,basePath:e.basePath,onFiltersChange:u=>{e.sessionsFilterActive=u.activeMinutes,e.sessionsFilterLimit=u.limit,e.sessionsIncludeGlobal=u.includeGlobal,e.sessionsIncludeUnknown=u.includeUnknown},onRefresh:()=>Ht(e),onPatch:(u,f)=>qu(e,u,f),onDelete:u=>Gu(e,u)}):v}

        ${df(e)}

        ${e.tab==="cron"?Pb({basePath:e.basePath,loading:e.cronLoading,status:e.cronStatus,jobs:e.cronJobs,error:e.cronError,busy:e.cronBusy,form:e.cronForm,channels:e.channelsSnapshot?.channelMeta?.length?e.channelsSnapshot.channelMeta.map(u=>u.id):e.channelsSnapshot?.channelOrder??[],channelLabels:e.channelsSnapshot?.channelLabels??{},channelMeta:e.channelsSnapshot?.channelMeta??[],runsJobId:e.cronRunsJobId,runs:e.cronRuns,onFormChange:u=>e.cronForm=tl({...e.cronForm,...u}),onRefresh:()=>e.loadCron(),onAdd:()=>au(e),onToggle:(u,f)=>ou(e,u,f),onRun:u=>ru(e,u),onRemove:u=>lu(e,u),onLoadRuns:u=>nl(e,u)}):v}

        ${e.tab==="agents"?ph({loading:e.agentsLoading,error:e.agentsError,agentsList:e.agentsList,selectedAgentId:h,activePanel:e.agentsPanel,configForm:g,configLoading:e.configLoading,configSaving:e.configSaving,configDirty:e.configFormDirty,channelsLoading:e.channelsLoading,channelsError:e.channelsError,channelsSnapshot:e.channelsSnapshot,channelsLastSuccess:e.channelsLastSuccess,cronLoading:e.cronLoading,cronStatus:e.cronStatus,cronJobs:e.cronJobs,cronError:e.cronError,agentFilesLoading:e.agentFilesLoading,agentFilesError:e.agentFilesError,agentFilesList:e.agentFilesList,agentFileActive:e.agentFileActive,agentFileContents:e.agentFileContents,agentFileDrafts:e.agentFileDrafts,agentFileSaving:e.agentFileSaving,agentIdentityLoading:e.agentIdentityLoading,agentIdentityError:e.agentIdentityError,agentIdentityById:e.agentIdentityById,agentSkillsLoading:e.agentSkillsLoading,agentSkillsReport:e.agentSkillsReport,agentSkillsError:e.agentSkillsError,agentSkillsAgentId:e.agentSkillsAgentId,skillsFilter:e.skillsFilter,onRefresh:async()=>{await sa(e);const u=e.agentsList?.agents?.map(f=>f.id)??[];u.length>0&&Xr(e,u)},onSelectAgent:u=>{e.agentsSelectedId!==u&&(e.agentsSelectedId=u,e.agentFilesList=null,e.agentFilesError=null,e.agentFilesLoading=!1,e.agentFileActive=null,e.agentFileContents={},e.agentFileDrafts={},e.agentSkillsReport=null,e.agentSkillsError=null,e.agentSkillsAgentId=null,Jr(e,u),e.agentsPanel==="files"&&di(e,u),e.agentsPanel==="skills"&&ss(e,u))},onSelectPanel:u=>{e.agentsPanel=u,u==="files"&&h&&e.agentFilesList?.agentId!==h&&(e.agentFilesList=null,e.agentFilesError=null,e.agentFileActive=null,e.agentFileContents={},e.agentFileDrafts={},di(e,h)),u==="skills"&&h&&ss(e,h),u==="channels"&&Te(e,!1),u==="cron"&&e.loadCron()},onLoadFiles:u=>di(e,u),onSelectFile:u=>{e.agentFileActive=u,h&&Ef(e,h,u)},onFileDraftChange:(u,f)=>{e.agentFileDrafts={...e.agentFileDrafts,[u]:f}},onFileReset:u=>{const f=e.agentFileContents[u]??"";e.agentFileDrafts={...e.agentFileDrafts,[u]:f}},onFileSave:u=>{if(!h)return;const f=e.agentFileDrafts[u]??e.agentFileContents[u]??"";Lf(e,h,u,f)},onToolsProfileChange:(u,f,m)=>{if(!g)return;const w=g.agents?.list;if(!Array.isArray(w))return;const A=w.findIndex(k=>k&&typeof k=="object"&&"id"in k&&k.id===u);if(A<0)return;const C=["agents","list",A,"tools"];f?Ee(e,[...C,"profile"],f):et(e,[...C,"profile"]),m&&et(e,[...C,"allow"])},onToolsOverridesChange:(u,f,m)=>{if(!g)return;const w=g.agents?.list;if(!Array.isArray(w))return;const A=w.findIndex(k=>k&&typeof k=="object"&&"id"in k&&k.id===u);if(A<0)return;const C=["agents","list",A,"tools"];f.length>0?Ee(e,[...C,"alsoAllow"],f):et(e,[...C,"alsoAllow"]),m.length>0?Ee(e,[...C,"deny"],m):et(e,[...C,"deny"])},onConfigReload:()=>Be(e),onConfigSave:()=>ns(e),onChannelsRefresh:()=>Te(e,!1),onCronRefresh:()=>e.loadCron(),onSkillsFilterChange:u=>e.skillsFilter=u,onSkillsRefresh:()=>{h&&ss(e,h)},onAgentSkillToggle:(u,f,m)=>{if(!g)return;const w=g.agents?.list;if(!Array.isArray(w))return;const A=w.findIndex(H=>H&&typeof H=="object"&&"id"in H&&H.id===u);if(A<0)return;const C=w[A],k=f.trim();if(!k)return;const S=e.agentSkillsReport?.skills?.map(H=>H.name).filter(Boolean)??[],T=(Array.isArray(C.skills)?C.skills.map(H=>String(H).trim()).filter(Boolean):void 0)??S,I=new Set(T);m?I.add(k):I.delete(k),Ee(e,["agents","list",A,"skills"],[...I])},onAgentSkillsClear:u=>{if(!g)return;const f=g.agents?.list;if(!Array.isArray(f))return;const m=f.findIndex(w=>w&&typeof w=="object"&&"id"in w&&w.id===u);m<0||et(e,["agents","list",m,"skills"])},onAgentSkillsDisableAll:u=>{if(!g)return;const f=g.agents?.list;if(!Array.isArray(f))return;const m=f.findIndex(w=>w&&typeof w=="object"&&"id"in w&&w.id===u);m<0||Ee(e,["agents","list",m,"skills"],[])},onModelChange:(u,f)=>{if(!g)return;const m=g.agents?.list;if(!Array.isArray(m))return;const w=m.findIndex(S=>S&&typeof S=="object"&&"id"in S&&S.id===u);if(w<0)return;const A=["agents","list",w,"model"];if(!f){et(e,A);return}const k=m[w]?.model;if(k&&typeof k=="object"&&!Array.isArray(k)){const S=k.fallbacks,E={primary:f,...Array.isArray(S)?{fallbacks:S}:{}};Ee(e,A,E)}else Ee(e,A,f)},onModelFallbacksChange:(u,f)=>{if(!g)return;const m=g.agents?.list;if(!Array.isArray(m))return;const w=m.findIndex(H=>H&&typeof H=="object"&&"id"in H&&H.id===u);if(w<0)return;const A=["agents","list",w,"model"],C=m[w],k=f.map(H=>H.trim()).filter(Boolean),S=C.model,T=(()=>{if(typeof S=="string")return S.trim()||null;if(S&&typeof S=="object"&&!Array.isArray(S)){const H=S.primary;if(typeof H=="string")return H.trim()||null}return null})();if(k.length===0){T?Ee(e,A,T):et(e,A);return}Ee(e,A,T?{primary:T,fallbacks:k}:{fallbacks:k})}}):v}

        ${e.tab==="skills"?Iy({loading:e.skillsLoading,report:e.skillsReport,error:e.skillsError,filter:e.skillsFilter,edits:e.skillEdits,messages:e.skillMessages,busyKey:e.skillsBusyKey,onFilterChange:u=>e.skillsFilter=u,onRefresh:()=>Dn(e,{clearMessages:!0}),onToggle:(u,f)=>Yu(e,u,f),onEdit:(u,f)=>Qu(e,u,f),onSaveKey:u=>Zu(e,u),onInstall:(u,f,m)=>Ju(e,u,f,m)}):v}

        ${e.tab==="nodes"?cy({loading:e.nodesLoading,nodes:e.nodes,devicesLoading:e.devicesLoading,devicesError:e.devicesError,devicesList:e.devicesList,configForm:e.configForm??e.configSnapshot?.config,configLoading:e.configLoading,configSaving:e.configSaving,configDirty:e.configFormDirty,configFormMode:e.configFormMode,execApprovalsLoading:e.execApprovalsLoading,execApprovalsSaving:e.execApprovalsSaving,execApprovalsDirty:e.execApprovalsDirty,execApprovalsSnapshot:e.execApprovalsSnapshot,execApprovalsForm:e.execApprovalsForm,execApprovalsSelectedAgent:e.execApprovalsSelectedAgent,execApprovalsTarget:e.execApprovalsTarget,execApprovalsTargetNodeId:e.execApprovalsTargetNodeId,onRefresh:()=>Cs(e),onDevicesRefresh:()=>xt(e),onDeviceApprove:u=>Fu(e,u),onDeviceReject:u=>Nu(e,u),onDeviceRotate:(u,f,m)=>Ou(e,{deviceId:u,role:f,scopes:m}),onDeviceRevoke:(u,f)=>Bu(e,{deviceId:u,role:f}),onLoadConfig:()=>Be(e),onLoadExecApprovals:()=>{const u=e.execApprovalsTarget==="node"&&e.execApprovalsTargetNodeId?{kind:"node",nodeId:e.execApprovalsTargetNodeId}:{kind:"gateway"};return ga(e,u)},onBindDefault:u=>{u?Ee(e,["tools","exec","node"],u):et(e,["tools","exec","node"])},onBindAgent:(u,f)=>{const m=["agents","list",u,"tools","exec","node"];f?Ee(e,m,f):et(e,m)},onSaveBindings:()=>ns(e),onExecApprovalsTargetChange:(u,f)=>{e.execApprovalsTarget=u,e.execApprovalsTargetNodeId=f,e.execApprovalsSnapshot=null,e.execApprovalsForm=null,e.execApprovalsDirty=!1,e.execApprovalsSelectedAgent=null},onExecApprovalsSelectAgent:u=>{e.execApprovalsSelectedAgent=u},onExecApprovalsPatch:(u,f)=>Ku(e,u,f),onExecApprovalsRemove:u=>Wu(e,u),onSaveExecApprovals:()=>{const u=e.execApprovalsTarget==="node"&&e.execApprovalsTargetNodeId?{kind:"node",nodeId:e.execApprovalsTargetNodeId}:{kind:"gateway"};return ju(e,u)}}):v}

        ${e.tab==="chat"?Ab({sessionKey:e.sessionKey,onSessionKeyChange:u=>{e.sessionKey=u,e.chatMessage="",e.chatAttachments=[],e.chatStream=null,e.chatStreamStartedAt=null,e.chatRunId=null,e.chatQueue=[],e.resetToolStream(),e.resetChatScroll(),e.applySettings({...e.settings,sessionKey:u,lastActiveSessionKey:u}),e.loadAssistantIdentity(),Xt(e),as(e)},thinkingLevel:e.chatThinkingLevel,showThinking:r,loading:e.chatLoading,sending:e.chatSending,compactionStatus:e.compactionStatus,assistantAvatarUrl:d,messages:e.chatMessages,toolMessages:e.chatToolMessages,stream:e.chatStream,streamStartedAt:e.chatStreamStartedAt,draft:e.chatMessage,queue:e.chatQueue,connected:e.connected,canSend:e.connected,disabledReason:i,error:e.lastError,sessions:e.sessionsResult,focusMode:o,onRefresh:()=>(e.resetToolStream(),Promise.all([Xt(e),as(e)])),onToggleFocusMode:()=>{e.onboarding||e.applySettings({...e.settings,chatFocusMode:!e.settings.chatFocusMode})},onChatScroll:u=>e.handleChatScroll(u),onDraftChange:u=>e.chatMessage=u,attachments:e.chatAttachments,onAttachmentsChange:u=>e.chatAttachments=u,onSend:()=>e.handleSendChat(),canAbort:!!e.chatRunId,onAbort:()=>{e.handleAbortChat()},onQueueRemove:u=>e.removeQueuedMessage(u),onNewSession:()=>e.handleSendChat("/new",{restoreDraft:!0}),showNewMessages:e.chatNewMessagesBelow&&!e.chatManualRefreshInFlight,onScrollToBottom:()=>e.scrollToBottom(),sidebarOpen:e.sidebarOpen,sidebarContent:e.sidebarContent,sidebarError:e.sidebarError,splitRatio:e.splitRatio,onOpenSidebar:u=>e.handleOpenSidebar(u),onCloseSidebar:()=>e.handleCloseSidebar(),onSplitRatioChange:u=>e.handleSplitRatioChange(u),assistantName:e.assistantName,assistantAvatar:e.assistantAvatar,agentsList:e.agentsList,onSelectAgent:u=>{const f=e.agentsList?.defaultId??"main",m=u===f?"":`agent:${u}:`,w=m?`${m}webchat:main`:"webchat:main";e.sessionKey=w,e.chatMessage="",e.chatAttachments=[],e.chatStream=null,e.chatStreamStartedAt=null,e.chatRunId=null,e.chatQueue=[],e.resetToolStream(),e.resetChatScroll(),e.applySettings({...e.settings,sessionKey:w,lastActiveSessionKey:w}),e.loadAssistantIdentity(),Xt(e),as(e)}}):v}

        ${e.tab==="config"?Mb({raw:e.configRaw,originalRaw:e.configRawOriginal,valid:e.configValid,issues:e.configIssues,loading:e.configLoading,saving:e.configSaving,applying:e.configApplying,updating:e.updateRunning,connected:e.connected,schema:e.configSchema,schemaLoading:e.configSchemaLoading,uiHints:e.configUiHints,formMode:e.configFormMode,formValue:e.configForm,originalValue:e.configFormOriginal,searchQuery:e.configSearchQuery,activeSection:e.configActiveSection,activeSubsection:e.configActiveSubsection,onRawChange:u=>{e.configRaw=u},onFormModeChange:u=>e.configFormMode=u,onFormPatch:(u,f)=>Ee(e,u,f),onSearchChange:u=>e.configSearchQuery=u,onSectionChange:u=>{e.configActiveSection=u,e.configActiveSubsection=null},onSubsectionChange:u=>e.configActiveSubsection=u,onReload:()=>Be(e),onSave:()=>ns(e),onApply:()=>kd(e),onUpdate:()=>Sd(e)}):v}

        ${e.tab==="debug"?zb({loading:e.debugLoading,status:e.debugStatus,health:e.debugHealth,models:e.debugModels,heartbeat:e.debugHeartbeat,eventLog:e.eventLog,callMethod:e.debugCallMethod,callParams:e.debugCallParams,callResult:e.debugCallResult,callError:e.debugCallError,onCallMethodChange:u=>e.debugCallMethod=u,onCallParamsChange:u=>e.debugCallParams=u,onRefresh:()=>As(e),onCall:()=>Wd(e)}):v}

        ${e.tab==="logs"?Gb({loading:e.logsLoading,error:e.logsError,file:e.logsFile,entries:e.logsEntries,filterText:e.logsFilterText,levelFilters:e.logsLevelFilters,autoFollow:e.logsAutoFollow,truncated:e.logsTruncated,onFilterTextChange:u=>e.logsFilterText=u,onLevelToggle:(u,f)=>{e.logsLevelFilters={...e.logsLevelFilters,[u]:f}},onToggleAutoFollow:u=>e.logsAutoFollow=u,onRefresh:()=>Ji(e,{reset:!0}),onExport:(u,f)=>e.exportLogs(u,f),onScroll:u=>e.handleLogsScroll(u)}):v}
      </main>
      ${Hb(e)}
      ${jb(e)}
    </div>
  `}var Oy=Object.defineProperty,By=Object.getOwnPropertyDescriptor,x=(e,t,n,s)=>{for(var i=s>1?void 0:s?By(t,n):t,a=e.length-1,o;a>=0;a--)(o=e[a])&&(i=(s?o(t,n,i):o(i))||i);return s&&i&&Oy(t,n,i),i};const yi=ma({});function zy(){if(!window.location.search)return!1;const t=new URLSearchParams(window.location.search).get("onboarding");if(!t)return!1;const n=t.trim().toLowerCase();return n==="1"||n==="true"||n==="yes"||n==="on"}let y=class extends Jt{constructor(){super(),this.i18nController=new vd(this),this.settings=sg(),this.password="",this.tab="chat",this.onboarding=zy(),this.connected=!1,this.theme=this.settings.theme??"system",this.themeResolved="dark",this.hello=null,this.lastError=null,this.eventLog=[],this.eventLogBuffer=[],this.toolStreamSyncTimer=null,this.sidebarCloseTimer=null,this.assistantName=yi.name,this.assistantAvatar=yi.avatar,this.assistantAgentId=yi.agentId??null,this.sessionKey=this.settings.sessionKey,this.chatLoading=!1,this.chatSending=!1,this.chatMessage="",this.chatMessages=[],this.chatToolMessages=[],this.chatStream=null,this.chatStreamStartedAt=null,this.chatRunId=null,this.compactionStatus=null,this.chatAvatarUrl=null,this.chatThinkingLevel=null,this.chatQueue=[],this.chatAttachments=[],this.chatManualRefreshInFlight=!1,this.sidebarOpen=!1,this.sidebarContent=null,this.sidebarError=null,this.splitRatio=this.settings.splitRatio,this.nodesLoading=!1,this.nodes=[],this.devicesLoading=!1,this.devicesError=null,this.devicesList=null,this.execApprovalsLoading=!1,this.execApprovalsSaving=!1,this.execApprovalsDirty=!1,this.execApprovalsSnapshot=null,this.execApprovalsForm=null,this.execApprovalsSelectedAgent=null,this.execApprovalsTarget="gateway",this.execApprovalsTargetNodeId=null,this.execApprovalQueue=[],this.execApprovalBusy=!1,this.execApprovalError=null,this.pendingGatewayUrl=null,this.configLoading=!1,this.configRaw=`{
}
`,this.configRawOriginal="",this.configValid=null,this.configIssues=[],this.configSaving=!1,this.configApplying=!1,this.updateRunning=!1,this.applySessionKey=this.settings.lastActiveSessionKey,this.configSnapshot=null,this.configSchema=null,this.configSchemaVersion=null,this.configSchemaLoading=!1,this.configUiHints={},this.configForm=null,this.configFormOriginal=null,this.configFormDirty=!1,this.configFormMode="form",this.configSearchQuery="",this.configActiveSection=null,this.configActiveSubsection=null,this.channelsLoading=!1,this.channelsSnapshot=null,this.channelsError=null,this.channelsLastSuccess=null,this.whatsappLoginMessage=null,this.whatsappLoginQrDataUrl=null,this.whatsappLoginConnected=null,this.whatsappBusy=!1,this.nostrProfileFormState=null,this.nostrProfileAccountId=null,this.presenceLoading=!1,this.presenceEntries=[],this.presenceError=null,this.presenceStatus=null,this.agentsLoading=!1,this.agentsList=null,this.agentsError=null,this.agentsSelectedId=null,this.agentsPanel="overview",this.agentFilesLoading=!1,this.agentFilesError=null,this.agentFilesList=null,this.agentFileContents={},this.agentFileDrafts={},this.agentFileActive=null,this.agentFileSaving=!1,this.agentIdentityLoading=!1,this.agentIdentityError=null,this.agentIdentityById={},this.agentSkillsLoading=!1,this.agentSkillsError=null,this.agentSkillsReport=null,this.agentSkillsAgentId=null,this.sessionsLoading=!1,this.sessionsResult=null,this.sessionsError=null,this.sessionsFilterActive="",this.sessionsFilterLimit="120",this.sessionsIncludeGlobal=!0,this.sessionsIncludeUnknown=!1,this.usageLoading=!1,this.usageResult=null,this.usageCostSummary=null,this.usageError=null,this.usageStartDate=(()=>{const e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`})(),this.usageEndDate=(()=>{const e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`})(),this.usageSelectedSessions=[],this.usageSelectedDays=[],this.usageSelectedHours=[],this.usageChartMode="tokens",this.usageDailyChartMode="by-type",this.usageTimeSeriesMode="per-turn",this.usageTimeSeriesBreakdownMode="by-type",this.usageTimeSeries=null,this.usageTimeSeriesLoading=!1,this.usageTimeSeriesCursorStart=null,this.usageTimeSeriesCursorEnd=null,this.usageSessionLogs=null,this.usageSessionLogsLoading=!1,this.usageSessionLogsExpanded=!1,this.usageQuery="",this.usageQueryDraft="",this.usageSessionSort="recent",this.usageSessionSortDir="desc",this.usageRecentSessions=[],this.usageTimeZone="local",this.usageContextExpanded=!1,this.usageHeaderPinned=!1,this.usageSessionsTab="all",this.usageVisibleColumns=["channel","agent","provider","model","messages","tools","errors","duration"],this.usageLogFilterRoles=[],this.usageLogFilterTools=[],this.usageLogFilterHasTools=!1,this.usageLogFilterQuery="",this.usageQueryDebounceTimer=null,this.cronLoading=!1,this.cronJobs=[],this.cronStatus=null,this.cronError=null,this.cronForm={...Zg},this.cronRunsJobId=null,this.cronRuns=[],this.cronBusy=!1,this.skillsLoading=!1,this.skillsReport=null,this.skillsError=null,this.skillsFilter="",this.skillEdits={},this.skillsBusyKey=null,this.skillMessages={},this.debugLoading=!1,this.debugStatus=null,this.debugHealth=null,this.debugModels=[],this.debugHeartbeat=null,this.debugCallMethod="",this.debugCallParams="{}",this.debugCallResult=null,this.debugCallError=null,this.logsLoading=!1,this.logsError=null,this.logsFile=null,this.logsEntries=[],this.logsFilterText="",this.logsLevelFilters={...Yg},this.logsAutoFollow=!0,this.logsTruncated=!1,this.logsCursor=null,this.logsLastFetchAt=null,this.logsLimit=500,this.logsMaxBytes=25e4,this.logsAtBottom=!0,this.client=null,this.chatScrollFrame=null,this.chatScrollTimeout=null,this.chatHasAutoScrolled=!1,this.chatUserNearBottom=!0,this.chatNewMessagesBelow=!1,this.nodesPollInterval=null,this.logsPollInterval=null,this.debugPollInterval=null,this.logsScrollFrame=null,this.toolStreamById=new Map,this.toolStreamOrder=[],this.refreshSessionsAfterChat=new Set,this.basePath="",this.popStateHandler=()=>vg(this),this.themeMedia=null,this.themeMediaHandler=null,this.topbarObserver=null,Yi(this.settings.locale)&&_n.setLocale(this.settings.locale)}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),gp(this),ne.setOnStateChange(()=>this.requestUpdate()),ne.setOnAutoSend(()=>{this.chatMessage?.trim()&&this.handleSendChat()}),ne.setOnTranscript(e=>{this.chatMessage=(this.chatMessage?this.chatMessage+" ":"")+e,this.requestUpdate(),ne.autoSend&&e.trim()&&setTimeout(()=>{this.chatMessage?.trim()&&this.handleSendChat()},500)})}firstUpdated(){pp(this)}disconnectedCallback(){fp(this),super.disconnectedCallback()}updated(e){hp(this,e)}connect(){Bl(this)}handleChatScroll(e){Ud(this,e)}handleLogsScroll(e){Hd(this,e)}exportLogs(e,t){jd(e,t)}resetToolStream(){Is(this)}resetChatScroll(){vo(this)}scrollToBottom(e){vo(this),Rn(this,!0,!!e?.smooth)}async loadAssistantIdentity(){await Fl(this)}applySettings(e){mt(this,e)}setTab(e){cg(this,e)}setTheme(e,t){dg(this,e,t)}async loadOverview(){await _l(this)}async loadCron(){await ps(this)}async handleAbortChat(){await Il(this)}removeQueuedMessage(e){Wg(this,e)}async handleSendChat(e,t){await qg(this,e,t)}async handleWhatsAppStart(e){await _d(this,e)}async handleWhatsAppWait(){await Ed(this)}async handleWhatsAppLogout(){await Ld(this)}async handleChannelConfigSave(){await Md(this)}async handleChannelConfigReload(){await Id(this)}handleNostrProfileEdit(e,t){Dd(this,e,t)}handleNostrProfileCancel(){Fd(this)}handleNostrProfileFieldChange(e,t){Nd(this,e,t)}async handleNostrProfileSave(){await Bd(this)}async handleNostrProfileImport(){await zd(this)}handleNostrProfileToggleAdvanced(){Od(this)}async handleExecApprovalDecision(e){const t=this.execApprovalQueue[0];if(!(!t||!this.client||this.execApprovalBusy)){this.execApprovalBusy=!0,this.execApprovalError=null;try{await this.client.request("exec.approval.resolve",{id:t.id,decision:e}),this.execApprovalQueue=this.execApprovalQueue.filter(n=>n.id!==t.id)}catch(n){this.execApprovalError=`Exec approval failed: ${String(n)}`}finally{this.execApprovalBusy=!1}}}handleGatewayUrlConfirm(){const e=this.pendingGatewayUrl;e&&(this.pendingGatewayUrl=null,mt(this,{...this.settings,gatewayUrl:e}),this.connect())}handleGatewayUrlCancel(){this.pendingGatewayUrl=null}handleOpenSidebar(e){this.sidebarCloseTimer!=null&&(window.clearTimeout(this.sidebarCloseTimer),this.sidebarCloseTimer=null),this.sidebarContent=e,this.sidebarError=null,this.sidebarOpen=!0}handleCloseSidebar(){this.sidebarOpen=!1,this.sidebarCloseTimer!=null&&window.clearTimeout(this.sidebarCloseTimer),this.sidebarCloseTimer=window.setTimeout(()=>{this.sidebarOpen||(this.sidebarContent=null,this.sidebarError=null,this.sidebarCloseTimer=null)},200)}handleSplitRatioChange(e){const t=Math.max(.4,Math.min(.7,e));this.splitRatio=t,this.applySettings({...this.settings,splitRatio:t})}render(){return Ny(this)}};x([$()],y.prototype,"settings",2);x([$()],y.prototype,"password",2);x([$()],y.prototype,"tab",2);x([$()],y.prototype,"onboarding",2);x([$()],y.prototype,"connected",2);x([$()],y.prototype,"theme",2);x([$()],y.prototype,"themeResolved",2);x([$()],y.prototype,"hello",2);x([$()],y.prototype,"lastError",2);x([$()],y.prototype,"eventLog",2);x([$()],y.prototype,"assistantName",2);x([$()],y.prototype,"assistantAvatar",2);x([$()],y.prototype,"assistantAgentId",2);x([$()],y.prototype,"sessionKey",2);x([$()],y.prototype,"chatLoading",2);x([$()],y.prototype,"chatSending",2);x([$()],y.prototype,"chatMessage",2);x([$()],y.prototype,"chatMessages",2);x([$()],y.prototype,"chatToolMessages",2);x([$()],y.prototype,"chatStream",2);x([$()],y.prototype,"chatStreamStartedAt",2);x([$()],y.prototype,"chatRunId",2);x([$()],y.prototype,"compactionStatus",2);x([$()],y.prototype,"chatAvatarUrl",2);x([$()],y.prototype,"chatThinkingLevel",2);x([$()],y.prototype,"chatQueue",2);x([$()],y.prototype,"chatAttachments",2);x([$()],y.prototype,"chatManualRefreshInFlight",2);x([$()],y.prototype,"sidebarOpen",2);x([$()],y.prototype,"sidebarContent",2);x([$()],y.prototype,"sidebarError",2);x([$()],y.prototype,"splitRatio",2);x([$()],y.prototype,"nodesLoading",2);x([$()],y.prototype,"nodes",2);x([$()],y.prototype,"devicesLoading",2);x([$()],y.prototype,"devicesError",2);x([$()],y.prototype,"devicesList",2);x([$()],y.prototype,"execApprovalsLoading",2);x([$()],y.prototype,"execApprovalsSaving",2);x([$()],y.prototype,"execApprovalsDirty",2);x([$()],y.prototype,"execApprovalsSnapshot",2);x([$()],y.prototype,"execApprovalsForm",2);x([$()],y.prototype,"execApprovalsSelectedAgent",2);x([$()],y.prototype,"execApprovalsTarget",2);x([$()],y.prototype,"execApprovalsTargetNodeId",2);x([$()],y.prototype,"execApprovalQueue",2);x([$()],y.prototype,"execApprovalBusy",2);x([$()],y.prototype,"execApprovalError",2);x([$()],y.prototype,"pendingGatewayUrl",2);x([$()],y.prototype,"configLoading",2);x([$()],y.prototype,"configRaw",2);x([$()],y.prototype,"configRawOriginal",2);x([$()],y.prototype,"configValid",2);x([$()],y.prototype,"configIssues",2);x([$()],y.prototype,"configSaving",2);x([$()],y.prototype,"configApplying",2);x([$()],y.prototype,"updateRunning",2);x([$()],y.prototype,"applySessionKey",2);x([$()],y.prototype,"configSnapshot",2);x([$()],y.prototype,"configSchema",2);x([$()],y.prototype,"configSchemaVersion",2);x([$()],y.prototype,"configSchemaLoading",2);x([$()],y.prototype,"configUiHints",2);x([$()],y.prototype,"configForm",2);x([$()],y.prototype,"configFormOriginal",2);x([$()],y.prototype,"configFormDirty",2);x([$()],y.prototype,"configFormMode",2);x([$()],y.prototype,"configSearchQuery",2);x([$()],y.prototype,"configActiveSection",2);x([$()],y.prototype,"configActiveSubsection",2);x([$()],y.prototype,"channelsLoading",2);x([$()],y.prototype,"channelsSnapshot",2);x([$()],y.prototype,"channelsError",2);x([$()],y.prototype,"channelsLastSuccess",2);x([$()],y.prototype,"whatsappLoginMessage",2);x([$()],y.prototype,"whatsappLoginQrDataUrl",2);x([$()],y.prototype,"whatsappLoginConnected",2);x([$()],y.prototype,"whatsappBusy",2);x([$()],y.prototype,"nostrProfileFormState",2);x([$()],y.prototype,"nostrProfileAccountId",2);x([$()],y.prototype,"presenceLoading",2);x([$()],y.prototype,"presenceEntries",2);x([$()],y.prototype,"presenceError",2);x([$()],y.prototype,"presenceStatus",2);x([$()],y.prototype,"agentsLoading",2);x([$()],y.prototype,"agentsList",2);x([$()],y.prototype,"agentsError",2);x([$()],y.prototype,"agentsSelectedId",2);x([$()],y.prototype,"agentsPanel",2);x([$()],y.prototype,"agentFilesLoading",2);x([$()],y.prototype,"agentFilesError",2);x([$()],y.prototype,"agentFilesList",2);x([$()],y.prototype,"agentFileContents",2);x([$()],y.prototype,"agentFileDrafts",2);x([$()],y.prototype,"agentFileActive",2);x([$()],y.prototype,"agentFileSaving",2);x([$()],y.prototype,"agentIdentityLoading",2);x([$()],y.prototype,"agentIdentityError",2);x([$()],y.prototype,"agentIdentityById",2);x([$()],y.prototype,"agentSkillsLoading",2);x([$()],y.prototype,"agentSkillsError",2);x([$()],y.prototype,"agentSkillsReport",2);x([$()],y.prototype,"agentSkillsAgentId",2);x([$()],y.prototype,"sessionsLoading",2);x([$()],y.prototype,"sessionsResult",2);x([$()],y.prototype,"sessionsError",2);x([$()],y.prototype,"sessionsFilterActive",2);x([$()],y.prototype,"sessionsFilterLimit",2);x([$()],y.prototype,"sessionsIncludeGlobal",2);x([$()],y.prototype,"sessionsIncludeUnknown",2);x([$()],y.prototype,"usageLoading",2);x([$()],y.prototype,"usageResult",2);x([$()],y.prototype,"usageCostSummary",2);x([$()],y.prototype,"usageError",2);x([$()],y.prototype,"usageStartDate",2);x([$()],y.prototype,"usageEndDate",2);x([$()],y.prototype,"usageSelectedSessions",2);x([$()],y.prototype,"usageSelectedDays",2);x([$()],y.prototype,"usageSelectedHours",2);x([$()],y.prototype,"usageChartMode",2);x([$()],y.prototype,"usageDailyChartMode",2);x([$()],y.prototype,"usageTimeSeriesMode",2);x([$()],y.prototype,"usageTimeSeriesBreakdownMode",2);x([$()],y.prototype,"usageTimeSeries",2);x([$()],y.prototype,"usageTimeSeriesLoading",2);x([$()],y.prototype,"usageTimeSeriesCursorStart",2);x([$()],y.prototype,"usageTimeSeriesCursorEnd",2);x([$()],y.prototype,"usageSessionLogs",2);x([$()],y.prototype,"usageSessionLogsLoading",2);x([$()],y.prototype,"usageSessionLogsExpanded",2);x([$()],y.prototype,"usageQuery",2);x([$()],y.prototype,"usageQueryDraft",2);x([$()],y.prototype,"usageSessionSort",2);x([$()],y.prototype,"usageSessionSortDir",2);x([$()],y.prototype,"usageRecentSessions",2);x([$()],y.prototype,"usageTimeZone",2);x([$()],y.prototype,"usageContextExpanded",2);x([$()],y.prototype,"usageHeaderPinned",2);x([$()],y.prototype,"usageSessionsTab",2);x([$()],y.prototype,"usageVisibleColumns",2);x([$()],y.prototype,"usageLogFilterRoles",2);x([$()],y.prototype,"usageLogFilterTools",2);x([$()],y.prototype,"usageLogFilterHasTools",2);x([$()],y.prototype,"usageLogFilterQuery",2);x([$()],y.prototype,"cronLoading",2);x([$()],y.prototype,"cronJobs",2);x([$()],y.prototype,"cronStatus",2);x([$()],y.prototype,"cronError",2);x([$()],y.prototype,"cronForm",2);x([$()],y.prototype,"cronRunsJobId",2);x([$()],y.prototype,"cronRuns",2);x([$()],y.prototype,"cronBusy",2);x([$()],y.prototype,"skillsLoading",2);x([$()],y.prototype,"skillsReport",2);x([$()],y.prototype,"skillsError",2);x([$()],y.prototype,"skillsFilter",2);x([$()],y.prototype,"skillEdits",2);x([$()],y.prototype,"skillsBusyKey",2);x([$()],y.prototype,"skillMessages",2);x([$()],y.prototype,"debugLoading",2);x([$()],y.prototype,"debugStatus",2);x([$()],y.prototype,"debugHealth",2);x([$()],y.prototype,"debugModels",2);x([$()],y.prototype,"debugHeartbeat",2);x([$()],y.prototype,"debugCallMethod",2);x([$()],y.prototype,"debugCallParams",2);x([$()],y.prototype,"debugCallResult",2);x([$()],y.prototype,"debugCallError",2);x([$()],y.prototype,"logsLoading",2);x([$()],y.prototype,"logsError",2);x([$()],y.prototype,"logsFile",2);x([$()],y.prototype,"logsEntries",2);x([$()],y.prototype,"logsFilterText",2);x([$()],y.prototype,"logsLevelFilters",2);x([$()],y.prototype,"logsAutoFollow",2);x([$()],y.prototype,"logsTruncated",2);x([$()],y.prototype,"logsCursor",2);x([$()],y.prototype,"logsLastFetchAt",2);x([$()],y.prototype,"logsLimit",2);x([$()],y.prototype,"logsMaxBytes",2);x([$()],y.prototype,"logsAtBottom",2);x([$()],y.prototype,"chatNewMessagesBelow",2);y=x([Ur("openclaw-app")],y);
//# sourceMappingURL=index-BWWkKavY.js.map
