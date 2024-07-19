(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))l(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&l(o)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function l(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();const ve=(e,t)=>e===t,X=Symbol("solid-proxy"),we=Symbol("solid-track"),D={equals:ve};let ue=he;const E=1,F=2,ce={owned:null,cleanups:null,context:null,owner:null};var y=null;let Q=null,be=null,g=null,w=null,P=null,V=0;function Y(e,t){const n=g,l=y,s=e.length===0,i=t===void 0?l:t,o=s?ce:{owned:null,cleanups:null,context:i?i.context:null,owner:i},r=s?e:()=>e(()=>x(()=>G(o)));y=o,g=null;try{return M(r,!0)}finally{g=n,y=l}}function b(e,t){t=t?Object.assign({},D,t):D;const n={value:e,observers:null,observerSlots:null,comparator:t.equals||void 0},l=s=>(typeof s=="function"&&(s=s(n.value)),de(n,s));return[fe.bind(n),l]}function m(e,t,n){const l=ee(e,t,!1,E);B(l)}function me(e,t,n){ue=Ae;const l=ee(e,t,!1,E);l.user=!0,P?P.push(l):B(l)}function $(e,t,n){n=n?Object.assign({},D,n):D;const l=ee(e,t,!0,0);return l.observers=null,l.observerSlots=null,l.comparator=n.equals||void 0,B(l),fe.bind(l)}function ne(e){return M(e,!1)}function x(e){if(g===null)return e();const t=g;g=null;try{return e()}finally{g=t}}function $e(e,t,n){const l=Array.isArray(e);let s;return i=>{let o;if(l){o=Array(e.length);for(let u=0;u<e.length;u++)o[u]=e[u]()}else o=e();const r=x(()=>t(o,s,i));return s=o,r}}function ae(e){return y===null||(y.cleanups===null?y.cleanups=[e]:y.cleanups.push(e)),e}function Ce(e){const t=$(e),n=$(()=>J(t()));return n.toArray=()=>{const l=n();return Array.isArray(l)?l:l!=null?[l]:[]},n}function fe(){if(this.sources&&this.state)if(this.state===E)B(this);else{const e=w;w=null,M(()=>K(this),!1),w=e}if(g){const e=this.observers?this.observers.length:0;g.sources?(g.sources.push(this),g.sourceSlots.push(e)):(g.sources=[this],g.sourceSlots=[e]),this.observers?(this.observers.push(g),this.observerSlots.push(g.sources.length-1)):(this.observers=[g],this.observerSlots=[g.sources.length-1])}return this.value}function de(e,t,n){let l=e.value;return(!e.comparator||!e.comparator(l,t))&&(e.value=t,e.observers&&e.observers.length&&M(()=>{for(let s=0;s<e.observers.length;s+=1){const i=e.observers[s],o=Q&&Q.running;o&&Q.disposed.has(i),(o?!i.tState:!i.state)&&(i.pure?w.push(i):P.push(i),i.observers&&_e(i)),o||(i.state=E)}if(w.length>1e6)throw w=[],new Error},!1)),t}function B(e){if(!e.fn)return;G(e);const t=V;xe(e,e.value,t)}function xe(e,t,n){let l;const s=y,i=g;g=y=e;try{l=e.fn(t)}catch(o){return e.pure&&(e.state=E,e.owned&&e.owned.forEach(G),e.owned=null),e.updatedAt=n+1,pe(o)}finally{g=i,y=s}(!e.updatedAt||e.updatedAt<=n)&&(e.updatedAt!=null&&"observers"in e?de(e,l):e.value=l,e.updatedAt=n)}function ee(e,t,n,l=E,s){const i={fn:e,state:l,updatedAt:null,owned:null,sources:null,sourceSlots:null,cleanups:null,value:t,owner:y,context:y?y.context:null,pure:n};return y===null||y!==ce&&(y.owned?y.owned.push(i):y.owned=[i]),i}function R(e){if(e.state===0)return;if(e.state===F)return K(e);if(e.suspense&&x(e.suspense.inFallback))return e.suspense.effects.push(e);const t=[e];for(;(e=e.owner)&&(!e.updatedAt||e.updatedAt<V);)e.state&&t.push(e);for(let n=t.length-1;n>=0;n--)if(e=t[n],e.state===E)B(e);else if(e.state===F){const l=w;w=null,M(()=>K(e,t[0]),!1),w=l}}function M(e,t){if(w)return e();let n=!1;t||(w=[]),P?n=!0:P=[],V++;try{const l=e();return Se(n),l}catch(l){n||(P=null),w=null,pe(l)}}function Se(e){if(w&&(he(w),w=null),e)return;const t=P;P=null,t.length&&M(()=>ue(t),!1)}function he(e){for(let t=0;t<e.length;t++)R(e[t])}function Ae(e){let t,n=0;for(t=0;t<e.length;t++){const l=e[t];l.user?e[n++]=l:R(l)}for(t=0;t<n;t++)R(e[t])}function K(e,t){e.state=0;for(let n=0;n<e.sources.length;n+=1){const l=e.sources[n];if(l.sources){const s=l.state;s===E?l!==t&&(!l.updatedAt||l.updatedAt<V)&&R(l):s===F&&K(l,t)}}}function _e(e){for(let t=0;t<e.observers.length;t+=1){const n=e.observers[t];n.state||(n.state=F,n.pure?w.push(n):P.push(n),n.observers&&_e(n))}}function G(e){let t;if(e.sources)for(;e.sources.length;){const n=e.sources.pop(),l=e.sourceSlots.pop(),s=n.observers;if(s&&s.length){const i=s.pop(),o=n.observerSlots.pop();l<s.length&&(i.sourceSlots[o]=l,s[l]=i,n.observerSlots[l]=o)}}if(e.owned){for(t=e.owned.length-1;t>=0;t--)G(e.owned[t]);e.owned=null}if(e.cleanups){for(t=e.cleanups.length-1;t>=0;t--)e.cleanups[t]();e.cleanups=null}e.state=0}function ke(e){return e instanceof Error?e:new Error(typeof e=="string"?e:"Unknown error",{cause:e})}function pe(e,t=y){throw ke(e)}function J(e){if(typeof e=="function"&&!e.length)return J(e());if(Array.isArray(e)){const t=[];for(let n=0;n<e.length;n++){const l=J(e[n]);Array.isArray(l)?t.push.apply(t,l):t.push(l)}return t}return e}const le=Symbol("fallback");function se(e){for(let t=0;t<e.length;t++)e[t]()}function Te(e,t,n={}){let l=[],s=[],i=[],o=[],r=0,u;return ae(()=>se(i)),()=>{const c=e()||[];return c[we],x(()=>{if(c.length===0)return r!==0&&(se(i),i=[],l=[],s=[],r=0,o=[]),n.fallback&&(l=[le],s[0]=Y(d=>(i[0]=d,n.fallback())),r=1),s;for(l[0]===le&&(i[0](),i=[],l=[],s=[],r=0),u=0;u<c.length;u++)u<l.length&&l[u]!==c[u]?o[u](()=>c[u]):u>=l.length&&(s[u]=Y(a));for(;u<l.length;u++)i[u]();return r=o.length=i.length=c.length,l=c.slice(0),s=s.slice(0,r)});function a(d){i[u]=d;const[_,v]=b(c[u]);return o[u]=v,t(_,u)}}}let Pe=!1;function f(e,t){return x(()=>e(t||{}))}function U(){return!0}const Ee={get(e,t,n){return t===X?n:e.get(t)},has(e,t){return t===X?!0:e.has(t)},set:U,deleteProperty:U,getOwnPropertyDescriptor(e,t){return{configurable:!0,enumerable:!0,get(){return e.get(t)},set:U,deleteProperty:U}},ownKeys(e){return e.keys()}};function W(e){return(e=typeof e=="function"?e():e)?e:{}}function Ne(){for(let e=0,t=this.length;e<t;++e){const n=this[e]();if(n!==void 0)return n}}function k(...e){let t=!1;for(let o=0;o<e.length;o++){const r=e[o];t=t||!!r&&X in r,e[o]=typeof r=="function"?(t=!0,$(r)):r}if(t)return new Proxy({get(o){for(let r=e.length-1;r>=0;r--){const u=W(e[r])[o];if(u!==void 0)return u}},has(o){for(let r=e.length-1;r>=0;r--)if(o in W(e[r]))return!0;return!1},keys(){const o=[];for(let r=0;r<e.length;r++)o.push(...Object.keys(W(e[r])));return[...new Set(o)]}},Ee);const n={},l=Object.create(null);for(let o=e.length-1;o>=0;o--){const r=e[o];if(!r)continue;const u=Object.getOwnPropertyNames(r);for(let c=u.length-1;c>=0;c--){const a=u[c];if(a==="__proto__"||a==="constructor")continue;const d=Object.getOwnPropertyDescriptor(r,a);if(!l[a])l[a]=d.get?{enumerable:!0,configurable:!0,get:Ne.bind(n[a]=[d.get.bind(r)])}:d.value!==void 0?d:void 0;else{const _=n[a];_&&(d.get?_.push(d.get.bind(r)):d.value!==void 0&&_.push(()=>d.value))}}}const s={},i=Object.keys(l);for(let o=i.length-1;o>=0;o--){const r=i[o],u=l[r];u&&u.get?Object.defineProperty(s,r,u):s[r]=u?u.value:void 0}return s}const ge=e=>`Stale read from <${e}>.`;function Oe(e){const t="fallback"in e&&{fallback:()=>e.fallback};return $(Te(()=>e.each,e.children,t||void 0))}function A(e){const t=e.keyed,n=$(()=>e.when,void 0,{equals:(l,s)=>t?l===s:!l==!s});return $(()=>{const l=n();if(l){const s=e.children;return typeof s=="function"&&s.length>0?x(()=>s(t?l:()=>{if(!x(n))throw ge("Show");return e.when})):s}return e.fallback},void 0,void 0)}function Le(e){let t=!1;const n=(i,o)=>(t?i[1]===o[1]:!i[1]==!o[1])&&i[2]===o[2],l=Ce(()=>e.children),s=$(()=>{let i=l();Array.isArray(i)||(i=[i]);for(let o=0;o<i.length;o++){const r=i[o].when;if(r)return t=!!i[o].keyed,[o,r,i[o]]}return[-1]},void 0,{equals:n});return $(()=>{const[i,o,r]=s();if(i<0)return e.fallback;const u=r.children;return typeof u=="function"&&u.length>0?x(()=>u(t?o:()=>{if(x(s)[0]!==i)throw ge("Match");return r.when})):u},void 0,void 0)}function H(e){return e}function Me(e,t,n){let l=n.length,s=t.length,i=l,o=0,r=0,u=t[s-1].nextSibling,c=null;for(;o<s||r<i;){if(t[o]===n[r]){o++,r++;continue}for(;t[s-1]===n[i-1];)s--,i--;if(s===o){const a=i<l?r?n[r-1].nextSibling:n[i-r]:u;for(;r<i;)e.insertBefore(n[r++],a)}else if(i===r)for(;o<s;)(!c||!c.has(t[o]))&&t[o].remove(),o++;else if(t[o]===n[i-1]&&n[r]===t[s-1]){const a=t[--s].nextSibling;e.insertBefore(n[r++],t[o++].nextSibling),e.insertBefore(n[--i],a),t[s]=n[i]}else{if(!c){c=new Map;let d=r;for(;d<i;)c.set(n[d],d++)}const a=c.get(t[o]);if(a!=null)if(r<a&&a<i){let d=o,_=1,v;for(;++d<s&&d<i&&!((v=c.get(t[d]))==null||v!==a+_);)_++;if(_>a-r){const S=t[o];for(;r<a;)e.insertBefore(n[r++],S)}else e.replaceChild(n[r++],t[o++])}else o++;else t[o++].remove()}}}function Be(e,t,n,l={}){let s;return Y(i=>{s=i,t===document?e():h(t,e(),t.firstChild?null:void 0,n)},l.owner),()=>{s(),t.textContent=""}}function p(e,t,n){let l;const s=()=>{const o=document.createElement("template");return o.innerHTML=e,n?o.content.firstChild.firstChild:o.content.firstChild},i=t?()=>x(()=>document.importNode(l||(l=s()),!0)):()=>(l||(l=s())).cloneNode(!0);return i.cloneNode=i,i}function je(e,t,n){e.removeAttribute(t)}function C(e,t){t==null?e.removeAttribute("class"):e.className=t}function Ue(e,t,n){if(!t)return n?je(e,"style"):t;const l=e.style;if(typeof t=="string")return l.cssText=t;typeof n=="string"&&(l.cssText=n=void 0),n||(n={}),t||(t={});let s,i;for(i in n)t[i]==null&&l.removeProperty(i),delete n[i];for(i in t)s=t[i],s!==n[i]&&(l.setProperty(i,s),n[i]=s);return n}function h(e,t,n,l){if(n!==void 0&&!l&&(l=[]),typeof t!="function")return q(e,t,l,n);m(s=>q(e,t(),s,n),l)}function q(e,t,n,l,s){for(;typeof n=="function";)n=n();if(t===n)return n;const i=typeof t,o=l!==void 0;if(e=o&&n[0]&&n[0].parentNode||e,i==="string"||i==="number"){if(i==="number"&&(t=t.toString(),t===n))return n;if(o){let r=n[0];r&&r.nodeType===3?r.data!==t&&(r.data=t):r=document.createTextNode(t),n=L(e,n,l,r)}else n!==""&&typeof n=="string"?n=e.firstChild.data=t:n=e.textContent=t}else if(t==null||i==="boolean")n=L(e,n,l);else{if(i==="function")return m(()=>{let r=t();for(;typeof r=="function";)r=r();n=q(e,r,n,l)}),()=>n;if(Array.isArray(t)){const r=[],u=n&&Array.isArray(n);if(Z(r,t,n,s))return m(()=>n=q(e,r,n,l,!0)),()=>n;if(r.length===0){if(n=L(e,n,l),o)return n}else u?n.length===0?ie(e,r,l):Me(e,n,r):(n&&L(e),ie(e,r));n=r}else if(t.nodeType){if(Array.isArray(n)){if(o)return n=L(e,n,l,t);L(e,n,null,t)}else n==null||n===""||!e.firstChild?e.appendChild(t):e.replaceChild(t,e.firstChild);n=t}}return n}function Z(e,t,n,l){let s=!1;for(let i=0,o=t.length;i<o;i++){let r=t[i],u=n&&n[e.length],c;if(!(r==null||r===!0||r===!1))if((c=typeof r)=="object"&&r.nodeType)e.push(r);else if(Array.isArray(r))s=Z(e,r,u)||s;else if(c==="function")if(l){for(;typeof r=="function";)r=r();s=Z(e,Array.isArray(r)?r:[r],Array.isArray(u)?u:[u])||s}else e.push(r),s=!0;else{const a=String(r);u&&u.nodeType===3&&u.data===a?e.push(u):e.push(document.createTextNode(a))}}return s}function ie(e,t,n=null){for(let l=0,s=t.length;l<s;l++)e.insertBefore(t[l],n)}function L(e,t,n,l){if(n===void 0)return e.textContent="";const s=l||document.createTextNode("");if(t.length){let i=!1;for(let o=t.length-1;o>=0;o--){const r=t[o];if(s!==r){const u=r.parentNode===e;!i&&!o?u?e.replaceChild(s,r):e.insertBefore(s,n):u&&r.remove()}else i=!0}}else e.insertBefore(s,n);return[s]}var He=p('<svg><path d="M282.483,361.931L282.483,361.931c0,0,44.323,44.323,79.448-8.828c18.282-27.666,5.888-54.616-13.603-73.242    l-83.906-82.635c-4.723-4.025-11.979-4.025-16.711,0l-85.124,82.635c-16.746,17.523-31.011,45.506-12.518,73.242    c35.31,52.966,79.448,8.828,79.448,8.828c0,22.625-6.444,51.703-8.324,59.683c-0.256,1.112,0.6,2.11,1.739,2.11h66.145    c1.139,0,1.986-0.997,1.73-2.101C288.936,413.617,282.483,384.415,282.483,361.931"></svg>',!1,!0),Ie=p('<svg><polygon points="256,176.552 150.069,308.966 256,441.379 361.931,308.966   "></svg>',!1,!0),De=p('<svg><path d="M256,238.345c9.507-24.214,29.625-44.138,54.881-44.138c21.257,0,40.201,9.993,52.966,26.483    c16.013,20.692,27.33,66.754-7.715,101.8C338.353,340.268,256,423.724,256,423.724s-82.353-83.456-100.131-101.235    c-35.046-35.046-23.729-81.108-7.715-101.8c12.765-16.49,31.709-26.483,52.966-26.483    C226.375,194.207,246.493,214.131,256,238.345"></svg>',!1,!0),Fe=p('<svg><path d="M282.482,370.759c0,21.91,6.047,43.82,8.13,50.732c0.344,1.139-0.521,2.233-1.704,2.233h-65.827    c-1.183,0-2.039-1.095-1.704-2.225c2.074-6.947,8.139-29.096,8.139-50.741c-8.722,6.321-18.803,9.578-29.917,9.578    c-32.274,0-60.275-27.101-58.253-59.78c1.13-18.379,12.835-34.145,28.425-43.926c15.651-9.825,30.164-10.611,43.14-7.459    c-8.298-9.825-13.312-22.502-13.312-36.361c0-34.834,31.576-62.296,67.663-55.314c22.59,4.361,40.545,22.925,44.332,45.612    c2.948,17.602-2.304,33.986-12.5,46.062c13.065-3.169,27.692-2.348,43.467,7.662c15.519,9.852,27.18,25.582,28.248,43.926    c1.889,32.591-26.2,59.577-58.403,59.577C301.444,380.337,291.045,376.947,282.482,370.759"></svg>',!1,!0),Re=p('<div class=suit><svg width=100% height=100% viewBox="0 0 512 512">'),Ke=p("<div><div class=inner><div><div class=rank></div><div class=suit-left> <!> </div><div class=suit-middle> <!> </div></div><div class=back>"),qe=p("<div><div class=card-holder>"),ye=p("<div>"),Ve=p("<div class=hand>"),Ge=p("<div class=middle><div><span></span></div><div class=ftr>"),Qe=p("<span><span>li"),We=p('<span class="inline chips"><span>li'),Xe=p("<div><div class=handle><span>Handle</span></div><div class=stack-wrap><div class=bets></div><div> <h3>Stack</h3> "),Ye=p("<div class=turn-left><div class=bar>"),Je=p("<span>Fold"),Ze=p("<span>Check"),ze=p("<span>Call"),et=p("<span class=raise>Raise "),tt=p("<div class=event><span class=name>Texas No-Limit Hold'em Headsup Tournament</span><span class=desc>A Texas No-Limit Hold'em Headsup Tournament organized by liheadsup</span><span class=players><span>Players Left:</span> <span>3</span></span><span class=blinds><span>Blinds:</span> <span>/</span></span><span class=next-level><span>Next Level:</span> 02:00 </span><span class=prize><span>Prize:"),nt=p("<div class=logo><span>li</span><span>headsup"),lt=p("<div class=dealer><div class=card-wrap><div class=card-holder></div></div><div><h3>Main Pots"),st=p("<div class=people>"),it=p("<div class=hands><div class=buttons><button>Deal Cards</button><button>Deal Flop</button><button>Deal Rest</button><button>Collect Cards"),rt=p("<div class=showcase>"),ot=p("<section><h2></h2><div class=area>");const ut=["one","two","three","four","five","six"],ct=e=>{if(e.raise)return"raise";if(e.fold)return"fold";if(e.check)return"check";if(e.call)return"call"},at=e=>{switch(e){case"d":return"diamonds";case"h":return"hearts";case"c":return"clubs";case"s":return"spades"}},re=e=>(()=>{var t=Re(),n=t.firstChild;return h(n,f(Le,{get children(){return[f(H,{get when(){return e.suit==="s"},get children(){return He()}}),f(H,{get when(){return e.suit==="d"},get children(){return Ie()}}),f(H,{get when(){return e.suit==="h"},get children(){return De()}}),f(H,{get when(){return e.suit==="c"},get children(){return Fe()}})]}})),t})(),ft=e=>{let[t,n]=e.card.split("");t=t.replace("T","10");let l=$(()=>e.class?"card "+e.class:"card");return(()=>{var s=Ke(),i=s.firstChild,o=i.firstChild,r=o.firstChild,u=r.nextSibling,c=u.firstChild,a=c.nextSibling;a.nextSibling;var d=u.nextSibling,_=d.firstChild,v=_.nextSibling;return v.nextSibling,h(r,t),h(u,f(re,{suit:n}),a),h(d,f(re,{suit:n}),v),m(S=>{var j=l(),te="front decoration "+at(n);return j!==S.e&&C(s,S.e=j),te!==S.t&&C(o,S.t=te),S},{e:void 0,t:void 0}),s})()},N=e=>(()=>{var t=qe();return t.firstChild,h(t,f(A,{get when(){return e.card.value},children:n=>(()=>{var l=ye();return h(l,f(ft,{get class(){return e.card.klass},get card(){return n()}})),m(()=>C(l,"elevate "+e.elevate.klass)),l})()}),null),m(()=>C(t,"card-wrap "+(e.class??""))),t})(),dt=e=>(()=>{var t=Ve();return h(t,f(N,k(()=>e.hand[0])),null),h(t,f(N,k(()=>e.hand[1])),null),t})(),ht=e=>(()=>{var t=Ge(),n=t.firstChild,l=n.firstChild,s=n.nextSibling;return h(l,()=>e.showdown_info.value),h(s,f(N,k({get class(){return"flop "+e.flop[0].card.klass}},()=>e.flop[0])),null),h(s,f(N,k({get class(){return"flop "+e.flop[1].card.klass}},()=>e.flop[1])),null),h(s,f(N,k({get class(){return"flop "+e.flop[2].card.klass}},()=>e.flop[2])),null),h(s,f(N,k({get class(){return"turn "+e.turn.card.klass}},()=>e.turn)),null),h(s,f(N,k({get class(){return"river "+e.river.card.klass}},()=>e.river)),null),m(()=>C(n,"showdown-info "+e.showdown_info.klass)),t})(),z=e=>[" ",(()=>{var t=Qe(),n=t.firstChild;return h(t,()=>e.chips,n),m(()=>C(t,"pot chips "+(e.class??""))),t})()," "],I=e=>[" ",(()=>{var t=We(),n=t.firstChild;return h(t,()=>e.chips,n),t})()," "],_t=e=>{const t=$(()=>{let n=e.state.value,l="";return n==="@"&&(l+=" turn"),n==="i"&&(l+=" in"),n==="f"&&(l+=" folded"),l+=" "+e.class,l});return(()=>{var n=Xe(),l=n.firstChild;l.firstChild;var s=l.nextSibling,i=s.firstChild,o=i.nextSibling,r=o.firstChild,u=r.nextSibling;return u.nextSibling,h(l,f(dt,e),null),h(s,f(A,{get when(){return e.turn_left.value},children:c=>(()=>{var a=Ye(),d=a.firstChild;return m(_=>Ue(d,`width: ${c()}%;`,_)),a})()}),i),h(i,f(A,{get when(){return e.bet.value},children:c=>[(()=>{var a=ye();return h(a,f(A,{get when(){return c().raise},children:d=>(()=>{var _=et();return _.firstChild,h(_,f(I,{get chips(){return d()}}),null),_})()}),null),h(a,f(A,{get when(){return c().fold},get children(){return Je()}}),null),h(a,f(A,{get when(){return c().check},get children(){return Ze()}}),null),h(a,f(A,{get when(){return c().call},get children(){return ze()}}),null),m(()=>C(a,["bet",e.bet.klass,ct(c())].join(" "))),a})(),f(A,{get when(){return c().chips},children:a=>f(z,{get chips(){return a()}})})]})),h(o,f(z,{get chips(){return e.chips.value??0}}),null),m(c=>{var a="person "+t(),d="stack "+e.chips.klass;return a!==c.e&&C(n,c.e=a),d!==c.t&&C(o,c.t=d),c},{e:void 0,t:void 0}),n})()},pt=()=>(()=>{var e=tt(),t=e.firstChild,n=t.nextSibling,l=n.nextSibling,s=l.nextSibling,i=s.firstChild,o=i.nextSibling,r=o.nextSibling,u=r.firstChild,c=s.nextSibling,a=c.nextSibling;return a.firstChild,h(r,f(I,{chips:10}),u),h(r,f(I,{chips:20}),null),h(a,f(I,{chips:3e3}),null),e})(),gt=e=>[nt(),(()=>{var t=lt(),n=t.firstChild,l=n.nextSibling;return l.firstChild,h(t,f(pt,{}),n),h(t,f(ht,k(()=>e.middle)),l),h(l,f(A,{get when(){return e.pot.value},children:s=>f(z,{class:"pop",get chips(){return s()}})}),null),m(()=>C(l,"pots pops "+e.pot.klass)),t})(),(()=>{var t=st();return h(t,f(Oe,{get each(){return e.people},children:n=>f(_t,k(n))})),t})()],oe=e=>{const[t,n]=b(ut[e-1]),[l,s]=b(void 0),[i,o]=b(void 0),[r,u]=b(void 0),[c,a]=b(void 0);let d=yt({init_delay:300,update_delay:2e3,exit_delay:300}),_=T(l,{init_delay:100,update_delay:200,exit_delay:300}),v=T(i,{init_delay:300,update_delay:2e3,exit_delay:300}),S=T(r,{init_delay:300,update_delay:2e3,exit_delay:300}),j=T(c,{init_delay:300,update_delay:2e3,exit_delay:300});return{_set_chips:s,turn_left:j,hand:d.cards,chips:_,state:v,bet:S,get class(){return t()}}},O=e=>{const[t,n]=b(void 0),l=T(t,e),[s,i]=b(void 0),o=T(s,{update_delay:8e3}),[r,u]=b(void 0),c=T(r,e);return{card:l,elevate:o,back:c,_set_card:n,_set_elevate:i,_set_back:u}},yt=e=>({cards:[O(e),O(e)],_set_cards(t){this.cards[0]._set_card(t==null?void 0:t[0]),this.cards[1]._set_card(t==null?void 0:t[1])}}),vt=e=>({cards:[O(e),O(e),O(e)],_set_cards(t){this.cards[0]._set_card(t==null?void 0:t[0]),this.cards[1]._set_card(t==null?void 0:t[1]),this.cards[2]._set_card(t==null?void 0:t[2])}}),wt=()=>{const[e,t]=b(void 0),[n,l]=b([oe(1),oe(2)]),[s,i]=b(void 0);let o=vt({init_delay:300,update_delay:2e3,exit_delay:300}),r=O({init_delay:2e3,update_delay:3e3,exit_delay:300}),u=O({init_delay:4e3,update_delay:3e3,exit_delay:300}),c=T(e,{update_delay:300,exit_delay:1e3}),a=T(s,{update_delay:6e3,exit_delay:1e3});const d=$(()=>({flop:o.cards,turn:r,river:u,showdown_info:a})),_=$(()=>n());return{pot:c,get middle(){return d()},get people(){return _()},set flop(v){o._set_cards(v)},set turn(v){r._set_card(v)},set river(v){u._set_card(v)},set total_pot(v){t(v)}}},bt=()=>{const e=wt();return setTimeout(()=>{e.flop=["Ah","Ac","Ad"],e.turn="Td",e.river="Ts",e.total_pot=100,e.people[0]._set_chips(1e3)},1e3),setTimeout(()=>{e.total_pot=2e3,e.people[0]._set_chips(100)},5e3),setTimeout(()=>{e.turn=void 0,e.river=void 0,e.total_pot=void 0},1e4),(()=>{var t=rt();return h(t,f(mt,{header:"Card",get children(){var n=it(),l=n.firstChild;return h(n,f(gt,e),l),n}})),t})()},mt=e=>(()=>{var t=ot(),n=t.firstChild,l=n.nextSibling;return h(n,()=>e.header),h(l,()=>e.children),t})(),T=function(e,t){let n=(t.init_delay??0)+300,l=n+(t.update_delay??0),s=l+(t.exit_delay??0);const[i,o]=b("updatable"),[r,u]=b(void 0);return me($e(e,(c,a)=>{let d,_;a&&!c?(o("updatable exiting"),_=setTimeout(()=>{ne(()=>{u(void 0),o("updatable")})},s)):a!==c&&(o("updatable init"),_=setTimeout(()=>{ne(()=>{o("updatable updating"),u(()=>c)})},n),d=setTimeout(()=>{o("updatable updated")},l)),ae(()=>{u(()=>c),o("updatable"),clearTimeout(_),clearTimeout(d)})})),{get klass(){return i()},get value(){return r()}}};function $t(){return f(bt,{})}const Ct=document.getElementById("root");Be(()=>f($t,{}),Ct);
