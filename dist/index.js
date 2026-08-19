"use strict";(()=>{var kt=Object.defineProperty;var At=(e,t,n)=>t in e?kt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var h=(e,t,n)=>At(e,typeof t!="symbol"?t+"":t,n);var Lt=`
    #mc-debug-panel{
      position:fixed;top:16px;right:16px;z-index:2147483647;
      width:340px;max-height:calc(100vh - 32px);overflow-y:auto;
      padding:16px;color:#fff;background:#2a2722;
      border:1px solid rgba(255,255,255,.16);border-radius:12px;
      box-shadow:0 20px 60px rgba(0,0,0,.45);
      font:12px/1.4 'Poppins',Arial,Helvetica,sans-serif;
      -webkit-font-smoothing:antialiased
    }
    #mc-debug-panel *{box-sizing:border-box}
    .mc-debug-brand{display:flex;align-items:center;margin:-16px -16px 20px;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.12)}
    .mc-debug-logo{display:block;width:172px;max-width:100%;height:auto}
    .mc-debug-global{margin-bottom:20px;padding:0 0 20px;border-bottom:1px solid rgba(255,255,255,.12)}
    .mc-debug-global-title,.mc-debug-group-title{margin-bottom:9px;color:#00ffff;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
    .mc-debug-motion{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:4px;background:rgba(255,255,255,.055);border-radius:7px}
    .mc-debug-motion button{appearance:none;border:0;border-radius:5px;padding:7px 6px;background:transparent;color:rgba(255,255,255,.55);font:10px/1 'Poppins',Arial,Helvetica,sans-serif;cursor:pointer}
    .mc-debug-motion button:hover{color:#fff;background:rgba(255,255,255,.06)}
    .mc-debug-motion button.is-active{color:#2a2722;background:#00ffff;font-weight:700}
    .mc-debug-group{margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,.12)}
    .mc-debug-group:first-of-type{margin-top:0}
    .mc-debug-group-title{margin-bottom:14px}
    .mc-debug-section+.mc-debug-section{margin-top:18px;padding-top:18px;border-top:1px solid rgba(255,255,255,.08)}
    .mc-debug-title{margin-bottom:14px;color:rgba(255,255,255,.9);font-weight:700}
    .mc-debug-stats{display:grid;grid-template-columns:1fr auto;gap:5px 12px;margin:-3px 0 16px;padding:10px;background:rgba(255,255,255,.055);border-radius:6px;color:rgba(255,255,255,.64);font-size:10px}
    .mc-debug-stats strong{color:#fff;font-weight:600;font-variant-numeric:tabular-nums}
    .mc-debug-control{display:block;margin-bottom:16px}
    .mc-debug-control:last-child{margin-bottom:0}
    .mc-debug-row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:7px}
    .mc-debug-label{color:rgba(255,255,255,.82)}
    .mc-debug-value{color:#00ffff;font-variant-numeric:tabular-nums}
    .mc-debug-control input[type=range]{--mc-range-progress:50%;-webkit-appearance:none;appearance:none;display:block;width:100%;height:16px;margin:0;background:transparent;cursor:pointer}
    .mc-debug-control input[type=range]::-webkit-slider-runnable-track{height:4px;border-radius:999px;background:linear-gradient(to right,#00ffff 0%,#00ffff var(--mc-range-progress),rgba(255,255,255,.14) var(--mc-range-progress),rgba(255,255,255,.14) 100%)}
    .mc-debug-control input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;margin-top:-5px;border:2px solid #2a2722;border-radius:50%;background:#00ffff;box-shadow:0 0 0 1px #00ffff}
    .mc-debug-control input[type=range]::-moz-range-track{height:4px;border-radius:999px;background:rgba(255,255,255,.14)}
    .mc-debug-control input[type=range]::-moz-range-progress{height:4px;border-radius:999px;background:#00ffff}
    .mc-debug-control input[type=range]::-moz-range-thumb{width:14px;height:14px;border:2px solid #2a2722;border-radius:50%;background:#00ffff}
    .mc-debug-button{appearance:none;width:100%;margin-top:14px;padding:9px 12px;border:1px solid #00ffff;border-radius:6px;background:transparent;color:#00ffff;font:600 10px/1 'Poppins',Arial,Helvetica,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
    .mc-debug-button:hover{background:#00ffff;color:#2a2722}
    .mc-debug-button:active{transform:translateY(1px)}
    .mc-debug-status{margin-bottom:12px;padding:10px;background:rgba(255,255,255,.06);border-radius:6px;color:rgba(255,255,255,.65);white-space:pre-wrap}
  `,me=()=>(window.MC||(window.MC={}),window.MC),Ft=()=>{let e=me();if(e.motion)return e.motion;let t="(prefers-reduced-motion: reduce)",n="data-mc-reduced-motion",r=()=>{document.documentElement.setAttribute(n,e.motion?.reduced?"true":"false")};e.motion={mode:"system",get systemReduced(){return!!window.matchMedia?.(t).matches},get reduced(){return this.mode==="reduce"?!0:this.mode==="full"?!1:this.systemReduced},setMode(i){["system","reduce","full"].includes(i)&&(this.mode=i,r(),window.dispatchEvent(new CustomEvent("mcMotionPreferenceChange",{detail:{mode:this.mode,reduced:this.reduced,systemReduced:this.systemReduced}})))},refresh(){r(),window.dispatchEvent(new CustomEvent("mcMotionPreferenceChange",{detail:{mode:this.mode,reduced:this.reduced,systemReduced:this.systemReduced}}))}},r();let o=window.matchMedia?.(t);if(o){let i=()=>{me().motion?.mode==="system"&&me().motion?.refresh()};typeof o.addEventListener=="function"?o.addEventListener("change",i):typeof o.addListener=="function"&&o.addListener(i)}return e.motion},He=()=>{let e=me(),t=Ft(),n=new Map,r=null,o=!1,i=(d,m)=>{let u=Number(m);if(!Number.isFinite(u))return String(m??"");if(typeof d.format=="function")return d.format(u);let f=Number.isInteger(d.decimals)?d.decimals:Number.isInteger(Number(d.step))&&Number(d.step)>=1?0:String(d.step??"").split(".")[1]?.length??1;return`${u.toFixed(f)}${d.suffix||""}`},s=(d,m,u)=>{if(typeof m.get=="function")return m.get(d,u);if(typeof d?.get=="function")return d.get(u);if(d?.settings&&u in d.settings)return d.settings[u]},c=(d,m,u,f)=>{if(typeof m.set=="function"){m.set(d,u,f);return}typeof d?.set=="function"&&d.set(u,f)},a=(d,m,u)=>{let f=s(d,m,u.key);if(f==null||!Number.isFinite(Number(f)))return null;let v=document.createElement("label");v.className="mc-debug-control";let g=document.createElement("div");g.className="mc-debug-row";let T=document.createElement("span");T.className="mc-debug-label",T.textContent=u.label;let C=document.createElement("span");C.className="mc-debug-value",C.textContent=i(u,f);let S=document.createElement("input");S.type="range",S.min=String(u.min),S.max=String(u.max),S.step=String(u.step),S.value=String(f);let k=()=>{let E=Number(S.min),M=Number(S.max),O=Number(S.value),Q=M===E?0:(O-E)/(M-E)*100;S.style.setProperty("--mc-range-progress",`${Math.max(0,Math.min(100,Q))}%`)};return k(),S.addEventListener("input",()=>{k(),C.textContent=i(u,S.value),u.event!=="change"&&c(d,m,u.key,Number(S.value))}),u.event==="change"&&S.addEventListener("change",()=>{c(d,m,u.key,Number(S.value))}),g.append(T,C),v.append(g,S),v},l=(d,m)=>{let u=document.createElement("button");return u.type="button",u.className="mc-debug-button",u.textContent=m.label,u.addEventListener("click",()=>{if(typeof m.onClick=="function"){m.onClick(d);return}let f=d;if(m.action&&typeof f[m.action]=="function"){let v=f[m.action];v()}}),u},p=d=>{if(!Array.isArray(d.stats)||!d.stats.length)return null;let m=document.createElement("div");return m.className="mc-debug-stats",d.stats.forEach(u=>{let f=document.createElement("span");f.textContent=u.label;let v=document.createElement("strong"),g=typeof u.value=="function"?u.value():u.value;v.textContent=typeof u.format=="function"?u.format(g):Number.isFinite(Number(g))?Math.round(Number(g)).toLocaleString():String(g??""),m.append(f,v)}),m},y=(d,m,u,f)=>{let v=document.createElement("div");if(v.className="mc-debug-section",m.instanceLabel!==!1){let g=document.createElement("div");if(g.className="mc-debug-title",typeof m.instanceLabel=="function")g.textContent=m.instanceLabel(d,u,f);else{let T=m.instanceLabel||"Instance";g.textContent=f>1?`${T} ${u+1}`:T}v.appendChild(g)}return(m.controls||[]).forEach(g=>{let T=null;g.type==="range"?T=a(d,m,g):g.type==="button"&&(T=l(d,g)),T&&v.appendChild(T)}),v},w=(d,m)=>{let u=typeof m.instances=="function"?(m.instances()||[]).filter(Boolean):[],f=Array.isArray(m.stats)&&m.stats.length;if(!u.length&&!f)return!1;let v=document.createElement("div");v.className="mc-debug-group";let g=document.createElement("div");g.className="mc-debug-group-title",g.textContent=m.label||m.id,v.appendChild(g);let T=p(m);return T&&v.appendChild(T),u.forEach((C,S)=>{v.appendChild(y(C,m,S,u.length))}),d.appendChild(v),!0},R=()=>{let d=document.createElement("div");d.className="mc-debug-global";let m=document.createElement("div");m.className="mc-debug-global-title",m.textContent="Reduce Motion";let u=document.createElement("div");return u.className="mc-debug-motion",[["system","System"],["reduce","On"],["full","Off"]].forEach(([f,v])=>{let g=document.createElement("button");g.type="button",g.textContent=v,t.mode===f&&g.classList.add("is-active"),g.addEventListener("click",()=>{t.setMode(f),u.querySelectorAll("button").forEach(T=>T.classList.remove("is-active")),g.classList.add("is-active")}),u.appendChild(g)}),d.append(m,u),d},L=()=>{if(!r)return;let d=r.querySelector(".mc-debug-content");if(!d)return;d.innerHTML="",d.appendChild(R());let m=!1;if(n.forEach(u=>{m=w(d,u)||m}),!m){let u=document.createElement("div");u.className="mc-debug-status",u.textContent="No MC effects registered.",d.appendChild(u)}},de=()=>{if(r)return;let d=document.createElement("style");d.textContent=Lt,document.head.appendChild(d),r=document.createElement("div"),r.id="mc-debug-panel",r.innerHTML=`
      <div class="mc-debug-brand">
        <svg class="mc-debug-logo" viewBox="0 0 258 71" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Digerati">
          <path d="M247.18 34.3362V59.389H241.049V34.3362H247.18Z" fill="#00FFFF"/>
          <path d="M237.972 34.3362V39.2253H231.302V59.389H225.171V39.2253H218.501V34.3362H237.972Z" fill="#00FFFF"/>
          <path d="M213.578 54.9637H204.184L202.678 59.389H196.259L205.367 34.3362H212.467L221.574 59.389H215.084L213.578 54.9637ZM211.992 50.2759L208.881 41.0811L205.797 50.2759" fill="#00FFFF"/>
          <path d="M188.953 56.228L183.786 45.6134V59.389H177.655V34.3362H187.946C189.93 34.3362 191.615 34.6811 193.001 35.3711C194.412 36.0611 195.464 37.0127 196.157 38.2261C196.85 39.4157 197.197 40.748 197.197 42.2231C197.197 43.8886 196.719 45.3755 195.762 46.6841C194.83 47.9926 193.444 48.9205 191.603 49.4677L197.412 59.389H194.021C191.862 59.389 189.894 58.1612 188.953 56.228ZM183.786 45.6134H187.587C188.711 45.6134 189.548 45.3399 190.097 44.7926C190.671 44.2454 190.958 43.4722 190.958 42.4729C190.958 41.5213 190.671 40.7718 190.097 40.2246C189.548 39.6774 188.711 39.4038 187.587 39.4038H183.786V45.6134Z" fill="#00FFFF"/>
          <path d="M164.387 39.2253V44.293H172.598V49.0038H164.387V54.4998H173.674V59.389H158.256V34.3362H173.674V39.2253H164.387Z" fill="#00FFFF"/>
          <path d="M147.652 42.259C147.198 41.4263 146.541 40.7958 145.68 40.3675C144.843 39.9155 143.851 39.6895 142.704 39.6895C140.72 39.6895 139.13 40.3438 137.935 41.6523C136.74 42.937 136.142 44.662 136.142 46.8269C136.142 49.1348 136.763 50.943 138.006 52.2516C139.274 53.5363 141.006 54.1787 143.206 54.1787C144.712 54.1787 145.979 53.798 147.007 53.0366C148.059 52.2754 148.823 51.1809 149.302 49.7534H146.038C143.543 49.7534 141.521 47.7402 141.521 45.2568L154.859 45.2568V50.9311C154.405 52.4538 153.628 53.8694 152.529 55.1779C151.453 56.4865 150.078 57.5452 148.405 58.3542C146.732 59.163 144.843 59.5676 142.74 59.5676C140.253 59.5676 138.031 59.0322 136.07 57.9616C134.134 56.8671 132.616 55.3563 131.516 53.4292C130.441 51.5022 129.903 49.3014 129.903 46.8269C129.903 44.3526 130.441 42.1519 131.516 40.2248C132.616 38.2739 134.134 36.7631 136.07 35.6924C138.006 34.598 140.218 34.0508 142.704 34.0508C145.716 34.0508 148.25 34.7765 150.306 36.2278C152.385 37.6791 153.76 39.6895 154.429 42.259H147.652Z" fill="#00FFFF"/>
          <path d="M126.499 34.3362V59.389H120.368V34.3362H126.499Z" fill="#00FFFF"/>
          <path d="M103.746 34.3362C106.399 34.3362 108.718 34.8596 110.702 35.9064C112.686 36.9532 114.216 38.4284 115.292 40.3317C116.391 42.2112 116.941 44.3882 116.941 46.8625C116.941 49.3131 116.391 51.49 115.292 53.3933C114.216 55.2968 112.674 56.7719 110.666 57.8186C108.682 58.8655 106.375 59.389 103.746 59.389H94.3152V34.3362H103.746ZM103.351 54.1072C105.67 54.1072 107.475 53.4766 108.766 52.2157C110.056 50.9548 110.702 49.1704 110.702 46.8625C110.702 44.5547 110.056 42.7584 108.766 41.4737C107.475 40.1889 105.67 39.5465 103.351 39.5465H100.447V54.1072H103.351Z" fill="#00FFFF"/>
          <path d="M254.399 59.6007C256.388 59.6007 258 57.996 258 56.0165C258 54.0371 256.388 52.4324 254.399 52.4324C252.41 52.4324 250.798 54.0371 250.798 56.0165C250.798 57.996 252.41 59.6007 254.399 59.6007Z" fill="white"/>
          <path d="M75.0347 71L70.1372 66.7991C68.5397 65.4288 66.5009 64.675 64.3919 64.675H3.66905L9.78491 62.544C11.7729 61.8513 13.4453 60.472 14.4984 58.6566L44.7876 6.44199L43.638 12.7097C43.2632 14.7533 43.6304 16.863 44.674 18.662L75.0347 71ZM41.1864 0L0 71H82.3729L41.1864 0Z" fill="#00FFFF"/>
          <path d="M41.1864 50.5709C43.1753 50.5709 44.7876 48.9662 44.7876 46.9868C44.7876 45.0073 43.1753 43.4026 41.1864 43.4026C39.1976 43.4026 37.5853 45.0073 37.5853 46.9868C37.5853 48.9662 39.1976 50.5709 41.1864 50.5709Z" fill="#00FFFF"/>
          <path d="M41.1864 58.2798C30.0578 58.2798 23.6153 48.9754 23.3464 48.5795L24.2635 46.8092L23.3464 45.039C23.6153 44.6431 30.0578 35.3387 41.1864 35.3387C52.3151 35.3387 58.7576 44.6431 59.0264 45.039L58.1094 46.8092L59.0264 48.5795C58.7576 48.9754 52.3151 58.2798 41.1864 58.2798ZM24.2635 46.8097C26.2639 48.8589 36.0107 51.9549 41.1864 51.9549C46.3594 51.9549 56.1057 48.8618 58.1094 46.8092C56.1057 44.7567 46.3594 41.6636 41.1864 41.6636C36.0131 41.6636 26.2669 44.7571 24.2635 46.8097Z" fill="white"/>
        </svg>
      </div>
      <div class="mc-debug-content"></div>
    `,r.style.display="none",document.body.appendChild(r)},H=()=>{de(),o=!0,r&&(r.style.display="block"),L()},I=()=>{r&&(o=!1,r.style.display="none")},N=()=>{o?I():H()},U=d=>{d?.id&&(n.set(d.id,d),o&&L())},B=d=>{n.delete(d),o&&L()},X=()=>{o&&L()};document.addEventListener("keydown",d=>{let{key:m,target:u}=d;m.toLowerCase()==="d"&&(u instanceof HTMLInputElement||u instanceof HTMLTextAreaElement||u instanceof HTMLSelectElement||u instanceof HTMLElement&&u.isContentEditable||(d.preventDefault(),N()))});let z=Array.isArray(e.__debugQueue)?e.__debugQueue.splice(0):[];e.debug={register:U,unregister:B,refresh:X,render:L,toggle:N,open:H,close:I},z.forEach(U),console.log("[MC Debug] Generic debugger ready \u2014 press D")};var Ue="(prefers-reduced-motion: reduce)",ge="data-mc-reduced-motion",pe="[mc-native-webflow-motion]",_e="mc-native-webflow-motion-style",Pt=["system","reduce","full"],K=()=>(window.MC||(window.MC={}),window.MC),Dt=()=>{if(document.getElementById(_e))return;let e=document.createElement("style");e.id=_e,e.textContent=`
      html[${ge}="true"]
      ${pe} {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
        animation: none !important;
        will-change: auto !important;
      }

      html[${ge}="true"]
      ${pe}::before,
      html[${ge}="true"]
      ${pe}::after {
        transition: none !important;
        animation: none !important;
      }
    `,document.head.appendChild(e)},Ee=()=>!!window.matchMedia?.(Ue).matches,Rt=e=>e==="reduce"?!0:e==="full"?!1:Ee(),se=()=>{let{motion:e}=K(),t=e?.reduced??Ee();return document.documentElement.setAttribute(ge,t?"true":"false"),t},he=()=>{let{motion:e}=K();if(!e)return;let t={mode:e.mode,reduced:e.reduced,systemReduced:e.systemReduced};window.dispatchEvent(new CustomEvent("mcMotionPreferenceChange",{detail:t}))},Ve=e=>typeof e=="string"&&Pt.includes(e),Be=()=>{let e=K(),t=e.motion?.mode;e.motion={mode:Ve(t)?t:"system",get systemReduced(){return Ee()},get reduced(){return Rt(this.mode)},setMode(r){if(Ve(r)){if(this.mode===r){se(),he();return}this.mode=r,se(),he()}},refresh(){se(),he()}},Dt(),se();let n=window.matchMedia?.(Ue);if(n){let r=()=>{K().motion?.mode==="system"&&(se(),he())};typeof n.addEventListener=="function"?n.addEventListener("change",r):typeof n.addListener=="function"&&n.addListener(r)}console.log("[MC Motion] Ready",{mode:K().motion?.mode,reduced:K().motion?.reduced,nativeTargets:document.querySelectorAll(pe).length})};var D="http://www.w3.org/2000/svg",Oe="http://www.w3.org/1999/xlink",Ze="[mc-chalk]",It="[mc-chalk-stamp]",Me="[mc-chalk-sequence]",G={bend:6,maskMultiplier:.7,strokeWidth:5.6,seed:42,brushDensity:100,stampDensity:100,duration:.5,start:"top 75%",stagger:.12,debug:!1},We=0,we=new Map,Y=new Map,ae=[],q=()=>(window.MC||(window.MC={}),window.MC),je=window.matchMedia("(prefers-reduced-motion: reduce)"),$e=()=>window.MC?.motion&&typeof window.MC.motion.reduced=="boolean"?window.MC.motion.reduced:je.matches,ee=(e,t,n)=>{let r=parseFloat(e.getAttribute(t)||"");return Number.isFinite(r)?r:n},qt=(e,t,n)=>{let r=e.getAttribute(t);return r!==null&&r.trim()!==""?r.trim():n},Gt=(e,t,n=!1)=>{let r=e.getAttribute(t);return r===null?n:r===""||r==="1"||r==="true"||r==="yes"},Nt=e=>{let t=e>>>0||1;return()=>(t=Math.imul(1664525,t)+1013904223>>>0,t/4294967296)},Ht=e=>{let t=e.viewBox?.baseVal;return t&&t.width&&t.height?{x:t.x,y:t.y,width:t.width,height:t.height}:{x:0,y:0,width:48,height:48}},Qe=e=>{try{return Math.max(.01,e.getTotalLength())}catch{return 0}},Xe=e=>{let t=q();if(t.debug?.register){t.debug.register(e);return}t.__debugQueue||(t.__debugQueue=[]),t.__debugQueue.push(e)},_t=async()=>{let e=document.querySelector(It);if(!e)throw new Error("[MC Chalk] No element with [mc-chalk-stamp] found.");let t=e.getAttribute("mc-chalk-stamp");if(!t)throw new Error("[MC Chalk] [mc-chalk-stamp] has no SVG URL.");let n=await fetch(t);if(!n.ok)throw new Error(`[MC Chalk] Could not load chalk stamp: ${n.status}`);let r=await n.text(),o=new DOMParser().parseFromString(r,"image/svg+xml");if(o.querySelector("parsererror"))throw new Error("[MC Chalk] Chalk stamp SVG could not be parsed.");let i=o.querySelector("svg"),s=o.querySelector("path");if(!i||!s)throw new Error("[MC Chalk] Chalk stamp SVG does not contain a path.");let c=s.getAttribute("d"),a=i.getAttribute("viewBox");if(!c||!a)throw new Error("[MC Chalk] Chalk stamp SVG is invalid.");let l=a.trim().split(/[\s,]+/).map(Number);if(l.length!==4||l.some(p=>!Number.isFinite(p)))throw new Error("[MC Chalk] Invalid chalk stamp viewBox.");return console.log("[MC Chalk] Stamp loaded:",t),{path:c,viewBox:{x:l[0],y:l[1],width:l[2],height:l[3]}}},ze=(e,t,n,r,o)=>{let i=document.createElementNS(D,"filter");if(i.setAttribute("id",t),i.setAttribute("x","-45%"),i.setAttribute("y","-45%"),i.setAttribute("width","190%"),i.setAttribute("height","190%"),i.setAttribute("color-interpolation-filters","sRGB"),n<=.001){e.appendChild(i);return}let s=document.createElementNS(D,"feTurbulence");s.setAttribute("type","fractalNoise"),s.setAttribute("baseFrequency",(.0095+n*.004).toFixed(4)),s.setAttribute("numOctaves","2"),s.setAttribute("seed",String(r)),s.setAttribute("result","bendNoise");let c=document.createElementNS(D,"feGaussianBlur");c.setAttribute("in","bendNoise"),c.setAttribute("stdDeviation","0.45"),c.setAttribute("result","softNoise");let a=document.createElementNS(D,"feDisplacementMap");a.setAttribute("in","SourceGraphic"),a.setAttribute("in2","softNoise"),a.setAttribute("scale",((.45+n*1.05)*o).toFixed(3)),a.setAttribute("xChannelSelector","R"),a.setAttribute("yChannelSelector","G"),i.append(s,c,a),e.appendChild(i)},Ye=(e,t,n,r,o=100)=>{let i=Qe(e);if(!i)return[];let s=[e.getAttribute("d")||e.outerHTML,t,n,o].join("|");if(we.has(s))return we.get(s);let c=Nt(n),a=365,l=Math.max(r.viewBox.width,r.viewBox.height),p=a/l,y=.0123288*(t/4.5)*p,w=Math.max(.42,t*.46/Math.max(.01,o/100)),R=[],L=r.viewBox.x+r.viewBox.width/2,de=r.viewBox.y+r.viewBox.height/2;for(let H=0;H<=i;){let I=e.getPointAtLength(Math.min(i,H)),N=e.getPointAtLength(Math.max(0,H-.18)),U=e.getPointAtLength(Math.min(i,H+.18)),X=Math.atan2(U.y-N.y,U.x-N.x)*180/Math.PI+(c()-.5)*84,z=y*(.86+c()*.28);R.push([`translate(${I.x.toFixed(3)} ${I.y.toFixed(3)})`,`scale(${z.toFixed(6)})`,`rotate(${X.toFixed(2)})`,`translate(${-L} ${-de})`].join(" ")),H+=w*(.82+c()*.34)}return we.set(s,R),R},Te=(e,t)=>{let{circles:n}=e,r=n.length,o=t>=1?r:Math.max(0,Math.min(r,Math.floor(r*t)));if(o>e.revealed)for(let i=e.revealed;i<o;i+=1)n[i].style.display="";if(o<e.revealed)for(let i=o;i<e.revealed;i+=1)n[i].style.display="none";e.revealed=o},Ke=(e,t,n=100)=>{let r=document.createElementNS(D,"g");r.setAttribute("class","mc-chalk-brush-layer");let o=Qe(e),i=Math.max(.02,t*.1/Math.max(.01,n/100)),s=[];for(let l=0;l<o;l+=i){let p=e.getPointAtLength(l),y=document.createElementNS(D,"circle");y.setAttribute("cx",p.x.toFixed(3)),y.setAttribute("cy",p.y.toFixed(3)),y.setAttribute("r",t.toFixed(3)),y.setAttribute("fill","#ffffff"),r.appendChild(y),s.push(y)}let c=e.getPointAtLength(o),a=document.createElementNS(D,"circle");return a.setAttribute("cx",c.x.toFixed(3)),a.setAttribute("cy",c.y.toFixed(3)),a.setAttribute("r",t.toFixed(3)),a.setAttribute("fill","#ffffff"),r.appendChild(a),s.push(a),{group:r,circles:s,length:o,revealed:s.length,rebuildDensity(l){let p=this.circles.length?this.revealed/this.circles.length:1,y=Ke(e,Number(this.circles[0]?.getAttribute("r")||t),l);r.replaceChildren(...y.circles),this.circles.splice(0,this.circles.length,...y.circles),this.revealed=this.circles.length,Te(this,p)}}},Vt=e=>{e.circles.forEach(t=>{t.style.display="none"}),e.revealed=0},Ut=e=>{e.circles.forEach(t=>{t.style.display=""}),e.revealed=e.circles.length},Bt=()=>{let e=[...Y.values()],t=e.reduce((r,o)=>r+(o.generatedElements||0),0),n=q();n.chalkStats={icons:e.length,generatedElements:t,averagePerIcon:e.length?t/e.length:0,perIcon:e.map((r,o)=>({index:o+1,generatedElements:r.generatedElements||0}))},window.dispatchEvent(new CustomEvent("mcChalkStatsChange",{detail:n.chalkStats}))},Ot=(e,t,n)=>{if(e.dataset.mcChalkReady==="1")return Y.get(e)||null;let r=e.querySelector("svg"),o=r?r.querySelectorAll("*").length:0;if(!r)return console.warn("[MC Chalk] No inline SVG found:",e),null;let i=[...r.querySelectorAll("path, circle, ellipse, line, polyline, polygon, rect")].filter(C=>!C.closest("defs"));if(!i.length)return console.warn("[MC Chalk] No SVG geometry found:",e),null;e.dataset.mcChalkReady="1",We+=1;let s=We,c=Math.max(0,ee(e,"mc-chalk-bend",G.bend)),a=Math.max(0,ee(e,"mc-chalk-mask-width",G.maskMultiplier)),l=Math.max(1,ee(e,"mc-chalk-brush-density",G.brushDensity)),p=Math.max(1,ee(e,"mc-chalk-stamp-density",G.stampDensity)),y=Ht(r),w=Math.max(y.width,y.height)/48,R=G.strokeWidth*w,L=Math.max(R+3.5*w,R*1.394643),H=Math.max(.25,L*a)/2,I=r.querySelector(":scope > defs");I||(I=document.createElementNS(D,"defs"),r.insertBefore(I,r.firstChild));let N=`mc-chalk-stamp-${s}`,U=`mc-chalk-mask-${s}`,B=`mc-chalk-bend-${s}`,X=document.createElementNS(D,"g");X.setAttribute("id",N);let z=document.createElementNS(D,"path");z.setAttribute("d",n.path),z.setAttribute("fill","currentColor"),X.appendChild(z),I.appendChild(X),ze(I,B,c,G.seed+t*17,w);let d=document.createElementNS(D,"mask");d.setAttribute("id",U),d.setAttribute("maskUnits","userSpaceOnUse"),d.setAttribute("maskContentUnits","userSpaceOnUse"),d.setAttribute("style","mask-type:luminance");let m=Math.max(y.width,y.height)*.9;d.setAttribute("x",String(y.x-m)),d.setAttribute("y",String(y.y-m)),d.setAttribute("width",String(y.width+m*2)),d.setAttribute("height",String(y.height+m*2)),I.appendChild(d);let u=document.createElementNS(D,"g");u.setAttribute("class","mc-chalk-output"),u.setAttribute("mask",`url(#${U})`),c>.001&&u.setAttribute("filter",`url(#${B})`),u.setAttribute("fill","currentColor"),u.style.color="inherit";let f=[],v=[];i.forEach((C,S)=>{let k=C.cloneNode(!1);k.removeAttribute("id"),k.setAttribute("fill","none"),k.setAttribute("stroke","transparent"),k.setAttribute("stroke-width","0.001"),k.style.opacity="0",k.style.pointerEvents="none",r.appendChild(k);let E=Ke(k,H,l);d.appendChild(E.group),f.push(E);let M=document.createElementNS(D,"g");M.setAttribute("fill","currentColor");let O=G.seed+t*101+S*37;Ye(k,R,O,n,p).forEach(V=>{let ie=document.createElementNS(D,"use");ie.setAttribute("href",`#${N}`),ie.setAttributeNS(Oe,"xlink:href",`#${N}`),ie.setAttribute("transform",V),ie.setAttribute("fill","currentColor"),M.appendChild(ie)}),u.appendChild(M),v.push({guide:k,brushLayer:E,stampLayer:M,strokeWidth:R,seed:O}),C.style.display="none"}),r.appendChild(u),r.setAttribute("overflow","visible"),r.style.overflow="visible";let g=r.querySelectorAll("*").length,T={wrapper:e,svg:r,treated:u,brushLayers:f,densityTargets:v,generatedElements:Math.max(0,g-o),settings:{bend:c,maskWidth:a,brushDensity:l,stampDensity:p},get(C){return this.settings[C]},set(C,S){let k=Number(S);if(Number.isFinite(k)){if(C==="bend"){let E=Math.max(0,k);this.settings.bend=E,e.setAttribute("mc-chalk-bend",String(E));let M=I.querySelector(`#${B}`);M&&M.remove(),ze(I,B,E,G.seed+t*17,w),E>.001?u.setAttribute("filter",`url(#${B})`):u.removeAttribute("filter");return}if(C==="brushDensity"||C==="stampDensity"){let E=Math.max(1,k);this.settings[C]=E,e.setAttribute(C==="brushDensity"?"mc-chalk-brush-density":"mc-chalk-stamp-density",String(E)),C==="brushDensity"?this.densityTargets.forEach(M=>M.brushLayer.rebuildDensity(E)):this.densityTargets.forEach(M=>{let O=Ye(M.guide,M.strokeWidth,M.seed,n,E);M.stampLayer.replaceChildren(),O.forEach(Q=>{let V=document.createElementNS(D,"use");V.setAttribute("href",`#${N}`),V.setAttributeNS(Oe,"xlink:href",`#${N}`),V.setAttribute("transform",Q),V.setAttribute("fill","currentColor"),M.stampLayer.appendChild(V)})}),this.generatedElements=Math.max(0,r.querySelectorAll("*").length-o),Bt();return}if(C==="maskWidth"){let E=Math.max(0,k);this.settings.maskWidth=E,e.setAttribute("mc-chalk-mask-width",String(E));let O=Math.max(.25,L*E)/2;this.brushLayers.forEach(Q=>{Q.circles.forEach(V=>{V.setAttribute("r",O.toFixed(3))})})}}}};return Y.set(e,T),T},le=e=>{e.brushLayers.forEach(Vt)},te=e=>{e.brushLayers.forEach(Ut)},xe=e=>{e?.wrapper&&(e.wrapper.style.opacity="1")},J=e=>{e.forEach(xe)},Wt=(e,t,n,r)=>{let{brushLayers:o}=t;if(!o.length)return;let i=o.reduce((c,a)=>c+a.length,0)||1,s=0;o.forEach(c=>{let a=Math.max(.08,n*(c.length/i)),l={progress:0};e.to(l,{progress:1,duration:a,ease:"none",onUpdate:()=>{Te(c,l.progress)},onComplete:()=>{Te(c,1)}},r+s),s+=a*.88})},$t=e=>{let t={duration:Math.max(.01,ee(e,"mc-chalk-duration",G.duration)),stagger:Math.max(0,ee(e,"mc-chalk-stagger",G.stagger)),start:qt(e,"mc-chalk-start",G.start),debug:Gt(e,"mc-chalk-debug",G.debug)},r=[...e.querySelectorAll(Ze)].filter(a=>a.closest(Me)===e).map(a=>Y.get(a)).filter(a=>!!a);if(!r.length)return null;let o=null,i=null,s=()=>{if(o&&(o.kill(),o=null),i&&(i.kill(),i=null),$e()){r.forEach(te),J(r),e.dataset.mcChalkSequenceReady="1",e.dataset.mcChalkReducedMotion="1";return}delete e.dataset.mcChalkReducedMotion,r.forEach(le),o=gsap.timeline({paused:!0}),r.forEach((a,l)=>{Wt(o,a,t.duration,l*t.stagger)}),i=ScrollTrigger.create({trigger:e,start:t.start,markers:t.debug,onEnter:()=>{J(r),o?.pause(0),r.forEach(le),o?.restart()},onEnterBack:()=>{J(r),o?.pause(),r.forEach(te)},onLeaveBack:()=>{o?.pause(0),r.forEach(le)}}),e.dataset.mcChalkSequenceReady="1"},c={element:e,instances:r,settings:t,get(a){return t[a]},set(a,l){let p=Number(l);if(Number.isFinite(p)){if(a==="duration"){t.duration=Math.max(.01,p),e.setAttribute("mc-chalk-duration",String(t.duration)),s();return}a==="stagger"&&(t.stagger=Math.max(0,p),e.setAttribute("mc-chalk-stagger",String(t.stagger)),s())}},rebuild:s,applyMotionPreference(){s()},show(){J(r),o&&o.pause(),r.forEach(te)},hide(){o&&o.pause(0),r.forEach(le)},replay(){if($e()){J(r),r.forEach(te);return}o||s(),J(r),r.forEach(le),o?.restart()}};return s(),console.log("[MC Chalk] Sequence initialised",{element:e,items:r.length,duration:t.duration,stagger:t.stagger,start:t.start,debug:t.debug}),c},Xt=()=>{if(typeof gsap>"u"||typeof ScrollTrigger>"u"){console.error("[MC Chalk] GSAP and ScrollTrigger must be loaded."),[...Y.values()].forEach(n=>{te(n),xe(n)});return}gsap.registerPlugin(ScrollTrigger),ae.length=0,[...document.querySelectorAll(Me)].forEach(n=>{let r=$t(n);r&&ae.push(r)});let t=q();t.chalkSequences=ae,ScrollTrigger.refresh(),window.__mcChalkMotionListener||(window.__mcChalkMotionListener=!0,window.addEventListener("mcMotionPreferenceChange",()=>{ae.forEach(n=>n.applyMotionPreference()),ScrollTrigger.refresh()}),je.addEventListener?.("change",()=>{window.MC?.motion&&window.MC.motion.mode!=="system"||(ae.forEach(n=>n.applyMotionPreference()),ScrollTrigger.refresh())}))},Je=()=>{let e=async()=>{let t=[...document.querySelectorAll(Ze)];if(t.length)try{let n=await _t();t.forEach((a,l)=>{Ot(a,l,n)}),t.forEach(a=>{if(a.closest(Me))return;let l=Y.get(a);l&&(te(l),xe(l))}),Xt();let r=[...Y.values()],o=r.reduce((a,l)=>a+(l.generatedElements||0),0),i=r.length?o/r.length:0,s=q();s.chalk=r,s.chalkStats={icons:r.length,generatedElements:o,averagePerIcon:i,perIcon:r.map((a,l)=>({index:l+1,generatedElements:a.generatedElements||0}))},console.log("[MC Chalk] DOM impact",s.chalkStats);let c={get(a){return q().chalk?.[0]?.get?.(a)},set(a,l){(q().chalk||[]).forEach(p=>p.set?.(a,l))}};Xe({id:"chalk-appearance",label:"Chalk",instances:()=>q().chalk?.length?[c]:[],instanceLabel:"Global Appearance",stats:[{label:"Icons",value:()=>q().chalkStats?.icons||0},{label:"Generated DOM nodes",value:()=>q().chalkStats?.generatedElements||0},{label:"Average / icon",value:()=>q().chalkStats?.averagePerIcon||0}],controls:[{type:"range",key:"bend",label:"Bend",min:0,max:20,step:.5},{type:"range",key:"maskWidth",label:"Mask Width",min:.1,max:2,step:.05,decimals:2},{type:"range",key:"brushDensity",label:"Brush Density",min:25,max:200,step:5,suffix:"%",event:"change"},{type:"range",key:"stampDensity",label:"Stamp Density",min:25,max:200,step:5,suffix:"%",event:"change"}]}),Xe({id:"chalk-sequences",label:"Chalk Sequence",instances:()=>q().chalkSequences||[],instanceLabel:"Sequence",controls:[{type:"range",key:"duration",label:"Duration",min:.05,max:2,step:.05,suffix:"s",decimals:2,event:"change"},{type:"range",key:"stagger",label:"Stagger",min:0,max:1,step:.01,suffix:"s",decimals:2,event:"change"},{type:"button",label:"Replay",action:"replay"}]}),window.addEventListener("mcChalkStatsChange",()=>q().debug?.refresh?.()),console.log(`[MC Chalk] Applied to ${t.length} element(s).`)}catch(n){console.error("[MC Chalk]",n)}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{e()},{once:!0}):e()};var et="[mc-colour-reveal]",fe={duration:.8,colourDuration:.8,stagger:.8,colour:"#ffffff"},be=()=>(window.MC||(window.MC={}),window.MC),ke=(e,t,n)=>{let r=parseFloat(e.getAttribute(t)||"");return Number.isFinite(r)?r:n},ce=()=>window.MC?.motion&&typeof window.MC.motion.reduced=="boolean"?window.MC.motion.reduced:!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,zt=e=>{let t=be();if(t.debug&&typeof t.debug.register=="function"){t.debug.register(e);return}t.__debugQueue||(t.__debugQueue=[]),t.__debugQueue.push(e)},Ae=class{constructor(t,n){h(this,"component");h(this,"index");h(this,"settings");h(this,"split");h(this,"timeline");h(this,"ready");h(this,"initialising");this.component=t,this.index=n,this.settings={duration:ke(t,"mc-colour-reveal-duration",fe.duration),colourDuration:ke(t,"mc-colour-reveal-colour-duration",fe.colourDuration),stagger:ke(t,"mc-colour-reveal-stagger",fe.stagger),colour:t.getAttribute("mc-colour-reveal-colour")||fe.colour},this.split=null,this.timeline=null,this.ready=!1,this.initialising=!1,this.component.style.setProperty("--mc-colour-reveal",this.settings.colour)}get(t){return this.settings[t]}set(t,n){if(!Object.prototype.hasOwnProperty.call(this.settings,t))return;if(t==="colour"){this.settings.colour=String(n),this.component.setAttribute("mc-colour-reveal-colour",this.settings.colour),this.component.style.setProperty("--mc-colour-reveal",this.settings.colour);return}let r=Number(n);Number.isFinite(r)&&(t==="duration"&&(this.settings.duration=Math.max(.01,r),this.component.setAttribute("mc-colour-reveal-duration",String(this.settings.duration))),t==="colourDuration"&&(this.settings.colourDuration=Math.max(.01,r),this.component.setAttribute("mc-colour-reveal-colour-duration",String(this.settings.colourDuration))),t==="stagger"&&(this.settings.stagger=Math.max(0,r),this.component.setAttribute("mc-colour-reveal-stagger",String(this.settings.stagger))),this.ready&&!ce()&&this.buildAnimated(!0))}showFinal(){this.destroyAnimation(),this.component.style.visibility="visible",this.component.style.setProperty("--clip-progress","100%"),this.component.style.setProperty("--color-progress","0%"),this.ready=!0}destroyAnimation(){if(this.timeline&&(this.timeline.scrollTrigger&&this.timeline.scrollTrigger.kill(),this.timeline.kill(),this.timeline=null),this.split){try{this.split.revert()}catch(t){console.warn("[MC Colour Reveal] SplitText revert failed",t)}this.split=null}}async buildAnimated(t=!1){if(!this.initialising){if(this.initialising=!0,this.destroyAnimation(),document.fonts?.ready&&await document.fonts.ready,ce()){this.initialising=!1,this.showFinal();return}this.component.style.setProperty("--mc-colour-reveal",this.settings.colour),this.component.style.removeProperty("--clip-progress"),this.component.style.removeProperty("--color-progress"),this.split=SplitText.create(this.component,{type:"lines",autoSplit:!0,mask:"lines",linesClass:"line",onSplit:n=>{let r=gsap.timeline({paused:t,scrollTrigger:t?void 0:{trigger:this.component,start:"top bottom",end:"top 80%",toggleActions:"none play none reset"}});return r.set(this.component,{visibility:"visible"}),r.fromTo(n.lines,{"--clip-progress":"0%"},{"--clip-progress":"100%",duration:this.settings.duration,stagger:{amount:this.settings.stagger}}),r.fromTo(n.lines,{"--color-progress":"100%"},{"--color-progress":"0%",delay:.2,duration:this.settings.colourDuration,stagger:{amount:this.settings.stagger}},0),this.timeline=r,t&&r.play(0),r}}),this.ready=!0,this.initialising=!1}}async replay(){if(ce()){this.showFinal();return}if(!this.split||!this.timeline){await this.buildAnimated(!0);return}this.component.style.visibility="visible",this.timeline.restart(!0)}async motionChanged(){if(ce()){this.showFinal();return}await this.buildAnimated(!1)}async init(){if(ce()){this.showFinal();return}await this.buildAnimated(!1)}},tt=()=>{(be().colourReveal||[]).forEach(t=>{t.motionChanged()})},rt=()=>{let e=be();e.colourReveal||(e.colourReveal=[]),zt({id:"colourReveal",label:"Colour Reveal",instances:()=>be().colourReveal||[],instanceLabel:(r,o,i)=>i>1?`Heading ${o+1}`:"Heading",controls:[{type:"range",key:"duration",label:"Reveal Duration",min:.1,max:2,step:.05,suffix:"s",event:"change"},{type:"range",key:"colourDuration",label:"Colour Duration",min:.1,max:2,step:.05,suffix:"s",event:"change"},{type:"range",key:"stagger",label:"Line Stagger",min:0,max:2,step:.05,suffix:"s",event:"change"},{type:"button",label:"Replay",action:"replay"}]}),window.addEventListener("mcMotionPreferenceChange",tt);let t=window.matchMedia?.("(prefers-reduced-motion: reduce)");if(t){let r=()=>{(!window.MC?.motion||window.MC.motion.mode==="system")&&tt()};typeof t.addEventListener=="function"?t.addEventListener("change",r):typeof t.addListener=="function"&&t.addListener(r)}let n=async()=>{if(typeof gsap>"u"||typeof ScrollTrigger>"u"||typeof SplitText>"u"){console.error("[MC Colour Reveal] GSAP, ScrollTrigger and SplitText must be loaded."),document.querySelectorAll(et).forEach(o=>{o.style.visibility="visible",o.style.setProperty("--clip-progress","100%"),o.style.setProperty("--color-progress","0%")});return}gsap.registerPlugin(ScrollTrigger,SplitText);let r=[...document.querySelectorAll(et)];r.forEach((o,i)=>{if(o.__mcColourReveal)return;o.setAttribute("data-mc-colour-reveal-init","");let s=new Ae(o,i);o.__mcColourReveal=s,e.colourReveal?.push(s),s.init()}),e.debug?.refresh?.(),console.log(`[MC Colour Reveal] Initialised ${r.length} element(s).`)};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>void n(),{once:!0}):n()};var Yt="img[mc-depth-reveal]",F={trace:1.35,lineWidth:1,pressure:1,threshold:.18,initialFade:700,finalFade:900,trackX:0,trackY:0,scrollX:0,scrollY:0,autoX:0,autoY:0,autoZoom:0,autoDuration:40,zoom:1.04,direction:1,duration:2850},Le=(e,t=0,n=1)=>Math.min(n,Math.max(t,e)),Fe=e=>e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2,ye=()=>(window.MC||(window.MC={}),window.MC),Zt=e=>{let t=ye();if(t.debug?.register){t.debug.register(e);return}t.__debugQueue||(t.__debugQueue=[]),t.__debugQueue.push(e)},x=()=>{let e=ye();return e.motion||(e.motion={mode:"system",get systemReduced(){return!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches},get reduced(){return this.mode==="reduce"?!0:this.mode==="full"?!1:this.systemReduced},setMode(t){["system","reduce","full"].includes(t)&&(this.mode=t,window.dispatchEvent(new CustomEvent("mcMotionPreferenceChange",{detail:{mode:this.mode,reduced:this.reduced,systemReduced:this.systemReduced}})))},refresh(){window.dispatchEvent(new CustomEvent("mcMotionPreferenceChange",{detail:{mode:this.mode,reduced:this.reduced,systemReduced:this.systemReduced}}))}}),e.motion},P=(e,t,n)=>{let r=e.getAttribute(t);if(r===null||r==="")return n;let o=Number(r);return Number.isFinite(o)?o:n},jt=e=>e.complete&&e.naturalWidth>0?Promise.resolve(e):new Promise((t,n)=>{e.addEventListener("load",()=>t(e),{once:!0}),e.addEventListener("error",()=>n(new Error("Source image could not load")),{once:!0})}),nt=e=>new Promise((t,n)=>{let r=new Image;r.crossOrigin="anonymous",r.decoding="async",r.onload=()=>t(r),r.onerror=()=>n(new Error(`Image could not load: ${e}`)),r.src=e}),Qt=()=>document.readyState==="complete"?Promise.resolve():new Promise(e=>{window.addEventListener("load",()=>e(),{once:!0})}),ot=()=>new Promise(e=>{requestAnimationFrame(e)}),it=(e,t,n)=>{let r=e.createShader(t);if(!r)throw new Error("Shader could not be created");if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){let o=e.getShaderInfoLog(r)||"Shader compilation failed";throw e.deleteShader(r),new Error(o)}return r},Pe=class{constructor(t){h(this,"image");h(this,"settings");h(this,"depthSrc");h(this,"canvas");h(this,"gl");h(this,"program");h(this,"imageTexture");h(this,"depthTexture");h(this,"sourceImage");h(this,"depthImage");h(this,"imageRes");h(this,"canvasCssSize");h(this,"pointer");h(this,"target");h(this,"scroll");h(this,"auto");h(this,"autoElapsed");h(this,"autoLastTime");h(this,"pointerTrackingEnabled");h(this,"scrollTrackingEnabled");h(this,"autoTrackingEnabled");h(this,"scrollTween");h(this,"scrollTrigger");h(this,"effectLoaded");h(this,"loadingEffect");h(this,"reducedStatic");h(this,"inView");h(this,"ready");h(this,"revealComplete");h(this,"startTime");h(this,"frameId");h(this,"parentPositionChanged");h(this,"originalParentPosition");h(this,"boundPointerMove");h(this,"boundResize");h(this,"boundMotionChange");h(this,"uniforms");h(this,"observer");this.image=t,this.settings={trace:P(t,"mc-depth-trace",F.trace),lineWidth:P(t,"mc-depth-line-width",F.lineWidth),pressure:P(t,"mc-depth-pressure",F.pressure),threshold:P(t,"mc-depth-threshold",F.threshold),initialFade:P(t,"mc-depth-initial-fade",F.initialFade),finalFade:P(t,"mc-depth-final-fade",F.finalFade),trackX:P(t,"mc-depth-track-x",F.trackX),trackY:P(t,"mc-depth-track-y",F.trackY),scrollX:P(t,"mc-depth-scroll-x",F.scrollX),scrollY:P(t,"mc-depth-scroll-y",F.scrollY),autoX:P(t,"mc-depth-auto-x",F.autoX),autoY:P(t,"mc-depth-auto-y",F.autoY),autoZoom:P(t,"mc-depth-auto-zoom",F.autoZoom),autoDuration:P(t,"mc-depth-auto-duration",F.autoDuration),zoom:P(t,"mc-depth-zoom",F.zoom),direction:P(t,"mc-depth-direction",F.direction),duration:P(t,"mc-depth-duration",F.duration)},this.depthSrc=t.getAttribute("mc-depth-map"),this.canvas=null,this.gl=null,this.program=null,this.imageTexture=null,this.depthTexture=null,this.imageRes=[1,1],this.canvasCssSize=[1,1],this.pointer={x:0,y:0},this.target={x:0,y:0},this.scroll={x:0,y:0},this.auto={x:0,y:0,zoom:0},this.autoElapsed=0,this.autoLastTime=null,this.pointerTrackingEnabled=this.settings.trackX!==0||this.settings.trackY!==0,this.scrollTrackingEnabled=this.settings.scrollX!==0||this.settings.scrollY!==0,this.autoTrackingEnabled=this.settings.autoX!==0||this.settings.autoY!==0||this.settings.autoZoom!==0,this.scrollTween=null,this.scrollTrigger=null,this.effectLoaded=!1,this.loadingEffect=!1,this.reducedStatic=!1,this.inView=!1,this.ready=!1,this.revealComplete=!1,this.startTime=null,this.frameId=null,this.parentPositionChanged=!1,this.originalParentPosition="",this.boundPointerMove=this.onPointerMove.bind(this),this.boundResize=this.onResize.bind(this),this.boundMotionChange=this.onMotionPreferenceChange.bind(this),window.addEventListener("mcMotionPreferenceChange",this.boundMotionChange),this.init()}async init(){if(x().reduced){this.showStaticImage();return}await this.loadEffect()}async loadEffect(){if(!(this.effectLoaded||this.loadingEffect||x().reduced)){if(!this.depthSrc){console.warn("[MC Depth] Missing mc-depth-map:",this.image),this.showStaticImage();return}this.loadingEffect=!0;try{if(await jt(this.image),x().reduced){this.loadingEffect=!1,this.showStaticImage();return}let t=this.image.currentSrc||this.image.src,[n,r]=await Promise.all([nt(t),nt(this.depthSrc)]);if(x().reduced){this.loadingEffect=!1,this.showStaticImage();return}this.sourceImage=n,this.depthImage=r,this.imageRes=[n.naturalWidth,n.naturalHeight];let o=n.naturalWidth/n.naturalHeight,i=r.naturalWidth/r.naturalHeight;Math.abs(o-i)>.001&&console.warn("[MC Depth] Source/depth aspect ratios differ:",{image:[n.naturalWidth,n.naturalHeight],depth:[r.naturalWidth,r.naturalHeight],element:this.image}),this.image.style.opacity="0",this.createCanvas(),this.createWebGL(),this.uploadTextures(),this.createObserver(),window.addEventListener("resize",this.boundResize,{passive:!0}),this.pointerTrackingEnabled&&window.addEventListener("pointermove",this.boundPointerMove,{passive:!0}),this.scrollTrackingEnabled&&this.createScrollTracking(),this.ready=!0,this.effectLoaded=!0,this.loadingEffect=!1,this.reducedStatic=!1,await Qt(),await ot(),await ot(),x().reduced||this.startReveal(),console.log("[MC Depth] Initialised")}catch(t){this.loadingEffect=!1,console.error("[MC Depth] Initialisation failed:",t,this.image),this.showStaticImage()}}}showStaticImage(){this.reducedStatic=!0,this.image.style.opacity="1",this.canvas&&(this.canvas.style.display="none"),this.frameId!==null&&(cancelAnimationFrame(this.frameId),this.frameId=null),this.autoLastTime=null}async onMotionPreferenceChange(){if(x().reduced){this.showStaticImage();return}if(!this.effectLoaded){await this.loadEffect();return}this.reducedStatic=!1,this.image.style.opacity="0",this.canvas&&(this.canvas.style.display="block"),this.startReveal()}get(t){return this.settings[t]}set(t,n){if(!(t in this.settings))return;let r=Number(n);if(Number.isFinite(r)){if(t==="autoDuration"){let o=Math.max(1,this.settings.autoDuration*1e3),i=this.autoElapsed%o/o;this.settings.autoDuration=Math.max(1,r),this.autoElapsed=i*this.settings.autoDuration*1e3,this.autoLastTime=null}else this.settings[t]=r;this.pointerTrackingEnabled=this.settings.trackX!==0||this.settings.trackY!==0,this.scrollTrackingEnabled=this.settings.scrollX!==0||this.settings.scrollY!==0,this.autoTrackingEnabled=this.settings.autoX!==0||this.settings.autoY!==0||this.settings.autoZoom!==0,x().reduced||this.requestFrame()}}replay(){if(x().reduced){this.showStaticImage();return}if(!this.effectLoaded){this.loadEffect();return}this.image.style.opacity="0",this.canvas&&(this.canvas.style.display="block"),this.startReveal()}createCanvas(){let t=this.image.parentElement;if(!t)throw new Error("Depth reveal image has no parent element");getComputedStyle(t).position==="static"&&(this.originalParentPosition=t.style.position,t.style.position="relative",this.parentPositionChanged=!0);let r=document.createElement("canvas");r.setAttribute("aria-hidden","true"),r.style.position="absolute",r.style.pointerEvents="none",r.style.display="block",r.style.zIndex="1",r.style.opacity="0",r.style.background="transparent",r.style.borderRadius=getComputedStyle(this.image).borderRadius,t.appendChild(r),this.canvas=r,this.positionCanvas()}positionCanvas(){if(!this.canvas||!this.image.parentElement)return;let t=this.image.getBoundingClientRect(),n=this.image.parentElement.getBoundingClientRect(),r=t.left-n.left,o=t.top-n.top;this.canvas.style.left=`${r}px`,this.canvas.style.top=`${o}px`,this.canvas.style.width=`${t.width}px`,this.canvas.style.height=`${t.height}px`,this.canvasCssSize=[Math.max(1,t.width),Math.max(1,t.height)],this.resizeCanvas()}resizeCanvas(){if(!this.canvas||!this.gl)return;let t=Math.min(window.devicePixelRatio||1,2),n=this.canvas.getBoundingClientRect();this.canvasCssSize=[Math.max(1,n.width),Math.max(1,n.height)];let r=Math.max(1,Math.round(n.width*t)),o=Math.max(1,Math.round(n.height*t));(this.canvas.width!==r||this.canvas.height!==o)&&(this.canvas.width=r,this.canvas.height=o,this.gl.viewport(0,0,r,o))}onResize(){this.positionCanvas(),this.scrollTrigger?.refresh(),this.ready&&this.inView&&!x().reduced&&this.requestFrame()}createScrollTracking(){if(!window.gsap||!window.ScrollTrigger){console.warn("[MC Depth] Scroll tracking requested but GSAP/ScrollTrigger unavailable.");return}window.gsap.registerPlugin(window.ScrollTrigger),this.scrollTween=window.gsap.to(this.scroll,{x:this.settings.scrollX,y:this.settings.scrollY,ease:"none",scrollTrigger:{trigger:this.image.parentElement||this.image,start:"top top",end:"bottom top",scrub:!0,invalidateOnRefresh:!0,onUpdate:()=>{this.ready&&this.revealComplete&&this.inView&&!x().reduced&&this.requestFrame()}}}),this.scrollTrigger=this.scrollTween.scrollTrigger||null}updateAuto(t){if(!this.autoTrackingEnabled||!this.revealComplete||!this.inView||x().reduced){this.autoLastTime=null;return}if(this.autoLastTime===null){this.autoLastTime=t;return}let n=Math.min(t-this.autoLastTime,100);this.autoLastTime=t,this.autoElapsed+=n;let r=Math.max(1e3,this.settings.autoDuration*1e3),o=this.autoElapsed%r/r*Math.PI*2,i=.5-.5*Math.cos(o);this.auto.x=i*this.settings.autoX,this.auto.y=i*this.settings.autoY,this.auto.zoom=i*this.settings.autoZoom}createWebGL(){if(!this.canvas)throw new Error("Canvas missing");let t=this.canvas.getContext("webgl2",{alpha:!0,antialias:!1,premultipliedAlpha:!0,powerPreference:"high-performance"});if(!t)throw new Error("WebGL2 could not start");this.gl=t,t.clearColor(0,0,0,0);let n=`#version 300 es

in vec2 aPosition;
out vec2 vUv;

void main() {
  vUv = aPosition * .5 + .5;

  gl_Position = vec4(
    aPosition,
    0.0,
    1.0
  );
}
`,r=`#version 300 es

precision highp float;

uniform sampler2D uImage;
uniform sampler2D uDepth;

uniform vec2 uImageRes;
uniform vec2 uCanvasSize;
uniform vec2 uPointer;
uniform vec2 uScroll;
uniform vec2 uAuto;
uniform float uAutoZoom;

uniform float uTime;
uniform float uProgress;

uniform float uTrace;
uniform float uLineWidth;
uniform float uPressure;
uniform float uThreshold;

uniform float uFinalFade;
uniform float uInitialFade;

uniform float uTrackX;
uniform float uTrackY;
uniform float uZoom;
uniform float uDirection;

in vec2 vUv;

out vec4 outColor;


vec2 alignedUv(vec2 uv) {
  float zoom = uZoom + uAutoZoom;
  return (uv - .5) / zoom + .5;
}


vec3 blurImage(
  vec2 uv,
  float radius
) {

  vec2 px =
    1.0 / uImageRes;

  vec3 c =
    texture(
      uImage,
      uv
    ).rgb * .16;

  c += texture(
    uImage,
    uv + vec2(1., 0.) *
    px * radius
  ).rgb * .105;

  c += texture(
    uImage,
    uv + vec2(-1., 0.) *
    px * radius
  ).rgb * .105;

  c += texture(
    uImage,
    uv + vec2(0., 1.) *
    px * radius
  ).rgb * .105;

  c += texture(
    uImage,
    uv + vec2(0., -1.) *
    px * radius
  ).rgb * .105;

  c += texture(
    uImage,
    uv + vec2(.707, .707) *
    px * radius
  ).rgb * .105;

  c += texture(
    uImage,
    uv + vec2(-.707, .707) *
    px * radius
  ).rgb * .105;

  c += texture(
    uImage,
    uv + vec2(.707, -.707) *
    px * radius
  ).rgb * .105;

  c += texture(
    uImage,
    uv + vec2(-.707, -.707) *
    px * radius
  ).rgb * .105;

  return c;
}


float depthEdge(
  vec2 uv,
  float widthPx
) {

  vec2 p =
    (1.0 / uImageRes) *
    widthPx;

  float c =
    texture(
      uDepth,
      uv
    ).r;

  float dx = max(
    abs(
      c -
      texture(
        uDepth,
        uv + vec2(p.x, 0)
      ).r
    ),
    abs(
      c -
      texture(
        uDepth,
        uv - vec2(p.x, 0)
      ).r
    )
  );

  float dy = max(
    abs(
      c -
      texture(
        uDepth,
        uv + vec2(0, p.y)
      ).r
    ),
    abs(
      c -
      texture(
        uDepth,
        uv - vec2(0, p.y)
      ).r
    )
  );

  return max(dx, dy);
}


float hash(vec2 p) {
  return fract(
    sin(
      dot(
        p,
        vec2(
          127.1,
          311.7
        )
      )
    ) *
    43758.5453123
  );
}


void main() {

  vec2 base =
    alignedUv(vUv);

  float d0 =
    texture(
      uDepth,
      base
    ).r;


  float interaction =
    smoothstep(
      .84,
      1.0,
      uProgress
    );


  vec2 pointerPx =
    uPointer *
    vec2(
      uTrackX,
      uTrackY
    );

  vec2 offsetPx =
    pointerPx +
    uScroll +
    uAuto;

  vec2 offsetUv =
    offsetPx /
    max(
      uCanvasSize,
      vec2(1.0)
    );

  float depthWeight =
    clamp(d0, 0.0, 1.0);

  vec2 parallax =
    offsetUv *
    depthWeight *
    interaction;

  vec2 uv =
    base + parallax;


  float depth =
    texture(
      uDepth,
      uv
    ).r;


  float revealDepth =
    uDirection < 0.0
      ? 1.0 - depth
      : depth;


  float sweep =
    mix(
      1.35,
      -.10,
      uProgress
    );


  float focus =
    smoothstep(
      sweep - .15,
      sweep + .055,
      revealDepth
    );


  float blurRadius =
    mix(
      34.0,
      0.0,
      focus
    );


  vec3 blurred =
    blurImage(
      uv,
      blurRadius
    );


  vec3 sharp =
    texture(
      uImage,
      uv
    ).rgb;


  vec3 colour =
    mix(
      blurred,
      sharp,
      focus
    );


  float depthReveal =
    smoothstep(
      sweep - .22,
      sweep + .12,
      revealDepth
    );


  float edge =
    depthEdge(
      uv,
      uLineWidth
    );


  float line =
    smoothstep(
      uThreshold,
      uThreshold + .08,
      edge
    );


  float nearBand =
    1.0 -
    smoothstep(
      .06,
      .22,
      abs(
        revealDepth - sweep
      )
    );


  float flicker =
    .56 +
    .44 *
    hash(
      floor(
        gl_FragCoord.xy *
        .24
      ) +
      floor(
        uTime *
        18.0
      )
    );


  float traceLife =
    (
      1.0 -
      smoothstep(
        .58,
        .93,
        uProgress
      )
    ) *
    nearBand;


  vec3 traceColour =
    vec3(
      .58,
      .86,
      .33
    );


  float traceAlpha =
    line *
    traceLife *
    flicker *
    uTrace *
    uPressure;


  colour =
    mix(
      colour,
      traceColour,
      clamp(
        traceAlpha,
        0.0,
        .92
      )
    );


  float alpha =
    max(
      depthReveal,
      clamp(
        traceAlpha,
        0.0,
        .92
      )
    );


  vec3 finalColour =
    texture(
      uImage,
      uv
    ).rgb;


  colour =
    mix(
      colour,
      finalColour,
      uFinalFade
    );


  alpha =
    mix(
      alpha,
      1.0,
      uFinalFade
    );


  alpha *=
    uInitialFade;


  float edgeGuard =
    min(
      min(
        uv.x,
        1.0 - uv.x
      ),
      min(
        uv.y,
        1.0 - uv.y
      )
    );


  float edgeAlpha =
    smoothstep(
      -.015,
      .012,
      edgeGuard
    );


  alpha *= edgeAlpha;


  outColor =
    vec4(
      colour * alpha,
      alpha
    );
}
`,o=it(t,t.VERTEX_SHADER,n),i=it(t,t.FRAGMENT_SHADER,r),s=t.createProgram();if(!s)throw new Error("Program could not be created");if(t.attachShader(s,o),t.attachShader(s,i),t.linkProgram(s),!t.getProgramParameter(s,t.LINK_STATUS))throw new Error(t.getProgramInfoLog(s)||"Program link failed");t.useProgram(s),this.program=s;let c=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,c),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),t.STATIC_DRAW);let a=t.getAttribLocation(s,"aPosition");t.enableVertexAttribArray(a),t.vertexAttribPointer(a,2,t.FLOAT,!1,0,0);let l=p=>t.getUniformLocation(s,p);this.uniforms={image:l("uImage"),depth:l("uDepth"),imageRes:l("uImageRes"),canvasSize:l("uCanvasSize"),pointer:l("uPointer"),scroll:l("uScroll"),auto:l("uAuto"),autoZoom:l("uAutoZoom"),time:l("uTime"),progress:l("uProgress"),trace:l("uTrace"),lineWidth:l("uLineWidth"),pressure:l("uPressure"),threshold:l("uThreshold"),finalFade:l("uFinalFade"),initialFade:l("uInitialFade"),trackX:l("uTrackX"),trackY:l("uTrackY"),zoom:l("uZoom"),direction:l("uDirection")},t.uniform1i(this.uniforms.image,0),t.uniform1i(this.uniforms.depth,1),this.imageTexture=this.createTexture(t.TEXTURE0),this.depthTexture=this.createTexture(t.TEXTURE1),this.resizeCanvas()}createTexture(t){let n=this.gl,r=n.createTexture();if(!r)throw new Error("Texture could not be created");return n.activeTexture(t),n.bindTexture(n.TEXTURE_2D,r),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),r}uploadTextures(){let t=this.gl;t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,!0),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.imageTexture),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,this.sourceImage),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,this.depthTexture),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,this.depthImage)}createObserver(){this.observer=new IntersectionObserver(t=>{let n=t[0];this.inView=n.isIntersecting,this.autoLastTime=null,this.inView?(this.positionCanvas(),this.revealComplete&&!x().reduced&&this.requestFrame()):(this.target.x=0,this.target.y=0)},{threshold:0}),this.observer.observe(this.image)}startReveal(){if(x().reduced||!this.effectLoaded){this.showStaticImage();return}this.reducedStatic=!1,this.startTime=null,this.revealComplete=!1,this.pointer.x=0,this.pointer.y=0,this.target.x=0,this.target.y=0,this.auto.x=0,this.auto.y=0,this.auto.zoom=0,this.autoElapsed=0,this.autoLastTime=null;let t=performance.now();this.drawFrame(t,0),requestAnimationFrame(()=>{this.canvas&&(this.canvas.style.opacity="1",requestAnimationFrame(n=>{this.startTime=n,this.requestFrame()}))})}onPointerMove(t){if(!this.pointerTrackingEnabled||!this.ready||!this.revealComplete||!this.inView||x().reduced)return;let n=this.image.getBoundingClientRect();if(t.clientX<n.left||t.clientX>n.right||t.clientY<n.top||t.clientY>n.bottom){this.target.x=0,this.target.y=0,this.requestFrame();return}this.target.x=((t.clientX-n.left)/n.width-.5)*2,this.target.y=-(((t.clientY-n.top)/n.height-.5)*2),this.requestFrame()}requestFrame(){this.frameId===null&&(this.frameId=requestAnimationFrame(t=>this.render(t)))}render(t){if(this.frameId=null,!this.ready)return;this.startTime===null&&(this.startTime=t);let n=t-this.startTime;if(this.updateAuto(t),this.drawFrame(t,n),!this.revealComplete){this.requestFrame();return}if(!this.inView||x().reduced)return;if(this.autoTrackingEnabled){this.requestFrame();return}let r=Math.abs(this.target.x-this.pointer.x),o=Math.abs(this.target.y-this.pointer.y);(r>1e-4||o>1e-4)&&this.requestFrame()}drawFrame(t,n){this.resizeCanvas();let r=this.settings.initialFade<=0?1:Fe(Le(n/this.settings.initialFade)),o=Le(n/this.settings.duration),i=Fe(o),s=this.settings.duration-this.settings.finalFade,c=this.settings.finalFade<=0?n>=this.settings.duration?1:0:Fe(Le((n-s)/this.settings.finalFade));!this.revealComplete&&n>=this.settings.duration&&(this.revealComplete=!0,this.pointer.x=0,this.pointer.y=0,this.target.x=0,this.target.y=0,this.auto.x=0,this.auto.y=0,this.auto.zoom=0,this.autoElapsed=0,this.autoLastTime=null),this.revealComplete&&this.inView&&this.pointerTrackingEnabled&&(this.pointer.x+=(this.target.x-this.pointer.x)*.045,this.pointer.y+=(this.target.y-this.pointer.y)*.045);let a=this.gl,l=this.uniforms;a.clear(a.COLOR_BUFFER_BIT),a.useProgram(this.program),a.uniform2f(l.imageRes,this.imageRes[0],this.imageRes[1]),a.uniform2f(l.canvasSize,this.canvasCssSize[0],this.canvasCssSize[1]),a.uniform2f(l.pointer,this.revealComplete&&this.pointerTrackingEnabled?this.pointer.x:0,this.revealComplete&&this.pointerTrackingEnabled?this.pointer.y:0),a.uniform2f(l.scroll,this.revealComplete&&this.scrollTrackingEnabled?this.scroll.x:0,this.revealComplete&&this.scrollTrackingEnabled?this.scroll.y:0),a.uniform2f(l.auto,this.revealComplete&&this.autoTrackingEnabled?this.auto.x:0,this.revealComplete&&this.autoTrackingEnabled?this.auto.y:0),a.uniform1f(l.autoZoom,this.revealComplete&&this.autoTrackingEnabled?this.auto.zoom:0),a.uniform1f(l.time,t*.001),a.uniform1f(l.progress,i),a.uniform1f(l.trace,this.settings.trace),a.uniform1f(l.lineWidth,this.settings.lineWidth),a.uniform1f(l.pressure,this.settings.pressure),a.uniform1f(l.threshold,this.settings.threshold),a.uniform1f(l.finalFade,c),a.uniform1f(l.initialFade,r),a.uniform1f(l.trackX,this.settings.trackX),a.uniform1f(l.trackY,this.settings.trackY),a.uniform1f(l.zoom,this.settings.zoom),a.uniform1f(l.direction,this.settings.direction),a.drawArrays(a.TRIANGLES,0,6)}restoreImage(){this.image.style.opacity="1",this.canvas&&this.canvas.remove(),this.parentPositionChanged&&this.image.parentElement&&(this.image.parentElement.style.position=this.originalParentPosition)}},st=()=>{let e=window.matchMedia?.("(prefers-reduced-motion: reduce)");if(e){let n=()=>{x().mode==="system"&&window.dispatchEvent(new CustomEvent("mcMotionPreferenceChange",{detail:{mode:x().mode,reduced:x().reduced,systemReduced:x().systemReduced}}))};typeof e.addEventListener=="function"?e.addEventListener("change",n):typeof e.addListener=="function"&&e.addListener(n)}let t=()=>{let n=[...document.querySelectorAll(Yt)];if(!n.length){console.log("[MC Depth] No depth reveal images found");return}let r=ye();r.depth||(r.depth=[]),n.forEach(o=>{if(o.__mcDepthReveal){r.depth?.includes(o.__mcDepthReveal)||r.depth?.push(o.__mcDepthReveal);return}let i=new Pe(o);o.__mcDepthReveal=i,r.depth?.push(i)}),Zt({id:"depth",label:"Depth",instances:()=>ye().depth||[],instanceLabel:"Depth Hero",controls:[{type:"range",key:"autoX",label:"Auto X",min:-150,max:150,step:1,suffix:"px"},{type:"range",key:"autoY",label:"Auto Y",min:-150,max:150,step:1,suffix:"px"},{type:"range",key:"autoZoom",label:"Auto Zoom",min:-.05,max:.08,step:.001,decimals:3},{type:"range",key:"autoDuration",label:"Duration",min:4,max:60,step:1,suffix:"s"},{type:"button",label:"Replay",action:"replay"}]}),console.log(`[MC Depth] Found ${n.length} image(s)`)};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t,{once:!0}):t()};var Kt="top 75%";var Z="power3.out",Re=()=>(window.MC||(window.MC={}),window.MC),Jt=e=>{let t=Re();if(t.debug?.register){t.debug.register(e);return}t.__debugQueue||(t.__debugQueue=[]),t.__debugQueue.push(e)},er=e=>{let t=parseFloat(e.getAttribute("mc-illustration-duration")||""),n=parseFloat(e.getAttribute("mc-illustration-stagger")||""),r=e.getAttribute("mc-illustration-debug");return{duration:Number.isFinite(t)?t:1,stagger:Number.isFinite(n)?n:.25,start:e.getAttribute("mc-illustration-start")||Kt,debug:r==="1"||r==="true"}},at=e=>e instanceof SVGGeometryElement?e.getTotalLength():0,ve=e=>{switch(e.getAttribute("mc-illustration")){case"storefront":{let n=e.querySelector(".awning.a2"),r=e.querySelectorAll(".awning.a1, .awning.a3"),o=e.querySelectorAll(".centre"),i=e.querySelectorAll(".wing"),s=e.querySelectorAll(".dot");gsap.set(n,{y:-18,opacity:0}),gsap.set(r,{y:-18,opacity:0}),o.forEach(c=>{let a=getComputedStyle(c),l=parseFloat(a.getPropertyValue("--tx"))||0,p=parseFloat(a.getPropertyValue("--ty"))||0;gsap.set(c,{x:l,y:p,scale:1.03,opacity:0,transformOrigin:"center center"})}),i.forEach(c=>{let a=getComputedStyle(c),l=parseFloat(a.getPropertyValue("--x"))||0;gsap.set(c,{x:l,scale:1.03,opacity:0,transformOrigin:"center center"})}),gsap.set(s,{scale:0,opacity:0,transformOrigin:"center center"});break}case"linked-forms":{gsap.set(e.querySelector(".left-dark-arc"),{rotation:-75,opacity:0,transformOrigin:"121.936px 108.788px"}),gsap.set(e.querySelector(".right-dark-arc"),{rotation:75,opacity:0,transformOrigin:"198.786px 108.787px"}),gsap.set(e.querySelectorAll(".left-top-light, .left-upper-pale, .left-side-mid"),{scale:.82,opacity:0,transformOrigin:"121.936px 108.788px"}),gsap.set(e.querySelectorAll(".right-left-pale, .right-right-pale, .right-top-light"),{scale:.82,opacity:0,transformOrigin:"198.786px 108.787px"});break}case"linked-mechanisms":{e.querySelectorAll(".mechanism").forEach((r,o)=>{let i=r.querySelector(".mechanism-piece--a"),s=r.querySelector(".mechanism-piece--b"),c=o%2===0?-1:1;gsap.set(s,{rotation:85*c,opacity:0,transformOrigin:"center center"}),gsap.set(i,{scale:.78,opacity:0,transformOrigin:"center center"})});break}case"foundation-core":{gsap.set(e.querySelector(".core-piece-1"),{opacity:0,scale:.72,rotation:-7,transformOrigin:"center center"}),gsap.set(e.querySelector(".core-piece-2"),{opacity:0,scale:.78,rotation:12,transformOrigin:"center center"}),gsap.set(e.querySelector(".core-piece-3"),{opacity:0,x:-18,scale:.92}),gsap.set(e.querySelector(".core-piece-4"),{opacity:0,x:18,scale:.92}),gsap.set(e.querySelector(".core-piece-5"),{opacity:0,x:-18,scale:.92});let n=e.querySelector(".core-stroke");if(n){let r=at(n);gsap.set(n,{strokeDasharray:r,strokeDashoffset:r})}break}case"foundation-build":{gsap.set(e.querySelector(".build-curve-left"),{opacity:0,rotation:-70,scale:.9,transformOrigin:"center center"}),gsap.set(e.querySelector(".build-curve-right"),{opacity:0,rotation:70,scale:.9,transformOrigin:"center center"}),gsap.set(e.querySelector(".build-pie-left"),{opacity:0,x:-24}),gsap.set(e.querySelector(".build-pie-right"),{opacity:0,x:24});break}case"foundation-freedom":{gsap.set(e.querySelector(".freedom-piece-1"),{opacity:0,scale:.72,rotation:-7,transformOrigin:"center center"}),gsap.set(e.querySelector(".freedom-piece-2"),{opacity:0,scale:.78,rotation:12,transformOrigin:"center center"}),gsap.set(e.querySelector(".freedom-piece-3"),{opacity:0,x:18,scale:.92}),gsap.set(e.querySelector(".freedom-piece-4"),{opacity:0,scale:.78,rotation:12,transformOrigin:"center center"}),gsap.set(e.querySelector(".freedom-dot"),{opacity:0,scale:.35,transformOrigin:"center center"}),e.querySelectorAll(".freedom-stroke").forEach(n=>{let r=at(n);gsap.set(n,{strokeDasharray:r,strokeDashoffset:r})});break}case"foundation-ownership":{gsap.set(e.querySelector(".ownership-curve-left"),{opacity:0,rotation:-70,scale:.9,transformOrigin:"center center"}),gsap.set(e.querySelector(".ownership-curve-right"),{opacity:0,rotation:70,scale:.9,transformOrigin:"center center"}),gsap.set(e.querySelector(".ownership-pie-left"),{opacity:0,x:-24}),gsap.set(e.querySelector(".ownership-pie-right"),{opacity:0,x:24});break}}},tr=(e,t)=>{let n=e.querySelector(".awning.a2"),r=e.querySelectorAll(".awning.a1, .awning.a3"),o=e.querySelectorAll(".centre"),i=e.querySelectorAll(".wing"),s=e.querySelectorAll(".dot"),c=gsap.timeline({defaults:{ease:Z}});return c.to(n,{y:0,opacity:1,duration:t*.38},0),c.to(r,{y:0,opacity:1,duration:t*.38},t*.08),c.to(o,{x:0,y:0,scale:1,opacity:1,duration:t*.5},t*.22),c.to(i,{x:0,scale:1,opacity:1,duration:t*.42},t*.42),c.to(s,{scale:1,opacity:1,duration:t*.28},t*.66),c},rr=(e,t)=>{let n=e.querySelector(".left-dark-arc"),r=e.querySelector(".right-dark-arc"),o=e.querySelectorAll(".left-top-light, .left-upper-pale, .left-side-mid"),i=e.querySelectorAll(".right-left-pale, .right-right-pale, .right-top-light"),s=gsap.timeline({defaults:{ease:Z}});return s.to(n,{rotation:0,opacity:1,duration:t*.68},0),s.to(r,{rotation:0,opacity:1,duration:t*.68},0),s.to(o,{scale:1,opacity:1,duration:t*.38,stagger:.04},t*.48),s.to(i,{scale:1,opacity:1,duration:t*.38,stagger:.04},t*.48),s},nr=(e,t)=>{let n=e.querySelectorAll(".mechanism"),r=gsap.timeline({defaults:{ease:Z}});return n.forEach((o,i)=>{let s=o.querySelector(".mechanism-piece--a"),c=o.querySelector(".mechanism-piece--b"),a=i*t*.09;r.to(c,{rotation:0,opacity:1,duration:t*.62},a),r.to(s,{scale:1,opacity:1,duration:t*.36},a+t*.38)}),r},or=(e,t)=>{let n=e.querySelector(".core-piece-1"),r=e.querySelector(".core-piece-2"),o=e.querySelector(".core-piece-3"),i=e.querySelector(".core-piece-4"),s=e.querySelector(".core-piece-5"),c=e.querySelector(".core-stroke"),a=gsap.timeline({defaults:{ease:Z}});return a.to(n,{opacity:1,scale:1,rotation:0,duration:t*.72},t*.08),a.to(r,{opacity:1,scale:1,rotation:0,duration:t*.72},t*.2),a.to(o,{opacity:1,x:0,scale:1,duration:t*.72},t*.3),a.to(i,{opacity:1,x:0,scale:1,duration:t*.72},t*.4),a.to(s,{opacity:1,x:0,scale:1,duration:t*.72},t*.48),c&&a.to(c,{strokeDashoffset:0,duration:t*.62,ease:"power2.out"},t*.56),a},ir=(e,t)=>{let n=e.querySelector(".build-curve-left"),r=e.querySelector(".build-curve-right"),o=e.querySelector(".build-pie-left"),i=e.querySelector(".build-pie-right"),s=gsap.timeline({defaults:{ease:Z}});return s.to(n,{opacity:1,rotation:0,scale:1,duration:t*.72},t*.06),s.to(r,{opacity:1,rotation:0,scale:1,duration:t*.72},t*.18),s.to(o,{opacity:1,x:0,duration:t*.72},t*.38),s.to(i,{opacity:1,x:0,duration:t*.72},t*.5),s},sr=(e,t)=>{let n=e.querySelector(".freedom-piece-1"),r=e.querySelector(".freedom-piece-2"),o=e.querySelector(".freedom-piece-3"),i=e.querySelector(".freedom-piece-4"),s=e.querySelector(".freedom-dot"),c=e.querySelectorAll(".freedom-stroke"),a=gsap.timeline({defaults:{ease:Z}});return a.to(n,{opacity:1,scale:1,rotation:0,duration:t*.72},t*.06),a.to(r,{opacity:1,scale:1,rotation:0,duration:t*.72},t*.17),a.to(o,{opacity:1,x:0,scale:1,duration:t*.72},t*.29),a.to(i,{opacity:1,scale:1,rotation:0,duration:t*.72},t*.4),c.forEach((l,p)=>{a.to(l,{strokeDashoffset:0,duration:t*.62,ease:"power2.out"},t*(p===0?.5:.54))}),a.to(s,{opacity:1,scale:1,duration:t*.42,ease:"back.out(1.7)"},t*.58),a},ar=(e,t)=>{let n=e.querySelector(".ownership-curve-left"),r=e.querySelector(".ownership-curve-right"),o=e.querySelector(".ownership-pie-left"),i=e.querySelector(".ownership-pie-right"),s=gsap.timeline({defaults:{ease:Z}});return s.to(n,{opacity:1,rotation:0,scale:1,duration:t*.72},t*.06),s.to(r,{opacity:1,rotation:0,scale:1,duration:t*.72},t*.18),s.to(o,{opacity:1,x:0,duration:t*.72},t*.38),s.to(i,{opacity:1,x:0,duration:t*.72},t*.5),s},ct=(e,t)=>{let n=e.getAttribute("mc-illustration");switch(n){case"storefront":return tr(e,t);case"linked-forms":return rr(e,t);case"linked-mechanisms":return nr(e,t);case"foundation-core":return or(e,t);case"foundation-build":return ir(e,t);case"foundation-freedom":return sr(e,t);case"foundation-ownership":return ar(e,t);default:return console.warn(`[MC Illustration] Unknown illustration: ${n}`,e),null}},De=()=>window.MC?.motion&&typeof window.MC.motion.reduced=="boolean"?window.MC.motion.reduced:!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,lr=(e,t)=>{ve(e);let n=ct(e,t);n&&(n.progress(1),n.kill())},re=[],cr=(e,t)=>{let n=er(e),r={duration:n.duration,stagger:n.stagger,start:n.start,debug:n.debug},o=[...e.querySelectorAll("[mc-illustration]")],i=null,s=null,c=()=>{i&&(i.kill(),i=null),s&&(s.kill(),s=null)},a=()=>{c(),o.forEach(w=>{lr(w,r.duration)}),e.dataset.mcIllustrationReducedMotion="1"},l=()=>{c(),delete e.dataset.mcIllustrationReducedMotion,o.forEach(ve),i=gsap.timeline({paused:!0}),o.forEach((w,R)=>{let L=ct(w,r.duration);!L||!i||i.add(L,R*r.stagger)}),i.pause(0),s=ScrollTrigger.create({id:`mc-illustration-sequence-${t+1}`,trigger:e,start:r.start,markers:r.debug,onEnter:()=>{i?.play(0)},onLeaveBack:()=>{i?.pause(0),o.forEach(ve)}}),e.dataset.mcIllustrationSequenceReady="1"},p=()=>{De()?a():l(),requestAnimationFrame(()=>{ScrollTrigger.refresh()})},y={element:e,illustrations:o,settings:r,get(w){return r[w]},set(w,R){let L=Number(R);if(Number.isFinite(L)){if(w==="duration"){r.duration=Math.max(.01,L),e.setAttribute("mc-illustration-duration",String(r.duration)),p();return}w==="stagger"&&(r.stagger=Math.max(0,L),e.setAttribute("mc-illustration-stagger",String(r.stagger)),p())}},rebuild:p,showFinal:a,replay(){if(De()){a();return}i||l(),o.forEach(ve),i?.pause(0),i?.play(0)},destroy:c};return p(),r.debug&&console.log("[MC Illustration] Sequence ready",{sequence:t+1,illustrations:o.map(w=>w.getAttribute("mc-illustration")),duration:r.duration,stagger:r.stagger,start:r.start,reducedMotion:De()}),y},ur=()=>{let e=document.querySelectorAll("[mc-illustration-sequence]");re.splice(0,re.length),e.forEach((n,r)=>{let o=cr(n,r);re.push(o)});let t=Re();t.illustrationSequences=re,console.log(`[MC Illustration] Registered ${re.length} sequence(s).`),Jt({id:"illustration-sequences",label:"Illustration Sequence",instances:()=>Re().illustrationSequences||[],instanceLabel:"Sequence",controls:[{type:"range",key:"duration",label:"Duration",min:.1,max:3,step:.05,suffix:"s",decimals:2,event:"change"},{type:"range",key:"stagger",label:"Stagger",min:0,max:1.5,step:.05,suffix:"s",decimals:2,event:"change"},{type:"button",label:"Replay",action:"replay"}]})},lt=()=>{re.forEach(e=>{e.rebuild()})},ut=()=>{gsap.registerPlugin(ScrollTrigger),window.addEventListener("mcMotionPreferenceChange",lt);let e=window.matchMedia?.("(prefers-reduced-motion: reduce)");if(e){let n=()=>{(!window.MC?.motion||window.MC.motion.mode==="system")&&lt()};typeof e.addEventListener=="function"?e.addEventListener("change",n):typeof e.addListener=="function"&&e.addListener(n)}let t=()=>{ur(),requestAnimationFrame(()=>{ScrollTrigger.refresh()})};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",t,{once:!0}):t()};var ne={form:"form",field:'input[required], select[required], textarea[required], input[type="email"]',fieldWrapper:'[mc-form="field-wrapper"]'},W={fieldError:"has-error",errorMessage:"form-field-error"},_={required:"Please complete this field",fullName:"Enter your full name",emailRequired:"Enter your email address",emailInvalid:"Enter a valid email address",streetAddress:"Enter your street address",city:"Enter your city",postalCode:"Enter your postal / ZIP code",country:"Select your country"},b=(...e)=>{console.log("[MC Form]",...e)},ue=(...e)=>{console.warn("[MC Form]",...e)},dr=(...e)=>{console.error("[MC Form]",...e)},ht=e=>{let t=e.closest(ne.fieldWrapper);if(!t)return ue("getErrorElement(): wrapper not found",e),null;let n=t.querySelector(`.${W.errorMessage}`);return b("getErrorElement():",{field:e,wrapper:t,error:n}),n},mr=e=>{let n=`${e.id||e.name||`field-${Math.random().toString(36).slice(2,8)}`}-error`;return b("createErrorId():",{field:e,id:n}),n},dt=e=>{b("clearError()",e),e.classList.remove(W.fieldError),e.removeAttribute("aria-invalid"),e.removeAttribute("aria-describedby");let t=ht(e);t&&(b("Removing error element:",t),t.remove())},hr=(e,t)=>{let n=e.closest(ne.fieldWrapper);if(b("showError()",{field:e,message:t,wrapper:n}),!n){dr("No field wrapper found for field:",e,`Expected ancestor matching ${ne.fieldWrapper}`);return}e.classList.add(W.fieldError),e.setAttribute("aria-invalid","true");let r=ht(e);r?b("Reusing existing error element:",r):(b("Creating error element for:",e),r=document.createElement("div"),r.classList.add(W.errorMessage),n.appendChild(r)),r.id||(r.id=mr(e)),e.setAttribute("aria-describedby",r.id),r.textContent=t,b("Error rendered:",{field:e,error:r,errorId:r.id,message:t})},gr=e=>{let t=(e.type||"").toLowerCase(),n=(e.name||"").toLowerCase();return b("getRequiredMessage()",{field:e,type:t,name:n}),t==="email"?_.emailRequired:e.tagName==="SELECT"?_.country:n.includes("name")?_.fullName:n.includes("street")||n.includes("address-line1")?_.streetAddress:n.includes("city")?_.city:n.includes("postal")||n.includes("postcode")||n.includes("zip")?_.postalCode:n.includes("country")?_.country:_.required},Ce=e=>{if(b("validateField()",{field:e,name:e.name,type:e.type,value:e.value,required:e.required,disabled:e.disabled,willValidate:e.willValidate}),!e.willValidate)return ue("Field will not validate:",e),dt(e),!0;let t=e.checkValidity();if(b("checkValidity():",{field:e,name:e.name,isValid:t,validity:{valueMissing:e.validity.valueMissing,typeMismatch:e.validity.typeMismatch,patternMismatch:e.validity.patternMismatch,tooLong:e.validity.tooLong,tooShort:e.validity.tooShort,rangeUnderflow:e.validity.rangeUnderflow,rangeOverflow:e.validity.rangeOverflow,stepMismatch:e.validity.stepMismatch,badInput:e.validity.badInput,customError:e.validity.customError,valid:e.validity.valid}}),t)return b("Field valid. Clearing error:",e),dt(e),!0;let n=_.required;return e.validity.valueMissing?n=gr(e):e.type==="email"&&e.validity.typeMismatch&&(n=_.emailInvalid),ue("Field invalid:",{field:e,name:e.name,message:n}),hr(e,n),!1},mt=()=>{b("Script initialised"),b("Document readyState:",document.readyState);let e=document.querySelectorAll(ne.form);b("Forms found:",e.length,e),e.forEach((t,n)=>{b(`Initialising form ${n+1}`,t),t.setAttribute("novalidate","");let r=Array.from(t.querySelectorAll(ne.field));b(`Form ${n+1}: matching fields found:`,r.length,r),r.forEach((o,i)=>{b(`Field ${i+1}`,{element:o,tagName:o.tagName,type:o.type,name:o.name,id:o.id,required:o.required,disabled:o.disabled,willValidate:o.willValidate,value:o.value,wrapper:o.closest(ne.fieldWrapper)})}),t.addEventListener("invalid",o=>{b("Native invalid event intercepted:",o.target),o.preventDefault()},!0),r.forEach(o=>{let i=!1;o.addEventListener("blur",()=>{let s=String(o.value||"").trim()!=="";b("Blur:",{field:o,name:o.name,value:o.value,hasBeenTouched:i,hasValue:s}),(i||s)&&Ce(o),i=!0}),o.addEventListener("input",()=>{i=!0,b("Input:",{field:o,name:o.name,value:o.value,hasError:o.classList.contains(W.fieldError)}),o.classList.contains(W.fieldError)&&Ce(o)}),o.addEventListener("change",()=>{i=!0,b("Change:",{field:o,name:o.name,value:o.value,hasError:o.classList.contains(W.fieldError)}),o.classList.contains(W.fieldError)&&Ce(o)})}),t.addEventListener("submit",o=>{b("Submit captured:",t);let i=null;for(let s of r){if(b("Checking field on submit:",{field:s,name:s.name,willValidate:s.willValidate,value:s.value}),!s.willValidate){ue("Skipping field because willValidate = false:",s);continue}let c=Ce(s);b("Submit validation result:",{field:s,name:s.name,isValid:c}),!c&&!i&&(i=s)}if(i!==null){let s=i;return ue("Submission blocked. First invalid field:",s),o.preventDefault(),o.stopPropagation(),o.stopImmediatePropagation(),s.focus({preventScroll:!0}),s.scrollIntoView({behavior:"smooth",block:"center"}),!1}b("Form valid. Allowing Webflow submission to continue.")},!0)})},gt=()=>{if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",mt,{once:!0});return}mt()};var Ie={scope:'form[mc-prefill="True"], [mc-prefill="True"] form',prefillField:"input, select, textarea",editButton:'[mc-billing-form="edit"]'},j=(...e)=>{console.log("[MC Prefill]",...e)},pr=(...e)=>{console.warn("[MC Prefill]",...e)},fr=e=>e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement,br=(e,t)=>{if(fr(e)){e.readOnly=t,e.toggleAttribute("data-mc-prefill-readonly",t);return}e instanceof HTMLSelectElement&&(e.disabled=t)},bt=e=>Array.from(e.querySelectorAll(Ie.prefillField)).filter(t=>t instanceof HTMLInputElement?t.type!=="hidden"&&t.type!=="submit"&&t.type!=="button":!0),pt=(e,t)=>{let n=bt(e);j("Updating editable state:",{scope:e,locked:t,fieldCount:n.length,fields:n}),n.forEach(r=>{br(r,t)})},yr=e=>{let t=e.getAttribute("mc-prefill-value");if(t!==null)return t;let n=e.getAttribute("mc-prefill");return n!==null&&n!=="True"?n:null},vr=(e,t)=>{j(`Initialising scope ${t+1}`,e),bt(e).forEach(i=>{let s=yr(i);s!==null&&(i.value=s,j("Applied prefill:",{field:i,value:s}))});let r=Array.from(e.querySelectorAll(Ie.editButton));if(!r.length){pr('No mc-billing-form="edit" buttons found in prefill scope:',e);return}let o=!0;pt(e,o),r.forEach(i=>{i.addEventListener("click",s=>{s.preventDefault(),o=!o,j("Edit button clicked:",{button:i,isLocked:o,form:e}),pt(e,o)})})},ft=()=>{j("Script initialised"),j("Document readyState:",document.readyState);let e=Array.from(document.querySelectorAll(Ie.scope));j("Prefill scopes found:",e.length,e),e.forEach((t,n)=>{vr(t,n)})},yt=()=>{if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",ft,{once:!0});return}ft()};var Se={THEMES:"colorThemes_data_v3",PUBLISH_DATE:"colorThemes_publishDate_v3"},oe={feature:"ui-theme_feature_",cta:"ui-theme_cta_",icon:"ui-theme_icon_"},A=(...e)=>{console.log("[MC Theme]",...e)},$=(...e)=>{console.warn("[MC Theme]",...e)},vt=(...e)=>{console.error("[MC Theme]",...e)},Cr=()=>({themes:{},ctaThemes:{},iconThemes:{},getTheme(e="",t="",n=""){let r={};if(e){let o=this.themes[e];o?Object.assign(r,o):$(`Feature theme "${e}" not found`,Object.keys(this.themes))}if(t){let o=this.ctaThemes[t];o?Object.assign(r,o):$(`CTA theme "${t}" not found`,Object.keys(this.ctaThemes))}if(n){let o=this.iconThemes[n];o?Object.assign(r,o):$(`Icon theme "${n}" not found`,Object.keys(this.iconThemes))}return A("getTheme()",{featureName:e,ctaName:t,iconName:n,result:r}),r}}),Ne=()=>(window.colorThemes||(window.colorThemes=Cr()),window.colorThemes),Et=()=>{try{let e=document.documentElement.previousSibling;if(!e||e.nodeType!==Node.COMMENT_NODE)return null;let t=e.textContent?.match(/Last Published: (.+?) GMT/);return t?new Date(t[1]).getTime():null}catch(e){return $("Could not determine Webflow publish date:",e),null}},Sr=()=>{try{let e=localStorage.getItem(Se.PUBLISH_DATE),t=Et();if(!t||!e||e!==t.toString())return A("No valid cached theme data"),null;let n=localStorage.getItem(Se.THEMES);if(!n)return null;let r=JSON.parse(n);return A("Loaded theme data from cache:",r),r}catch(e){return $("Failed to load theme cache:",e),null}},Er=()=>{try{let e=Et();if(!e){$("Publish date unavailable \u2014 theme cache skipped");return}let t=Ne(),n={themes:t.themes,ctaThemes:t.ctaThemes,iconThemes:t.iconThemes};localStorage.setItem(Se.PUBLISH_DATE,e.toString()),localStorage.setItem(Se.THEMES,JSON.stringify(n)),A("Theme data cached")}catch(e){$("Failed to cache themes:",e)}},wt=e=>e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),wr=(e,t)=>{let n=wt(t),o=new RegExp(`\\.${n}\\{([^}]*)\\}`,"g").exec(e);return o?o[1]:""},Tr=(e,t)=>{let n=wr(e,t);if(!n)return $(`No CSS rule found for .${t}`),[];let r=[],o=/(--[^:;{}]+)\s*:/g,i;for(;(i=o.exec(n))!==null;){let s=i[1].trim();s.includes("\\<deleted\\|")||r.push(s)}return[...new Set(r)]},Mr=(e,t,n)=>{n.className=e;let r=getComputedStyle(n),o={};return t.forEach(i=>{let s=r.getPropertyValue(i).trim();s&&(o[i]=s)}),A(`Resolved .${e}:`,o),o},qe=(e,t)=>{let n=wt(t),r=new RegExp(`\\.${n}[\\w-]+`,"g"),o=e.match(r)||[];return[...new Set(o.map(i=>i.replace(".","")))]},Ge=({cssText:e,classes:t,prefix:n,destination:r,label:o,probe:i})=>{t.forEach(s=>{let c=s.replace(n,""),a=Tr(e,s);if(!a.length){A(`Skipping ${o} "${c}" \u2014 no custom properties`);return}A(`${o} "${c}" variables:`,a),r[c]=Mr(s,a,i)})},Ct=()=>{let e=Ne();A("Feature themes:",e.themes),A("CTA themes:",e.ctaThemes),A("Icon themes:",e.iconThemes),A("Dispatching colorThemesReady"),document.dispatchEvent(new CustomEvent("colorThemesReady"))},St=()=>{let e=Ne();A("Theme Collector starting");let t=Sr();if(t){e.themes=t.themes||{},e.ctaThemes=t.ctaThemes||{},e.iconThemes=t.iconThemes||{},Ct();return}let n=Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(r=>r.href.includes("webflow"))||document.querySelector('link[rel="stylesheet"]');if(!n?.href){vt("Could not find Webflow stylesheet");return}A("Fetching stylesheet:",n.href),fetch(n.href).then(r=>{if(A("Stylesheet response:",r.status),!r.ok)throw new Error(`Stylesheet fetch failed: ${r.status}`);return r.text()}).then(r=>{A("Stylesheet loaded:",`${r.length} chars`);let o=qe(r,oe.feature),i=qe(r,oe.cta),s=qe(r,oe.icon);A("Feature mode classes:",o),A("CTA mode classes:",i),A("Icon mode classes:",s);let c=document.createElement("div");c.setAttribute("aria-hidden","true"),Object.assign(c.style,{position:"fixed",width:"0",height:"0",overflow:"hidden",visibility:"hidden",pointerEvents:"none",top:"-9999px",left:"-9999px"}),document.body.appendChild(c),Ge({cssText:r,classes:o,prefix:oe.feature,destination:e.themes,label:"Feature mode",probe:c}),Ge({cssText:r,classes:i,prefix:oe.cta,destination:e.ctaThemes,label:"CTA mode",probe:c}),Ge({cssText:r,classes:s,prefix:oe.icon,destination:e.iconThemes,label:"Icon mode",probe:c}),c.remove(),Er(),Ct()}).catch(r=>{vt("Theme Collector failed:",r)})},Tt=()=>{if(document.readyState==="loading"){window.addEventListener("DOMContentLoaded",St,{once:!0});return}St()};var xr=(e,t)=>{gsap?.to(e,{...t,duration:.5,ease:"power1.out",overwrite:"auto",onStart(){console.log("[MC Theme] GSAP started")},onComplete(){console.log("[MC Theme] GSAP completed")}})},kr=()=>{if(console.log("[MC Theme] colorThemesReady received"),typeof gsap>"u"){console.error("[MC Theme] GSAP not loaded");return}if(typeof ScrollTrigger>"u"){console.error("[MC Theme] ScrollTrigger not loaded");return}gsap.registerPlugin(ScrollTrigger);let e=document.querySelectorAll('[mc-theme="target"]');if(console.log("[MC Theme] Targets found:",e.length,e),!e.length){console.warn('[MC Theme] No [mc-theme="target"] elements found');return}let t=document.querySelectorAll("[data-animate-theme-to]");console.log("[MC Theme] Triggers found:",t.length,t),t.forEach((n,r)=>{let o=n.getAttribute("data-animate-theme-to")||"",i=n.getAttribute("data-animate-cta-to")||"",s=n.getAttribute("data-animate-icon-to")||"",c=window.colorThemes.getTheme(o,i,s);console.log(`[MC Theme] Trigger ${r+1}`,{trigger:n,feature:o,cta:i,icon:s,values:c}),ScrollTrigger.create({trigger:n,start:"top center",end:"bottom center",onToggle({isActive:a}){if(console.log(`[MC Theme] Trigger ${r+1} toggle`,{isActive:a,feature:o,cta:i,icon:s}),!a)return;let l=window.colorThemes.getTheme(o,i,s);if(console.log("[MC Theme] Applying:",l),!Object.keys(l).length){console.warn("[MC Theme] Theme resolved to an empty object");return}xr(e,l)}}),console.log(`[MC Theme] ScrollTrigger ${r+1} created`)})},Mt=()=>{document.addEventListener("colorThemesReady",kr)};var xt=()=>{Mt(),Tt()};Be();He();Je();rt();st();ut();gt();yt();xt();})();
