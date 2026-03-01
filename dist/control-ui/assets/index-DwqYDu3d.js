(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();const es=globalThis,zi=es.ShadowRoot&&(es.ShadyCSS===void 0||es.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Ui=Symbol(),Qa=new WeakMap;let Er=class{constructor(t,n,s){if(this._$cssResult$=!0,s!==Ui)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=n}get styleSheet(){let t=this.o;const n=this.t;if(zi&&t===void 0){const s=n!==void 0&&n.length===1;s&&(t=Qa.get(n)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&Qa.set(n,t))}return t}toString(){return this.cssText}};const Pc=e=>new Er(typeof e=="string"?e:e+"",void 0,Ui),Dc=(e,...t)=>{const n=e.length===1?e[0]:t.reduce((s,i,a)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[a+1],e[0]);return new Er(n,e,Ui)},Fc=(e,t)=>{if(zi)e.adoptedStyleSheets=t.map(n=>n instanceof CSSStyleSheet?n:n.styleSheet);else for(const n of t){const s=document.createElement("style"),i=es.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=n.cssText,e.appendChild(s)}},Ya=zi?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let n="";for(const s of t.cssRules)n+=s.cssText;return Pc(n)})(e):e;const{is:Nc,defineProperty:Oc,getOwnPropertyDescriptor:Bc,getOwnPropertyNames:zc,getOwnPropertySymbols:Uc,getPrototypeOf:Hc}=Object,ys=globalThis,Za=ys.trustedTypes,jc=Za?Za.emptyScript:"",Kc=ys.reactiveElementPolyfillSupport,yn=(e,t)=>e,rs={toAttribute(e,t){switch(t){case Boolean:e=e?jc:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},Hi=(e,t)=>!Nc(e,t),Xa={attribute:!0,type:String,converter:rs,reflect:!1,useDefault:!1,hasChanged:Hi};Symbol.metadata??=Symbol("metadata"),ys.litPropertyMetadata??=new WeakMap;let Gt=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,n=Xa){if(n.state&&(n.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((n=Object.create(n)).wrapped=!0),this.elementProperties.set(t,n),!n.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,n);i!==void 0&&Oc(this.prototype,t,i)}}static getPropertyDescriptor(t,n,s){const{get:i,set:a}=Bc(this.prototype,t)??{get(){return this[n]},set(o){this[n]=o}};return{get:i,set(o){const r=i?.call(this);a?.call(this,o),this.requestUpdate(t,r,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??Xa}static _$Ei(){if(this.hasOwnProperty(yn("elementProperties")))return;const t=Hc(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(yn("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(yn("properties"))){const n=this.properties,s=[...zc(n),...Uc(n)];for(const i of s)this.createProperty(i,n[i])}const t=this[Symbol.metadata];if(t!==null){const n=litPropertyMetadata.get(t);if(n!==void 0)for(const[s,i]of n)this.elementProperties.set(s,i)}this._$Eh=new Map;for(const[n,s]of this.elementProperties){const i=this._$Eu(n,s);i!==void 0&&this._$Eh.set(i,n)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const n=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const i of s)n.unshift(Ya(i))}else t!==void 0&&n.push(Ya(t));return n}static _$Eu(t,n){const s=n.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,n=this.constructor.elementProperties;for(const s of n.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Fc(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,n,s){this._$AK(t,s)}_$ET(t,n){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){const a=(s.converter?.toAttribute!==void 0?s.converter:rs).toAttribute(n,s.type);this._$Em=t,a==null?this.removeAttribute(i):this.setAttribute(i,a),this._$Em=null}}_$AK(t,n){const s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){const a=s.getPropertyOptions(i),o=typeof a.converter=="function"?{fromAttribute:a.converter}:a.converter?.fromAttribute!==void 0?a.converter:rs;this._$Em=i;const r=o.fromAttribute(n,a.type);this[i]=r??this._$Ej?.get(i)??r,this._$Em=null}}requestUpdate(t,n,s,i=!1,a){if(t!==void 0){const o=this.constructor;if(i===!1&&(a=this[t]),s??=o.getPropertyOptions(t),!((s.hasChanged??Hi)(a,n)||s.useDefault&&s.reflect&&a===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,s))))return;this.C(t,n,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,n,{useDefault:s,reflect:i,wrapped:a},o){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??n??this[t]),a!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(n=void 0),this._$AL.set(t,n)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(n){Promise.reject(n)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[i,a]of this._$Ep)this[i]=a;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[i,a]of s){const{wrapped:o}=a,r=this[i];o!==!0||this._$AL.has(i)||r===void 0||this.C(i,void 0,a,r)}}let t=!1;const n=this._$AL;try{t=this.shouldUpdate(n),t?(this.willUpdate(n),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(n)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(n)}willUpdate(t){}_$AE(t){this._$EO?.forEach(n=>n.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(n=>this._$ET(n,this[n])),this._$EM()}updated(t){}firstUpdated(t){}};Gt.elementStyles=[],Gt.shadowRootOptions={mode:"open"},Gt[yn("elementProperties")]=new Map,Gt[yn("finalized")]=new Map,Kc?.({ReactiveElement:Gt}),(ys.reactiveElementVersions??=[]).push("2.1.2");const ji=globalThis,Ja=e=>e,ls=ji.trustedTypes,eo=ls?ls.createPolicy("lit-html",{createHTML:e=>e}):void 0,Lr="$lit$",dt=`lit$${Math.random().toFixed(9).slice(2)}$`,Mr="?"+dt,Wc=`<${Mr}>`,Dt=document,Sn=()=>Dt.createComment(""),An=e=>e===null||typeof e!="object"&&typeof e!="function",Ki=Array.isArray,qc=e=>Ki(e)||typeof e?.[Symbol.iterator]=="function",js=`[ 	
\f\r]`,rn=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,to=/-->/g,no=/>/g,$t=RegExp(`>|${js}(?:([^\\s"'>=/]+)(${js}*=${js}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),so=/'/g,io=/"/g,Ir=/^(?:script|style|textarea|title)$/i,Rr=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),l=Rr(1),wt=Rr(2),ft=Symbol.for("lit-noChange"),m=Symbol.for("lit-nothing"),ao=new WeakMap,Rt=Dt.createTreeWalker(Dt,129);function Pr(e,t){if(!Ki(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return eo!==void 0?eo.createHTML(t):t}const Vc=(e,t)=>{const n=e.length-1,s=[];let i,a=t===2?"<svg>":t===3?"<math>":"",o=rn;for(let r=0;r<n;r++){const c=e[r];let d,g,p=-1,h=0;for(;h<c.length&&(o.lastIndex=h,g=o.exec(c),g!==null);)h=o.lastIndex,o===rn?g[1]==="!--"?o=to:g[1]!==void 0?o=no:g[2]!==void 0?(Ir.test(g[2])&&(i=RegExp("</"+g[2],"g")),o=$t):g[3]!==void 0&&(o=$t):o===$t?g[0]===">"?(o=i??rn,p=-1):g[1]===void 0?p=-2:(p=o.lastIndex-g[2].length,d=g[1],o=g[3]===void 0?$t:g[3]==='"'?io:so):o===io||o===so?o=$t:o===to||o===no?o=rn:(o=$t,i=void 0);const u=o===$t&&e[r+1].startsWith("/>")?" ":"";a+=o===rn?c+Wc:p>=0?(s.push(d),c.slice(0,p)+Lr+c.slice(p)+dt+u):c+dt+(p===-2?r:u)}return[Pr(e,a+(e[n]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]};class Cn{constructor({strings:t,_$litType$:n},s){let i;this.parts=[];let a=0,o=0;const r=t.length-1,c=this.parts,[d,g]=Vc(t,n);if(this.el=Cn.createElement(d,s),Rt.currentNode=this.el.content,n===2||n===3){const p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(i=Rt.nextNode())!==null&&c.length<r;){if(i.nodeType===1){if(i.hasAttributes())for(const p of i.getAttributeNames())if(p.endsWith(Lr)){const h=g[o++],u=i.getAttribute(p).split(dt),f=/([.?@])?(.*)/.exec(h);c.push({type:1,index:a,name:f[2],strings:u,ctor:f[1]==="."?Qc:f[1]==="?"?Yc:f[1]==="@"?Zc:$s}),i.removeAttribute(p)}else p.startsWith(dt)&&(c.push({type:6,index:a}),i.removeAttribute(p));if(Ir.test(i.tagName)){const p=i.textContent.split(dt),h=p.length-1;if(h>0){i.textContent=ls?ls.emptyScript:"";for(let u=0;u<h;u++)i.append(p[u],Sn()),Rt.nextNode(),c.push({type:2,index:++a});i.append(p[h],Sn())}}}else if(i.nodeType===8)if(i.data===Mr)c.push({type:2,index:a});else{let p=-1;for(;(p=i.data.indexOf(dt,p+1))!==-1;)c.push({type:7,index:a}),p+=dt.length-1}a++}}static createElement(t,n){const s=Dt.createElement("template");return s.innerHTML=t,s}}function Jt(e,t,n=e,s){if(t===ft)return t;let i=s!==void 0?n._$Co?.[s]:n._$Cl;const a=An(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,s)),s!==void 0?(n._$Co??=[])[s]=i:n._$Cl=i),i!==void 0&&(t=Jt(e,i._$AS(e,t.values),i,s)),t}class Gc{constructor(t,n){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=n}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:n},parts:s}=this._$AD,i=(t?.creationScope??Dt).importNode(n,!0);Rt.currentNode=i;let a=Rt.nextNode(),o=0,r=0,c=s[0];for(;c!==void 0;){if(o===c.index){let d;c.type===2?d=new xs(a,a.nextSibling,this,t):c.type===1?d=new c.ctor(a,c.name,c.strings,this,t):c.type===6&&(d=new Xc(a,this,t)),this._$AV.push(d),c=s[++r]}o!==c?.index&&(a=Rt.nextNode(),o++)}return Rt.currentNode=Dt,i}p(t){let n=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,n),n+=s.strings.length-2):s._$AI(t[n])),n++}}let xs=class Dr{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,n,s,i){this.type=2,this._$AH=m,this._$AN=void 0,this._$AA=t,this._$AB=n,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const n=this._$AM;return n!==void 0&&t?.nodeType===11&&(t=n.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,n=this){t=Jt(this,t,n),An(t)?t===m||t==null||t===""?(this._$AH!==m&&this._$AR(),this._$AH=m):t!==this._$AH&&t!==ft&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):qc(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==m&&An(this._$AH)?this._$AA.nextSibling.data=t:this.T(Dt.createTextNode(t)),this._$AH=t}$(t){const{values:n,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=Cn.createElement(Pr(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(n);else{const a=new Gc(i,this),o=a.u(this.options);a.p(n),this.T(o),this._$AH=a}}_$AC(t){let n=ao.get(t.strings);return n===void 0&&ao.set(t.strings,n=new Cn(t)),n}k(t){Ki(this._$AH)||(this._$AH=[],this._$AR());const n=this._$AH;let s,i=0;for(const a of t)i===n.length?n.push(s=new Dr(this.O(Sn()),this.O(Sn()),this,this.options)):s=n[i],s._$AI(a),i++;i<n.length&&(this._$AR(s&&s._$AB.nextSibling,i),n.length=i)}_$AR(t=this._$AA.nextSibling,n){for(this._$AP?.(!1,!0,n);t!==this._$AB;){const s=Ja(t).nextSibling;Ja(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},$s=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,n,s,i,a){this.type=1,this._$AH=m,this._$AN=void 0,this.element=t,this.name=n,this._$AM=i,this.options=a,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=m}_$AI(t,n=this,s,i){const a=this.strings;let o=!1;if(a===void 0)t=Jt(this,t,n,0),o=!An(t)||t!==this._$AH&&t!==ft,o&&(this._$AH=t);else{const r=t;let c,d;for(t=a[0],c=0;c<a.length-1;c++)d=Jt(this,r[s+c],n,c),d===ft&&(d=this._$AH[c]),o||=!An(d)||d!==this._$AH[c],d===m?t=m:t!==m&&(t+=(d??"")+a[c+1]),this._$AH[c]=d}o&&!i&&this.j(t)}j(t){t===m?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},Qc=class extends $s{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===m?void 0:t}},Yc=class extends $s{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==m)}},Zc=class extends $s{constructor(t,n,s,i,a){super(t,n,s,i,a),this.type=5}_$AI(t,n=this){if((t=Jt(this,t,n,0)??m)===ft)return;const s=this._$AH,i=t===m&&s!==m||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,a=t!==m&&(s===m||i);i&&this.element.removeEventListener(this.name,this,s),a&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},Xc=class{constructor(t,n,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=n,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){Jt(this,t)}};const Jc={I:xs},ed=ji.litHtmlPolyfillSupport;ed?.(Cn,xs),(ji.litHtmlVersions??=[]).push("3.3.2");const td=(e,t,n)=>{const s=n?.renderBefore??t;let i=s._$litPart$;if(i===void 0){const a=n?.renderBefore??null;s._$litPart$=i=new xs(t.insertBefore(Sn(),a),a,void 0,n??{})}return i._$AI(e),i};const Wi=globalThis;let Zt=class extends Gt{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const n=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=td(n,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return ft}};Zt._$litElement$=!0,Zt.finalized=!0,Wi.litElementHydrateSupport?.({LitElement:Zt});const nd=Wi.litElementPolyfillSupport;nd?.({LitElement:Zt});(Wi.litElementVersions??=[]).push("4.2.2");const Fr=e=>(t,n)=>{n!==void 0?n.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)};const sd={attribute:!0,type:String,converter:rs,reflect:!1,hasChanged:Hi},id=(e=sd,t,n)=>{const{kind:s,metadata:i}=n;let a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),s==="setter"&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),s==="accessor"){const{name:o}=n;return{set(r){const c=t.get.call(this);t.set.call(this,r),this.requestUpdate(o,c,e,!0,r)},init(r){return r!==void 0&&this.C(o,void 0,e,r),r}}}if(s==="setter"){const{name:o}=n;return function(r){const c=this[o];t.call(this,r),this.requestUpdate(o,c,e,!0,r)}}throw Error("Unsupported decorator location: "+s)};function ws(e){return(t,n)=>typeof n=="object"?id(e,t,n):((s,i,a)=>{const o=i.hasOwnProperty(a);return i.constructor.createProperty(a,s),o?Object.getOwnPropertyDescriptor(i,a):void 0})(e,t,n)}function w(e){return ws({...e,state:!0,attribute:!1})}const ad="modulepreload",od=function(e,t){return new URL(e,t).href},oo={},Ks=function(t,n,s){let i=Promise.resolve();if(n&&n.length>0){let d=function(g){return Promise.all(g.map(p=>Promise.resolve(p).then(h=>({status:"fulfilled",value:h}),h=>({status:"rejected",reason:h}))))};const o=document.getElementsByTagName("link"),r=document.querySelector("meta[property=csp-nonce]"),c=r?.nonce||r?.getAttribute("nonce");i=d(n.map(g=>{if(g=od(g,s),g in oo)return;oo[g]=!0;const p=g.endsWith(".css"),h=p?'[rel="stylesheet"]':"";if(s)for(let f=o.length-1;f>=0;f--){const v=o[f];if(v.href===g&&(!p||v.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${g}"]${h}`))return;const u=document.createElement("link");if(u.rel=p?"stylesheet":ad,p||(u.as="script"),u.crossOrigin="",u.href=g,c&&u.setAttribute("nonce",c),document.head.appendChild(u),p)return new Promise((f,v)=>{u.addEventListener("load",f),u.addEventListener("error",()=>v(new Error(`Unable to preload CSS for ${g}`)))})}))}function a(o){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=o,window.dispatchEvent(r),!r.defaultPrevented)throw o}return i.then(o=>{for(const r of o||[])r.status==="rejected"&&a(r.reason);return t().catch(a)})},rd={common:{health:"Health",ok:"OK",offline:"Offline",connect:"Connect",refresh:"Refresh",enabled:"Enabled",disabled:"Disabled",na:"n/a",docs:"Docs",resources:"Resources"},nav:{chat:"Chat",control:"Control",agent:"Agent",settings:"Settings",expand:"Expand sidebar",collapse:"Collapse sidebar"},tabs:{agents:"Agents",overview:"Overview",channels:"Channels",instances:"Instances",sessions:"Sessions",usage:"Usage",cron:"Cron Jobs",skills:"Skills",nodes:"Nodes",chat:"Chat",config:"Config",debug:"Debug",logs:"Logs"},subtitles:{agents:"Manage agent workspaces, tools, and identities.",overview:"Gateway status, entry points, and a fast health read.",channels:"Manage channels and settings.",instances:"Presence beacons from connected clients and nodes.",sessions:"Inspect active sessions and adjust per-session defaults.",usage:"Monitor API usage and costs.",cron:"Schedule wakeups and recurring agent runs.",skills:"Manage skill availability and API key injection.",nodes:"Paired devices, capabilities, and command exposure.",chat:"Direct gateway chat session for quick interventions.",config:"Edit ~/.openclaw/openclaw.json safely.",debug:"Gateway snapshots, events, and manual RPC calls.",logs:"Live tail of the gateway file logs."},overview:{access:{title:"Gateway Access",subtitle:"Where the dashboard connects and how it authenticates.",wsUrl:"WebSocket URL",token:"Gateway Token",password:"Password (not stored)",sessionKey:"Default Session Key",language:"Language",connectHint:"Click Connect to apply connection changes.",trustedProxy:"Authenticated via trusted proxy."},snapshot:{title:"Snapshot",subtitle:"Latest gateway handshake information.",status:"Status",uptime:"Uptime",tickInterval:"Tick Interval",lastChannelsRefresh:"Last Channels Refresh",channelsHint:"Use Channels to link WhatsApp, Telegram, Discord, Signal, or iMessage."},stats:{instances:"Instances",instancesHint:"Presence beacons in the last 5 minutes.",sessions:"Sessions",sessionsHint:"Recent session keys tracked by the gateway.",cron:"Cron",cronNext:"Next wake {time}"},notes:{title:"Notes",subtitle:"Quick reminders for remote control setups.",tailscaleTitle:"Tailscale serve",tailscaleText:"Prefer serve mode to keep the gateway on loopback with tailnet auth.",sessionTitle:"Session hygiene",sessionText:"Use /new or sessions.patch to reset context.",cronTitle:"Cron reminders",cronText:"Use isolated sessions for recurring runs."},auth:{required:"This gateway requires auth. Add a token or password, then click Connect.",failed:"Auth failed. Re-copy a tokenized URL with {command}, or update the token, then click Connect."},insecure:{hint:"This page is HTTP, so the browser blocks device identity. Use HTTPS (Tailscale Serve) or open {url} on the gateway host.",stayHttp:"If you must stay on HTTP, set {config} (token-only)."}},chat:{disconnected:"Disconnected from gateway.",refreshTitle:"Refresh chat data",thinkingToggle:"Toggle assistant thinking/working output",focusToggle:"Toggle focus mode (hide sidebar + page header)",onboardingDisabled:"Disabled during onboarding"},languages:{en:"English",zhCN:"简体中文 (Simplified Chinese)",zhTW:"繁體中文 (Traditional Chinese)",ptBR:"Português (Brazilian Portuguese)"}},ld=["en","zh-CN","zh-TW","pt-BR"];function qi(e){return e!=null&&ld.includes(e)}class cd{constructor(){this.locale="en",this.translations={en:rd},this.subscribers=new Set,this.loadLocale()}loadLocale(){const t=localStorage.getItem("openclaw.i18n.locale");if(qi(t))this.locale=t;else{const n=navigator.language;n.startsWith("zh")?this.locale=n==="zh-TW"||n==="zh-HK"?"zh-TW":"zh-CN":n.startsWith("pt")?this.locale="pt-BR":this.locale="en"}}getLocale(){return this.locale}async setLocale(t){if(this.locale!==t){if(!this.translations[t])try{let n;if(t==="zh-CN")n=await Ks(()=>import("./zh-CN-CGVPSYVJ.js"),[],import.meta.url);else if(t==="zh-TW")n=await Ks(()=>import("./zh-TW-BVv_0_oO.js"),[],import.meta.url);else if(t==="pt-BR")n=await Ks(()=>import("./pt-BR-jDuotdpV.js"),[],import.meta.url);else return;this.translations[t]=n[t.replace("-","_")]}catch(n){console.error(`Failed to load locale: ${t}`,n);return}this.locale=t,localStorage.setItem("openclaw.i18n.locale",t),this.notify()}}registerTranslation(t,n){this.translations[t]=n}subscribe(t){return this.subscribers.add(t),()=>this.subscribers.delete(t)}notify(){this.subscribers.forEach(t=>t(this.locale))}t(t,n){const s=t.split(".");let i=this.translations[this.locale]||this.translations.en;for(const a of s)if(i&&typeof i=="object")i=i[a];else{i=void 0;break}if(i===void 0&&this.locale!=="en"){i=this.translations.en;for(const a of s)if(i&&typeof i=="object")i=i[a];else{i=void 0;break}}return typeof i!="string"?t:n?i.replace(/\{(\w+)\}/g,(a,o)=>n[o]||`{${o}}`):i}}const Tn=new cd,P=(e,t)=>Tn.t(e,t);class dd{constructor(t){this.host=t,this.host.addController(this)}hostConnected(){this.unsubscribe=Tn.subscribe(()=>{this.host.requestUpdate()})}hostDisconnected(){this.unsubscribe?.()}}async function Ce(e,t){if(!(!e.client||!e.connected)&&!e.channelsLoading){e.channelsLoading=!0,e.channelsError=null;try{const n=await e.client.request("channels.status",{probe:t,timeoutMs:8e3});e.channelsSnapshot=n,e.channelsLastSuccess=Date.now()}catch(n){e.channelsError=String(n)}finally{e.channelsLoading=!1}}}async function ud(e,t){if(!(!e.client||!e.connected||e.whatsappBusy)){e.whatsappBusy=!0;try{const n=await e.client.request("web.login.start",{force:t,timeoutMs:3e4});e.whatsappLoginMessage=n.message??null,e.whatsappLoginQrDataUrl=n.qrDataUrl??null,e.whatsappLoginConnected=null}catch(n){e.whatsappLoginMessage=String(n),e.whatsappLoginQrDataUrl=null,e.whatsappLoginConnected=null}finally{e.whatsappBusy=!1}}}async function gd(e){if(!(!e.client||!e.connected||e.whatsappBusy)){e.whatsappBusy=!0;try{const t=await e.client.request("web.login.wait",{timeoutMs:12e4});e.whatsappLoginMessage=t.message??null,e.whatsappLoginConnected=t.connected??null,t.connected&&(e.whatsappLoginQrDataUrl=null)}catch(t){e.whatsappLoginMessage=String(t),e.whatsappLoginConnected=null}finally{e.whatsappBusy=!1}}}async function pd(e){if(!(!e.client||!e.connected||e.whatsappBusy)){e.whatsappBusy=!0;try{await e.client.request("channels.logout",{channel:"whatsapp"}),e.whatsappLoginMessage="Logged out.",e.whatsappLoginQrDataUrl=null,e.whatsappLoginConnected=null}catch(t){e.whatsappLoginMessage=String(t)}finally{e.whatsappBusy=!1}}}function Ee(e){if(e)return Array.isArray(e.type)?e.type.filter(n=>n!=="null")[0]??e.type[0]:e.type}function Nr(e){if(!e)return"";if(e.default!==void 0)return e.default;switch(Ee(e)){case"object":return{};case"array":return[];case"boolean":return!1;case"number":case"integer":return 0;case"string":return"";default:return""}}function Vi(e){return e.filter(t=>typeof t=="string").join(".")}function Ie(e,t){const n=Vi(e),s=t[n];if(s)return s;const i=n.split(".");for(const[a,o]of Object.entries(t)){if(!a.includes("*"))continue;const r=a.split(".");if(r.length!==i.length)continue;let c=!0;for(let d=0;d<i.length;d+=1)if(r[d]!=="*"&&r[d]!==i[d]){c=!1;break}if(c)return o}}function tt(e){return e.replace(/_/g," ").replace(/([a-z0-9])([A-Z])/g,"$1 $2").replace(/\s+/g," ").replace(/^./,t=>t.toUpperCase())}function ro(e,t){const n=e.trim();if(n==="")return;const s=Number(n);return!Number.isFinite(s)||t&&!Number.isInteger(s)?e:s}function lo(e){const t=e.trim();return t==="true"?!0:t==="false"?!1:e}function ct(e,t){if(e==null)return e;if(t.allOf&&t.allOf.length>0){let s=e;for(const i of t.allOf)s=ct(s,i);return s}const n=Ee(t);if(t.anyOf||t.oneOf){const s=(t.anyOf??t.oneOf??[]).filter(i=>!(i.type==="null"||Array.isArray(i.type)&&i.type.includes("null")));if(s.length===1)return ct(e,s[0]);if(typeof e=="string")for(const i of s){const a=Ee(i);if(a==="number"||a==="integer"){const o=ro(e,a==="integer");if(o===void 0||typeof o=="number")return o}if(a==="boolean"){const o=lo(e);if(typeof o=="boolean")return o}}for(const i of s){const a=Ee(i);if(a==="object"&&typeof e=="object"&&!Array.isArray(e)||a==="array"&&Array.isArray(e))return ct(e,i)}return e}if(n==="number"||n==="integer"){if(typeof e=="string"){const s=ro(e,n==="integer");if(s===void 0||typeof s=="number")return s}return e}if(n==="boolean"){if(typeof e=="string"){const s=lo(e);if(typeof s=="boolean")return s}return e}if(n==="object"){if(typeof e!="object"||Array.isArray(e))return e;const s=e,i=t.properties??{},a=t.additionalProperties&&typeof t.additionalProperties=="object"?t.additionalProperties:null,o={};for(const[r,c]of Object.entries(s)){const d=i[r]??a,g=d?ct(c,d):c;g!==void 0&&(o[r]=g)}return o}if(n==="array"){if(!Array.isArray(e))return e;if(Array.isArray(t.items)){const i=t.items;return e.map((a,o)=>{const r=o<i.length?i[o]:void 0;return r?ct(a,r):a})}const s=t.items;return s?e.map(i=>ct(i,s)).filter(i=>i!==void 0):e}return e}function Ft(e){return typeof structuredClone=="function"?structuredClone(e):JSON.parse(JSON.stringify(e))}function _n(e){return`${JSON.stringify(e,null,2).trimEnd()}
`}function Or(e,t,n){if(t.length===0)return;let s=e;for(let a=0;a<t.length-1;a+=1){const o=t[a],r=t[a+1];if(typeof o=="number"){if(!Array.isArray(s))return;s[o]==null&&(s[o]=typeof r=="number"?[]:{}),s=s[o]}else{if(typeof s!="object"||s==null)return;const c=s;c[o]==null&&(c[o]=typeof r=="number"?[]:{}),s=c[o]}}const i=t[t.length-1];if(typeof i=="number"){Array.isArray(s)&&(s[i]=n);return}typeof s=="object"&&s!=null&&(s[i]=n)}function Br(e,t){if(t.length===0)return;let n=e;for(let i=0;i<t.length-1;i+=1){const a=t[i];if(typeof a=="number"){if(!Array.isArray(n))return;n=n[a]}else{if(typeof n!="object"||n==null)return;n=n[a]}if(n==null)return}const s=t[t.length-1];if(typeof s=="number"){Array.isArray(n)&&n.splice(s,1);return}typeof n=="object"&&n!=null&&delete n[s]}async function Ne(e){if(!(!e.client||!e.connected)){e.configLoading=!0,e.lastError=null;try{const t=await e.client.request("config.get",{});hd(e,t)}catch(t){e.lastError=String(t)}finally{e.configLoading=!1}}}async function zr(e){if(!(!e.client||!e.connected)&&!e.configSchemaLoading){e.configSchemaLoading=!0;try{const t=await e.client.request("config.schema",{});fd(e,t)}catch(t){e.lastError=String(t)}finally{e.configSchemaLoading=!1}}}function fd(e,t){e.configSchema=t.schema??null,e.configUiHints=t.uiHints??{},e.configSchemaVersion=t.version??null}function hd(e,t){e.configSnapshot=t;const n=typeof t.raw=="string"?t.raw:t.config&&typeof t.config=="object"?_n(t.config):e.configRaw;!e.configFormDirty||e.configFormMode==="raw"?e.configRaw=n:e.configForm?e.configRaw=_n(e.configForm):e.configRaw=n,e.configValid=typeof t.valid=="boolean"?t.valid:null,e.configIssues=Array.isArray(t.issues)?t.issues:[],e.configFormDirty||(e.configForm=Ft(t.config??{}),e.configFormOriginal=Ft(t.config??{}),e.configRawOriginal=n)}function vd(e){return!e||typeof e!="object"||Array.isArray(e)?null:e}function Ur(e){if(e.configFormMode!=="form"||!e.configForm)return e.configRaw;const t=vd(e.configSchema),n=t?ct(e.configForm,t):e.configForm;return _n(n)}async function ts(e){if(!(!e.client||!e.connected)){e.configSaving=!0,e.lastError=null;try{const t=Ur(e),n=e.configSnapshot?.hash;if(!n){e.lastError="Config hash missing; reload and retry.";return}await e.client.request("config.set",{raw:t,baseHash:n}),e.configFormDirty=!1,await Ne(e)}catch(t){e.lastError=String(t)}finally{e.configSaving=!1}}}async function md(e){if(!(!e.client||!e.connected)){e.configApplying=!0,e.lastError=null;try{const t=Ur(e),n=e.configSnapshot?.hash;if(!n){e.lastError="Config hash missing; reload and retry.";return}await e.client.request("config.apply",{raw:t,baseHash:n,sessionKey:e.applySessionKey}),e.configFormDirty=!1,await Ne(e)}catch(t){e.lastError=String(t)}finally{e.configApplying=!1}}}async function bd(e){if(!(!e.client||!e.connected)){e.updateRunning=!0,e.lastError=null;try{await e.client.request("update.run",{sessionKey:e.applySessionKey})}catch(t){e.lastError=String(t)}finally{e.updateRunning=!1}}}function _e(e,t,n){const s=Ft(e.configForm??e.configSnapshot?.config??{});Or(s,t,n),e.configForm=s,e.configFormDirty=!0,e.configFormMode==="form"&&(e.configRaw=_n(s))}function Ze(e,t){const n=Ft(e.configForm??e.configSnapshot?.config??{});Br(n,t),e.configForm=n,e.configFormDirty=!0,e.configFormMode==="form"&&(e.configRaw=_n(n))}function yd(e){const{values:t,original:n}=e;return t.name!==n.name||t.displayName!==n.displayName||t.about!==n.about||t.picture!==n.picture||t.banner!==n.banner||t.website!==n.website||t.nip05!==n.nip05||t.lud16!==n.lud16}function xd(e){const{state:t,callbacks:n,accountId:s}=e,i=yd(t),a=(r,c,d={})=>{const{type:g="text",placeholder:p,maxLength:h,help:u}=d,f=t.values[r]??"",v=t.fieldErrors[r],$=`nostr-profile-${r}`;return g==="textarea"?l`
        <div class="form-field" style="margin-bottom: 12px;">
          <label for="${$}" style="display: block; margin-bottom: 4px; font-weight: 500;">
            ${c}
          </label>
          <textarea
            id="${$}"
            .value=${f}
            placeholder=${p??""}
            maxlength=${h??2e3}
            rows="3"
            style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; resize: vertical; font-family: inherit;"
            @input=${S=>{const C=S.target;n.onFieldChange(r,C.value)}}
            ?disabled=${t.saving}
          ></textarea>
          ${u?l`<div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${u}</div>`:m}
          ${v?l`<div style="font-size: 12px; color: var(--danger-color); margin-top: 2px;">${v}</div>`:m}
        </div>
      `:l`
      <div class="form-field" style="margin-bottom: 12px;">
        <label for="${$}" style="display: block; margin-bottom: 4px; font-weight: 500;">
          ${c}
        </label>
        <input
          id="${$}"
          type=${g}
          .value=${f}
          placeholder=${p??""}
          maxlength=${h??256}
          style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;"
          @input=${S=>{const C=S.target;n.onFieldChange(r,C.value)}}
          ?disabled=${t.saving}
        />
        ${u?l`<div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${u}</div>`:m}
        ${v?l`<div style="font-size: 12px; color: var(--danger-color); margin-top: 2px;">${v}</div>`:m}
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
    `:m};return l`
    <div class="nostr-profile-form" style="padding: 16px; background: var(--bg-secondary); border-radius: 8px; margin-top: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div style="font-weight: 600; font-size: 16px;">Edit Profile</div>
        <div style="font-size: 12px; color: var(--text-muted);">Account: ${s}</div>
      </div>

      ${t.error?l`<div class="callout danger" style="margin-bottom: 12px;">${t.error}</div>`:m}

      ${t.success?l`<div class="callout success" style="margin-bottom: 12px;">${t.success}</div>`:m}

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
          `:m}

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
            `:m}
    </div>
  `}function $d(e){const t={name:e?.name??"",displayName:e?.displayName??"",about:e?.about??"",picture:e?.picture??"",banner:e?.banner??"",website:e?.website??"",nip05:e?.nip05??"",lud16:e?.lud16??""};return{values:t,original:{...t},saving:!1,importing:!1,error:null,success:null,fieldErrors:{},showAdvanced:!!(e?.banner||e?.website||e?.nip05||e?.lud16)}}async function wd(e,t){await ud(e,t),await Ce(e,!0)}async function kd(e){await gd(e),await Ce(e,!0)}async function Sd(e){await pd(e),await Ce(e,!0)}async function Ad(e){await ts(e),await Ne(e),await Ce(e,!0)}async function Cd(e){await Ne(e),await Ce(e,!0)}function Td(e){if(!Array.isArray(e))return{};const t={};for(const n of e){if(typeof n!="string")continue;const[s,...i]=n.split(":");if(!s||i.length===0)continue;const a=s.trim(),o=i.join(":").trim();a&&o&&(t[a]=o)}return t}function Hr(e){return(e.channelsSnapshot?.channelAccounts?.nostr??[])[0]?.accountId??e.nostrProfileAccountId??"default"}function jr(e,t=""){return`/api/channels/nostr/${encodeURIComponent(e)}/profile${t}`}function _d(e){const t=e.hello?.auth?.deviceToken?.trim();if(t)return`Bearer ${t}`;const n=e.settings.token.trim();if(n)return`Bearer ${n}`;const s=e.password.trim();return s?`Bearer ${s}`:null}function Kr(e){const t=_d(e);return t?{Authorization:t}:{}}function Ed(e,t,n){e.nostrProfileAccountId=t,e.nostrProfileFormState=$d(n??void 0)}function Ld(e){e.nostrProfileFormState=null,e.nostrProfileAccountId=null}function Md(e,t,n){const s=e.nostrProfileFormState;s&&(e.nostrProfileFormState={...s,values:{...s.values,[t]:n},fieldErrors:{...s.fieldErrors,[t]:""}})}function Id(e){const t=e.nostrProfileFormState;t&&(e.nostrProfileFormState={...t,showAdvanced:!t.showAdvanced})}async function Rd(e){const t=e.nostrProfileFormState;if(!t||t.saving)return;const n=Hr(e);e.nostrProfileFormState={...t,saving:!0,error:null,success:null,fieldErrors:{}};try{const s=await fetch(jr(n),{method:"PUT",headers:{"Content-Type":"application/json",...Kr(e)},body:JSON.stringify(t.values)}),i=await s.json().catch(()=>null);if(!s.ok||i?.ok===!1||!i){const a=i?.error??`Profile update failed (${s.status})`;e.nostrProfileFormState={...t,saving:!1,error:a,success:null,fieldErrors:Td(i?.details)};return}if(!i.persisted){e.nostrProfileFormState={...t,saving:!1,error:"Profile publish failed on all relays.",success:null};return}e.nostrProfileFormState={...t,saving:!1,error:null,success:"Profile published to relays.",fieldErrors:{},original:{...t.values}},await Ce(e,!0)}catch(s){e.nostrProfileFormState={...t,saving:!1,error:`Profile update failed: ${String(s)}`,success:null}}}async function Pd(e){const t=e.nostrProfileFormState;if(!t||t.importing)return;const n=Hr(e);e.nostrProfileFormState={...t,importing:!0,error:null,success:null};try{const s=await fetch(jr(n,"/import"),{method:"POST",headers:{"Content-Type":"application/json",...Kr(e)},body:JSON.stringify({autoMerge:!0})}),i=await s.json().catch(()=>null);if(!s.ok||i?.ok===!1||!i){const c=i?.error??`Profile import failed (${s.status})`;e.nostrProfileFormState={...t,importing:!1,error:c,success:null};return}const a=i.merged??i.imported??null,o=a?{...t.values,...a}:t.values,r=!!(o.banner||o.website||o.nip05||o.lud16);e.nostrProfileFormState={...t,importing:!1,values:o,error:null,success:i.saved?"Profile imported from relays. Review and publish.":"Profile imported. Review and publish.",showAdvanced:r},i.saved&&await Ce(e,!0)}catch(s){e.nostrProfileFormState={...t,importing:!1,error:`Profile import failed: ${String(s)}`,success:null}}}function Wr(e){const t=(e??"").trim();if(!t)return null;const n=t.split(":").filter(Boolean);if(n.length<3||n[0]!=="agent")return null;const s=n[1]?.trim(),i=n.slice(2).join(":");return!s||!i?null:{agentId:s,rest:i}}const hi=450;function In(e,t=!1,n=!1){e.chatScrollFrame&&cancelAnimationFrame(e.chatScrollFrame),e.chatScrollTimeout!=null&&(clearTimeout(e.chatScrollTimeout),e.chatScrollTimeout=null);const s=()=>{const i=e.querySelector(".chat-thread");if(i){const a=getComputedStyle(i).overflowY;if(a==="auto"||a==="scroll"||i.scrollHeight-i.clientHeight>1)return i}return document.scrollingElement??document.documentElement};e.updateComplete.then(()=>{e.chatScrollFrame=requestAnimationFrame(()=>{e.chatScrollFrame=null;const i=s();if(!i)return;const a=i.scrollHeight-i.scrollTop-i.clientHeight,o=t&&!e.chatHasAutoScrolled;if(!(o||e.chatUserNearBottom||a<hi)){e.chatNewMessagesBelow=!0;return}o&&(e.chatHasAutoScrolled=!0);const c=n&&(typeof window>"u"||typeof window.matchMedia!="function"||!window.matchMedia("(prefers-reduced-motion: reduce)").matches),d=i.scrollHeight;typeof i.scrollTo=="function"?i.scrollTo({top:d,behavior:c?"smooth":"auto"}):i.scrollTop=d,e.chatUserNearBottom=!0,e.chatNewMessagesBelow=!1;const g=o?150:120;e.chatScrollTimeout=window.setTimeout(()=>{e.chatScrollTimeout=null;const p=s();if(!p)return;const h=p.scrollHeight-p.scrollTop-p.clientHeight;(o||e.chatUserNearBottom||h<hi)&&(p.scrollTop=p.scrollHeight,e.chatUserNearBottom=!0)},g)})})}function qr(e,t=!1){e.logsScrollFrame&&cancelAnimationFrame(e.logsScrollFrame),e.updateComplete.then(()=>{e.logsScrollFrame=requestAnimationFrame(()=>{e.logsScrollFrame=null;const n=e.querySelector(".log-stream");if(!n)return;const s=n.scrollHeight-n.scrollTop-n.clientHeight;(t||s<80)&&(n.scrollTop=n.scrollHeight)})})}function Dd(e,t){const n=t.currentTarget;if(!n)return;const s=n.scrollHeight-n.scrollTop-n.clientHeight;e.chatUserNearBottom=s<hi,e.chatUserNearBottom&&(e.chatNewMessagesBelow=!1)}function Fd(e,t){const n=t.currentTarget;if(!n)return;const s=n.scrollHeight-n.scrollTop-n.clientHeight;e.logsAtBottom=s<80}function co(e){e.chatHasAutoScrolled=!1,e.chatUserNearBottom=!0,e.chatNewMessagesBelow=!1}function Nd(e,t){if(e.length===0)return;const n=new Blob([`${e.join(`
`)}
`],{type:"text/plain"}),s=URL.createObjectURL(n),i=document.createElement("a"),a=new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");i.href=s,i.download=`openclaw-logs-${t}-${a}.log`,i.click(),URL.revokeObjectURL(s)}function Od(e){if(typeof ResizeObserver>"u")return;const t=e.querySelector(".topbar");if(!t)return;const n=()=>{const{height:s}=t.getBoundingClientRect();e.style.setProperty("--topbar-height",`${s}px`)};n(),e.topbarObserver=new ResizeObserver(()=>n()),e.topbarObserver.observe(t)}async function ks(e){if(!(!e.client||!e.connected)&&!e.debugLoading){e.debugLoading=!0;try{const[t,n,s,i]=await Promise.all([e.client.request("status",{}),e.client.request("health",{}),e.client.request("models.list",{}),e.client.request("last-heartbeat",{})]);e.debugStatus=t,e.debugHealth=n;const a=s;e.debugModels=Array.isArray(a?.models)?a?.models:[],e.debugHeartbeat=i}catch(t){e.debugCallError=String(t)}finally{e.debugLoading=!1}}}async function Bd(e){if(!(!e.client||!e.connected)){e.debugCallError=null,e.debugCallResult=null;try{const t=e.debugCallParams.trim()?JSON.parse(e.debugCallParams):{},n=await e.client.request(e.debugCallMethod.trim(),t);e.debugCallResult=JSON.stringify(n,null,2)}catch(t){e.debugCallError=String(t)}}}const zd=2e3,Ud=new Set(["trace","debug","info","warn","error","fatal"]);function Hd(e){if(typeof e!="string")return null;const t=e.trim();if(!t.startsWith("{")||!t.endsWith("}"))return null;try{const n=JSON.parse(t);return!n||typeof n!="object"?null:n}catch{return null}}function jd(e){if(typeof e!="string")return null;const t=e.toLowerCase();return Ud.has(t)?t:null}function Kd(e){if(!e.trim())return{raw:e,message:e};try{const t=JSON.parse(e),n=t&&typeof t._meta=="object"&&t._meta!==null?t._meta:null,s=typeof t.time=="string"?t.time:typeof n?.date=="string"?n?.date:null,i=jd(n?.logLevelName??n?.level),a=typeof t[0]=="string"?t[0]:typeof n?.name=="string"?n?.name:null,o=Hd(a);let r=null;o&&(typeof o.subsystem=="string"?r=o.subsystem:typeof o.module=="string"&&(r=o.module)),!r&&a&&a.length<120&&(r=a);let c=null;return typeof t[1]=="string"?c=t[1]:!o&&typeof t[0]=="string"?c=t[0]:typeof t.message=="string"&&(c=t.message),{raw:e,time:s,level:i,subsystem:r,message:c??e,meta:n??void 0}}catch{return{raw:e,message:e}}}async function Gi(e,t){if(!(!e.client||!e.connected)&&!(e.logsLoading&&!t?.quiet)){t?.quiet||(e.logsLoading=!0),e.logsError=null;try{const s=await e.client.request("logs.tail",{cursor:t?.reset?void 0:e.logsCursor??void 0,limit:e.logsLimit,maxBytes:e.logsMaxBytes}),a=(Array.isArray(s.lines)?s.lines.filter(r=>typeof r=="string"):[]).map(Kd),o=!!(t?.reset||s.reset||e.logsCursor==null);e.logsEntries=o?a:[...e.logsEntries,...a].slice(-zd),typeof s.cursor=="number"&&(e.logsCursor=s.cursor),typeof s.file=="string"&&(e.logsFile=s.file),e.logsTruncated=!!s.truncated,e.logsLastFetchAt=Date.now()}catch(n){e.logsError=String(n)}finally{t?.quiet||(e.logsLoading=!1)}}}async function Ss(e,t){if(!(!e.client||!e.connected)&&!e.nodesLoading){e.nodesLoading=!0,t?.quiet||(e.lastError=null);try{const n=await e.client.request("node.list",{});e.nodes=Array.isArray(n.nodes)?n.nodes:[]}catch(n){t?.quiet||(e.lastError=String(n))}finally{e.nodesLoading=!1}}}function Wd(e){e.nodesPollInterval==null&&(e.nodesPollInterval=window.setInterval(()=>{Ss(e,{quiet:!0})},5e3))}function qd(e){e.nodesPollInterval!=null&&(clearInterval(e.nodesPollInterval),e.nodesPollInterval=null)}function Qi(e){e.logsPollInterval==null&&(e.logsPollInterval=window.setInterval(()=>{e.tab==="logs"&&Gi(e,{quiet:!0})},2e3))}function Yi(e){e.logsPollInterval!=null&&(clearInterval(e.logsPollInterval),e.logsPollInterval=null)}function Zi(e){e.debugPollInterval==null&&(e.debugPollInterval=window.setInterval(()=>{e.tab==="debug"&&ks(e)},3e3))}function Xi(e){e.debugPollInterval!=null&&(clearInterval(e.debugPollInterval),e.debugPollInterval=null)}async function Vr(e,t){if(!(!e.client||!e.connected||e.agentIdentityLoading)&&!e.agentIdentityById[t]){e.agentIdentityLoading=!0,e.agentIdentityError=null;try{const n=await e.client.request("agent.identity.get",{agentId:t});n&&(e.agentIdentityById={...e.agentIdentityById,[t]:n})}catch(n){e.agentIdentityError=String(n)}finally{e.agentIdentityLoading=!1}}}async function Gr(e,t){if(!e.client||!e.connected||e.agentIdentityLoading)return;const n=t.filter(s=>!e.agentIdentityById[s]);if(n.length!==0){e.agentIdentityLoading=!0,e.agentIdentityError=null;try{for(const s of n){const i=await e.client.request("agent.identity.get",{agentId:s});i&&(e.agentIdentityById={...e.agentIdentityById,[s]:i})}}catch(s){e.agentIdentityError=String(s)}finally{e.agentIdentityLoading=!1}}}async function ns(e,t){if(!(!e.client||!e.connected)&&!e.agentSkillsLoading){e.agentSkillsLoading=!0,e.agentSkillsError=null;try{const n=await e.client.request("skills.status",{agentId:t});n&&(e.agentSkillsReport=n,e.agentSkillsAgentId=t)}catch(n){e.agentSkillsError=String(n)}finally{e.agentSkillsLoading=!1}}}async function Ji(e){if(!(!e.client||!e.connected)&&!e.agentsLoading){e.agentsLoading=!0,e.agentsError=null;try{const t=await e.client.request("agents.list",{});if(t){e.agentsList=t;const n=e.agentsSelectedId,s=t.agents.some(i=>i.id===n);(!n||!s)&&(e.agentsSelectedId=t.defaultId??t.agents[0]?.id??null)}}catch(t){e.agentsError=String(t)}finally{e.agentsLoading=!1}}}function ea(e,t){if(e==null||!Number.isFinite(e)||e<=0)return;if(e<1e3)return`${Math.round(e)}ms`;const n=t?.spaced?" ":"",s=Math.round(e/1e3),i=Math.floor(s/3600),a=Math.floor(s%3600/60),o=s%60;if(i>=24){const r=Math.floor(i/24),c=i%24;return c>0?`${r}d${n}${c}h`:`${r}d`}return i>0?a>0?`${i}h${n}${a}m`:`${i}h`:a>0?o>0?`${a}m${n}${o}s`:`${a}m`:`${o}s`}function ta(e,t="n/a"){if(e==null||!Number.isFinite(e)||e<0)return t;if(e<1e3)return`${Math.round(e)}ms`;const n=Math.round(e/1e3);if(n<60)return`${n}s`;const s=Math.round(n/60);if(s<60)return`${s}m`;const i=Math.round(s/60);return i<24?`${i}h`:`${Math.round(i/24)}d`}function ee(e,t){const n=t?.fallback??"n/a";if(e==null||!Number.isFinite(e))return n;const s=Date.now()-e,i=Math.abs(s),a=s>=0,o=Math.round(i/1e3);if(o<60)return a?"just now":"in <1m";const r=Math.round(o/60);if(r<60)return a?`${r}m ago`:`in ${r}m`;const c=Math.round(r/60);if(c<48)return a?`${c}h ago`:`in ${c}h`;const d=Math.round(c/24);return a?`${d}d ago`:`in ${d}d`}const Vd=/<\s*\/?\s*(?:think(?:ing)?|thought|antthinking|final)\b/i,zn=/<\s*\/?\s*final\b[^<>]*>/gi,uo=/<\s*(\/?)\s*(?:think(?:ing)?|thought|antthinking)\b[^<>]*>/gi;function go(e){const t=[],n=/(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g;for(const i of e.matchAll(n)){const a=(i.index??0)+i[1].length;t.push({start:a,end:a+i[0].length-i[1].length})}const s=/`+[^`]+`+/g;for(const i of e.matchAll(s)){const a=i.index??0,o=a+i[0].length;t.some(c=>a>=c.start&&o<=c.end)||t.push({start:a,end:o})}return t.sort((i,a)=>i.start-a.start),t}function po(e,t){return t.some(n=>e>=n.start&&e<n.end)}function Gd(e,t){return e.trimStart()}function Qd(e,t){if(!e||!Vd.test(e))return e;let n=e;if(zn.test(n)){zn.lastIndex=0;const r=[],c=go(n);for(const d of n.matchAll(zn)){const g=d.index??0;r.push({start:g,length:d[0].length,inCode:po(g,c)})}for(let d=r.length-1;d>=0;d--){const g=r[d];g.inCode||(n=n.slice(0,g.start)+n.slice(g.start+g.length))}}else zn.lastIndex=0;const s=go(n);uo.lastIndex=0;let i="",a=0,o=!1;for(const r of n.matchAll(uo)){const c=r.index??0,d=r[1]==="/";po(c,s)||(o?d&&(o=!1):(i+=n.slice(a,c),d||(o=!0)),a=c+r[0].length)}return i+=n.slice(a),Gd(i)}function Nt(e){return!e&&e!==0?"n/a":new Date(e).toLocaleString()}function vi(e){return!e||e.length===0?"none":e.filter(t=>!!(t&&t.trim())).join(", ")}function mi(e,t=120){return e.length<=t?e:`${e.slice(0,Math.max(0,t-1))}…`}function Qr(e,t){return e.length<=t?{text:e,truncated:!1,total:e.length}:{text:e.slice(0,Math.max(0,t)),truncated:!0,total:e.length}}function cs(e,t){const n=Number(e);return Number.isFinite(n)?n:t}function Ws(e){return Qd(e)}function Yd(e){return e.sessionTarget==="isolated"&&e.payloadKind==="agentTurn"}function Yr(e){return e.deliveryMode!=="announce"||Yd(e)?e:{...e,deliveryMode:"none"}}async function Rn(e){if(!(!e.client||!e.connected))try{const t=await e.client.request("cron.status",{});e.cronStatus=t}catch(t){e.cronError=String(t)}}async function As(e){if(!(!e.client||!e.connected)&&!e.cronLoading){e.cronLoading=!0,e.cronError=null;try{const t=await e.client.request("cron.list",{includeDisabled:!0});e.cronJobs=Array.isArray(t.jobs)?t.jobs:[]}catch(t){e.cronError=String(t)}finally{e.cronLoading=!1}}}function Zd(e){if(e.scheduleKind==="at"){const n=Date.parse(e.scheduleAt);if(!Number.isFinite(n))throw new Error("Invalid run time.");return{kind:"at",at:new Date(n).toISOString()}}if(e.scheduleKind==="every"){const n=cs(e.everyAmount,0);if(n<=0)throw new Error("Invalid interval amount.");const s=e.everyUnit;return{kind:"every",everyMs:n*(s==="minutes"?6e4:s==="hours"?36e5:864e5)}}const t=e.cronExpr.trim();if(!t)throw new Error("Cron expression required.");return{kind:"cron",expr:t,tz:e.cronTz.trim()||void 0}}function Xd(e){if(e.payloadKind==="systemEvent"){const i=e.payloadText.trim();if(!i)throw new Error("System event text required.");return{kind:"systemEvent",text:i}}const t=e.payloadText.trim();if(!t)throw new Error("Agent message required.");const n={kind:"agentTurn",message:t},s=cs(e.timeoutSeconds,0);return s>0&&(n.timeoutSeconds=s),n}async function Jd(e){if(!(!e.client||!e.connected||e.cronBusy)){e.cronBusy=!0,e.cronError=null;try{const t=Yr(e.cronForm);t!==e.cronForm&&(e.cronForm=t);const n=Zd(t),s=Xd(t),i=t.deliveryMode,a=i&&i!=="none"?{mode:i,channel:i==="announce"?t.deliveryChannel.trim()||"last":void 0,to:t.deliveryTo.trim()||void 0}:void 0,o=t.agentId.trim(),r={name:t.name.trim(),description:t.description.trim()||void 0,agentId:o||void 0,enabled:t.enabled,schedule:n,sessionTarget:t.sessionTarget,wakeMode:t.wakeMode,payload:s,delivery:a};if(!r.name)throw new Error("Name required.");await e.client.request("cron.add",r),e.cronForm={...e.cronForm,name:"",description:"",payloadText:""},await As(e),await Rn(e)}catch(t){e.cronError=String(t)}finally{e.cronBusy=!1}}}async function eu(e,t,n){if(!(!e.client||!e.connected||e.cronBusy)){e.cronBusy=!0,e.cronError=null;try{await e.client.request("cron.update",{id:t.id,patch:{enabled:n}}),await As(e),await Rn(e)}catch(s){e.cronError=String(s)}finally{e.cronBusy=!1}}}async function tu(e,t){if(!(!e.client||!e.connected||e.cronBusy)){e.cronBusy=!0,e.cronError=null;try{await e.client.request("cron.run",{id:t.id,mode:"force"}),await Zr(e,t.id)}catch(n){e.cronError=String(n)}finally{e.cronBusy=!1}}}async function nu(e,t){if(!(!e.client||!e.connected||e.cronBusy)){e.cronBusy=!0,e.cronError=null;try{await e.client.request("cron.remove",{id:t.id}),e.cronRunsJobId===t.id&&(e.cronRunsJobId=null,e.cronRuns=[]),await As(e),await Rn(e)}catch(n){e.cronError=String(n)}finally{e.cronBusy=!1}}}async function Zr(e,t){if(!(!e.client||!e.connected))try{const n=await e.client.request("cron.runs",{id:t,limit:50});e.cronRunsJobId=t,e.cronRuns=Array.isArray(n.entries)?n.entries:[]}catch(n){e.cronError=String(n)}}function na(e){return e.trim()}function su(e){if(!Array.isArray(e))return[];const t=new Set;for(const n of e){const s=n.trim();s&&t.add(s)}return[...t].toSorted()}const Xr="openclaw.device.auth.v1";function sa(){try{const e=window.localStorage.getItem(Xr);if(!e)return null;const t=JSON.parse(e);return!t||t.version!==1||!t.deviceId||typeof t.deviceId!="string"||!t.tokens||typeof t.tokens!="object"?null:t}catch{return null}}function Jr(e){try{window.localStorage.setItem(Xr,JSON.stringify(e))}catch{}}function iu(e){const t=sa();if(!t||t.deviceId!==e.deviceId)return null;const n=na(e.role),s=t.tokens[n];return!s||typeof s.token!="string"?null:s}function el(e){const t=na(e.role),n={version:1,deviceId:e.deviceId,tokens:{}},s=sa();s&&s.deviceId===e.deviceId&&(n.tokens={...s.tokens});const i={token:e.token,role:t,scopes:su(e.scopes),updatedAtMs:Date.now()};return n.tokens[t]=i,Jr(n),i}function tl(e){const t=sa();if(!t||t.deviceId!==e.deviceId)return;const n=na(e.role);if(!t.tokens[n])return;const s={...t,tokens:{...t.tokens}};delete s.tokens[n],Jr(s)}const nl={p:0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffedn,n:0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3edn,h:8n,a:0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffecn,d:0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3n,Gx:0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51an,Gy:0x6666666666666666666666666666666666666666666666666666666666666658n},{p:ye,n:ss,Gx:fo,Gy:ho,a:qs,d:Vs,h:au}=nl,Ot=32,ia=64,ou=(...e)=>{"captureStackTrace"in Error&&typeof Error.captureStackTrace=="function"&&Error.captureStackTrace(...e)},ge=(e="")=>{const t=new Error(e);throw ou(t,ge),t},ru=e=>typeof e=="bigint",lu=e=>typeof e=="string",cu=e=>e instanceof Uint8Array||ArrayBuffer.isView(e)&&e.constructor.name==="Uint8Array",mt=(e,t,n="")=>{const s=cu(e),i=e?.length,a=t!==void 0;if(!s||a&&i!==t){const o=n&&`"${n}" `,r=a?` of length ${t}`:"",c=s?`length=${i}`:`type=${typeof e}`;ge(o+"expected Uint8Array"+r+", got "+c)}return e},Cs=e=>new Uint8Array(e),sl=e=>Uint8Array.from(e),il=(e,t)=>e.toString(16).padStart(t,"0"),al=e=>Array.from(mt(e)).map(t=>il(t,2)).join(""),Xe={_0:48,_9:57,A:65,F:70,a:97,f:102},vo=e=>{if(e>=Xe._0&&e<=Xe._9)return e-Xe._0;if(e>=Xe.A&&e<=Xe.F)return e-(Xe.A-10);if(e>=Xe.a&&e<=Xe.f)return e-(Xe.a-10)},ol=e=>{const t="hex invalid";if(!lu(e))return ge(t);const n=e.length,s=n/2;if(n%2)return ge(t);const i=Cs(s);for(let a=0,o=0;a<s;a++,o+=2){const r=vo(e.charCodeAt(o)),c=vo(e.charCodeAt(o+1));if(r===void 0||c===void 0)return ge(t);i[a]=r*16+c}return i},rl=()=>globalThis?.crypto,du=()=>rl()?.subtle??ge("crypto.subtle must be defined, consider polyfill"),En=(...e)=>{const t=Cs(e.reduce((s,i)=>s+mt(i).length,0));let n=0;return e.forEach(s=>{t.set(s,n),n+=s.length}),t},uu=(e=Ot)=>rl().getRandomValues(Cs(e)),ds=BigInt,Tt=(e,t,n,s="bad number: out of range")=>ru(e)&&t<=e&&e<n?e:ge(s),N=(e,t=ye)=>{const n=e%t;return n>=0n?n:t+n},ll=e=>N(e,ss),gu=(e,t)=>{(e===0n||t<=0n)&&ge("no inverse n="+e+" mod="+t);let n=N(e,t),s=t,i=0n,a=1n;for(;n!==0n;){const o=s/n,r=s%n,c=i-a*o;s=n,n=r,i=a,a=c}return s===1n?N(i,t):ge("no inverse")},pu=e=>{const t=gl[e];return typeof t!="function"&&ge("hashes."+e+" not set"),t},Gs=e=>e instanceof Me?e:ge("Point expected"),bi=2n**256n;class Me{static BASE;static ZERO;X;Y;Z;T;constructor(t,n,s,i){const a=bi;this.X=Tt(t,0n,a),this.Y=Tt(n,0n,a),this.Z=Tt(s,1n,a),this.T=Tt(i,0n,a),Object.freeze(this)}static CURVE(){return nl}static fromAffine(t){return new Me(t.x,t.y,1n,N(t.x*t.y))}static fromBytes(t,n=!1){const s=Vs,i=sl(mt(t,Ot)),a=t[31];i[31]=a&-129;const o=dl(i);Tt(o,0n,n?bi:ye);const c=N(o*o),d=N(c-1n),g=N(s*c+1n);let{isValid:p,value:h}=hu(d,g);p||ge("bad point: y not sqrt");const u=(h&1n)===1n,f=(a&128)!==0;return!n&&h===0n&&f&&ge("bad point: x==0, isLastByteOdd"),f!==u&&(h=N(-h)),new Me(h,o,1n,N(h*o))}static fromHex(t,n){return Me.fromBytes(ol(t),n)}get x(){return this.toAffine().x}get y(){return this.toAffine().y}assertValidity(){const t=qs,n=Vs,s=this;if(s.is0())return ge("bad point: ZERO");const{X:i,Y:a,Z:o,T:r}=s,c=N(i*i),d=N(a*a),g=N(o*o),p=N(g*g),h=N(c*t),u=N(g*N(h+d)),f=N(p+N(n*N(c*d)));if(u!==f)return ge("bad point: equation left != right (1)");const v=N(i*a),$=N(o*r);return v!==$?ge("bad point: equation left != right (2)"):this}equals(t){const{X:n,Y:s,Z:i}=this,{X:a,Y:o,Z:r}=Gs(t),c=N(n*r),d=N(a*i),g=N(s*r),p=N(o*i);return c===d&&g===p}is0(){return this.equals(Yt)}negate(){return new Me(N(-this.X),this.Y,this.Z,N(-this.T))}double(){const{X:t,Y:n,Z:s}=this,i=qs,a=N(t*t),o=N(n*n),r=N(2n*N(s*s)),c=N(i*a),d=t+n,g=N(N(d*d)-a-o),p=c+o,h=p-r,u=c-o,f=N(g*h),v=N(p*u),$=N(g*u),S=N(h*p);return new Me(f,v,S,$)}add(t){const{X:n,Y:s,Z:i,T:a}=this,{X:o,Y:r,Z:c,T:d}=Gs(t),g=qs,p=Vs,h=N(n*o),u=N(s*r),f=N(a*p*d),v=N(i*c),$=N((n+s)*(o+r)-h-u),S=N(v-f),C=N(v+f),k=N(u-g*h),A=N($*S),E=N(C*k),T=N($*k),I=N(S*C);return new Me(A,E,I,T)}subtract(t){return this.add(Gs(t).negate())}multiply(t,n=!0){if(!n&&(t===0n||this.is0()))return Yt;if(Tt(t,1n,ss),t===1n)return this;if(this.equals(Bt))return Cu(t).p;let s=Yt,i=Bt;for(let a=this;t>0n;a=a.double(),t>>=1n)t&1n?s=s.add(a):n&&(i=i.add(a));return s}multiplyUnsafe(t){return this.multiply(t,!1)}toAffine(){const{X:t,Y:n,Z:s}=this;if(this.equals(Yt))return{x:0n,y:1n};const i=gu(s,ye);N(s*i)!==1n&&ge("invalid inverse");const a=N(t*i),o=N(n*i);return{x:a,y:o}}toBytes(){const{x:t,y:n}=this.assertValidity().toAffine(),s=cl(n);return s[31]|=t&1n?128:0,s}toHex(){return al(this.toBytes())}clearCofactor(){return this.multiply(ds(au),!1)}isSmallOrder(){return this.clearCofactor().is0()}isTorsionFree(){let t=this.multiply(ss/2n,!1).double();return ss%2n&&(t=t.add(this)),t.is0()}}const Bt=new Me(fo,ho,1n,N(fo*ho)),Yt=new Me(0n,1n,1n,0n);Me.BASE=Bt;Me.ZERO=Yt;const cl=e=>ol(il(Tt(e,0n,bi),ia)).reverse(),dl=e=>ds("0x"+al(sl(mt(e)).reverse())),Ue=(e,t)=>{let n=e;for(;t-- >0n;)n*=n,n%=ye;return n},fu=e=>{const n=e*e%ye*e%ye,s=Ue(n,2n)*n%ye,i=Ue(s,1n)*e%ye,a=Ue(i,5n)*i%ye,o=Ue(a,10n)*a%ye,r=Ue(o,20n)*o%ye,c=Ue(r,40n)*r%ye,d=Ue(c,80n)*c%ye,g=Ue(d,80n)*c%ye,p=Ue(g,10n)*a%ye;return{pow_p_5_8:Ue(p,2n)*e%ye,b2:n}},mo=0x2b8324804fc1df0b2b4d00993dfbd7a72f431806ad2fe478c4ee1b274a0ea0b0n,hu=(e,t)=>{const n=N(t*t*t),s=N(n*n*t),i=fu(e*s).pow_p_5_8;let a=N(e*n*i);const o=N(t*a*a),r=a,c=N(a*mo),d=o===e,g=o===N(-e),p=o===N(-e*mo);return d&&(a=r),(g||p)&&(a=c),(N(a)&1n)===1n&&(a=N(-a)),{isValid:d||g,value:a}},yi=e=>ll(dl(e)),aa=(...e)=>gl.sha512Async(En(...e)),vu=(...e)=>pu("sha512")(En(...e)),ul=e=>{const t=e.slice(0,Ot);t[0]&=248,t[31]&=127,t[31]|=64;const n=e.slice(Ot,ia),s=yi(t),i=Bt.multiply(s),a=i.toBytes();return{head:t,prefix:n,scalar:s,point:i,pointBytes:a}},oa=e=>aa(mt(e,Ot)).then(ul),mu=e=>ul(vu(mt(e,Ot))),bu=e=>oa(e).then(t=>t.pointBytes),yu=e=>aa(e.hashable).then(e.finish),xu=(e,t,n)=>{const{pointBytes:s,scalar:i}=e,a=yi(t),o=Bt.multiply(a).toBytes();return{hashable:En(o,s,n),finish:d=>{const g=ll(a+yi(d)*i);return mt(En(o,cl(g)),ia)}}},$u=async(e,t)=>{const n=mt(e),s=await oa(t),i=await aa(s.prefix,n);return yu(xu(s,i,n))},gl={sha512Async:async e=>{const t=du(),n=En(e);return Cs(await t.digest("SHA-512",n.buffer))},sha512:void 0},wu=(e=uu(Ot))=>e,ku={getExtendedPublicKeyAsync:oa,getExtendedPublicKey:mu,randomSecretKey:wu},us=8,Su=256,pl=Math.ceil(Su/us)+1,xi=2**(us-1),Au=()=>{const e=[];let t=Bt,n=t;for(let s=0;s<pl;s++){n=t,e.push(n);for(let i=1;i<xi;i++)n=n.add(t),e.push(n);t=n.double()}return e};let bo;const yo=(e,t)=>{const n=t.negate();return e?n:t},Cu=e=>{const t=bo||(bo=Au());let n=Yt,s=Bt;const i=2**us,a=i,o=ds(i-1),r=ds(us);for(let c=0;c<pl;c++){let d=Number(e&o);e>>=r,d>xi&&(d-=a,e+=1n);const g=c*xi,p=g,h=g+Math.abs(d)-1,u=c%2!==0,f=d<0;d===0?s=s.add(yo(u,t[p])):n=n.add(yo(f,t[h]))}return e!==0n&&ge("invalid wnaf"),{p:n,f:s}},Qs="openclaw-device-identity-v1";function $i(e){let t="";for(const n of e)t+=String.fromCharCode(n);return btoa(t).replaceAll("+","-").replaceAll("/","_").replace(/=+$/g,"")}function fl(e){const t=e.replaceAll("-","+").replaceAll("_","/"),n=t+"=".repeat((4-t.length%4)%4),s=atob(n),i=new Uint8Array(s.length);for(let a=0;a<s.length;a+=1)i[a]=s.charCodeAt(a);return i}function Tu(e){return Array.from(e).map(t=>t.toString(16).padStart(2,"0")).join("")}async function hl(e){const t=await crypto.subtle.digest("SHA-256",e.slice().buffer);return Tu(new Uint8Array(t))}async function _u(){const e=ku.randomSecretKey(),t=await bu(e);return{deviceId:await hl(t),publicKey:$i(t),privateKey:$i(e)}}async function ra(){try{const n=localStorage.getItem(Qs);if(n){const s=JSON.parse(n);if(s?.version===1&&typeof s.deviceId=="string"&&typeof s.publicKey=="string"&&typeof s.privateKey=="string"){const i=await hl(fl(s.publicKey));if(i!==s.deviceId){const a={...s,deviceId:i};return localStorage.setItem(Qs,JSON.stringify(a)),{deviceId:i,publicKey:s.publicKey,privateKey:s.privateKey}}return{deviceId:s.deviceId,publicKey:s.publicKey,privateKey:s.privateKey}}}}catch{}const e=await _u(),t={version:1,deviceId:e.deviceId,publicKey:e.publicKey,privateKey:e.privateKey,createdAtMs:Date.now()};return localStorage.setItem(Qs,JSON.stringify(t)),e}async function Eu(e,t){const n=fl(e),s=new TextEncoder().encode(t),i=await $u(s,n);return $i(i)}async function bt(e,t){if(!(!e.client||!e.connected)&&!e.devicesLoading){e.devicesLoading=!0,t?.quiet||(e.devicesError=null);try{const n=await e.client.request("device.pair.list",{});e.devicesList={pending:Array.isArray(n?.pending)?n.pending:[],paired:Array.isArray(n?.paired)?n.paired:[]}}catch(n){t?.quiet||(e.devicesError=String(n))}finally{e.devicesLoading=!1}}}async function Lu(e,t){if(!(!e.client||!e.connected))try{await e.client.request("device.pair.approve",{requestId:t}),await bt(e)}catch(n){e.devicesError=String(n)}}async function Mu(e,t){if(!(!e.client||!e.connected||!window.confirm("Reject this device pairing request?")))try{await e.client.request("device.pair.reject",{requestId:t}),await bt(e)}catch(s){e.devicesError=String(s)}}async function Iu(e,t){if(!(!e.client||!e.connected))try{const n=await e.client.request("device.token.rotate",t);if(n?.token){const s=await ra(),i=n.role??t.role;(n.deviceId===s.deviceId||t.deviceId===s.deviceId)&&el({deviceId:s.deviceId,role:i,token:n.token,scopes:n.scopes??t.scopes??[]}),window.prompt("New device token (copy and store securely):",n.token)}await bt(e)}catch(n){e.devicesError=String(n)}}async function Ru(e,t){if(!(!e.client||!e.connected||!window.confirm(`Revoke token for ${t.deviceId} (${t.role})?`)))try{await e.client.request("device.token.revoke",t);const s=await ra();t.deviceId===s.deviceId&&tl({deviceId:s.deviceId,role:t.role}),await bt(e)}catch(s){e.devicesError=String(s)}}function Pu(e){if(!e||e.kind==="gateway")return{method:"exec.approvals.get",params:{}};const t=e.nodeId.trim();return t?{method:"exec.approvals.node.get",params:{nodeId:t}}:null}function Du(e,t){if(!e||e.kind==="gateway")return{method:"exec.approvals.set",params:t};const n=e.nodeId.trim();return n?{method:"exec.approvals.node.set",params:{...t,nodeId:n}}:null}async function la(e,t){if(!(!e.client||!e.connected)&&!e.execApprovalsLoading){e.execApprovalsLoading=!0,e.lastError=null;try{const n=Pu(t);if(!n){e.lastError="Select a node before loading exec approvals.";return}const s=await e.client.request(n.method,n.params);Fu(e,s)}catch(n){e.lastError=String(n)}finally{e.execApprovalsLoading=!1}}}function Fu(e,t){e.execApprovalsSnapshot=t,e.execApprovalsDirty||(e.execApprovalsForm=Ft(t.file??{}))}async function Nu(e,t){if(!(!e.client||!e.connected)){e.execApprovalsSaving=!0,e.lastError=null;try{const n=e.execApprovalsSnapshot?.hash;if(!n){e.lastError="Exec approvals hash missing; reload and retry.";return}const s=e.execApprovalsForm??e.execApprovalsSnapshot?.file??{},i=Du(t,{file:s,baseHash:n});if(!i){e.lastError="Select a node before saving exec approvals.";return}await e.client.request(i.method,i.params),e.execApprovalsDirty=!1,await la(e,t)}catch(n){e.lastError=String(n)}finally{e.execApprovalsSaving=!1}}}function Ou(e,t,n){const s=Ft(e.execApprovalsForm??e.execApprovalsSnapshot?.file??{});Or(s,t,n),e.execApprovalsForm=s,e.execApprovalsDirty=!0}function Bu(e,t){const n=Ft(e.execApprovalsForm??e.execApprovalsSnapshot?.file??{});Br(n,t),e.execApprovalsForm=n,e.execApprovalsDirty=!0}async function ca(e){if(!(!e.client||!e.connected)&&!e.presenceLoading){e.presenceLoading=!0,e.presenceError=null,e.presenceStatus=null;try{const t=await e.client.request("system-presence",{});Array.isArray(t)?(e.presenceEntries=t,e.presenceStatus=t.length===0?"No instances yet.":null):(e.presenceEntries=[],e.presenceStatus="No presence payload.")}catch(t){e.presenceError=String(t)}finally{e.presenceLoading=!1}}}async function Ut(e,t){if(!(!e.client||!e.connected)&&!e.sessionsLoading){e.sessionsLoading=!0,e.sessionsError=null;try{const n=t?.includeGlobal??e.sessionsIncludeGlobal,s=t?.includeUnknown??e.sessionsIncludeUnknown,i=t?.activeMinutes??cs(e.sessionsFilterActive,0),a=t?.limit??cs(e.sessionsFilterLimit,0),o={includeGlobal:n,includeUnknown:s};i>0&&(o.activeMinutes=i),a>0&&(o.limit=a);const r=await e.client.request("sessions.list",o);r&&(e.sessionsResult=r)}catch(n){e.sessionsError=String(n)}finally{e.sessionsLoading=!1}}}async function zu(e,t,n){if(!e.client||!e.connected)return;const s={key:t};"label"in n&&(s.label=n.label),"thinkingLevel"in n&&(s.thinkingLevel=n.thinkingLevel),"verboseLevel"in n&&(s.verboseLevel=n.verboseLevel),"reasoningLevel"in n&&(s.reasoningLevel=n.reasoningLevel);try{await e.client.request("sessions.patch",s),await Ut(e)}catch(i){e.sessionsError=String(i)}}async function Uu(e,t){if(!e.client||!e.connected||e.sessionsLoading||!window.confirm(`Delete session "${t}"?

Deletes the session entry and archives its transcript.`))return!1;e.sessionsLoading=!0,e.sessionsError=null;try{return await e.client.request("sessions.delete",{key:t,deleteTranscript:!0}),!0}catch(s){return e.sessionsError=String(s),!1}finally{e.sessionsLoading=!1}}async function Hu(e,t){return await Uu(e,t)?(await Ut(e),!0):!1}function en(e,t,n){if(!t.trim())return;const s={...e.skillMessages};n?s[t]=n:delete s[t],e.skillMessages=s}function Ts(e){return e instanceof Error?e.message:String(e)}async function Pn(e,t){if(t?.clearMessages&&Object.keys(e.skillMessages).length>0&&(e.skillMessages={}),!(!e.client||!e.connected)&&!e.skillsLoading){e.skillsLoading=!0,e.skillsError=null;try{const n=await e.client.request("skills.status",{});n&&(e.skillsReport=n)}catch(n){e.skillsError=Ts(n)}finally{e.skillsLoading=!1}}}function ju(e,t,n){e.skillEdits={...e.skillEdits,[t]:n}}async function Ku(e,t,n){if(!(!e.client||!e.connected)){e.skillsBusyKey=t,e.skillsError=null;try{await e.client.request("skills.update",{skillKey:t,enabled:n}),await Pn(e),en(e,t,{kind:"success",message:n?"Skill enabled":"Skill disabled"})}catch(s){const i=Ts(s);e.skillsError=i,en(e,t,{kind:"error",message:i})}finally{e.skillsBusyKey=null}}}async function Wu(e,t){if(!(!e.client||!e.connected)){e.skillsBusyKey=t,e.skillsError=null;try{const n=e.skillEdits[t]??"";await e.client.request("skills.update",{skillKey:t,apiKey:n}),await Pn(e),en(e,t,{kind:"success",message:"API key saved"})}catch(n){const s=Ts(n);e.skillsError=s,en(e,t,{kind:"error",message:s})}finally{e.skillsBusyKey=null}}}async function qu(e,t,n,s){if(!(!e.client||!e.connected)){e.skillsBusyKey=t,e.skillsError=null;try{const i=await e.client.request("skills.install",{name:n,installId:s,timeoutMs:12e4});await Pn(e),en(e,t,{kind:"success",message:i?.message??"Installed"})}catch(i){const a=Ts(i);e.skillsError=a,en(e,t,{kind:"error",message:a})}finally{e.skillsBusyKey=null}}}const Vu=[{label:"chat",tabs:["chat"]},{label:"control",tabs:["overview","channels","instances","sessions","usage","cron"]},{label:"agent",tabs:["agents","skills","nodes"]},{label:"settings",tabs:["config","debug","logs"]}],vl={agents:"/agents",overview:"/overview",channels:"/channels",instances:"/instances",sessions:"/sessions",usage:"/usage",cron:"/cron",skills:"/skills",nodes:"/nodes",chat:"/chat",config:"/config",debug:"/debug",logs:"/logs"},ml=new Map(Object.entries(vl).map(([e,t])=>[t,e]));function nn(e){if(!e)return"";let t=e.trim();return t.startsWith("/")||(t=`/${t}`),t==="/"?"":(t.endsWith("/")&&(t=t.slice(0,-1)),t)}function Ln(e){if(!e)return"/";let t=e.trim();return t.startsWith("/")||(t=`/${t}`),t.length>1&&t.endsWith("/")&&(t=t.slice(0,-1)),t}function _s(e,t=""){const n=nn(t),s=vl[e];return n?`${n}${s}`:s}function bl(e,t=""){const n=nn(t);let s=e||"/";n&&(s===n?s="/":s.startsWith(`${n}/`)&&(s=s.slice(n.length)));let i=Ln(s).toLowerCase();return i.endsWith("/index.html")&&(i="/"),i==="/"?"chat":ml.get(i)??null}function Gu(e){let t=Ln(e);if(t.endsWith("/index.html")&&(t=Ln(t.slice(0,-11))),t==="/")return"";const n=t.split("/").filter(Boolean);if(n.length===0)return"";for(let s=0;s<n.length;s++){const i=`/${n.slice(s).join("/")}`.toLowerCase();if(ml.has(i)){const a=n.slice(0,s);return a.length?`/${a.join("/")}`:""}}return`/${n.join("/")}`}function Qu(e){switch(e){case"agents":return"folder";case"chat":return"messageSquare";case"overview":return"barChart";case"channels":return"link";case"instances":return"radio";case"sessions":return"fileText";case"usage":return"barChart";case"cron":return"loader";case"skills":return"zap";case"nodes":return"monitor";case"config":return"settings";case"debug":return"bug";case"logs":return"scrollText";default:return"folder"}}function wi(e){return P(`tabs.${e}`)}function Yu(e){return P(`subtitles.${e}`)}const yl="openclaw.control.settings.v1";function Zu(){const t={gatewayUrl:`${location.protocol==="https:"?"wss":"ws"}://${location.host}`,token:"",sessionKey:"main",lastActiveSessionKey:"main",theme:"system",chatFocusMode:!1,chatShowThinking:!0,splitRatio:.6,navCollapsed:!1,navGroupsCollapsed:{}};try{const n=localStorage.getItem(yl);if(!n)return t;const s=JSON.parse(n);return{gatewayUrl:typeof s.gatewayUrl=="string"&&s.gatewayUrl.trim()?s.gatewayUrl.trim():t.gatewayUrl,token:typeof s.token=="string"?s.token:t.token,sessionKey:typeof s.sessionKey=="string"&&s.sessionKey.trim()?s.sessionKey.trim():t.sessionKey,lastActiveSessionKey:typeof s.lastActiveSessionKey=="string"&&s.lastActiveSessionKey.trim()?s.lastActiveSessionKey.trim():typeof s.sessionKey=="string"&&s.sessionKey.trim()||t.lastActiveSessionKey,theme:s.theme==="light"||s.theme==="dark"||s.theme==="system"?s.theme:t.theme,chatFocusMode:typeof s.chatFocusMode=="boolean"?s.chatFocusMode:t.chatFocusMode,chatShowThinking:typeof s.chatShowThinking=="boolean"?s.chatShowThinking:t.chatShowThinking,splitRatio:typeof s.splitRatio=="number"&&s.splitRatio>=.4&&s.splitRatio<=.7?s.splitRatio:t.splitRatio,navCollapsed:typeof s.navCollapsed=="boolean"?s.navCollapsed:t.navCollapsed,navGroupsCollapsed:typeof s.navGroupsCollapsed=="object"&&s.navGroupsCollapsed!==null?s.navGroupsCollapsed:t.navGroupsCollapsed,locale:qi(s.locale)?s.locale:void 0}}catch{return t}}function Xu(e){localStorage.setItem(yl,JSON.stringify(e))}const Un=e=>Number.isNaN(e)?.5:e<=0?0:e>=1?1:e,Ju=()=>typeof window>"u"||typeof window.matchMedia!="function"?!1:window.matchMedia("(prefers-reduced-motion: reduce)").matches??!1,Hn=e=>{e.classList.remove("theme-transition"),e.style.removeProperty("--theme-switch-x"),e.style.removeProperty("--theme-switch-y")},eg=({nextTheme:e,applyTheme:t,context:n,currentTheme:s})=>{if(s===e)return;const i=globalThis.document??null;if(!i){t();return}const a=i.documentElement,o=i,r=Ju();if(!!o.startViewTransition&&!r){let d=.5,g=.5;if(n?.pointerClientX!==void 0&&n?.pointerClientY!==void 0&&typeof window<"u")d=Un(n.pointerClientX/window.innerWidth),g=Un(n.pointerClientY/window.innerHeight);else if(n?.element){const p=n.element.getBoundingClientRect();p.width>0&&p.height>0&&typeof window<"u"&&(d=Un((p.left+p.width/2)/window.innerWidth),g=Un((p.top+p.height/2)/window.innerHeight))}a.style.setProperty("--theme-switch-x",`${d*100}%`),a.style.setProperty("--theme-switch-y",`${g*100}%`),a.classList.add("theme-transition");try{const p=o.startViewTransition?.(()=>{t()});p?.finished?p.finished.finally(()=>Hn(a)):Hn(a)}catch{Hn(a),t()}return}t(),Hn(a)};function tg(){return typeof window>"u"||typeof window.matchMedia!="function"||window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}function da(e){return e==="system"?tg():e}function ht(e,t){const n={...t,lastActiveSessionKey:t.lastActiveSessionKey?.trim()||t.sessionKey.trim()||"main"};e.settings=n,Xu(n),t.theme!==e.theme&&(e.theme=t.theme,Es(e,da(t.theme))),e.applySessionKey=e.settings.lastActiveSessionKey}function xl(e,t){const n=t.trim();n&&e.settings.lastActiveSessionKey!==n&&ht(e,{...e.settings,lastActiveSessionKey:n})}function ng(e){if(!window.location.search&&!window.location.hash)return;const t=new URL(window.location.href),n=new URLSearchParams(t.search),s=new URLSearchParams(t.hash.startsWith("#")?t.hash.slice(1):t.hash),i=n.get("token")??s.get("token"),a=n.get("password")??s.get("password"),o=n.get("session")??s.get("session"),r=n.get("gatewayUrl")??s.get("gatewayUrl");let c=!1;if(i!=null){const g=i.trim();g&&g!==e.settings.token&&ht(e,{...e.settings,token:g}),n.delete("token"),s.delete("token"),c=!0}if(a!=null&&(n.delete("password"),s.delete("password"),c=!0),o!=null){const g=o.trim();g&&(e.sessionKey=g,ht(e,{...e.settings,sessionKey:g,lastActiveSessionKey:g}))}if(r!=null){const g=r.trim();g&&g!==e.settings.gatewayUrl&&(e.pendingGatewayUrl=g),n.delete("gatewayUrl"),s.delete("gatewayUrl"),c=!0}if(!c)return;t.search=n.toString();const d=s.toString();t.hash=d?`#${d}`:"",window.history.replaceState({},"",t.toString())}function sg(e,t){e.tab!==t&&(e.tab=t),t==="chat"&&(e.chatHasAutoScrolled=!1),t==="logs"?Qi(e):Yi(e),t==="debug"?Zi(e):Xi(e),ua(e),wl(e,t,!1)}function ig(e,t,n){eg({nextTheme:t,applyTheme:()=>{e.theme=t,ht(e,{...e.settings,theme:t}),Es(e,da(t))},context:n,currentTheme:e.theme})}async function ua(e){if(e.tab==="overview"&&await kl(e),e.tab==="channels"&&await gg(e),e.tab==="instances"&&await ca(e),e.tab==="sessions"&&await Ut(e),e.tab==="cron"&&await gs(e),e.tab==="skills"&&await Pn(e),e.tab==="agents"){await Ji(e),await Ne(e);const t=e.agentsList?.agents?.map(s=>s.id)??[];t.length>0&&Gr(e,t);const n=e.agentsSelectedId??e.agentsList?.defaultId??e.agentsList?.agents?.[0]?.id;n&&(Vr(e,n),e.agentsPanel==="skills"&&ns(e,n),e.agentsPanel==="channels"&&Ce(e,!1),e.agentsPanel==="cron"&&gs(e))}e.tab==="nodes"&&(await Ss(e),await bt(e),await Ne(e),await la(e)),e.tab==="chat"&&(await Ll(e),In(e,!e.chatHasAutoScrolled)),e.tab==="config"&&(await zr(e),await Ne(e)),e.tab==="debug"&&(await ks(e),e.eventLog=e.eventLogBuffer),e.tab==="logs"&&(e.logsAtBottom=!0,await Gi(e,{reset:!0}),qr(e,!0))}function ag(){if(typeof window>"u")return"";const e=window.__OPENCLAW_CONTROL_UI_BASE_PATH__;return typeof e=="string"&&e.trim()?nn(e):Gu(window.location.pathname)}function og(e){e.theme=e.settings.theme??"system",Es(e,da(e.theme))}function Es(e,t){if(e.themeResolved=t,typeof document>"u")return;const n=document.documentElement;n.dataset.theme=t,n.style.colorScheme=t}function rg(e){if(typeof window>"u"||typeof window.matchMedia!="function")return;if(e.themeMedia=window.matchMedia("(prefers-color-scheme: dark)"),e.themeMediaHandler=n=>{e.theme==="system"&&Es(e,n.matches?"dark":"light")},typeof e.themeMedia.addEventListener=="function"){e.themeMedia.addEventListener("change",e.themeMediaHandler);return}e.themeMedia.addListener(e.themeMediaHandler)}function lg(e){if(!e.themeMedia||!e.themeMediaHandler)return;if(typeof e.themeMedia.removeEventListener=="function"){e.themeMedia.removeEventListener("change",e.themeMediaHandler);return}e.themeMedia.removeListener(e.themeMediaHandler),e.themeMedia=null,e.themeMediaHandler=null}function cg(e,t){if(typeof window>"u")return;const n=bl(window.location.pathname,e.basePath)??"chat";$l(e,n),wl(e,n,t)}function dg(e){if(typeof window>"u")return;const t=bl(window.location.pathname,e.basePath);if(!t)return;const s=new URL(window.location.href).searchParams.get("session")?.trim();s&&(e.sessionKey=s,ht(e,{...e.settings,sessionKey:s,lastActiveSessionKey:s})),$l(e,t)}function $l(e,t){e.tab!==t&&(e.tab=t),t==="chat"&&(e.chatHasAutoScrolled=!1),t==="logs"?Qi(e):Yi(e),t==="debug"?Zi(e):Xi(e),e.connected&&ua(e)}function wl(e,t,n){if(typeof window>"u")return;const s=Ln(_s(t,e.basePath)),i=Ln(window.location.pathname),a=new URL(window.location.href);t==="chat"&&e.sessionKey?a.searchParams.set("session",e.sessionKey):a.searchParams.delete("session"),i!==s&&(a.pathname=s),n?window.history.replaceState({},"",a.toString()):window.history.pushState({},"",a.toString())}function ug(e,t,n){if(typeof window>"u")return;const s=new URL(window.location.href);s.searchParams.set("session",t),window.history.replaceState({},"",s.toString())}async function kl(e){await Promise.all([Ce(e,!1),ca(e),Ut(e),Rn(e),ks(e)])}async function gg(e){await Promise.all([Ce(e,!0),zr(e),Ne(e)])}async function gs(e){await Promise.all([Ce(e,!1),Rn(e),As(e)])}const xo=50,pg=80,fg=12e4;function hg(e){if(!e||typeof e!="object")return null;const t=e;if(typeof t.text=="string")return t.text;const n=t.content;if(!Array.isArray(n))return null;const s=n.map(i=>{if(!i||typeof i!="object")return null;const a=i;return a.type==="text"&&typeof a.text=="string"?a.text:null}).filter(i=>!!i);return s.length===0?null:s.join(`
`)}function $o(e){if(e==null)return null;if(typeof e=="number"||typeof e=="boolean")return String(e);const t=hg(e);let n;if(typeof e=="string")n=e;else if(t)n=t;else try{n=JSON.stringify(e,null,2)}catch{n=String(e)}const s=Qr(n,fg);return s.truncated?`${s.text}

… truncated (${s.total} chars, showing first ${s.text.length}).`:s.text}function vg(e){const t=[];return t.push({type:"toolcall",name:e.name,arguments:e.args??{}}),e.output&&t.push({type:"toolresult",name:e.name,text:e.output}),{role:"assistant",toolCallId:e.toolCallId,runId:e.runId,content:t,timestamp:e.startedAt}}function mg(e){if(e.toolStreamOrder.length<=xo)return;const t=e.toolStreamOrder.length-xo,n=e.toolStreamOrder.splice(0,t);for(const s of n)e.toolStreamById.delete(s)}function bg(e){e.chatToolMessages=e.toolStreamOrder.map(t=>e.toolStreamById.get(t)?.message).filter(t=>!!t)}function ki(e){e.toolStreamSyncTimer!=null&&(clearTimeout(e.toolStreamSyncTimer),e.toolStreamSyncTimer=null),bg(e)}function yg(e,t=!1){if(t){ki(e);return}e.toolStreamSyncTimer==null&&(e.toolStreamSyncTimer=window.setTimeout(()=>ki(e),pg))}function Ls(e){e.toolStreamById.clear(),e.toolStreamOrder=[],e.chatToolMessages=[],ki(e)}const xg=5e3;function $g(e,t){const n=t.data??{},s=typeof n.phase=="string"?n.phase:"";e.compactionClearTimer!=null&&(window.clearTimeout(e.compactionClearTimer),e.compactionClearTimer=null),s==="start"?e.compactionStatus={active:!0,startedAt:Date.now(),completedAt:null}:s==="end"&&(e.compactionStatus={active:!1,startedAt:e.compactionStatus?.startedAt??null,completedAt:Date.now()},e.compactionClearTimer=window.setTimeout(()=>{e.compactionStatus=null,e.compactionClearTimer=null},xg))}function wg(e,t){if(!t)return;if(t.stream==="compaction"){$g(e,t);return}if(t.stream!=="tool")return;const n=typeof t.sessionKey=="string"?t.sessionKey:void 0;if(n&&n!==e.sessionKey||!n&&e.chatRunId&&t.runId!==e.chatRunId||e.chatRunId&&t.runId!==e.chatRunId||!e.chatRunId)return;const s=t.data??{},i=typeof s.toolCallId=="string"?s.toolCallId:"";if(!i)return;const a=typeof s.name=="string"?s.name:"tool",o=typeof s.phase=="string"?s.phase:"",r=o==="start"?s.args:void 0,c=o==="update"?$o(s.partialResult):o==="result"?$o(s.result):void 0,d=Date.now();let g=e.toolStreamById.get(i);g?(g.name=a,r!==void 0&&(g.args=r),c!==void 0&&(g.output=c||void 0),g.updatedAt=d):(g={toolCallId:i,runId:t.runId,sessionKey:n,name:a,args:r,output:c||void 0,startedAt:typeof t.ts=="number"?t.ts:d,updatedAt:d,message:{}},e.toolStreamById.set(i,g),e.toolStreamOrder.push(i)),g.message=vg(g),mg(e),yg(e,o==="result")}const kg=/^\[([^\]]+)\]\s*/,Sg=["WebChat","WhatsApp","Telegram","Signal","Slack","Discord","Google Chat","iMessage","Teams","Matrix","Zalo","Zalo Personal","BlueBubbles"];function Ag(e){return/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z\b/.test(e)||/\d{4}-\d{2}-\d{2} \d{2}:\d{2}\b/.test(e)?!0:Sg.some(t=>e.startsWith(`${t} `))}function Ys(e){const t=e.match(kg);if(!t)return e;const n=t[1]??"";return Ag(n)?e.slice(t[0].length):e}const Zs=new WeakMap,Xs=new WeakMap;function Si(e){const t=e,n=typeof t.role=="string"?t.role:"",s=t.content;if(typeof s=="string")return n==="assistant"?Ws(s):Ys(s);if(Array.isArray(s)){const i=s.map(a=>{const o=a;return o.type==="text"&&typeof o.text=="string"?o.text:null}).filter(a=>typeof a=="string");if(i.length>0){const a=i.join(`
`);return n==="assistant"?Ws(a):Ys(a)}}return typeof t.text=="string"?n==="assistant"?Ws(t.text):Ys(t.text):null}function Sl(e){if(!e||typeof e!="object")return Si(e);const t=e;if(Zs.has(t))return Zs.get(t)??null;const n=Si(e);return Zs.set(t,n),n}function wo(e){const n=e.content,s=[];if(Array.isArray(n))for(const r of n){const c=r;if(c.type==="thinking"&&typeof c.thinking=="string"){const d=c.thinking.trim();d&&s.push(d)}}if(s.length>0)return s.join(`
`);const i=Tg(e);if(!i)return null;const o=[...i.matchAll(/<\s*think(?:ing)?\s*>([\s\S]*?)<\s*\/\s*think(?:ing)?\s*>/gi)].map(r=>(r[1]??"").trim()).filter(Boolean);return o.length>0?o.join(`
`):null}function Cg(e){if(!e||typeof e!="object")return wo(e);const t=e;if(Xs.has(t))return Xs.get(t)??null;const n=wo(e);return Xs.set(t,n),n}function Tg(e){const t=e,n=t.content;if(typeof n=="string")return n;if(Array.isArray(n)){const s=n.map(i=>{const a=i;return a.type==="text"&&typeof a.text=="string"?a.text:null}).filter(i=>typeof i=="string");if(s.length>0)return s.join(`
`)}return typeof t.text=="string"?t.text:null}function _g(e){const t=e.trim();if(!t)return"";const n=t.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).map(s=>`_${s}_`);return n.length?["_Reasoning:_",...n].join(`
`):""}let ko=!1;function So(e){e[6]=e[6]&15|64,e[8]=e[8]&63|128;let t="";for(let n=0;n<e.length;n++)t+=e[n].toString(16).padStart(2,"0");return`${t.slice(0,8)}-${t.slice(8,12)}-${t.slice(12,16)}-${t.slice(16,20)}-${t.slice(20)}`}function Eg(){const e=new Uint8Array(16),t=Date.now();for(let n=0;n<e.length;n++)e[n]=Math.floor(Math.random()*256);return e[0]^=t&255,e[1]^=t>>>8&255,e[2]^=t>>>16&255,e[3]^=t>>>24&255,e}function Lg(){ko||(ko=!0,console.warn("[uuid] crypto API missing; falling back to weak randomness"))}function ga(e=globalThis.crypto){if(e&&typeof e.randomUUID=="function")return e.randomUUID();if(e&&typeof e.getRandomValues=="function"){const t=new Uint8Array(16);return e.getRandomValues(t),So(t)}return Lg(),So(Eg())}async function Xt(e){if(!(!e.client||!e.connected)){e.chatLoading=!0,e.lastError=null;try{const t=await e.client.request("chat.history",{sessionKey:e.sessionKey,limit:200});e.chatMessages=Array.isArray(t.messages)?t.messages:[],e.chatThinkingLevel=t.thinkingLevel??null}catch(t){e.lastError=String(t)}finally{e.chatLoading=!1}}}function Mg(e){const t=/^data:([^;]+);base64,(.+)$/.exec(e);return t?{mimeType:t[1],content:t[2]}:null}function Ig(e){if(!e||typeof e!="object")return null;const t=e;return t.role!=="assistant"||!("content"in t)||!Array.isArray(t.content)?null:t}async function Rg(e,t,n){if(!e.client||!e.connected)return null;const s=t.trim(),i=n&&n.length>0;if(!s&&!i)return null;const a=Date.now(),o=[];if(s&&o.push({type:"text",text:s}),i)for(const d of n)o.push({type:"image",source:{type:"base64",media_type:d.mimeType,data:d.dataUrl}});e.chatMessages=[...e.chatMessages,{role:"user",content:o,timestamp:a}],e.chatSending=!0,e.lastError=null;const r=ga();e.chatRunId=r,e.chatStream="",e.chatStreamStartedAt=a;const c=i?n.map(d=>{const g=Mg(d.dataUrl);return g?{type:"image",mimeType:g.mimeType,content:g.content}:null}).filter(d=>d!==null):void 0;try{return await e.client.request("chat.send",{sessionKey:e.sessionKey,message:s,deliver:!1,idempotencyKey:r,attachments:c}),r}catch(d){const g=String(d);return e.chatRunId=null,e.chatStream=null,e.chatStreamStartedAt=null,e.lastError=g,e.chatMessages=[...e.chatMessages,{role:"assistant",content:[{type:"text",text:"Error: "+g}],timestamp:Date.now()}],null}finally{e.chatSending=!1}}async function Pg(e){if(!e.client||!e.connected)return!1;const t=e.chatRunId;try{return await e.client.request("chat.abort",t?{sessionKey:e.sessionKey,runId:t}:{sessionKey:e.sessionKey}),!0}catch(n){return e.lastError=String(n),!1}}function Dg(e,t){if(!t||t.sessionKey!==e.sessionKey)return null;if(t.runId&&e.chatRunId&&t.runId!==e.chatRunId)return t.state==="final"?"final":null;if(t.state==="delta"){const n=Si(t.message);if(typeof n=="string"){const s=e.chatStream??"";(!s||n.length>=s.length)&&(e.chatStream=n)}}else if(t.state==="final")e.chatStream=null,e.chatRunId=null,e.chatStreamStartedAt=null;else if(t.state==="aborted"){const n=Ig(t.message);if(n)e.chatMessages=[...e.chatMessages,n];else{const s=e.chatStream??"";s.trim()&&(e.chatMessages=[...e.chatMessages,{role:"assistant",content:[{type:"text",text:s}],timestamp:Date.now()}])}e.chatStream=null,e.chatRunId=null,e.chatStreamStartedAt=null}else t.state==="error"&&(e.chatStream=null,e.chatRunId=null,e.chatStreamStartedAt=null,e.lastError=t.errorMessage??"chat error");return t.state}const Al=120;function Cl(e){return e.chatSending||!!e.chatRunId}function Fg(e){const t=e.trim();if(!t)return!1;const n=t.toLowerCase();return n==="/stop"?!0:n==="stop"||n==="esc"||n==="abort"||n==="wait"||n==="exit"}function Ng(e){const t=e.trim();if(!t)return!1;const n=t.toLowerCase();return n==="/new"||n==="/reset"?!0:n.startsWith("/new ")||n.startsWith("/reset ")}async function Tl(e){e.connected&&(e.chatMessage="",await Pg(e))}function Og(e,t,n,s){const i=t.trim(),a=!!(n&&n.length>0);!i&&!a||(e.chatQueue=[...e.chatQueue,{id:ga(),text:i,createdAt:Date.now(),attachments:a?n?.map(o=>({...o})):void 0,refreshSessions:s}])}async function _l(e,t,n){Ls(e);const s=await Rg(e,t,n?.attachments),i=!!s;return!i&&n?.previousDraft!=null&&(e.chatMessage=n.previousDraft),!i&&n?.previousAttachments&&(e.chatAttachments=n.previousAttachments),i&&xl(e,e.sessionKey),i&&n?.restoreDraft&&n.previousDraft?.trim()&&(e.chatMessage=n.previousDraft),i&&n?.restoreAttachments&&n.previousAttachments?.length&&(e.chatAttachments=n.previousAttachments),In(e),i&&!e.chatRunId&&El(e),i&&n?.refreshSessions&&s&&e.refreshSessionsAfterChat.add(s),i}async function El(e){if(!e.connected||Cl(e))return;const[t,...n]=e.chatQueue;if(!t)return;e.chatQueue=n,await _l(e,t.text,{attachments:t.attachments,refreshSessions:t.refreshSessions})||(e.chatQueue=[t,...e.chatQueue])}function Bg(e,t){e.chatQueue=e.chatQueue.filter(n=>n.id!==t)}async function zg(e,t,n){if(!e.connected)return;const s=e.chatMessage,i=(t??e.chatMessage).trim(),a=e.chatAttachments??[],o=t==null?a:[],r=o.length>0;if(!i&&!r)return;if(Fg(i)){await Tl(e);return}const c=Ng(i);if(t==null&&(e.chatMessage="",e.chatAttachments=[]),Cl(e)){Og(e,i,o,c);return}await _l(e,i,{previousDraft:t==null?s:void 0,restoreDraft:!!(t&&n?.restoreDraft),attachments:r?o:void 0,previousAttachments:t==null?a:void 0,restoreAttachments:!!(t&&n?.restoreDraft),refreshSessions:c})}async function Ll(e,t){await Promise.all([Xt(e),Ut(e,{activeMinutes:Al}),is(e)]),t?.scheduleScroll!==!1&&In(e)}const Ug=El;function Hg(e){const t=Wr(e.sessionKey);return t?.agentId?t.agentId:e.hello?.snapshot?.sessionDefaults?.defaultAgentId?.trim()||"main"}function jg(e,t){const n=nn(e),s=encodeURIComponent(t);return n?`${n}/avatar/${s}?meta=1`:`/avatar/${s}?meta=1`}async function is(e){if(!e.connected){e.chatAvatarUrl=null;return}const t=Hg(e);if(!t){e.chatAvatarUrl=null;return}e.chatAvatarUrl=null;const n=jg(e.basePath,t);try{const s=await fetch(n,{method:"GET"});if(!s.ok){e.chatAvatarUrl=null;return}const i=await s.json(),a=typeof i.avatarUrl=="string"?i.avatarUrl.trim():"";e.chatAvatarUrl=a||null}catch{e.chatAvatarUrl=null}}const Kg={trace:!0,debug:!0,info:!0,warn:!0,error:!0,fatal:!0},Wg={name:"",description:"",agentId:"",enabled:!0,scheduleKind:"every",scheduleAt:"",everyAmount:"30",everyUnit:"minutes",cronExpr:"0 7 * * *",cronTz:"",sessionTarget:"isolated",wakeMode:"now",payloadKind:"agentTurn",payloadText:"",deliveryMode:"announce",deliveryChannel:"last",deliveryTo:"",timeoutSeconds:""},qg=50,Vg=200,Gg="Assistant";function Ao(e,t){if(typeof e!="string")return;const n=e.trim();if(n)return n.length<=t?n:n.slice(0,t)}function pa(e){const t=Ao(e?.name,qg)??Gg,n=Ao(e?.avatar??void 0,Vg)??null;return{agentId:typeof e?.agentId=="string"&&e.agentId.trim()?e.agentId.trim():null,name:t,avatar:n}}async function Ml(e,t){if(!e.client||!e.connected)return;const n=e.sessionKey.trim(),s=n?{sessionKey:n}:{};try{const i=await e.client.request("agent.identity.get",s);if(!i)return;const a=pa(i);e.assistantName=a.name,e.assistantAvatar=a.avatar,e.assistantAgentId=a.agentId??null}catch{}}function Ai(e){return typeof e=="object"&&e!==null}function Qg(e){if(!Ai(e))return null;const t=typeof e.id=="string"?e.id.trim():"",n=e.request;if(!t||!Ai(n))return null;const s=typeof n.command=="string"?n.command.trim():"";if(!s)return null;const i=typeof e.createdAtMs=="number"?e.createdAtMs:0,a=typeof e.expiresAtMs=="number"?e.expiresAtMs:0;return!i||!a?null:{id:t,request:{command:s,cwd:typeof n.cwd=="string"?n.cwd:null,host:typeof n.host=="string"?n.host:null,security:typeof n.security=="string"?n.security:null,ask:typeof n.ask=="string"?n.ask:null,agentId:typeof n.agentId=="string"?n.agentId:null,resolvedPath:typeof n.resolvedPath=="string"?n.resolvedPath:null,sessionKey:typeof n.sessionKey=="string"?n.sessionKey:null},createdAtMs:i,expiresAtMs:a}}function Yg(e){if(!Ai(e))return null;const t=typeof e.id=="string"?e.id.trim():"";return t?{id:t,decision:typeof e.decision=="string"?e.decision:null,resolvedBy:typeof e.resolvedBy=="string"?e.resolvedBy:null,ts:typeof e.ts=="number"?e.ts:null}:null}function Il(e){const t=Date.now();return e.filter(n=>n.expiresAtMs>t)}function Zg(e,t){const n=Il(e).filter(s=>s.id!==t.id);return n.push(t),n}function Co(e,t){return Il(e).filter(n=>n.id!==t)}function Xg(e){const t=e.version??(e.nonce?"v2":"v1"),n=e.scopes.join(","),s=e.token??"",i=[t,e.deviceId,e.clientId,e.clientMode,e.role,n,String(e.signedAtMs),s];return t==="v2"&&i.push(e.nonce??""),i.join("|")}const Rl={WEBCHAT_UI:"webchat-ui",CONTROL_UI:"openclaw-control-ui",WEBCHAT:"webchat",CLI:"cli",GATEWAY_CLIENT:"gateway-client",MACOS_APP:"openclaw-macos",IOS_APP:"openclaw-ios",ANDROID_APP:"openclaw-android",NODE_HOST:"node-host",TEST:"test",FINGERPRINT:"fingerprint",PROBE:"openclaw-probe"},To=Rl,Ci={WEBCHAT:"webchat",CLI:"cli",UI:"ui",BACKEND:"backend",NODE:"node",PROBE:"probe",TEST:"test"};new Set(Object.values(Rl));new Set(Object.values(Ci));const Jg=4008;class ep{constructor(t){this.opts=t,this.ws=null,this.pending=new Map,this.closed=!1,this.lastSeq=null,this.connectNonce=null,this.connectSent=!1,this.connectTimer=null,this.backoffMs=800}start(){this.closed=!1,this.connect()}stop(){this.closed=!0,this.ws?.close(),this.ws=null,this.flushPending(new Error("gateway client stopped"))}get connected(){return this.ws?.readyState===WebSocket.OPEN}connect(){this.closed||(this.ws=new WebSocket(this.opts.url),this.ws.addEventListener("open",()=>this.queueConnect()),this.ws.addEventListener("message",t=>this.handleMessage(String(t.data??""))),this.ws.addEventListener("close",t=>{const n=String(t.reason??"");this.ws=null,this.flushPending(new Error(`gateway closed (${t.code}): ${n}`)),this.opts.onClose?.({code:t.code,reason:n}),this.scheduleReconnect()}),this.ws.addEventListener("error",()=>{}))}scheduleReconnect(){if(this.closed)return;const t=this.backoffMs;this.backoffMs=Math.min(this.backoffMs*1.7,15e3),window.setTimeout(()=>this.connect(),t)}flushPending(t){for(const[,n]of this.pending)n.reject(t);this.pending.clear()}async sendConnect(){if(this.connectSent)return;this.connectSent=!0,this.connectTimer!==null&&(window.clearTimeout(this.connectTimer),this.connectTimer=null);const t=typeof crypto<"u"&&!!crypto.subtle,n=["operator.admin","operator.approvals","operator.pairing"],s="operator";let i=null,a=!1,o=this.opts.token;if(t){i=await ra();const g=iu({deviceId:i.deviceId,role:s})?.token;o=g??this.opts.token,a=!!(g&&this.opts.token)}const r=o||this.opts.password?{token:o,password:this.opts.password}:void 0;let c;if(t&&i){const g=Date.now(),p=this.connectNonce??void 0,h=Xg({deviceId:i.deviceId,clientId:this.opts.clientName??To.CONTROL_UI,clientMode:this.opts.mode??Ci.WEBCHAT,role:s,scopes:n,signedAtMs:g,token:o??null,nonce:p}),u=await Eu(i.privateKey,h);c={id:i.deviceId,publicKey:i.publicKey,signature:u,signedAt:g,nonce:p}}const d={minProtocol:3,maxProtocol:3,client:{id:this.opts.clientName??To.CONTROL_UI,version:this.opts.clientVersion??"dev",platform:this.opts.platform??navigator.platform??"web",mode:this.opts.mode??Ci.WEBCHAT,instanceId:this.opts.instanceId},role:s,scopes:n,device:c,caps:[],auth:r,userAgent:navigator.userAgent,locale:navigator.language};this.request("connect",d).then(g=>{g?.auth?.deviceToken&&i&&el({deviceId:i.deviceId,role:g.auth.role??s,token:g.auth.deviceToken,scopes:g.auth.scopes??[]}),this.backoffMs=800,this.opts.onHello?.(g)}).catch(()=>{a&&i&&tl({deviceId:i.deviceId,role:s}),this.ws?.close(Jg,"connect failed")})}handleMessage(t){let n;try{n=JSON.parse(t)}catch{return}const s=n;if(s.type==="event"){const i=n;if(i.event==="connect.challenge"){const o=i.payload,r=o&&typeof o.nonce=="string"?o.nonce:null;r&&(this.connectNonce=r,this.sendConnect());return}const a=typeof i.seq=="number"?i.seq:null;a!==null&&(this.lastSeq!==null&&a>this.lastSeq+1&&this.opts.onGap?.({expected:this.lastSeq+1,received:a}),this.lastSeq=a);try{this.opts.onEvent?.(i)}catch(o){console.error("[gateway] event handler error:",o)}return}if(s.type==="res"){const i=n,a=this.pending.get(i.id);if(!a)return;this.pending.delete(i.id),i.ok?a.resolve(i.payload):a.reject(new Error(i.error?.message??"request failed"));return}}request(t,n){if(!this.ws||this.ws.readyState!==WebSocket.OPEN)return Promise.reject(new Error("gateway not connected"));const s=ga(),i={type:"req",id:s,method:t,params:n},a=new Promise((o,r)=>{this.pending.set(s,{resolve:c=>o(c),reject:r})});return this.ws.send(JSON.stringify(i)),a}queueConnect(){this.connectNonce=null,this.connectSent=!1,this.connectTimer!==null&&window.clearTimeout(this.connectTimer),this.connectTimer=window.setTimeout(()=>{this.sendConnect()},750)}}function Js(e,t){const n=(e??"").trim(),s=t.mainSessionKey?.trim();if(!s)return n;if(!n)return s;const i=t.mainKey?.trim()||"main",a=t.defaultAgentId?.trim();return n==="main"||n===i||a&&(n===`agent:${a}:main`||n===`agent:${a}:${i}`)?s:n}function tp(e,t){if(!t?.mainSessionKey)return;const n=Js(e.sessionKey,t),s=Js(e.settings.sessionKey,t),i=Js(e.settings.lastActiveSessionKey,t),a=n||s||e.sessionKey,o={...e.settings,sessionKey:s||a,lastActiveSessionKey:i||a},r=o.sessionKey!==e.settings.sessionKey||o.lastActiveSessionKey!==e.settings.lastActiveSessionKey;a!==e.sessionKey&&(e.sessionKey=a),r&&ht(e,o)}function Pl(e){e.lastError=null,e.hello=null,e.connected=!1,e.execApprovalQueue=[],e.execApprovalError=null;const t=e.client,n=new ep({url:e.settings.gatewayUrl,token:e.settings.token.trim()?e.settings.token:void 0,password:e.password.trim()?e.password:void 0,clientName:"openclaw-control-ui",mode:"webchat",onHello:s=>{e.client===n&&(e.connected=!0,e.lastError=null,e.hello=s,ip(e,s),e.chatRunId=null,e.chatStream=null,e.chatStreamStartedAt=null,Ls(e),Ml(e),Ji(e),Ss(e,{quiet:!0}),bt(e,{quiet:!0}),ua(e))},onClose:({code:s,reason:i})=>{e.client===n&&(e.connected=!1,s!==1012&&(e.lastError=`disconnected (${s}): ${i||"no reason"}`))},onEvent:s=>{e.client===n&&np(e,s)},onGap:({expected:s,received:i})=>{e.client===n&&(e.lastError=`event gap detected (expected seq ${s}, got ${i}); refresh recommended`)}});e.client=n,t?.stop(),n.start()}function np(e,t){try{sp(e,t)}catch(n){console.error("[gateway] handleGatewayEvent error:",t.event,n)}}function sp(e,t){if(e.eventLogBuffer=[{ts:Date.now(),event:t.event,payload:t.payload},...e.eventLogBuffer].slice(0,250),e.tab==="debug"&&(e.eventLog=e.eventLogBuffer),t.event==="agent"){if(e.onboarding)return;wg(e,t.payload);return}if(t.event==="chat"){const n=t.payload;n?.sessionKey&&xl(e,n.sessionKey);const s=Dg(e,n);if(s==="final"||s==="error"||s==="aborted"){Ls(e),Ug(e);const i=n?.runId;i&&e.refreshSessionsAfterChat.has(i)&&(e.refreshSessionsAfterChat.delete(i),s==="final"&&Ut(e,{activeMinutes:Al}))}s==="final"&&Xt(e);return}if(t.event==="presence"){const n=t.payload;n?.presence&&Array.isArray(n.presence)&&(e.presenceEntries=n.presence,e.presenceError=null,e.presenceStatus=null);return}if(t.event==="cron"&&e.tab==="cron"&&gs(e),(t.event==="device.pair.requested"||t.event==="device.pair.resolved")&&bt(e,{quiet:!0}),t.event==="exec.approval.requested"){const n=Qg(t.payload);if(n){e.execApprovalQueue=Zg(e.execApprovalQueue,n),e.execApprovalError=null;const s=Math.max(0,n.expiresAtMs-Date.now()+500);window.setTimeout(()=>{e.execApprovalQueue=Co(e.execApprovalQueue,n.id)},s)}return}if(t.event==="exec.approval.resolved"){const n=Yg(t.payload);n&&(e.execApprovalQueue=Co(e.execApprovalQueue,n.id))}}function ip(e,t){const n=t.snapshot;n?.presence&&Array.isArray(n.presence)&&(e.presenceEntries=n.presence),n?.health&&(e.debugHealth=n.health),n?.sessionDefaults&&tp(e,n.sessionDefaults)}const _o="/__openclaw/control-ui-config.json";async function ap(e){if(typeof window>"u"||typeof fetch!="function")return;const t=nn(e.basePath??""),n=t?`${t}${_o}`:_o;try{const s=await fetch(n,{method:"GET",headers:{Accept:"application/json"},credentials:"same-origin"});if(!s.ok)return;const i=await s.json(),a=pa({agentId:i.assistantAgentId??null,name:i.assistantName,avatar:i.assistantAvatar??null});e.assistantName=a.name,e.assistantAvatar=a.avatar,e.assistantAgentId=a.agentId??null}catch{}}function op(e){e.basePath=ag(),ap(e),ng(e),cg(e,!0),og(e),rg(e),window.addEventListener("popstate",e.popStateHandler),Pl(e),Wd(e),e.tab==="logs"&&Qi(e),e.tab==="debug"&&Zi(e)}function rp(e){Od(e)}function lp(e){window.removeEventListener("popstate",e.popStateHandler),qd(e),Yi(e),Xi(e),lg(e),e.topbarObserver?.disconnect(),e.topbarObserver=null}function cp(e,t){if(!(e.tab==="chat"&&e.chatManualRefreshInFlight)){if(e.tab==="chat"&&(t.has("chatMessages")||t.has("chatToolMessages")||t.has("chatStream")||t.has("chatLoading")||t.has("tab"))){const n=t.has("tab"),s=t.has("chatLoading")&&t.get("chatLoading")===!0&&!e.chatLoading;In(e,n||s||!e.chatHasAutoScrolled)}e.tab==="logs"&&(t.has("logsEntries")||t.has("logsAutoFollow")||t.has("tab"))&&e.logsAutoFollow&&e.logsAtBottom&&qr(e,t.has("tab")||t.has("logsAutoFollow"))}}async function Dl(e,t){if(!(!e.client||!e.connected)&&!e.usageLoading){e.usageLoading=!0,e.usageError=null;try{const n=t?.startDate??e.usageStartDate,s=t?.endDate??e.usageEndDate,[i,a]=await Promise.all([e.client.request("sessions.usage",{startDate:n,endDate:s,limit:1e3,includeContextWeight:!0}),e.client.request("usage.cost",{startDate:n,endDate:s})]);i&&(e.usageResult=i),a&&(e.usageCostSummary=a)}catch(n){e.usageError=String(n)}finally{e.usageLoading=!1}}}async function dp(e,t){if(!(!e.client||!e.connected)&&!e.usageTimeSeriesLoading){e.usageTimeSeriesLoading=!0,e.usageTimeSeries=null;try{const n=await e.client.request("sessions.usage.timeseries",{key:t});n&&(e.usageTimeSeries=n)}catch{e.usageTimeSeries=null}finally{e.usageTimeSeriesLoading=!1}}}async function up(e,t){if(!(!e.client||!e.connected)&&!e.usageSessionLogsLoading){e.usageSessionLogsLoading=!0,e.usageSessionLogs=null;try{const n=await e.client.request("sessions.usage.logs",{key:t,limit:1e3});n&&Array.isArray(n.logs)&&(e.usageSessionLogs=n.logs)}catch{e.usageSessionLogs=null}finally{e.usageSessionLogsLoading=!1}}}const gp=new Set(["agent","channel","chat","provider","model","tool","label","key","session","id","has","mintokens","maxtokens","mincost","maxcost","minmessages","maxmessages"]),ps=e=>e.trim().toLowerCase(),pp=e=>{const t=e.replace(/[.+^${}()|[\]\\]/g,"\\$&").replace(/\*/g,".*").replace(/\?/g,".");return new RegExp(`^${t}$`,"i")},_t=e=>{let t=e.trim().toLowerCase();if(!t)return null;t.startsWith("$")&&(t=t.slice(1));let n=1;t.endsWith("k")?(n=1e3,t=t.slice(0,-1)):t.endsWith("m")&&(n=1e6,t=t.slice(0,-1));const s=Number(t);return Number.isFinite(s)?s*n:null},fa=e=>(e.match(/"[^"]+"|\S+/g)??[]).map(n=>{const s=n.replace(/^"|"$/g,""),i=s.indexOf(":");if(i>0){const a=s.slice(0,i),o=s.slice(i+1);return{key:a,value:o,raw:s}}return{value:s,raw:s}}),fp=e=>[e.label,e.key,e.sessionId].filter(n=>!!n).map(n=>n.toLowerCase()),Eo=e=>{const t=new Set;e.modelProvider&&t.add(e.modelProvider.toLowerCase()),e.providerOverride&&t.add(e.providerOverride.toLowerCase()),e.origin?.provider&&t.add(e.origin.provider.toLowerCase());for(const n of e.usage?.modelUsage??[])n.provider&&t.add(n.provider.toLowerCase());return Array.from(t)},Lo=e=>{const t=new Set;e.model&&t.add(e.model.toLowerCase());for(const n of e.usage?.modelUsage??[])n.model&&t.add(n.model.toLowerCase());return Array.from(t)},hp=e=>(e.usage?.toolUsage?.tools??[]).map(t=>t.name.toLowerCase()),vp=(e,t)=>{const n=ps(t.value??"");if(!n)return!0;if(!t.key)return fp(e).some(i=>i.includes(n));switch(ps(t.key)){case"agent":return e.agentId?.toLowerCase().includes(n)??!1;case"channel":return e.channel?.toLowerCase().includes(n)??!1;case"chat":return e.chatType?.toLowerCase().includes(n)??!1;case"provider":return Eo(e).some(i=>i.includes(n));case"model":return Lo(e).some(i=>i.includes(n));case"tool":return hp(e).some(i=>i.includes(n));case"label":return e.label?.toLowerCase().includes(n)??!1;case"key":case"session":case"id":if(n.includes("*")||n.includes("?")){const i=pp(n);return i.test(e.key)||(e.sessionId?i.test(e.sessionId):!1)}return e.key.toLowerCase().includes(n)||(e.sessionId?.toLowerCase().includes(n)??!1);case"has":switch(n){case"tools":return(e.usage?.toolUsage?.totalCalls??0)>0;case"errors":return(e.usage?.messageCounts?.errors??0)>0;case"context":return!!e.contextWeight;case"usage":return!!e.usage;case"model":return Lo(e).length>0;case"provider":return Eo(e).length>0;default:return!0}case"mintokens":{const i=_t(n);return i===null?!0:(e.usage?.totalTokens??0)>=i}case"maxtokens":{const i=_t(n);return i===null?!0:(e.usage?.totalTokens??0)<=i}case"mincost":{const i=_t(n);return i===null?!0:(e.usage?.totalCost??0)>=i}case"maxcost":{const i=_t(n);return i===null?!0:(e.usage?.totalCost??0)<=i}case"minmessages":{const i=_t(n);return i===null?!0:(e.usage?.messageCounts?.total??0)>=i}case"maxmessages":{const i=_t(n);return i===null?!0:(e.usage?.messageCounts?.total??0)<=i}default:return!0}},mp=(e,t)=>{const n=fa(t);if(n.length===0)return{sessions:e,warnings:[]};const s=[];for(const a of n){if(!a.key)continue;const o=ps(a.key);if(!gp.has(o)){s.push(`Unknown filter: ${a.key}`);continue}if(a.value===""&&s.push(`Missing value for ${a.key}`),o==="has"){const r=new Set(["tools","errors","context","usage","model","provider"]);a.value&&!r.has(ps(a.value))&&s.push(`Unknown has:${a.value}`)}["mintokens","maxtokens","mincost","maxcost","minmessages","maxmessages"].includes(o)&&a.value&&_t(a.value)===null&&s.push(`Invalid number for ${a.key}`)}return{sessions:e.filter(a=>n.every(o=>vp(a,o))),warnings:s}};function Fl(e){const t=e.split(`
`),n=new Map,s=[];for(const r of t){const c=/^\[Tool:\s*([^\]]+)\]/.exec(r.trim());if(c){const d=c[1];n.set(d,(n.get(d)??0)+1);continue}r.trim().startsWith("[Tool Result]")||s.push(r)}const i=Array.from(n.entries()).toSorted((r,c)=>c[1]-r[1]),a=i.reduce((r,[,c])=>r+c,0),o=i.length>0?`Tools: ${i.map(([r,c])=>`${r}×${c}`).join(", ")} (${a} calls)`:"";return{tools:i,summary:o,cleanContent:s.join(`
`).trim()}}function bp(e){return{byChannel:Array.from(e.byChannelMap.entries()).map(([t,n])=>({channel:t,totals:n})).toSorted((t,n)=>n.totals.totalCost-t.totals.totalCost),latency:e.latencyTotals.count>0?{count:e.latencyTotals.count,avgMs:e.latencyTotals.sum/e.latencyTotals.count,minMs:e.latencyTotals.min===Number.POSITIVE_INFINITY?0:e.latencyTotals.min,maxMs:e.latencyTotals.max,p95Ms:e.latencyTotals.p95Max}:void 0,dailyLatency:Array.from(e.dailyLatencyMap.values()).map(t=>({date:t.date,count:t.count,avgMs:t.count?t.sum/t.count:0,minMs:t.min===Number.POSITIVE_INFINITY?0:t.min,maxMs:t.max,p95Ms:t.p95Max})).toSorted((t,n)=>t.date.localeCompare(n.date)),modelDaily:Array.from(e.modelDailyMap.values()).toSorted((t,n)=>t.date.localeCompare(n.date)||n.cost-t.cost),daily:Array.from(e.dailyMap.values()).toSorted((t,n)=>t.date.localeCompare(n.date))}}const yp=4;function kt(e){return Math.round(e/yp)}function B(e){return e>=1e6?`${(e/1e6).toFixed(1)}M`:e>=1e3?`${(e/1e3).toFixed(1)}K`:String(e)}function xp(e){const t=new Date;return t.setHours(e,0,0,0),t.toLocaleTimeString(void 0,{hour:"numeric"})}function $p(e,t){const n=Array.from({length:24},()=>0),s=Array.from({length:24},()=>0);for(const i of e){const a=i.usage;if(!a?.messageCounts||a.messageCounts.total===0)continue;const o=a.firstActivity??i.updatedAt,r=a.lastActivity??i.updatedAt;if(!o||!r)continue;const c=Math.min(o,r),d=Math.max(o,r),p=Math.max(d-c,1)/6e4;let h=c;for(;h<d;){const u=new Date(h),f=ha(u,t),v=va(u,t),$=Math.min(v.getTime(),d),C=Math.max(($-h)/6e4,0)/p;n[f]+=a.messageCounts.errors*C,s[f]+=a.messageCounts.total*C,h=$+1}}return s.map((i,a)=>{const o=n[a],r=i>0?o/i:0;return{hour:a,rate:r,errors:o,msgs:i}}).filter(i=>i.msgs>0&&i.errors>0).toSorted((i,a)=>a.rate-i.rate).slice(0,5).map(i=>({label:xp(i.hour),value:`${(i.rate*100).toFixed(2)}%`,sub:`${Math.round(i.errors)} errors · ${Math.round(i.msgs)} msgs`}))}const wp=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];function ha(e,t){return t==="utc"?e.getUTCHours():e.getHours()}function kp(e,t){return t==="utc"?e.getUTCDay():e.getDay()}function va(e,t){const n=new Date(e);return t==="utc"?n.setUTCMinutes(59,59,999):n.setMinutes(59,59,999),n}function Sp(e,t){const n=Array.from({length:24},()=>0),s=Array.from({length:7},()=>0);let i=0,a=!1;for(const r of e){const c=r.usage;if(!c||!c.totalTokens||c.totalTokens<=0)continue;i+=c.totalTokens;const d=c.firstActivity??r.updatedAt,g=c.lastActivity??r.updatedAt;if(!d||!g)continue;a=!0;const p=Math.min(d,g),h=Math.max(d,g),f=Math.max(h-p,1)/6e4;let v=p;for(;v<h;){const $=new Date(v),S=ha($,t),C=kp($,t),k=va($,t),A=Math.min(k.getTime(),h),T=Math.max((A-v)/6e4,0)/f;n[S]+=c.totalTokens*T,s[C]+=c.totalTokens*T,v=A+1}}const o=wp.map((r,c)=>({label:r,tokens:s[c]}));return{hasData:a,totalTokens:i,hourTotals:n,weekdayTotals:o}}function Ap(e,t,n,s){const i=Sp(e,t);if(!i.hasData)return l`
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
  `}function J(e,t=2){return`$${e.toFixed(t)}`}function ei(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function Nl(e){const t=/^(\d{4})-(\d{2})-(\d{2})$/.exec(e);if(!t)return null;const[,n,s,i]=t,a=new Date(Date.UTC(Number(n),Number(s)-1,Number(i)));return Number.isNaN(a.valueOf())?null:a}function Ol(e){const t=Nl(e);return t?t.toLocaleDateString(void 0,{month:"short",day:"numeric"}):e}function Cp(e){const t=Nl(e);return t?t.toLocaleDateString(void 0,{month:"long",day:"numeric",year:"numeric"}):e}const jn=()=>({input:0,output:0,cacheRead:0,cacheWrite:0,totalTokens:0,totalCost:0,inputCost:0,outputCost:0,cacheReadCost:0,cacheWriteCost:0,missingCostEntries:0}),Kn=(e,t)=>{e.input+=t.input??0,e.output+=t.output??0,e.cacheRead+=t.cacheRead??0,e.cacheWrite+=t.cacheWrite??0,e.totalTokens+=t.totalTokens??0,e.totalCost+=t.totalCost??0,e.inputCost+=t.inputCost??0,e.outputCost+=t.outputCost??0,e.cacheReadCost+=t.cacheReadCost??0,e.cacheWriteCost+=t.cacheWriteCost??0,e.missingCostEntries+=t.missingCostEntries??0},Tp=(e,t)=>{if(e.length===0)return t??{messages:{total:0,user:0,assistant:0,toolCalls:0,toolResults:0,errors:0},tools:{totalCalls:0,uniqueTools:0,tools:[]},byModel:[],byProvider:[],byAgent:[],byChannel:[],daily:[]};const n={total:0,user:0,assistant:0,toolCalls:0,toolResults:0,errors:0},s=new Map,i=new Map,a=new Map,o=new Map,r=new Map,c=new Map,d=new Map,g=new Map,p={count:0,sum:0,min:Number.POSITIVE_INFINITY,max:0,p95Max:0};for(const u of e){const f=u.usage;if(f){if(f.messageCounts&&(n.total+=f.messageCounts.total,n.user+=f.messageCounts.user,n.assistant+=f.messageCounts.assistant,n.toolCalls+=f.messageCounts.toolCalls,n.toolResults+=f.messageCounts.toolResults,n.errors+=f.messageCounts.errors),f.toolUsage)for(const v of f.toolUsage.tools)s.set(v.name,(s.get(v.name)??0)+v.count);if(f.modelUsage)for(const v of f.modelUsage){const $=`${v.provider??"unknown"}::${v.model??"unknown"}`,S=i.get($)??{provider:v.provider,model:v.model,count:0,totals:jn()};S.count+=v.count,Kn(S.totals,v.totals),i.set($,S);const C=v.provider??"unknown",k=a.get(C)??{provider:v.provider,model:void 0,count:0,totals:jn()};k.count+=v.count,Kn(k.totals,v.totals),a.set(C,k)}if(f.latency){const{count:v,avgMs:$,minMs:S,maxMs:C,p95Ms:k}=f.latency;v>0&&(p.count+=v,p.sum+=$*v,p.min=Math.min(p.min,S),p.max=Math.max(p.max,C),p.p95Max=Math.max(p.p95Max,k))}if(u.agentId){const v=o.get(u.agentId)??jn();Kn(v,f),o.set(u.agentId,v)}if(u.channel){const v=r.get(u.channel)??jn();Kn(v,f),r.set(u.channel,v)}for(const v of f.dailyBreakdown??[]){const $=c.get(v.date)??{date:v.date,tokens:0,cost:0,messages:0,toolCalls:0,errors:0};$.tokens+=v.tokens,$.cost+=v.cost,c.set(v.date,$)}for(const v of f.dailyMessageCounts??[]){const $=c.get(v.date)??{date:v.date,tokens:0,cost:0,messages:0,toolCalls:0,errors:0};$.messages+=v.total,$.toolCalls+=v.toolCalls,$.errors+=v.errors,c.set(v.date,$)}for(const v of f.dailyLatency??[]){const $=d.get(v.date)??{date:v.date,count:0,sum:0,min:Number.POSITIVE_INFINITY,max:0,p95Max:0};$.count+=v.count,$.sum+=v.avgMs*v.count,$.min=Math.min($.min,v.minMs),$.max=Math.max($.max,v.maxMs),$.p95Max=Math.max($.p95Max,v.p95Ms),d.set(v.date,$)}for(const v of f.dailyModelUsage??[]){const $=`${v.date}::${v.provider??"unknown"}::${v.model??"unknown"}`,S=g.get($)??{date:v.date,provider:v.provider,model:v.model,tokens:0,cost:0,count:0};S.tokens+=v.tokens,S.cost+=v.cost,S.count+=v.count,g.set($,S)}}}const h=bp({byChannelMap:r,latencyTotals:p,dailyLatencyMap:d,modelDailyMap:g,dailyMap:c});return{messages:n,tools:{totalCalls:Array.from(s.values()).reduce((u,f)=>u+f,0),uniqueTools:s.size,tools:Array.from(s.entries()).map(([u,f])=>({name:u,count:f})).toSorted((u,f)=>f.count-u.count)},byModel:Array.from(i.values()).toSorted((u,f)=>f.totals.totalCost-u.totals.totalCost),byProvider:Array.from(a.values()).toSorted((u,f)=>f.totals.totalCost-u.totals.totalCost),byAgent:Array.from(o.entries()).map(([u,f])=>({agentId:u,totals:f})).toSorted((u,f)=>f.totals.totalCost-u.totals.totalCost),...h}},_p=(e,t,n)=>{let s=0,i=0;for(const g of e){const p=g.usage?.durationMs??0;p>0&&(s+=p,i+=1)}const a=i?s/i:0,o=t&&s>0?t.totalTokens/(s/6e4):void 0,r=t&&s>0?t.totalCost/(s/6e4):void 0,c=n.messages.total?n.messages.errors/n.messages.total:0,d=n.daily.filter(g=>g.messages>0&&g.errors>0).map(g=>({date:g.date,errors:g.errors,messages:g.messages,rate:g.errors/g.messages})).toSorted((g,p)=>p.rate-g.rate||p.errors-g.errors)[0];return{durationSumMs:s,durationCount:i,avgDurationMs:a,throughputTokensPerMin:o,throughputCostPerMin:r,errorRate:c,peakErrorDay:d}};function ti(e,t,n="text/plain"){const s=new Blob([t],{type:`${n};charset=utf-8`}),i=URL.createObjectURL(s),a=document.createElement("a");a.href=i,a.download=e,a.click(),URL.revokeObjectURL(i)}function Ep(e){return/[",\n]/.test(e)?`"${e.replaceAll('"','""')}"`:e}function fs(e){return e.map(t=>t==null?"":Ep(String(t))).join(",")}const Lp=e=>{const t=[fs(["key","label","agentId","channel","provider","model","updatedAt","durationMs","messages","errors","toolCalls","inputTokens","outputTokens","cacheReadTokens","cacheWriteTokens","totalTokens","totalCost"])];for(const n of e){const s=n.usage;t.push(fs([n.key,n.label??"",n.agentId??"",n.channel??"",n.modelProvider??n.providerOverride??"",n.model??n.modelOverride??"",n.updatedAt?new Date(n.updatedAt).toISOString():"",s?.durationMs??"",s?.messageCounts?.total??"",s?.messageCounts?.errors??"",s?.messageCounts?.toolCalls??"",s?.input??"",s?.output??"",s?.cacheRead??"",s?.cacheWrite??"",s?.totalTokens??"",s?.totalCost??""]))}return t.join(`
`)},Mp=e=>{const t=[fs(["date","inputTokens","outputTokens","cacheReadTokens","cacheWriteTokens","totalTokens","inputCost","outputCost","cacheReadCost","cacheWriteCost","totalCost"])];for(const n of e)t.push(fs([n.date,n.input,n.output,n.cacheRead,n.cacheWrite,n.totalTokens,n.inputCost??"",n.outputCost??"",n.cacheReadCost??"",n.cacheWriteCost??"",n.totalCost]));return t.join(`
`)},Ip=(e,t,n)=>{const s=e.trim();if(!s)return[];const i=s.length?s.split(/\s+/):[],a=i.length?i[i.length-1]:"",[o,r]=a.includes(":")?[a.slice(0,a.indexOf(":")),a.slice(a.indexOf(":")+1)]:["",""],c=o.toLowerCase(),d=r.toLowerCase(),g=C=>{const k=new Set;for(const A of C)A&&k.add(A);return Array.from(k)},p=g(t.map(C=>C.agentId)).slice(0,6),h=g(t.map(C=>C.channel)).slice(0,6),u=g([...t.map(C=>C.modelProvider),...t.map(C=>C.providerOverride),...n?.byProvider.map(C=>C.provider)??[]]).slice(0,6),f=g([...t.map(C=>C.model),...n?.byModel.map(C=>C.model)??[]]).slice(0,6),v=g(n?.tools.tools.map(C=>C.name)??[]).slice(0,6);if(!c)return[{label:"agent:",value:"agent:"},{label:"channel:",value:"channel:"},{label:"provider:",value:"provider:"},{label:"model:",value:"model:"},{label:"tool:",value:"tool:"},{label:"has:errors",value:"has:errors"},{label:"has:tools",value:"has:tools"},{label:"minTokens:",value:"minTokens:"},{label:"maxCost:",value:"maxCost:"}];const $=[],S=(C,k)=>{for(const A of k)(!d||A.toLowerCase().includes(d))&&$.push({label:`${C}:${A}`,value:`${C}:${A}`})};switch(c){case"agent":S("agent",p);break;case"channel":S("channel",h);break;case"provider":S("provider",u);break;case"model":S("model",f);break;case"tool":S("tool",v);break;case"has":["errors","tools","context","usage","model","provider"].forEach(C=>{(!d||C.includes(d))&&$.push({label:`has:${C}`,value:`has:${C}`})});break}return $},Rp=(e,t)=>{const n=e.trim();if(!n)return`${t} `;const s=n.split(/\s+/);return s[s.length-1]=t,`${s.join(" ")} `},Et=e=>e.trim().toLowerCase(),Pp=(e,t)=>{const n=e.trim();if(!n)return`${t} `;const s=n.split(/\s+/),i=s[s.length-1]??"",a=t.includes(":")?t.split(":")[0]:null,o=i.includes(":")?i.split(":")[0]:null;return i.endsWith(":")&&a&&o===a?(s[s.length-1]=t,`${s.join(" ")} `):s.includes(t)?`${s.join(" ")} `:`${s.join(" ")} ${t} `},Mo=(e,t)=>{const s=e.trim().split(/\s+/).filter(Boolean).filter(i=>i!==t);return s.length?`${s.join(" ")} `:""},Io=(e,t,n)=>{const s=Et(t),a=[...fa(e).filter(o=>Et(o.key??"")!==s).map(o=>o.raw),...n.map(o=>`${t}:${o}`)];return a.length?`${a.join(" ")} `:""};function ut(e,t){return t===0?0:e/t*100}function Dp(e){const t=e.totalCost||0;return{input:{tokens:e.input,cost:e.inputCost||0,pct:ut(e.inputCost||0,t)},output:{tokens:e.output,cost:e.outputCost||0,pct:ut(e.outputCost||0,t)},cacheRead:{tokens:e.cacheRead,cost:e.cacheReadCost||0,pct:ut(e.cacheReadCost||0,t)},cacheWrite:{tokens:e.cacheWrite,cost:e.cacheWriteCost||0,pct:ut(e.cacheWriteCost||0,t)},totalCost:t}}function Fp(e,t,n,s,i,a,o,r){if(!(e.length>0||t.length>0||n.length>0))return m;const d=n.length===1?s.find(f=>f.key===n[0]):null,g=d?(d.label||d.key).slice(0,20)+((d.label||d.key).length>20?"…":""):n.length===1?n[0].slice(0,8)+"…":`${n.length} sessions`,p=d?d.label||d.key:n.length===1?n[0]:n.join(", "),h=e.length===1?e[0]:`${e.length} days`,u=t.length===1?`${t[0]}:00`:`${t.length} hours`;return l`
    <div class="active-filters">
      ${e.length>0?l`
            <div class="filter-chip">
              <span class="filter-chip-label">Days: ${h}</span>
              <button class="filter-chip-remove" @click=${i} title="Remove filter">×</button>
            </div>
          `:m}
      ${t.length>0?l`
            <div class="filter-chip">
              <span class="filter-chip-label">Hours: ${u}</span>
              <button class="filter-chip-remove" @click=${a} title="Remove filter">×</button>
            </div>
          `:m}
      ${n.length>0?l`
            <div class="filter-chip" title="${p}">
              <span class="filter-chip-label">Session: ${g}</span>
              <button class="filter-chip-remove" @click=${o} title="Remove filter">×</button>
            </div>
          `:m}
      ${(e.length>0||t.length>0)&&n.length>0?l`
            <button class="btn btn-sm filter-clear-btn" @click=${r}>
              Clear All
            </button>
          `:m}
    </div>
  `}function Np(e,t,n,s,i,a){if(!e.length)return l`
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
          ${e.map((p,h)=>{const f=r[h]/c*100,v=t.includes(p.date),$=Ol(p.date),S=e.length>20?String(parseInt(p.date.slice(8),10)):$,C=e.length>20?"font-size: 8px":"",k=s==="by-type"?o?[{value:p.output,class:"output"},{value:p.input,class:"input"},{value:p.cacheWrite,class:"cache-write"},{value:p.cacheRead,class:"cache-read"}]:[{value:p.outputCost??0,class:"output"},{value:p.inputCost??0,class:"input"},{value:p.cacheWriteCost??0,class:"cache-write"},{value:p.cacheReadCost??0,class:"cache-read"}]:[],A=s==="by-type"?o?[`Output ${B(p.output)}`,`Input ${B(p.input)}`,`Cache write ${B(p.cacheWrite)}`,`Cache read ${B(p.cacheRead)}`]:[`Output ${J(p.outputCost??0)}`,`Input ${J(p.inputCost??0)}`,`Cache write ${J(p.cacheWriteCost??0)}`,`Cache read ${J(p.cacheReadCost??0)}`]:[],E=o?B(p.totalTokens):J(p.totalCost);return l`
              <div
                class="daily-bar-wrapper ${v?"selected":""}"
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
                ${g?l`<div class="daily-bar-total">${E}</div>`:m}
                <div class="daily-bar-label" style="${C}">${S}</div>
                <div class="daily-bar-tooltip">
                  <strong>${Cp(p.date)}</strong><br />
                  ${B(p.totalTokens)} tokens<br />
                  ${J(p.totalCost)}
                  ${A.length?l`${A.map(T=>l`<div>${T}</div>`)}`:m}
                </div>
              </div>
            `})}
        </div>
      </div>
    </div>
  `}function Op(e,t){const n=Dp(e),s=t==="tokens",i=e.totalTokens||1,a={output:ut(e.output,i),input:ut(e.input,i),cacheWrite:ut(e.cacheWrite,i),cacheRead:ut(e.cacheRead,i)};return l`
    <div class="cost-breakdown cost-breakdown-compact">
      <div class="cost-breakdown-header">${s?"Tokens":"Cost"} by Type</div>
      <div class="cost-breakdown-bar">
        <div class="cost-segment output" style="width: ${(s?a.output:n.output.pct).toFixed(1)}%"
          title="Output: ${s?B(e.output):J(n.output.cost)}"></div>
        <div class="cost-segment input" style="width: ${(s?a.input:n.input.pct).toFixed(1)}%"
          title="Input: ${s?B(e.input):J(n.input.cost)}"></div>
        <div class="cost-segment cache-write" style="width: ${(s?a.cacheWrite:n.cacheWrite.pct).toFixed(1)}%"
          title="Cache Write: ${s?B(e.cacheWrite):J(n.cacheWrite.cost)}"></div>
        <div class="cost-segment cache-read" style="width: ${(s?a.cacheRead:n.cacheRead.pct).toFixed(1)}%"
          title="Cache Read: ${s?B(e.cacheRead):J(n.cacheRead.cost)}"></div>
      </div>
      <div class="cost-breakdown-legend">
        <span class="legend-item"><span class="legend-dot output"></span>Output ${s?B(e.output):J(n.output.cost)}</span>
        <span class="legend-item"><span class="legend-dot input"></span>Input ${s?B(e.input):J(n.input.cost)}</span>
        <span class="legend-item"><span class="legend-dot cache-write"></span>Cache Write ${s?B(e.cacheWrite):J(n.cacheWrite.cost)}</span>
        <span class="legend-item"><span class="legend-dot cache-read"></span>Cache Read ${s?B(e.cacheRead):J(n.cacheRead.cost)}</span>
      </div>
      <div class="cost-breakdown-total">
        Total: ${s?B(e.totalTokens):J(e.totalCost)}
      </div>
    </div>
  `}function Lt(e,t,n){return l`
    <div class="usage-insight-card">
      <div class="usage-insight-title">${e}</div>
      ${t.length===0?l`<div class="muted">${n}</div>`:l`
              <div class="usage-list">
                ${t.map(s=>l`
                    <div class="usage-list-item">
                      <span>${s.label}</span>
                      <span class="usage-list-value">
                        <span>${s.value}</span>
                        ${s.sub?l`<span class="usage-list-sub">${s.sub}</span>`:m}
                      </span>
                    </div>
                  `)}
              </div>
            `}
    </div>
  `}function Ro(e,t,n){return l`
    <div class="usage-insight-card">
      <div class="usage-insight-title">${e}</div>
      ${t.length===0?l`<div class="muted">${n}</div>`:l`
              <div class="usage-error-list">
                ${t.map(s=>l`
                    <div class="usage-error-row">
                      <div class="usage-error-date">${s.label}</div>
                      <div class="usage-error-rate">${s.value}</div>
                      ${s.sub?l`<div class="usage-error-sub">${s.sub}</div>`:m}
                    </div>
                  `)}
              </div>
            `}
    </div>
  `}function Bp(e,t,n,s,i,a,o){if(!e)return m;const r=t.messages.total?Math.round(e.totalTokens/t.messages.total):0,c=t.messages.total?e.totalCost/t.messages.total:0,d=e.input+e.cacheRead,g=d>0?e.cacheRead/d:0,p=d>0?`${(g*100).toFixed(1)}%`:"—",h=n.errorRate*100,u=n.throughputTokensPerMin!==void 0?`${B(Math.round(n.throughputTokensPerMin))} tok/min`:"—",f=n.throughputCostPerMin!==void 0?`${J(n.throughputCostPerMin,4)} / min`:"—",v=n.durationCount>0?ea(n.avgDurationMs,{spaced:!0})??"—":"—",$="Cache hit rate = cache read / (input + cache read). Higher is better.",S="Error rate = errors / total messages. Lower is better.",C="Throughput shows tokens per minute over active time. Higher is better.",k="Average tokens per message in this range.",A=s?"Average cost per message when providers report costs. Cost data is missing for some or all sessions in this range.":"Average cost per message when providers report costs.",E=t.daily.filter(R=>R.messages>0&&R.errors>0).map(R=>{const q=R.errors/R.messages;return{label:Ol(R.date),value:`${(q*100).toFixed(2)}%`,sub:`${R.errors} errors · ${R.messages} msgs · ${B(R.tokens)}`,rate:q}}).toSorted((R,q)=>q.rate-R.rate).slice(0,5).map(({rate:R,...q})=>q),T=t.byModel.slice(0,5).map(R=>({label:R.model??"unknown",value:J(R.totals.totalCost),sub:`${B(R.totals.totalTokens)} · ${R.count} msgs`})),I=t.byProvider.slice(0,5).map(R=>({label:R.provider??"unknown",value:J(R.totals.totalCost),sub:`${B(R.totals.totalTokens)} · ${R.count} msgs`})),H=t.tools.tools.slice(0,6).map(R=>({label:R.name,value:`${R.count}`,sub:"calls"})),Z=t.byAgent.slice(0,5).map(R=>({label:R.agentId,value:J(R.totals.totalCost),sub:B(R.totals.totalTokens)})),te=t.byChannel.slice(0,5).map(R=>({label:R.channel,value:J(R.totals.totalCost),sub:B(R.totals.totalTokens)}));return l`
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
            <span class="usage-summary-hint" title=${A}>?</span>
          </div>
          <div class="usage-summary-value">${J(c,4)}</div>
          <div class="usage-summary-sub">${J(e.totalCost)} total</div>
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
            <span class="usage-summary-hint" title=${S}>?</span>
          </div>
          <div class="usage-summary-value ${h>5?"bad":h>1?"warn":"good"}">${h.toFixed(2)}%</div>
          <div class="usage-summary-sub">
            ${t.messages.errors} errors · ${v} avg session
          </div>
        </div>
        <div class="usage-summary-card">
          <div class="usage-summary-title">
            Cache Hit Rate
            <span class="usage-summary-hint" title=${$}>?</span>
          </div>
          <div class="usage-summary-value ${g>.6?"good":g>.3?"warn":"bad"}">${p}</div>
          <div class="usage-summary-sub">
            ${B(e.cacheRead)} cached · ${B(d)} prompt
          </div>
        </div>
      </div>
      <div class="usage-insights-grid">
        ${Lt("Top Models",T,"No model data")}
        ${Lt("Top Providers",I,"No provider data")}
        ${Lt("Top Tools",H,"No tool calls")}
        ${Lt("Top Agents",Z,"No agent data")}
        ${Lt("Top Channels",te,"No channel data")}
        ${Ro("Peak Error Days",E,"No error data")}
        ${Ro("Peak Error Hours",i,"No error data")}
      </div>
    </section>
  `}function zp(e,t,n,s,i,a,o,r,c,d,g,p,h,u,f){const v=_=>h.includes(_),$=_=>{const j=_.label||_.key;return j.startsWith("agent:")&&j.includes("?token=")?j.slice(0,j.indexOf("?token=")):j},S=async _=>{const j=$(_);try{await navigator.clipboard.writeText(j)}catch{}},C=_=>{const j=[];return v("channel")&&_.channel&&j.push(`channel:${_.channel}`),v("agent")&&_.agentId&&j.push(`agent:${_.agentId}`),v("provider")&&(_.modelProvider||_.providerOverride)&&j.push(`provider:${_.modelProvider??_.providerOverride}`),v("model")&&_.model&&j.push(`model:${_.model}`),v("messages")&&_.usage?.messageCounts&&j.push(`msgs:${_.usage.messageCounts.total}`),v("tools")&&_.usage?.toolUsage&&j.push(`tools:${_.usage.toolUsage.totalCalls}`),v("errors")&&_.usage?.messageCounts&&j.push(`errors:${_.usage.messageCounts.errors}`),v("duration")&&_.usage?.durationMs&&j.push(`dur:${ea(_.usage.durationMs,{spaced:!0})??"—"}`),j},k=_=>{const j=_.usage;if(!j)return 0;if(n.length>0&&j.dailyBreakdown&&j.dailyBreakdown.length>0){const Q=j.dailyBreakdown.filter(re=>n.includes(re.date));return s?Q.reduce((re,pe)=>re+pe.tokens,0):Q.reduce((re,pe)=>re+pe.cost,0)}return s?j.totalTokens??0:j.totalCost??0},A=[...e].toSorted((_,j)=>{switch(i){case"recent":return(j.updatedAt??0)-(_.updatedAt??0);case"messages":return(j.usage?.messageCounts?.total??0)-(_.usage?.messageCounts?.total??0);case"errors":return(j.usage?.messageCounts?.errors??0)-(_.usage?.messageCounts?.errors??0);case"cost":return k(j)-k(_);default:return k(j)-k(_)}}),E=a==="asc"?A.toReversed():A,T=E.reduce((_,j)=>_+k(j),0),I=E.length?T/E.length:0,H=E.reduce((_,j)=>_+(j.usage?.messageCounts?.errors??0),0),Z=(_,j)=>{const Q=k(_),re=$(_),pe=C(_);return l`
      <div
        class="session-bar-row ${j?"selected":""}"
        @click=${M=>c(_.key,M.shiftKey)}
        title="${_.key}"
      >
        <div class="session-bar-label">
          <div class="session-bar-title">${re}</div>
          ${pe.length>0?l`<div class="session-bar-meta">${pe.join(" · ")}</div>`:m}
        </div>
        <div class="session-bar-track" style="display: none;"></div>
        <div class="session-bar-actions">
          <button
            class="session-copy-btn"
            title="Copy session name"
            @click=${M=>{M.stopPropagation(),S(_)}}
          >
            Copy
          </button>
          <div class="session-bar-value">${s?B(Q):J(Q)}</div>
        </div>
      </div>
    `},te=new Set(t),R=E.filter(_=>te.has(_.key)),q=R.length,ne=new Map(E.map(_=>[_.key,_])),oe=o.map(_=>ne.get(_)).filter(_=>!!_);return l`
    <div class="card sessions-card">
      <div class="sessions-card-header">
        <div class="card-title">Sessions</div>
        <div class="sessions-card-count">
          ${e.length} shown${u!==e.length?` · ${u} total`:""}
        </div>
      </div>
      <div class="sessions-card-meta">
        <div class="sessions-card-stats">
          <span>${s?B(I):J(I)} avg</span>
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
              `:m}
      </div>
      ${r==="recent"?oe.length===0?l`
                <div class="muted" style="padding: 20px; text-align: center">No recent sessions</div>
              `:l`
	                <div class="session-bars" style="max-height: 220px; margin-top: 6px;">
	                  ${oe.map(_=>Z(_,te.has(_.key)))}
	                </div>
	              `:e.length===0?l`
                <div class="muted" style="padding: 20px; text-align: center">No sessions in range</div>
              `:l`
	                <div class="session-bars">
	                  ${E.slice(0,50).map(_=>Z(_,te.has(_.key)))}
	                  ${e.length>50?l`<div class="muted" style="padding: 8px; text-align: center; font-size: 11px;">+${e.length-50} more</div>`:m}
	                </div>
	              `}
      ${q>1?l`
              <div style="margin-top: 10px;">
                <div class="sessions-card-count">Selected (${q})</div>
                <div class="session-bars" style="max-height: 160px; margin-top: 6px;">
                  ${R.map(_=>Z(_,!0))}
                </div>
              </div>
            `:m}
    </div>
  `}const Up=.75,Hp=8,jp=.06,Wn=5,Le=12,lt=.7;function gt(e,t){return!t||t<=0?0:e/t*100}function Kp(){return m}function Bl(e){return e<1e12?e*1e3:e}function Wp(e,t,n){const s=Math.min(t,n),i=Math.max(t,n);return e.filter(a=>{if(a.timestamp<=0)return!0;const o=Bl(a.timestamp);return o>=s&&o<=i})}function qp(e,t,n){const s=t||e.usage;if(!s)return l`
      <div class="muted">No usage data for this session.</div>
    `;const i=p=>p?new Date(p).toLocaleString():"—",a=[];e.channel&&a.push(`channel:${e.channel}`),e.agentId&&a.push(`agent:${e.agentId}`),(e.modelProvider||e.providerOverride)&&a.push(`provider:${e.modelProvider??e.providerOverride}`),e.model&&a.push(`model:${e.model}`);const o=s.toolUsage?.tools.slice(0,6)??[];let r,c,d;if(n){const p=new Map;for(const h of n){const{tools:u}=Fl(h.content);for(const[f]of u)p.set(f,(p.get(f)||0)+1)}d=o.map(h=>({label:h.name,value:`${p.get(h.name)??0}`,sub:"calls"})),r=[...p.values()].reduce((h,u)=>h+u,0),c=p.size}else d=o.map(p=>({label:p.name,value:`${p.count}`,sub:"calls"})),r=s.toolUsage?.totalCalls??0,c=s.toolUsage?.uniqueTools??0;const g=s.modelUsage?.slice(0,6).map(p=>({label:p.model??"unknown",value:J(p.totals.totalCost),sub:B(p.totals.totalTokens)}))??[];return l`
    ${a.length>0?l`<div class="usage-badges">${a.map(p=>l`<span class="usage-badge">${p}</span>`)}</div>`:m}
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
        <div class="session-summary-value">${ea(s.durationMs,{spaced:!0})??"—"}</div>
        <div class="session-summary-meta">${i(s.firstActivity)} → ${i(s.lastActivity)}</div>
      </div>
    </div>
    <div class="usage-insights-grid" style="margin-top: 12px;">
      ${Lt("Top Tools",d,"No tool calls")}
      ${Lt("Model Mix",g,"No model data")}
    </div>
  `}function Vp(e,t,n,s){const i=Math.min(n,s),a=Math.max(n,s),o=t.filter(v=>v.timestamp>=i&&v.timestamp<=a);if(o.length===0)return;let r=0,c=0,d=0,g=0,p=0,h=0,u=0,f=0;for(const v of o)r+=v.totalTokens||0,c+=v.cost||0,p+=v.input||0,h+=v.output||0,u+=v.cacheRead||0,f+=v.cacheWrite||0,v.output>0&&g++,v.input>0&&d++;return{...e,totalTokens:r,totalCost:c,input:p,output:h,cacheRead:u,cacheWrite:f,durationMs:o[o.length-1].timestamp-o[0].timestamp,firstActivity:o[0].timestamp,lastActivity:o[o.length-1].timestamp,messageCounts:{total:o.length,user:d,assistant:g,toolCalls:0,toolResults:0,errors:0}}}function Gp(e,t,n,s,i,a,o,r,c,d,g,p,h,u,f,v,$,S,C,k,A,E,T,I,H,Z){const te=e.label||e.key,R=te.length>50?te.slice(0,50)+"…":te,q=e.usage,ne=r!==null&&c!==null,oe=r!==null&&c!==null&&t?.points&&q?Vp(q,t.points,r,c):void 0,_=oe?{totalTokens:oe.totalTokens,totalCost:oe.totalCost}:{totalTokens:q?.totalTokens??0,totalCost:q?.totalCost??0},j=oe?" (filtered)":"";return l`
    <div class="card session-detail-panel">
      <div class="session-detail-header">
        <div class="session-detail-header-left">
          <div class="session-detail-title">
            ${R}
            ${j?l`<span style="font-size: 11px; color: var(--muted); margin-left: 8px;">${j}</span>`:m}
          </div>
        </div>
        <div class="session-detail-stats">
          ${q?l`
            <span><strong>${B(_.totalTokens)}</strong> tokens${j}</span>
            <span><strong>${J(_.totalCost)}</strong>${j}</span>
          `:m}
        </div>
        <button class="session-close-btn" @click=${Z} title="Close session details">×</button>
      </div>
      <div class="session-detail-content">
        ${qp(e,oe,r!=null&&c!=null&&u?Wp(u,r,c):void 0)}
        <div class="session-detail-row">
          ${Qp(t,n,s,i,a,o,g,p,h,r,c,d)}
        </div>
        <div class="session-detail-bottom">
          ${Zp(u,f,v,$,S,C,k,A,E,T,ne?r:null,ne?c:null)}
          ${Yp(e.contextWeight,q,I,H)}
        </div>
      </div>
    </div>
  `}function Qp(e,t,n,s,i,a,o,r,c,d,g,p){if(t)return l`
      <div class="session-timeseries-compact">
        <div class="muted" style="padding: 20px; text-align: center">Loading...</div>
      </div>
    `;if(!e||e.points.length<2)return l`
      <div class="session-timeseries-compact">
        <div class="muted" style="padding: 20px; text-align: center">No timeline data</div>
      </div>
    `;let h=e.points;if(o||r||c&&c.length>0){const U=o?new Date(o+"T00:00:00").getTime():0,ie=r?new Date(r+"T23:59:59").getTime():1/0;h=e.points.filter(le=>{if(le.timestamp<U||le.timestamp>ie)return!1;if(c&&c.length>0){const fe=new Date(le.timestamp),Te=`${fe.getFullYear()}-${String(fe.getMonth()+1).padStart(2,"0")}-${String(fe.getDate()).padStart(2,"0")}`;return c.includes(Te)}return!0})}if(h.length<2)return l`
      <div class="session-timeseries-compact">
        <div class="muted" style="padding: 20px; text-align: center">No data in range</div>
      </div>
    `;let u=0,f=0,v=0,$=0,S=0,C=0;h=h.map(U=>(u+=U.totalTokens,f+=U.cost,v+=U.output,$+=U.input,S+=U.cacheRead,C+=U.cacheWrite,{...U,cumulativeTokens:u,cumulativeCost:f}));const k=d!=null&&g!=null,A=k?Math.min(d,g):0,E=k?Math.max(d,g):1/0;let T=0,I=h.length;if(k){T=h.findIndex(ie=>ie.timestamp>=A),T===-1&&(T=h.length);const U=h.findIndex(ie=>ie.timestamp>E);I=U===-1?h.length:U}const H=k?h.slice(T,I):h;let Z=0,te=0,R=0,q=0;for(const U of H)Z+=U.output,te+=U.input,R+=U.cacheRead,q+=U.cacheWrite;const ne=400,oe=100,_={top:8,right:4,bottom:14,left:30},j=ne-_.left-_.right,Q=oe-_.top-_.bottom,re=n==="cumulative",pe=n==="per-turn"&&i==="by-type",M=Z+te+R+q,D=h.map(U=>re?U.cumulativeTokens:pe?U.input+U.output+U.cacheRead+U.cacheWrite:U.totalTokens),F=Math.max(...D,1),K=j/h.length,ce=Math.min(Hp,Math.max(1,K*Up)),X=K-ce,se=_.left+T*(ce+X),V=I>=h.length?_.left+(h.length-1)*(ce+X)+ce:_.left+(I-1)*(ce+X)+ce;return l`
    <div class="session-timeseries-compact">
      <div class="timeseries-header-row">
        <div class="card-title" style="font-size: 12px; color: var(--text);">Usage Over Time</div>
        <div class="timeseries-controls">
          ${k?l`
            <div class="chart-toggle small">
              <button class="toggle-btn active" @click=${()=>p?.(null,null)}>Reset</button>
            </div>
          `:m}
          <div class="chart-toggle small">
            <button
              class="toggle-btn ${re?"":"active"}"
              @click=${()=>s("per-turn")}
            >
              Per Turn
            </button>
            <button
              class="toggle-btn ${re?"active":""}"
              @click=${()=>s("cumulative")}
            >
              Cumulative
            </button>
          </div>
          ${re?m:l`
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
          viewBox="0 0 ${ne} ${oe+18}" 
          class="timeseries-svg" 
          style="width: 100%; height: auto; display: block;"
        >
          <!-- Y axis -->
          <line x1="${_.left}" y1="${_.top}" x2="${_.left}" y2="${_.top+Q}" stroke="var(--border)" />
          <!-- X axis -->
          <line x1="${_.left}" y1="${_.top+Q}" x2="${ne-_.right}" y2="${_.top+Q}" stroke="var(--border)" />
          <!-- Y axis labels -->
          <text x="${_.left-4}" y="${_.top+5}" text-anchor="end" class="ts-axis-label">${B(F)}</text>
          <text x="${_.left-4}" y="${_.top+Q}" text-anchor="end" class="ts-axis-label">0</text>
          <!-- X axis labels (first and last) -->
          ${h.length>0?wt`
            <text x="${_.left}" y="${_.top+Q+10}" text-anchor="start" class="ts-axis-label">${new Date(h[0].timestamp).toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"})}</text>
            <text x="${ne-_.right}" y="${_.top+Q+10}" text-anchor="end" class="ts-axis-label">${new Date(h[h.length-1].timestamp).toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"})}</text>
          `:m}
          <!-- Bars -->
          ${h.map((U,ie)=>{const le=D[ie],fe=_.left+ie*(ce+X),Te=le/F*Q,Ke=_.top+Q-Te,he=[new Date(U.timestamp).toLocaleDateString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}),`${B(le)} tokens`];pe&&(he.push(`Out ${B(U.output)}`),he.push(`In ${B(U.input)}`),he.push(`CW ${B(U.cacheWrite)}`),he.push(`CR ${B(U.cacheRead)}`));const Oe=he.join(" · "),We=k&&(ie<T||ie>=I);if(!pe)return wt`<rect x="${fe}" y="${Ke}" width="${ce}" height="${Te}" class="ts-bar${We?" dimmed":""}" rx="1"><title>${Oe}</title></rect>`;const qe=[{value:U.output,cls:"output"},{value:U.input,cls:"input"},{value:U.cacheWrite,cls:"cache-write"},{value:U.cacheRead,cls:"cache-read"}];let Ve=_.top+Q;const it=We?" dimmed":"";return wt`
              ${qe.map(at=>{if(at.value<=0||le<=0)return m;const yt=Te*(at.value/le);return Ve-=yt,wt`<rect x="${fe}" y="${Ve}" width="${ce}" height="${yt}" class="ts-bar ${at.cls}${it}" rx="1"><title>${Oe}</title></rect>`})}
            `})}
          <!-- Selection highlight overlay (always visible between handles) -->
          ${wt`
            <rect 
              x="${se}" 
              y="${_.top}" 
              width="${Math.max(1,V-se)}" 
              height="${Q}" 
              fill="var(--accent)" 
              opacity="${jp}" 
              pointer-events="none"
            />
          `}
          <!-- Left cursor line + handle -->
          ${wt`
            <line x1="${se}" y1="${_.top}" x2="${se}" y2="${_.top+Q}" stroke="var(--accent)" stroke-width="0.8" opacity="0.7" />
            <rect x="${se-Wn/2}" y="${_.top+Q/2-Le/2}" width="${Wn}" height="${Le}" rx="1.5" fill="var(--accent)" class="cursor-handle" />
            <line x1="${se-lt}" y1="${_.top+Q/2-Le/5}" x2="${se-lt}" y2="${_.top+Q/2+Le/5}" stroke="var(--bg)" stroke-width="0.4" pointer-events="none" />
            <line x1="${se+lt}" y1="${_.top+Q/2-Le/5}" x2="${se+lt}" y2="${_.top+Q/2+Le/5}" stroke="var(--bg)" stroke-width="0.4" pointer-events="none" />
          `}
          <!-- Right cursor line + handle -->
          ${wt`
            <line x1="${V}" y1="${_.top}" x2="${V}" y2="${_.top+Q}" stroke="var(--accent)" stroke-width="0.8" opacity="0.7" />
            <rect x="${V-Wn/2}" y="${_.top+Q/2-Le/2}" width="${Wn}" height="${Le}" rx="1.5" fill="var(--accent)" class="cursor-handle" />
            <line x1="${V-lt}" y1="${_.top+Q/2-Le/5}" x2="${V-lt}" y2="${_.top+Q/2+Le/5}" stroke="var(--bg)" stroke-width="0.4" pointer-events="none" />
            <line x1="${V+lt}" y1="${_.top+Q/2-Le/5}" x2="${V+lt}" y2="${_.top+Q/2+Le/5}" stroke="var(--bg)" stroke-width="0.4" pointer-events="none" />
          `}
        </svg>
        <!-- Handle drag zones (only on handles, not full chart) -->
        ${(()=>{const U=`${(se/ne*100).toFixed(1)}%`,ie=`${(V/ne*100).toFixed(1)}%`,le=fe=>Te=>{if(!p)return;Te.preventDefault(),Te.stopPropagation();const st=Te.currentTarget.closest(".timeseries-chart-wrapper")?.querySelector("svg");if(!st)return;const he=st.getBoundingClientRect(),Oe=he.width,We=_.left/ne*Oe,Ve=(ne-_.right)/ne*Oe-We,it=Be=>{const Se=Math.max(0,Math.min(1,(Be-he.left-We)/Ve));return Math.min(Math.floor(Se*h.length),h.length-1)},at=fe==="left"?se:V,yt=he.left+at/ne*Oe,Fs=Te.clientX-yt;document.body.style.cursor="col-resize";const jt=Be=>{const Se=Be.clientX-Fs,an=it(Se),Kt=h[an];if(Kt)if(fe==="left"){const rt=g??h[h.length-1].timestamp;p(Math.min(Kt.timestamp,rt),rt)}else{const rt=d??h[0].timestamp;p(rt,Math.max(Kt.timestamp,rt))}},ot=()=>{document.body.style.cursor="",document.removeEventListener("mousemove",jt),document.removeEventListener("mouseup",ot)};document.addEventListener("mousemove",jt),document.addEventListener("mouseup",ot)};return l`
            <div class="chart-handle-zone chart-handle-left" 
                 style="left: ${U};"
                 @mousedown=${le("left")}></div>
            <div class="chart-handle-zone chart-handle-right" 
                 style="left: ${ie};"
                 @mousedown=${le("right")}></div>
          `})()}
      </div>
      <div class="timeseries-summary">
        ${k?l`
              <span style="color: var(--accent);">▶ Turns ${T+1}–${I} of ${h.length}</span> · 
              ${new Date(A).toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"})}–${new Date(E).toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"})} · 
              ${B(Z+te+R+q)} · 
              ${J(H.reduce((U,ie)=>U+(ie.cost||0),0))}
            `:l`${h.length} msgs · ${B(u)} · ${J(f)}`}
      </div>
      ${pe?l`
              <div style="margin-top: 8px;">
                <div class="card-title" style="font-size: 12px; margin-bottom: 6px; color: var(--text);">Tokens by Type</div>
                <div class="cost-breakdown-bar" style="height: 18px;">
                  <div class="cost-segment output" style="width: ${gt(Z,M).toFixed(1)}%"></div>
                  <div class="cost-segment input" style="width: ${gt(te,M).toFixed(1)}%"></div>
                  <div class="cost-segment cache-write" style="width: ${gt(q,M).toFixed(1)}%"></div>
                  <div class="cost-segment cache-read" style="width: ${gt(R,M).toFixed(1)}%"></div>
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
            `:m}
    </div>
  `}function Yp(e,t,n,s){if(!e)return l`
      <div class="context-details-panel">
        <div class="muted" style="padding: 20px; text-align: center">No context data</div>
      </div>
    `;const i=kt(e.systemPrompt.chars),a=kt(e.skills.promptChars),o=kt(e.tools.listChars+e.tools.schemaChars),r=kt(e.injectedWorkspaceFiles.reduce((k,A)=>k+A.injectedChars,0)),c=i+a+o+r;let d="";if(t&&t.totalTokens>0){const k=t.input+t.cacheRead;k>0&&(d=`~${Math.min(c/k*100,100).toFixed(0)}% of input`)}const g=e.skills.entries.toSorted((k,A)=>A.blockChars-k.blockChars),p=e.tools.entries.toSorted((k,A)=>A.summaryChars+A.schemaChars-(k.summaryChars+k.schemaChars)),h=e.injectedWorkspaceFiles.toSorted((k,A)=>A.injectedChars-k.injectedChars),u=4,f=n,v=f?g:g.slice(0,u),$=f?p:p.slice(0,u),S=f?h:h.slice(0,u),C=g.length>u||p.length>u||h.length>u;return l`
    <div class="context-details-panel">
      <div class="context-breakdown-header">
        <div class="card-title" style="font-size: 12px; color: var(--text);">System Prompt Breakdown</div>
        ${C?l`<button class="context-expand-btn" @click=${s}>
                ${f?"Collapse":"Expand all"}
              </button>`:m}
      </div>
      <p class="context-weight-desc">
        ${d||"Base context per message"}
      </p>
      <div class="context-stacked-bar">
        <div class="context-segment system" style="width: ${gt(i,c).toFixed(1)}%" title="System: ~${B(i)}"></div>
        <div class="context-segment skills" style="width: ${gt(a,c).toFixed(1)}%" title="Skills: ~${B(a)}"></div>
        <div class="context-segment tools" style="width: ${gt(o,c).toFixed(1)}%" title="Tools: ~${B(o)}"></div>
        <div class="context-segment files" style="width: ${gt(r,c).toFixed(1)}%" title="Files: ~${B(r)}"></div>
      </div>
      <div class="context-legend">
        <span class="legend-item"><span class="legend-dot system"></span>Sys ~${B(i)}</span>
        <span class="legend-item"><span class="legend-dot skills"></span>Skills ~${B(a)}</span>
        <span class="legend-item"><span class="legend-dot tools"></span>Tools ~${B(o)}</span>
        <span class="legend-item"><span class="legend-dot files"></span>Files ~${B(r)}</span>
      </div>
      <div class="context-total">Total: ~${B(c)}</div>
      <div class="context-breakdown-grid">
        ${g.length>0?(()=>{const k=g.length-v.length;return l`
                  <div class="context-breakdown-card">
                    <div class="context-breakdown-title">Skills (${g.length})</div>
                    <div class="context-breakdown-list">
                      ${v.map(A=>l`
                          <div class="context-breakdown-item">
                            <span class="mono">${A.name}</span>
                            <span class="muted">~${B(kt(A.blockChars))}</span>
                          </div>
                        `)}
                    </div>
                    ${k>0?l`<div class="context-breakdown-more">+${k} more</div>`:m}
                  </div>
                `})():m}
        ${p.length>0?(()=>{const k=p.length-$.length;return l`
                  <div class="context-breakdown-card">
                    <div class="context-breakdown-title">Tools (${p.length})</div>
                    <div class="context-breakdown-list">
                      ${$.map(A=>l`
                          <div class="context-breakdown-item">
                            <span class="mono">${A.name}</span>
                            <span class="muted">~${B(kt(A.summaryChars+A.schemaChars))}</span>
                          </div>
                        `)}
                    </div>
                    ${k>0?l`<div class="context-breakdown-more">+${k} more</div>`:m}
                  </div>
                `})():m}
        ${h.length>0?(()=>{const k=h.length-S.length;return l`
                  <div class="context-breakdown-card">
                    <div class="context-breakdown-title">Files (${h.length})</div>
                    <div class="context-breakdown-list">
                      ${S.map(A=>l`
                          <div class="context-breakdown-item">
                            <span class="mono">${A.name}</span>
                            <span class="muted">~${B(kt(A.injectedChars))}</span>
                          </div>
                        `)}
                    </div>
                    ${k>0?l`<div class="context-breakdown-more">+${k} more</div>`:m}
                  </div>
                `})():m}
      </div>
    </div>
  `}function Zp(e,t,n,s,i,a,o,r,c,d,g,p){if(t)return l`
      <div class="session-logs-compact">
        <div class="session-logs-header">Conversation</div>
        <div class="muted" style="padding: 20px; text-align: center">Loading...</div>
      </div>
    `;if(!e||e.length===0)return l`
      <div class="session-logs-compact">
        <div class="session-logs-header">Conversation</div>
        <div class="muted" style="padding: 20px; text-align: center">No messages</div>
      </div>
    `;const h=i.query.trim().toLowerCase(),u=e.map(E=>{const T=Fl(E.content),I=T.cleanContent||E.content;return{log:E,toolInfo:T,cleanContent:I}}),f=Array.from(new Set(u.flatMap(E=>E.toolInfo.tools.map(([T])=>T)))).toSorted((E,T)=>E.localeCompare(T)),v=u.filter(E=>{if(g!=null&&p!=null){const T=E.log.timestamp;if(T>0){const I=Math.min(g,p),H=Math.max(g,p),Z=Bl(T);if(Z<I||Z>H)return!1}}return!(i.roles.length>0&&!i.roles.includes(E.log.role)||i.hasTools&&E.toolInfo.tools.length===0||i.tools.length>0&&!E.toolInfo.tools.some(([I])=>i.tools.includes(I))||h&&!E.cleanContent.toLowerCase().includes(h))}),$=i.roles.length>0||i.tools.length>0||i.hasTools||h,S=g!=null&&p!=null,C=$||S?`${v.length} of ${e.length} ${S?"(timeline filtered)":""}`:`${e.length}`,k=new Set(i.roles),A=new Set(i.tools);return l`
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
          ${f.map(E=>l`<option value=${E} ?selected=${A.has(E)}>${E}</option>`)}
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
        ${v.map(E=>{const{log:T,toolInfo:I,cleanContent:H}=E,Z=T.role==="user"?"user":"assistant",te=T.role==="user"?"You":T.role==="assistant"?"Assistant":"Tool";return l`
          <div class="session-log-entry ${Z}">
            <div class="session-log-meta">
              <span class="session-log-role">${te}</span>
              <span>${new Date(T.timestamp).toLocaleString()}</span>
              ${T.tokens?l`<span>${B(T.tokens)}</span>`:m}
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
                  `:m}
          </div>
        `})}
        ${v.length===0?l`
                <div class="muted" style="padding: 12px">No messages match the filters.</div>
              `:m}
      </div>
    </div>
  `}const Xp=`
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
`,Jp=`
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
`,ef=`
  
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
`,tf=[Xp,Jp,ef].join(`
`);function nf(e){if(e.loading&&!e.totals)return l`
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
    `;const t=e.chartMode==="tokens",n=e.query.trim().length>0,s=e.queryDraft.trim().length>0,i=[...e.sessions].toSorted((M,D)=>{const F=t?M.usage?.totalTokens??0:M.usage?.totalCost??0;return(t?D.usage?.totalTokens??0:D.usage?.totalCost??0)-F}),a=e.selectedDays.length>0?i.filter(M=>{if(M.usage?.activityDates?.length)return M.usage.activityDates.some(K=>e.selectedDays.includes(K));if(!M.updatedAt)return!1;const D=new Date(M.updatedAt),F=`${D.getFullYear()}-${String(D.getMonth()+1).padStart(2,"0")}-${String(D.getDate()).padStart(2,"0")}`;return e.selectedDays.includes(F)}):i,o=(M,D)=>{if(D.length===0)return!0;const F=M.usage,K=F?.firstActivity??M.updatedAt,ce=F?.lastActivity??M.updatedAt;if(!K||!ce)return!1;const X=Math.min(K,ce),se=Math.max(K,ce);let V=X;for(;V<=se;){const U=new Date(V),ie=ha(U,e.timeZone);if(D.includes(ie))return!0;const le=va(U,e.timeZone);V=Math.min(le.getTime(),se)+1}return!1},r=e.selectedHours.length>0?a.filter(M=>o(M,e.selectedHours)):a,c=mp(r,e.query),d=c.sessions,g=c.warnings,p=Ip(e.queryDraft,i,e.aggregates),h=fa(e.query),u=M=>{const D=Et(M);return h.filter(F=>Et(F.key??"")===D).map(F=>F.value).filter(Boolean)},f=M=>{const D=new Set;for(const F of M)F&&D.add(F);return Array.from(D)},v=f(i.map(M=>M.agentId)).slice(0,12),$=f(i.map(M=>M.channel)).slice(0,12),S=f([...i.map(M=>M.modelProvider),...i.map(M=>M.providerOverride),...e.aggregates?.byProvider.map(M=>M.provider)??[]]).slice(0,12),C=f([...i.map(M=>M.model),...e.aggregates?.byModel.map(M=>M.model)??[]]).slice(0,12),k=f(e.aggregates?.tools.tools.map(M=>M.name)??[]).slice(0,12),A=e.selectedSessions.length===1?e.sessions.find(M=>M.key===e.selectedSessions[0])??d.find(M=>M.key===e.selectedSessions[0]):null,E=M=>M.reduce((D,F)=>(F.usage&&(D.input+=F.usage.input,D.output+=F.usage.output,D.cacheRead+=F.usage.cacheRead,D.cacheWrite+=F.usage.cacheWrite,D.totalTokens+=F.usage.totalTokens,D.totalCost+=F.usage.totalCost,D.inputCost+=F.usage.inputCost??0,D.outputCost+=F.usage.outputCost??0,D.cacheReadCost+=F.usage.cacheReadCost??0,D.cacheWriteCost+=F.usage.cacheWriteCost??0,D.missingCostEntries+=F.usage.missingCostEntries??0),D),{input:0,output:0,cacheRead:0,cacheWrite:0,totalTokens:0,totalCost:0,inputCost:0,outputCost:0,cacheReadCost:0,cacheWriteCost:0,missingCostEntries:0}),T=M=>e.costDaily.filter(F=>M.includes(F.date)).reduce((F,K)=>(F.input+=K.input,F.output+=K.output,F.cacheRead+=K.cacheRead,F.cacheWrite+=K.cacheWrite,F.totalTokens+=K.totalTokens,F.totalCost+=K.totalCost,F.inputCost+=K.inputCost??0,F.outputCost+=K.outputCost??0,F.cacheReadCost+=K.cacheReadCost??0,F.cacheWriteCost+=K.cacheWriteCost??0,F),{input:0,output:0,cacheRead:0,cacheWrite:0,totalTokens:0,totalCost:0,inputCost:0,outputCost:0,cacheReadCost:0,cacheWriteCost:0,missingCostEntries:0});let I,H;const Z=i.length;if(e.selectedSessions.length>0){const M=d.filter(D=>e.selectedSessions.includes(D.key));I=E(M),H=M.length}else e.selectedDays.length>0&&e.selectedHours.length===0?(I=T(e.selectedDays),H=d.length):e.selectedHours.length>0||n?(I=E(d),H=d.length):(I=e.totals,H=Z);const te=e.selectedSessions.length>0?d.filter(M=>e.selectedSessions.includes(M.key)):n||e.selectedHours.length>0?d:e.selectedDays.length>0?a:i,R=Tp(te,e.aggregates),q=e.selectedSessions.length>0?(()=>{const M=d.filter(F=>e.selectedSessions.includes(F.key)),D=new Set;for(const F of M)for(const K of F.usage?.activityDates??[])D.add(K);return D.size>0?e.costDaily.filter(F=>D.has(F.date)):e.costDaily})():e.costDaily,ne=_p(te,I,R),oe=!e.loading&&!e.totals&&e.sessions.length===0,_=(I?.missingCostEntries??0)>0||(I?I.totalTokens>0&&I.totalCost===0&&I.input+I.output+I.cacheRead+I.cacheWrite>0:!1),j=[{label:"Today",days:1},{label:"7d",days:7},{label:"30d",days:30}],Q=M=>{const D=new Date,F=new Date;F.setDate(F.getDate()-(M-1)),e.onStartDateChange(ei(F)),e.onEndDateChange(ei(D))},re=(M,D,F)=>{if(F.length===0)return m;const K=u(M),ce=new Set(K.map(V=>Et(V))),X=F.length>0&&F.every(V=>ce.has(Et(V))),se=K.length;return l`
      <details
        class="usage-filter-select"
        @toggle=${V=>{const U=V.currentTarget;if(!U.open)return;const ie=le=>{le.composedPath().includes(U)||(U.open=!1,window.removeEventListener("click",ie,!0))};window.addEventListener("click",ie,!0)}}
      >
        <summary>
          <span>${D}</span>
          ${se>0?l`<span class="usage-filter-badge">${se}</span>`:l`
                  <span class="usage-filter-badge">All</span>
                `}
        </summary>
        <div class="usage-filter-popover">
          <div class="usage-filter-actions">
            <button
              class="btn btn-sm"
              @click=${V=>{V.preventDefault(),V.stopPropagation(),e.onQueryDraftChange(Io(e.queryDraft,M,F))}}
              ?disabled=${X}
            >
              Select All
            </button>
            <button
              class="btn btn-sm"
              @click=${V=>{V.preventDefault(),V.stopPropagation(),e.onQueryDraftChange(Io(e.queryDraft,M,[]))}}
              ?disabled=${se===0}
            >
              Clear
            </button>
          </div>
          <div class="usage-filter-options">
            ${F.map(V=>{const U=ce.has(Et(V));return l`
                <label class="usage-filter-option">
                  <input
                    type="checkbox"
                    .checked=${U}
                    @change=${ie=>{const le=ie.target,fe=`${M}:${V}`;e.onQueryDraftChange(le.checked?Pp(e.queryDraft,fe):Mo(e.queryDraft,fe))}}
                  />
                  <span>${V}</span>
                </label>
              `})}
          </div>
        </div>
      </details>
    `},pe=ei(new Date);return l`
    <style>${tf}</style>

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
                `:m}
          ${oe?l`
                  <span class="usage-query-hint">Select a date range and click Refresh to load usage.</span>
                `:m}
        </div>
        <div class="usage-header-metrics">
          ${I?l`
                <span class="usage-metric-badge">
                  <strong>${B(I.totalTokens)}</strong> tokens
                </span>
                <span class="usage-metric-badge">
                  <strong>${J(I.totalCost)}</strong> cost
                </span>
                <span class="usage-metric-badge">
                  <strong>${H}</strong>
                  session${H!==1?"s":""}
                </span>
              `:m}
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
                  @click=${()=>ti(`openclaw-usage-sessions-${pe}.csv`,Lp(d),"text/csv")}
                  ?disabled=${d.length===0}
                >
                  Sessions CSV
                </button>
                <button
                  class="usage-export-item"
                  @click=${()=>ti(`openclaw-usage-daily-${pe}.csv`,Mp(q),"text/csv")}
                  ?disabled=${q.length===0}
                >
                  Daily CSV
                </button>
                <button
                  class="usage-export-item"
                  @click=${()=>ti(`openclaw-usage-${pe}.json`,JSON.stringify({totals:I,sessions:d,daily:q,aggregates:R},null,2),"application/json")}
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
          ${Fp(e.selectedDays,e.selectedHours,e.selectedSessions,e.sessions,e.onClearDays,e.onClearHours,e.onClearSessions,e.onClearFilters)}
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
            ${s||n?l`<button class="btn btn-sm usage-action-btn usage-secondary-btn" @click=${e.onClearQuery}>Clear</button>`:m}
            <span class="usage-query-hint">
              ${n?`${d.length} of ${Z} sessions match`:`${Z} sessions in range`}
            </span>
          </div>
        </div>
        <div class="usage-filter-row">
          ${re("agent","Agent",v)}
          ${re("channel","Channel",$)}
          ${re("provider","Provider",S)}
          ${re("model","Model",C)}
          ${re("tool","Tool",k)}
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
                          @click=${()=>e.onQueryDraftChange(Mo(e.queryDraft,D))}
                        >
                          ×
                        </button>
                      </span>
                    `})}
                </div>
              `:m}
        ${p.length>0?l`
                <div class="usage-query-suggestions">
                  ${p.map(M=>l`
                      <button
                        class="usage-query-suggestion"
                        @click=${()=>e.onQueryDraftChange(Rp(e.queryDraft,M.value))}
                      >
                        ${M.label}
                      </button>
                    `)}
                </div>
              `:m}
        ${g.length>0?l`
                <div class="callout warning" style="margin-top: 8px;">
                  ${g.join(" · ")}
                </div>
              `:m}
      </div>

      ${e.error?l`<div class="callout danger" style="margin-top: 12px;">${e.error}</div>`:m}

      ${e.sessionsLimitReached?l`
              <div class="callout warning" style="margin-top: 12px">
                Showing first 1,000 sessions. Narrow date range for complete results.
              </div>
            `:m}
    </section>

    ${Bp(I,R,ne,_,$p(te,e.timeZone),H,Z)}

    ${Ap(te,e.timeZone,e.selectedHours,e.onSelectHour)}

    <!-- Two-column layout: Daily+Breakdown on left, Sessions on right -->
    <div class="usage-grid">
      <div class="usage-grid-left">
        <div class="card usage-left-card">
          ${Np(q,e.selectedDays,e.chartMode,e.dailyChartMode,e.onDailyChartModeChange,e.onSelectDay)}
          ${I?Op(I,e.chartMode):m}
        </div>
      </div>
      <div class="usage-grid-right">
        ${zp(d,e.selectedSessions,e.selectedDays,t,e.sessionSort,e.sessionSortDir,e.recentSessions,e.sessionsTab,e.onSelectSession,e.onSessionSortChange,e.onSessionSortDirChange,e.onSessionsTabChange,e.visibleColumns,Z,e.onClearSessions)}
      </div>
    </div>

    <!-- Session Detail Panel (when selected) or Empty State -->
    ${A?Gp(A,e.timeSeries,e.timeSeriesLoading,e.timeSeriesMode,e.onTimeSeriesModeChange,e.timeSeriesBreakdownMode,e.onTimeSeriesBreakdownChange,e.timeSeriesCursorStart,e.timeSeriesCursorEnd,e.onTimeSeriesCursorRangeChange,e.startDate,e.endDate,e.selectedDays,e.sessionLogs,e.sessionLogsLoading,e.sessionLogsExpanded,e.onToggleSessionLogsExpanded,{roles:e.logFilterRoles,tools:e.logFilterTools,hasTools:e.logFilterHasTools,query:e.logFilterQuery},e.onLogFilterRolesChange,e.onLogFilterToolsChange,e.onLogFilterHasToolsChange,e.onLogFilterQueryChange,e.onLogFilterClear,e.contextExpanded,e.onToggleContextExpanded,e.onClearSessions):Kp()}
  `}let ni=null;const Po=e=>{ni&&clearTimeout(ni),ni=window.setTimeout(()=>{Dl(e)},400)};function sf(e){return e.tab!=="usage"?m:nf({loading:e.usageLoading,error:e.usageError,startDate:e.usageStartDate,endDate:e.usageEndDate,sessions:e.usageResult?.sessions??[],sessionsLimitReached:(e.usageResult?.sessions?.length??0)>=1e3,totals:e.usageResult?.totals??null,aggregates:e.usageResult?.aggregates??null,costDaily:e.usageCostSummary?.daily??[],selectedSessions:e.usageSelectedSessions,selectedDays:e.usageSelectedDays,selectedHours:e.usageSelectedHours,chartMode:e.usageChartMode,dailyChartMode:e.usageDailyChartMode,timeSeriesMode:e.usageTimeSeriesMode,timeSeriesBreakdownMode:e.usageTimeSeriesBreakdownMode,timeSeries:e.usageTimeSeries,timeSeriesLoading:e.usageTimeSeriesLoading,timeSeriesCursorStart:e.usageTimeSeriesCursorStart,timeSeriesCursorEnd:e.usageTimeSeriesCursorEnd,sessionLogs:e.usageSessionLogs,sessionLogsLoading:e.usageSessionLogsLoading,sessionLogsExpanded:e.usageSessionLogsExpanded,logFilterRoles:e.usageLogFilterRoles,logFilterTools:e.usageLogFilterTools,logFilterHasTools:e.usageLogFilterHasTools,logFilterQuery:e.usageLogFilterQuery,query:e.usageQuery,queryDraft:e.usageQueryDraft,sessionSort:e.usageSessionSort,sessionSortDir:e.usageSessionSortDir,recentSessions:e.usageRecentSessions,sessionsTab:e.usageSessionsTab,visibleColumns:e.usageVisibleColumns,timeZone:e.usageTimeZone,contextExpanded:e.usageContextExpanded,headerPinned:e.usageHeaderPinned,onStartDateChange:t=>{e.usageStartDate=t,e.usageSelectedDays=[],e.usageSelectedHours=[],e.usageSelectedSessions=[],Po(e)},onEndDateChange:t=>{e.usageEndDate=t,e.usageSelectedDays=[],e.usageSelectedHours=[],e.usageSelectedSessions=[],Po(e)},onRefresh:()=>Dl(e),onTimeZoneChange:t=>{e.usageTimeZone=t},onToggleContextExpanded:()=>{e.usageContextExpanded=!e.usageContextExpanded},onToggleSessionLogsExpanded:()=>{e.usageSessionLogsExpanded=!e.usageSessionLogsExpanded},onLogFilterRolesChange:t=>{e.usageLogFilterRoles=t},onLogFilterToolsChange:t=>{e.usageLogFilterTools=t},onLogFilterHasToolsChange:t=>{e.usageLogFilterHasTools=t},onLogFilterQueryChange:t=>{e.usageLogFilterQuery=t},onLogFilterClear:()=>{e.usageLogFilterRoles=[],e.usageLogFilterTools=[],e.usageLogFilterHasTools=!1,e.usageLogFilterQuery=""},onToggleHeaderPinned:()=>{e.usageHeaderPinned=!e.usageHeaderPinned},onSelectHour:(t,n)=>{if(n&&e.usageSelectedHours.length>0){const s=Array.from({length:24},(r,c)=>c),i=e.usageSelectedHours[e.usageSelectedHours.length-1],a=s.indexOf(i),o=s.indexOf(t);if(a!==-1&&o!==-1){const[r,c]=a<o?[a,o]:[o,a],d=s.slice(r,c+1);e.usageSelectedHours=[...new Set([...e.usageSelectedHours,...d])]}}else e.usageSelectedHours.includes(t)?e.usageSelectedHours=e.usageSelectedHours.filter(s=>s!==t):e.usageSelectedHours=[...e.usageSelectedHours,t]},onQueryDraftChange:t=>{e.usageQueryDraft=t,e.usageQueryDebounceTimer&&window.clearTimeout(e.usageQueryDebounceTimer),e.usageQueryDebounceTimer=window.setTimeout(()=>{e.usageQuery=e.usageQueryDraft,e.usageQueryDebounceTimer=null},250)},onApplyQuery:()=>{e.usageQueryDebounceTimer&&(window.clearTimeout(e.usageQueryDebounceTimer),e.usageQueryDebounceTimer=null),e.usageQuery=e.usageQueryDraft},onClearQuery:()=>{e.usageQueryDebounceTimer&&(window.clearTimeout(e.usageQueryDebounceTimer),e.usageQueryDebounceTimer=null),e.usageQueryDraft="",e.usageQuery=""},onSessionSortChange:t=>{e.usageSessionSort=t},onSessionSortDirChange:t=>{e.usageSessionSortDir=t},onSessionsTabChange:t=>{e.usageSessionsTab=t},onToggleColumn:t=>{e.usageVisibleColumns.includes(t)?e.usageVisibleColumns=e.usageVisibleColumns.filter(n=>n!==t):e.usageVisibleColumns=[...e.usageVisibleColumns,t]},onSelectSession:(t,n)=>{if(e.usageTimeSeries=null,e.usageSessionLogs=null,e.usageRecentSessions=[t,...e.usageRecentSessions.filter(s=>s!==t)].slice(0,8),n&&e.usageSelectedSessions.length>0){const s=e.usageChartMode==="tokens",a=[...e.usageResult?.sessions??[]].toSorted((d,g)=>{const p=s?d.usage?.totalTokens??0:d.usage?.totalCost??0;return(s?g.usage?.totalTokens??0:g.usage?.totalCost??0)-p}).map(d=>d.key),o=e.usageSelectedSessions[e.usageSelectedSessions.length-1],r=a.indexOf(o),c=a.indexOf(t);if(r!==-1&&c!==-1){const[d,g]=r<c?[r,c]:[c,r],p=a.slice(d,g+1),h=[...new Set([...e.usageSelectedSessions,...p])];e.usageSelectedSessions=h}}else e.usageSelectedSessions.length===1&&e.usageSelectedSessions[0]===t?e.usageSelectedSessions=[]:e.usageSelectedSessions=[t];e.usageTimeSeriesCursorStart=null,e.usageTimeSeriesCursorEnd=null,e.usageSelectedSessions.length===1&&(dp(e,e.usageSelectedSessions[0]),up(e,e.usageSelectedSessions[0]))},onSelectDay:(t,n)=>{if(n&&e.usageSelectedDays.length>0){const s=(e.usageCostSummary?.daily??[]).map(r=>r.date),i=e.usageSelectedDays[e.usageSelectedDays.length-1],a=s.indexOf(i),o=s.indexOf(t);if(a!==-1&&o!==-1){const[r,c]=a<o?[a,o]:[o,a],d=s.slice(r,c+1),g=[...new Set([...e.usageSelectedDays,...d])];e.usageSelectedDays=g}}else e.usageSelectedDays.includes(t)?e.usageSelectedDays=e.usageSelectedDays.filter(s=>s!==t):e.usageSelectedDays=[t]},onChartModeChange:t=>{e.usageChartMode=t},onDailyChartModeChange:t=>{e.usageDailyChartMode=t},onTimeSeriesModeChange:t=>{e.usageTimeSeriesMode=t},onTimeSeriesBreakdownChange:t=>{e.usageTimeSeriesBreakdownMode=t},onTimeSeriesCursorRangeChange:(t,n)=>{e.usageTimeSeriesCursorStart=t,e.usageTimeSeriesCursorEnd=n},onClearDays:()=>{e.usageSelectedDays=[]},onClearHours:()=>{e.usageSelectedHours=[]},onClearSessions:()=>{e.usageSelectedSessions=[],e.usageTimeSeries=null,e.usageSessionLogs=null},onClearFilters:()=>{e.usageSelectedDays=[],e.usageSelectedHours=[],e.usageSelectedSessions=[],e.usageTimeSeries=null,e.usageSessionLogs=null}})}const ma={CHILD:2},ba=e=>(...t)=>({_$litDirective$:e,values:t});let ya=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,n,s){this._$Ct=t,this._$AM=n,this._$Ci=s}_$AS(t,n){return this.update(t,n)}update(t,n){return this.render(...n)}};const{I:af}=Jc,Do=e=>e,of=e=>e.strings===void 0,Fo=()=>document.createComment(""),ln=(e,t,n)=>{const s=e._$AA.parentNode,i=t===void 0?e._$AB:t._$AA;if(n===void 0){const a=s.insertBefore(Fo(),i),o=s.insertBefore(Fo(),i);n=new af(a,o,e,e.options)}else{const a=n._$AB.nextSibling,o=n._$AM,r=o!==e;if(r){let c;n._$AQ?.(e),n._$AM=e,n._$AP!==void 0&&(c=e._$AU)!==o._$AU&&n._$AP(c)}if(a!==i||r){let c=n._$AA;for(;c!==a;){const d=Do(c).nextSibling;Do(s).insertBefore(c,i),c=d}}}return n},St=(e,t,n=e)=>(e._$AI(t,n),e),rf={},lf=(e,t=rf)=>e._$AH=t,cf=e=>e._$AH,si=e=>{e._$AR(),e._$AA.remove()};const No=(e,t,n)=>{const s=new Map;for(let i=t;i<=n;i++)s.set(e[i],i);return s},zl=ba(class extends ya{constructor(e){if(super(e),e.type!==ma.CHILD)throw Error("repeat() can only be used in text expressions")}dt(e,t,n){let s;n===void 0?n=t:t!==void 0&&(s=t);const i=[],a=[];let o=0;for(const r of e)i[o]=s?s(r,o):o,a[o]=n(r,o),o++;return{values:a,keys:i}}render(e,t,n){return this.dt(e,t,n).values}update(e,[t,n,s]){const i=cf(e),{values:a,keys:o}=this.dt(t,n,s);if(!Array.isArray(i))return this.ut=o,a;const r=this.ut??=[],c=[];let d,g,p=0,h=i.length-1,u=0,f=a.length-1;for(;p<=h&&u<=f;)if(i[p]===null)p++;else if(i[h]===null)h--;else if(r[p]===o[u])c[u]=St(i[p],a[u]),p++,u++;else if(r[h]===o[f])c[f]=St(i[h],a[f]),h--,f--;else if(r[p]===o[f])c[f]=St(i[p],a[f]),ln(e,c[f+1],i[p]),p++,f--;else if(r[h]===o[u])c[u]=St(i[h],a[u]),ln(e,i[p],i[h]),h--,u++;else if(d===void 0&&(d=No(o,u,f),g=No(r,p,h)),d.has(r[p]))if(d.has(r[h])){const v=g.get(o[u]),$=v!==void 0?i[v]:null;if($===null){const S=ln(e,i[p]);St(S,a[u]),c[u]=S}else c[u]=St($,a[u]),ln(e,i[p],$),i[v]=null;u++}else si(i[h]),h--;else si(i[p]),p++;for(;u<=f;){const v=ln(e,c[f+1]);St(v,a[u]),c[u++]=v}for(;p<=h;){const v=i[p++];v!==null&&si(v)}return this.ut=o,lf(e,c),ft}}),me={messageSquare:l`
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
  `};function df(e){const t=e.hello?.snapshot,n=t?.sessionDefaults?.mainSessionKey?.trim();if(n)return n;const s=t?.sessionDefaults?.mainKey?.trim();return s||"main"}function uf(e,t){e.sessionKey=t,e.chatMessage="",e.chatStream=null,e.chatStreamStartedAt=null,e.chatRunId=null,e.resetToolStream(),e.resetChatScroll(),e.applySettings({...e.settings,sessionKey:t,lastActiveSessionKey:t})}function gf(e,t){const n=_s(t,e.basePath);return l`
    <a
      href=${n}
      class="nav-item ${e.tab===t?"active":""}"
      @click=${s=>{if(!(s.defaultPrevented||s.button!==0||s.metaKey||s.ctrlKey||s.shiftKey||s.altKey)){if(s.preventDefault(),t==="chat"){const i=df(e);e.sessionKey!==i&&(uf(e,i),e.loadAssistantIdentity())}e.setTab(t)}}}
      title=${wi(t)}
    >
      <span class="nav-item__icon" aria-hidden="true">${me[Qu(t)]}</span>
      <span class="nav-item__text">${wi(t)}</span>
    </a>
  `}function pf(e){const t=ff(e.hello,e.sessionsResult),n=mf(e.sessionKey,e.sessionsResult,t),s=e.onboarding,i=e.onboarding,a=e.onboarding?!1:e.settings.chatShowThinking,o=e.onboarding?!0:e.settings.chatFocusMode,r=l`
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
          @change=${d=>{const g=d.target.value;e.sessionKey=g,e.chatMessage="",e.chatStream=null,e.chatStreamStartedAt=null,e.chatRunId=null,e.resetToolStream(),e.resetChatScroll(),e.applySettings({...e.settings,sessionKey:g,lastActiveSessionKey:g}),e.loadAssistantIdentity(),ug(e,g),Xt(e)}}
        >
          ${zl(n,d=>d.key,d=>l`<option value=${d.key} title=${d.key}>
                ${d.displayName??d.key}
              </option>`)}
        </select>
      </label>
      <button
        class="btn btn--sm btn--icon"
        ?disabled=${e.chatLoading||!e.connected}
        @click=${async()=>{const d=e;d.chatManualRefreshInFlight=!0,d.chatNewMessagesBelow=!1,await d.updateComplete,d.resetToolStream();try{await Ll(e,{scheduleScroll:!1}),d.scrollToBottom({smooth:!0})}finally{requestAnimationFrame(()=>{d.chatManualRefreshInFlight=!1,d.chatNewMessagesBelow=!1})}}}
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
        ${me.brain}
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
  `}function ff(e,t){const n=e?.snapshot,s=n?.sessionDefaults?.mainSessionKey?.trim();if(s)return s;const i=n?.sessionDefaults?.mainKey?.trim();return i||(t?.sessions?.some(a=>a.key==="main")?"main":null)}const as={bluebubbles:"iMessage",telegram:"Telegram",discord:"Discord",signal:"Signal",slack:"Slack",whatsapp:"WhatsApp",matrix:"Matrix",email:"Email",sms:"SMS"},hf=Object.keys(as);function Oo(e){return e.charAt(0).toUpperCase()+e.slice(1)}function vf(e){if(e==="main"||e==="agent:main:main")return{prefix:"",fallbackName:"Main Session"};if(e.includes(":subagent:"))return{prefix:"Subagent:",fallbackName:"Subagent:"};if(e.includes(":cron:"))return{prefix:"Cron:",fallbackName:"Cron Job:"};const t=e.match(/^agent:[^:]+:([^:]+):direct:(.+)$/);if(t){const s=t[1],i=t[2];return{prefix:"",fallbackName:`${as[s]??Oo(s)} · ${i}`}}const n=e.match(/^agent:[^:]+:([^:]+):group:(.+)$/);if(n){const s=n[1];return{prefix:"",fallbackName:`${as[s]??Oo(s)} Group`}}for(const s of hf)if(e===s||e.startsWith(`${s}:`))return{prefix:"",fallbackName:`${as[s]} Session`};return{prefix:"",fallbackName:e}}function ii(e,t){const n=t?.label?.trim()||"",s=t?.displayName?.trim()||"",{prefix:i,fallbackName:a}=vf(e),o=r=>i?new RegExp(`^${i.replace(/[.*+?^${}()|[\\]\\]/g,"\\$&")}\\s*`,"i").test(r)?r:`${i} ${r}`:r;return n&&n!==e?o(n):s&&s!==e?o(s):a}function mf(e,t,n){const s=new Set,i=[],a=n&&t?.sessions?.find(r=>r.key===n),o=t?.sessions?.find(r=>r.key===e);if(n&&(s.add(n),i.push({key:n,displayName:ii(n,a||void 0)})),s.has(e)||(s.add(e),i.push({key:e,displayName:ii(e,o)})),t?.sessions)for(const r of t.sessions)s.has(r.key)||(s.add(r.key),i.push({key:r.key,displayName:ii(r.key,r)}));return i}const bf=["system","light","dark"];function yf(e){const t=Math.max(0,bf.indexOf(e.theme)),n=s=>i=>{const o={element:i.currentTarget};(i.clientX||i.clientY)&&(o.pointerClientX=i.clientX,o.pointerClientY=i.clientY),e.setTheme(s,o)};return l`
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
          ${wf()}
        </button>
        <button
          class="theme-toggle__button ${e.theme==="light"?"active":""}"
          @click=${n("light")}
          aria-pressed=${e.theme==="light"}
          aria-label="Light theme"
          title="Light"
        >
          ${xf()}
        </button>
        <button
          class="theme-toggle__button ${e.theme==="dark"?"active":""}"
          @click=${n("dark")}
          aria-pressed=${e.theme==="dark"}
          aria-label="Dark theme"
          title="Dark"
        >
          ${$f()}
        </button>
      </div>
    </div>
  `}function xf(){return l`
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
  `}function $f(){return l`
    <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"
      ></path>
    </svg>
  `}function wf(){return l`
    <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="20" height="14" x="2" y="3" rx="2"></rect>
      <line x1="8" x2="16" y1="21" y2="21"></line>
      <line x1="12" x2="12" y1="17" y2="21"></line>
    </svg>
  `}function Ul(e,t){if(!e)return e;const s=e.files.some(i=>i.name===t.name)?e.files.map(i=>i.name===t.name?t:i):[...e.files,t];return{...e,files:s}}async function ai(e,t){if(!(!e.client||!e.connected||e.agentFilesLoading)){e.agentFilesLoading=!0,e.agentFilesError=null;try{const n=await e.client.request("agents.files.list",{agentId:t});n&&(e.agentFilesList=n,e.agentFileActive&&!n.files.some(s=>s.name===e.agentFileActive)&&(e.agentFileActive=null))}catch(n){e.agentFilesError=String(n)}finally{e.agentFilesLoading=!1}}}async function kf(e,t,n,s){if(!(!e.client||!e.connected||e.agentFilesLoading)&&!Object.hasOwn(e.agentFileContents,n)){e.agentFilesLoading=!0,e.agentFilesError=null;try{const i=await e.client.request("agents.files.get",{agentId:t,name:n});if(i?.file){const a=i.file.content??"",o=e.agentFileContents[n]??"",r=e.agentFileDrafts[n],c=s?.preserveDraft??!0;e.agentFilesList=Ul(e.agentFilesList,i.file),e.agentFileContents={...e.agentFileContents,[n]:a},(!c||!Object.hasOwn(e.agentFileDrafts,n)||r===o)&&(e.agentFileDrafts={...e.agentFileDrafts,[n]:a})}}catch(i){e.agentFilesError=String(i)}finally{e.agentFilesLoading=!1}}}async function Sf(e,t,n,s){if(!(!e.client||!e.connected||e.agentFileSaving)){e.agentFileSaving=!0,e.agentFilesError=null;try{const i=await e.client.request("agents.files.set",{agentId:t,name:n,content:s});i?.file&&(e.agentFilesList=Ul(e.agentFilesList,i.file),e.agentFileContents={...e.agentFileContents,[n]:s},e.agentFileDrafts={...e.agentFileDrafts,[n]:s})}catch(i){e.agentFilesError=String(i)}finally{e.agentFileSaving=!1}}}function Af(e){const t=e.host??"unknown",n=e.ip?`(${e.ip})`:"",s=e.mode??"",i=e.version??"";return`${t} ${n} ${s} ${i}`.trim()}function Cf(e){const t=e.ts??null;return t?ee(t):"n/a"}function xa(e){return e?`${Nt(e)} (${ee(e)})`:"n/a"}function Tf(e){if(e.totalTokens==null)return"n/a";const t=e.totalTokens??0,n=e.contextTokens??0;return n?`${t} / ${n}`:String(t)}function _f(e){if(e==null)return"";try{return JSON.stringify(e,null,2)}catch{return String(e)}}function Ef(e){const t=e.state??{},n=t.nextRunAtMs?Nt(t.nextRunAtMs):"n/a",s=t.lastRunAtMs?Nt(t.lastRunAtMs):"n/a";return`${t.lastStatus??"n/a"} · next ${n} · last ${s}`}function Hl(e){const t=e.schedule;if(t.kind==="at"){const n=Date.parse(t.at);return Number.isFinite(n)?`At ${Nt(n)}`:`At ${t.at}`}return t.kind==="every"?`Every ${ta(t.everyMs)}`:`Cron ${t.expr}${t.tz?` (${t.tz})`:""}`}function Lf(e){const t=e.payload;if(t.kind==="systemEvent")return`System: ${t.text}`;const n=`Agent: ${t.message}`,s=e.delivery;if(s&&s.mode!=="none"){const i=s.mode==="webhook"?s.to?` (${s.to})`:"":s.channel||s.to?` (${s.channel??"last"}${s.to?` -> ${s.to}`:""})`:"";return`${n} · ${s.mode}${i}`}return n}const Mf={bash:"exec","apply-patch":"apply_patch"},If={"group:memory":["memory_search","memory_get"],"group:web":["web_search","web_fetch"],"group:fs":["read","write","edit","apply_patch"],"group:runtime":["exec","process"],"group:sessions":["sessions_list","sessions_history","sessions_send","sessions_spawn","subagents","session_status"],"group:ui":["browser","canvas"],"group:automation":["cron","gateway"],"group:messaging":["message"],"group:nodes":["nodes"],"group:openclaw":["browser","canvas","nodes","cron","message","gateway","agents_list","sessions_list","sessions_history","sessions_send","sessions_spawn","subagents","session_status","memory_search","memory_get","web_search","web_fetch","image"]},Rf={minimal:{allow:["session_status"]},coding:{allow:["group:fs","group:runtime","group:sessions","group:memory","image"]},messaging:{allow:["group:messaging","sessions_list","sessions_history","sessions_send","session_status"]},full:{}};function je(e){const t=e.trim().toLowerCase();return Mf[t]??t}function Pf(e){return e?e.map(je).filter(Boolean):[]}function Df(e){const t=Pf(e),n=[];for(const s of t){const i=If[s];if(i){n.push(...i);continue}n.push(s)}return Array.from(new Set(n))}function Ff(e){if(!e)return;const t=Rf[e];if(t&&!(!t.allow&&!t.deny))return{allow:t.allow?[...t.allow]:void 0,deny:t.deny?[...t.deny]:void 0}}const Bo=[{id:"fs",label:"Files",tools:[{id:"read",label:"read",description:"Read file contents"},{id:"write",label:"write",description:"Create or overwrite files"},{id:"edit",label:"edit",description:"Make precise edits"},{id:"apply_patch",label:"apply_patch",description:"Patch files (OpenAI)"}]},{id:"runtime",label:"Runtime",tools:[{id:"exec",label:"exec",description:"Run shell commands"},{id:"process",label:"process",description:"Manage background processes"}]},{id:"web",label:"Web",tools:[{id:"web_search",label:"web_search",description:"Search the web"},{id:"web_fetch",label:"web_fetch",description:"Fetch web content"}]},{id:"memory",label:"Memory",tools:[{id:"memory_search",label:"memory_search",description:"Semantic search"},{id:"memory_get",label:"memory_get",description:"Read memory files"}]},{id:"sessions",label:"Sessions",tools:[{id:"sessions_list",label:"sessions_list",description:"List sessions"},{id:"sessions_history",label:"sessions_history",description:"Session history"},{id:"sessions_send",label:"sessions_send",description:"Send to session"},{id:"sessions_spawn",label:"sessions_spawn",description:"Spawn sub-agent"},{id:"session_status",label:"session_status",description:"Session status"}]},{id:"ui",label:"UI",tools:[{id:"browser",label:"browser",description:"Control web browser"},{id:"canvas",label:"canvas",description:"Control canvases"}]},{id:"messaging",label:"Messaging",tools:[{id:"message",label:"message",description:"Send messages"}]},{id:"automation",label:"Automation",tools:[{id:"cron",label:"cron",description:"Schedule tasks"},{id:"gateway",label:"gateway",description:"Gateway control"}]},{id:"nodes",label:"Nodes",tools:[{id:"nodes",label:"nodes",description:"Nodes + devices"}]},{id:"agents",label:"Agents",tools:[{id:"agents_list",label:"agents_list",description:"List agents"}]},{id:"media",label:"Media",tools:[{id:"image",label:"image",description:"Image understanding"}]}],Nf=[{id:"minimal",label:"Minimal"},{id:"coding",label:"Coding"},{id:"messaging",label:"Messaging"},{id:"full",label:"Full"}];function Ti(e){return e.name?.trim()||e.identity?.name?.trim()||e.id}function qn(e){const t=e.trim();if(!t||t.length>16)return!1;let n=!1;for(let s=0;s<t.length;s+=1)if(t.charCodeAt(s)>127){n=!0;break}return!(!n||t.includes("://")||t.includes("/")||t.includes("."))}function Ms(e,t){const n=t?.emoji?.trim();if(n&&qn(n))return n;const s=e.identity?.emoji?.trim();if(s&&qn(s))return s;const i=t?.avatar?.trim();if(i&&qn(i))return i;const a=e.identity?.avatar?.trim();return a&&qn(a)?a:""}function jl(e,t){return t&&e===t?"default":null}function Of(e){if(e==null||!Number.isFinite(e))return"-";if(e<1024)return`${e} B`;const t=["KB","MB","GB","TB"];let n=e/1024,s=0;for(;n>=1024&&s<t.length-1;)n/=1024,s+=1;return`${n.toFixed(n<10?1:0)} ${t[s]}`}function Is(e,t){const n=e;return{entry:(n?.agents?.list??[]).find(a=>a?.id===t),defaults:n?.agents?.defaults,globalTools:n?.tools}}function zo(e,t,n,s,i){const a=Is(t,e.id),r=(n&&n.agentId===e.id?n.workspace:null)||a.entry?.workspace||a.defaults?.workspace||"default",c=a.entry?.model?xn(a.entry?.model):xn(a.defaults?.model),d=i?.name?.trim()||e.identity?.name?.trim()||e.name?.trim()||a.entry?.name||e.id,g=Ms(e,i)||"-",p=Array.isArray(a.entry?.skills)?a.entry?.skills:null,h=p?.length??null;return{workspace:r,model:c,identityName:d,identityEmoji:g,skillsLabel:p?`${h} selected`:"all skills",isDefault:!!(s&&e.id===s)}}function xn(e){if(!e)return"-";if(typeof e=="string")return e.trim()||"-";if(typeof e=="object"&&e){const t=e,n=t.primary?.trim();if(n){const s=Array.isArray(t.fallbacks)?t.fallbacks.length:0;return s>0?`${n} (+${s} fallback)`:n}}return"-"}function Uo(e){const t=e.match(/^(.+) \(\+\d+ fallback\)$/);return t?t[1]:e}function Ho(e){if(!e)return null;if(typeof e=="string")return e.trim()||null;if(typeof e=="object"&&e){const t=e;return(typeof t.primary=="string"?t.primary:typeof t.model=="string"?t.model:typeof t.id=="string"?t.id:typeof t.value=="string"?t.value:null)?.trim()||null}return null}function Bf(e){if(!e||typeof e=="string")return null;if(typeof e=="object"&&e){const t=e,n=Array.isArray(t.fallbacks)?t.fallbacks:Array.isArray(t.fallback)?t.fallback:null;return n?n.filter(s=>typeof s=="string"):null}return null}function zf(e){return e.split(",").map(t=>t.trim()).filter(Boolean)}function Uf(e){const n=e?.agents?.defaults?.models;if(!n||typeof n!="object")return[];const s=[];for(const[i,a]of Object.entries(n)){const o=i.trim();if(!o)continue;const r=a&&typeof a=="object"&&"alias"in a&&typeof a.alias=="string"?a.alias?.trim():void 0,c=r&&r!==o?`${r} (${o})`:o;s.push({value:o,label:c})}return s}function Hf(e,t){const n=Uf(e),s=t?n.some(i=>i.value===t):!1;return t&&!s&&n.unshift({value:t,label:`Current (${t})`}),n.length===0?l`
      <option value="" disabled>No configured models</option>
    `:n.map(i=>l`<option value=${i.value}>${i.label}</option>`)}function jf(e){const t=je(e);if(!t)return{kind:"exact",value:""};if(t==="*")return{kind:"all"};if(!t.includes("*"))return{kind:"exact",value:t};const n=t.replace(/[.*+?^${}()|[\\]\\]/g,"\\$&");return{kind:"regex",value:new RegExp(`^${n.replaceAll("\\*",".*")}$`)}}function _i(e){return Array.isArray(e)?Df(e).map(jf).filter(t=>t.kind!=="exact"||t.value.length>0):[]}function $n(e,t){for(const n of t)if(n.kind==="all"||n.kind==="exact"&&e===n.value||n.kind==="regex"&&n.value.test(e))return!0;return!1}function Kf(e,t){if(!t)return!0;const n=je(e),s=_i(t.deny);if($n(n,s))return!1;const i=_i(t.allow);return!!(i.length===0||$n(n,i)||n==="apply_patch"&&$n("exec",i))}function jo(e,t){if(!Array.isArray(t)||t.length===0)return!1;const n=je(e),s=_i(t);return!!($n(n,s)||n==="apply_patch"&&$n("exec",s))}function Wf(e){return Ff(e)??void 0}function Kl(e,t){return l`
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
  `}function qf(e,t){const n=e.channelMeta?.find(s=>s.id===t);return n?.label?n.label:e.channelLabels?.[t]??t}function Vf(e){if(!e)return[];const t=new Set;for(const i of e.channelOrder??[])t.add(i);for(const i of e.channelMeta??[])t.add(i.id);for(const i of Object.keys(e.channelAccounts??{}))t.add(i);const n=[],s=e.channelOrder?.length?e.channelOrder:Array.from(t);for(const i of s)t.has(i)&&(n.push(i),t.delete(i));for(const i of t)n.push(i);return n.map(i=>({id:i,label:qf(e,i),accounts:e.channelAccounts?.[i]??[]}))}const Gf=["groupPolicy","streamMode","dmPolicy"];function Qf(e,t){if(!e)return null;const s=(e.channels??{})[t];if(s&&typeof s=="object")return s;const i=e[t];return i&&typeof i=="object"?i:null}function Yf(e){if(e==null)return"n/a";if(typeof e=="string"||typeof e=="number"||typeof e=="boolean")return String(e);try{return JSON.stringify(e)}catch{return"n/a"}}function Zf(e,t){const n=Qf(e,t);return n?Gf.flatMap(s=>s in n?[{label:s,value:Yf(n[s])}]:[]):[]}function Xf(e){let t=0,n=0,s=0;for(const i of e){const a=i.probe&&typeof i.probe=="object"&&"ok"in i.probe?!!i.probe.ok:!1;(i.connected===!0||i.running===!0||a)&&(t+=1),i.configured&&(n+=1),i.enabled&&(s+=1)}return{total:e.length,connected:t,configured:n,enabled:s}}function Jf(e){const t=Vf(e.snapshot),n=e.lastSuccess?ee(e.lastSuccess):"never";return l`
    <section class="grid grid-cols-2">
      ${Kl(e.context,"Workspace, identity, and model configuration.")}
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
        ${e.error?l`<div class="callout danger" style="margin-top: 12px;">${e.error}</div>`:m}
        ${e.snapshot?m:l`
                <div class="callout info" style="margin-top: 12px">Load channels to see live status.</div>
              `}
        ${t.length===0?l`
                <div class="muted" style="margin-top: 16px">No channels found.</div>
              `:l`
                <div class="list" style="margin-top: 16px;">
                  ${t.map(s=>{const i=Xf(s.accounts),a=i.total?`${i.connected}/${i.total} connected`:"no accounts",o=i.configured?`${i.configured} configured`:"not configured",r=i.total?`${i.enabled} enabled`:"disabled",c=Zf(e.configForm,s.id);return l`
                      <div class="list-item">
                        <div class="list-main">
                          <div class="list-title">${s.label}</div>
                          <div class="list-sub mono">${s.id}</div>
                        </div>
                        <div class="list-meta">
                          <div>${a}</div>
                          <div>${o}</div>
                          <div>${r}</div>
                          ${c.length>0?c.map(d=>l`<div>${d.label}: ${d.value}</div>`):m}
                        </div>
                      </div>
                    `})}
                </div>
              `}
      </section>
    </section>
  `}function eh(e){const t=e.jobs.filter(n=>n.agentId===e.agentId);return l`
    <section class="grid grid-cols-2">
      ${Kl(e.context,"Workspace and scheduling targets.")}
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
            <div class="stat-value">${xa(e.status?.nextWakeAtMs??null)}</div>
          </div>
        </div>
        ${e.error?l`<div class="callout danger" style="margin-top: 12px;">${e.error}</div>`:m}
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
                        ${n.description?l`<div class="list-sub">${n.description}</div>`:m}
                        <div class="chip-row" style="margin-top: 6px;">
                          <span class="chip">${Hl(n)}</span>
                          <span class="chip ${n.enabled?"chip-ok":"chip-warn"}">
                            ${n.enabled?"enabled":"disabled"}
                          </span>
                          <span class="chip">${n.sessionTarget}</span>
                        </div>
                      </div>
                      <div class="list-meta">
                        <div class="mono">${Ef(n)}</div>
                        <div class="muted">${Lf(n)}</div>
                      </div>
                    </div>
                  `)}
              </div>
            `}
    </section>
  `}function th(e){const t=e.agentFilesList?.agentId===e.agentId?e.agentFilesList:null,n=t?.files??[],s=e.agentFileActive??null,i=s?n.find(c=>c.name===s)??null:null,a=s?e.agentFileContents[s]??"":"",o=s?e.agentFileDrafts[s]??a:"",r=s?o!==a:!1;return l`
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
      ${t?l`<div class="muted mono" style="margin-top: 8px;">Workspace: ${t.workspace}</div>`:m}
      ${e.agentFilesError?l`<div class="callout danger" style="margin-top: 12px;">${e.agentFilesError}</div>`:m}
      ${t?l`
              <div class="agent-files-grid" style="margin-top: 16px;">
                <div class="agent-files-list">
                  ${n.length===0?l`
                          <div class="muted">No files found.</div>
                        `:n.map(c=>nh(c,s,()=>e.onSelectFile(c.name)))}
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
                                `:m}
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
  `}function nh(e,t,n){const s=e.missing?"Missing":`${Of(e.size)} · ${ee(e.updatedAtMs??null)}`;return l`
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
            `:m}
    </button>
  `}const Vn=[{id:"workspace",label:"Workspace Skills",sources:["openclaw-workspace"]},{id:"built-in",label:"Built-in Skills",sources:["openclaw-bundled"]},{id:"installed",label:"Installed Skills",sources:["openclaw-managed"]},{id:"extra",label:"Extra Skills",sources:["openclaw-extra"]}];function Wl(e){const t=new Map;for(const a of Vn)t.set(a.id,{id:a.id,label:a.label,skills:[]});const n=Vn.find(a=>a.id==="built-in"),s={id:"other",label:"Other Skills",skills:[]};for(const a of e){const o=a.bundled?n:Vn.find(r=>r.sources.includes(a.source));o?t.get(o.id)?.skills.push(a):s.skills.push(a)}const i=Vn.map(a=>t.get(a.id)).filter(a=>!!(a&&a.skills.length>0));return s.skills.length>0&&i.push(s),i}function ql(e){return[...e.missing.bins.map(t=>`bin:${t}`),...e.missing.env.map(t=>`env:${t}`),...e.missing.config.map(t=>`config:${t}`),...e.missing.os.map(t=>`os:${t}`)]}function Vl(e){const t=[];return e.disabled&&t.push("disabled"),e.blockedByAllowlist&&t.push("blocked by allowlist"),t}function Gl(e){const t=e.skill,n=!!e.showBundledBadge;return l`
    <div class="chip-row" style="margin-top: 6px;">
      <span class="chip">${t.source}</span>
      ${n?l`
              <span class="chip">bundled</span>
            `:m}
      <span class="chip ${t.eligible?"chip-ok":"chip-warn"}">
        ${t.eligible?"eligible":"blocked"}
      </span>
      ${t.disabled?l`
              <span class="chip chip-warn">disabled</span>
            `:m}
    </div>
  `}function sh(e){const t=Is(e.configForm,e.agentId),n=t.entry?.tools??{},s=t.globalTools??{},i=n.profile??s.profile??"full",a=n.profile?"agent override":s.profile?"global default":"default",o=Array.isArray(n.allow)&&n.allow.length>0,r=Array.isArray(s.allow)&&s.allow.length>0,c=!!e.configForm&&!e.configLoading&&!e.configSaving&&!o,d=o?[]:Array.isArray(n.alsoAllow)?n.alsoAllow:[],g=o?[]:Array.isArray(n.deny)?n.deny:[],p=o?{allow:n.allow??[],deny:n.deny??[]}:Wf(i)??void 0,h=Bo.flatMap(S=>S.tools.map(C=>C.id)),u=S=>{const C=Kf(S,p),k=jo(S,d),A=jo(S,g);return{allowed:(C||k)&&!A,baseAllowed:C,denied:A}},f=h.filter(S=>u(S).allowed).length,v=(S,C)=>{const k=new Set(d.map(I=>je(I)).filter(I=>I.length>0)),A=new Set(g.map(I=>je(I)).filter(I=>I.length>0)),E=u(S).baseAllowed,T=je(S);C?(A.delete(T),E||k.add(T)):(k.delete(T),A.add(T)),e.onOverridesChange(e.agentId,[...k],[...A])},$=S=>{const C=new Set(d.map(A=>je(A)).filter(A=>A.length>0)),k=new Set(g.map(A=>je(A)).filter(A=>A.length>0));for(const A of h){const E=u(A).baseAllowed,T=je(A);S?(k.delete(T),E||C.add(T)):(C.delete(T),k.add(T))}e.onOverridesChange(e.agentId,[...C],[...k])};return l`
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
          <button class="btn btn--sm" ?disabled=${!c} @click=${()=>$(!0)}>
            Enable All
          </button>
          <button class="btn btn--sm" ?disabled=${!c} @click=${()=>$(!1)}>
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

      ${e.configForm?m:l`
              <div class="callout info" style="margin-top: 12px">
                Load the gateway config to adjust tool profiles.
              </div>
            `}
      ${o?l`
              <div class="callout info" style="margin-top: 12px">
                This agent is using an explicit allowlist in config. Tool overrides are managed in the Config tab.
              </div>
            `:m}
      ${r?l`
              <div class="callout info" style="margin-top: 12px">
                Global tools.allow is set. Agent overrides cannot enable tools that are globally blocked.
              </div>
            `:m}

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
              `:m}
      </div>

      <div class="agent-tools-presets" style="margin-top: 16px;">
        <div class="label">Quick Presets</div>
        <div class="agent-tools-buttons">
          ${Nf.map(S=>l`
              <button
                class="btn btn--sm ${i===S.id?"active":""}"
                ?disabled=${!c}
                @click=${()=>e.onProfileChange(e.agentId,S.id,!0)}
              >
                ${S.label}
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
        ${Bo.map(S=>l`
              <div class="agent-tools-section">
                <div class="agent-tools-header">${S.label}</div>
                <div class="agent-tools-list">
                  ${S.tools.map(C=>{const{allowed:k}=u(C.id);return l`
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
                            @change=${A=>v(C.id,A.target.checked)}
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
  `}function ih(e){const t=!!e.configForm&&!e.configLoading&&!e.configSaving,n=Is(e.configForm,e.agentId),s=Array.isArray(n.entry?.skills)?n.entry?.skills:void 0,i=new Set((s??[]).map(u=>u.trim()).filter(Boolean)),a=s!==void 0,o=!!(e.report&&e.activeAgentId===e.agentId),r=o?e.report?.skills??[]:[],c=e.filter.trim().toLowerCase(),d=c?r.filter(u=>[u.name,u.description,u.source].join(" ").toLowerCase().includes(c)):r,g=Wl(d),p=a?r.filter(u=>i.has(u.name)).length:r.length,h=r.length;return l`
    <section class="card">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">Skills</div>
          <div class="card-sub">
            Per-agent skill allowlist and workspace skills.
            ${h>0?l`<span class="mono">${p}/${h}</span>`:m}
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

      ${e.configForm?m:l`
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
            `:m}
      ${e.error?l`<div class="callout danger" style="margin-top: 12px;">${e.error}</div>`:m}

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
                ${g.map(u=>ah(u,{agentId:e.agentId,allowSet:i,usingAllowlist:a,editable:t,onToggle:e.onToggle}))}
              </div>
            `}
    </section>
  `}function ah(e,t){const n=e.id==="workspace"||e.id==="built-in";return l`
    <details class="agent-skills-group" ?open=${!n}>
      <summary class="agent-skills-header">
        <span>${e.label}</span>
        <span class="muted">${e.skills.length}</span>
      </summary>
      <div class="list skills-grid">
        ${e.skills.map(s=>oh(s,{agentId:t.agentId,allowSet:t.allowSet,usingAllowlist:t.usingAllowlist,editable:t.editable,onToggle:t.onToggle}))}
      </div>
    </details>
  `}function oh(e,t){const n=t.usingAllowlist?t.allowSet.has(e.name):!0,s=ql(e),i=Vl(e);return l`
    <div class="list-item agent-skill-row">
      <div class="list-main">
        <div class="list-title">${e.emoji?`${e.emoji} `:""}${e.name}</div>
        <div class="list-sub">${e.description}</div>
        ${Gl({skill:e})}
        ${s.length>0?l`<div class="muted" style="margin-top: 6px;">Missing: ${s.join(", ")}</div>`:m}
        ${i.length>0?l`<div class="muted" style="margin-top: 6px;">Reason: ${i.join(", ")}</div>`:m}
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
  `}function rh(e){const t=e.agentsList?.agents??[],n=e.agentsList?.defaultId??null,s=e.selectedAgentId??n??t[0]?.id??null,i=s?t.find(a=>a.id===s)??null:null;return l`
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
        ${e.error?l`<div class="callout danger" style="margin-top: 12px;">${e.error}</div>`:m}
        <div class="agent-list" style="margin-top: 12px;">
          ${t.length===0?l`
                  <div class="muted">No agents found.</div>
                `:t.map(a=>{const o=jl(a.id,n),r=Ms(a,e.agentIdentityById[a.id]??null);return l`
                    <button
                      type="button"
                      class="agent-row ${s===a.id?"active":""}"
                      @click=${()=>e.onSelectAgent(a.id)}
                    >
                      <div class="agent-avatar">${r||Ti(a).slice(0,1)}</div>
                      <div class="agent-info">
                        <div class="agent-title">${Ti(a)}</div>
                        <div class="agent-sub mono">${a.id}</div>
                      </div>
                      ${o?l`<span class="agent-pill">${o}</span>`:m}
                    </button>
                  `})}
        </div>
      </section>
      <section class="agents-main">
        ${i?l`
                ${lh(i,n,e.agentIdentityById[i.id]??null)}
                ${ch(e.activePanel,a=>e.onSelectPanel(a))}
                ${e.activePanel==="overview"?dh({agent:i,defaultId:n,configForm:e.configForm,agentFilesList:e.agentFilesList,agentIdentity:e.agentIdentityById[i.id]??null,agentIdentityError:e.agentIdentityError,agentIdentityLoading:e.agentIdentityLoading,configLoading:e.configLoading,configSaving:e.configSaving,configDirty:e.configDirty,onConfigReload:e.onConfigReload,onConfigSave:e.onConfigSave,onModelChange:e.onModelChange,onModelFallbacksChange:e.onModelFallbacksChange}):m}
                ${e.activePanel==="files"?th({agentId:i.id,agentFilesList:e.agentFilesList,agentFilesLoading:e.agentFilesLoading,agentFilesError:e.agentFilesError,agentFileActive:e.agentFileActive,agentFileContents:e.agentFileContents,agentFileDrafts:e.agentFileDrafts,agentFileSaving:e.agentFileSaving,onLoadFiles:e.onLoadFiles,onSelectFile:e.onSelectFile,onFileDraftChange:e.onFileDraftChange,onFileReset:e.onFileReset,onFileSave:e.onFileSave}):m}
                ${e.activePanel==="tools"?sh({agentId:i.id,configForm:e.configForm,configLoading:e.configLoading,configSaving:e.configSaving,configDirty:e.configDirty,onProfileChange:e.onToolsProfileChange,onOverridesChange:e.onToolsOverridesChange,onConfigReload:e.onConfigReload,onConfigSave:e.onConfigSave}):m}
                ${e.activePanel==="skills"?ih({agentId:i.id,report:e.agentSkillsReport,loading:e.agentSkillsLoading,error:e.agentSkillsError,activeAgentId:e.agentSkillsAgentId,configForm:e.configForm,configLoading:e.configLoading,configSaving:e.configSaving,configDirty:e.configDirty,filter:e.skillsFilter,onFilterChange:e.onSkillsFilterChange,onRefresh:e.onSkillsRefresh,onToggle:e.onAgentSkillToggle,onClear:e.onAgentSkillsClear,onDisableAll:e.onAgentSkillsDisableAll,onConfigReload:e.onConfigReload,onConfigSave:e.onConfigSave}):m}
                ${e.activePanel==="channels"?Jf({context:zo(i,e.configForm,e.agentFilesList,n,e.agentIdentityById[i.id]??null),configForm:e.configForm,snapshot:e.channelsSnapshot,loading:e.channelsLoading,error:e.channelsError,lastSuccess:e.channelsLastSuccess,onRefresh:e.onChannelsRefresh}):m}
                ${e.activePanel==="cron"?eh({context:zo(i,e.configForm,e.agentFilesList,n,e.agentIdentityById[i.id]??null),agentId:i.id,jobs:e.cronJobs,status:e.cronStatus,loading:e.cronLoading,error:e.cronError,onRefresh:e.onCronRefresh}):m}
              `:l`
                <div class="card">
                  <div class="card-title">Select an agent</div>
                  <div class="card-sub">Pick an agent to inspect its workspace and tools.</div>
                </div>
              `}
      </section>
    </div>
  `}function lh(e,t,n){const s=jl(e.id,t),i=Ti(e),a=e.identity?.theme?.trim()||"Agent workspace and routing.",o=Ms(e,n);return l`
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
        ${s?l`<span class="agent-pill">${s}</span>`:m}
      </div>
    </section>
  `}function ch(e,t){return l`
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
  `}function dh(e){const{agent:t,configForm:n,agentFilesList:s,agentIdentity:i,agentIdentityLoading:a,agentIdentityError:o,configLoading:r,configSaving:c,configDirty:d,onConfigReload:g,onConfigSave:p,onModelChange:h,onModelFallbacksChange:u}=e,f=Is(n,t.id),$=(s&&s.agentId===t.id?s.workspace:null)||f.entry?.workspace||f.defaults?.workspace||"default",S=f.entry?.model?xn(f.entry?.model):xn(f.defaults?.model),C=xn(f.defaults?.model),k=Ho(f.entry?.model)||(S!=="-"?Uo(S):null),A=Ho(f.defaults?.model)||(C!=="-"?Uo(C):null),E=k??A??null,T=Bf(f.entry?.model),I=T?T.join(", "):"",H=i?.name?.trim()||t.identity?.name?.trim()||t.name?.trim()||f.entry?.name||"-",te=Ms(t,i)||"-",R=Array.isArray(f.entry?.skills)?f.entry?.skills:null,q=R?.length??null,ne=a?"Loading…":o?"Unavailable":"",oe=!!(e.defaultId&&t.id===e.defaultId);return l`
    <section class="card">
      <div class="card-title">Overview</div>
      <div class="card-sub">Workspace paths and identity metadata.</div>
      <div class="agents-overview-grid" style="margin-top: 16px;">
        <div class="agent-kv">
          <div class="label">Workspace</div>
          <div class="mono">${$}</div>
        </div>
        <div class="agent-kv">
          <div class="label">Primary Model</div>
          <div class="mono">${S}</div>
        </div>
        <div class="agent-kv">
          <div class="label">Identity Name</div>
          <div>${H}</div>
          ${ne?l`<div class="agent-kv-sub muted">${ne}</div>`:m}
        </div>
        <div class="agent-kv">
          <div class="label">Default</div>
          <div>${oe?"yes":"no"}</div>
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
            <span>Primary model${oe?" (default)":""}</span>
            <select
              .value=${E??""}
              ?disabled=${!n||r||c}
              @change=${_=>h(t.id,_.target.value||null)}
            >
              ${oe?m:l`
                      <option value="">
                        ${A?`Inherit default (${A})`:"Inherit default"}
                      </option>
                    `}
              ${Hf(n,E??void 0)}
            </select>
          </label>
          <label class="field" style="min-width: 260px; flex: 1;">
            <span>Fallbacks (comma-separated)</span>
            <input
              .value=${I}
              ?disabled=${!n||r||c}
              placeholder="provider/model, provider/model"
              @input=${_=>u(t.id,zf(_.target.value))}
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
  `}const uh=new Set(["title","description","default","nullable"]);function gh(e){return Object.keys(e??{}).filter(n=>!uh.has(n)).length===0}function ph(e){if(e===void 0)return"";try{return JSON.stringify(e,null,2)??""}catch{return""}}const Mn={chevronDown:l`
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
  `};function vt(e){const{schema:t,value:n,path:s,hints:i,unsupported:a,disabled:o,onPatch:r}=e,c=e.showLabel??!0,d=Ee(t),g=Ie(s,i),p=g?.label??t.title??tt(String(s.at(-1))),h=g?.help??t.description,u=Vi(s);if(a.has(u))return l`<div class="cfg-field cfg-field--error">
      <div class="cfg-field__label">${p}</div>
      <div class="cfg-field__error">Unsupported schema node. Use Raw mode.</div>
    </div>`;if(t.anyOf||t.oneOf){const v=(t.anyOf??t.oneOf??[]).filter(E=>!(E.type==="null"||Array.isArray(E.type)&&E.type.includes("null")));if(v.length===1)return vt({...e,schema:v[0]});const $=E=>{if(E.const!==void 0)return E.const;if(E.enum&&E.enum.length===1)return E.enum[0]},S=v.map($),C=S.every(E=>E!==void 0);if(C&&S.length>0&&S.length<=5){const E=n??t.default;return l`
        <div class="cfg-field">
          ${c?l`<label class="cfg-field__label">${p}</label>`:m}
          ${h?l`<div class="cfg-field__help">${h}</div>`:m}
          <div class="cfg-segmented">
            ${S.map(T=>l`
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
      `}if(C&&S.length>5)return Wo({...e,options:S,value:n??t.default});const k=new Set(v.map(E=>Ee(E)).filter(Boolean)),A=new Set([...k].map(E=>E==="integer"?"number":E));if([...A].every(E=>["string","number","boolean"].includes(E))){const E=A.has("string"),T=A.has("number");if(A.has("boolean")&&A.size===1)return vt({...e,schema:{...t,type:"boolean",anyOf:void 0,oneOf:void 0}});if(E||T)return Ko({...e,inputType:T&&!E?"number":"text"})}}if(t.enum){const f=t.enum;if(f.length<=5){const v=n??t.default;return l`
        <div class="cfg-field">
          ${c?l`<label class="cfg-field__label">${p}</label>`:m}
          ${h?l`<div class="cfg-field__help">${h}</div>`:m}
          <div class="cfg-segmented">
            ${f.map($=>l`
              <button
                type="button"
                class="cfg-segmented__btn ${$===v||String($)===String(v)?"active":""}"
                ?disabled=${o}
                @click=${()=>r(s,$)}
              >
                ${String($)}
              </button>
            `)}
          </div>
        </div>
      `}return Wo({...e,options:f,value:n??t.default})}if(d==="object")return hh(e);if(d==="array")return vh(e);if(d==="boolean"){const f=typeof n=="boolean"?n:typeof t.default=="boolean"?t.default:!1;return l`
      <label class="cfg-toggle-row ${o?"disabled":""}">
        <div class="cfg-toggle-row__content">
          <span class="cfg-toggle-row__label">${p}</span>
          ${h?l`<span class="cfg-toggle-row__help">${h}</span>`:m}
        </div>
        <div class="cfg-toggle">
          <input
            type="checkbox"
            .checked=${f}
            ?disabled=${o}
            @change=${v=>r(s,v.target.checked)}
          />
          <span class="cfg-toggle__track"></span>
        </div>
      </label>
    `}return d==="number"||d==="integer"?fh(e):d==="string"?Ko({...e,inputType:"text"}):l`
    <div class="cfg-field cfg-field--error">
      <div class="cfg-field__label">${p}</div>
      <div class="cfg-field__error">Unsupported type: ${d}. Use Raw mode.</div>
    </div>
  `}function Ko(e){const{schema:t,value:n,path:s,hints:i,disabled:a,onPatch:o,inputType:r}=e,c=e.showLabel??!0,d=Ie(s,i),g=d?.label??t.title??tt(String(s.at(-1))),p=d?.help??t.description,h=(d?.sensitive??!1)&&!/^\$\{[^}]*\}$/.test(String(n??"").trim()),u=d?.placeholder??(h?"••••":t.default!==void 0?`Default: ${String(t.default)}`:""),f=n??"";return l`
    <div class="cfg-field">
      ${c?l`<label class="cfg-field__label">${g}</label>`:m}
      ${p?l`<div class="cfg-field__help">${p}</div>`:m}
      <div class="cfg-input-wrap">
        <input
          type=${h?"password":r}
          class="cfg-input"
          placeholder=${u}
          .value=${f==null?"":String(f)}
          ?disabled=${a}
          @input=${v=>{const $=v.target.value;if(r==="number"){if($.trim()===""){o(s,void 0);return}const S=Number($);o(s,Number.isNaN(S)?$:S);return}o(s,$)}}
          @change=${v=>{if(r==="number")return;const $=v.target.value;o(s,$.trim())}}
        />
        ${t.default!==void 0?l`
          <button
            type="button"
            class="cfg-input__reset"
            title="Reset to default"
            ?disabled=${a}
            @click=${()=>o(s,t.default)}
          >↺</button>
        `:m}
      </div>
    </div>
  `}function fh(e){const{schema:t,value:n,path:s,hints:i,disabled:a,onPatch:o}=e,r=e.showLabel??!0,c=Ie(s,i),d=c?.label??t.title??tt(String(s.at(-1))),g=c?.help??t.description,p=n??t.default??"",h=typeof p=="number"?p:0;return l`
    <div class="cfg-field">
      ${r?l`<label class="cfg-field__label">${d}</label>`:m}
      ${g?l`<div class="cfg-field__help">${g}</div>`:m}
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
          @input=${u=>{const f=u.target.value,v=f===""?void 0:Number(f);o(s,v)}}
        />
        <button
          type="button"
          class="cfg-number__btn"
          ?disabled=${a}
          @click=${()=>o(s,h+1)}
        >+</button>
      </div>
    </div>
  `}function Wo(e){const{schema:t,value:n,path:s,hints:i,disabled:a,options:o,onPatch:r}=e,c=e.showLabel??!0,d=Ie(s,i),g=d?.label??t.title??tt(String(s.at(-1))),p=d?.help??t.description,h=n??t.default,u=o.findIndex(v=>v===h||String(v)===String(h)),f="__unset__";return l`
    <div class="cfg-field">
      ${c?l`<label class="cfg-field__label">${g}</label>`:m}
      ${p?l`<div class="cfg-field__help">${p}</div>`:m}
      <select
        class="cfg-select"
        ?disabled=${a}
        .value=${u>=0?String(u):f}
        @change=${v=>{const $=v.target.value;r(s,$===f?void 0:o[Number($)])}}
      >
        <option value=${f}>Select...</option>
        ${o.map((v,$)=>l`
          <option value=${String($)}>${String(v)}</option>
        `)}
      </select>
    </div>
  `}function hh(e){const{schema:t,value:n,path:s,hints:i,unsupported:a,disabled:o,onPatch:r}=e,c=Ie(s,i),d=c?.label??t.title??tt(String(s.at(-1))),g=c?.help??t.description,p=n??t.default,h=p&&typeof p=="object"&&!Array.isArray(p)?p:{},u=t.properties??{},v=Object.entries(u).toSorted((A,E)=>{const T=Ie([...s,A[0]],i)?.order??0,I=Ie([...s,E[0]],i)?.order??0;return T!==I?T-I:A[0].localeCompare(E[0])}),$=new Set(Object.keys(u)),S=t.additionalProperties,C=!!S&&typeof S=="object",k=l`
    ${v.map(([A,E])=>vt({schema:E,value:h[A],path:[...s,A],hints:i,unsupported:a,disabled:o,onPatch:r}))}
    ${C?mh({schema:S,value:h,path:s,hints:i,unsupported:a,disabled:o,reservedKeys:$,onPatch:r}):m}
  `;return s.length===1?l`
      <div class="cfg-fields">
        ${k}
      </div>
    `:l`
    <details class="cfg-object" open>
      <summary class="cfg-object__header">
        <span class="cfg-object__title">${d}</span>
        <span class="cfg-object__chevron">${Mn.chevronDown}</span>
      </summary>
      ${g?l`<div class="cfg-object__help">${g}</div>`:m}
      <div class="cfg-object__content">
        ${k}
      </div>
    </details>
  `}function vh(e){const{schema:t,value:n,path:s,hints:i,unsupported:a,disabled:o,onPatch:r}=e,c=e.showLabel??!0,d=Ie(s,i),g=d?.label??t.title??tt(String(s.at(-1))),p=d?.help??t.description,h=Array.isArray(t.items)?t.items[0]:t.items;if(!h)return l`
      <div class="cfg-field cfg-field--error">
        <div class="cfg-field__label">${g}</div>
        <div class="cfg-field__error">Unsupported array schema. Use Raw mode.</div>
      </div>
    `;const u=Array.isArray(n)?n:Array.isArray(t.default)?t.default:[];return l`
    <div class="cfg-array">
      <div class="cfg-array__header">
        ${c?l`<span class="cfg-array__label">${g}</span>`:m}
        <span class="cfg-array__count">${u.length} item${u.length!==1?"s":""}</span>
        <button
          type="button"
          class="cfg-array__add"
          ?disabled=${o}
          @click=${()=>{const f=[...u,Nr(h)];r(s,f)}}
        >
          <span class="cfg-array__add-icon">${Mn.plus}</span>
          Add
        </button>
      </div>
      ${p?l`<div class="cfg-array__help">${p}</div>`:m}

      ${u.length===0?l`
              <div class="cfg-array__empty">No items yet. Click "Add" to create one.</div>
            `:l`
        <div class="cfg-array__items">
          ${u.map((f,v)=>l`
            <div class="cfg-array__item">
              <div class="cfg-array__item-header">
                <span class="cfg-array__item-index">#${v+1}</span>
                <button
                  type="button"
                  class="cfg-array__item-remove"
                  title="Remove item"
                  ?disabled=${o}
                  @click=${()=>{const $=[...u];$.splice(v,1),r(s,$)}}
                >
                  ${Mn.trash}
                </button>
              </div>
              <div class="cfg-array__item-content">
                ${vt({schema:h,value:f,path:[...s,v],hints:i,unsupported:a,disabled:o,showLabel:!1,onPatch:r})}
              </div>
            </div>
          `)}
        </div>
      `}
    </div>
  `}function mh(e){const{schema:t,value:n,path:s,hints:i,unsupported:a,disabled:o,reservedKeys:r,onPatch:c}=e,d=gh(t),g=Object.entries(n??{}).filter(([p])=>!r.has(p));return l`
    <div class="cfg-map">
      <div class="cfg-map__header">
        <span class="cfg-map__label">Custom entries</span>
        <button
          type="button"
          class="cfg-map__add"
          ?disabled=${o}
          @click=${()=>{const p={...n};let h=1,u=`custom-${h}`;for(;u in p;)h+=1,u=`custom-${h}`;p[u]=d?{}:Nr(t),c(s,p)}}
        >
          <span class="cfg-map__add-icon">${Mn.plus}</span>
          Add Entry
        </button>
      </div>

      ${g.length===0?l`
              <div class="cfg-map__empty">No custom entries.</div>
            `:l`
        <div class="cfg-map__items">
          ${g.map(([p,h])=>{const u=[...s,p],f=ph(h);return l`
              <div class="cfg-map__item">
                <div class="cfg-map__item-key">
                  <input
                    type="text"
                    class="cfg-input cfg-input--sm"
                    placeholder="Key"
                    .value=${p}
                    ?disabled=${o}
                    @change=${v=>{const $=v.target.value.trim();if(!$||$===p)return;const S={...n};$ in S||(S[$]=S[p],delete S[p],c(s,S))}}
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
                          @change=${v=>{const $=v.target,S=$.value.trim();if(!S){c(u,void 0);return}try{c(u,JSON.parse(S))}catch{$.value=f}}}
                        ></textarea>
                      `:vt({schema:t,value:h,path:u,hints:i,unsupported:a,disabled:o,showLabel:!1,onPatch:c})}
                </div>
                <button
                  type="button"
                  class="cfg-map__item-remove"
                  title="Remove entry"
                  ?disabled=${o}
                  @click=${()=>{const v={...n};delete v[p],c(s,v)}}
                >
                  ${Mn.trash}
                </button>
              </div>
            `})}
        </div>
      `}
    </div>
  `}const qo={env:l`
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
  `},$a={env:{label:"Environment Variables",description:"Environment variables passed to the gateway process"},update:{label:"Updates",description:"Auto-update settings and release channel"},agents:{label:"Agents",description:"Agent configurations, models, and identities"},auth:{label:"Authentication",description:"API keys and authentication profiles"},channels:{label:"Channels",description:"Messaging channels (Telegram, Discord, Slack, etc.)"},messages:{label:"Messages",description:"Message handling and routing settings"},commands:{label:"Commands",description:"Custom slash commands"},hooks:{label:"Hooks",description:"Webhooks and event hooks"},skills:{label:"Skills",description:"Skill packs and capabilities"},tools:{label:"Tools",description:"Tool configurations (browser, search, etc.)"},gateway:{label:"Gateway",description:"Gateway server settings (port, auth, binding)"},wizard:{label:"Setup Wizard",description:"Setup wizard state and history"},meta:{label:"Metadata",description:"Gateway metadata and version information"},logging:{label:"Logging",description:"Log levels and output configuration"},browser:{label:"Browser",description:"Browser automation settings"},ui:{label:"UI",description:"User interface preferences"},models:{label:"Models",description:"AI model configurations and providers"},bindings:{label:"Bindings",description:"Key bindings and shortcuts"},broadcast:{label:"Broadcast",description:"Broadcast and notification settings"},audio:{label:"Audio",description:"Audio input/output settings"},session:{label:"Session",description:"Session management and persistence"},cron:{label:"Cron",description:"Scheduled tasks and automation"},web:{label:"Web",description:"Web server and API settings"},discovery:{label:"Discovery",description:"Service discovery and networking"},canvasHost:{label:"Canvas Host",description:"Canvas rendering and display"},talk:{label:"Talk",description:"Voice and speech settings"},plugins:{label:"Plugins",description:"Plugin management and extensions"}};function Vo(e){return qo[e]??qo.default}function bh(e,t,n){if(!n)return!0;const s=n.toLowerCase(),i=$a[e];return e.toLowerCase().includes(s)||i&&(i.label.toLowerCase().includes(s)||i.description.toLowerCase().includes(s))?!0:vn(t,s)}function vn(e,t){if(e.title?.toLowerCase().includes(t)||e.description?.toLowerCase().includes(t)||e.enum?.some(s=>String(s).toLowerCase().includes(t)))return!0;if(e.properties){for(const[s,i]of Object.entries(e.properties))if(s.toLowerCase().includes(t)||vn(i,t))return!0}if(e.items){const s=Array.isArray(e.items)?e.items:[e.items];for(const i of s)if(i&&vn(i,t))return!0}if(e.additionalProperties&&typeof e.additionalProperties=="object"&&vn(e.additionalProperties,t))return!0;const n=e.anyOf??e.oneOf??e.allOf;if(n){for(const s of n)if(s&&vn(s,t))return!0}return!1}function yh(e){if(!e.schema)return l`
      <div class="muted">Schema unavailable.</div>
    `;const t=e.schema,n=e.value??{};if(Ee(t)!=="object"||!t.properties)return l`
      <div class="callout danger">Unsupported schema. Use Raw.</div>
    `;const s=new Set(e.unsupportedPaths??[]),i=t.properties,a=e.searchQuery??"",o=e.activeSection,r=e.activeSubsection??null,d=Object.entries(i).toSorted((p,h)=>{const u=Ie([p[0]],e.uiHints)?.order??50,f=Ie([h[0]],e.uiHints)?.order??50;return u!==f?u-f:p[0].localeCompare(h[0])}).filter(([p,h])=>!(o&&p!==o||a&&!bh(p,h,a)));let g=null;if(o&&r&&d.length===1){const p=d[0]?.[1];p&&Ee(p)==="object"&&p.properties&&p.properties[r]&&(g={sectionKey:o,subsectionKey:r,schema:p.properties[r]})}return d.length===0?l`
      <div class="config-empty">
        <div class="config-empty__icon">${me.search}</div>
        <div class="config-empty__text">
          ${a?`No settings match "${a}"`:"No settings in this section"}
        </div>
      </div>
    `:l`
    <div class="config-form config-form--modern">
      ${g?(()=>{const{sectionKey:p,subsectionKey:h,schema:u}=g,f=Ie([p,h],e.uiHints),v=f?.label??u.title??tt(h),$=f?.help??u.description??"",S=n[p],C=S&&typeof S=="object"?S[h]:void 0,k=`config-section-${p}-${h}`;return l`
              <section class="config-section-card" id=${k}>
                <div class="config-section-card__header">
                  <span class="config-section-card__icon">${Vo(p)}</span>
                  <div class="config-section-card__titles">
                    <h3 class="config-section-card__title">${v}</h3>
                    ${$?l`<p class="config-section-card__desc">${$}</p>`:m}
                  </div>
                </div>
                <div class="config-section-card__content">
                  ${vt({schema:u,value:C,path:[p,h],hints:e.uiHints,unsupported:s,disabled:e.disabled??!1,showLabel:!1,onPatch:e.onPatch})}
                </div>
              </section>
            `})():d.map(([p,h])=>{const u=$a[p]??{label:p.charAt(0).toUpperCase()+p.slice(1),description:h.description??""};return l`
              <section class="config-section-card" id="config-section-${p}">
                <div class="config-section-card__header">
                  <span class="config-section-card__icon">${Vo(p)}</span>
                  <div class="config-section-card__titles">
                    <h3 class="config-section-card__title">${u.label}</h3>
                    ${u.description?l`<p class="config-section-card__desc">${u.description}</p>`:m}
                  </div>
                </div>
                <div class="config-section-card__content">
                  ${vt({schema:h,value:n[p],path:[p],hints:e.uiHints,unsupported:s,disabled:e.disabled??!1,showLabel:!1,onPatch:e.onPatch})}
                </div>
              </section>
            `})}
    </div>
  `}const xh=new Set(["title","description","default","nullable"]);function $h(e){return Object.keys(e??{}).filter(n=>!xh.has(n)).length===0}function Ql(e){const t=e.filter(i=>i!=null),n=t.length!==e.length,s=[];for(const i of t)s.some(a=>Object.is(a,i))||s.push(i);return{enumValues:s,nullable:n}}function Yl(e){return!e||typeof e!="object"?{schema:null,unsupportedPaths:["<root>"]}:wn(e,[])}function wn(e,t){const n=new Set,s={...e},i=Vi(t)||"<root>";if(e.anyOf||e.oneOf||e.allOf){const r=wh(e,t);return r||{schema:e,unsupportedPaths:[i]}}const a=Array.isArray(e.type)&&e.type.includes("null"),o=Ee(e)??(e.properties||e.additionalProperties?"object":void 0);if(s.type=o??e.type,s.nullable=a||e.nullable,s.enum){const{enumValues:r,nullable:c}=Ql(s.enum);s.enum=r,c&&(s.nullable=!0),r.length===0&&n.add(i)}if(o==="object"){const r=e.properties??{},c={};for(const[d,g]of Object.entries(r)){const p=wn(g,[...t,d]);p.schema&&(c[d]=p.schema);for(const h of p.unsupportedPaths)n.add(h)}if(s.properties=c,e.additionalProperties===!0)n.add(i);else if(e.additionalProperties===!1)s.additionalProperties=!1;else if(e.additionalProperties&&typeof e.additionalProperties=="object"&&!$h(e.additionalProperties)){const d=wn(e.additionalProperties,[...t,"*"]);s.additionalProperties=d.schema??e.additionalProperties,d.unsupportedPaths.length>0&&n.add(i)}}else if(o==="array"){const r=Array.isArray(e.items)?e.items[0]:e.items;if(!r)n.add(i);else{const c=wn(r,[...t,"*"]);s.items=c.schema??r,c.unsupportedPaths.length>0&&n.add(i)}}else o!=="string"&&o!=="number"&&o!=="integer"&&o!=="boolean"&&!s.enum&&n.add(i);return{schema:s,unsupportedPaths:Array.from(n)}}function wh(e,t){if(e.allOf)return null;const n=e.anyOf??e.oneOf;if(!n)return null;const s=[],i=[];let a=!1;for(const r of n){if(!r||typeof r!="object")return null;if(Array.isArray(r.enum)){const{enumValues:c,nullable:d}=Ql(r.enum);s.push(...c),d&&(a=!0);continue}if("const"in r){if(r.const==null){a=!0;continue}s.push(r.const);continue}if(Ee(r)==="null"){a=!0;continue}i.push(r)}if(s.length>0&&i.length===0){const r=[];for(const c of s)r.some(d=>Object.is(d,c))||r.push(c);return{schema:{...e,enum:r,nullable:a,anyOf:void 0,oneOf:void 0,allOf:void 0},unsupportedPaths:[]}}if(i.length===1){const r=wn(i[0],t);return r.schema&&(r.schema.nullable=a||r.schema.nullable),r}const o=new Set(["string","number","integer","boolean"]);return i.length>0&&s.length===0&&i.every(r=>r.type&&o.has(String(r.type)))?{schema:{...e,nullable:a},unsupportedPaths:[]}:null}function kh(e,t){let n=e;for(const s of t){if(!n)return null;const i=Ee(n);if(i==="object"){const a=n.properties??{};if(typeof s=="string"&&a[s]){n=a[s];continue}const o=n.additionalProperties;if(typeof s=="string"&&o&&typeof o=="object"){n=o;continue}return null}if(i==="array"){if(typeof s!="number")return null;n=(Array.isArray(n.items)?n.items[0]:n.items)??null;continue}return null}return n}function Sh(e,t){const s=(e.channels??{})[t],i=e[t];return(s&&typeof s=="object"?s:null)??(i&&typeof i=="object"?i:null)??{}}const Ah=["groupPolicy","streamMode","dmPolicy"];function Ch(e){if(e==null)return"n/a";if(typeof e=="string"||typeof e=="number"||typeof e=="boolean")return String(e);try{return JSON.stringify(e)}catch{return"n/a"}}function Th(e){const t=Ah.flatMap(n=>n in e?[[n,e[n]]]:[]);return t.length===0?null:l`
    <div class="status-list" style="margin-top: 12px;">
      ${t.map(([n,s])=>l`
          <div>
            <span class="label">${n}</span>
            <span>${Ch(s)}</span>
          </div>
        `)}
    </div>
  `}function _h(e){const t=Yl(e.schema),n=t.schema;if(!n)return l`
      <div class="callout danger">Schema unavailable. Use Raw.</div>
    `;const s=kh(n,["channels",e.channelId]);if(!s)return l`
      <div class="callout danger">Channel config schema unavailable.</div>
    `;const i=e.configValue??{},a=Sh(i,e.channelId);return l`
    <div class="config-form">
      ${vt({schema:s,value:a,path:["channels",e.channelId],hints:e.uiHints,unsupported:new Set(t.unsupportedPaths),disabled:e.disabled,showLabel:!1,onPatch:e.onPatch})}
    </div>
    ${Th(a)}
  `}function nt(e){const{channelId:t,props:n}=e,s=n.configSaving||n.configSchemaLoading;return l`
    <div style="margin-top: 16px;">
      ${n.configSchemaLoading?l`
              <div class="muted">Loading config schema…</div>
            `:_h({channelId:t,configValue:n.configForm,schema:n.configSchema,uiHints:n.configUiHints,disabled:s,onPatch:n.onConfigPatch})}
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
  `}function Eh(e){const{props:t,discord:n,accountCountLabel:s}=e;return l`
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
          </div>`:m}

      ${n?.probe?l`<div class="callout" style="margin-top: 12px;">
            Probe ${n.probe.ok?"ok":"failed"} ·
            ${n.probe.status??""} ${n.probe.error??""}
          </div>`:m}

      ${nt({channelId:"discord",props:t})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>t.onRefresh(!0)}>
          Probe
        </button>
      </div>
    </div>
  `}function Lh(e){const{props:t,googleChat:n,accountCountLabel:s}=e;return l`
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
          </div>`:m}

      ${n?.probe?l`<div class="callout" style="margin-top: 12px;">
            Probe ${n.probe.ok?"ok":"failed"} ·
            ${n.probe.status??""} ${n.probe.error??""}
          </div>`:m}

      ${nt({channelId:"googlechat",props:t})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>t.onRefresh(!0)}>
          Probe
        </button>
      </div>
    </div>
  `}function Mh(e){const{props:t,imessage:n,accountCountLabel:s}=e;return l`
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
          </div>`:m}

      ${n?.probe?l`<div class="callout" style="margin-top: 12px;">
            Probe ${n.probe.ok?"ok":"failed"} ·
            ${n.probe.error??""}
          </div>`:m}

      ${nt({channelId:"imessage",props:t})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>t.onRefresh(!0)}>
          Probe
        </button>
      </div>
    </div>
  `}function Go(e){return e?e.length<=20?e:`${e.slice(0,8)}...${e.slice(-8)}`:"n/a"}function Ih(e){const{props:t,nostr:n,nostrAccounts:s,accountCountLabel:i,profileFormState:a,profileFormCallbacks:o,onEditProfile:r}=e,c=s[0],d=n?.configured??c?.configured??!1,g=n?.running??c?.running??!1,p=n?.publicKey??c?.publicKey,h=n?.lastStartAt??c?.lastStartAt??null,u=n?.lastError??c?.lastError??null,f=s.length>1,v=a!=null,$=C=>{const k=C.publicKey,A=C.profile,E=A?.displayName??A?.name??C.name??C.accountId;return l`
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
            <span class="monospace" title="${k??""}">${Go(k)}</span>
          </div>
          <div>
            <span class="label">Last inbound</span>
            <span>${C.lastInboundAt?ee(C.lastInboundAt):"n/a"}</span>
          </div>
          ${C.lastError?l`
                <div class="account-card-error">${C.lastError}</div>
              `:m}
        </div>
      </div>
    `},S=()=>{if(v&&o)return xd({state:a,callbacks:o,accountId:s[0]?.accountId??"default"});const C=c?.profile??n?.profile,{name:k,displayName:A,about:E,picture:T,nip05:I}=C??{},H=k||A||E||T||I;return l`
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
              `:m}
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
                    `:m}
                ${k?l`<div><span class="label">Name</span><span>${k}</span></div>`:m}
                ${A?l`<div><span class="label">Display Name</span><span>${A}</span></div>`:m}
                ${E?l`<div><span class="label">About</span><span style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">${E}</span></div>`:m}
                ${I?l`<div><span class="label">NIP-05</span><span>${I}</span></div>`:m}
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
              ${s.map(C=>$(C))}
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
                  >${Go(p)}</span
                >
              </div>
              <div>
                <span class="label">Last start</span>
                <span>${h?ee(h):"n/a"}</span>
              </div>
            </div>
          `}

      ${u?l`<div class="callout danger" style="margin-top: 12px;">${u}</div>`:m}

      ${S()}

      ${nt({channelId:"nostr",props:t})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>t.onRefresh(!1)}>Refresh</button>
      </div>
    </div>
  `}function Rh(e,t){const n=t.snapshot,s=n?.channels;if(!n||!s)return!1;const i=s[e],a=typeof i?.configured=="boolean"&&i.configured,o=typeof i?.running=="boolean"&&i.running,r=typeof i?.connected=="boolean"&&i.connected,d=(n.channelAccounts?.[e]??[]).some(g=>g.configured||g.running||g.connected);return a||o||r||d}function Ph(e,t){return t?.[e]?.length??0}function Zl(e,t){const n=Ph(e,t);return n<2?m:l`<div class="account-count">Accounts (${n})</div>`}function Dh(e){const{props:t,signal:n,accountCountLabel:s}=e;return l`
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
          </div>`:m}

      ${n?.probe?l`<div class="callout" style="margin-top: 12px;">
            Probe ${n.probe.ok?"ok":"failed"} ·
            ${n.probe.status??""} ${n.probe.error??""}
          </div>`:m}

      ${nt({channelId:"signal",props:t})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>t.onRefresh(!0)}>
          Probe
        </button>
      </div>
    </div>
  `}function Fh(e){const{props:t,slack:n,accountCountLabel:s}=e;return l`
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
          </div>`:m}

      ${n?.probe?l`<div class="callout" style="margin-top: 12px;">
            Probe ${n.probe.ok?"ok":"failed"} ·
            ${n.probe.status??""} ${n.probe.error??""}
          </div>`:m}

      ${nt({channelId:"slack",props:t})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>t.onRefresh(!0)}>
          Probe
        </button>
      </div>
    </div>
  `}function Nh(e){const{props:t,telegram:n,telegramAccounts:s,accountCountLabel:i}=e,a=s.length>1,o=r=>{const d=r.probe?.bot?.username,g=r.name||r.accountId;return l`
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
              `:m}
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
          </div>`:m}

      ${n?.probe?l`<div class="callout" style="margin-top: 12px;">
            Probe ${n.probe.ok?"ok":"failed"} ·
            ${n.probe.status??""} ${n.probe.error??""}
          </div>`:m}

      ${nt({channelId:"telegram",props:t})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>t.onRefresh(!0)}>
          Probe
        </button>
      </div>
    </div>
  `}function Oh(e){const{props:t,whatsapp:n,accountCountLabel:s}=e;return l`
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
            ${n?.authAgeMs!=null?ta(n.authAgeMs):"n/a"}
          </span>
        </div>
      </div>

      ${n?.lastError?l`<div class="callout danger" style="margin-top: 12px;">
            ${n.lastError}
          </div>`:m}

      ${t.whatsappMessage?l`<div class="callout" style="margin-top: 12px;">
            ${t.whatsappMessage}
          </div>`:m}

      ${t.whatsappQrDataUrl?l`<div class="qr-wrap">
            <img src=${t.whatsappQrDataUrl} alt="WhatsApp QR" />
          </div>`:m}

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

      ${nt({channelId:"whatsapp",props:t})}
    </div>
  `}function Bh(e){const t=e.snapshot?.channels,n=t?.whatsapp??void 0,s=t?.telegram??void 0,i=t?.discord??null,a=t?.googlechat??null,o=t?.slack??null,r=t?.signal??null,c=t?.imessage??null,d=t?.nostr??null,p=zh(e.snapshot).map((h,u)=>({key:h,enabled:Rh(h,e),order:u})).toSorted((h,u)=>h.enabled!==u.enabled?h.enabled?-1:1:h.order-u.order);return l`
    <section class="grid grid-cols-2">
      ${p.map(h=>Uh(h.key,e,{whatsapp:n,telegram:s,discord:i,googlechat:a,slack:o,signal:r,imessage:c,nostr:d,channelAccounts:e.snapshot?.channelAccounts??null}))}
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
          </div>`:m}
      <pre class="code-block" style="margin-top: 12px;">
${e.snapshot?JSON.stringify(e.snapshot,null,2):"No snapshot yet."}
      </pre>
    </section>
  `}function zh(e){return e?.channelMeta?.length?e.channelMeta.map(t=>t.id):e?.channelOrder?.length?e.channelOrder:["whatsapp","telegram","discord","googlechat","slack","signal","imessage","nostr"]}function Uh(e,t,n){const s=Zl(e,n.channelAccounts);switch(e){case"whatsapp":return Oh({props:t,whatsapp:n.whatsapp,accountCountLabel:s});case"telegram":return Nh({props:t,telegram:n.telegram,telegramAccounts:n.channelAccounts?.telegram??[],accountCountLabel:s});case"discord":return Eh({props:t,discord:n.discord,accountCountLabel:s});case"googlechat":return Lh({props:t,googleChat:n.googlechat,accountCountLabel:s});case"slack":return Fh({props:t,slack:n.slack,accountCountLabel:s});case"signal":return Dh({props:t,signal:n.signal,accountCountLabel:s});case"imessage":return Mh({props:t,imessage:n.imessage,accountCountLabel:s});case"nostr":{const i=n.channelAccounts?.nostr??[],a=i[0],o=a?.accountId??"default",r=a?.profile??null,c=t.nostrProfileAccountId===o?t.nostrProfileFormState:null,d=c?{onFieldChange:t.onNostrProfileFieldChange,onSave:t.onNostrProfileSave,onImport:t.onNostrProfileImport,onCancel:t.onNostrProfileCancel,onToggleAdvanced:t.onNostrProfileToggleAdvanced}:null;return Ih({props:t,nostr:n.nostr,nostrAccounts:i,accountCountLabel:s,profileFormState:c,profileFormCallbacks:d,onEditProfile:()=>t.onNostrProfileEdit(o,r)})}default:return Hh(e,t,n.channelAccounts??{})}}function Hh(e,t,n){const s=Kh(t.snapshot,e),i=t.snapshot?.channels?.[e],a=typeof i?.configured=="boolean"?i.configured:void 0,o=typeof i?.running=="boolean"?i.running:void 0,r=typeof i?.connected=="boolean"?i.connected:void 0,c=typeof i?.lastError=="string"?i.lastError:void 0,d=n[e]??[],g=Zl(e,n);return l`
    <div class="card">
      <div class="card-title">${s}</div>
      <div class="card-sub">Channel status and configuration.</div>
      ${g}

      ${d.length>0?l`
            <div class="account-card-list">
              ${d.map(p=>Gh(p))}
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
          </div>`:m}

      ${nt({channelId:e,props:t})}
    </div>
  `}function jh(e){return e?.channelMeta?.length?Object.fromEntries(e.channelMeta.map(t=>[t.id,t])):{}}function Kh(e,t){return jh(e)[t]?.label??e?.channelLabels?.[t]??t}const Wh=600*1e3;function Xl(e){return e.lastInboundAt?Date.now()-e.lastInboundAt<Wh:!1}function qh(e){return e.running?"Yes":Xl(e)?"Active":"No"}function Vh(e){return e.connected===!0?"Yes":e.connected===!1?"No":Xl(e)?"Active":"n/a"}function Gh(e){const t=qh(e),n=Vh(e);return l`
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
            `:m}
      </div>
    </div>
  `}const kn=(e,t)=>{const n=e._$AN;if(n===void 0)return!1;for(const s of n)s._$AO?.(t,!1),kn(s,t);return!0},hs=e=>{let t,n;do{if((t=e._$AM)===void 0)break;n=t._$AN,n.delete(e),e=t}while(n?.size===0)},Jl=e=>{for(let t;t=e._$AM;e=t){let n=t._$AN;if(n===void 0)t._$AN=n=new Set;else if(n.has(e))break;n.add(e),Zh(t)}};function Qh(e){this._$AN!==void 0?(hs(this),this._$AM=e,Jl(this)):this._$AM=e}function Yh(e,t=!1,n=0){const s=this._$AH,i=this._$AN;if(i!==void 0&&i.size!==0)if(t)if(Array.isArray(s))for(let a=n;a<s.length;a++)kn(s[a],!1),hs(s[a]);else s!=null&&(kn(s,!1),hs(s));else kn(this,e)}const Zh=e=>{e.type==ma.CHILD&&(e._$AP??=Yh,e._$AQ??=Qh)};class Xh extends ya{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,n,s){super._$AT(t,n,s),Jl(this),this.isConnected=t._$AU}_$AO(t,n=!0){t!==this.isConnected&&(this.isConnected=t,t?this.reconnected?.():this.disconnected?.()),n&&(kn(this,t),hs(this))}setValue(t){if(of(this._$Ct))this._$Ct._$AI(t,this);else{const n=[...this._$Ct._$AH];n[this._$Ci]=t,this._$Ct._$AI(n,this,0)}}disconnected(){}reconnected(){}}const oi=new WeakMap,Jh=ba(class extends Xh{render(e){return m}update(e,[t]){const n=t!==this.G;return n&&this.G!==void 0&&this.rt(void 0),(n||this.lt!==this.ct)&&(this.G=t,this.ht=e.options?.host,this.rt(this.ct=e.element)),m}rt(e){if(this.isConnected||(e=void 0),typeof this.G=="function"){const t=this.ht??globalThis;let n=oi.get(t);n===void 0&&(n=new WeakMap,oi.set(t,n)),n.get(this.G)!==void 0&&this.G.call(this.ht,void 0),n.set(this.G,e),e!==void 0&&this.G.call(this.ht,e)}else this.G.value=e}get lt(){return typeof this.G=="function"?oi.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}});class Ei extends ya{constructor(t){if(super(t),this.it=m,t.type!==ma.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===m||t==null)return this._t=void 0,this.it=t;if(t===ft)return t;if(typeof t!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.it)return this._t;this.it=t;const n=[t];return n.raw=n,this._t={_$litType$:this.constructor.resultType,strings:n,values:[]}}}Ei.directiveName="unsafeHTML",Ei.resultType=1;const Li=ba(Ei);const{entries:ec,setPrototypeOf:Qo,isFrozen:ev,getPrototypeOf:tv,getOwnPropertyDescriptor:nv}=Object;let{freeze:we,seal:Re,create:Mi}=Object,{apply:Ii,construct:Ri}=typeof Reflect<"u"&&Reflect;we||(we=function(t){return t});Re||(Re=function(t){return t});Ii||(Ii=function(t,n){for(var s=arguments.length,i=new Array(s>2?s-2:0),a=2;a<s;a++)i[a-2]=arguments[a];return t.apply(n,i)});Ri||(Ri=function(t){for(var n=arguments.length,s=new Array(n>1?n-1:0),i=1;i<n;i++)s[i-1]=arguments[i];return new t(...s)});const Gn=ke(Array.prototype.forEach),sv=ke(Array.prototype.lastIndexOf),Yo=ke(Array.prototype.pop),cn=ke(Array.prototype.push),iv=ke(Array.prototype.splice),os=ke(String.prototype.toLowerCase),ri=ke(String.prototype.toString),li=ke(String.prototype.match),dn=ke(String.prototype.replace),av=ke(String.prototype.indexOf),ov=ke(String.prototype.trim),Pe=ke(Object.prototype.hasOwnProperty),xe=ke(RegExp.prototype.test),un=rv(TypeError);function ke(e){return function(t){t instanceof RegExp&&(t.lastIndex=0);for(var n=arguments.length,s=new Array(n>1?n-1:0),i=1;i<n;i++)s[i-1]=arguments[i];return Ii(e,t,s)}}function rv(e){return function(){for(var t=arguments.length,n=new Array(t),s=0;s<t;s++)n[s]=arguments[s];return Ri(e,n)}}function W(e,t){let n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:os;Qo&&Qo(e,null);let s=t.length;for(;s--;){let i=t[s];if(typeof i=="string"){const a=n(i);a!==i&&(ev(t)||(t[s]=a),i=a)}e[i]=!0}return e}function lv(e){for(let t=0;t<e.length;t++)Pe(e,t)||(e[t]=null);return e}function He(e){const t=Mi(null);for(const[n,s]of ec(e))Pe(e,n)&&(Array.isArray(s)?t[n]=lv(s):s&&typeof s=="object"&&s.constructor===Object?t[n]=He(s):t[n]=s);return t}function gn(e,t){for(;e!==null;){const s=nv(e,t);if(s){if(s.get)return ke(s.get);if(typeof s.value=="function")return ke(s.value)}e=tv(e)}function n(){return null}return n}const Zo=we(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),ci=we(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),di=we(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),cv=we(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),ui=we(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),dv=we(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),Xo=we(["#text"]),Jo=we(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns","slot"]),gi=we(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),er=we(["accent","accentunder","align","bevelled","close","columnsalign","columnlines","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lspace","lquote","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),Qn=we(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),uv=Re(/\{\{[\w\W]*|[\w\W]*\}\}/gm),gv=Re(/<%[\w\W]*|[\w\W]*%>/gm),pv=Re(/\$\{[\w\W]*/gm),fv=Re(/^data-[\-\w.\u00B7-\uFFFF]+$/),hv=Re(/^aria-[\-\w]+$/),tc=Re(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),vv=Re(/^(?:\w+script|data):/i),mv=Re(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),nc=Re(/^html$/i),bv=Re(/^[a-z][.\w]*(-[.\w]+)+$/i);var tr=Object.freeze({__proto__:null,ARIA_ATTR:hv,ATTR_WHITESPACE:mv,CUSTOM_ELEMENT:bv,DATA_ATTR:fv,DOCTYPE_NAME:nc,ERB_EXPR:gv,IS_ALLOWED_URI:tc,IS_SCRIPT_OR_DATA:vv,MUSTACHE_EXPR:uv,TMPLIT_EXPR:pv});const pn={element:1,text:3,progressingInstruction:7,comment:8,document:9},yv=function(){return typeof window>"u"?null:window},xv=function(t,n){if(typeof t!="object"||typeof t.createPolicy!="function")return null;let s=null;const i="data-tt-policy-suffix";n&&n.hasAttribute(i)&&(s=n.getAttribute(i));const a="dompurify"+(s?"#"+s:"");try{return t.createPolicy(a,{createHTML(o){return o},createScriptURL(o){return o}})}catch{return console.warn("TrustedTypes policy "+a+" could not be created."),null}},nr=function(){return{afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}};function sc(){let e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:yv();const t=z=>sc(z);if(t.version="3.3.1",t.removed=[],!e||!e.document||e.document.nodeType!==pn.document||!e.Element)return t.isSupported=!1,t;let{document:n}=e;const s=n,i=s.currentScript,{DocumentFragment:a,HTMLTemplateElement:o,Node:r,Element:c,NodeFilter:d,NamedNodeMap:g=e.NamedNodeMap||e.MozNamedAttrMap,HTMLFormElement:p,DOMParser:h,trustedTypes:u}=e,f=c.prototype,v=gn(f,"cloneNode"),$=gn(f,"remove"),S=gn(f,"nextSibling"),C=gn(f,"childNodes"),k=gn(f,"parentNode");if(typeof o=="function"){const z=n.createElement("template");z.content&&z.content.ownerDocument&&(n=z.content.ownerDocument)}let A,E="";const{implementation:T,createNodeIterator:I,createDocumentFragment:H,getElementsByTagName:Z}=n,{importNode:te}=s;let R=nr();t.isSupported=typeof ec=="function"&&typeof k=="function"&&T&&T.createHTMLDocument!==void 0;const{MUSTACHE_EXPR:q,ERB_EXPR:ne,TMPLIT_EXPR:oe,DATA_ATTR:_,ARIA_ATTR:j,IS_SCRIPT_OR_DATA:Q,ATTR_WHITESPACE:re,CUSTOM_ELEMENT:pe}=tr;let{IS_ALLOWED_URI:M}=tr,D=null;const F=W({},[...Zo,...ci,...di,...ui,...Xo]);let K=null;const ce=W({},[...Jo,...gi,...er,...Qn]);let X=Object.seal(Mi(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),se=null,V=null;const U=Object.seal(Mi(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let ie=!0,le=!0,fe=!1,Te=!0,Ke=!1,st=!0,he=!1,Oe=!1,We=!1,qe=!1,Ve=!1,it=!1,at=!0,yt=!1;const Fs="user-content-";let jt=!0,ot=!1,Be={},Se=null;const an=W({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","style","svg","template","thead","title","video","xmp"]);let Kt=null;const rt=W({},["audio","video","img","source","image","track"]);let Ns=null;const Fa=W({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),Fn="http://www.w3.org/1998/Math/MathML",Nn="http://www.w3.org/2000/svg",Ge="http://www.w3.org/1999/xhtml";let Wt=Ge,Os=!1,Bs=null;const Tc=W({},[Fn,Nn,Ge],ri);let On=W({},["mi","mo","mn","ms","mtext"]),Bn=W({},["annotation-xml"]);const _c=W({},["title","style","font","a","script"]);let on=null;const Ec=["application/xhtml+xml","text/html"],Lc="text/html";let ue=null,qt=null;const Mc=n.createElement("form"),Na=function(b){return b instanceof RegExp||b instanceof Function},zs=function(){let b=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};if(!(qt&&qt===b)){if((!b||typeof b!="object")&&(b={}),b=He(b),on=Ec.indexOf(b.PARSER_MEDIA_TYPE)===-1?Lc:b.PARSER_MEDIA_TYPE,ue=on==="application/xhtml+xml"?ri:os,D=Pe(b,"ALLOWED_TAGS")?W({},b.ALLOWED_TAGS,ue):F,K=Pe(b,"ALLOWED_ATTR")?W({},b.ALLOWED_ATTR,ue):ce,Bs=Pe(b,"ALLOWED_NAMESPACES")?W({},b.ALLOWED_NAMESPACES,ri):Tc,Ns=Pe(b,"ADD_URI_SAFE_ATTR")?W(He(Fa),b.ADD_URI_SAFE_ATTR,ue):Fa,Kt=Pe(b,"ADD_DATA_URI_TAGS")?W(He(rt),b.ADD_DATA_URI_TAGS,ue):rt,Se=Pe(b,"FORBID_CONTENTS")?W({},b.FORBID_CONTENTS,ue):an,se=Pe(b,"FORBID_TAGS")?W({},b.FORBID_TAGS,ue):He({}),V=Pe(b,"FORBID_ATTR")?W({},b.FORBID_ATTR,ue):He({}),Be=Pe(b,"USE_PROFILES")?b.USE_PROFILES:!1,ie=b.ALLOW_ARIA_ATTR!==!1,le=b.ALLOW_DATA_ATTR!==!1,fe=b.ALLOW_UNKNOWN_PROTOCOLS||!1,Te=b.ALLOW_SELF_CLOSE_IN_ATTR!==!1,Ke=b.SAFE_FOR_TEMPLATES||!1,st=b.SAFE_FOR_XML!==!1,he=b.WHOLE_DOCUMENT||!1,qe=b.RETURN_DOM||!1,Ve=b.RETURN_DOM_FRAGMENT||!1,it=b.RETURN_TRUSTED_TYPE||!1,We=b.FORCE_BODY||!1,at=b.SANITIZE_DOM!==!1,yt=b.SANITIZE_NAMED_PROPS||!1,jt=b.KEEP_CONTENT!==!1,ot=b.IN_PLACE||!1,M=b.ALLOWED_URI_REGEXP||tc,Wt=b.NAMESPACE||Ge,On=b.MATHML_TEXT_INTEGRATION_POINTS||On,Bn=b.HTML_INTEGRATION_POINTS||Bn,X=b.CUSTOM_ELEMENT_HANDLING||{},b.CUSTOM_ELEMENT_HANDLING&&Na(b.CUSTOM_ELEMENT_HANDLING.tagNameCheck)&&(X.tagNameCheck=b.CUSTOM_ELEMENT_HANDLING.tagNameCheck),b.CUSTOM_ELEMENT_HANDLING&&Na(b.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)&&(X.attributeNameCheck=b.CUSTOM_ELEMENT_HANDLING.attributeNameCheck),b.CUSTOM_ELEMENT_HANDLING&&typeof b.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements=="boolean"&&(X.allowCustomizedBuiltInElements=b.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements),Ke&&(le=!1),Ve&&(qe=!0),Be&&(D=W({},Xo),K=[],Be.html===!0&&(W(D,Zo),W(K,Jo)),Be.svg===!0&&(W(D,ci),W(K,gi),W(K,Qn)),Be.svgFilters===!0&&(W(D,di),W(K,gi),W(K,Qn)),Be.mathMl===!0&&(W(D,ui),W(K,er),W(K,Qn))),b.ADD_TAGS&&(typeof b.ADD_TAGS=="function"?U.tagCheck=b.ADD_TAGS:(D===F&&(D=He(D)),W(D,b.ADD_TAGS,ue))),b.ADD_ATTR&&(typeof b.ADD_ATTR=="function"?U.attributeCheck=b.ADD_ATTR:(K===ce&&(K=He(K)),W(K,b.ADD_ATTR,ue))),b.ADD_URI_SAFE_ATTR&&W(Ns,b.ADD_URI_SAFE_ATTR,ue),b.FORBID_CONTENTS&&(Se===an&&(Se=He(Se)),W(Se,b.FORBID_CONTENTS,ue)),b.ADD_FORBID_CONTENTS&&(Se===an&&(Se=He(Se)),W(Se,b.ADD_FORBID_CONTENTS,ue)),jt&&(D["#text"]=!0),he&&W(D,["html","head","body"]),D.table&&(W(D,["tbody"]),delete se.tbody),b.TRUSTED_TYPES_POLICY){if(typeof b.TRUSTED_TYPES_POLICY.createHTML!="function")throw un('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if(typeof b.TRUSTED_TYPES_POLICY.createScriptURL!="function")throw un('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');A=b.TRUSTED_TYPES_POLICY,E=A.createHTML("")}else A===void 0&&(A=xv(u,i)),A!==null&&typeof E=="string"&&(E=A.createHTML(""));we&&we(b),qt=b}},Oa=W({},[...ci,...di,...cv]),Ba=W({},[...ui,...dv]),Ic=function(b){let L=k(b);(!L||!L.tagName)&&(L={namespaceURI:Wt,tagName:"template"});const O=os(b.tagName),ae=os(L.tagName);return Bs[b.namespaceURI]?b.namespaceURI===Nn?L.namespaceURI===Ge?O==="svg":L.namespaceURI===Fn?O==="svg"&&(ae==="annotation-xml"||On[ae]):!!Oa[O]:b.namespaceURI===Fn?L.namespaceURI===Ge?O==="math":L.namespaceURI===Nn?O==="math"&&Bn[ae]:!!Ba[O]:b.namespaceURI===Ge?L.namespaceURI===Nn&&!Bn[ae]||L.namespaceURI===Fn&&!On[ae]?!1:!Ba[O]&&(_c[O]||!Oa[O]):!!(on==="application/xhtml+xml"&&Bs[b.namespaceURI]):!1},ze=function(b){cn(t.removed,{element:b});try{k(b).removeChild(b)}catch{$(b)}},xt=function(b,L){try{cn(t.removed,{attribute:L.getAttributeNode(b),from:L})}catch{cn(t.removed,{attribute:null,from:L})}if(L.removeAttribute(b),b==="is")if(qe||Ve)try{ze(L)}catch{}else try{L.setAttribute(b,"")}catch{}},za=function(b){let L=null,O=null;if(We)b="<remove></remove>"+b;else{const de=li(b,/^[\r\n\t ]+/);O=de&&de[0]}on==="application/xhtml+xml"&&Wt===Ge&&(b='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+b+"</body></html>");const ae=A?A.createHTML(b):b;if(Wt===Ge)try{L=new h().parseFromString(ae,on)}catch{}if(!L||!L.documentElement){L=T.createDocument(Wt,"template",null);try{L.documentElement.innerHTML=Os?E:ae}catch{}}const be=L.body||L.documentElement;return b&&O&&be.insertBefore(n.createTextNode(O),be.childNodes[0]||null),Wt===Ge?Z.call(L,he?"html":"body")[0]:he?L.documentElement:be},Ua=function(b){return I.call(b.ownerDocument||b,b,d.SHOW_ELEMENT|d.SHOW_COMMENT|d.SHOW_TEXT|d.SHOW_PROCESSING_INSTRUCTION|d.SHOW_CDATA_SECTION,null)},Us=function(b){return b instanceof p&&(typeof b.nodeName!="string"||typeof b.textContent!="string"||typeof b.removeChild!="function"||!(b.attributes instanceof g)||typeof b.removeAttribute!="function"||typeof b.setAttribute!="function"||typeof b.namespaceURI!="string"||typeof b.insertBefore!="function"||typeof b.hasChildNodes!="function")},Ha=function(b){return typeof r=="function"&&b instanceof r};function Qe(z,b,L){Gn(z,O=>{O.call(t,b,L,qt)})}const ja=function(b){let L=null;if(Qe(R.beforeSanitizeElements,b,null),Us(b))return ze(b),!0;const O=ue(b.nodeName);if(Qe(R.uponSanitizeElement,b,{tagName:O,allowedTags:D}),st&&b.hasChildNodes()&&!Ha(b.firstElementChild)&&xe(/<[/\w!]/g,b.innerHTML)&&xe(/<[/\w!]/g,b.textContent)||b.nodeType===pn.progressingInstruction||st&&b.nodeType===pn.comment&&xe(/<[/\w]/g,b.data))return ze(b),!0;if(!(U.tagCheck instanceof Function&&U.tagCheck(O))&&(!D[O]||se[O])){if(!se[O]&&Wa(O)&&(X.tagNameCheck instanceof RegExp&&xe(X.tagNameCheck,O)||X.tagNameCheck instanceof Function&&X.tagNameCheck(O)))return!1;if(jt&&!Se[O]){const ae=k(b)||b.parentNode,be=C(b)||b.childNodes;if(be&&ae){const de=be.length;for(let Ae=de-1;Ae>=0;--Ae){const Ye=v(be[Ae],!0);Ye.__removalCount=(b.__removalCount||0)+1,ae.insertBefore(Ye,S(b))}}}return ze(b),!0}return b instanceof c&&!Ic(b)||(O==="noscript"||O==="noembed"||O==="noframes")&&xe(/<\/no(script|embed|frames)/i,b.innerHTML)?(ze(b),!0):(Ke&&b.nodeType===pn.text&&(L=b.textContent,Gn([q,ne,oe],ae=>{L=dn(L,ae," ")}),b.textContent!==L&&(cn(t.removed,{element:b.cloneNode()}),b.textContent=L)),Qe(R.afterSanitizeElements,b,null),!1)},Ka=function(b,L,O){if(at&&(L==="id"||L==="name")&&(O in n||O in Mc))return!1;if(!(le&&!V[L]&&xe(_,L))){if(!(ie&&xe(j,L))){if(!(U.attributeCheck instanceof Function&&U.attributeCheck(L,b))){if(!K[L]||V[L]){if(!(Wa(b)&&(X.tagNameCheck instanceof RegExp&&xe(X.tagNameCheck,b)||X.tagNameCheck instanceof Function&&X.tagNameCheck(b))&&(X.attributeNameCheck instanceof RegExp&&xe(X.attributeNameCheck,L)||X.attributeNameCheck instanceof Function&&X.attributeNameCheck(L,b))||L==="is"&&X.allowCustomizedBuiltInElements&&(X.tagNameCheck instanceof RegExp&&xe(X.tagNameCheck,O)||X.tagNameCheck instanceof Function&&X.tagNameCheck(O))))return!1}else if(!Ns[L]){if(!xe(M,dn(O,re,""))){if(!((L==="src"||L==="xlink:href"||L==="href")&&b!=="script"&&av(O,"data:")===0&&Kt[b])){if(!(fe&&!xe(Q,dn(O,re,"")))){if(O)return!1}}}}}}}return!0},Wa=function(b){return b!=="annotation-xml"&&li(b,pe)},qa=function(b){Qe(R.beforeSanitizeAttributes,b,null);const{attributes:L}=b;if(!L||Us(b))return;const O={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:K,forceKeepAttr:void 0};let ae=L.length;for(;ae--;){const be=L[ae],{name:de,namespaceURI:Ae,value:Ye}=be,Vt=ue(de),Hs=Ye;let ve=de==="value"?Hs:ov(Hs);if(O.attrName=Vt,O.attrValue=ve,O.keepAttr=!0,O.forceKeepAttr=void 0,Qe(R.uponSanitizeAttribute,b,O),ve=O.attrValue,yt&&(Vt==="id"||Vt==="name")&&(xt(de,b),ve=Fs+ve),st&&xe(/((--!?|])>)|<\/(style|title|textarea)/i,ve)){xt(de,b);continue}if(Vt==="attributename"&&li(ve,"href")){xt(de,b);continue}if(O.forceKeepAttr)continue;if(!O.keepAttr){xt(de,b);continue}if(!Te&&xe(/\/>/i,ve)){xt(de,b);continue}Ke&&Gn([q,ne,oe],Ga=>{ve=dn(ve,Ga," ")});const Va=ue(b.nodeName);if(!Ka(Va,Vt,ve)){xt(de,b);continue}if(A&&typeof u=="object"&&typeof u.getAttributeType=="function"&&!Ae)switch(u.getAttributeType(Va,Vt)){case"TrustedHTML":{ve=A.createHTML(ve);break}case"TrustedScriptURL":{ve=A.createScriptURL(ve);break}}if(ve!==Hs)try{Ae?b.setAttributeNS(Ae,de,ve):b.setAttribute(de,ve),Us(b)?ze(b):Yo(t.removed)}catch{xt(de,b)}}Qe(R.afterSanitizeAttributes,b,null)},Rc=function z(b){let L=null;const O=Ua(b);for(Qe(R.beforeSanitizeShadowDOM,b,null);L=O.nextNode();)Qe(R.uponSanitizeShadowNode,L,null),ja(L),qa(L),L.content instanceof a&&z(L.content);Qe(R.afterSanitizeShadowDOM,b,null)};return t.sanitize=function(z){let b=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},L=null,O=null,ae=null,be=null;if(Os=!z,Os&&(z="<!-->"),typeof z!="string"&&!Ha(z))if(typeof z.toString=="function"){if(z=z.toString(),typeof z!="string")throw un("dirty is not a string, aborting")}else throw un("toString is not a function");if(!t.isSupported)return z;if(Oe||zs(b),t.removed=[],typeof z=="string"&&(ot=!1),ot){if(z.nodeName){const Ye=ue(z.nodeName);if(!D[Ye]||se[Ye])throw un("root node is forbidden and cannot be sanitized in-place")}}else if(z instanceof r)L=za("<!---->"),O=L.ownerDocument.importNode(z,!0),O.nodeType===pn.element&&O.nodeName==="BODY"||O.nodeName==="HTML"?L=O:L.appendChild(O);else{if(!qe&&!Ke&&!he&&z.indexOf("<")===-1)return A&&it?A.createHTML(z):z;if(L=za(z),!L)return qe?null:it?E:""}L&&We&&ze(L.firstChild);const de=Ua(ot?z:L);for(;ae=de.nextNode();)ja(ae),qa(ae),ae.content instanceof a&&Rc(ae.content);if(ot)return z;if(qe){if(Ve)for(be=H.call(L.ownerDocument);L.firstChild;)be.appendChild(L.firstChild);else be=L;return(K.shadowroot||K.shadowrootmode)&&(be=te.call(s,be,!0)),be}let Ae=he?L.outerHTML:L.innerHTML;return he&&D["!doctype"]&&L.ownerDocument&&L.ownerDocument.doctype&&L.ownerDocument.doctype.name&&xe(nc,L.ownerDocument.doctype.name)&&(Ae="<!DOCTYPE "+L.ownerDocument.doctype.name+`>
`+Ae),Ke&&Gn([q,ne,oe],Ye=>{Ae=dn(Ae,Ye," ")}),A&&it?A.createHTML(Ae):Ae},t.setConfig=function(){let z=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};zs(z),Oe=!0},t.clearConfig=function(){qt=null,Oe=!1},t.isValidAttribute=function(z,b,L){qt||zs({});const O=ue(z),ae=ue(b);return Ka(O,ae,L)},t.addHook=function(z,b){typeof b=="function"&&cn(R[z],b)},t.removeHook=function(z,b){if(b!==void 0){const L=sv(R[z],b);return L===-1?void 0:iv(R[z],L,1)[0]}return Yo(R[z])},t.removeHooks=function(z){R[z]=[]},t.removeAllHooks=function(){R=nr()},t}var Pi=sc();function wa(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var Ht=wa();function ic(e){Ht=e}var Mt={exec:()=>null};function G(e,t=""){let n=typeof e=="string"?e:e.source,s={replace:(i,a)=>{let o=typeof a=="string"?a:a.source;return o=o.replace($e.caret,"$1"),n=n.replace(i,o),s},getRegex:()=>new RegExp(n,t)};return s}var $v=(()=>{try{return!!new RegExp("(?<=1)(?<!1)")}catch{return!1}})(),$e={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] +\S/,listReplaceTask:/^\[[ xX]\] +/,listTaskCheckbox:/\[[ xX]\]/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,unescapeTest:/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:e=>new RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}#`),htmlBeginRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}<(?:[a-z].*>|!--)`,"i"),blockquoteBeginRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}>`)},wv=/^(?:[ \t]*(?:\n|$))+/,kv=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,Sv=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,Dn=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,Av=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,ka=/ {0,3}(?:[*+-]|\d{1,9}[.)])/,ac=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,oc=G(ac).replace(/bull/g,ka).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),Cv=G(ac).replace(/bull/g,ka).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),Sa=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,Tv=/^[^\n]+/,Aa=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,_v=G(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",Aa).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),Ev=G(/^(bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,ka).getRegex(),Rs="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",Ca=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Lv=G("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",Ca).replace("tag",Rs).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),rc=G(Sa).replace("hr",Dn).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Rs).getRegex(),Mv=G(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",rc).getRegex(),Ta={blockquote:Mv,code:kv,def:_v,fences:Sv,heading:Av,hr:Dn,html:Lv,lheading:oc,list:Ev,newline:wv,paragraph:rc,table:Mt,text:Tv},sr=G("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",Dn).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Rs).getRegex(),Iv={...Ta,lheading:Cv,table:sr,paragraph:G(Sa).replace("hr",Dn).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",sr).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Rs).getRegex()},Rv={...Ta,html:G(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",Ca).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:Mt,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:G(Sa).replace("hr",Dn).replace("heading",` *#{1,6} *[^
]`).replace("lheading",oc).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},Pv=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,Dv=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,lc=/^( {2,}|\\)\n(?!\s*$)/,Fv=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,Ps=/[\p{P}\p{S}]/u,_a=/[\s\p{P}\p{S}]/u,cc=/[^\s\p{P}\p{S}]/u,Nv=G(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,_a).getRegex(),dc=/(?!~)[\p{P}\p{S}]/u,Ov=/(?!~)[\s\p{P}\p{S}]/u,Bv=/(?:[^\s\p{P}\p{S}]|~)/u,uc=/(?![*_])[\p{P}\p{S}]/u,zv=/(?![*_])[\s\p{P}\p{S}]/u,Uv=/(?:[^\s\p{P}\p{S}]|[*_])/u,Hv=G(/link|precode-code|html/,"g").replace("link",/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-",$v?"(?<!`)()":"(^^|[^`])").replace("code",/(?<b>`+)[^`]+\k<b>(?!`)/).replace("html",/<(?! )[^<>]*?>/).getRegex(),gc=/^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/,jv=G(gc,"u").replace(/punct/g,Ps).getRegex(),Kv=G(gc,"u").replace(/punct/g,dc).getRegex(),pc="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",Wv=G(pc,"gu").replace(/notPunctSpace/g,cc).replace(/punctSpace/g,_a).replace(/punct/g,Ps).getRegex(),qv=G(pc,"gu").replace(/notPunctSpace/g,Bv).replace(/punctSpace/g,Ov).replace(/punct/g,dc).getRegex(),Vv=G("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,cc).replace(/punctSpace/g,_a).replace(/punct/g,Ps).getRegex(),Gv=G(/^~~?(?:((?!~)punct)|[^\s~])/,"u").replace(/punct/g,uc).getRegex(),Qv="^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)",Yv=G(Qv,"gu").replace(/notPunctSpace/g,Uv).replace(/punctSpace/g,zv).replace(/punct/g,uc).getRegex(),Zv=G(/\\(punct)/,"gu").replace(/punct/g,Ps).getRegex(),Xv=G(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),Jv=G(Ca).replace("(?:-->|$)","-->").getRegex(),em=G("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",Jv).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),vs=/(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+[^`]*?`+(?!`)|[^\[\]\\`])*?/,tm=G(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label",vs).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),fc=G(/^!?\[(label)\]\[(ref)\]/).replace("label",vs).replace("ref",Aa).getRegex(),hc=G(/^!?\[(ref)\](?:\[\])?/).replace("ref",Aa).getRegex(),nm=G("reflink|nolink(?!\\()","g").replace("reflink",fc).replace("nolink",hc).getRegex(),ir=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,Ea={_backpedal:Mt,anyPunctuation:Zv,autolink:Xv,blockSkip:Hv,br:lc,code:Dv,del:Mt,delLDelim:Mt,delRDelim:Mt,emStrongLDelim:jv,emStrongRDelimAst:Wv,emStrongRDelimUnd:Vv,escape:Pv,link:tm,nolink:hc,punctuation:Nv,reflink:fc,reflinkSearch:nm,tag:em,text:Fv,url:Mt},sm={...Ea,link:G(/^!?\[(label)\]\((.*?)\)/).replace("label",vs).getRegex(),reflink:G(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",vs).getRegex()},Di={...Ea,emStrongRDelimAst:qv,emStrongLDelim:Kv,delLDelim:Gv,delRDelim:Yv,url:G(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol",ir).replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:G(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol",ir).getRegex()},im={...Di,br:G(lc).replace("{2,}","*").getRegex(),text:G(Di.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},Yn={normal:Ta,gfm:Iv,pedantic:Rv},fn={normal:Ea,gfm:Di,breaks:im,pedantic:sm},am={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},ar=e=>am[e];function et(e,t){if(t){if($e.escapeTest.test(e))return e.replace($e.escapeReplace,ar)}else if($e.escapeTestNoEncode.test(e))return e.replace($e.escapeReplaceNoEncode,ar);return e}function or(e){try{e=encodeURI(e).replace($e.percentDecode,"%")}catch{return null}return e}function rr(e,t){let n=e.replace($e.findPipe,(a,o,r)=>{let c=!1,d=o;for(;--d>=0&&r[d]==="\\";)c=!c;return c?"|":" |"}),s=n.split($e.splitPipe),i=0;if(s[0].trim()||s.shift(),s.length>0&&!s.at(-1)?.trim()&&s.pop(),t)if(s.length>t)s.splice(t);else for(;s.length<t;)s.push("");for(;i<s.length;i++)s[i]=s[i].trim().replace($e.slashPipe,"|");return s}function hn(e,t,n){let s=e.length;if(s===0)return"";let i=0;for(;i<s&&e.charAt(s-i-1)===t;)i++;return e.slice(0,s-i)}function om(e,t){if(e.indexOf(t[1])===-1)return-1;let n=0;for(let s=0;s<e.length;s++)if(e[s]==="\\")s++;else if(e[s]===t[0])n++;else if(e[s]===t[1]&&(n--,n<0))return s;return n>0?-2:-1}function rm(e,t=0){let n=t,s="";for(let i of e)if(i==="	"){let a=4-n%4;s+=" ".repeat(a),n+=a}else s+=i,n++;return s}function lr(e,t,n,s,i){let a=t.href,o=t.title||null,r=e[1].replace(i.other.outputLinkReplace,"$1");s.state.inLink=!0;let c={type:e[0].charAt(0)==="!"?"image":"link",raw:n,href:a,title:o,text:r,tokens:s.inlineTokens(r)};return s.state.inLink=!1,c}function lm(e,t,n){let s=e.match(n.other.indentCodeCompensation);if(s===null)return t;let i=s[1];return t.split(`
`).map(a=>{let o=a.match(n.other.beginningSpace);if(o===null)return a;let[r]=o;return r.length>=i.length?a.slice(i.length):a}).join(`
`)}var ms=class{options;rules;lexer;constructor(e){this.options=e||Ht}space(e){let t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:"space",raw:t[0]}}code(e){let t=this.rules.block.code.exec(e);if(t){let n=t[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:t[0],codeBlockStyle:"indented",text:this.options.pedantic?n:hn(n,`
`)}}}fences(e){let t=this.rules.block.fences.exec(e);if(t){let n=t[0],s=lm(n,t[3]||"",this.rules);return{type:"code",raw:n,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):t[2],text:s}}}heading(e){let t=this.rules.block.heading.exec(e);if(t){let n=t[2].trim();if(this.rules.other.endingHash.test(n)){let s=hn(n,"#");(this.options.pedantic||!s||this.rules.other.endingSpaceChar.test(s))&&(n=s.trim())}return{type:"heading",raw:t[0],depth:t[1].length,text:n,tokens:this.lexer.inline(n)}}}hr(e){let t=this.rules.block.hr.exec(e);if(t)return{type:"hr",raw:hn(t[0],`
`)}}blockquote(e){let t=this.rules.block.blockquote.exec(e);if(t){let n=hn(t[0],`
`).split(`
`),s="",i="",a=[];for(;n.length>0;){let o=!1,r=[],c;for(c=0;c<n.length;c++)if(this.rules.other.blockquoteStart.test(n[c]))r.push(n[c]),o=!0;else if(!o)r.push(n[c]);else break;n=n.slice(c);let d=r.join(`
`),g=d.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");s=s?`${s}
${d}`:d,i=i?`${i}
${g}`:g;let p=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(g,a,!0),this.lexer.state.top=p,n.length===0)break;let h=a.at(-1);if(h?.type==="code")break;if(h?.type==="blockquote"){let u=h,f=u.raw+`
`+n.join(`
`),v=this.blockquote(f);a[a.length-1]=v,s=s.substring(0,s.length-u.raw.length)+v.raw,i=i.substring(0,i.length-u.text.length)+v.text;break}else if(h?.type==="list"){let u=h,f=u.raw+`
`+n.join(`
`),v=this.list(f);a[a.length-1]=v,s=s.substring(0,s.length-h.raw.length)+v.raw,i=i.substring(0,i.length-u.raw.length)+v.raw,n=f.substring(a.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:s,tokens:a,text:i}}}list(e){let t=this.rules.block.list.exec(e);if(t){let n=t[1].trim(),s=n.length>1,i={type:"list",raw:"",ordered:s,start:s?+n.slice(0,-1):"",loose:!1,items:[]};n=s?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=s?n:"[*+-]");let a=this.rules.other.listItemRegex(n),o=!1;for(;e;){let c=!1,d="",g="";if(!(t=a.exec(e))||this.rules.block.hr.test(e))break;d=t[0],e=e.substring(d.length);let p=rm(t[2].split(`
`,1)[0],t[1].length),h=e.split(`
`,1)[0],u=!p.trim(),f=0;if(this.options.pedantic?(f=2,g=p.trimStart()):u?f=t[1].length+1:(f=p.search(this.rules.other.nonSpaceChar),f=f>4?1:f,g=p.slice(f),f+=t[1].length),u&&this.rules.other.blankLine.test(h)&&(d+=h+`
`,e=e.substring(h.length+1),c=!0),!c){let v=this.rules.other.nextBulletRegex(f),$=this.rules.other.hrRegex(f),S=this.rules.other.fencesBeginRegex(f),C=this.rules.other.headingBeginRegex(f),k=this.rules.other.htmlBeginRegex(f),A=this.rules.other.blockquoteBeginRegex(f);for(;e;){let E=e.split(`
`,1)[0],T;if(h=E,this.options.pedantic?(h=h.replace(this.rules.other.listReplaceNesting,"  "),T=h):T=h.replace(this.rules.other.tabCharGlobal,"    "),S.test(h)||C.test(h)||k.test(h)||A.test(h)||v.test(h)||$.test(h))break;if(T.search(this.rules.other.nonSpaceChar)>=f||!h.trim())g+=`
`+T.slice(f);else{if(u||p.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||S.test(p)||C.test(p)||$.test(p))break;g+=`
`+h}u=!h.trim(),d+=E+`
`,e=e.substring(E.length+1),p=T.slice(f)}}i.loose||(o?i.loose=!0:this.rules.other.doubleBlankLine.test(d)&&(o=!0)),i.items.push({type:"list_item",raw:d,task:!!this.options.gfm&&this.rules.other.listIsTask.test(g),loose:!1,text:g,tokens:[]}),i.raw+=d}let r=i.items.at(-1);if(r)r.raw=r.raw.trimEnd(),r.text=r.text.trimEnd();else return;i.raw=i.raw.trimEnd();for(let c of i.items){if(this.lexer.state.top=!1,c.tokens=this.lexer.blockTokens(c.text,[]),c.task){if(c.text=c.text.replace(this.rules.other.listReplaceTask,""),c.tokens[0]?.type==="text"||c.tokens[0]?.type==="paragraph"){c.tokens[0].raw=c.tokens[0].raw.replace(this.rules.other.listReplaceTask,""),c.tokens[0].text=c.tokens[0].text.replace(this.rules.other.listReplaceTask,"");for(let g=this.lexer.inlineQueue.length-1;g>=0;g--)if(this.rules.other.listIsTask.test(this.lexer.inlineQueue[g].src)){this.lexer.inlineQueue[g].src=this.lexer.inlineQueue[g].src.replace(this.rules.other.listReplaceTask,"");break}}let d=this.rules.other.listTaskCheckbox.exec(c.raw);if(d){let g={type:"checkbox",raw:d[0]+" ",checked:d[0]!=="[ ]"};c.checked=g.checked,i.loose?c.tokens[0]&&["paragraph","text"].includes(c.tokens[0].type)&&"tokens"in c.tokens[0]&&c.tokens[0].tokens?(c.tokens[0].raw=g.raw+c.tokens[0].raw,c.tokens[0].text=g.raw+c.tokens[0].text,c.tokens[0].tokens.unshift(g)):c.tokens.unshift({type:"paragraph",raw:g.raw,text:g.raw,tokens:[g]}):c.tokens.unshift(g)}}if(!i.loose){let d=c.tokens.filter(p=>p.type==="space"),g=d.length>0&&d.some(p=>this.rules.other.anyLine.test(p.raw));i.loose=g}}if(i.loose)for(let c of i.items){c.loose=!0;for(let d of c.tokens)d.type==="text"&&(d.type="paragraph")}return i}}html(e){let t=this.rules.block.html.exec(e);if(t)return{type:"html",block:!0,raw:t[0],pre:t[1]==="pre"||t[1]==="script"||t[1]==="style",text:t[0]}}def(e){let t=this.rules.block.def.exec(e);if(t){let n=t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),s=t[2]?t[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",i=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):t[3];return{type:"def",tag:n,raw:t[0],href:s,title:i}}}table(e){let t=this.rules.block.table.exec(e);if(!t||!this.rules.other.tableDelimiter.test(t[2]))return;let n=rr(t[1]),s=t[2].replace(this.rules.other.tableAlignChars,"").split("|"),i=t[3]?.trim()?t[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],a={type:"table",raw:t[0],header:[],align:[],rows:[]};if(n.length===s.length){for(let o of s)this.rules.other.tableAlignRight.test(o)?a.align.push("right"):this.rules.other.tableAlignCenter.test(o)?a.align.push("center"):this.rules.other.tableAlignLeft.test(o)?a.align.push("left"):a.align.push(null);for(let o=0;o<n.length;o++)a.header.push({text:n[o],tokens:this.lexer.inline(n[o]),header:!0,align:a.align[o]});for(let o of i)a.rows.push(rr(o,a.header.length).map((r,c)=>({text:r,tokens:this.lexer.inline(r),header:!1,align:a.align[c]})));return a}}lheading(e){let t=this.rules.block.lheading.exec(e);if(t)return{type:"heading",raw:t[0],depth:t[2].charAt(0)==="="?1:2,text:t[1],tokens:this.lexer.inline(t[1])}}paragraph(e){let t=this.rules.block.paragraph.exec(e);if(t){let n=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:"paragraph",raw:t[0],text:n,tokens:this.lexer.inline(n)}}}text(e){let t=this.rules.block.text.exec(e);if(t)return{type:"text",raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){let t=this.rules.inline.escape.exec(e);if(t)return{type:"escape",raw:t[0],text:t[1]}}tag(e){let t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&this.rules.other.startATag.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){let t=this.rules.inline.link.exec(e);if(t){let n=t[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(n)){if(!this.rules.other.endAngleBracket.test(n))return;let a=hn(n.slice(0,-1),"\\");if((n.length-a.length)%2===0)return}else{let a=om(t[2],"()");if(a===-2)return;if(a>-1){let o=(t[0].indexOf("!")===0?5:4)+t[1].length+a;t[2]=t[2].substring(0,a),t[0]=t[0].substring(0,o).trim(),t[3]=""}}let s=t[2],i="";if(this.options.pedantic){let a=this.rules.other.pedanticHrefTitle.exec(s);a&&(s=a[1],i=a[3])}else i=t[3]?t[3].slice(1,-1):"";return s=s.trim(),this.rules.other.startAngleBracket.test(s)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(n)?s=s.slice(1):s=s.slice(1,-1)),lr(t,{href:s&&s.replace(this.rules.inline.anyPunctuation,"$1"),title:i&&i.replace(this.rules.inline.anyPunctuation,"$1")},t[0],this.lexer,this.rules)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){let s=(n[2]||n[1]).replace(this.rules.other.multipleSpaceGlobal," "),i=t[s.toLowerCase()];if(!i){let a=n[0].charAt(0);return{type:"text",raw:a,text:a}}return lr(n,i,n[0],this.lexer,this.rules)}}emStrong(e,t,n=""){let s=this.rules.inline.emStrongLDelim.exec(e);if(!(!s||s[3]&&n.match(this.rules.other.unicodeAlphaNumeric))&&(!(s[1]||s[2])||!n||this.rules.inline.punctuation.exec(n))){let i=[...s[0]].length-1,a,o,r=i,c=0,d=s[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(d.lastIndex=0,t=t.slice(-1*e.length+i);(s=d.exec(t))!=null;){if(a=s[1]||s[2]||s[3]||s[4]||s[5]||s[6],!a)continue;if(o=[...a].length,s[3]||s[4]){r+=o;continue}else if((s[5]||s[6])&&i%3&&!((i+o)%3)){c+=o;continue}if(r-=o,r>0)continue;o=Math.min(o,o+r+c);let g=[...s[0]][0].length,p=e.slice(0,i+s.index+g+o);if(Math.min(i,o)%2){let u=p.slice(1,-1);return{type:"em",raw:p,text:u,tokens:this.lexer.inlineTokens(u)}}let h=p.slice(2,-2);return{type:"strong",raw:p,text:h,tokens:this.lexer.inlineTokens(h)}}}}codespan(e){let t=this.rules.inline.code.exec(e);if(t){let n=t[2].replace(this.rules.other.newLineCharGlobal," "),s=this.rules.other.nonSpaceChar.test(n),i=this.rules.other.startingSpaceChar.test(n)&&this.rules.other.endingSpaceChar.test(n);return s&&i&&(n=n.substring(1,n.length-1)),{type:"codespan",raw:t[0],text:n}}}br(e){let t=this.rules.inline.br.exec(e);if(t)return{type:"br",raw:t[0]}}del(e,t,n=""){let s=this.rules.inline.delLDelim.exec(e);if(s&&(!s[1]||!n||this.rules.inline.punctuation.exec(n))){let i=[...s[0]].length-1,a,o,r=i,c=this.rules.inline.delRDelim;for(c.lastIndex=0,t=t.slice(-1*e.length+i);(s=c.exec(t))!=null;){if(a=s[1]||s[2]||s[3]||s[4]||s[5]||s[6],!a||(o=[...a].length,o!==i))continue;if(s[3]||s[4]){r+=o;continue}if(r-=o,r>0)continue;o=Math.min(o,o+r);let d=[...s[0]][0].length,g=e.slice(0,i+s.index+d+o),p=g.slice(i,-i);return{type:"del",raw:g,text:p,tokens:this.lexer.inlineTokens(p)}}}}autolink(e){let t=this.rules.inline.autolink.exec(e);if(t){let n,s;return t[2]==="@"?(n=t[1],s="mailto:"+n):(n=t[1],s=n),{type:"link",raw:t[0],text:n,href:s,tokens:[{type:"text",raw:n,text:n}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let n,s;if(t[2]==="@")n=t[0],s="mailto:"+n;else{let i;do i=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??"";while(i!==t[0]);n=t[0],t[1]==="www."?s="http://"+t[0]:s=t[0]}return{type:"link",raw:t[0],text:n,href:s,tokens:[{type:"text",raw:n,text:n}]}}}inlineText(e){let t=this.rules.inline.text.exec(e);if(t){let n=this.lexer.state.inRawBlock;return{type:"text",raw:t[0],text:t[0],escaped:n}}}},De=class Fi{tokens;options;state;inlineQueue;tokenizer;constructor(t){this.tokens=[],this.tokens.links=Object.create(null),this.options=t||Ht,this.options.tokenizer=this.options.tokenizer||new ms,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let n={other:$e,block:Yn.normal,inline:fn.normal};this.options.pedantic?(n.block=Yn.pedantic,n.inline=fn.pedantic):this.options.gfm&&(n.block=Yn.gfm,this.options.breaks?n.inline=fn.breaks:n.inline=fn.gfm),this.tokenizer.rules=n}static get rules(){return{block:Yn,inline:fn}}static lex(t,n){return new Fi(n).lex(t)}static lexInline(t,n){return new Fi(n).inlineTokens(t)}lex(t){t=t.replace($e.carriageReturn,`
`),this.blockTokens(t,this.tokens);for(let n=0;n<this.inlineQueue.length;n++){let s=this.inlineQueue[n];this.inlineTokens(s.src,s.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(t,n=[],s=!1){for(this.options.pedantic&&(t=t.replace($e.tabCharGlobal,"    ").replace($e.spaceLine,""));t;){let i;if(this.options.extensions?.block?.some(o=>(i=o.call({lexer:this},t,n))?(t=t.substring(i.raw.length),n.push(i),!0):!1))continue;if(i=this.tokenizer.space(t)){t=t.substring(i.raw.length);let o=n.at(-1);i.raw.length===1&&o!==void 0?o.raw+=`
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
`+i.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=o.text):n.push(i);continue}if(t){let o="Infinite loop on byte: "+t.charCodeAt(0);if(this.options.silent){console.error(o);break}else throw new Error(o)}}return this.state.top=!0,n}inline(t,n=[]){return this.inlineQueue.push({src:t,tokens:n}),n}inlineTokens(t,n=[]){let s=t,i=null;if(this.tokens.links){let c=Object.keys(this.tokens.links);if(c.length>0)for(;(i=this.tokenizer.rules.inline.reflinkSearch.exec(s))!=null;)c.includes(i[0].slice(i[0].lastIndexOf("[")+1,-1))&&(s=s.slice(0,i.index)+"["+"a".repeat(i[0].length-2)+"]"+s.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(i=this.tokenizer.rules.inline.anyPunctuation.exec(s))!=null;)s=s.slice(0,i.index)+"++"+s.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);let a;for(;(i=this.tokenizer.rules.inline.blockSkip.exec(s))!=null;)a=i[2]?i[2].length:0,s=s.slice(0,i.index+a)+"["+"a".repeat(i[0].length-a-2)+"]"+s.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);s=this.options.hooks?.emStrongMask?.call({lexer:this},s)??s;let o=!1,r="";for(;t;){o||(r=""),o=!1;let c;if(this.options.extensions?.inline?.some(g=>(c=g.call({lexer:this},t,n))?(t=t.substring(c.raw.length),n.push(c),!0):!1))continue;if(c=this.tokenizer.escape(t)){t=t.substring(c.raw.length),n.push(c);continue}if(c=this.tokenizer.tag(t)){t=t.substring(c.raw.length),n.push(c);continue}if(c=this.tokenizer.link(t)){t=t.substring(c.raw.length),n.push(c);continue}if(c=this.tokenizer.reflink(t,this.tokens.links)){t=t.substring(c.raw.length);let g=n.at(-1);c.type==="text"&&g?.type==="text"?(g.raw+=c.raw,g.text+=c.text):n.push(c);continue}if(c=this.tokenizer.emStrong(t,s,r)){t=t.substring(c.raw.length),n.push(c);continue}if(c=this.tokenizer.codespan(t)){t=t.substring(c.raw.length),n.push(c);continue}if(c=this.tokenizer.br(t)){t=t.substring(c.raw.length),n.push(c);continue}if(c=this.tokenizer.del(t,s,r)){t=t.substring(c.raw.length),n.push(c);continue}if(c=this.tokenizer.autolink(t)){t=t.substring(c.raw.length),n.push(c);continue}if(!this.state.inLink&&(c=this.tokenizer.url(t))){t=t.substring(c.raw.length),n.push(c);continue}let d=t;if(this.options.extensions?.startInline){let g=1/0,p=t.slice(1),h;this.options.extensions.startInline.forEach(u=>{h=u.call({lexer:this},p),typeof h=="number"&&h>=0&&(g=Math.min(g,h))}),g<1/0&&g>=0&&(d=t.substring(0,g+1))}if(c=this.tokenizer.inlineText(d)){t=t.substring(c.raw.length),c.raw.slice(-1)!=="_"&&(r=c.raw.slice(-1)),o=!0;let g=n.at(-1);g?.type==="text"?(g.raw+=c.raw,g.text+=c.text):n.push(c);continue}if(t){let g="Infinite loop on byte: "+t.charCodeAt(0);if(this.options.silent){console.error(g);break}else throw new Error(g)}}return n}},bs=class{options;parser;constructor(e){this.options=e||Ht}space(e){return""}code({text:e,lang:t,escaped:n}){let s=(t||"").match($e.notSpaceStart)?.[0],i=e.replace($e.endingNewline,"")+`
`;return s?'<pre><code class="language-'+et(s)+'">'+(n?i:et(i,!0))+`</code></pre>
`:"<pre><code>"+(n?i:et(i,!0))+`</code></pre>
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
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${et(e,!0)}</code>`}br(e){return"<br>"}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,tokens:n}){let s=this.parser.parseInline(n),i=or(e);if(i===null)return s;e=i;let a='<a href="'+e+'"';return t&&(a+=' title="'+et(t)+'"'),a+=">"+s+"</a>",a}image({href:e,title:t,text:n,tokens:s}){s&&(n=this.parser.parseInline(s,this.parser.textRenderer));let i=or(e);if(i===null)return et(n);e=i;let a=`<img src="${e}" alt="${n}"`;return t&&(a+=` title="${et(t)}"`),a+=">",a}text(e){return"tokens"in e&&e.tokens?this.parser.parseInline(e.tokens):"escaped"in e&&e.escaped?e.text:et(e.text)}},La=class{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return""+e}image({text:e}){return""+e}br(){return""}checkbox({raw:e}){return e}},Fe=class Ni{options;renderer;textRenderer;constructor(t){this.options=t||Ht,this.options.renderer=this.options.renderer||new bs,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new La}static parse(t,n){return new Ni(n).parse(t)}static parseInline(t,n){return new Ni(n).parseInline(t)}parse(t){let n="";for(let s=0;s<t.length;s++){let i=t[s];if(this.options.extensions?.renderers?.[i.type]){let o=i,r=this.options.extensions.renderers[o.type].call({parser:this},o);if(r!==!1||!["space","hr","heading","code","table","blockquote","list","html","def","paragraph","text"].includes(o.type)){n+=r||"";continue}}let a=i;switch(a.type){case"space":{n+=this.renderer.space(a);break}case"hr":{n+=this.renderer.hr(a);break}case"heading":{n+=this.renderer.heading(a);break}case"code":{n+=this.renderer.code(a);break}case"table":{n+=this.renderer.table(a);break}case"blockquote":{n+=this.renderer.blockquote(a);break}case"list":{n+=this.renderer.list(a);break}case"checkbox":{n+=this.renderer.checkbox(a);break}case"html":{n+=this.renderer.html(a);break}case"def":{n+=this.renderer.def(a);break}case"paragraph":{n+=this.renderer.paragraph(a);break}case"text":{n+=this.renderer.text(a);break}default:{let o='Token with "'+a.type+'" type was not found.';if(this.options.silent)return console.error(o),"";throw new Error(o)}}}return n}parseInline(t,n=this.renderer){let s="";for(let i=0;i<t.length;i++){let a=t[i];if(this.options.extensions?.renderers?.[a.type]){let r=this.options.extensions.renderers[a.type].call({parser:this},a);if(r!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(a.type)){s+=r||"";continue}}let o=a;switch(o.type){case"escape":{s+=n.text(o);break}case"html":{s+=n.html(o);break}case"link":{s+=n.link(o);break}case"image":{s+=n.image(o);break}case"checkbox":{s+=n.checkbox(o);break}case"strong":{s+=n.strong(o);break}case"em":{s+=n.em(o);break}case"codespan":{s+=n.codespan(o);break}case"br":{s+=n.br(o);break}case"del":{s+=n.del(o);break}case"text":{s+=n.text(o);break}default:{let r='Token with "'+o.type+'" type was not found.';if(this.options.silent)return console.error(r),"";throw new Error(r)}}}return s}},mn=class{options;block;constructor(e){this.options=e||Ht}static passThroughHooks=new Set(["preprocess","postprocess","processAllTokens","emStrongMask"]);static passThroughHooksRespectAsync=new Set(["preprocess","postprocess","processAllTokens"]);preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}emStrongMask(e){return e}provideLexer(){return this.block?De.lex:De.lexInline}provideParser(){return this.block?Fe.parse:Fe.parseInline}},cm=class{defaults=wa();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=Fe;Renderer=bs;TextRenderer=La;Lexer=De;Tokenizer=ms;Hooks=mn;constructor(...e){this.use(...e)}walkTokens(e,t){let n=[];for(let s of e)switch(n=n.concat(t.call(this,s)),s.type){case"table":{let i=s;for(let a of i.header)n=n.concat(this.walkTokens(a.tokens,t));for(let a of i.rows)for(let o of a)n=n.concat(this.walkTokens(o.tokens,t));break}case"list":{let i=s;n=n.concat(this.walkTokens(i.items,t));break}default:{let i=s;this.defaults.extensions?.childTokens?.[i.type]?this.defaults.extensions.childTokens[i.type].forEach(a=>{let o=i[a].flat(1/0);n=n.concat(this.walkTokens(o,t))}):i.tokens&&(n=n.concat(this.walkTokens(i.tokens,t)))}}return n}use(...e){let t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(n=>{let s={...n};if(s.async=this.defaults.async||s.async||!1,n.extensions&&(n.extensions.forEach(i=>{if(!i.name)throw new Error("extension name required");if("renderer"in i){let a=t.renderers[i.name];a?t.renderers[i.name]=function(...o){let r=i.renderer.apply(this,o);return r===!1&&(r=a.apply(this,o)),r}:t.renderers[i.name]=i.renderer}if("tokenizer"in i){if(!i.level||i.level!=="block"&&i.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let a=t[i.level];a?a.unshift(i.tokenizer):t[i.level]=[i.tokenizer],i.start&&(i.level==="block"?t.startBlock?t.startBlock.push(i.start):t.startBlock=[i.start]:i.level==="inline"&&(t.startInline?t.startInline.push(i.start):t.startInline=[i.start]))}"childTokens"in i&&i.childTokens&&(t.childTokens[i.name]=i.childTokens)}),s.extensions=t),n.renderer){let i=this.defaults.renderer||new bs(this.defaults);for(let a in n.renderer){if(!(a in i))throw new Error(`renderer '${a}' does not exist`);if(["options","parser"].includes(a))continue;let o=a,r=n.renderer[o],c=i[o];i[o]=(...d)=>{let g=r.apply(i,d);return g===!1&&(g=c.apply(i,d)),g||""}}s.renderer=i}if(n.tokenizer){let i=this.defaults.tokenizer||new ms(this.defaults);for(let a in n.tokenizer){if(!(a in i))throw new Error(`tokenizer '${a}' does not exist`);if(["options","rules","lexer"].includes(a))continue;let o=a,r=n.tokenizer[o],c=i[o];i[o]=(...d)=>{let g=r.apply(i,d);return g===!1&&(g=c.apply(i,d)),g}}s.tokenizer=i}if(n.hooks){let i=this.defaults.hooks||new mn;for(let a in n.hooks){if(!(a in i))throw new Error(`hook '${a}' does not exist`);if(["options","block"].includes(a))continue;let o=a,r=n.hooks[o],c=i[o];mn.passThroughHooks.has(a)?i[o]=d=>{if(this.defaults.async&&mn.passThroughHooksRespectAsync.has(a))return(async()=>{let p=await r.call(i,d);return c.call(i,p)})();let g=r.call(i,d);return c.call(i,g)}:i[o]=(...d)=>{if(this.defaults.async)return(async()=>{let p=await r.apply(i,d);return p===!1&&(p=await c.apply(i,d)),p})();let g=r.apply(i,d);return g===!1&&(g=c.apply(i,d)),g}}s.hooks=i}if(n.walkTokens){let i=this.defaults.walkTokens,a=n.walkTokens;s.walkTokens=function(o){let r=[];return r.push(a.call(this,o)),i&&(r=r.concat(i.call(this,o))),r}}this.defaults={...this.defaults,...s}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return De.lex(e,t??this.defaults)}parser(e,t){return Fe.parse(e,t??this.defaults)}parseMarkdown(e){return(t,n)=>{let s={...n},i={...this.defaults,...s},a=this.onError(!!i.silent,!!i.async);if(this.defaults.async===!0&&s.async===!1)return a(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof t>"u"||t===null)return a(new Error("marked(): input parameter is undefined or null"));if(typeof t!="string")return a(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(t)+", string expected"));if(i.hooks&&(i.hooks.options=i,i.hooks.block=e),i.async)return(async()=>{let o=i.hooks?await i.hooks.preprocess(t):t,r=await(i.hooks?await i.hooks.provideLexer():e?De.lex:De.lexInline)(o,i),c=i.hooks?await i.hooks.processAllTokens(r):r;i.walkTokens&&await Promise.all(this.walkTokens(c,i.walkTokens));let d=await(i.hooks?await i.hooks.provideParser():e?Fe.parse:Fe.parseInline)(c,i);return i.hooks?await i.hooks.postprocess(d):d})().catch(a);try{i.hooks&&(t=i.hooks.preprocess(t));let o=(i.hooks?i.hooks.provideLexer():e?De.lex:De.lexInline)(t,i);i.hooks&&(o=i.hooks.processAllTokens(o)),i.walkTokens&&this.walkTokens(o,i.walkTokens);let r=(i.hooks?i.hooks.provideParser():e?Fe.parse:Fe.parseInline)(o,i);return i.hooks&&(r=i.hooks.postprocess(r)),r}catch(o){return a(o)}}}onError(e,t){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,e){let s="<p>An error occurred:</p><pre>"+et(n.message+"",!0)+"</pre>";return t?Promise.resolve(s):s}if(t)return Promise.reject(n);throw n}}},zt=new cm;function Y(e,t){return zt.parse(e,t)}Y.options=Y.setOptions=function(e){return zt.setOptions(e),Y.defaults=zt.defaults,ic(Y.defaults),Y};Y.getDefaults=wa;Y.defaults=Ht;Y.use=function(...e){return zt.use(...e),Y.defaults=zt.defaults,ic(Y.defaults),Y};Y.walkTokens=function(e,t){return zt.walkTokens(e,t)};Y.parseInline=zt.parseInline;Y.Parser=Fe;Y.parser=Fe.parse;Y.Renderer=bs;Y.TextRenderer=La;Y.Lexer=De;Y.lexer=De.lex;Y.Tokenizer=ms;Y.Hooks=mn;Y.parse=Y;Y.options;Y.setOptions;Y.use;Y.walkTokens;Y.parseInline;Fe.parse;De.lex;Y.setOptions({gfm:!0,breaks:!0});const dm=["a","b","blockquote","br","code","del","div","em","h1","h2","h3","h4","hr","i","iframe","li","ol","p","pre","span","strong","table","tbody","td","th","thead","tr","ul","img"],um=["class","href","rel","target","title","start","src","alt","style","width","height","frameborder","sandbox","loading"],cr={ALLOWED_TAGS:dm,ALLOWED_ATTR:um,ADD_DATA_URI_TAGS:["img"]};let dr=!1;const gm=14e4,pm=4e4,fm=200,pi=5e4,Pt=new Map;function hm(e){const t=Pt.get(e);return t===void 0?null:(Pt.delete(e),Pt.set(e,t),t)}function ur(e,t){if(Pt.set(e,t),Pt.size<=fm)return;const n=Pt.keys().next().value;n&&Pt.delete(n)}const vc="/__openclaw__/canvas/";function vm(){dr||(dr=!0,Pi.addHook("afterSanitizeAttributes",e=>{if(e instanceof HTMLAnchorElement){if(!e.getAttribute("href"))return;e.setAttribute("rel","noreferrer noopener"),e.setAttribute("target","_blank")}if(e instanceof HTMLIFrameElement){if(!(e.getAttribute("src")||"").startsWith(vc)){e.remove();return}e.setAttribute("sandbox","allow-scripts allow-same-origin"),e.setAttribute("loading","lazy"),e.classList.contains("canvas-embed")||e.classList.add("canvas-embed")}}))}function Oi(e){const t=e.trim();if(!t)return"";if(vm(),t.length<=pi){const o=hm(t);if(o!==null)return o}const n=Qr(t,gm),s=n.truncated?`

… truncated (${n.total} chars, showing first ${n.text.length}).`:"";if(n.text.length>pm){const r=`<pre class="code-block">${It(`${n.text}${s}`)}</pre>`,c=Pi.sanitize(r,cr);return t.length<=pi&&ur(t,c),c}const i=Y.parse(`${n.text}${s}`,{renderer:Ma}),a=Pi.sanitize(i,cr);return t.length<=pi&&ur(t,a),a}const Ma=new Y.Renderer;Ma.html=({text:e})=>e.match(/<iframe\s[^>]*src=["'](\/__openclaw__\/canvas\/[^"']+)["'][^>]*>/i)?e:It(e);Ma.image=({href:e,title:t,text:n})=>{if(e&&e.startsWith(vc)){const i=n||t||"Canvas Page";return`<div class="canvas-embed-wrapper"><iframe class="canvas-embed" src="${It(e)}" frameborder="0" loading="lazy" sandbox="allow-scripts allow-same-origin"></iframe><div class="canvas-embed-label">${It(i)}</div></div>`}const s=t?` title="${It(t)}"`:"";return`<img src="${It(e)}" alt="${It(n)}"${s} />`};function It(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}const mm=new RegExp("\\p{Script=Hebrew}|\\p{Script=Arabic}|\\p{Script=Syriac}|\\p{Script=Thaana}|\\p{Script=Nko}|\\p{Script=Samaritan}|\\p{Script=Mandaic}|\\p{Script=Adlam}|\\p{Script=Phoenician}|\\p{Script=Lydian}","u");function mc(e,t=/[\s\p{P}\p{S}]/u){if(!e)return"ltr";for(const n of e)if(!t.test(n))return mm.test(n)?"rtl":"ltr";return"ltr"}const bm=1500,ym=2e3,bc="Copy as markdown",xm="Copied",$m="Copy failed";async function wm(e){if(!e)return!1;try{return await navigator.clipboard.writeText(e),!0}catch{return!1}}function Zn(e,t){e.title=t,e.setAttribute("aria-label",t)}function km(e){const t=e.label??bc;return l`
    <button
      class="chat-copy-btn"
      type="button"
      title=${t}
      aria-label=${t}
      @click=${async n=>{const s=n.currentTarget;if(!s||s.dataset.copying==="1")return;s.dataset.copying="1",s.setAttribute("aria-busy","true"),s.disabled=!0;const i=await wm(e.text());if(s.isConnected){if(delete s.dataset.copying,s.removeAttribute("aria-busy"),s.disabled=!1,!i){s.dataset.error="1",Zn(s,$m),window.setTimeout(()=>{s.isConnected&&(delete s.dataset.error,Zn(s,t))},ym);return}s.dataset.copied="1",Zn(s,xm),window.setTimeout(()=>{s.isConnected&&(delete s.dataset.copied,Zn(s,t))},bm)}}}
    >
      <span class="chat-copy-btn__icon" aria-hidden="true">
        <span class="chat-copy-btn__icon-copy">${me.copy}</span>
        <span class="chat-copy-btn__icon-check">${me.check}</span>
      </span>
    </button>
  `}function Sm(e){return km({text:()=>e,label:bc})}function yc(e){const t=e;let n=typeof t.role=="string"?t.role:"unknown";const s=typeof t.toolCallId=="string"||typeof t.tool_call_id=="string",i=t.content,a=Array.isArray(i)?i:null,o=Array.isArray(a)&&a.some(p=>{const h=p,u=(typeof h.type=="string"?h.type:"").toLowerCase();return u==="toolresult"||u==="tool_result"}),r=typeof t.toolName=="string"||typeof t.tool_name=="string";(s||o||r)&&(n="toolResult");let c=[];typeof t.content=="string"?c=[{type:"text",text:t.content}]:Array.isArray(t.content)?c=t.content.map(p=>({type:p.type||"text",text:p.text,name:p.name,args:p.args||p.arguments})):typeof t.text=="string"&&(c=[{type:"text",text:t.text}]);const d=typeof t.timestamp=="number"?t.timestamp:Date.now(),g=typeof t.id=="string"?t.id:void 0;return{role:n,content:c,timestamp:d,id:g}}function Ia(e){const t=e.toLowerCase();return e==="user"||e==="User"?e:e==="assistant"?"assistant":e==="system"?"system":t==="toolresult"||t==="tool_result"||t==="tool"||t==="function"?"tool":e}function xc(e){const t=e,n=typeof t.role=="string"?t.role.toLowerCase():"";return n==="toolresult"||n==="tool_result"}function sn(e){return e&&typeof e=="object"?e:void 0}function Am(e){return(e??"tool").trim()}function Cm(e){const t=e.replace(/_/g," ").trim();return t?t.split(/\s+/).map(n=>n.length<=2&&n.toUpperCase()===n?n:`${n.at(0)?.toUpperCase()??""}${n.slice(1)}`).join(" "):"Tool"}function Tm(e){const t=e?.trim();if(t)return t.replace(/_/g," ")}function $c(e,t={}){const n=t.maxStringChars??160,s=t.maxArrayEntries??3;if(e!=null){if(typeof e=="string"){const i=e.trim();if(!i)return;const a=i.split(/\r?\n/)[0]?.trim()??"";return a?a.length>n?`${a.slice(0,Math.max(0,n-3))}…`:a:void 0}if(typeof e=="boolean")return!e&&!t.includeFalse?void 0:e?"true":"false";if(typeof e=="number")return Number.isFinite(e)?e===0&&!t.includeZero?void 0:String(e):t.includeNonFinite?String(e):void 0;if(Array.isArray(e)){const i=e.map(o=>$c(o,t)).filter(o=>!!o);if(i.length===0)return;const a=i.slice(0,s).join(", ");return i.length>s?`${a}…`:a}}}function _m(e,t){if(!e||typeof e!="object")return;let n=e;for(const s of t.split(".")){if(!s||!n||typeof n!="object")return;n=n[s]}return n}function wc(e){const t=sn(e);if(t)for(const n of[t.path,t.file_path,t.filePath]){if(typeof n!="string")continue;const s=n.trim();if(s)return s}}function Em(e){const t=sn(e);if(!t)return;const n=wc(t);if(!n)return;const s=typeof t.offset=="number"&&Number.isFinite(t.offset)?Math.floor(t.offset):void 0,i=typeof t.limit=="number"&&Number.isFinite(t.limit)?Math.floor(t.limit):void 0,a=s!==void 0?Math.max(1,s):void 0,o=i!==void 0?Math.max(1,i):void 0;return a!==void 0&&o!==void 0?`${o===1?"line":"lines"} ${a}-${a+o-1} from ${n}`:a!==void 0?`from line ${a} in ${n}`:o!==void 0?`first ${o} ${o===1?"line":"lines"} of ${n}`:`from ${n}`}function Lm(e,t){const n=sn(t);if(!n)return;const s=wc(n)??(typeof n.url=="string"?n.url.trim():void 0);if(!s)return;if(e==="attach")return`from ${s}`;const i=e==="edit"?"in":"to",a=typeof n.content=="string"?n.content:typeof n.newText=="string"?n.newText:typeof n.new_string=="string"?n.new_string:void 0;return a&&a.length>0?`${i} ${s} (${a.length} chars)`:`${i} ${s}`}function Mm(e){const t=sn(e);if(!t)return;const n=typeof t.query=="string"?t.query.trim():void 0,s=typeof t.count=="number"&&Number.isFinite(t.count)&&t.count>0?Math.floor(t.count):void 0;if(n)return s!==void 0?`for "${n}" (top ${s})`:`for "${n}"`}function Im(e){const t=sn(e);if(!t)return;const n=typeof t.url=="string"?t.url.trim():void 0;if(!n)return;const s=typeof t.extractMode=="string"?t.extractMode.trim():void 0,i=typeof t.maxChars=="number"&&Number.isFinite(t.maxChars)&&t.maxChars>0?Math.floor(t.maxChars):void 0,a=[s?`mode ${s}`:void 0,i!==void 0?`max ${i} chars`:void 0].filter(o=>!!o).join(", ");return a?`from ${n} (${a})`:`from ${n}`}function Ra(e){if(!e)return e;const t=e.trim();return t.length>=2&&(t.startsWith('"')&&t.endsWith('"')||t.startsWith("'")&&t.endsWith("'"))?t.slice(1,-1).trim():t}function bn(e,t=48){if(!e)return[];const n=[];let s="",i,a=!1;for(let o=0;o<e.length;o+=1){const r=e[o];if(a){s+=r,a=!1;continue}if(r==="\\"){a=!0;continue}if(i){r===i?i=void 0:s+=r;continue}if(r==='"'||r==="'"){i=r;continue}if(/\s/.test(r)){if(!s)continue;if(n.push(s),n.length>=t)return n;s="";continue}s+=r}return s&&n.push(s),n}function Pa(e){if(!e)return;const t=Ra(e)??e;return(t.split(/[/]/).at(-1)??t).trim().toLowerCase()}function At(e,t){const n=new Set(t);for(let s=0;s<e.length;s+=1){const i=e[s];if(i){if(n.has(i)){const a=e[s+1];if(a&&!a.startsWith("-"))return a;continue}for(const a of t)if(a.startsWith("--")&&i.startsWith(`${a}=`))return i.slice(a.length+1)}}}function Qt(e,t=1,n=[]){const s=[],i=new Set(n);for(let a=t;a<e.length;a+=1){const o=e[a];if(o){if(o==="--"){for(let r=a+1;r<e.length;r+=1){const c=e[r];c&&s.push(c)}break}if(o.startsWith("--")){if(o.includes("="))continue;i.has(o)&&(a+=1);continue}if(o.startsWith("-")){i.has(o)&&(a+=1);continue}s.push(o)}}return s}function Je(e,t=1,n=[]){return Qt(e,t,n)[0]}function Xn(e){if(e.length===0)return e;let t=0;if(Pa(e[0])==="env"){for(t=1;t<e.length;){const n=e[t];if(!n)break;if(n.startsWith("-")){t+=1;continue}if(/^[A-Za-z_][A-Za-z0-9_]*=/.test(n)){t+=1;continue}break}return e.slice(t)}for(;t<e.length&&/^[A-Za-z_][A-Za-z0-9_]*=/.test(e[t]);)t+=1;return e.slice(t)}function Rm(e){const t=bn(e,10);if(t.length<3)return e;const n=Pa(t[0]);if(!(n==="bash"||n==="sh"||n==="zsh"||n==="fish"))return e;const s=t.findIndex((a,o)=>o>0&&(a==="-c"||a==="-lc"||a==="-ic"));if(s===-1)return e;const i=t.slice(s+1).join(" ").trim();return i?Ra(i)??e:e}function kc(e,t){let n,s=!1;for(let i=0;i<e.length;i+=1){const a=e[i];if(s){s=!1;continue}if(a==="\\"){s=!0;continue}if(n){a===n&&(n=void 0);continue}if(a==='"'||a==="'"){n=a;continue}if(t(a,i)===!1)return}}function Pm(e){let t=-1;return kc(e,(n,s)=>n===";"||(n==="&"||n==="|")&&e[s+1]===n?(t=s,!1):!0),t>=0?e.slice(0,t):e}function Dm(e){const t=[];let n=0;return kc(e,(s,i)=>(s==="|"&&e[i-1]!=="|"&&e[i+1]!=="|"&&(t.push(e.slice(n,i)),n=i+1),!0)),t.push(e.slice(n)),t.map(s=>s.trim()).filter(s=>s.length>0)}function Fm(e){let t=e.trim();for(let n=0;n<4;n+=1){const s=t.indexOf("&&"),i=t.indexOf(";"),a=t.indexOf(`
`),r=[{index:s,length:2},{index:i,length:1},{index:a,length:1}].filter(g=>g.index>=0).toSorted((g,p)=>g.index-p.index)[0],c=(r?t.slice(0,r.index):t).trim();if(!(c.startsWith("set ")||c.startsWith("export ")||c.startsWith("unset "))||(t=r?t.slice(r.index+r.length).trimStart():"",!t))break}return t.trim()}function Jn(e){if(e.length===0)return"run command";const t=Pa(e[0])??"command";if(t==="git"){const s=new Set(["-C","-c","--git-dir","--work-tree","--namespace","--config-env"]),i=At(e,["-C"]);let a;for(let r=1;r<e.length;r+=1){const c=e[r];if(c){if(c==="--"){a=Je(e,r+1);break}if(c.startsWith("--")){if(c.includes("="))continue;s.has(c)&&(r+=1);continue}if(c.startsWith("-")){s.has(c)&&(r+=1);continue}a=c;break}}const o={status:"check git status",diff:"check git diff",log:"view git history",show:"show git object",branch:"list git branches",checkout:"switch git branch",switch:"switch git branch",commit:"create git commit",pull:"pull git changes",push:"push git changes",fetch:"fetch git changes",merge:"merge git changes",rebase:"rebase git branch",add:"stage git changes",restore:"restore git files",reset:"reset git state",stash:"stash git changes"};return a&&o[a]?o[a]:!a||a.startsWith("/")||a.startsWith("~")||a.includes("/")?i?`run git command in ${i}`:"run git command":`run git ${a}`}if(t==="grep"||t==="rg"||t==="ripgrep"){const s=Qt(e,1,["-e","--regexp","-f","--file","-m","--max-count","-A","--after-context","-B","--before-context","-C","--context"]),i=At(e,["-e","--regexp"])??s[0],a=s.length>1?s.at(-1):void 0;return i?a?`search "${i}" in ${a}`:`search "${i}"`:"search text"}if(t==="find"){const s=e[1]&&!e[1].startsWith("-")?e[1]:".",i=At(e,["-name","-iname"]);return i?`find files named "${i}" in ${s}`:`find files in ${s}`}if(t==="ls"){const s=Je(e,1);return s?`list files in ${s}`:"list files"}if(t==="head"||t==="tail"){const s=At(e,["-n","--lines"])??e.slice(1).find(c=>/^-\d+$/.test(c))?.slice(1),i=Qt(e,1,["-n","--lines"]);let a=i.at(-1);a&&/^\d+$/.test(a)&&i.length===1&&(a=void 0);const o=t==="head"?"first":"last",r=s==="1"?"line":"lines";return s&&a?`show ${o} ${s} ${r} of ${a}`:s?`show ${o} ${s} ${r}`:a?`show ${a}`:`show ${t} output`}if(t==="cat"){const s=Je(e,1);return s?`show ${s}`:"show output"}if(t==="sed"){const s=At(e,["-e","--expression"]),i=Qt(e,1,["-e","--expression","-f","--file"]),a=s??i[0],o=s?i[0]:i[1];if(a){const r=(Ra(a)??a).replace(/\s+/g,""),c=r.match(/^([0-9]+),([0-9]+)p$/);if(c)return o?`print lines ${c[1]}-${c[2]} from ${o}`:`print lines ${c[1]}-${c[2]}`;const d=r.match(/^([0-9]+)p$/);if(d)return o?`print line ${d[1]} from ${o}`:`print line ${d[1]}`}return o?`run sed on ${o}`:"run sed transform"}if(t==="printf"||t==="echo")return"print text";if(t==="cp"||t==="mv"){const s=Qt(e,1,["-t","--target-directory","-S","--suffix"]),i=s[0],a=s[1],o=t==="cp"?"copy":"move";return i&&a?`${o} ${i} to ${a}`:i?`${o} ${i}`:`${o} files`}if(t==="rm"){const s=Je(e,1);return s?`remove ${s}`:"remove files"}if(t==="mkdir"){const s=Je(e,1);return s?`create folder ${s}`:"create folder"}if(t==="touch"){const s=Je(e,1);return s?`create file ${s}`:"create file"}if(t==="curl"||t==="wget"){const s=e.find(i=>/^https?:\/\//i.test(i));return s?`fetch ${s}`:"fetch url"}if(t==="npm"||t==="pnpm"||t==="yarn"||t==="bun"){const s=Qt(e,1,["--prefix","-C","--cwd","--config"]),i=s[0]??"command";return{install:"install dependencies",test:"run tests",build:"run build",start:"start app",lint:"run lint",run:s[1]?`run ${s[1]}`:"run script"}[i]??`run ${t} ${i}`}if(t==="node"||t==="python"||t==="python3"||t==="ruby"||t==="php"){if(e.slice(1).find(c=>c.startsWith("<<")))return`run ${t} inline script (heredoc)`;if((t==="node"?At(e,["-e","--eval"]):t==="python"||t==="python3"?At(e,["-c"]):void 0)!==void 0)return`run ${t} inline script`;const r=Je(e,1,t==="node"?["-e","--eval","-m"]:["-c","-e","--eval","-m"]);return r?t==="node"?`${e.includes("--check")||e.includes("-c")?"check js syntax for":"run node script"} ${r}`:`run ${t} ${r}`:`run ${t}`}if(t==="openclaw"){const s=Je(e,1);return s?`run openclaw ${s}`:"run openclaw"}const n=Je(e,1);return!n||n.length>48?`run ${t}`:/^[A-Za-z0-9._/-]+$/.test(n)?`run ${t} ${n}`:`run ${t}`}function gr(e){const t=Fm(e),n=Pm(t).trim();if(!n)return t?Jn(Xn(bn(t))):void 0;const s=Dm(n);if(s.length>1){const i=Jn(Xn(bn(s[0]))),a=Jn(Xn(bn(s[s.length-1]))),o=s.length>2?` (+${s.length-2} steps)`:"";return`${i} -> ${a}${o}`}return Jn(Xn(bn(n)))}function Nm(e){const t=sn(e);if(!t)return;const n=typeof t.command=="string"?t.command.trim():void 0;if(!n)return;const s=Rm(n),i=gr(s)??gr(n)??"run command",o=(typeof t.workdir=="string"?t.workdir:typeof t.cwd=="string"?t.cwd:void 0)?.trim();return o?`${i} (in ${o})`:i}function Om(e,t){if(!(!e||!t))return e.actions?.[t]??void 0}function Bm(e,t,n){{for(const s of t){const i=_m(e,s),a=$c(i,n.coerce);if(a)return a}return}}const zm={icon:"puzzle",detailKeys:["command","path","url","targetUrl","targetId","ref","element","node","nodeId","id","requestId","to","channelId","guildId","userId","name","query","pattern","messageId"]},Um={bash:{icon:"wrench",title:"Bash",detailKeys:["command"]},process:{icon:"wrench",title:"Process",detailKeys:["sessionId"]},read:{icon:"fileText",title:"Read",detailKeys:["path"]},write:{icon:"edit",title:"Write",detailKeys:["path"]},edit:{icon:"penLine",title:"Edit",detailKeys:["path"]},attach:{icon:"paperclip",title:"Attach",detailKeys:["path","url","fileName"]},browser:{icon:"globe",title:"Browser",actions:{status:{label:"status"},start:{label:"start"},stop:{label:"stop"},tabs:{label:"tabs"},open:{label:"open",detailKeys:["targetUrl"]},focus:{label:"focus",detailKeys:["targetId"]},close:{label:"close",detailKeys:["targetId"]},snapshot:{label:"snapshot",detailKeys:["targetUrl","targetId","ref","element","format"]},screenshot:{label:"screenshot",detailKeys:["targetUrl","targetId","ref","element"]},navigate:{label:"navigate",detailKeys:["targetUrl","targetId"]},console:{label:"console",detailKeys:["level","targetId"]},pdf:{label:"pdf",detailKeys:["targetId"]},upload:{label:"upload",detailKeys:["paths","ref","inputRef","element","targetId"]},dialog:{label:"dialog",detailKeys:["accept","promptText","targetId"]},act:{label:"act",detailKeys:["request.kind","request.ref","request.selector","request.text","request.value"]}}},canvas:{icon:"image",title:"Canvas",actions:{present:{label:"present",detailKeys:["target","node","nodeId"]},hide:{label:"hide",detailKeys:["node","nodeId"]},navigate:{label:"navigate",detailKeys:["url","node","nodeId"]},eval:{label:"eval",detailKeys:["javaScript","node","nodeId"]},snapshot:{label:"snapshot",detailKeys:["format","node","nodeId"]},a2ui_push:{label:"A2UI push",detailKeys:["jsonlPath","node","nodeId"]},a2ui_reset:{label:"A2UI reset",detailKeys:["node","nodeId"]}}},nodes:{icon:"smartphone",title:"Nodes",actions:{status:{label:"status"},describe:{label:"describe",detailKeys:["node","nodeId"]},pending:{label:"pending"},approve:{label:"approve",detailKeys:["requestId"]},reject:{label:"reject",detailKeys:["requestId"]},notify:{label:"notify",detailKeys:["node","nodeId","title","body"]},camera_snap:{label:"camera snap",detailKeys:["node","nodeId","facing","deviceId"]},camera_list:{label:"camera list",detailKeys:["node","nodeId"]},camera_clip:{label:"camera clip",detailKeys:["node","nodeId","facing","duration","durationMs"]},screen_record:{label:"screen record",detailKeys:["node","nodeId","duration","durationMs","fps","screenIndex"]}}},cron:{icon:"loader",title:"Cron",actions:{status:{label:"status"},list:{label:"list"},add:{label:"add",detailKeys:["job.name","job.id","job.schedule","job.cron"]},update:{label:"update",detailKeys:["id"]},remove:{label:"remove",detailKeys:["id"]},run:{label:"run",detailKeys:["id"]},runs:{label:"runs",detailKeys:["id"]},wake:{label:"wake",detailKeys:["text","mode"]}}},gateway:{icon:"plug",title:"Gateway",actions:{restart:{label:"restart",detailKeys:["reason","delayMs"]},"config.get":{label:"config get"},"config.schema":{label:"config schema"},"config.apply":{label:"config apply",detailKeys:["restartDelayMs"]},"update.run":{label:"update run",detailKeys:["restartDelayMs"]}}},whatsapp_login:{icon:"circle",title:"WhatsApp Login",actions:{start:{label:"start"},wait:{label:"wait"}}},discord:{icon:"messageSquare",title:"Discord",actions:{react:{label:"react",detailKeys:["channelId","messageId","emoji"]},reactions:{label:"reactions",detailKeys:["channelId","messageId"]},sticker:{label:"sticker",detailKeys:["to","stickerIds"]},poll:{label:"poll",detailKeys:["question","to"]},permissions:{label:"permissions",detailKeys:["channelId"]},readMessages:{label:"read messages",detailKeys:["channelId","limit"]},sendMessage:{label:"send",detailKeys:["to","content"]},editMessage:{label:"edit",detailKeys:["channelId","messageId"]},deleteMessage:{label:"delete",detailKeys:["channelId","messageId"]},threadCreate:{label:"thread create",detailKeys:["channelId","name"]},threadList:{label:"thread list",detailKeys:["guildId","channelId"]},threadReply:{label:"thread reply",detailKeys:["channelId","content"]},pinMessage:{label:"pin",detailKeys:["channelId","messageId"]},unpinMessage:{label:"unpin",detailKeys:["channelId","messageId"]},listPins:{label:"list pins",detailKeys:["channelId"]},searchMessages:{label:"search",detailKeys:["guildId","content"]},memberInfo:{label:"member",detailKeys:["guildId","userId"]},roleInfo:{label:"roles",detailKeys:["guildId"]},emojiList:{label:"emoji list",detailKeys:["guildId"]},roleAdd:{label:"role add",detailKeys:["guildId","userId","roleId"]},roleRemove:{label:"role remove",detailKeys:["guildId","userId","roleId"]},channelInfo:{label:"channel",detailKeys:["channelId"]},channelList:{label:"channels",detailKeys:["guildId"]},voiceStatus:{label:"voice",detailKeys:["guildId","userId"]},eventList:{label:"events",detailKeys:["guildId"]},eventCreate:{label:"event create",detailKeys:["guildId","name"]},timeout:{label:"timeout",detailKeys:["guildId","userId"]},kick:{label:"kick",detailKeys:["guildId","userId"]},ban:{label:"ban",detailKeys:["guildId","userId"]}}},slack:{icon:"messageSquare",title:"Slack",actions:{react:{label:"react",detailKeys:["channelId","messageId","emoji"]},reactions:{label:"reactions",detailKeys:["channelId","messageId"]},sendMessage:{label:"send",detailKeys:["to","content"]},editMessage:{label:"edit",detailKeys:["channelId","messageId"]},deleteMessage:{label:"delete",detailKeys:["channelId","messageId"]},readMessages:{label:"read messages",detailKeys:["channelId","limit"]},pinMessage:{label:"pin",detailKeys:["channelId","messageId"]},unpinMessage:{label:"unpin",detailKeys:["channelId","messageId"]},listPins:{label:"list pins",detailKeys:["channelId"]},memberInfo:{label:"member",detailKeys:["userId"]},emojiList:{label:"emoji list"}}}},Hm={fallback:zm,tools:Um},Sc=Hm,pr=Sc.fallback??{icon:"puzzle"},jm=Sc.tools??{};function Km(e){if(!e)return e;const t=[{re:/^\/Users\/[^/]+(\/|$)/,replacement:"~$1"},{re:/^\/home\/[^/]+(\/|$)/,replacement:"~$1"},{re:/^C:\\Users\\[^\\]+(\\|$)/i,replacement:"~$1"}];for(const n of t)if(n.re.test(e))return e.replace(n.re,n.replacement);return e}function Wm(e){const t=Am(e.name),n=t.toLowerCase(),s=jm[n],i=s?.icon??pr.icon??"puzzle",a=s?.title??Cm(t),o=s?.label??a,r=e.args&&typeof e.args=="object"?e.args.action:void 0,c=typeof r=="string"?r.trim():void 0,d=Om(s,c),g=n==="web_search"?"search":n==="web_fetch"?"fetch":n.replace(/_/g," ").replace(/\./g," "),p=Tm(d?.label??c??g);let h;n==="exec"&&(h=Nm(e.args)),!h&&n==="read"&&(h=Em(e.args)),!h&&(n==="write"||n==="edit"||n==="attach")&&(h=Lm(n,e.args)),!h&&n==="web_search"&&(h=Mm(e.args)),!h&&n==="web_fetch"&&(h=Im(e.args));const u=d?.detailKeys??s?.detailKeys??pr.detailKeys??[];return!h&&u.length>0&&(h=Bm(e.args,u,{coerce:{includeFalse:!0,includeZero:!0}})),!h&&e.meta&&(h=e.meta),h&&(h=Km(h)),{name:t,icon:i,title:a,label:o,verb:p,detail:h}}function qm(e){if(e.detail){if(e.detail.includes(" · ")){const t=e.detail.split(" · ").map(n=>n.trim()).filter(n=>n.length>0).join(", ");return t?`with ${t}`:void 0}return e.detail}}const Vm=80,Gm=2,fr=100;function Qm(e){const t=e.trim();if(t.startsWith("{")||t.startsWith("["))try{const n=JSON.parse(t);return"```json\n"+JSON.stringify(n,null,2)+"\n```"}catch{}return e}function Ym(e){const t=e.split(`
`),n=t.slice(0,Gm),s=n.join(`
`);return s.length>fr?s.slice(0,fr)+"…":n.length<t.length?s+"…":s}function Zm(e){const t=e,n=Xm(t.content),s=[];for(const i of n){const a=(typeof i.type=="string"?i.type:"").toLowerCase();(["toolcall","tool_call","tooluse","tool_use"].includes(a)||typeof i.name=="string"&&i.arguments!=null)&&s.push({kind:"call",name:i.name??"tool",args:Jm(i.arguments??i.args)})}for(const i of n){const a=(typeof i.type=="string"?i.type:"").toLowerCase();if(a!=="toolresult"&&a!=="tool_result")continue;const o=eb(i),r=typeof i.name=="string"?i.name:"tool";s.push({kind:"result",name:r,text:o})}if(xc(e)&&!s.some(i=>i.kind==="result")){const i=typeof t.toolName=="string"&&t.toolName||typeof t.tool_name=="string"&&t.tool_name||"tool",a=Sl(e)??void 0;s.push({kind:"result",name:i,text:a})}return s}function hr(e,t){const n=Wm({name:e.name,args:e.args}),s=qm(n),i=!!e.text?.trim(),a=!!t,o=a?()=>{if(i){t(Qm(e.text));return}const p=`## ${n.label}

${s?`**Command:** \`${s}\`

`:""}*No output — tool completed successfully.*`;t(p)}:void 0,r=i&&(e.text?.length??0)<=Vm,c=i&&!r,d=i&&r,g=!i;return l`
    <div
      class="chat-tool-card ${a?"chat-tool-card--clickable":""}"
      @click=${o}
      role=${a?"button":m}
      tabindex=${a?"0":m}
      @keydown=${a?p=>{p.key!=="Enter"&&p.key!==" "||(p.preventDefault(),o?.())}:m}
    >
      <div class="chat-tool-card__header">
        <div class="chat-tool-card__title">
          <span class="chat-tool-card__icon">${me[n.icon]}</span>
          <span>${n.label}</span>
        </div>
        ${a?l`<span class="chat-tool-card__action">${i?"View":""} ${me.check}</span>`:m}
        ${g&&!a?l`<span class="chat-tool-card__status">${me.check}</span>`:m}
      </div>
      ${s?l`<div class="chat-tool-card__detail">${s}</div>`:m}
      ${g?l`
              <div class="chat-tool-card__status-text muted">Completed</div>
            `:m}
      ${c?l`<div class="chat-tool-card__preview mono">${Ym(e.text)}</div>`:m}
      ${d?l`<div class="chat-tool-card__inline mono">${e.text}</div>`:m}
    </div>
  `}function Xm(e){return Array.isArray(e)?e.filter(Boolean):[]}function Jm(e){if(typeof e!="string")return e;const t=e.trim();if(!t||!t.startsWith("{")&&!t.startsWith("["))return e;try{return JSON.parse(t)}catch{return e}}function eb(e){if(typeof e.text=="string")return e.text;if(typeof e.content=="string")return e.content}function tb(e){const n=e.content,s=[];if(Array.isArray(n))for(const i of n){if(typeof i!="object"||i===null)continue;const a=i;if(a.type==="image"){const o=a.source;if(o?.type==="base64"&&typeof o.data=="string"){const r=o.data,c=o.media_type||"image/png",d=r.startsWith("data:")?r:`data:${c};base64,${r}`;s.push({url:d})}else typeof a.url=="string"&&s.push({url:a.url})}else if(a.type==="image_url"){const o=a.image_url;typeof o?.url=="string"&&s.push({url:o.url})}}return s}function nb(e){return l`
    <div class="chat-group assistant">
      ${Da("assistant",e)}
      <div class="chat-group-messages">
        <div class="chat-bubble chat-reading-indicator" aria-hidden="true">
          <span class="chat-reading-indicator__dots">
            <span></span><span></span><span></span>
          </span>
        </div>
      </div>
    </div>
  `}function sb(e,t,n,s){const i=new Date(t).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}),a=s?.name??"Assistant";return l`
    <div class="chat-group assistant">
      ${Da("assistant",s)}
      <div class="chat-group-messages">
        ${Ac({role:"assistant",content:[{type:"text",text:e}],timestamp:t},{isStreaming:!0,showReasoning:!1},n)}
        <div class="chat-group-footer">
          <span class="chat-sender-name">${a}</span>
          <span class="chat-group-timestamp">${i}</span>
        </div>
      </div>
    </div>
  `}function ib(e,t){const n=Ia(e.role),s=t.assistantName??"Assistant",i=n==="user"?"You":n==="assistant"?s:n,a=n==="user"?"user":n==="assistant"?"assistant":"other",o=new Date(e.timestamp).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});return l`
    <div class="chat-group ${a}">
      ${Da(e.role,{name:s,avatar:t.assistantAvatar??null})}
      <div class="chat-group-messages">
        ${e.messages.map((r,c)=>Ac(r.message,{isStreaming:e.isStreaming&&c===e.messages.length-1,showReasoning:t.showReasoning},t.onOpenSidebar))}
        <div class="chat-group-footer">
          <span class="chat-sender-name">${i}</span>
          <span class="chat-group-timestamp">${o}</span>
        </div>
      </div>
    </div>
  `}function Da(e,t){const n=Ia(e),s=t?.name?.trim()||"Assistant",i=t?.avatar?.trim()||"",a=n==="user"?"U":n==="assistant"?s.charAt(0).toUpperCase()||"A":n==="tool"?"⚙":"?",o=n==="user"?"user":n==="assistant"?"assistant":n==="tool"?"tool":"other";return i&&n==="assistant"?ab(i)?l`<img
        class="chat-avatar ${o}"
        src="${i}"
        alt="${s}"
      />`:l`<div class="chat-avatar ${o}">${i}</div>`:l`<div class="chat-avatar ${o}">${a}</div>`}function ab(e){return/^https?:\/\//i.test(e)||/^data:image\//i.test(e)||e.startsWith("/")}function ob(e){return e.length===0?m:l`
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
  `}function Ac(e,t,n){const s=e,i=typeof s.role=="string"?s.role:"unknown",a=xc(e)||i.toLowerCase()==="toolresult"||i.toLowerCase()==="tool_result"||typeof s.toolCallId=="string"||typeof s.tool_call_id=="string",o=Zm(e),r=o.length>0,c=tb(e),d=c.length>0,g=Sl(e),p=t.showReasoning&&i==="assistant"?Cg(e):null,h=g?.trim()?g:null,u=p?_g(p):null,f=h,v=i==="assistant"&&!!f?.trim(),$=["chat-bubble",v?"has-copy":"",t.isStreaming?"streaming":"","fade-in"].filter(Boolean).join(" ");return!f&&r&&a?l`${o.map(S=>hr(S,n))}`:!f&&!r&&!d?m:l`
    <div class="${$}">
      ${v?Sm(f):m}
      ${ob(c)}
      ${u?l`<div class="chat-thinking">${Li(Oi(u))}</div>`:m}
      ${f?l`<div class="chat-text" dir="${mc(f)}">${Li(Oi(f))}</div>`:m}
      ${o.map(S=>hr(S,n))}
    </div>
  `}function rb(e){return l`
    <div class="sidebar-panel">
      <div class="sidebar-header">
        <div class="sidebar-title">Tool Output</div>
        <button @click=${e.onClose} class="btn" title="Close sidebar">
          ${me.x}
        </button>
      </div>
      <div class="sidebar-content">
        ${e.error?l`
              <div class="callout danger">${e.error}</div>
              <button @click=${e.onViewRawText} class="btn" style="margin-top: 12px;">
                View Raw Text
              </button>
            `:e.content?l`<div class="sidebar-markdown">${Li(Oi(e.content))}</div>`:l`
                  <div class="muted">No content available</div>
                `}
      </div>
    </div>
  `}var lb=Object.defineProperty,cb=Object.getOwnPropertyDescriptor,Ds=(e,t,n,s)=>{for(var i=s>1?void 0:s?cb(t,n):t,a=e.length-1,o;a>=0;a--)(o=e[a])&&(i=(s?o(t,n,i):o(i))||i);return s&&i&&lb(t,n,i),i};let tn=class extends Zt{constructor(){super(...arguments),this.splitRatio=.6,this.minRatio=.4,this.maxRatio=.7,this.isDragging=!1,this.startX=0,this.startRatio=0,this.handleMouseDown=e=>{this.isDragging=!0,this.startX=e.clientX,this.startRatio=this.splitRatio,this.classList.add("dragging"),document.addEventListener("mousemove",this.handleMouseMove),document.addEventListener("mouseup",this.handleMouseUp),e.preventDefault()},this.handleMouseMove=e=>{if(!this.isDragging)return;const t=this.parentElement;if(!t)return;const n=t.getBoundingClientRect().width,i=(e.clientX-this.startX)/n;let a=this.startRatio+i;a=Math.max(this.minRatio,Math.min(this.maxRatio,a)),this.dispatchEvent(new CustomEvent("resize",{detail:{splitRatio:a},bubbles:!0,composed:!0}))},this.handleMouseUp=()=>{this.isDragging=!1,this.classList.remove("dragging"),document.removeEventListener("mousemove",this.handleMouseMove),document.removeEventListener("mouseup",this.handleMouseUp)}}render(){return m}connectedCallback(){super.connectedCallback(),this.addEventListener("mousedown",this.handleMouseDown)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("mousedown",this.handleMouseDown),document.removeEventListener("mousemove",this.handleMouseMove),document.removeEventListener("mouseup",this.handleMouseUp)}};tn.styles=Dc`
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
  `;Ds([ws({type:Number})],tn.prototype,"splitRatio",2);Ds([ws({type:Number})],tn.prototype,"minRatio",2);Ds([ws({type:Number})],tn.prototype,"maxRatio",2);tn=Ds([Fr("resizable-divider")],tn);const db=5e3;function vr(e){e.style.height="auto",e.style.height=`${e.scrollHeight}px`}function ub(e){return e?e.active?l`
      <div class="compaction-indicator compaction-indicator--active" role="status" aria-live="polite">
        ${me.loader} Compacting context...
      </div>
    `:e.completedAt&&Date.now()-e.completedAt<db?l`
        <div class="compaction-indicator compaction-indicator--complete" role="status" aria-live="polite">
          ${me.check} Context compacted
        </div>
      `:m:m}function gb(){return`att-${Date.now()}-${Math.random().toString(36).slice(2,9)}`}function pb(e,t){const n=e.clipboardData?.items;if(!n||!t.onAttachmentsChange)return;const s=[];for(let i=0;i<n.length;i++){const a=n[i];a.type.startsWith("image/")&&s.push(a)}if(s.length!==0){e.preventDefault();for(const i of s){const a=i.getAsFile();if(!a)continue;const o=new FileReader;o.addEventListener("load",()=>{const r=o.result,c={id:gb(),dataUrl:r,mimeType:a.type},d=t.attachments??[];t.onAttachmentsChange?.([...d,c])}),o.readAsDataURL(a)}}}function fb(e){const t=e.attachments??[];return t.length===0?m:l`
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
              ${me.x}
            </button>
          </div>
        `)}
    </div>
  `}const mr=["#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#8b5cf6","#ef4444","#14b8a6","#f97316","#06b6d4"];function hb(e){const t=e.identity?.name||e.name||e.id,n=t.trim().split(/\s+/);return n.length>=2?(n[0][0]+n[1][0]).toUpperCase():t.slice(0,2).toUpperCase()}function vb(e){return e.identity?.name||e.name||e.id}function mb(e){const t=e.agentsList?.agents;return!t||t.length===0||!e.onSelectAgent?m:l`
    <div class="chat-agent-picker">
      <div class="chat-agent-picker__title">Start a conversation</div>
      <div class="chat-agent-picker__subtitle">Choose an agent to chat with</div>
      <div class="chat-agent-picker__grid">
        ${t.map((n,s)=>{const i=mr[s%mr.length],a=hb(n),o=vb(n),r=n.identity?.avatarUrl||n.identity?.avatar,c=n.identity?.avatarUrl||n.identity?.avatar||"",d=/^(data:|https?:\/\/)/i.test(c);return l`
            <button
              class="chat-agent-picker__agent"
              @click=${()=>e.onSelectAgent(n.id)}
              title="Chat with ${o}"
            >
              <div
                class="chat-agent-picker__avatar"
                style="background: ${r&&d?"transparent":i}"
              >
                ${r&&d?l`<img src="${c}" alt="${o}" class="chat-agent-picker__avatar-img" />`:l`<span class="chat-agent-picker__initials">${a}</span>`}
              </div>
              <span class="chat-agent-picker__name">${o}</span>
            </button>
          `})}
      </div>
    </div>
  `}function bb(e){const t=e.connected,n=e.sending||e.stream!==null,s=!!(e.canAbort&&e.onAbort),a=e.sessions?.sessions?.find(v=>v.key===e.sessionKey)?.reasoningLevel??"off",o=e.showThinking&&a!=="off",r={name:e.assistantName,avatar:e.assistantAvatar??e.assistantAvatarUrl??null},c=(e.attachments?.length??0)>0,d=e.connected?c?"Add a message or paste more images...":"Message (↩ to send, Shift+↩ for line breaks, paste images)":"Connect to the gateway to start chatting…",g=e.splitRatio??.6,p=!!(e.sidebarOpen&&e.onCloseSidebar),h=xb(e),u=!e.loading&&h.length===0&&e.stream===null,f=l`
    <div
      class="chat-thread ${u?"chat-thread--empty":""}"
      role="log"
      aria-live="polite"
      @scroll=${e.onChatScroll}
    >
      ${e.loading?l`
              <div class="muted">Loading chat…</div>
            `:m}
      ${u?mb(e):m}
      ${zl(h,v=>v.key,v=>v.kind==="divider"?l`
              <div class="chat-divider" role="separator" data-ts=${String(v.timestamp)}>
                <span class="chat-divider__line"></span>
                <span class="chat-divider__label">${v.label}</span>
                <span class="chat-divider__line"></span>
              </div>
            `:v.kind==="reading-indicator"?nb(r):v.kind==="stream"?sb(v.text,v.startedAt,e.onOpenSidebar,r):v.kind==="group"?ib(v,{onOpenSidebar:e.onOpenSidebar,showReasoning:o,assistantName:e.assistantName,assistantAvatar:r.avatar}):m)}
    </div>
  `;return l`
    <section class="card chat">
      ${e.disabledReason?l`<div class="callout">${e.disabledReason}</div>`:m}

      ${e.error?l`<div class="callout danger">${e.error}</div>`:m}

      ${e.focusMode?l`
            <button
              class="chat-focus-exit"
              type="button"
              @click=${e.onToggleFocusMode}
              aria-label="Exit focus mode"
              title="Exit focus mode"
            >
              ${me.x}
            </button>
          `:m}

      <div
        class="chat-split-container ${p?"chat-split-container--open":""}"
      >
        <div
          class="chat-main"
          style="flex: ${p?`0 0 ${g*100}%`:"1 1 100%"}"
        >
          ${f}
        </div>

        ${p?l`
              <resizable-divider
                .splitRatio=${g}
                @resize=${v=>e.onSplitRatioChange?.(v.detail.splitRatio)}
              ></resizable-divider>
              <div class="chat-sidebar">
                ${rb({content:e.sidebarContent??null,error:e.sidebarError??null,onClose:e.onCloseSidebar,onViewRawText:()=>{!e.sidebarContent||!e.onOpenSidebar||e.onOpenSidebar(`\`\`\`
${e.sidebarContent}
\`\`\``)}})}
              </div>
            `:m}
      </div>

      ${e.queue.length?l`
            <div class="chat-queue" role="status" aria-live="polite">
              <div class="chat-queue__title">Queued (${e.queue.length})</div>
              <div class="chat-queue__list">
                ${e.queue.map(v=>l`
                    <div class="chat-queue__item">
                      <div class="chat-queue__text">
                        ${v.text||(v.attachments?.length?`Image (${v.attachments.length})`:"")}
                      </div>
                      <button
                        class="btn chat-queue__remove"
                        type="button"
                        aria-label="Remove queued message"
                        @click=${()=>e.onQueueRemove(v.id)}
                      >
                        ${me.x}
                      </button>
                    </div>
                  `)}
              </div>
            </div>
          `:m}

      ${ub(e.compactionStatus)}

      ${e.showNewMessages?l`
            <button
              class="btn chat-new-messages"
              type="button"
              @click=${e.onScrollToBottom}
            >
              New messages ${me.arrowDown}
            </button>
          `:m}

      <div class="chat-compose">
        ${fb(e)}
        <div class="chat-compose__row">
          <label class="field chat-compose__field">
            <span>Message</span>
            <textarea
              ${Jh(v=>v&&vr(v))}
              .value=${e.draft}
              dir=${mc(e.draft)}
              ?disabled=${!e.connected}
              @keydown=${v=>{v.key==="Enter"&&(v.isComposing||v.keyCode===229||v.shiftKey||e.connected&&(v.preventDefault(),t&&e.onSend()))}}
              @input=${v=>{const $=v.target;vr($),e.onDraftChange($.value)}}
              @paste=${v=>pb(v,e)}
              placeholder=${d}
            ></textarea>
          </label>
          <div class="chat-compose__actions">
            ${s?l`<button
                  class="btn"
                  ?disabled=${!e.connected}
                  @click=${e.onAbort}
                >Stop</button>`:l`<div class="chat-new-session-wrap">
                  <select
                    class="chat-new-session-select"
                    ?disabled=${!e.connected||e.sending}
                    @change=${v=>{const $=v.target,S=$.value;$.value="",S&&e.onSelectAgent?e.onSelectAgent(S):e.onNewSession()}}
                  >
                    <option value="" disabled selected>New chat ▾</option>
                    ${(e.agentsList?.agents??[]).map(v=>{const $=v.identity?.name||v.name||v.id;return l`<option value=${v.id}>${$}</option>`})}
                  </select>
                </div>`}
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
  `}const br=200;function yb(e){const t=[];let n=null;for(const s of e){if(s.kind!=="message"){n&&(t.push(n),n=null),t.push(s);continue}const i=yc(s.message),a=Ia(i.role),o=i.timestamp||Date.now();!n||n.role!==a?(n&&t.push(n),n={kind:"group",key:`group:${a}:${s.key}`,role:a,messages:[{message:s.message,key:s.key}],timestamp:o,isStreaming:!1}):n.messages.push({message:s.message,key:s.key})}return n&&t.push(n),t}function xb(e){const t=[],n=Array.isArray(e.messages)?e.messages:[],s=Array.isArray(e.toolMessages)?e.toolMessages:[],i=Math.max(0,n.length-br);i>0&&t.push({kind:"message",key:"chat:history:notice",message:{role:"system",content:`Showing last ${br} messages (${i} hidden).`,timestamp:Date.now()}});for(let a=i;a<n.length;a++){const o=n[a],r=yc(o),d=o.__openclaw;if(d&&d.kind==="compaction"){t.push({kind:"divider",key:typeof d.id=="string"?`divider:compaction:${d.id}`:`divider:compaction:${r.timestamp}:${a}`,label:"Compaction",timestamp:r.timestamp??Date.now()});continue}!e.showThinking&&r.role.toLowerCase()==="toolresult"||t.push({kind:"message",key:yr(o,a),message:o})}if(e.showThinking)for(let a=0;a<s.length;a++)t.push({kind:"message",key:yr(s[a],a+n.length),message:s[a]});if(e.stream!==null){const a=`stream:${e.sessionKey}:${e.streamStartedAt??"live"}`;e.stream.trim().length>0?t.push({kind:"stream",key:a,text:e.stream,startedAt:e.streamStartedAt??Date.now()}):t.push({kind:"reading-indicator",key:a})}return yb(t)}function yr(e,t){const n=e,s=typeof n.toolCallId=="string"?n.toolCallId:"";if(s)return`tool:${s}`;const i=typeof n.id=="string"?n.id:"";if(i)return`msg:${i}`;const a=typeof n.messageId=="string"?n.messageId:"";if(a)return`msg:${a}`;const o=typeof n.timestamp=="number"?n.timestamp:null,r=typeof n.role=="string"?n.role:"unknown";return o!=null?`msg:${r}:${o}:${t}`:`msg:${r}:${t}`}const Bi={all:l`
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
  `},xr=[{key:"env",label:"Environment"},{key:"update",label:"Updates"},{key:"agents",label:"Agents"},{key:"auth",label:"Authentication"},{key:"channels",label:"Channels"},{key:"messages",label:"Messages"},{key:"commands",label:"Commands"},{key:"hooks",label:"Hooks"},{key:"skills",label:"Skills"},{key:"tools",label:"Tools"},{key:"gateway",label:"Gateway"},{key:"wizard",label:"Setup Wizard"}],$r="__all__";function wr(e){return Bi[e]??Bi.default}function $b(e,t){const n=$a[e];return n||{label:t?.title??tt(e),description:t?.description??""}}function wb(e){const{key:t,schema:n,uiHints:s}=e;if(!n||Ee(n)!=="object"||!n.properties)return[];const i=Object.entries(n.properties).map(([a,o])=>{const r=Ie([t,a],s),c=r?.label??o.title??tt(a),d=r?.help??o.description??"",g=r?.order??50;return{key:a,label:c,description:d,order:g}});return i.sort((a,o)=>a.order!==o.order?a.order-o.order:a.key.localeCompare(o.key)),i}function kb(e,t){if(!e||!t)return[];const n=[];function s(i,a,o){if(i===a)return;if(typeof i!=typeof a){n.push({path:o,from:i,to:a});return}if(typeof i!="object"||i===null||a===null){i!==a&&n.push({path:o,from:i,to:a});return}if(Array.isArray(i)&&Array.isArray(a)){JSON.stringify(i)!==JSON.stringify(a)&&n.push({path:o,from:i,to:a});return}const r=i,c=a,d=new Set([...Object.keys(r),...Object.keys(c)]);for(const g of d)s(r[g],c[g],o?`${o}.${g}`:g)}return s(e,t,""),n}function kr(e,t=40){let n;try{n=JSON.stringify(e)??String(e)}catch{n=String(e)}return n.length<=t?n:n.slice(0,t-3)+"..."}function Sb(e){const t=e.valid==null?"unknown":e.valid?"valid":"invalid",n=Yl(e.schema),s=n.schema?n.unsupportedPaths.length>0:!1,i=n.schema?.properties??{},a=xr.filter(T=>T.key in i),o=new Set(xr.map(T=>T.key)),r=Object.keys(i).filter(T=>!o.has(T)).map(T=>({key:T,label:T.charAt(0).toUpperCase()+T.slice(1)})),c=[...a,...r],d=e.activeSection&&n.schema&&Ee(n.schema)==="object"?n.schema.properties?.[e.activeSection]:void 0,g=e.activeSection?$b(e.activeSection,d):null,p=e.activeSection?wb({key:e.activeSection,schema:d,uiHints:e.uiHints}):[],h=e.formMode==="form"&&!!e.activeSection&&p.length>0,u=e.activeSubsection===$r,f=e.searchQuery||u?null:e.activeSubsection??p[0]?.key??null,v=e.formMode==="form"?kb(e.originalValue,e.formValue):[],$=e.formMode==="raw"&&e.raw!==e.originalRaw,S=e.formMode==="form"?v.length>0:$,C=!!e.formValue&&!e.loading&&!!n.schema,k=e.connected&&!e.saving&&S&&(e.formMode==="raw"?!0:C),A=e.connected&&!e.applying&&!e.updating&&S&&(e.formMode==="raw"?!0:C),E=e.connected&&!e.applying&&!e.updating;return l`
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
              `:m}
        </div>

        <!-- Section nav -->
        <nav class="config-nav">
          <button
            class="config-nav__item ${e.activeSection===null?"active":""}"
            @click=${()=>e.onSectionChange(null)}
          >
            <span class="config-nav__icon">${Bi.all}</span>
            <span class="config-nav__label">All Settings</span>
          </button>
          ${c.map(T=>l`
              <button
                class="config-nav__item ${e.activeSection===T.key?"active":""}"
                @click=${()=>e.onSectionChange(T.key)}
              >
                <span class="config-nav__icon"
                  >${wr(T.key)}</span
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
            ${S?l`
                  <span class="config-changes-badge"
                    >${e.formMode==="raw"?"Unsaved changes":`${v.length} unsaved change${v.length!==1?"s":""}`}</span
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
              ?disabled=${!A}
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
        ${S&&e.formMode==="form"?l`
              <details class="config-diff">
                <summary class="config-diff__summary">
                  <span
                    >View ${v.length} pending
                    change${v.length!==1?"s":""}</span
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
                  ${v.map(T=>l`
                      <div class="config-diff__item">
                        <div class="config-diff__path">${T.path}</div>
                        <div class="config-diff__values">
                          <span class="config-diff__from"
                            >${kr(T.from)}</span
                          >
                          <span class="config-diff__arrow">→</span>
                          <span class="config-diff__to"
                            >${kr(T.to)}</span
                          >
                        </div>
                      </div>
                    `)}
                </div>
              </details>
            `:m}
        ${g&&e.formMode==="form"?l`
              <div class="config-section-hero">
                <div class="config-section-hero__icon">
                  ${wr(e.activeSection??"")}
                </div>
                <div class="config-section-hero__text">
                  <div class="config-section-hero__title">
                    ${g.label}
                  </div>
                  ${g.description?l`<div class="config-section-hero__desc">
                        ${g.description}
                      </div>`:m}
                </div>
              </div>
            `:m}
        ${h?l`
              <div class="config-subnav">
                <button
                  class="config-subnav__item ${f===null?"active":""}"
                  @click=${()=>e.onSubsectionChange($r)}
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
            `:m}

        <!-- Form content -->
        <div class="config-content">
          ${e.formMode==="form"?l`
                ${e.schemaLoading?l`
                        <div class="config-loading">
                          <div class="config-loading__spinner"></div>
                          <span>Loading schema…</span>
                        </div>
                      `:yh({schema:n.schema,uiHints:e.uiHints,value:e.formValue,disabled:e.loading||!e.formValue,unsupportedPaths:n.unsupportedPaths,onPatch:e.onFormPatch,searchQuery:e.searchQuery,activeSection:e.activeSection,activeSubsection:f})}
                ${s?l`
                        <div class="callout danger" style="margin-top: 12px">
                          Form view can't safely edit some fields. Use Raw to avoid losing config entries.
                        </div>
                      `:m}
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
            </div>`:m}
      </main>
    </div>
  `}function Ab(e){const t=["last",...e.channels.filter(Boolean)],n=e.form.deliveryChannel?.trim();n&&!t.includes(n)&&t.push(n);const s=new Set;return t.filter(i=>s.has(i)?!1:(s.add(i),!0))}function Cb(e,t){if(t==="last")return"last";const n=e.channelMeta?.find(s=>s.id===t);return n?.label?n.label:e.channelLabels?.[t]??t}function Tb(e){const t=Ab(e),s=(e.runsJobId==null?void 0:e.jobs.find(r=>r.id===e.runsJobId))?.name??e.runsJobId??"(select a job)",i=e.runs.toSorted((r,c)=>c.ts-r.ts),a=e.form.sessionTarget==="isolated"&&e.form.payloadKind==="agentTurn",o=e.form.deliveryMode==="announce"&&!a?"none":e.form.deliveryMode;return l`
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
            <div class="stat-value">${xa(e.status?.nextWakeAtMs??null)}</div>
          </div>
        </div>
        <div class="row" style="margin-top: 12px;">
          <button class="btn" ?disabled=${e.loading} @click=${e.onRefresh}>
            ${e.loading?"Refreshing…":"Refresh"}
          </button>
          ${e.error?l`<span class="muted">${e.error}</span>`:m}
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
        ${_b(e)}
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
                    `:m}
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
                `:m}
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
                                    ${Cb(e,r)}
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
                        `:m}
                `:m}
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
              ${e.jobs.map(r=>Eb(r,e))}
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
                ${i.map(r=>Ib(r,e.basePath))}
              </div>
            `}
    </section>
  `}function _b(e){const t=e.form;return t.scheduleKind==="at"?l`
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
  `}function Eb(e,t){const s=`list-item list-item-clickable cron-job${t.runsJobId===e.id?" list-item-selected":""}`;return l`
    <div class=${s} @click=${()=>t.onLoadRuns(e.id)}>
      <div class="list-main">
        <div class="list-title">${e.name}</div>
        <div class="list-sub">${Hl(e)}</div>
        ${Lb(e)}
        ${e.agentId?l`<div class="muted cron-job-agent">Agent: ${e.agentId}</div>`:m}
      </div>
      <div class="list-meta">
        ${Mb(e)}
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
  `}function Lb(e){if(e.payload.kind==="systemEvent")return l`<div class="cron-job-detail">
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
          </div>`:m}
  `}function Sr(e){return typeof e!="number"||!Number.isFinite(e)?"n/a":ee(e)}function Mb(e){const t=e.state?.lastStatus??"n/a",n=t==="ok"?"cron-job-status-ok":t==="error"?"cron-job-status-error":t==="skipped"?"cron-job-status-skipped":"cron-job-status-na",s=e.state?.nextRunAtMs,i=e.state?.lastRunAtMs;return l`
    <div class="cron-job-state">
      <div class="cron-job-state-row">
        <span class="cron-job-state-key">Status</span>
        <span class=${`cron-job-status-pill ${n}`}>${t}</span>
      </div>
      <div class="cron-job-state-row">
        <span class="cron-job-state-key">Next</span>
        <span class="cron-job-state-value" title=${Nt(s)}>
          ${Sr(s)}
        </span>
      </div>
      <div class="cron-job-state-row">
        <span class="cron-job-state-key">Last</span>
        <span class="cron-job-state-value" title=${Nt(i)}>
          ${Sr(i)}
        </span>
      </div>
    </div>
  `}function Ib(e,t){const n=typeof e.sessionKey=="string"&&e.sessionKey.trim().length>0?`${_s("chat",t)}?session=${encodeURIComponent(e.sessionKey)}`:null;return l`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${e.status}</div>
        <div class="list-sub">${e.summary??""}</div>
      </div>
      <div class="list-meta">
        <div>${Nt(e.ts)}</div>
        <div class="muted">${e.durationMs??0}ms</div>
        ${n?l`<div><a class="session-link" href=${n}>Open run chat</a></div>`:m}
        ${e.error?l`<div class="muted">${e.error}</div>`:m}
      </div>
    </div>
  `}function Rb(e){const n=(e.status&&typeof e.status=="object"?e.status.securityAudit:null)?.summary??null,s=n?.critical??0,i=n?.warn??0,a=n?.info??0,o=s>0?"danger":i>0?"warn":"success",r=s>0?`${s} critical`:i>0?`${i} warnings`:"No critical issues";return l`
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
                </div>`:m}
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
            </div>`:m}
        ${e.callResult?l`<pre class="code-block" style="margin-top: 12px;">${e.callResult}</pre>`:m}
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
                      <pre class="code-block">${_f(c.payload)}</pre>
                    </div>
                  </div>
                `)}
            </div>
          `}
    </section>
  `}function Pb(e){const t=Math.max(0,e),n=Math.floor(t/1e3);if(n<60)return`${n}s`;const s=Math.floor(n/60);return s<60?`${s}m`:`${Math.floor(s/60)}h`}function Ct(e,t){return t?l`<div class="exec-approval-meta-row"><span>${e}</span><span>${t}</span></div>`:m}function Db(e){const t=e.execApprovalQueue[0];if(!t)return m;const n=t.request,s=t.expiresAtMs-Date.now(),i=s>0?`expires in ${Pb(s)}`:"expired",a=e.execApprovalQueue.length;return l`
    <div class="exec-approval-overlay" role="dialog" aria-live="polite">
      <div class="exec-approval-card">
        <div class="exec-approval-header">
          <div>
            <div class="exec-approval-title">Exec approval needed</div>
            <div class="exec-approval-sub">${i}</div>
          </div>
          ${a>1?l`<div class="exec-approval-queue">${a} pending</div>`:m}
        </div>
        <div class="exec-approval-command mono">${n.command}</div>
        <div class="exec-approval-meta">
          ${Ct("Host",n.host)}
          ${Ct("Agent",n.agentId)}
          ${Ct("Session",n.sessionKey)}
          ${Ct("CWD",n.cwd)}
          ${Ct("Resolved",n.resolvedPath)}
          ${Ct("Security",n.security)}
          ${Ct("Ask",n.ask)}
        </div>
        ${e.execApprovalError?l`<div class="exec-approval-error">${e.execApprovalError}</div>`:m}
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
  `}function Fb(e){const{pendingGatewayUrl:t}=e;return t?l`
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
  `:m}function Nb(e){return l`
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
          </div>`:m}
      ${e.statusMessage?l`<div class="callout" style="margin-top: 12px;">
            ${e.statusMessage}
          </div>`:m}
      <div class="list" style="margin-top: 16px;">
        ${e.entries.length===0?l`
                <div class="muted">No instances reported yet.</div>
              `:e.entries.map(t=>Ob(t))}
      </div>
    </section>
  `}function Ob(e){const t=e.lastInputSeconds!=null?`${e.lastInputSeconds}s ago`:"n/a",n=e.mode??"unknown",s=Array.isArray(e.roles)?e.roles.filter(Boolean):[],i=Array.isArray(e.scopes)?e.scopes.filter(Boolean):[],a=i.length>0?i.length>3?`${i.length} scopes`:`scopes: ${i.join(", ")}`:null;return l`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${e.host??"unknown host"}</div>
        <div class="list-sub">${Af(e)}</div>
        <div class="chip-row">
          <span class="chip">${n}</span>
          ${s.map(o=>l`<span class="chip">${o}</span>`)}
          ${a?l`<span class="chip">${a}</span>`:m}
          ${e.platform?l`<span class="chip">${e.platform}</span>`:m}
          ${e.deviceFamily?l`<span class="chip">${e.deviceFamily}</span>`:m}
          ${e.modelIdentifier?l`<span class="chip">${e.modelIdentifier}</span>`:m}
          ${e.version?l`<span class="chip">${e.version}</span>`:m}
        </div>
      </div>
      <div class="list-meta">
        <div>${Cf(e)}</div>
        <div class="muted">Last input ${t}</div>
        <div class="muted">Reason ${e.reason??""}</div>
      </div>
    </div>
  `}const Ar=["trace","debug","info","warn","error","fatal"];function Bb(e){if(!e)return"";const t=new Date(e);return Number.isNaN(t.getTime())?e:t.toLocaleTimeString()}function zb(e,t){return t?[e.message,e.subsystem,e.raw].filter(Boolean).join(" ").toLowerCase().includes(t):!0}function Ub(e){const t=e.filterText.trim().toLowerCase(),n=Ar.some(a=>!e.levelFilters[a]),s=e.entries.filter(a=>a.level&&!e.levelFilters[a.level]?!1:zb(a,t)),i=t||n?"filtered":"visible";return l`
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
        ${Ar.map(a=>l`
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

      ${e.file?l`<div class="muted" style="margin-top: 10px;">File: ${e.file}</div>`:m}
      ${e.truncated?l`
              <div class="callout" style="margin-top: 10px">Log output truncated; showing latest chunk.</div>
            `:m}
      ${e.error?l`<div class="callout danger" style="margin-top: 10px;">${e.error}</div>`:m}

      <div class="log-stream" style="margin-top: 12px;" @scroll=${e.onScroll}>
        ${s.length===0?l`
                <div class="muted" style="padding: 12px">No log entries.</div>
              `:s.map(a=>l`
                <div class="log-row">
                  <div class="log-time mono">${Bb(a.time)}</div>
                  <div class="log-level ${a.level??""}">${a.level??""}</div>
                  <div class="log-subsystem mono">${a.subsystem??""}</div>
                  <div class="log-message mono">${a.message??a.raw}</div>
                </div>
              `)}
      </div>
    </section>
  `}const pt="__defaults__",Cr=[{value:"deny",label:"Deny"},{value:"allowlist",label:"Allowlist"},{value:"full",label:"Full"}],Hb=[{value:"off",label:"Off"},{value:"on-miss",label:"On miss"},{value:"always",label:"Always"}];function Tr(e){return e==="allowlist"||e==="full"||e==="deny"?e:"deny"}function jb(e){return e==="always"||e==="off"||e==="on-miss"?e:"on-miss"}function Kb(e){const t=e?.defaults??{};return{security:Tr(t.security),ask:jb(t.ask),askFallback:Tr(t.askFallback??"deny"),autoAllowSkills:!!(t.autoAllowSkills??!1)}}function Wb(e){const t=e?.agents??{},n=Array.isArray(t.list)?t.list:[],s=[];return n.forEach(i=>{if(!i||typeof i!="object")return;const a=i,o=typeof a.id=="string"?a.id.trim():"";if(!o)return;const r=typeof a.name=="string"?a.name.trim():void 0,c=a.default===!0;s.push({id:o,name:r||void 0,isDefault:c})}),s}function qb(e,t){const n=Wb(e),s=Object.keys(t?.agents??{}),i=new Map;n.forEach(o=>i.set(o.id,o)),s.forEach(o=>{i.has(o)||i.set(o,{id:o})});const a=Array.from(i.values());return a.length===0&&a.push({id:"main",isDefault:!0}),a.sort((o,r)=>{if(o.isDefault&&!r.isDefault)return-1;if(!o.isDefault&&r.isDefault)return 1;const c=o.name?.trim()?o.name:o.id,d=r.name?.trim()?r.name:r.id;return c.localeCompare(d)}),a}function Vb(e,t){return e===pt?pt:e&&t.some(n=>n.id===e)?e:pt}function Gb(e){const t=e.execApprovalsForm??e.execApprovalsSnapshot?.file??null,n=!!t,s=Kb(t),i=qb(e.configForm,t),a=ty(e.nodes),o=e.execApprovalsTarget;let r=o==="node"&&e.execApprovalsTargetNodeId?e.execApprovalsTargetNodeId:null;o==="node"&&r&&!a.some(p=>p.id===r)&&(r=null);const c=Vb(e.execApprovalsSelectedAgent,i),d=c!==pt?(t?.agents??{})[c]??null:null,g=Array.isArray(d?.allowlist)?d.allowlist??[]:[];return{ready:n,disabled:e.execApprovalsSaving||e.execApprovalsLoading,dirty:e.execApprovalsDirty,loading:e.execApprovalsLoading,saving:e.execApprovalsSaving,form:t,defaults:s,selectedScope:c,selectedAgent:d,agents:i,allowlist:g,target:o,targetNodeId:r,targetNodes:a,onSelectScope:e.onExecApprovalsSelectAgent,onSelectTarget:e.onExecApprovalsTargetChange,onPatch:e.onExecApprovalsPatch,onRemove:e.onExecApprovalsRemove,onLoad:e.onLoadExecApprovals,onSave:e.onSaveExecApprovals}}function Qb(e){const t=e.ready,n=e.target!=="node"||!!e.targetNodeId;return l`
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

      ${Yb(e)}

      ${t?l`
            ${Zb(e)}
            ${Xb(e)}
            ${e.selectedScope===pt?m:Jb(e)}
          `:l`<div class="row" style="margin-top: 12px; gap: 12px;">
            <div class="muted">Load exec approvals to edit allowlists.</div>
            <button class="btn" ?disabled=${e.loading||!n} @click=${e.onLoad}>
              ${e.loading?"Loading…":"Load approvals"}
            </button>
          </div>`}
    </section>
  `}function Yb(e){const t=e.targetNodes.length>0,n=e.targetNodeId??"";return l`
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
              `:m}
        </div>
      </div>
      ${e.target==="node"&&!t?l`
              <div class="muted">No nodes advertise exec approvals yet.</div>
            `:m}
    </div>
  `}function Zb(e){return l`
    <div class="row" style="margin-top: 12px; gap: 8px; flex-wrap: wrap;">
      <span class="label">Scope</span>
      <div class="row" style="gap: 8px; flex-wrap: wrap;">
        <button
          class="btn btn--sm ${e.selectedScope===pt?"active":""}"
          @click=${()=>e.onSelectScope(pt)}
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
  `}function Xb(e){const t=e.selectedScope===pt,n=e.defaults,s=e.selectedAgent??{},i=t?["defaults"]:["agents",e.selectedScope],a=typeof s.security=="string"?s.security:void 0,o=typeof s.ask=="string"?s.ask:void 0,r=typeof s.askFallback=="string"?s.askFallback:void 0,c=t?n.security:a??"__default__",d=t?n.ask:o??"__default__",g=t?n.askFallback:r??"__default__",p=typeof s.autoAllowSkills=="boolean"?s.autoAllowSkills:void 0,h=p??n.autoAllowSkills,u=p==null;return l`
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
              @change=${f=>{const $=f.target.value;!t&&$==="__default__"?e.onRemove([...i,"security"]):e.onPatch([...i,"security"],$)}}
            >
              ${t?m:l`<option value="__default__" ?selected=${c==="__default__"}>
                    Use default (${n.security})
                  </option>`}
              ${Cr.map(f=>l`<option
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
              @change=${f=>{const $=f.target.value;!t&&$==="__default__"?e.onRemove([...i,"ask"]):e.onPatch([...i,"ask"],$)}}
            >
              ${t?m:l`<option value="__default__" ?selected=${d==="__default__"}>
                    Use default (${n.ask})
                  </option>`}
              ${Hb.map(f=>l`<option
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
              @change=${f=>{const $=f.target.value;!t&&$==="__default__"?e.onRemove([...i,"askFallback"]):e.onPatch([...i,"askFallback"],$)}}
            >
              ${t?m:l`<option value="__default__" ?selected=${g==="__default__"}>
                    Use default (${n.askFallback})
                  </option>`}
              ${Cr.map(f=>l`<option
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
              @change=${f=>{const v=f.target;e.onPatch([...i,"autoAllowSkills"],v.checked)}}
            />
          </label>
          ${!t&&!u?l`<button
                class="btn btn--sm"
                ?disabled=${e.disabled}
                @click=${()=>e.onRemove([...i,"autoAllowSkills"])}
              >
                Use default
              </button>`:m}
        </div>
      </div>
    </div>
  `}function Jb(e){const t=["agents",e.selectedScope,"allowlist"],n=e.allowlist;return l`
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
            `:n.map((s,i)=>ey(e,s,i))}
    </div>
  `}function ey(e,t,n){const s=t.lastUsedAt?ee(t.lastUsedAt):"never",i=t.lastUsedCommand?mi(t.lastUsedCommand,120):null,a=t.lastResolvedPath?mi(t.lastResolvedPath,120):null;return l`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${t.pattern?.trim()?t.pattern:"New pattern"}</div>
        <div class="list-sub">Last used: ${s}</div>
        ${i?l`<div class="list-sub mono">${i}</div>`:m}
        ${a?l`<div class="list-sub mono">${a}</div>`:m}
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
  `}function ty(e){const t=[];for(const n of e){if(!(Array.isArray(n.commands)?n.commands:[]).some(r=>String(r)==="system.execApprovals.get"||String(r)==="system.execApprovals.set"))continue;const a=typeof n.nodeId=="string"?n.nodeId.trim():"";if(!a)continue;const o=typeof n.displayName=="string"&&n.displayName.trim()?n.displayName.trim():a;t.push({id:a,label:o===a?a:`${o} · ${a}`})}return t.sort((n,s)=>n.label.localeCompare(s.label)),t}function ny(e){const t=ry(e),n=Gb(e);return l`
    ${Qb(n)}
    ${ly(t)}
    ${sy(e)}
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
              `:e.nodes.map(s=>gy(s))}
      </div>
    </section>
  `}function sy(e){const t=e.devicesList??{pending:[],paired:[]},n=Array.isArray(t.pending)?t.pending:[],s=Array.isArray(t.paired)?t.paired:[];return l`
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
      ${e.devicesError?l`<div class="callout danger" style="margin-top: 12px;">${e.devicesError}</div>`:m}
      <div class="list" style="margin-top: 16px;">
        ${n.length>0?l`
              <div class="muted" style="margin-bottom: 8px;">Pending</div>
              ${n.map(i=>iy(i,e))}
            `:m}
        ${s.length>0?l`
              <div class="muted" style="margin-top: 12px; margin-bottom: 8px;">Paired</div>
              ${s.map(i=>ay(i,e))}
            `:m}
        ${n.length===0&&s.length===0?l`
                <div class="muted">No paired devices.</div>
              `:m}
      </div>
    </section>
  `}function iy(e,t){const n=e.displayName?.trim()||e.deviceId,s=typeof e.ts=="number"?ee(e.ts):"n/a",i=e.role?.trim()?`role: ${e.role}`:"role: -",a=e.isRepair?" · repair":"",o=e.remoteIp?` · ${e.remoteIp}`:"";return l`
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
  `}function ay(e,t){const n=e.displayName?.trim()||e.deviceId,s=e.remoteIp?` · ${e.remoteIp}`:"",i=`roles: ${vi(e.roles)}`,a=`scopes: ${vi(e.scopes)}`,o=Array.isArray(e.tokens)?e.tokens:[];return l`
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
                ${o.map(r=>oy(e.deviceId,r,t))}
              </div>
            `}
      </div>
    </div>
  `}function oy(e,t,n){const s=t.revokedAtMs?"revoked":"active",i=`scopes: ${vi(t.scopes)}`,a=ee(t.rotatedAtMs??t.createdAtMs??t.lastUsedAtMs??null);return l`
    <div class="row" style="justify-content: space-between; gap: 8px;">
      <div class="list-sub">${t.role} · ${s} · ${i} · ${a}</div>
      <div class="row" style="justify-content: flex-end; gap: 6px; flex-wrap: wrap;">
        <button
          class="btn btn--sm"
          @click=${()=>n.onDeviceRotate(e,t.role,t.scopes)}
        >
          Rotate
        </button>
        ${t.revokedAtMs?m:l`
              <button
                class="btn btn--sm danger"
                @click=${()=>n.onDeviceRevoke(e,t.role)}
              >
                Revoke
              </button>
            `}
      </div>
    </div>
  `}function ry(e){const t=e.configForm,n=dy(e.nodes),{defaultBinding:s,agents:i}=uy(t),a=!!t,o=e.configSaving||e.configFormMode==="raw";return{ready:a,disabled:o,configDirty:e.configDirty,configLoading:e.configLoading,configSaving:e.configSaving,defaultBinding:s,agents:i,nodes:n,onBindDefault:e.onBindDefault,onBindAgent:e.onBindAgent,onSave:e.onSaveBindings,onLoadConfig:e.onLoadConfig,formMode:e.configFormMode}}function ly(e){const t=e.nodes.length>0,n=e.defaultBinding??"";return l`
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
            `:m}

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
                  ${t?m:l`
                          <div class="muted">No nodes with system.run available.</div>
                        `}
                </div>
              </div>

              ${e.agents.length===0?l`
                      <div class="muted">No agents found.</div>
                    `:e.agents.map(s=>cy(s,e))}
            </div>
          `:l`<div class="row" style="margin-top: 12px; gap: 12px;">
            <div class="muted">Load config to edit bindings.</div>
            <button class="btn" ?disabled=${e.configLoading} @click=${e.onLoadConfig}>
              ${e.configLoading?"Loading…":"Load config"}
            </button>
          </div>`}
    </section>
  `}function cy(e,t){const n=e.binding??"__default__",s=e.name?.trim()?`${e.name} (${e.id})`:e.id,i=t.nodes.length>0;return l`
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
  `}function dy(e){const t=[];for(const n of e){if(!(Array.isArray(n.commands)?n.commands:[]).some(r=>String(r)==="system.run"))continue;const a=typeof n.nodeId=="string"?n.nodeId.trim():"";if(!a)continue;const o=typeof n.displayName=="string"&&n.displayName.trim()?n.displayName.trim():a;t.push({id:a,label:o===a?a:`${o} · ${a}`})}return t.sort((n,s)=>n.label.localeCompare(s.label)),t}function uy(e){const t={id:"main",name:void 0,index:0,isDefault:!0,binding:null};if(!e||typeof e!="object")return{defaultBinding:null,agents:[t]};const s=(e.tools??{}).exec??{},i=typeof s.node=="string"&&s.node.trim()?s.node.trim():null,a=e.agents??{},o=Array.isArray(a.list)?a.list:[];if(o.length===0)return{defaultBinding:i,agents:[t]};const r=[];return o.forEach((c,d)=>{if(!c||typeof c!="object")return;const g=c,p=typeof g.id=="string"?g.id.trim():"";if(!p)return;const h=typeof g.name=="string"?g.name.trim():void 0,u=g.default===!0,v=(g.tools??{}).exec??{},$=typeof v.node=="string"&&v.node.trim()?v.node.trim():null;r.push({id:p,name:h||void 0,index:d,isDefault:u,binding:$})}),r.length===0&&r.push(t),{defaultBinding:i,agents:r}}function gy(e){const t=!!e.connected,n=!!e.paired,s=typeof e.displayName=="string"&&e.displayName.trim()||(typeof e.nodeId=="string"?e.nodeId:"unknown"),i=Array.isArray(e.caps)?e.caps:[],a=Array.isArray(e.commands)?e.commands:[];return l`
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
  `}function py(e){const t=e.hello?.snapshot,n=t?.uptimeMs?ta(t.uptimeMs):P("common.na"),s=t?.policy?.tickIntervalMs?`${t.policy.tickIntervalMs}ms`:P("common.na"),a=t?.authMode==="trusted-proxy",o=(()=>{if(e.connected||!e.lastError)return null;const d=e.lastError.toLowerCase();if(!(d.includes("unauthorized")||d.includes("connect failed")))return null;const p=!!e.settings.token.trim(),h=!!e.password.trim();return!p&&!h?l`
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
    `})(),c=Tn.getLocale();return l`
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
              @change=${d=>{const g=d.target.value;Tn.setLocale(g),e.onSettingsChange({...e.settings,locale:g})}}
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
        <div class="muted">${P("overview.stats.cronNext",{time:xa(e.cronNext)})}</div>
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
  `}const fy=["","off","minimal","low","medium","high","xhigh"],hy=["","off","on"],vy=[{value:"",label:"inherit"},{value:"off",label:"off (explicit)"},{value:"on",label:"on"},{value:"full",label:"full"}],my=["","off","on","stream"];function by(e){if(!e)return"";const t=e.trim().toLowerCase();return t==="z.ai"||t==="z-ai"?"zai":t}function Cc(e){return by(e)==="zai"}function yy(e){return Cc(e)?hy:fy}function _r(e,t){return t?e.includes(t)?[...e]:[...e,t]:[...e]}function xy(e,t){return t?e.some(n=>n.value===t)?[...e]:[...e,{value:t,label:`${t} (custom)`}]:[...e]}function $y(e,t){return!t||!e||e==="off"?e:"on"}function wy(e,t){return e?t&&e==="on"?"low":e:null}function ky(e){const t=e.result?.sessions??[];return l`
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

      ${e.error?l`<div class="callout danger" style="margin-top: 12px;">${e.error}</div>`:m}

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
              `:t.map(n=>Sy(n,e.basePath,e.onPatch,e.onDelete,e.loading))}
      </div>
    </section>
  `}function Sy(e,t,n,s,i){const a=e.updatedAt?ee(e.updatedAt):"n/a",o=e.thinkingLevel??"",r=Cc(e.modelProvider),c=$y(o,r),d=_r(yy(e.modelProvider),c),g=e.verboseLevel??"",p=xy(vy,g),h=e.reasoningLevel??"",u=_r(my,h),f=typeof e.displayName=="string"&&e.displayName.trim().length>0?e.displayName.trim():null,v=typeof e.label=="string"?e.label.trim():"",$=!!(f&&f!==e.key&&f!==v),S=e.kind!=="global",C=S?`${_s("chat",t)}?session=${encodeURIComponent(e.key)}`:null;return l`
    <div class="table-row">
      <div class="mono session-key-cell">
        ${S?l`<a href=${C} class="session-link">${e.key}</a>`:e.key}
        ${$?l`<span class="muted session-key-display-name">${f}</span>`:m}
      </div>
      <div>
        <input
          .value=${e.label??""}
          ?disabled=${i}
          placeholder="(optional)"
          @change=${k=>{const A=k.target.value.trim();n(e.key,{label:A||null})}}
        />
      </div>
      <div>${e.kind}</div>
      <div>${a}</div>
      <div>${Tf(e)}</div>
      <div>
        <select
          ?disabled=${i}
          @change=${k=>{const A=k.target.value;n(e.key,{thinkingLevel:wy(A,r)})}}
        >
          ${d.map(k=>l`<option value=${k} ?selected=${c===k}>
                ${k||"inherit"}
              </option>`)}
        </select>
      </div>
      <div>
        <select
          ?disabled=${i}
          @change=${k=>{const A=k.target.value;n(e.key,{verboseLevel:A||null})}}
        >
          ${p.map(k=>l`<option value=${k.value} ?selected=${g===k.value}>
                ${k.label}
              </option>`)}
        </select>
      </div>
      <div>
        <select
          ?disabled=${i}
          @change=${k=>{const A=k.target.value;n(e.key,{reasoningLevel:A||null})}}
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
  `}function Ay(e){const t=e.report?.skills??[],n=e.filter.trim().toLowerCase(),s=n?t.filter(a=>[a.name,a.description,a.source].join(" ").toLowerCase().includes(n)):t,i=Wl(s);return l`
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

      ${e.error?l`<div class="callout danger" style="margin-top: 12px;">${e.error}</div>`:m}

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
                      ${a.skills.map(r=>Cy(r,e))}
                    </div>
                  </details>
                `})}
            </div>
          `}
    </section>
  `}function Cy(e,t){const n=t.busyKey===e.skillKey,s=t.edits[e.skillKey]??"",i=t.messages[e.skillKey]??null,a=e.install.length>0&&e.missing.bins.length>0,o=!!(e.bundled&&e.source!=="openclaw-bundled"),r=ql(e),c=Vl(e);return l`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">
          ${e.emoji?`${e.emoji} `:""}${e.name}
        </div>
        <div class="list-sub">${mi(e.description,140)}</div>
        ${Gl({skill:e,showBundledBadge:o})}
        ${r.length>0?l`
              <div class="muted" style="margin-top: 6px;">
                Missing: ${r.join(", ")}
              </div>
            `:m}
        ${c.length>0?l`
              <div class="muted" style="margin-top: 6px;">
                Reason: ${c.join(", ")}
              </div>
            `:m}
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
              </button>`:m}
        </div>
        ${i?l`<div
              class="muted"
              style="margin-top: 8px; color: ${i.kind==="error"?"var(--danger-color, #d14343)":"var(--success-color, #0a7f5a)"};"
            >
              ${i.message}
            </div>`:m}
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
            `:m}
      </div>
    </div>
  `}const Ty=/^data:/i,_y=/^https?:\/\//i;function Ey(e){const t=e.agentsList?.agents??[],s=Wr(e.sessionKey)?.agentId??e.agentsList?.defaultId??"main",a=t.find(r=>r.id===s)?.identity,o=a?.avatarUrl??a?.avatar;if(o)return Ty.test(o)||_y.test(o)?o:a?.avatarUrl}function Ly(e){const t=e.presenceEntries.length,n=e.sessionsResult?.count??null,s=e.cronStatus?.nextWakeAtMs??null,i=e.connected?null:P("chat.disconnected"),a=e.tab==="chat",o=a&&(e.settings.chatFocusMode||e.onboarding),r=e.onboarding?!1:e.settings.chatShowThinking,c=Ey(e),d=e.chatAvatarUrl??c??null,g=e.configForm??e.configSnapshot?.config,p=nn(e.basePath??""),h=e.agentsSelectedId??e.agentsList?.defaultId??e.agentsList?.agents?.[0]?.id??null;return l`
    <div class="shell ${a?"shell--chat":""} ${o?"shell--chat-focus":""} ${e.settings.navCollapsed?"shell--nav-collapsed":""} ${e.onboarding?"shell--onboarding":""}">
      <header class="topbar">
        <div class="topbar-left">
          <button
            class="nav-collapse-toggle"
            @click=${()=>e.applySettings({...e.settings,navCollapsed:!e.settings.navCollapsed})}
            title="${e.settings.navCollapsed?P("nav.expand"):P("nav.collapse")}"
            aria-label="${e.settings.navCollapsed?P("nav.expand"):P("nav.collapse")}"
          >
            <span class="nav-collapse-toggle__icon">${me.menu}</span>
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
          ${yf(e)}
        </div>
      </header>
      <aside class="nav ${e.settings.navCollapsed?"nav--collapsed":""}">
        ${Vu.map(u=>{const f=e.settings.navGroupsCollapsed[u.label]??!1,v=u.tabs.some($=>$===e.tab);return l`
            <div class="nav-group ${f&&!v?"nav-group--collapsed":""}">
              <button
                class="nav-label"
                @click=${()=>{const $={...e.settings.navGroupsCollapsed};$[u.label]=!f,e.applySettings({...e.settings,navGroupsCollapsed:$})}}
                aria-expanded=${!f}
              >
                <span class="nav-label__text">${P(`nav.${u.label}`)}</span>
                <span class="nav-label__chevron">${f?"+":"−"}</span>
              </button>
              <div class="nav-group__items">
                ${u.tabs.map($=>gf(e,$))}
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
              <span class="nav-item__icon" aria-hidden="true">${me.book}</span>
              <span class="nav-item__text">${P("common.docs")}</span>
            </a>
          </div>
        </div>
      </aside>
      <main class="content ${a?"content--chat":""}">
        <section class="content-header">
          <div>
            ${e.tab==="usage"?m:l`<div class="page-title">${wi(e.tab)}</div>`}
            ${e.tab==="usage"?m:l`<div class="page-sub">${Yu(e.tab)}</div>`}
          </div>
          <div class="page-meta">
            ${e.lastError?l`<div class="pill danger">${e.lastError}</div>`:m}
            ${a?pf(e):m}
          </div>
        </section>

        ${e.tab==="overview"?py({connected:e.connected,hello:e.hello,settings:e.settings,password:e.password,lastError:e.lastError,presenceCount:t,sessionsCount:n,cronEnabled:e.cronStatus?.enabled??null,cronNext:s,lastChannelsRefresh:e.channelsLastSuccess,onSettingsChange:u=>e.applySettings(u),onPasswordChange:u=>e.password=u,onSessionKeyChange:u=>{e.sessionKey=u,e.chatMessage="",e.resetToolStream(),e.applySettings({...e.settings,sessionKey:u,lastActiveSessionKey:u}),e.loadAssistantIdentity()},onConnect:()=>e.connect(),onRefresh:()=>e.loadOverview()}):m}

        ${e.tab==="channels"?Bh({connected:e.connected,loading:e.channelsLoading,snapshot:e.channelsSnapshot,lastError:e.channelsError,lastSuccessAt:e.channelsLastSuccess,whatsappMessage:e.whatsappLoginMessage,whatsappQrDataUrl:e.whatsappLoginQrDataUrl,whatsappConnected:e.whatsappLoginConnected,whatsappBusy:e.whatsappBusy,configSchema:e.configSchema,configSchemaLoading:e.configSchemaLoading,configForm:e.configForm,configUiHints:e.configUiHints,configSaving:e.configSaving,configFormDirty:e.configFormDirty,nostrProfileFormState:e.nostrProfileFormState,nostrProfileAccountId:e.nostrProfileAccountId,onRefresh:u=>Ce(e,u),onWhatsAppStart:u=>e.handleWhatsAppStart(u),onWhatsAppWait:()=>e.handleWhatsAppWait(),onWhatsAppLogout:()=>e.handleWhatsAppLogout(),onConfigPatch:(u,f)=>_e(e,u,f),onConfigSave:()=>e.handleChannelConfigSave(),onConfigReload:()=>e.handleChannelConfigReload(),onNostrProfileEdit:(u,f)=>e.handleNostrProfileEdit(u,f),onNostrProfileCancel:()=>e.handleNostrProfileCancel(),onNostrProfileFieldChange:(u,f)=>e.handleNostrProfileFieldChange(u,f),onNostrProfileSave:()=>e.handleNostrProfileSave(),onNostrProfileImport:()=>e.handleNostrProfileImport(),onNostrProfileToggleAdvanced:()=>e.handleNostrProfileToggleAdvanced()}):m}

        ${e.tab==="instances"?Nb({loading:e.presenceLoading,entries:e.presenceEntries,lastError:e.presenceError,statusMessage:e.presenceStatus,onRefresh:()=>ca(e)}):m}

        ${e.tab==="sessions"?ky({loading:e.sessionsLoading,result:e.sessionsResult,error:e.sessionsError,activeMinutes:e.sessionsFilterActive,limit:e.sessionsFilterLimit,includeGlobal:e.sessionsIncludeGlobal,includeUnknown:e.sessionsIncludeUnknown,basePath:e.basePath,onFiltersChange:u=>{e.sessionsFilterActive=u.activeMinutes,e.sessionsFilterLimit=u.limit,e.sessionsIncludeGlobal=u.includeGlobal,e.sessionsIncludeUnknown=u.includeUnknown},onRefresh:()=>Ut(e),onPatch:(u,f)=>zu(e,u,f),onDelete:u=>Hu(e,u)}):m}

        ${sf(e)}

        ${e.tab==="cron"?Tb({basePath:e.basePath,loading:e.cronLoading,status:e.cronStatus,jobs:e.cronJobs,error:e.cronError,busy:e.cronBusy,form:e.cronForm,channels:e.channelsSnapshot?.channelMeta?.length?e.channelsSnapshot.channelMeta.map(u=>u.id):e.channelsSnapshot?.channelOrder??[],channelLabels:e.channelsSnapshot?.channelLabels??{},channelMeta:e.channelsSnapshot?.channelMeta??[],runsJobId:e.cronRunsJobId,runs:e.cronRuns,onFormChange:u=>e.cronForm=Yr({...e.cronForm,...u}),onRefresh:()=>e.loadCron(),onAdd:()=>Jd(e),onToggle:(u,f)=>eu(e,u,f),onRun:u=>tu(e,u),onRemove:u=>nu(e,u),onLoadRuns:u=>Zr(e,u)}):m}

        ${e.tab==="agents"?rh({loading:e.agentsLoading,error:e.agentsError,agentsList:e.agentsList,selectedAgentId:h,activePanel:e.agentsPanel,configForm:g,configLoading:e.configLoading,configSaving:e.configSaving,configDirty:e.configFormDirty,channelsLoading:e.channelsLoading,channelsError:e.channelsError,channelsSnapshot:e.channelsSnapshot,channelsLastSuccess:e.channelsLastSuccess,cronLoading:e.cronLoading,cronStatus:e.cronStatus,cronJobs:e.cronJobs,cronError:e.cronError,agentFilesLoading:e.agentFilesLoading,agentFilesError:e.agentFilesError,agentFilesList:e.agentFilesList,agentFileActive:e.agentFileActive,agentFileContents:e.agentFileContents,agentFileDrafts:e.agentFileDrafts,agentFileSaving:e.agentFileSaving,agentIdentityLoading:e.agentIdentityLoading,agentIdentityError:e.agentIdentityError,agentIdentityById:e.agentIdentityById,agentSkillsLoading:e.agentSkillsLoading,agentSkillsReport:e.agentSkillsReport,agentSkillsError:e.agentSkillsError,agentSkillsAgentId:e.agentSkillsAgentId,skillsFilter:e.skillsFilter,onRefresh:async()=>{await Ji(e);const u=e.agentsList?.agents?.map(f=>f.id)??[];u.length>0&&Gr(e,u)},onSelectAgent:u=>{e.agentsSelectedId!==u&&(e.agentsSelectedId=u,e.agentFilesList=null,e.agentFilesError=null,e.agentFilesLoading=!1,e.agentFileActive=null,e.agentFileContents={},e.agentFileDrafts={},e.agentSkillsReport=null,e.agentSkillsError=null,e.agentSkillsAgentId=null,Vr(e,u),e.agentsPanel==="files"&&ai(e,u),e.agentsPanel==="skills"&&ns(e,u))},onSelectPanel:u=>{e.agentsPanel=u,u==="files"&&h&&e.agentFilesList?.agentId!==h&&(e.agentFilesList=null,e.agentFilesError=null,e.agentFileActive=null,e.agentFileContents={},e.agentFileDrafts={},ai(e,h)),u==="skills"&&h&&ns(e,h),u==="channels"&&Ce(e,!1),u==="cron"&&e.loadCron()},onLoadFiles:u=>ai(e,u),onSelectFile:u=>{e.agentFileActive=u,h&&kf(e,h,u)},onFileDraftChange:(u,f)=>{e.agentFileDrafts={...e.agentFileDrafts,[u]:f}},onFileReset:u=>{const f=e.agentFileContents[u]??"";e.agentFileDrafts={...e.agentFileDrafts,[u]:f}},onFileSave:u=>{if(!h)return;const f=e.agentFileDrafts[u]??e.agentFileContents[u]??"";Sf(e,h,u,f)},onToolsProfileChange:(u,f,v)=>{if(!g)return;const $=g.agents?.list;if(!Array.isArray($))return;const S=$.findIndex(k=>k&&typeof k=="object"&&"id"in k&&k.id===u);if(S<0)return;const C=["agents","list",S,"tools"];f?_e(e,[...C,"profile"],f):Ze(e,[...C,"profile"]),v&&Ze(e,[...C,"allow"])},onToolsOverridesChange:(u,f,v)=>{if(!g)return;const $=g.agents?.list;if(!Array.isArray($))return;const S=$.findIndex(k=>k&&typeof k=="object"&&"id"in k&&k.id===u);if(S<0)return;const C=["agents","list",S,"tools"];f.length>0?_e(e,[...C,"alsoAllow"],f):Ze(e,[...C,"alsoAllow"]),v.length>0?_e(e,[...C,"deny"],v):Ze(e,[...C,"deny"])},onConfigReload:()=>Ne(e),onConfigSave:()=>ts(e),onChannelsRefresh:()=>Ce(e,!1),onCronRefresh:()=>e.loadCron(),onSkillsFilterChange:u=>e.skillsFilter=u,onSkillsRefresh:()=>{h&&ns(e,h)},onAgentSkillToggle:(u,f,v)=>{if(!g)return;const $=g.agents?.list;if(!Array.isArray($))return;const S=$.findIndex(H=>H&&typeof H=="object"&&"id"in H&&H.id===u);if(S<0)return;const C=$[S],k=f.trim();if(!k)return;const A=e.agentSkillsReport?.skills?.map(H=>H.name).filter(Boolean)??[],T=(Array.isArray(C.skills)?C.skills.map(H=>String(H).trim()).filter(Boolean):void 0)??A,I=new Set(T);v?I.add(k):I.delete(k),_e(e,["agents","list",S,"skills"],[...I])},onAgentSkillsClear:u=>{if(!g)return;const f=g.agents?.list;if(!Array.isArray(f))return;const v=f.findIndex($=>$&&typeof $=="object"&&"id"in $&&$.id===u);v<0||Ze(e,["agents","list",v,"skills"])},onAgentSkillsDisableAll:u=>{if(!g)return;const f=g.agents?.list;if(!Array.isArray(f))return;const v=f.findIndex($=>$&&typeof $=="object"&&"id"in $&&$.id===u);v<0||_e(e,["agents","list",v,"skills"],[])},onModelChange:(u,f)=>{if(!g)return;const v=g.agents?.list;if(!Array.isArray(v))return;const $=v.findIndex(A=>A&&typeof A=="object"&&"id"in A&&A.id===u);if($<0)return;const S=["agents","list",$,"model"];if(!f){Ze(e,S);return}const k=v[$]?.model;if(k&&typeof k=="object"&&!Array.isArray(k)){const A=k.fallbacks,E={primary:f,...Array.isArray(A)?{fallbacks:A}:{}};_e(e,S,E)}else _e(e,S,f)},onModelFallbacksChange:(u,f)=>{if(!g)return;const v=g.agents?.list;if(!Array.isArray(v))return;const $=v.findIndex(H=>H&&typeof H=="object"&&"id"in H&&H.id===u);if($<0)return;const S=["agents","list",$,"model"],C=v[$],k=f.map(H=>H.trim()).filter(Boolean),A=C.model,T=(()=>{if(typeof A=="string")return A.trim()||null;if(A&&typeof A=="object"&&!Array.isArray(A)){const H=A.primary;if(typeof H=="string")return H.trim()||null}return null})();if(k.length===0){T?_e(e,S,T):Ze(e,S);return}_e(e,S,T?{primary:T,fallbacks:k}:{fallbacks:k})}}):m}

        ${e.tab==="skills"?Ay({loading:e.skillsLoading,report:e.skillsReport,error:e.skillsError,filter:e.skillsFilter,edits:e.skillEdits,messages:e.skillMessages,busyKey:e.skillsBusyKey,onFilterChange:u=>e.skillsFilter=u,onRefresh:()=>Pn(e,{clearMessages:!0}),onToggle:(u,f)=>Ku(e,u,f),onEdit:(u,f)=>ju(e,u,f),onSaveKey:u=>Wu(e,u),onInstall:(u,f,v)=>qu(e,u,f,v)}):m}

        ${e.tab==="nodes"?ny({loading:e.nodesLoading,nodes:e.nodes,devicesLoading:e.devicesLoading,devicesError:e.devicesError,devicesList:e.devicesList,configForm:e.configForm??e.configSnapshot?.config,configLoading:e.configLoading,configSaving:e.configSaving,configDirty:e.configFormDirty,configFormMode:e.configFormMode,execApprovalsLoading:e.execApprovalsLoading,execApprovalsSaving:e.execApprovalsSaving,execApprovalsDirty:e.execApprovalsDirty,execApprovalsSnapshot:e.execApprovalsSnapshot,execApprovalsForm:e.execApprovalsForm,execApprovalsSelectedAgent:e.execApprovalsSelectedAgent,execApprovalsTarget:e.execApprovalsTarget,execApprovalsTargetNodeId:e.execApprovalsTargetNodeId,onRefresh:()=>Ss(e),onDevicesRefresh:()=>bt(e),onDeviceApprove:u=>Lu(e,u),onDeviceReject:u=>Mu(e,u),onDeviceRotate:(u,f,v)=>Iu(e,{deviceId:u,role:f,scopes:v}),onDeviceRevoke:(u,f)=>Ru(e,{deviceId:u,role:f}),onLoadConfig:()=>Ne(e),onLoadExecApprovals:()=>{const u=e.execApprovalsTarget==="node"&&e.execApprovalsTargetNodeId?{kind:"node",nodeId:e.execApprovalsTargetNodeId}:{kind:"gateway"};return la(e,u)},onBindDefault:u=>{u?_e(e,["tools","exec","node"],u):Ze(e,["tools","exec","node"])},onBindAgent:(u,f)=>{const v=["agents","list",u,"tools","exec","node"];f?_e(e,v,f):Ze(e,v)},onSaveBindings:()=>ts(e),onExecApprovalsTargetChange:(u,f)=>{e.execApprovalsTarget=u,e.execApprovalsTargetNodeId=f,e.execApprovalsSnapshot=null,e.execApprovalsForm=null,e.execApprovalsDirty=!1,e.execApprovalsSelectedAgent=null},onExecApprovalsSelectAgent:u=>{e.execApprovalsSelectedAgent=u},onExecApprovalsPatch:(u,f)=>Ou(e,u,f),onExecApprovalsRemove:u=>Bu(e,u),onSaveExecApprovals:()=>{const u=e.execApprovalsTarget==="node"&&e.execApprovalsTargetNodeId?{kind:"node",nodeId:e.execApprovalsTargetNodeId}:{kind:"gateway"};return Nu(e,u)}}):m}

        ${e.tab==="chat"?bb({sessionKey:e.sessionKey,onSessionKeyChange:u=>{e.sessionKey=u,e.chatMessage="",e.chatAttachments=[],e.chatStream=null,e.chatStreamStartedAt=null,e.chatRunId=null,e.chatQueue=[],e.resetToolStream(),e.resetChatScroll(),e.applySettings({...e.settings,sessionKey:u,lastActiveSessionKey:u}),e.loadAssistantIdentity(),Xt(e),is(e)},thinkingLevel:e.chatThinkingLevel,showThinking:r,loading:e.chatLoading,sending:e.chatSending,compactionStatus:e.compactionStatus,assistantAvatarUrl:d,messages:e.chatMessages,toolMessages:e.chatToolMessages,stream:e.chatStream,streamStartedAt:e.chatStreamStartedAt,draft:e.chatMessage,queue:e.chatQueue,connected:e.connected,canSend:e.connected,disabledReason:i,error:e.lastError,sessions:e.sessionsResult,focusMode:o,onRefresh:()=>(e.resetToolStream(),Promise.all([Xt(e),is(e)])),onToggleFocusMode:()=>{e.onboarding||e.applySettings({...e.settings,chatFocusMode:!e.settings.chatFocusMode})},onChatScroll:u=>e.handleChatScroll(u),onDraftChange:u=>e.chatMessage=u,attachments:e.chatAttachments,onAttachmentsChange:u=>e.chatAttachments=u,onSend:()=>e.handleSendChat(),canAbort:!!e.chatRunId,onAbort:()=>{e.handleAbortChat()},onQueueRemove:u=>e.removeQueuedMessage(u),onNewSession:()=>e.handleSendChat("/new",{restoreDraft:!0}),showNewMessages:e.chatNewMessagesBelow&&!e.chatManualRefreshInFlight,onScrollToBottom:()=>e.scrollToBottom(),sidebarOpen:e.sidebarOpen,sidebarContent:e.sidebarContent,sidebarError:e.sidebarError,splitRatio:e.splitRatio,onOpenSidebar:u=>e.handleOpenSidebar(u),onCloseSidebar:()=>e.handleCloseSidebar(),onSplitRatioChange:u=>e.handleSplitRatioChange(u),assistantName:e.assistantName,assistantAvatar:e.assistantAvatar,agentsList:e.agentsList,onSelectAgent:u=>{const f=e.agentsList?.defaultId??"main",v=u===f?"":`agent:${u}:`,$=v?`${v}webchat:main`:"webchat:main";e.sessionKey=$,e.chatMessage="",e.chatAttachments=[],e.chatStream=null,e.chatStreamStartedAt=null,e.chatRunId=null,e.chatQueue=[],e.resetToolStream(),e.resetChatScroll(),e.applySettings({...e.settings,sessionKey:$,lastActiveSessionKey:$}),e.loadAssistantIdentity(),Xt(e),is(e)}}):m}

        ${e.tab==="config"?Sb({raw:e.configRaw,originalRaw:e.configRawOriginal,valid:e.configValid,issues:e.configIssues,loading:e.configLoading,saving:e.configSaving,applying:e.configApplying,updating:e.updateRunning,connected:e.connected,schema:e.configSchema,schemaLoading:e.configSchemaLoading,uiHints:e.configUiHints,formMode:e.configFormMode,formValue:e.configForm,originalValue:e.configFormOriginal,searchQuery:e.configSearchQuery,activeSection:e.configActiveSection,activeSubsection:e.configActiveSubsection,onRawChange:u=>{e.configRaw=u},onFormModeChange:u=>e.configFormMode=u,onFormPatch:(u,f)=>_e(e,u,f),onSearchChange:u=>e.configSearchQuery=u,onSectionChange:u=>{e.configActiveSection=u,e.configActiveSubsection=null},onSubsectionChange:u=>e.configActiveSubsection=u,onReload:()=>Ne(e),onSave:()=>ts(e),onApply:()=>md(e),onUpdate:()=>bd(e)}):m}

        ${e.tab==="debug"?Rb({loading:e.debugLoading,status:e.debugStatus,health:e.debugHealth,models:e.debugModels,heartbeat:e.debugHeartbeat,eventLog:e.eventLog,callMethod:e.debugCallMethod,callParams:e.debugCallParams,callResult:e.debugCallResult,callError:e.debugCallError,onCallMethodChange:u=>e.debugCallMethod=u,onCallParamsChange:u=>e.debugCallParams=u,onRefresh:()=>ks(e),onCall:()=>Bd(e)}):m}

        ${e.tab==="logs"?Ub({loading:e.logsLoading,error:e.logsError,file:e.logsFile,entries:e.logsEntries,filterText:e.logsFilterText,levelFilters:e.logsLevelFilters,autoFollow:e.logsAutoFollow,truncated:e.logsTruncated,onFilterTextChange:u=>e.logsFilterText=u,onLevelToggle:(u,f)=>{e.logsLevelFilters={...e.logsLevelFilters,[u]:f}},onToggleAutoFollow:u=>e.logsAutoFollow=u,onRefresh:()=>Gi(e,{reset:!0}),onExport:(u,f)=>e.exportLogs(u,f),onScroll:u=>e.handleLogsScroll(u)}):m}
      </main>
      ${Db(e)}
      ${Fb(e)}
    </div>
  `}var My=Object.defineProperty,Iy=Object.getOwnPropertyDescriptor,x=(e,t,n,s)=>{for(var i=s>1?void 0:s?Iy(t,n):t,a=e.length-1,o;a>=0;a--)(o=e[a])&&(i=(s?o(t,n,i):o(i))||i);return s&&i&&My(t,n,i),i};const fi=pa({});function Ry(){if(!window.location.search)return!1;const t=new URLSearchParams(window.location.search).get("onboarding");if(!t)return!1;const n=t.trim().toLowerCase();return n==="1"||n==="true"||n==="yes"||n==="on"}let y=class extends Zt{constructor(){super(),this.i18nController=new dd(this),this.settings=Zu(),this.password="",this.tab="chat",this.onboarding=Ry(),this.connected=!1,this.theme=this.settings.theme??"system",this.themeResolved="dark",this.hello=null,this.lastError=null,this.eventLog=[],this.eventLogBuffer=[],this.toolStreamSyncTimer=null,this.sidebarCloseTimer=null,this.assistantName=fi.name,this.assistantAvatar=fi.avatar,this.assistantAgentId=fi.agentId??null,this.sessionKey=this.settings.sessionKey,this.chatLoading=!1,this.chatSending=!1,this.chatMessage="",this.chatMessages=[],this.chatToolMessages=[],this.chatStream=null,this.chatStreamStartedAt=null,this.chatRunId=null,this.compactionStatus=null,this.chatAvatarUrl=null,this.chatThinkingLevel=null,this.chatQueue=[],this.chatAttachments=[],this.chatManualRefreshInFlight=!1,this.sidebarOpen=!1,this.sidebarContent=null,this.sidebarError=null,this.splitRatio=this.settings.splitRatio,this.nodesLoading=!1,this.nodes=[],this.devicesLoading=!1,this.devicesError=null,this.devicesList=null,this.execApprovalsLoading=!1,this.execApprovalsSaving=!1,this.execApprovalsDirty=!1,this.execApprovalsSnapshot=null,this.execApprovalsForm=null,this.execApprovalsSelectedAgent=null,this.execApprovalsTarget="gateway",this.execApprovalsTargetNodeId=null,this.execApprovalQueue=[],this.execApprovalBusy=!1,this.execApprovalError=null,this.pendingGatewayUrl=null,this.configLoading=!1,this.configRaw=`{
}
`,this.configRawOriginal="",this.configValid=null,this.configIssues=[],this.configSaving=!1,this.configApplying=!1,this.updateRunning=!1,this.applySessionKey=this.settings.lastActiveSessionKey,this.configSnapshot=null,this.configSchema=null,this.configSchemaVersion=null,this.configSchemaLoading=!1,this.configUiHints={},this.configForm=null,this.configFormOriginal=null,this.configFormDirty=!1,this.configFormMode="form",this.configSearchQuery="",this.configActiveSection=null,this.configActiveSubsection=null,this.channelsLoading=!1,this.channelsSnapshot=null,this.channelsError=null,this.channelsLastSuccess=null,this.whatsappLoginMessage=null,this.whatsappLoginQrDataUrl=null,this.whatsappLoginConnected=null,this.whatsappBusy=!1,this.nostrProfileFormState=null,this.nostrProfileAccountId=null,this.presenceLoading=!1,this.presenceEntries=[],this.presenceError=null,this.presenceStatus=null,this.agentsLoading=!1,this.agentsList=null,this.agentsError=null,this.agentsSelectedId=null,this.agentsPanel="overview",this.agentFilesLoading=!1,this.agentFilesError=null,this.agentFilesList=null,this.agentFileContents={},this.agentFileDrafts={},this.agentFileActive=null,this.agentFileSaving=!1,this.agentIdentityLoading=!1,this.agentIdentityError=null,this.agentIdentityById={},this.agentSkillsLoading=!1,this.agentSkillsError=null,this.agentSkillsReport=null,this.agentSkillsAgentId=null,this.sessionsLoading=!1,this.sessionsResult=null,this.sessionsError=null,this.sessionsFilterActive="",this.sessionsFilterLimit="120",this.sessionsIncludeGlobal=!0,this.sessionsIncludeUnknown=!1,this.usageLoading=!1,this.usageResult=null,this.usageCostSummary=null,this.usageError=null,this.usageStartDate=(()=>{const e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`})(),this.usageEndDate=(()=>{const e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`})(),this.usageSelectedSessions=[],this.usageSelectedDays=[],this.usageSelectedHours=[],this.usageChartMode="tokens",this.usageDailyChartMode="by-type",this.usageTimeSeriesMode="per-turn",this.usageTimeSeriesBreakdownMode="by-type",this.usageTimeSeries=null,this.usageTimeSeriesLoading=!1,this.usageTimeSeriesCursorStart=null,this.usageTimeSeriesCursorEnd=null,this.usageSessionLogs=null,this.usageSessionLogsLoading=!1,this.usageSessionLogsExpanded=!1,this.usageQuery="",this.usageQueryDraft="",this.usageSessionSort="recent",this.usageSessionSortDir="desc",this.usageRecentSessions=[],this.usageTimeZone="local",this.usageContextExpanded=!1,this.usageHeaderPinned=!1,this.usageSessionsTab="all",this.usageVisibleColumns=["channel","agent","provider","model","messages","tools","errors","duration"],this.usageLogFilterRoles=[],this.usageLogFilterTools=[],this.usageLogFilterHasTools=!1,this.usageLogFilterQuery="",this.usageQueryDebounceTimer=null,this.cronLoading=!1,this.cronJobs=[],this.cronStatus=null,this.cronError=null,this.cronForm={...Wg},this.cronRunsJobId=null,this.cronRuns=[],this.cronBusy=!1,this.skillsLoading=!1,this.skillsReport=null,this.skillsError=null,this.skillsFilter="",this.skillEdits={},this.skillsBusyKey=null,this.skillMessages={},this.debugLoading=!1,this.debugStatus=null,this.debugHealth=null,this.debugModels=[],this.debugHeartbeat=null,this.debugCallMethod="",this.debugCallParams="{}",this.debugCallResult=null,this.debugCallError=null,this.logsLoading=!1,this.logsError=null,this.logsFile=null,this.logsEntries=[],this.logsFilterText="",this.logsLevelFilters={...Kg},this.logsAutoFollow=!0,this.logsTruncated=!1,this.logsCursor=null,this.logsLastFetchAt=null,this.logsLimit=500,this.logsMaxBytes=25e4,this.logsAtBottom=!0,this.client=null,this.chatScrollFrame=null,this.chatScrollTimeout=null,this.chatHasAutoScrolled=!1,this.chatUserNearBottom=!0,this.chatNewMessagesBelow=!1,this.nodesPollInterval=null,this.logsPollInterval=null,this.debugPollInterval=null,this.logsScrollFrame=null,this.toolStreamById=new Map,this.toolStreamOrder=[],this.refreshSessionsAfterChat=new Set,this.basePath="",this.popStateHandler=()=>dg(this),this.themeMedia=null,this.themeMediaHandler=null,this.topbarObserver=null,qi(this.settings.locale)&&Tn.setLocale(this.settings.locale)}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),op(this)}firstUpdated(){rp(this)}disconnectedCallback(){lp(this),super.disconnectedCallback()}updated(e){cp(this,e)}connect(){Pl(this)}handleChatScroll(e){Dd(this,e)}handleLogsScroll(e){Fd(this,e)}exportLogs(e,t){Nd(e,t)}resetToolStream(){Ls(this)}resetChatScroll(){co(this)}scrollToBottom(e){co(this),In(this,!0,!!e?.smooth)}async loadAssistantIdentity(){await Ml(this)}applySettings(e){ht(this,e)}setTab(e){sg(this,e)}setTheme(e,t){ig(this,e,t)}async loadOverview(){await kl(this)}async loadCron(){await gs(this)}async handleAbortChat(){await Tl(this)}removeQueuedMessage(e){Bg(this,e)}async handleSendChat(e,t){await zg(this,e,t)}async handleWhatsAppStart(e){await wd(this,e)}async handleWhatsAppWait(){await kd(this)}async handleWhatsAppLogout(){await Sd(this)}async handleChannelConfigSave(){await Ad(this)}async handleChannelConfigReload(){await Cd(this)}handleNostrProfileEdit(e,t){Ed(this,e,t)}handleNostrProfileCancel(){Ld(this)}handleNostrProfileFieldChange(e,t){Md(this,e,t)}async handleNostrProfileSave(){await Rd(this)}async handleNostrProfileImport(){await Pd(this)}handleNostrProfileToggleAdvanced(){Id(this)}async handleExecApprovalDecision(e){const t=this.execApprovalQueue[0];if(!(!t||!this.client||this.execApprovalBusy)){this.execApprovalBusy=!0,this.execApprovalError=null;try{await this.client.request("exec.approval.resolve",{id:t.id,decision:e}),this.execApprovalQueue=this.execApprovalQueue.filter(n=>n.id!==t.id)}catch(n){this.execApprovalError=`Exec approval failed: ${String(n)}`}finally{this.execApprovalBusy=!1}}}handleGatewayUrlConfirm(){const e=this.pendingGatewayUrl;e&&(this.pendingGatewayUrl=null,ht(this,{...this.settings,gatewayUrl:e}),this.connect())}handleGatewayUrlCancel(){this.pendingGatewayUrl=null}handleOpenSidebar(e){this.sidebarCloseTimer!=null&&(window.clearTimeout(this.sidebarCloseTimer),this.sidebarCloseTimer=null),this.sidebarContent=e,this.sidebarError=null,this.sidebarOpen=!0}handleCloseSidebar(){this.sidebarOpen=!1,this.sidebarCloseTimer!=null&&window.clearTimeout(this.sidebarCloseTimer),this.sidebarCloseTimer=window.setTimeout(()=>{this.sidebarOpen||(this.sidebarContent=null,this.sidebarError=null,this.sidebarCloseTimer=null)},200)}handleSplitRatioChange(e){const t=Math.max(.4,Math.min(.7,e));this.splitRatio=t,this.applySettings({...this.settings,splitRatio:t})}render(){return Ly(this)}};x([w()],y.prototype,"settings",2);x([w()],y.prototype,"password",2);x([w()],y.prototype,"tab",2);x([w()],y.prototype,"onboarding",2);x([w()],y.prototype,"connected",2);x([w()],y.prototype,"theme",2);x([w()],y.prototype,"themeResolved",2);x([w()],y.prototype,"hello",2);x([w()],y.prototype,"lastError",2);x([w()],y.prototype,"eventLog",2);x([w()],y.prototype,"assistantName",2);x([w()],y.prototype,"assistantAvatar",2);x([w()],y.prototype,"assistantAgentId",2);x([w()],y.prototype,"sessionKey",2);x([w()],y.prototype,"chatLoading",2);x([w()],y.prototype,"chatSending",2);x([w()],y.prototype,"chatMessage",2);x([w()],y.prototype,"chatMessages",2);x([w()],y.prototype,"chatToolMessages",2);x([w()],y.prototype,"chatStream",2);x([w()],y.prototype,"chatStreamStartedAt",2);x([w()],y.prototype,"chatRunId",2);x([w()],y.prototype,"compactionStatus",2);x([w()],y.prototype,"chatAvatarUrl",2);x([w()],y.prototype,"chatThinkingLevel",2);x([w()],y.prototype,"chatQueue",2);x([w()],y.prototype,"chatAttachments",2);x([w()],y.prototype,"chatManualRefreshInFlight",2);x([w()],y.prototype,"sidebarOpen",2);x([w()],y.prototype,"sidebarContent",2);x([w()],y.prototype,"sidebarError",2);x([w()],y.prototype,"splitRatio",2);x([w()],y.prototype,"nodesLoading",2);x([w()],y.prototype,"nodes",2);x([w()],y.prototype,"devicesLoading",2);x([w()],y.prototype,"devicesError",2);x([w()],y.prototype,"devicesList",2);x([w()],y.prototype,"execApprovalsLoading",2);x([w()],y.prototype,"execApprovalsSaving",2);x([w()],y.prototype,"execApprovalsDirty",2);x([w()],y.prototype,"execApprovalsSnapshot",2);x([w()],y.prototype,"execApprovalsForm",2);x([w()],y.prototype,"execApprovalsSelectedAgent",2);x([w()],y.prototype,"execApprovalsTarget",2);x([w()],y.prototype,"execApprovalsTargetNodeId",2);x([w()],y.prototype,"execApprovalQueue",2);x([w()],y.prototype,"execApprovalBusy",2);x([w()],y.prototype,"execApprovalError",2);x([w()],y.prototype,"pendingGatewayUrl",2);x([w()],y.prototype,"configLoading",2);x([w()],y.prototype,"configRaw",2);x([w()],y.prototype,"configRawOriginal",2);x([w()],y.prototype,"configValid",2);x([w()],y.prototype,"configIssues",2);x([w()],y.prototype,"configSaving",2);x([w()],y.prototype,"configApplying",2);x([w()],y.prototype,"updateRunning",2);x([w()],y.prototype,"applySessionKey",2);x([w()],y.prototype,"configSnapshot",2);x([w()],y.prototype,"configSchema",2);x([w()],y.prototype,"configSchemaVersion",2);x([w()],y.prototype,"configSchemaLoading",2);x([w()],y.prototype,"configUiHints",2);x([w()],y.prototype,"configForm",2);x([w()],y.prototype,"configFormOriginal",2);x([w()],y.prototype,"configFormDirty",2);x([w()],y.prototype,"configFormMode",2);x([w()],y.prototype,"configSearchQuery",2);x([w()],y.prototype,"configActiveSection",2);x([w()],y.prototype,"configActiveSubsection",2);x([w()],y.prototype,"channelsLoading",2);x([w()],y.prototype,"channelsSnapshot",2);x([w()],y.prototype,"channelsError",2);x([w()],y.prototype,"channelsLastSuccess",2);x([w()],y.prototype,"whatsappLoginMessage",2);x([w()],y.prototype,"whatsappLoginQrDataUrl",2);x([w()],y.prototype,"whatsappLoginConnected",2);x([w()],y.prototype,"whatsappBusy",2);x([w()],y.prototype,"nostrProfileFormState",2);x([w()],y.prototype,"nostrProfileAccountId",2);x([w()],y.prototype,"presenceLoading",2);x([w()],y.prototype,"presenceEntries",2);x([w()],y.prototype,"presenceError",2);x([w()],y.prototype,"presenceStatus",2);x([w()],y.prototype,"agentsLoading",2);x([w()],y.prototype,"agentsList",2);x([w()],y.prototype,"agentsError",2);x([w()],y.prototype,"agentsSelectedId",2);x([w()],y.prototype,"agentsPanel",2);x([w()],y.prototype,"agentFilesLoading",2);x([w()],y.prototype,"agentFilesError",2);x([w()],y.prototype,"agentFilesList",2);x([w()],y.prototype,"agentFileContents",2);x([w()],y.prototype,"agentFileDrafts",2);x([w()],y.prototype,"agentFileActive",2);x([w()],y.prototype,"agentFileSaving",2);x([w()],y.prototype,"agentIdentityLoading",2);x([w()],y.prototype,"agentIdentityError",2);x([w()],y.prototype,"agentIdentityById",2);x([w()],y.prototype,"agentSkillsLoading",2);x([w()],y.prototype,"agentSkillsError",2);x([w()],y.prototype,"agentSkillsReport",2);x([w()],y.prototype,"agentSkillsAgentId",2);x([w()],y.prototype,"sessionsLoading",2);x([w()],y.prototype,"sessionsResult",2);x([w()],y.prototype,"sessionsError",2);x([w()],y.prototype,"sessionsFilterActive",2);x([w()],y.prototype,"sessionsFilterLimit",2);x([w()],y.prototype,"sessionsIncludeGlobal",2);x([w()],y.prototype,"sessionsIncludeUnknown",2);x([w()],y.prototype,"usageLoading",2);x([w()],y.prototype,"usageResult",2);x([w()],y.prototype,"usageCostSummary",2);x([w()],y.prototype,"usageError",2);x([w()],y.prototype,"usageStartDate",2);x([w()],y.prototype,"usageEndDate",2);x([w()],y.prototype,"usageSelectedSessions",2);x([w()],y.prototype,"usageSelectedDays",2);x([w()],y.prototype,"usageSelectedHours",2);x([w()],y.prototype,"usageChartMode",2);x([w()],y.prototype,"usageDailyChartMode",2);x([w()],y.prototype,"usageTimeSeriesMode",2);x([w()],y.prototype,"usageTimeSeriesBreakdownMode",2);x([w()],y.prototype,"usageTimeSeries",2);x([w()],y.prototype,"usageTimeSeriesLoading",2);x([w()],y.prototype,"usageTimeSeriesCursorStart",2);x([w()],y.prototype,"usageTimeSeriesCursorEnd",2);x([w()],y.prototype,"usageSessionLogs",2);x([w()],y.prototype,"usageSessionLogsLoading",2);x([w()],y.prototype,"usageSessionLogsExpanded",2);x([w()],y.prototype,"usageQuery",2);x([w()],y.prototype,"usageQueryDraft",2);x([w()],y.prototype,"usageSessionSort",2);x([w()],y.prototype,"usageSessionSortDir",2);x([w()],y.prototype,"usageRecentSessions",2);x([w()],y.prototype,"usageTimeZone",2);x([w()],y.prototype,"usageContextExpanded",2);x([w()],y.prototype,"usageHeaderPinned",2);x([w()],y.prototype,"usageSessionsTab",2);x([w()],y.prototype,"usageVisibleColumns",2);x([w()],y.prototype,"usageLogFilterRoles",2);x([w()],y.prototype,"usageLogFilterTools",2);x([w()],y.prototype,"usageLogFilterHasTools",2);x([w()],y.prototype,"usageLogFilterQuery",2);x([w()],y.prototype,"cronLoading",2);x([w()],y.prototype,"cronJobs",2);x([w()],y.prototype,"cronStatus",2);x([w()],y.prototype,"cronError",2);x([w()],y.prototype,"cronForm",2);x([w()],y.prototype,"cronRunsJobId",2);x([w()],y.prototype,"cronRuns",2);x([w()],y.prototype,"cronBusy",2);x([w()],y.prototype,"skillsLoading",2);x([w()],y.prototype,"skillsReport",2);x([w()],y.prototype,"skillsError",2);x([w()],y.prototype,"skillsFilter",2);x([w()],y.prototype,"skillEdits",2);x([w()],y.prototype,"skillsBusyKey",2);x([w()],y.prototype,"skillMessages",2);x([w()],y.prototype,"debugLoading",2);x([w()],y.prototype,"debugStatus",2);x([w()],y.prototype,"debugHealth",2);x([w()],y.prototype,"debugModels",2);x([w()],y.prototype,"debugHeartbeat",2);x([w()],y.prototype,"debugCallMethod",2);x([w()],y.prototype,"debugCallParams",2);x([w()],y.prototype,"debugCallResult",2);x([w()],y.prototype,"debugCallError",2);x([w()],y.prototype,"logsLoading",2);x([w()],y.prototype,"logsError",2);x([w()],y.prototype,"logsFile",2);x([w()],y.prototype,"logsEntries",2);x([w()],y.prototype,"logsFilterText",2);x([w()],y.prototype,"logsLevelFilters",2);x([w()],y.prototype,"logsAutoFollow",2);x([w()],y.prototype,"logsTruncated",2);x([w()],y.prototype,"logsCursor",2);x([w()],y.prototype,"logsLastFetchAt",2);x([w()],y.prototype,"logsLimit",2);x([w()],y.prototype,"logsMaxBytes",2);x([w()],y.prototype,"logsAtBottom",2);x([w()],y.prototype,"chatNewMessagesBelow",2);y=x([Fr("openclaw-app")],y);
//# sourceMappingURL=index-DwqYDu3d.js.map
