/* 大画像スライドショー v2 — ページ内のサムネイルの先にある大きい画像を全画面スライドショーにする。起動用ブックマークとAndroidアプリから読み込まれる本体。 */
function SS2(){
var d=document,W=window,HID='__ss2_host';
var old=d.getElementById(HID);
if(old){if(old.__close)old.__close();return;}
var KEY='__ss2_cfg',cfg={sec:5,min:300,sigs:null,fit:'fit',src:'both'};
var FITS=[['fit','全体','全体を表示'],['w','横幅','横幅に合わせる'],['h','高さ','高さに合わせる']];
try{var sv=JSON.parse(localStorage.getItem(KEY)||'null');if(sv)for(var k in sv)cfg[k]=sv[k];}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(cfg));}catch(e){}}
var IMGX=/\.(jpe?g|png|gif|webp|avif|bmp|jfif)$/i;
var ADH=/(doubleclick|googlesyndication|googleadservices|adservice\.google|amazon-adsystem|adnxs|criteo|taboola|outbrain|exoclick|exosrv|juicyads|trafficjunky|trafficstars|adsterra|propellerads|popads|popcash|ad-stir|i-mobile|nend\.net|microad|fluct|a8\.net|afi-b|valuecommerce|moshimo|accesstrade|impact-ad|logly|popin\.cc|zucks|yads|adingo|smartadserver|rubiconproject|pubmatic|openx|adform|admatrix|gmossp|socdm|dsp\.)/i;
var ADC=/(^|[\s_-])(ads?|adv|advert|adverts|advertisement|adsbygoogle|adslot|adunit|adarea|adbox|banners?|sponsor|sponsored|promo|promotion|affiliate|outbrain|taboola)($|[\s_-])/i;
var ADS=[[300,250],[336,280],[728,90],[970,90],[970,250],[320,50],[320,100],[468,60],[160,600],[300,600],[120,600],[300,100],[234,60]];
var BIGA=['data-full','data-full-src','data-fullsrc','data-large','data-large-file','data-orig-file','data-original','data-orig','data-zoom-image','data-zoom-src','data-hi-res','data-highres'];
var LAZY=['data-src','data-lazy-src','data-lazy','data-url','data-echo','data-img'];
function abs(u,b){if(!u)return null;u=String(u).trim();if(!u||/^(javascript|mailto|tel|data|blob|about):/i.test(u))return null;try{return new URL(u,b).href;}catch(e){return null;}}
function host(u){try{return new URL(u).hostname;}catch(e){return '';}}
function pth(u){try{return new URL(u).pathname;}catch(e){return '';}}
function noH(u){return (u||'').split('#')[0];}
function isAd(u){var h=host(u);return ADH.test(h)||/(^|\.)(ads?|adserver|adimg|banners?)\d*\./i.test(h);}
function base(h){var p=h.split('.');if(p.length<=2)return h;var n=(p[p.length-1].length===2&&/^(co|ne|or|ac|go|ed|gr|lg|ad|com|net|org)$/.test(p[p.length-2]))?3:2;return p.slice(-n).join('.');}
var HOME=base(location.hostname);
function adAnc(el){for(var i=0;el&&el.getAttribute&&i<8;i++,el=el.parentElement){var s=(el.getAttribute('class')||'')+' '+(el.id||'');if(ADC.test(s)||el.hasAttribute('data-ad-slot')||el.hasAttribute('data-ad-client')||el.hasAttribute('data-google-query-id'))return true;}return false;}
function adSize(w,h){if(!w||!h)return false;var r=w/h;if(r>3.5||r<0.28)return true;return ADS.some(function(s){return Math.abs(s[0]-w)<=2&&Math.abs(s[1]-h)<=2;});}
function uniq(L){var s={},o=[];L.forEach(function(u){if(u&&!s[u]){s[u]=1;o.push(u);}});return o;}
function bestSet(s,b){if(!s)return null;var best=null,bw=-1;s.split(/,\s+/).forEach(function(p){var t=p.trim().split(/\s+/);if(!t[0])return;var w=parseFloat(t[1])||1;if(/x$/i.test(t[1]||''))w*=1000;if(w>bw){bw=w;best=t[0];}});return abs(best,b);}
function bigList(im,b){var L=[];BIGA.forEach(function(a){L.push(abs(im.getAttribute(a),b));});var pic=im.closest&&im.closest('picture');if(pic)[].forEach.call(pic.querySelectorAll('source'),function(so){L.push(bestSet(so.getAttribute('srcset')||so.getAttribute('data-srcset'),b));});L.push(bestSet(im.getAttribute('srcset'),b));L.push(bestSet(im.getAttribute('data-srcset'),b));LAZY.forEach(function(a){L.push(abs(im.getAttribute(a),b));});L.push(abs(im.getAttribute('src'),b));return uniq(L);}
function thumbOf(im,b,live){var c=live&&im.currentSrc;if(c&&!/^data:/.test(c))return c;var L=[abs(im.getAttribute('src'),b)];LAZY.forEach(function(a){L.push(abs(im.getAttribute(a),b));});L.push(abs(im.getAttribute('data-original'),b));L.push(bestSet(im.getAttribute('srcset')||im.getAttribute('data-srcset'),b));return uniq(L)[0]||null;}
function bgOf(el,live){var s=live?getComputedStyle(el).backgroundImage:(el.getAttribute('style')||'');var m=/url\((['"]?)(.*?)\1\)/.exec(s||'');return m?m[2]:null;}
function sig(el){var s=[];for(var i=0;i<4&&el&&el.tagName;i++,el=el.parentElement){var c=(el.getAttribute('class')||'').split(/\s+/).filter(function(x){return x&&!/\d/.test(x)&&!/^(is-|js-)?(active|current|selected|show|shown|visible|loaded|lazy\w*|hover)$/i.test(x);}).sort().slice(0,2).join('.');s.push(el.tagName.toLowerCase()+(c?'.'+c:''));}return s.join('<');}
function docBase(doc,u){var bt=doc.querySelector('base[href]');return (bt&&abs(bt.getAttribute('href'),u))||u;}
var candEls=[],exK={};
function collect(doc,url,live,known,out){
var b=docBase(doc,url),ex=0,me=noH(url),as=doc.querySelectorAll('a[href]');
for(var i=0;i<as.length;i++){
var a=as[i],u=abs(a.getAttribute('href'),b);if(!u||noH(u)===me)continue;
var im=a.querySelector('img'),th=null,w=0,h=0,r;
if(im){th=thumbOf(im,b,live);if(live){r=im.getBoundingClientRect();w=r.width;h=r.height;if(!w&&!h&&!im.getClientRects().length)continue;}else{w=+im.getAttribute('width')||0;h=+im.getAttribute('height')||0;}}
else{var els=[a].concat([].slice.call(a.querySelectorAll('div,span,figure,i'),0,3));for(var j=0;j<els.length&&!th;j++){th=abs(bgOf(els[j],live),b);if(th&&live){r=els[j].getBoundingClientRect();w=r.width;h=r.height;}}}
if(!th)continue;
var direct=IMGX.test(pth(u));
if(isAd(u)||isAd(th)||adAnc(a)||adSize(w,h)||(!direct&&base(host(u))!==HOME)){if(!exK[noH(u)]){exK[noH(u)]=1;ex++;}continue;}
if(w&&h&&(w<40||h<40))continue;
if(known[noH(u)])continue;known[noH(u)]=1;
if(live&&im)candEls.push(im);
out.push({href:u,thumb:th,sig:sig(a),direct:direct,el:a});
}
return ex;}
var BODYQ='.article-body,.article-body-inner,.entry-content,.entry-body,.entry_body,.post-content,.post-body,.post_body,.article_body,.article-content,.blogbody,.entry-inner,[itemprop="articleBody"]';
function bodies(doc){return [].slice.call(doc.querySelectorAll(BODYQ));}
function inBody(el,B){for(var i=0;i<B.length;i++)if(B[i].contains(el))return true;return false;}
function pageImgs(doc,url,live,known,out){var b=docBase(doc,url),L=doc.querySelectorAll('img'),B=bodies(doc),tmp=[];
for(var i=0;i<L.length;i++){var im=L[i],a=im.closest('a[href]');
if(a){var au=abs(a.getAttribute('href'),b);if(au&&noH(au)!==noH(url))continue;}
if(adAnc(im))continue;
var BL=bigList(im,b),th=thumbOf(im,b,live),full=BL[0]||th;if(!full)continue;th=th||full;
if(/\.svg$/i.test(pth(full))||isAd(full)||known[full])continue;
var rw=0,rh=0,ok=false;
if(live){var r=im.getBoundingClientRect();rw=r.width;rh=r.height;if((im.currentSrc||'')===full&&im.complete&&im.naturalWidth){if(im.naturalWidth<cfg.min||im.naturalHeight<cfg.min)continue;ok=true;}}
else{rw=+im.getAttribute('width')||0;rh=+im.getAttribute('height')||0;if(rw&&rh&&(rw<cfg.min||rh<cfg.min)&&BL.length<2)continue;}
if(adSize(rw,rh))continue;
if(rw&&rh&&rw<40&&rh<40)continue;
tmp.push({it:{href:null,thumb:th,full:full,sig:'__page',direct:true,el:im,chk:!ok},ib:B.length&&inBody(im,B)});}
var anyB=tmp.some(function(x){return x.ib;});tmp.forEach(function(x){if(anyB&&!x.ib)return;if(known[x.it.full])return;known[x.it.full]=1;if(live)candEls.push(x.it.el);out.push(x.it);});}
function sortItems(){items.sort(function(x,y){var a=x.pg||0,c=y.pg||0;if(a!==c)return a-c;if(!x.el||!y.el||x.el===y.el)return 0;return x.el.compareDocumentPosition(y.el)&4?-1:1;});}
var vq=[],vn=0,vT=null;
function verifyAll(){items.forEach(function(it){if(it.chk&&!it.vq){it.vq=1;vq.push(it);}});pump();}
function pump(){while(vn<4&&vq.length){(function(it){vn++;dims(it.full).then(function(m){vn--;if(m&&Math.min(m.w,m.h)>=cfg.min)it.chk=false;else it.bad=true;clearTimeout(vT);vT=setTimeout(function(){items=items.filter(function(x){return !x.bad;});regroup();if(mode==='grid')renderGrid();else refreshSL();},250);pump();});})(vq.shift());}}
var nextArt=false;
function findNext(doc,b,vis){nextArt=false;var as=doc.querySelectorAll('a[href]'),i,a,t,v;
for(i=0;i<as.length;i++){a=as[i];t=(a.textContent||'').trim();if(/^(次の記事|次の話|次話|次のエピソード|次回)/.test(t)||/(^|[\s_-])next-?(article|entry|post)($|[\s_-])/i.test(a.getAttribute('class')||'')){v=abs(a.getAttribute('href'),b);if(v&&!vis[noH(v)]){nextArt=true;return v;}}}
var c=doc.querySelector('link[rel="next"],a[rel~="next"]'),u=c&&abs(c.getAttribute('href'),b);if(u&&!vis[noH(u)])return u;
for(i=0;i<as.length;i++){a=as[i];t=(a.textContent||'').trim();var cl=(a.getAttribute('class')||'')+' '+(a.getAttribute('aria-label')||'');if(/^(次へ|次のページ|次の\d+件|次 ?[>＞»›]|next\b|›|»|>|＞|→)/i.test(t)||/(^|[\s_-])next($|[\s_-])/i.test(cl)){v=abs(a.getAttribute('href'),b);if(v&&!vis[noH(v)])return v;}}
return null;}
function fetchDoc(u){return fetch(u,{credentials:'include'}).then(function(r){if(!r.ok)throw new Error('http');var ct=r.headers.get('content-type')||'';return r.arrayBuffer().then(function(buf){var m=/charset=([\w-]+)/i.exec(ct),cs=m&&m[1];if(!cs){var hd=new TextDecoder('windows-1252').decode(buf.slice(0,4096));var m2=/charset=["']?([\w-]+)/i.exec(hd);cs=m2&&m2[1];}var t;try{t=new TextDecoder(cs||'utf-8').decode(buf);}catch(e){t=new TextDecoder().decode(buf);}return new DOMParser().parseFromString(t,'text/html');});});}
var dimC={};
function dims(u,to){if(dimC[u])return dimC[u];var p=new Promise(function(res){var im=new Image(),done=false;function fin(v){if(done)return;done=true;if(!v)delete dimC[u];res(v);}im.onload=function(){fin(im.naturalWidth?{w:im.naturalWidth,h:im.naturalHeight}:null);};im.onerror=function(){fin(null);};setTimeout(function(){fin(null);},to||20000);im.src=u;});dimC[u]=p;return p;}
var chrome={};
function bestFromDoc(doc,url){var b=docBase(doc,url),t3=[],t2=[],seen={};
function add(arr,u,s){if(!u||seen[u]||chrome[u]||isAd(u)||/\.svg$/i.test(pth(u)))return;seen[u]=1;arr.push({u:u,s:s});}
[].forEach.call(doc.querySelectorAll('a[href]'),function(a){var u=abs(a.getAttribute('href'),b);if(u&&IMGX.test(pth(u))&&!adAnc(a))add(t3,u,0);});
['meta[property="og:image"]','meta[property="og:image:url"]','meta[name="twitter:image"]','meta[name="twitter:image:src"]'].forEach(function(q){var m=doc.querySelector(q);if(m)add(t2,abs(m.getAttribute('content'),b),5);});
[].forEach.call(doc.querySelectorAll('img'),function(im,i){if(adAnc(im))return;var w=+im.getAttribute('width')||0,h=+im.getAttribute('height')||0;if(w&&h&&(w<cfg.min||h<cfg.min))return;var a=im.closest('a[href]'),pen=0;if(a){var au=abs(a.getAttribute('href'),b);if(au&&!IMGX.test(pth(au)))pen=-100000;}bigList(im,b).slice(0,2).forEach(function(u,j){add(t2,u,w*(h||w)/1000+pen-j-i*0.001);});});
t2.sort(function(x,y){return y.s-x.s;});
return [t3.slice(0,6),t2.slice(0,6)];}
function pick(tiers){var i=0;function nx(){if(i>=tiers.length)return Promise.resolve(null);var c=tiers[i++];if(!c.length)return nx();return Promise.all(c.map(function(x){return dims(x.u).then(function(m){return m&&Math.min(m.w,m.h)>=cfg.min?{url:x.u,w:m.w,h:m.h}:null;});})).then(function(rs){var best=null;rs.forEach(function(r){if(r&&(!best||r.w*r.h>best.w*best.h))best=r;});return best||nx();});}return nx();}
function variants(u){var o=[];function add(x){if(x&&x!==u&&o.indexOf(x)<0)o.push(x);}
add(u.replace(/([?&])(w|h|width|height|size|resize|fit|quality|q|crop)=[^&]*/gi,'$1').replace(/[?&]+$/,'').replace(/\?&+/,'?'));
add(u.replace(/[_-](thumb|thumbnail|thumbs|small|sm|s|m|t|mini|tn)(?=\.\w+(\?|$))/i,''));
add(u.replace(/[-_]\d{2,4}x\d{2,4}(?=\.\w+(\?|$))/,''));
add(u.replace(/\/(thumbs?|thumbnails?|small|sm|mini|t|s|tn)\//i,'/'));
add(u.replace(/\/(thumbs?|thumbnails?|small)\//i,'/large/'));
add(u.replace(/\/s\d{2,4}(-[a-z]+)?\//,'/s0/').replace(/=s\d{2,4}(-[a-z-]+)?$/,'=s0'));
return o.slice(0,6);}
function dethumb(it){var th=it.thumb,V=variants(th),i=0;return dims(th).then(function(t0){var a0=t0?t0.w*t0.h:0;function nx(){if(i>=V.length)return {url:th,low:true};var v=V[i++];return dims(v,8000).then(function(m){return m&&m.w*m.h>a0*1.5&&Math.min(m.w,m.h)>=cfg.min?{url:v,w:m.w,h:m.h}:nx();});}return nx();});}
function resolve(it){if(it.p)return it.p;var p;
if(it.direct){var fu=it.full||it.href;p=dims(fu).then(function(m){return m?{url:fu,w:m.w,h:m.h}:null;});}
else p=fetchDoc(it.href).then(function(doc){return pick(bestFromDoc(doc,it.href));},function(){return null;});
it.p=p.then(function(r){return r||dethumb(it);}).then(function(r){it.r=r;return r;});return it.p;}
var items=[],known={},excluded=0,groups=[],sel={},visited={},nextUrl=null,loading=false,status='',pageNo=0,scrolling=false,stopScroll=false;
visited[noH(location.href)]=1;
excluded=collect(d,location.href,true,known,items);
pageImgs(d,location.href,true,known,items);sortItems();
if(!items.length){var t=d.createElement('div');t.textContent='画像が見つかりませんでした。記事の一覧ページなら、読みたい記事を開いてから起動してください';t.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:rgba(0,0,0,.85);color:#fff;padding:12px 18px;border-radius:10px;font:14px sans-serif;z-index:2147483647;max-width:90vw';d.body.appendChild(t);setTimeout(function(){t.remove();},3500);return;}
(function(){var cs=new Set(candEls);[].forEach.call(d.images,function(im){if(cs.has(im))return;var s=im.currentSrc||im.src;if(s)chrome[s]=1;bigList(im,location.href).forEach(function(u){chrome[u]=1;});});})();
nextUrl=findNext(d,docBase(d,location.href),visited);
function regroup(){var m={},o=[];items.forEach(function(it){if(!m[it.sig]){m[it.sig]={sig:it.sig,items:[]};o.push(m[it.sig]);}m[it.sig].items.push(it);});o.sort(function(a,b){return b.items.length-a.items.length;});groups=o;}
function linkGroups(){return groups.filter(function(g){return g.sig!=='__page';});}
var LB=bodies(d);
function initSel(){sel={};var lg=linkGroups();if(!lg.length)return;var sv=cfg.sigs||[];lg.forEach(function(g){if(sv.indexOf(g.sig)>=0)sel[g.sig]=1;});if(Object.keys(sel).length)return;
if(LB.length&&items.some(function(it){return it.sig==='__page';})){lg.forEach(function(g){if(g.items.some(function(it){return !it.pg&&it.el&&inBody(it.el,LB);}))sel[g.sig]=1;});return;}
if(true){if(lg[0].items.length<3)lg.forEach(function(g){sel[g.sig]=1;});else sel[lg[0].sig]=1;}}
function hasLink(){return items.some(function(it){return it.sig!=='__page';});}
function hasPage(){return items.some(function(it){return it.sig==='__page'&&!it.bad;});}
function slides(){var src=hasLink()&&hasPage()?cfg.src:'both';return items.filter(function(it){if(it.off||it.bad||it.chk)return false;if(it.sig==='__page')return src!=='link';return src!=='page'&&!!sel[it.sig];});}
regroup();initSel();
var CSS=':host{all:initial}*{box-sizing:border-box;font-family:system-ui,-apple-system,"Hiragino Sans","Noto Sans JP",sans-serif;-webkit-tap-highlight-color:transparent}[hidden]{display:none!important}'+
'.root{position:fixed;inset:0;background:#0f1214;color:#e6eaed;font-size:14px;line-height:1.5}'+
'.grid{position:absolute;inset:0;overflow-y:auto;overscroll-behavior:contain;padding:0 12px calc(28px + env(safe-area-inset-bottom,0px))}'+
'.top{position:sticky;top:0;z-index:2;background:#0f1214;display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:calc(10px + env(safe-area-inset-top,0px)) 0 10px;border-bottom:1px solid #263039}'+
'.cnt{font-size:20px;font-weight:700;font-variant-numeric:tabular-nums}.sp{flex:1}.sub{flex:1 1 100%;color:#8f9ba5;font-size:12px}'+
'.btn{appearance:none;border:0;border-radius:10px;padding:10px 14px;font-size:15px;font-weight:700;background:#26313a;color:#e6eaed;cursor:pointer;line-height:1.2}.btn.pri{background:#3cc1cb;color:#06161a}.btn:focus-visible{outline:2px solid #3cc1cb;outline-offset:2px}'+
'.row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px 0}.lab{color:#8f9ba5;font-size:12px;margin-right:2px}'+
'.chip{appearance:none;border:1px solid #33404a;background:transparent;color:#e6eaed;border-radius:999px;padding:6px 12px;font-size:13px;font-variant-numeric:tabular-nums}.chip.on{background:#3cc1cb;border-color:#3cc1cb;color:#06161a;font-weight:700}'+
'.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:6px}'+
'.tile{position:relative;aspect-ratio:1;background:#1a2127;border-radius:6px;overflow:hidden;border:0;padding:0;cursor:pointer}.tile img{width:100%;height:100%;object-fit:cover;display:block}'+
'.tile .x{position:absolute;top:4px;right:4px;width:30px;height:30px;border-radius:50%;background:rgba(0,0,0,.62);color:#fff;font-size:15px;line-height:30px;text-align:center}'+
'.tile .n{position:absolute;left:4px;bottom:4px;font-size:11px;background:rgba(0,0,0,.62);color:#fff;padding:1px 7px;border-radius:9px;font-variant-numeric:tabular-nums}'+
'.empty{color:#8f9ba5;padding:24px 0}.h3{font-size:12px;letter-spacing:.08em;color:#8f9ba5;margin:24px 0 4px;font-weight:700}.note{font-size:12px;color:#8f9ba5;margin:0 0 10px}'+
'.grp{display:flex;align-items:center;gap:10px;width:100%;padding:8px;border:1px solid #263039;border-radius:10px;margin-bottom:8px;background:transparent;color:#e6eaed;text-align:left;cursor:pointer}.grp.on{border-color:#3cc1cb;background:#132026}'+
'.mini{display:flex;gap:3px;flex:1;min-width:0;overflow:hidden}.mini img{width:44px;height:44px;object-fit:cover;border-radius:4px;flex:none}.gl{font-size:12px;color:#8f9ba5;white-space:nowrap}.gk{font-size:13px;font-weight:700;white-space:nowrap}'+
'.view{position:absolute;inset:0;background:#000;touch-action:none;overflow:hidden;user-select:none;-webkit-user-select:none}'+
'.stage{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}.stage img{flex:none;max-width:none;max-height:none;transform-origin:50% 50%;transition:opacity .2s;-webkit-user-drag:none}'+
'.bar{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;gap:4px;padding:20px 6px calc(14px + env(safe-area-inset-bottom,0px));background:linear-gradient(transparent,rgba(0,0,0,.82));transition:opacity .25s}.bar.hide{opacity:0;pointer-events:none}'+
'.bar .btn{background:rgba(255,255,255,.16);color:#fff;min-width:44px;padding:11px 10px}.pos{position:absolute;top:calc(10px + env(safe-area-inset-top,0px));right:10px;font-size:13px;color:#fff;background:rgba(0,0,0,.55);padding:3px 10px;border-radius:10px;font-variant-numeric:tabular-nums;transition:opacity .25s;pointer-events:none}.pos.hide{opacity:0}'+
'.msg{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);color:#c9d1d7;background:rgba(0,0,0,.5);padding:8px 14px;border-radius:8px;pointer-events:none}'+
'.badge{position:absolute;top:calc(44px + env(safe-area-inset-top,0px));left:10px;right:10px;width:max-content;max-width:calc(100% - 20px);font-size:12px;background:rgba(0,0,0,.65);padding:4px 10px;border-radius:8px;color:#ffd27a;pointer-events:none}'+
'.prog{position:absolute;top:0;left:0;height:3px;background:#3cc1cb;width:0}';
function h(tag,pr,kids){var e=d.createElement(tag);if(pr)for(var k in pr){if(k==='text')e.textContent=pr[k];else if(k.slice(0,2)==='on')e.addEventListener(k.slice(2),pr[k]);else e.setAttribute(k,pr[k]);}(kids||[]).forEach(function(c){if(c)e.appendChild(c);});return e;}
var hostEl=d.createElement('div');hostEl.id=HID;hostEl.style.cssText='all:initial;position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483647;display:block';
var root=hostEl.attachShadow?hostEl.attachShadow({mode:'open'}):hostEl;
root.appendChild(h('style',{text:CSS}));
var R=h('div',{class:'root'}),gridEl=h('div',{class:'grid'}),viewEl=h('div',{class:'view'});viewEl.hidden=true;
R.appendChild(gridEl);R.appendChild(viewEl);root.appendChild(R);
var mode='grid';
var subEl=null;
function subText(){var pend=items.filter(function(it){return it.chk&&!it.bad;}).length;return '広告など '+excluded+' 件を除外'+(pend?' ・ ページ内の画像を確認中（'+pend+'）':'')+(status?' ・ '+status:'');}
function renderGrid(){var st=gridEl.scrollTop,S=slides();gridEl.textContent='';
var sub=subText();
gridEl.appendChild(h('div',{class:'top'},[h('span',{class:'cnt',text:S.length+'枚'}),h('span',{class:'sp'}),S.length?h('button',{class:'btn pri',text:'▶ 再生',onclick:function(){play(0);}}):null,h('button',{class:'btn','aria-label':'閉じる',text:'✕',onclick:function(){close();}}),(subEl=h('span',{class:'sub',text:sub}))]));
var nl=items.filter(function(it){return it.sig!=='__page'&&sel[it.sig]&&!it.off;}).length,np=items.filter(function(it){return it.sig==='__page'&&!it.bad&&!it.chk&&!it.off;}).length;if(nl&&np){var srow=h('div',{class:'row'},[h('span',{class:'lab',text:'集める'})]);[['both','両方',nl+np],['link','サムネイルの先',nl],['page','ページ内の画像',np]].forEach(function(o){srow.appendChild(h('button',{class:'chip'+(cfg.src===o[0]?' on':''),text:o[1]+' '+o[2],onclick:function(){cfg.src=o[0];save();renderGrid();}}));});gridEl.appendChild(srow);}
var row=h('div',{class:'row',style:hasLink()&&hasPage()?'padding-top:0':''},[h('span',{class:'lab',text:'切り替え'})]);
[3,5,8,15].forEach(function(s){row.appendChild(h('button',{class:'chip'+(cfg.sec===s?' on':''),text:s+'秒',onclick:function(){cfg.sec=s;save();renderGrid();}}));});
var se=d.scrollingElement||d.documentElement;if(scrolling){row.appendChild(h('span',{class:'sp'}));row.appendChild(h('button',{class:'chip',text:'■ 読み込みを止める',onclick:function(){stopScroll=true;}}));}
else if(se.scrollHeight>innerHeight*1.5){row.appendChild(h('span',{class:'sp'}));row.appendChild(h('button',{class:'chip',text:'↓ 下まで読み込む',onclick:function(){autoLoad();}}));}
if(nextUrl&&!loading){row.appendChild(h('span',{class:'sp'}));row.appendChild(h('button',{class:'chip',text:nextArt?'＋次の記事':'＋次のページ',onclick:function(){more(false);}}));row.appendChild(h('button',{class:'chip',text:nextArt?'＋20記事':'＋全ページ',onclick:function(){more(true);}}));}
gridEl.appendChild(row);
var frow=h('div',{class:'row',style:'padding-top:0'},[h('span',{class:'lab',text:'表示'})]);
FITS.forEach(function(f){frow.appendChild(h('button',{class:'chip'+(cfg.fit===f[0]?' on':''),text:f[2],onclick:function(){cfg.fit=f[0];save();renderGrid();}}));});
gridEl.appendChild(frow);
if(!S.length)gridEl.appendChild(h('div',{class:'empty',text:'表示する画像がありません。下の「画像のまとまり」から選んでください。'}));
var tl=h('div',{class:'tiles'});
S.forEach(function(it,i){var x=h('span',{class:'x',role:'button','aria-label':'この画像を外す',text:'✕',onclick:function(e){e.stopPropagation();it.off=true;renderGrid();}});
tl.appendChild(h('button',{class:'tile','data-i':i,onclick:function(){play(i);}},[h('img',{src:it.thumb,loading:'lazy',alt:''}),h('span',{class:'n',text:String(i+1)}),x]));});
gridEl.appendChild(tl);
var offN=items.filter(function(it){return it.off;}).length;
if(offN)gridEl.appendChild(h('div',{class:'row'},[h('button',{class:'chip',text:'外した '+offN+' 枚を戻す',onclick:function(){items.forEach(function(it){it.off=false;});renderGrid();}})]));
var LG=linkGroups();if(LG.length>1&&!(hasPage()&&cfg.src==='page')){gridEl.appendChild(h('div',{class:'h3',text:'サムネイルのまとまり'}));gridEl.appendChild(h('p',{class:'note',text:'選んだまとまりの画像がスライドになります。このサイトでは次回も同じ選び方を使います。'}));
LG.forEach(function(g){var on=!!sel[g.sig],mini=h('div',{class:'mini'});g.items.slice(0,6).forEach(function(it){mini.appendChild(h('img',{src:it.thumb,loading:'lazy',alt:''}));});
gridEl.appendChild(h('button',{class:'grp'+(on?' on':''),onclick:function(){if(on)delete sel[g.sig];else sel[g.sig]=1;cfg.sigs=Object.keys(sel);save();renderGrid();}},[mini,h('span',{},[h('div',{class:'gk',text:(on?'✓ 使う':'使わない')}),h('div',{class:'gl',text:g.items.length+'枚'})])]));});}
gridEl.scrollTop=st;}
function rescan(){var add=[];excluded+=collect(d,location.href,true,known,add);pageImgs(d,location.href,true,known,add);add.forEach(function(it){it.pg=0;});items=items.concat(add);sortItems();regroup();if(!Object.keys(sel).length)initSel();verifyAll();return add.length;}
function autoLoad(){if(scrolling)return;scrolling=true;stopScroll=false;var se=d.scrollingElement||d.documentElement,y0=se.scrollTop,lastH=-1,same=0,steps=0,got=0,t0=Date.now();
function fin(){got+=rescan();se.scrollTop=y0;scrolling=false;status=(stopScroll?'読み込みを止めました・':'下まで読み込みました・')+got+'枚を追加';renderGrid();}
function step(){if(stopScroll||Date.now()-t0>90000){fin();return;}steps++;var H=se.scrollHeight;se.scrollTop=Math.min(H,se.scrollTop+innerHeight*0.9);
status='下まで読み込み中…（'+Math.min(99,Math.round((se.scrollTop+innerHeight)/se.scrollHeight*100))+'%）';if(steps%6===0){got+=rescan();if(mode==='grid')renderGrid();}else if(subEl)subEl.textContent=subText();
if(se.scrollTop+innerHeight>=se.scrollHeight-4){if(se.scrollHeight===lastH)same++;else{same=0;lastH=se.scrollHeight;}if(same>=3){fin();return;}setTimeout(step,700);}else setTimeout(step,200);}
step();}
function more(all){if(!nextUrl||loading)return;loading=true;var n=0,added=0;
function step(){var u=nextUrl;visited[noH(u)]=1;status='読み込み中…（'+(n+1)+(nextArt?'記事目）':'ページ目）');renderGrid();
return fetchDoc(u).then(function(doc){var add=[];excluded+=collect(doc,u,false,known,add);pageImgs(doc,u,false,known,add);var pn=++pageNo;add.forEach(function(it){it.pg=pn;});added+=add.length;items=items.concat(add);sortItems();nextUrl=findNext(doc,docBase(doc,u),visited);n++;regroup();verifyAll();if(all&&nextUrl&&n<20)return step();},function(){status='次のページを読み込めませんでした';nextUrl=null;});}
step().then(function(){loading=false;if(status.indexOf('読み込み中')===0)status=n+(nextArt?'記事':'ページ')+'分・'+added+'枚を追加';renderGrid();refreshSL();});}
var stage=h('div',{class:'stage'}),vimg=h('img',{alt:''}),msg=h('div',{class:'msg'}),badge=h('div',{class:'badge'}),prog=h('div',{class:'prog'});
stage.appendChild(vimg);badge.hidden=true;msg.hidden=true;
function bt(label,fn,al){return h('button',{class:'btn',text:label,'aria-label':al||label,onclick:function(e){e.stopPropagation();fn();poke();}});}
var bPlay=bt('',function(){playing=!playing;if(playing)sched();else stopT();updPlay();},'再生と停止'),pos=h('span',{class:'pos'});
var bFit=bt('',function(){var i=0;FITS.forEach(function(f,j){if(f[0]===cfg.fit)i=j;});cfg.fit=FITS[(i+1)%FITS.length][0];save();updFit();layout(true);},'画像の合わせ方を切り替え');
function updFit(){FITS.forEach(function(f){if(f[0]===cfg.fit)bFit.textContent=f[1];});}
var bar=h('div',{class:'bar'},[bt('一覧',showGrid),bt('‹',function(){go(-1);},'前へ'),bPlay,bt('›',function(){go(1);},'次へ'),bFit,bt('↗',openSrc,'元のページを開く'),bt('✕',close,'閉じる')]);
[stage,msg,badge,prog,pos,bar].forEach(function(e){viewEl.appendChild(e);});
var SL=[],cur=0,playing=false,timer=null,hideT=null,wl=null,tok=0;
function wake(on){try{if(on&&!wl&&navigator.wakeLock)navigator.wakeLock.request('screen').then(function(l){wl=l;},function(){});if(!on&&wl){wl.release();wl=null;}}catch(e){}}
function fs(){if(W.SSApp)return;try{if(!d.fullscreenElement&&hostEl.requestFullscreen){var p=hostEl.requestFullscreen();if(p&&p.catch)p.catch(function(){});}}catch(e){}}
function play(i){SL=slides();if(!SL.length)return;cur=i;mode='view';gridEl.hidden=true;viewEl.hidden=false;playing=true;updFit();fs();show();poke();}
function showGrid(){mode='grid';stopT();playing=false;wake(false);viewEl.hidden=true;gridEl.hidden=false;renderGrid();var t=gridEl.querySelector('[data-i="'+cur+'"]');if(t&&t.scrollIntoView)t.scrollIntoView({block:'center'});}
function setImg(u,op,my,cb){var ni=d.createElement('img');ni.alt='';ni.draggable=false;ni.style.opacity=op;ni.onload=function(){if(my!==tok)return;stage.replaceChild(ni,vimg);vimg=ni;layout(true);if(cb)cb(true);};ni.onerror=function(){if(my!==tok)return;if(cb)cb(false);};ni.src=u;}
function layout(rp){var nw=vimg.naturalWidth,nh=vimg.naturalHeight,Wd=stage.clientWidth,Ht=stage.clientHeight;if(!nw||!nh||!Wd||!Ht)return;var k=cfg.fit==='w'?Wd/nw:cfg.fit==='h'?Ht/nh:Math.min(Wd/nw,Ht/nh);vimg.style.width=nw*k+'px';vimg.style.height=nh*k+'px';if(rp){Z.s=1;Z.x=cfg.fit==='h'?0:1e6;Z.y=1e6;}clampZ();applyZ();}
function show(){var it=SL[cur],my=++tok;Z.s=1;Z.x=0;Z.y=0;stopT();pos.textContent=(cur+1)+' / '+SL.length;badge.hidden=true;
if(it.r){setImg(it.r.url,'1',my,function(ok){if(my!==tok)return;done(it.r,ok);});}
else{msg.textContent='読み込み中…';msg.hidden=false;setImg(it.thumb,'0.45',my);resolve(it).then(function(r){if(my!==tok)return;setImg(r.url,'1',my,function(ok){if(my!==tok)return;done(r,ok);});});}
for(var k=1;k<=2;k++){var nx=SL[(cur+k)%SL.length];if(nx)resolve(nx);}if(cur>=SL.length-3&&nextUrl&&!loading)more(false);
updPlay();
function done(r,ok){msg.hidden=ok;if(!ok)msg.textContent='画像を読み込めませんでした';badge.hidden=!r.low;if(r.low)badge.textContent='大きい画像が見つからず、サムネイルを表示しています';sched();}}
function sched(){stopT();if(!playing)return;prog.style.transition='none';prog.style.width='0';void prog.offsetWidth;prog.style.transition='width '+cfg.sec+'s linear';prog.style.width='100%';timer=setTimeout(function(){go(1);},cfg.sec*1000);}
function stopT(){clearTimeout(timer);timer=null;prog.style.transition='none';prog.style.width='0';}
var wantNext=false,endShown=false;
function pendingV(){return items.some(function(it){return it.chk&&!it.bad;});}
function refreshSL(){if(mode!=='view')return;var c=SL[cur];SL=slides();var k=SL.indexOf(c);if(k>=0)cur=k;pos.textContent=(cur+1)+' / '+SL.length;if(!wantNext)return;if(cur<SL.length-1){wantNext=false;msg.hidden=true;go(1);}else if(!loading&&!nextUrl&&!pendingV()){wantNext=false;msg.textContent='最後まで読みました';msg.hidden=false;}else if(!loading&&nextUrl&&!pendingV())more(false);}
function go(dl){if(!SL.length)return;if(dl>0&&cur>=SL.length-1&&(nextUrl||loading||pendingV())){wantNext=true;stopT();msg.textContent=nextArt?'次の記事を読み込み中…':'次のページを読み込み中…';msg.hidden=false;if(!loading&&nextUrl)more(false);return;}wantNext=false;if(dl>0&&cur>=SL.length-1&&pageNo>0&&!endShown){endShown=true;stopT();msg.textContent='最後まで読みました（もう一度で最初へ）';msg.hidden=false;return;}endShown=false;cur=(cur+dl+SL.length)%SL.length;show();}
function updPlay(){bPlay.textContent=playing?'停止':'再生';wake(playing&&mode==='view');}
function hideBar(){bar.classList.add('hide');pos.classList.add('hide');}
function poke(){bar.classList.remove('hide');pos.classList.remove('hide');clearTimeout(hideT);hideT=setTimeout(hideBar,3000);}
function toggleBar(){if(bar.classList.contains('hide'))poke();else{clearTimeout(hideT);hideBar();}}
function openSrc(){var it=SL[cur];var u=it&&(it.href||(it.r&&it.r.url));if(u)W.open(u,'_blank');}
var Z={s:1,x:0,y:0},P={},G=null,lastTap=0,ltx=0,lty=0,tapT=null;
function applyZ(){vimg.style.transform='translate('+Z.x+'px,'+Z.y+'px) scale('+Z.s+')';}
function clampZ(){var w=vimg.clientWidth*Z.s,hh=vimg.clientHeight*Z.s,mx=Math.max(0,(w-stage.clientWidth)/2),my=Math.max(0,(hh-stage.clientHeight)/2);Z.x=Math.max(-mx,Math.min(mx,Z.x));Z.y=Math.max(-my,Math.min(my,Z.y));}
function ctr(){var r=stage.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};}
function ids(){return Object.keys(P);}
stage.addEventListener('pointerdown',function(e){try{stage.setPointerCapture(e.pointerId);}catch(x){}P[e.pointerId]={x:e.clientX,y:e.clientY};var I=ids();
if(I.length===1)G={t:1,sx:e.clientX,sy:e.clientY,ox:Z.x,oy:Z.y,mv:false};
else if(I.length===2){var a=P[I[0]],b=P[I[1]];G={t:2,d:Math.hypot(a.x-b.x,a.y-b.y)||1,s0:Z.s,mx:(a.x+b.x)/2,my:(a.y+b.y)/2,ox:Z.x,oy:Z.y};}});
stage.addEventListener('pointermove',function(e){if(!P[e.pointerId])return;P[e.pointerId]={x:e.clientX,y:e.clientY};if(!G)return;var I=ids(),c;
if(G.t===2&&I.length>=2){var a=P[I[0]],b=P[I[1]];c=ctr();var ns=Math.max(1,Math.min(6,G.s0*Math.hypot(a.x-b.x,a.y-b.y)/G.d)),mx=(a.x+b.x)/2,my=(a.y+b.y)/2;Z.x=(mx-c.x)-(ns/G.s0)*(G.mx-c.x-G.ox);Z.y=(my-c.y)-(ns/G.s0)*(G.my-c.y-G.oy);Z.s=ns;clampZ();applyZ();}
else if(G.t===1){var dx=e.clientX-G.sx,dy=e.clientY-G.sy;if(Math.abs(dx)>10||Math.abs(dy)>10)G.mv=true;if(!G.mv)return;var tx=G.ox+dx,ty=G.oy+dy;Z.x=tx;Z.y=ty;clampZ();G.rx=tx-Z.x;G.ry=ty-Z.y;vimg.style.transform='translate('+(Z.x+G.rx*0.35)+'px,'+(Z.y+G.ry*0.35)+'px) scale('+Z.s+')';}});
function up(e){if(!P[e.pointerId])return;delete P[e.pointerId];var I=ids();
if(G&&G.t===2){if(I.length===1){var p=P[I[0]];G={t:1,sx:p.x,sy:p.y,ox:Z.x,oy:Z.y,mv:true};}else if(!I.length){G=null;if(Z.s<1.05){Z.s=1;clampZ();}applyZ();}return;}
if(!G)return;var g=G;G=null;var dx=e.clientX-g.sx,dy=e.clientY-g.sy;
if(e.type==='pointercancel'){applyZ();return;}
if(g.mv){applyZ();var rx=g.rx||0,ry=g.ry||0;if(Math.abs(rx)>60&&Math.abs(rx)>Math.abs(ry))go(rx<0?1:-1);else if(Z.s===1&&ry>90&&ry>Math.abs(rx))showGrid();return;}
var now=Date.now(),fx=e.clientX/(stage.clientWidth||1);
if(now-lastTap<300&&Math.abs(e.clientX-ltx)<40&&Math.abs(e.clientY-lty)<40){clearTimeout(tapT);lastTap=0;if(Z.s>1){layout(true);}else{var c=ctr(),s0=Z.s,ns=2.5;Z.x=(e.clientX-c.x)-(ns/s0)*(e.clientX-c.x-Z.x);Z.y=(e.clientY-c.y)-(ns/s0)*(e.clientY-c.y-Z.y);Z.s=ns;clampZ();applyZ();}return;}
if(Z.s===1&&fx<0.3){lastTap=0;go(-1);return;}
if(Z.s===1&&fx>0.7){lastTap=0;go(1);return;}
lastTap=now;ltx=e.clientX;lty=e.clientY;clearTimeout(tapT);tapT=setTimeout(toggleBar,300);}
stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);
function onKey(e){var k=e.key,hit=true;if(mode==='view'){if(k==='ArrowRight')go(1);else if(k==='ArrowLeft')go(-1);else if(k===' '){playing=!playing;if(playing)sched();else stopT();updPlay();}else if(k==='Escape')showGrid();else hit=false;}else{if(k==='Escape')close();else hit=false;}if(hit){e.preventDefault();e.stopPropagation();}}
d.addEventListener('keydown',onKey,true);
function onRs(){if(mode==='view')layout(true);}
W.addEventListener('resize',onRs);
var pushed=false;try{history.pushState({__ss2:1},'');pushed=true;}catch(e){}
function onPop(){if(mode==='view'){showGrid();try{history.pushState({__ss2:1},'');}catch(e){}}else{pushed=false;close();}}
W.addEventListener('popstate',onPop);
var prevOv=d.documentElement.style.overflow;d.documentElement.style.overflow='hidden';
function close(){stopT();wake(false);clearTimeout(hideT);W.removeEventListener('popstate',onPop);W.removeEventListener('resize',onRs);d.removeEventListener('keydown',onKey,true);try{if(d.fullscreenElement){var p=d.exitFullscreen();if(p&&p.catch)p.catch(function(){});}}catch(e){}d.documentElement.style.overflow=prevOv;hostEl.remove();try{if(W.SSApp)W.SSApp.immersive(false);}catch(e){}if(pushed){pushed=false;try{history.back();}catch(e){}}}
hostEl.__close=close;
d.body.appendChild(hostEl);
try{if(W.SSApp)W.SSApp.immersive(true);}catch(e){}
renderGrid();verifyAll();
}
SS2();
