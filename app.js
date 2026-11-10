/* Xerxes — مدیریت و برنامه‌ریزی (نسخهٔ ۶) */
(function(){
'use strict';

/* ================= utils ================= */
const $=s=>document.querySelector(s);
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function uid(){const r=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():(Date.now().toString(36)+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2));return r.replace(/-/g,'').slice(0,16);}
function lsGet(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function clone(o){return JSON.parse(JSON.stringify(o));}
function val(id){const e=document.getElementById(id);return e?e.value:'';}
function checked(id){const e=document.getElementById(id);return !!(e&&e.checked);}

/* dates */
function key(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function parse(k){const a=String(k).split('-').map(Number);return new Date(a[0],a[1]-1,a[2]);}
function addDays(k,n){const d=parse(k);d.setDate(d.getDate()+n);return key(d);}
function today(){return key(new Date());}
function weekStart(k){const d=parse(k);d.setDate(d.getDate()-((d.getDay()+1)%7));return key(d);} // شنبه
function diff(a,b){return Math.round((parse(b)-parse(a))/864e5);}
let fDM,fWD,fWDs,fFull,fMY,jpf;
try{
  fDM=new Intl.DateTimeFormat('fa-IR-u-ca-persian',{day:'numeric',month:'long'});
  fWD=new Intl.DateTimeFormat('fa-IR-u-ca-persian',{weekday:'long'});
  fWDs=new Intl.DateTimeFormat('fa-IR-u-ca-persian',{weekday:'short'});
  fFull=new Intl.DateTimeFormat('fa-IR-u-ca-persian',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  fMY=new Intl.DateTimeFormat('fa-IR-u-ca-persian',{month:'long',year:'numeric'});
  jpf=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{year:'numeric',month:'numeric',day:'numeric'});
}catch(e){const f={format:d=>key(d),formatToParts:()=>[]};fDM=fWD=fWDs=fFull=fMY=jpf=f;}
const WD1=['ش','ی','د','س','چ','پ','ج']; // از شنبه
function jd(k){return k?fDM.format(parse(k)):'';}
function fullDate(k){return wd(k)+' '+jd(k)+' '+toFaDigits(jp(k).y);}
function wd(k){return fWD.format(parse(k));}
function wdi(k){return (parse(k).getDay()+1)%7;} // 0=شنبه
const jc={};
function jp(k){if(jc[k])return jc[k];const p={};jpf.formatToParts(parse(k)).forEach(x=>{if(x.type==='year'||x.type==='month'||x.type==='day')p[x.type]=parseInt(x.value,10);});return jc[k]={y:p.year,m:p.month,d:p.day};}
function jnum(k){const p=jp(k);return p.y*10000+p.m*100+p.d;}
function jMonthFirst(y,m){
  const t=today(),tp=jp(t);let k=addDays(t,Math.round(((y-tp.y)*12+(m-tp.m))*30.44)-(tp.d-1));const target=y*10000+m*100+1;
  for(let i=0;i<40&&jnum(k)>target;i++)k=addDays(k,-1);
  for(let i=0;i<40&&jnum(k)<target;i++)k=addDays(k,1);
  return k;
}
function jMonth(offset){
  const tp=jp(today());let m=tp.m+offset,y=tp.y;while(m>12){m-=12;y++;}while(m<1){m+=12;y--;}
  const first=jMonthFirst(y,m);let n=28;while(jp(addDays(first,n)).m===m)n++;
  return {y,m,first,days:n,last:addDays(first,n-1)};
}
function fa(n){return Number(n).toLocaleString('fa-IR');}
function toEn(s){return String(s).replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c));}
function rel(k){const n=diff(today(),k);if(n===0)return 'امروز';if(n===1)return 'فردا';if(n===-1)return 'دیروز';if(n<0)return fa(-n)+' روز پیش';if(n<7)return wd(k);return jd(k);}
function mins(m){if(!m)return '—';if(m<60)return fa(m)+' دقیقه';const h=Math.floor(m/60),r=m%60;return fa(h)+' ساعت'+(r?' و '+fa(r)+' دقیقه':'');}
function hm(m){m=Math.round(m||0);if(m<60)return fa(m)+' د';return fa(Math.round(m/6)/10)+' س';}
function faTime(t){return t?toFaDigits(t):'';}
function toFaDigits(s){return String(s).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);}

/* ================= icons ================= */
const P={
  home:'<path d="M3.5 10.5 12 4l8.5 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-4.5V15h-5v5.5H5A1.5 1.5 0 0 1 3.5 19z"/>',
  today:'<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.2 2.4 2.3 4.6-4.8"/>',
  cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
  proj:'<path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h4l2 2h7a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
  inbox:'<path d="M3.5 13.5 6 5.5h12l2.5 8V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><path d="M3.5 13.5h5l1 2.5h5l1-2.5h5"/>',
  review:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  layers:'<path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8z"/><path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  menu:'<circle cx="12" cy="5.5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="18.5" r="1.4"/>',
  check:'<path d="m5 12.5 4.2 4L19 7"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  edit:'<path d="M14.5 5.5 18.5 9.5 9 19H5v-4z"/>',
  sun:'<circle cx="12" cy="12" r="3.8"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>',
  next:'<path d="m14.5 6-6 6 6 6"/>',
  prev:'<path d="m9.5 6 6 6-6 6"/>',
  up:'<path d="m6 14.5 6-6 6 6"/>',
  down:'<path d="m6 9.5 6 6 6-6"/>',
  split:'<path d="M4 6h16M4 12h10M4 18h6"/>',
  alert:'<path d="M12 3.5 21.5 20h-19z"/><path d="M12 10v4.5M12 17.2v.3"/>',
  stack:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h6v6H9z"/>',
  pause:'<circle cx="12" cy="12" r="8.5"/><path d="M10 9v6M14 9v6"/>',
  users:'<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5a6 6 0 0 1 12 0"/><path d="M15.5 5.6a3.2 3.2 0 0 1 0 5.8M17.5 14.2a6 6 0 0 1 3.5 5.3"/>',
  cake:'<path d="M4 20.5h16M5 20.5v-7a1.5 1.5 0 0 1 1.5-1.5h11a1.5 1.5 0 0 1 1.5 1.5v7"/><path d="M5 15.5c1.5 1.2 3 1.2 4.5 0s3-1.2 4.5 0 3 1.2 5 0M12 12V8.5"/><path d="M12 3.5c1 1.2 1 2.3 0 3-1-.7-1-1.8 0-3z"/>',
  flag:'<path d="M5.5 21V4M5.5 4.5h11l-2 4 2 4h-11"/>',
  bell:'<path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  gcal:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/>',
  repeat:'<path d="M17 3.5 20 6.5 17 9.5"/><path d="M4 12v-1.5a4 4 0 0 1 4-4h12M7 20.5 4 17.5 7 14.5"/><path d="M20 12v1.5a4 4 0 0 1-4 4H4"/>',
  archive:'<rect x="3.5" y="4.5" width="17" height="4" rx="1"/><path d="M5 8.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5M10 12.5h4"/>',
  restore:'<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5"/>',
  trash:'<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
  sync:'<path d="M20 11a8 8 0 0 0-14.5-4.5M4 13a8 8 0 0 0 14.5 4.5"/><path d="M5 3.5v3.5h3.5M19 20.5V17h-3.5"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.3"/>',
  grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  user:'<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  back:'<path d="m9.5 6 6 6-6 6"/>',
  board:'<rect x="3.5" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="16.5" y="4" width="4" height="7" rx="1.5"/>',
  tree:'<rect x="14" y="3.5" width="7" height="5" rx="1.5"/><rect x="3" y="9.5" width="7" height="5" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/><path d="M14 6h-2.5v12H10M11.5 12H10"/>',
  list:'<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
  open:'<path d="M14 4.5h5.5V10M19.5 4.5 11 13M10 5H6.5A2 2 0 0 0 4.5 7v10.5a2 2 0 0 0 2 2H17a2 2 0 0 0 2-2V14"/>',
  grip:'<circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/>',
  key:'<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6.5 10h.01M10 10h.01M14 10h.01M17.5 10h.01M7.5 14h9"/>',
  play:'<path d="M8 5.5v13l10-6.5z"/>'
};
function ic(n,extra){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra||''} aria-hidden="true">${P[n]||''}</svg>`;}


/* ================= v6: ثابت‌ها و وضعیت ================= */
Object.assign(P,{
  note:'<path d="M6.5 3.5h8l4 4v12.5a.5.5 0 0 1-.5.5h-11.5a.5.5 0 0 1-.5-.5v-16a.5.5 0 0 1 .5-.5z"/><path d="M9 12h6M9 16h4"/>',
  chat:'<path d="M4.5 5h15v10.5h-8.5l-4 3.5v-3.5h-2.5z"/>',
  enter:'<path d="M19 6v6a2 2 0 0 1-2 2H6"/><path d="m9.5 10.5-3.5 3.5 3.5 3.5"/>',
  snooze:'<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.5 2M5 4 3 6M19 4l2 2"/>'
});
const HEALTH={g:'روی روال',y:'نیازمند توجه',r:'در خطر'};
const DEFAULT_DOMAINS=[{id:'rnd',name:'R&D هلدینگ',color:'c4',budget:20,order:10,kind:'team'},{id:'design',name:'طراحی فریلنس',color:'c5',budget:10,order:20,kind:'personal'},{id:'phd',name:'پژوهش دکتری',color:'c7',budget:15,order:30,kind:'personal'}];
const NAV=[['today','امروز','today'],['projects','پروژه‌ها','proj'],['people','افراد','users']];
const S={tasks:{},projects:{},reviews:{},domains:{},events:{},people:{},updates:{},settings:{staleDays:7,appUrl:''},loaded:false,bver:0,
  view:'today',pid:'',uid:'',open:new Set(),drafts:{},ar:{},ah:{},fresh:{},kind:'task',cap:{},sug:null,rv:null,showArch:false,newDom:''};
const CONNKEY='gam-conn-v1',PKEY='gam-pending-v1',CKEY='x-cache-v3',LKEY='x-local';
let CONN=lsGet(CONNKEY),pending=lsGet(PKEY)||[],rev=0,syncing=false,pulling=false,online=true,lastSync=null,badToken=false;
const LP=Object.assign({talkDays:14},lsGet(LKEY)||{});

/* ================= حوزه‌ها و افراد ================= */
function doms(all){return Object.values(S.domains).filter(d=>all||!d.archived).sort((a,b)=>(a.order||0)-(b.order||0));}
function col(id){const d=S.domains[id];return d&&d.color?`var(--${d.color})`:'var(--faint)';}
function live(x){const d=S.domains[x.domain];return !d||!d.archived;}
function domKind(d){return d&&d.kind?d.kind:(d&&d.id==='rnd'?'team':'personal');}
function isTeam(id){const d=S.domains[id];return !!d&&domKind(d)==='team';}
function teamDoms(){return doms().filter(d=>domKind(d)==='team');}
function persDoms(){return doms().filter(d=>domKind(d)!=='team');}
function firstTeamDom(){const a=teamDoms();if(a.length)return a[0].id;const b=doms();return b.length?b[0].id:'';}
function people(all){return Object.values(S.people).filter(p=>all||p.active!==false).sort((a,b)=>(a.order||0)-(b.order||0)||String(a.name).localeCompare(String(b.name),'fa'));}
function who(id){if(!id)return 'خودم';const p=S.people[id];return p?p.name:'نامشخص';}
function whoOptions(sel,none){const list=people();const cur=S.people[sel];if(cur&&cur.active===false)list.push(cur);
  return `<option value="" ${!sel?'selected':''}>${none||'خودم'}</option>`+list.map(p=>`<option value="${p.id}" ${p.id===sel?'selected':''}>${esc(p.name)}${p.active===false?' (غیرفعال)':''}</option>`).join('');}

/* ================= داده‌های مشتق ================= */
function norm(s){return ' '+String(s||'').replace(/‌/g,' ').replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/\s+/g,' ').trim()+' ';}
function day(iso){if(!iso)return '';const d=new Date(iso);return isNaN(d)?'':key(d);}
const isNote=t=>t.status==='note'||t.status==='talk';
const isOpen=t=>!isNote(t)&&t.status!=='done';
const T=()=>Object.values(S.tasks).filter(live);
const PR=()=>Object.values(S.projects).filter(live);
const st=p=>p.status||'active';
const TP=()=>PR().filter(p=>isTeam(p.domain)&&st(p)==='active');
function byOrder(a,b){return (a.order||0)-(b.order||0)||String(a.createdAt||'').localeCompare(String(b.createdAt||''));}
function po(p){return p.porder===null||p.porder===undefined||p.porder===''||isNaN(Number(p.porder))?1e12:Number(p.porder);}
function byPorder(a,b){return po(a)-po(b)||String(a.createdAt||'').localeCompare(String(b.createdAt||''));}
function pItems(pid){return T().filter(t=>t.projectId===pid&&!isNote(t)).sort(byOrder);}
function pOpen(pid){return pItems(pid).filter(isOpen);}
function kids(pid){return PR().filter(x=>x.parent===pid&&st(x)==='active').sort(byPorder);}
function uOpen(id){return T().filter(t=>isOpen(t)&&t.assignee===id).sort(byOrder);}
function lastTalk(id){let m='';T().forEach(t=>{if(t.status==='talk'&&t.assignee===id){const d=day(t.createdAt);if(d>m)m=d;}});return m;}
function pStart(p){return p.start||day(p.createdAt)||today();}
function hasProg(p){return p.progress!==null&&p.progress!==undefined&&p.progress!==''&&!isNaN(Number(p.progress));}
function prog(p){return hasProg(p)?Math.max(0,Math.min(100,Number(p.progress))):null;}
function pprog(p){const a=prog(p);if(a!==null||isTeam(p.domain))return a;const it=pItems(p.id);return it.length?Math.round(it.filter(t=>!isOpen(t)).length/it.length*100):null;}
function expected(p){
  if(!p.deadline)return null;const s0=pStart(p),tot=diff(s0,p.deadline);
  if(tot<=0)return today()>=p.deadline?100:0;
  return Math.max(0,Math.min(100,Math.round(diff(s0,today())/tot*100)));
}
function assessAge(p){return p.progressAt?diff(p.progressAt,today()):null;}
function pUpdates(pid){return Object.values(S.updates).filter(u=>u.projectId===pid).sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.createdAt||'').localeCompare(String(b.createdAt||'')));}
function findProj(w){
  const q=norm(String(w).replace(/_/g,' ')).trim();if(!q)return null;
  const ps=PR().filter(p=>st(p)!=='done').filter(p=>norm(p.title).includes(q));
  return ps.length?ps.sort((a,b)=>(norm(a.title).includes(' '+q)?0:1)-(norm(b.title).includes(' '+q)?0:1)||a.title.length-b.title.length)[0]:null;
}
function findPerson(w){
  const q=norm(String(w).replace(/_/g,' ')).trim();if(!q)return null;
  const ps=people(true).filter(p=>norm(p.name).includes(' '+q));
  return ps.length?ps.sort((a,b)=>(a.active===false)-(b.active===false)||a.name.length-b.name.length)[0]:null;
}
/** نشانه‌های کادر ثبت: #پروژه @نفر !امروز !فردا !هفته */
function parseCap(raw){
  const o={};let s=' '+String(raw||'')+' ';
  s=s.replace(/(\s)!(امروز|فردا|هفته)(?=\s)/g,(m,a,w)=>{o.when=w;return a;});
  s=s.replace(/(\s)#([^\s#@!]+)/g,(m,a,w)=>{const p=findProj(w);if(p){o.project=p;return a;}o.bad='#'+w;return m;});
  s=s.replace(/(\s)@([^\s#@!]+)/g,(m,a,w)=>{const x=findPerson(w);if(x){o.person=x;return a;}o.bad='@'+w;return m;});
  o.title=s.replace(/\s+/g,' ').trim();
  return o;
}

/* ================= همگام‌سازی ================= */
function hasConn(){return !!(CONN&&CONN.u&&CONN.t);}
function body(o){return JSON.parse(JSON.stringify(o));}
async function api(action,extra){
  const b=JSON.stringify(Object.assign({action,token:CONN.t},extra||{}));
  const ctl=new AbortController();const to=setTimeout(()=>ctl.abort(),30000);
  let r;try{r=await fetch(CONN.u,{method:'POST',body:b,redirect:'follow',signal:ctl.signal});}finally{clearTimeout(to);}
  if(!r.ok)throw {code:'http_'+r.status};
  let j;try{j=await r.json();}catch(e){throw {code:'not_json'};}
  if(!j.ok){if(j.error==='bad_token'){badToken=true;render();}throw {code:j.error||'server'};}
  badToken=false;return j;
}
function applyOp(op){
  if(op.t==='put'){const o=Object.assign({},op.obj);delete o.occ;if(S[op.kind])S[op.kind][o.id]=o;}
  else if(op.t==='del'){if(S[op.kind])delete S[op.kind][op.id];}
  else if(op.t==='settings')S.settings=mergeSettings(Object.assign({},S.settings,op.obj));
}
function cacheSave(){lsSet(CKEY,{tasks:S.tasks,projects:S.projects,reviews:S.reviews,domains:S.domains,events:S.events,people:S.people,updates:S.updates,settings:S.settings,rev,bver:S.bver});}
let BATCH=0;function batch(fn){BATCH++;try{fn();}finally{BATCH--;}render();}
function enqueue(op){applyOp(op);cacheSave();if(!BATCH)render();if(!hasConn())return;pending.push(op);lsSet(PKEY,pending);flushSoon();}
function put(kind,obj){enqueue({t:'put',kind,obj:body(obj)});}
function del(kind,id){enqueue({t:'del',kind,id});}
function saveSettings(s){enqueue({t:'settings',obj:body(s)});}
let flushT=null;function flushSoon(){clearTimeout(flushT);flushT=setTimeout(flush,400);}
async function flush(){
  if(!hasConn()||syncing||!pending.length)return;syncing=true;renderSync();
  const part=pending.slice(0,40);
  try{await api('ops',{ops:part});pending=pending.slice(part.length);lsSet(PKEY,pending);online=true;lastSync=new Date();}
  catch(e){online=false;}
  syncing=false;renderSync();
  if(online&&pending.length)flush();
  else if(online)setTimeout(()=>pull(false),800);
}
async function pull(force){
  if(!hasConn()||pulling)return;pulling=true;
  try{
    const r=(await api('rev')).rev;online=true;
    if(force||r!==rev||!S.loaded){const s0=(await api('state')).state;loadState(s0);}
    lastSync=new Date();
  }catch(e){online=false;}
  pulling=false;renderSync();
  if(online&&pending.length)flush();
}
function toMap(arr){const m={};(arr||[]).forEach(o=>{if(o&&o.id)m[o.id]=o;});return m;}
function loadState(s0){
  S.tasks=toMap(s0.tasks);S.projects=toMap(s0.projects);S.reviews=toMap(s0.reviews);S.events=toMap(s0.events);
  S.people=toMap(s0.people);S.updates=toMap(s0.updates);
  S.bver=Number(s0.version)||(('people' in s0)?4:3);
  S.domains=('domains' in s0)?toMap(s0.domains):toMap(DEFAULT_DOMAINS);
  S.settings=mergeSettings(s0.settings);
  pending.forEach(applyOp);rev=s0.rev;S.loaded=true;cacheSave();
  render();
  if(S.bver>=4&&/^https:/.test(location.protocol)&&S.settings.appUrl!==appBase())saveSettings({appUrl:appBase()});
}
function appBase(){return location.origin+location.pathname;}
function mergeSettings(d){const s=Object.assign({staleDays:7,appUrl:''},d||{});s.staleDays=Number(s.staleDays)>0?Number(s.staleDays):7;if(typeof s.appUrl!=='string')s.appUrl='';return s;}
function encodeConn(c){return 'gam1.'+btoa(unescape(encodeURIComponent(JSON.stringify({u:c.u,t:c.t})))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function decodeConn(code){
  code=String(code||'').trim();const m=code.match(/gam1\.([A-Za-z0-9_-]+)/);if(!m)return null;
  try{let b=m[1].replace(/-/g,'+').replace(/_/g,'/');while(b.length%4)b+='=';const o=JSON.parse(decodeURIComponent(escape(atob(b))));
    if(o&&/^https:\/\/script\.google(usercontent)?\.com\//.test(o.u)&&typeof o.t==='string'&&o.t.length>=32)return {u:o.u,t:o.t};}catch(e){}
  return null;
}
function appLink(){return location.origin+location.pathname+'#c='+encodeConn(CONN);}
async function connect(c){
  const prev=CONN;CONN=c;
  try{await api('rev');lsSet(CONNKEY,c);badToken=false;S.loaded=false;await pull(true);toast('وصل شد');render();return true;}
  catch(e){CONN=prev;if(!prev)badToken=false;render();toast(e&&e.code==='bad_token'?'کلید دسترسی نادرست است.':'اتصال برقرار نشد؛ آدرس و اینترنت را بررسی کن.');return false;}
}

/* ================= عملیات ================= */
function newItem(o){
  return Object.assign({id:uid(),title:'',domain:firstTeamDom(),projectId:'',minutes:null,priority:2,plan:'',due:'',note:'',
    status:'todo',doneDay:'',doneAt:'',triaged:true,createdAt:new Date().toISOString(),order:Date.now(),assignee:''},o);
}
function toggle(id){
  const t=S.tasks[id];if(!t||isNote(t))return;const d=t.status!=='done';
  put('tasks',Object.assign({},t,{status:d?'done':'todo',doneDay:d?today():'',doneAt:d?new Date().toISOString():''}));
  if(d)toast('انجام شد',{label:'برگرداندن',fn:()=>toggle(id)});
}
/** ارزیابی پروژه: هر کدام از سلامت، پیشرفت یا یادداشت که داده شود ثبت می‌شود؛ بقیه از وضعیت فعلی می‌آید */
function assess(pid,o){
  const p=S.projects[pid];if(!p)return;const td=today();o=o||{};
  const health=o.health!==undefined?o.health:(p.health||'');
  const progress=o.progress!==undefined?o.progress:(hasProg(p)?Number(p.progress):null);
  const ex=Object.values(S.updates).find(u=>u.projectId===pid&&u.date===td);
  batch(()=>{
    put('updates',{id:ex?ex.id:uid(),projectId:pid,date:td,progress,health,note:o.note?o.note:(ex?ex.note||'':''),createdAt:ex?ex.createdAt:new Date().toISOString()});
    put('projects',Object.assign({},p,{progress,progressAt:td,health}));
  });
}
function logTalk(id,note){
  const td=today();
  batch(()=>{
    if(lastTalk(id)!==td)put('tasks',newItem({title:'گفت‌وگوی فردی',status:'talk',assignee:id}));
    if(note)put('tasks',newItem({title:note,status:'note',assignee:id}));
  });
}

/* ================= مسیر ================= */
function applyRoute(){
  let h='';try{h=decodeURIComponent((location.hash||'').slice(1));}catch(e){h=(location.hash||'').slice(1);}
  if(!h||/^c=/.test(h))return false;
  let m;
  if((m=h.match(/^p\/(.+)$/))){S.view='project';S.pid=m[1];return true;}
  if((m=h.match(/^u\/(.+)$/))){S.view='person';S.uid=m[1];return true;}
  const v=h.split('/')[0];S.view=['today','projects','people'].includes(v)?v:'today';return true;
}
function hashFor(){return S.view==='project'?'p/'+S.pid:S.view==='person'?'u/'+S.uid:S.view;}
function setHash(replace){const h='#'+hashFor();if(location.hash===h)return;try{if(replace)history.replaceState(null,'',h);else history.pushState(null,'',h);}catch(e){}}
function leave(){S.fresh={};S.kind='task';S.cap={};S.sug=null;closeSheet();const c=$('#cap'),i=$('#cap-q');if(c&&i&&document.activeElement!==i&&!i.value.trim()){c.classList.remove('on');$('#cap-sug').hidden=true;}}
function go(v){leave();S.view=v;setHash();render();window.scrollTo({top:0});}
function openProj(id){if(!S.projects[id])return;leave();S.view='project';S.pid=id;setHash();render();window.scrollTo({top:0});}
function openPerson(id){if(!S.people[id])return;leave();S.view='person';S.uid=id;setHash();render();window.scrollTo({top:0});}
window.addEventListener('popstate',()=>{if(applyRoute()){leave();render();window.scrollTo({top:0});}});

/* ================= پوسته ================= */
function renderNav(){
  const cur=S.view==='project'?'projects':S.view==='person'?'people':S.view;
  const h=(kb)=>NAV.map(([k,l,i],n)=>`<button type="button" data-act="go" data-v="${k}" ${cur===k?'aria-current="page"':''}>${ic(i)}<span>${l}</span>${kb?`<kbd>${n+1}</kbd>`:''}</button>`).join('');
  $('#tabs').innerHTML=h(true);$('#bnav').innerHTML=h(false);
}
function renderSync(){
  const el=$('#sync');let cls='',txt='';
  if(!hasConn()){txt='وصل نیست';}
  else if(badToken){cls='off';txt='کلید نامعتبر';}
  else if(!online){cls='off';txt=pending.length?'آفلاین · '+fa(pending.length)+' در صف':'آفلاین';}
  else if(syncing||pending.length){cls='busy';txt='ارسال…';}
  else if(lastSync){cls='ok';txt=lastSync.toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'});}
  else txt='اتصال…';
  el.className='sync '+cls;el.querySelector('.t').textContent=txt;
}
function render(){
  if(DD.on){DD.dirty=true;return;}
  renderNav();renderSync();
  const v=$('#view');
  if(!hasConn()||badToken){document.body.classList.add('noconn');v.innerHTML=vConnect();return;}
  document.body.classList.remove('noconn');
  if(!S.loaded){v.innerHTML='<div class="empty">در حال بارگذاری…</div>';return;}
  const ae=document.activeElement;const fid=ae&&ae.id&&v.contains(ae)?ae.id:'';let ss=null,se=null;if(fid){try{ss=ae.selectionStart;se=ae.selectionEnd;}catch(e){}}
  const fn={today:vToday,projects:vProjects,project:vProject,people:vPeople,person:vPerson}[S.view]||vToday;
  const warn=S.bver<5?`<div class="warnbar">${ic('alert')}<span>بک‌اند Apps Script قدیمی است (نسخهٔ ${fa(S.bver)}). ${S.bver<4?'افراد و ارزیابی‌ها ذخیره نمی‌شوند.':'ابرپروژه و ترتیب پروژه‌ها ذخیره نمی‌شود.'} Code.gs مخزن را جایگزین و نسخهٔ جدید Deploy کن.</span></div>`:'';
  v.innerHTML=warn+fn();
  if(fid){const el=document.getElementById(fid);if(el){el.focus({preventScroll:true});try{if(ss!==null)el.setSelectionRange(ss,se);}catch(e){}}}
  capUpdate();
}

/* ================= اجزای مشترک ================= */
function av(id,cls){return `<span class="av ${cls||''}" aria-hidden="true">${esc(String(who(id)).trim().charAt(0)||'؟')}</span>`;}
function hdot(h){return `<span class="hdot ${HEALTH[h]?'hd-'+h:''}" title="${HEALTH[h]||'ارزیابی نشده'}"></span>`;}
function hpill(h){return HEALTH[h]?`<span class="hp hp-${h}">${HEALTH[h]}</span>`:`<span class="hp">ارزیابی نشده</span>`;}
function bar(pg,ex){return `<span class="bar">${pg?`<i style="width:${pg}%"></i>`:''}${ex!==null&&ex!==undefined?`<b style="right:calc(${ex}% - 1px)"></b>`:''}</span>`;}
function ddl(p){if(!p.deadline)return '';const n=diff(today(),p.deadline);return n<0?`<span class="late">${fa(-n)} روز گذشته</span>`:n===0?'<span class="late">ددلاین امروز</span>':`${fa(n)} روز مانده`;}
function hbtns(pid,cur,act){return `<span class="hbtns" role="group" aria-label="سلامت پروژه">${['g','y','r'].map(k=>`<button type="button" class="hb hb-${k}" data-act="${act}" data-pid="${pid}" data-v="${k}" aria-pressed="${cur===k}">${HEALTH[k]}</button>`).join('')}</span>`;}
function ago(k){if(!k)return '';const n=diff(k,today());return n<=0?'امروز':n===1?'دیروز':fa(n)+' روز پیش';}
function irow(t,o){
  o=o||{};const td=today();const p=t.projectId&&S.projects[t.projectId];const open=isOpen(t);const m=[];
  if(p&&!o.noProj)m.push(`<button type="button" class="mchip" data-act="openproj" data-v="${p.id}">${esc(p.title)}</button>`);
  if(t.assignee&&!o.noWho)m.push(`<button type="button" class="mchip" data-act="openperson" data-v="${t.assignee}">${ic('user')}${esc(who(t.assignee))}</button>`);
  if(t.due&&open)m.push(`<span class="${t.due<td?'late':''}">${ic('flag')}${t.due<td?'موعد '+ago(t.due):t.due===td?'موعد امروز':rel(t.due)}</span>`);
  else if(o.age&&open)m.push(`<span>سپرده‌شده ${ago(day(t.createdAt))}</span>`);
  if(t.note)m.push(`<span title="${esc(t.note)}">${ic('note')}</span>`);
  const isT=(t.plan&&t.plan<=td)||(t.due&&t.due<=td);
  let act='';
  if(open&&o.sun&&!t.assignee)act=`<button class="iconbtn sm sun" type="button" data-act="sun" aria-pressed="${!!isT}" title="${isT?'برداشتن از امروز':'آوردن به امروز'}" aria-label="${isT?'برداشتن از امروز':'آوردن به امروز'}">${ic('sun')}</button>`;
  if(open&&o.snooze)act=`<button class="btn xs" type="button" data-act="snooze" title="سه روز دیگر دوباره یادآوری کن">${ic('snooze')}۳ روز بعد</button>`;
  return `<div class="it ${open?'':'done'}" ${o.noDrag||!open?'':'data-drag="item"'} data-id="${t.id}"><button class="chk" type="button" data-act="toggle" aria-label="${open?'انجام شد':'برگرداندن'}">${ic('check','stroke-width="3"')}</button><div class="it-b"><button type="button" class="it-t" data-act="edit">${esc(t.title)}</button>${m.length?`<div class="it-m">${m.join('')}</div>`:''}</div>${act}</div>`;
}
function nrow(t,o){
  o=o||{};const p=t.projectId&&S.projects[t.projectId];const m=[];
  if(p&&!o.noProj)m.push(`<button type="button" class="mchip" data-act="openproj" data-v="${p.id}">${esc(p.title)}</button>`);
  if(t.assignee&&!o.noWho)m.push(`<button type="button" class="mchip" data-act="openperson" data-v="${t.assignee}">${ic('user')}${esc(who(t.assignee))}</button>`);
  return `<div class="nt ${t.status==='talk'?'talk':''}" data-id="${t.id}"><span class="d">${jd(day(t.createdAt))}</span><div class="it-b"><button type="button" class="it-t" data-act="edit">${t.status==='talk'?ic('chat'):''}${esc(t.title)}</button>${m.length?`<div class="it-m">${m.join('')}</div>`:''}</div></div>`;
}

/* ================= امروز ================= */
function attention(){
  const td=today(),out=[],lim=S.settings.staleDays||7;
  T().filter(t=>isOpen(t)&&t.assignee&&S.people[t.assignee]).forEach(t=>{
    const age=diff(day(t.createdAt)||td,td);
    if(t.due?t.due<=td:age>=7)out.push({k:'f',t,s:t.due||day(t.createdAt)});
  });
  TP().forEach(p=>{
    const ag=assessAge(p),stale=ag===null||ag>=lim;let sev=0;
    if(p.deadline){const n=diff(td,p.deadline);if(n<0)sev=3;else if(n<=7)sev=2;}
    if(stale||sev||S.fresh[p.id])out.push({k:'p',p,stale,dl:sev>=2,sev:S.fresh[p.id]||Math.max(sev,stale?1:0)});
  });
  people().forEach(u=>{const lt=lastTalk(u.id);const n=lt?diff(lt,td):null;if(n===null||n>=LP.talkDays)out.push({k:'u',u,n});});
  return out;
}
function atProj(x){
  const p=x.p,ag=assessAge(p),r=[];
  if(x.stale)r.push(ag===null?'هنوز ارزیابی نشده':'ارزیابی '+ago(p.progressAt));
  const d=ddl(p);if(d&&x.dl)r.push(d);
  const fresh=S.fresh[p.id];const pv=S.ar[p.id]!==undefined?S.ar[p.id]:(prog(p)===null?0:prog(p));const nk='an-'+p.id;
  return `<div class="at"><div class="at-h ${x.stale||fresh?'hb2':''}">${hdot(p.health)}<div class="at-t"><button type="button" class="lnk" data-act="openproj" data-v="${p.id}">${esc(p.title)}</button><small>${esc(who(p.owner))}${r.length?' · '+r.join(' · '):''}</small></div>${x.stale||fresh?hbtns(p.id,fresh?p.health:'','hset'):''}<button class="iconbtn sm ob" type="button" data-act="openproj" data-v="${p.id}" aria-label="باز کردن ${esc(p.title)}" title="باز کردن">${ic('open')}</button></div>
    ${fresh?`<div class="at-r"><span class="ql">${ic('check')}ثبت شد</span><label for="ar-${p.id}">پیشرفت</label><input type="range" class="arange live" id="ar-${p.id}" data-pid="${p.id}" min="0" max="100" step="5" value="${pv}"><output id="ao-${p.id}">${fa(pv)}٪</output><input type="text" id="${nk}" data-draft="${nk}" data-enter="anote" data-pid="${p.id}" value="${esc(S.drafts[nk]||'')}" placeholder="یک خط یادداشت (اختیاری) و Enter" aria-label="یادداشت ارزیابی"></div>`:''}</div>`;
}
function atUser(x){
  const u=x.u,op=uOpen(u.id).length;
  return `<div class="at"><div class="at-h">${av(u.id)}<div class="at-t"><button type="button" class="lnk" data-act="openperson" data-v="${u.id}">گفت‌وگوی فردی با ${esc(u.name)}</button><small>${x.n===null?'هنوز ثبت نشده':'آخرین بار '+ago(lastTalk(u.id))}${op?' · '+fa(op)+' مورد باز':''}</small></div><button class="btn xs" type="button" data-act="talk" data-v="${u.id}">${ic('check')}انجام شد</button><button class="iconbtn sm ob" type="button" data-act="openperson" data-v="${u.id}" aria-label="باز کردن ${esc(u.name)}" title="باز کردن">${ic('open')}</button></div></div>`;
}
function vToday(){
  const td=today(),at=attention();
  const mine=T().filter(t=>isOpen(t)&&!t.assignee).sort(byOrder);
  const isT=t=>(t.plan&&t.plan<=td)||(t.due&&t.due<=td);
  const a=mine.filter(isT),b=mine.filter(t=>!isT(t));
  const doneN=T().filter(t=>!isNote(t)&&!t.assignee&&t.status==='done'&&t.doneDay===td).length;
  const rvN=TP().filter(p=>!(p.progressAt>=weekStart(td))).length;
  const f=at.filter(x=>x.k==='f').sort((x,y)=>String(x.s).localeCompare(String(y.s))),ps=at.filter(x=>x.k==='p').sort((x,y)=>y.sev-x.sev||byPorder(x.p,y.p)),us=at.filter(x=>x.k==='u');
  const first=!PR().length&&!people(true).length;
  return `<div class="ph"><div class="grow"><h1>امروز</h1><span class="sub">${fullDate(td)}</span></div>${TP().length||people().length?`<button class="btn ${wdi(td)===0&&rvN?'primary':''}" type="button" data-act="rvstart">${ic('review')}مرور هفتگی${rvN?`<span class="bdg">${fa(rvN)}</span>`:''}</button>`:''}</div>
  ${first?`<div class="card start"><h2>شروع در سه قدم</h2><ol><li>در «افراد»، اعضای تیم را اضافه کن.</li><li>در «پروژه‌ها»، هر پروژه را با مسئولش بساز.</li><li>هر روز همین صفحه را باز کن؛ هر چه به توجه تو نیاز دارد اینجا می‌آید.</li></ol><div class="row"><button class="btn primary" type="button" data-act="newperson">${ic('plus')}فرد</button><button class="btn" type="button" data-act="newproj">${ic('plus')}پروژه</button></div></div>`:''}
  <section><h2>نیازمند توجه تو <span class="n">${fa(at.length)}</span></h2>
  ${at.length?`${f.length?`<div class="sub2">پیگیری کارهای سپرده‌شده</div><div class="list">${f.map(x=>irow(x.t,{noDrag:true,snooze:true,age:true})).join('')}</div>`:''}${ps.length?`<div class="sub2">پروژه‌ها<span class="sx2">وضعیت هر کدام را با یک کلیک ثبت کن</span></div><div class="list">${ps.map(atProj).join('')}</div>`:''}${us.length?`<div class="sub2">گفت‌وگوی فردی</div><div class="list">${us.map(atUser).join('')}</div>`:''}`
    :`<div class="list"><div class="empty ok">${ic('check')}چیزی منتظر تو نیست.</div></div>`}</section>
  <section><h2>کارهای من <span class="n">${fa(a.length)} امروز · ${fa(b.length)} بعد</span></h2>
    <div class="sub2">امروز</div><div class="list" data-drop="mine:today" data-empty="کاری برای امروز نیست. با دکمهٔ خورشید، کاری را به امروز بیاور.">${a.map(t=>irow(t,{sun:true})).join('')}</div>
    <div class="sub2">بعد</div><div class="list" data-drop="mine:later" data-empty="فهرست خالی است. از کادر بالا بنویس و Enter بزن.">${b.map(t=>irow(t,{sun:true})).join('')}</div>
    ${doneN?`<p class="hint">${ic('check')}${fa(doneN)} کار امروز انجام شد.</p>`:''}</section>`;
}

/* ================= پروژه‌ها ================= */
function pnode(p,pers){
  const k=kids(p.id),op=pOpen(p.id),x=S.open.has('px-'+p.id),td=today();
  const pg=pprog(p),ex=pers?null:expected(p),late=op.filter(t=>t.due&&t.due<td).length;
  const sub=[pers?'':esc(who(p.owner)),op.length?fa(op.length)+' باز':'',late?`<span class="late">${fa(late)} عقب‌افتاده</span>`:''].filter(Boolean).join(' · ');
  const tip=`${p.title}\nپیشرفت: ${pg===null?'ارزیابی نشده':fa(pg)+'٪'}${ex!==null?'\nانتظار بر اساس زمان: '+fa(ex)+'٪':''}${!pers&&p.progressAt?'\nارزیابی: '+ago(p.progressAt):''}`;
  const dk='add-'+p.id;
  return `<div class="pn" data-drag="proj" data-id="${p.id}"><div class="pr">
    <button class="tw" type="button" data-act="px" data-v="${p.id}" aria-expanded="${x}" aria-label="${x?'بستن موارد':'نمایش موارد باز'}">${ic(x?'down':'next')}</button>
    ${pers?`<span class="hdot" style="background:${col(p.domain)};border-color:transparent"></span>`:hdot(p.health)}
    <button type="button" class="pr-t" data-act="openproj" data-v="${p.id}"><b>${esc(p.title)}</b>${sub?`<small>${sub}</small>`:''}</button>
    <span class="pr-g" data-tip="${esc(tip)}">${bar(pg,ex)}<span class="pv">${pg===null?'—':fa(pg)+'٪'}</span></span>
    <span class="pd">${ddl(p)}</span>
    <button class="iconbtn sm ob" type="button" data-act="openproj" data-v="${p.id}" aria-label="باز کردن ${esc(p.title)}" title="باز کردن">${ic('open')}</button></div>${x?`<div class="pn-x"><div class="list flat" data-drop="items:${p.id}" data-empty="مورد بازی ندارد.">${op.map(t=>irow(t,{noProj:true})).join('')}</div><input type="text" class="add" id="${dk}" data-draft="${dk}" data-enter="padd" data-pid="${p.id}" value="${esc(S.drafts[dk]||'')}" placeholder="+ مورد جدید در این پروژه… (@نام = سپردن)" aria-label="مورد جدید در ${esc(p.title)}"></div>`:''}${k.length?`<div class="pn-k" data-pzone="${p.id}">${k.map(c=>pnode(c,pers)).join('')}</div>`:''}</div>`;
}
function roots(list){const ids=new Set(list.map(p=>p.id));return list.filter(p=>!p.parent||!ids.has(p.parent)).sort(byPorder);}
function vProjects(){
  const tp=TP(),c={g:0,y:0,r:0,n:0};tp.forEach(p=>{c[HEALTH[p.health]?p.health:'n']++;});
  const pers=PR().filter(p=>!isTeam(p.domain)&&st(p)==='active');
  const pd=persDoms().map(d=>({id:d.id,name:d.name})),known=new Set(pd.map(d=>d.id));
  if(pers.some(p=>!known.has(p.domain)))pd.push({id:'',name:'سایر'});
  const arch=PR().filter(p=>st(p)!=='active').sort((a,b)=>String(a.title).localeCompare(String(b.title),'fa'));
  const sum=tp.length?`<div class="hsum" role="img" aria-label="${['g','y','r'].map(k=>HEALTH[k]+' '+c[k]).join('، ')}، ارزیابی‌نشده ${c.n}"><div class="hbar">${['g','y','r','n'].filter(k=>c[k]).map(k=>`<i class="hs-${k}" style="flex:${c[k]}"></i>`).join('')}</div><div class="hleg">${['g','y','r'].map(k=>`<span><i class="hdot hd-${k}"></i>${HEALTH[k]} <b>${fa(c[k])}</b></span>`).join('')}<span><i class="hdot"></i>ارزیابی‌نشده <b>${fa(c.n)}</b></span></div></div>`:'';
  return `<div class="ph"><div class="grow"><h1>پروژه‌ها</h1><span class="sub">${fa(tp.length)} پروژهٔ فعال تیم</span></div><button class="btn primary" type="button" data-act="newproj">${ic('plus')}پروژه</button></div>
  ${sum}
  <section><h2>تیم</h2><div class="list tree" data-pzone="root" data-empty="هنوز پروژهٔ تیمی ثبت نشده.">${roots(tp).map(p=>pnode(p,false)).join('')}</div>
  ${tp.length?`<p class="hint">${ic('info')}خط عمودی روی هر نوار یعنی «با توجه به زمان گذشته باید اینجا می‌بود». برای تغییر ترتیب، ردیف را بکش.</p>`:''}</section>
  ${pd.length?`<section><h2>شخصی</h2>${pd.map(d=>{const l=pers.filter(p=>d.id?p.domain===d.id:!known.has(p.domain));return `<div class="sub2"><i class="hdot" style="background:${d.id?col(d.id):'var(--faint)'};border-color:transparent"></i>${esc(d.name)}<button class="btn xs ghost" type="button" data-act="newprojd" data-v="${d.id}">${ic('plus')}پروژه</button></div><div class="list tree" data-pzone="pers:${d.id}" data-empty="پروژه‌ای ندارد.">${roots(l).map(p=>pnode(p,true)).join('')}</div>`;}).join('')}</section>`:''}
  ${arch.length?`<section><button class="btn ghost sm" type="button" data-act="arch" aria-expanded="${S.showArch}">${ic('archive')}متوقف و آرشیو (${fa(arch.length)})</button>${S.showArch?`<div class="list" style="margin-top:8px">${arch.map(p=>`<div class="ur"><div class="at-t"><button type="button" class="lnk" data-act="openproj" data-v="${p.id}">${esc(p.title)}</button><small>${st(p)==='paused'?'متوقف':'تمام‌شده'} · ${esc(who(p.owner))}</small></div><button class="iconbtn sm ob" type="button" data-act="openproj" data-v="${p.id}" aria-label="باز کردن ${esc(p.title)}">${ic('open')}</button></div>`).join('')}</div>`:''}</section>`:''}`;
}
function spark(p){
  const us=pUpdates(p.id).filter(u=>u.progress!==null&&u.progress!==''&&!isNaN(Number(u.progress)));if(us.length<2)return '';
  const W=600,H=96,px=10,py=12,a=us[0].date,b=us[us.length-1].date,span=Math.max(1,diff(a,b));
  const X=k=>W-px-(W-2*px)*diff(a,k)/span,Y=v=>py+(H-2*py)*(1-v/100);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="روند پیشرفت در ${fa(us.length)} ارزیابی، از ${fa(us[0].progress)} تا ${fa(us[us.length-1].progress)} درصد"><line x1="${px}" x2="${W-px}" y1="${Y(0)}" y2="${Y(0)}" class="sg"/><line x1="${px}" x2="${W-px}" y1="${Y(100)}" y2="${Y(100)}" class="sg"/><polyline class="sl" points="${us.map(u=>X(u.date).toFixed(1)+','+Y(Number(u.progress)).toFixed(1)).join(' ')}"/>${us.map(u=>`<circle class="sd" cx="${X(u.date).toFixed(1)}" cy="${Y(Number(u.progress)).toFixed(1)}" r="4.5" data-tip="${esc(jd(u.date)+' · '+fa(u.progress)+'٪'+(u.note?'\n'+u.note:''))}"/>`).join('')}</svg><div class="spl"><span>${jd(a)}</span><span>روند پیشرفت</span><span>${jd(b)}</span></div>`;
}
function vProject(){
  const p=S.projects[S.pid];
  if(!p)return `<div class="empty">پروژه پیدا نشد.</div><p style="text-align:center"><button class="btn" type="button" data-act="go" data-v="projects">بازگشت به پروژه‌ها</button></p>`;
  const team=isTeam(p.domain),pg=pprog(p),ex=team?expected(p):null,op=pOpen(p.id),dn=pItems(p.id).filter(t=>!isOpen(t)),k=kids(p.id);
  const par=p.parent&&S.projects[p.parent];const h=S.ah[p.id]!==undefined?S.ah[p.id]:(p.health||'');
  const v=S.ar[p.id]!==undefined?S.ar[p.id]:(prog(p)===null?0:prog(p));const nk='pn-'+p.id,dk='add-'+p.id,sd=S.open.has('dn-'+p.id);
  const log=pUpdates(p.id).map(u=>({d:u.date,c:u.createdAt,u})).concat(T().filter(t=>isNote(t)&&t.projectId===p.id).map(t=>({d:day(t.createdAt),c:t.createdAt,t})))
    .sort((a,b)=>String(b.d).localeCompare(String(a.d))||String(b.c||'').localeCompare(String(a.c||'')));
  const meta=[team?'مسئول: '+(p.owner&&S.people[p.owner]?`<button type="button" class="lnk" data-act="openperson" data-v="${p.owner}">${esc(who(p.owner))}</button>`:esc(who(p.owner))):esc((S.domains[p.domain]||{}).name||''),p.deadline?'ددلاین '+jd(p.deadline)+' ('+ddl(p)+')':'بدون ددلاین',st(p)==='paused'?'متوقف':st(p)==='done'?'تمام‌شده':''].filter(Boolean).join(' · ');
  return `${par?`<nav class="crumb" aria-label="مسیر"><button type="button" class="lnk" data-act="openproj" data-v="${par.id}">${esc(par.title)}</button><span>/</span></nav>`:''}
  <div class="ph"><button class="iconbtn" type="button" data-act="go" data-v="projects" aria-label="بازگشت به پروژه‌ها">${ic('back')}</button><div class="grow"><h1>${esc(p.title)}</h1><span class="sub">${meta}</span></div><button class="btn" type="button" data-act="editproj" data-v="${p.id}">${ic('edit')}ویرایش</button></div>
  ${p.goal||p.desc?`<div class="about">${p.goal?`<p><b>انجام‌شده یعنی:</b> ${esc(p.goal)}</p>`:''}${p.desc?`<p>${esc(p.desc)}</p>`:''}</div>`:''}
  ${team?`<section class="card"><div class="stat"><b class="big">${pg===null?'—':fa(pg)+'٪'}</b><div class="grow">${hpill(p.health)}<small>${p.progressAt?'ارزیابی '+ago(p.progressAt):'هنوز ارزیابی نشده'}${ex!==null?' · انتظار بر اساس زمان: '+fa(ex)+'٪':''}</small>${bar(pg,ex)}</div></div>
    <div class="assess" data-pid="${p.id}"><div class="at-r"><label for="ar-${p.id}">پیشرفت</label><input type="range" class="arange" id="ar-${p.id}" data-pid="${p.id}" min="0" max="100" step="5" value="${v}"><output id="ao-${p.id}">${fa(v)}٪</output></div>
    <div class="at-q">${hbtns(p.id,h,'hsel')}</div>
    <div class="row"><input type="text" id="${nk}" data-draft="${nk}" data-enter="asave" data-pid="${p.id}" value="${esc(S.drafts[nk]||'')}" placeholder="یک خط یادداشت: چه شد، چه مانعی هست؟ (اختیاری)" aria-label="یادداشت ارزیابی"><button class="btn primary" type="button" data-act="asave" data-pid="${p.id}">ثبت ارزیابی</button></div></div></section>`:''}
  ${k.length?`<section><h2>زیرپروژه‌ها <span class="n">${fa(k.length)}</span></h2><div class="list tree" data-pzone="${p.id}">${k.map(c=>pnode(c,!team)).join('')}</div></section>`:''}
  <section><h2>موارد باز <span class="n">${fa(op.length)}</span></h2><div class="list" data-drop="items:${p.id}" data-empty="مورد بازی ندارد.">${op.map(t=>irow(t,{noProj:true,sun:true})).join('')}</div>
    <input type="text" class="add" id="${dk}" data-draft="${dk}" data-enter="padd" data-pid="${p.id}" value="${esc(S.drafts[dk]||'')}" placeholder="+ مورد جدید… (@نام = سپردن)" aria-label="مورد جدید">
    ${dn.length?`<button class="btn ghost sm" type="button" data-act="dn" data-v="${p.id}" aria-expanded="${sd}" style="margin-top:8px">${fa(dn.length)} مورد انجام‌شده</button>${sd?`<div class="list" style="margin-top:8px">${dn.slice().sort((a,b)=>String(b.doneAt||'').localeCompare(String(a.doneAt||''))).slice(0,30).map(t=>irow(t,{noProj:true,noDrag:true})).join('')}</div>`:''}`:''}</section>
  <section><h2>تاریخچه <span class="n">${fa(log.length)}</span></h2>${spark(p)}${log.length?`<div class="list">${log.slice(0,40).map(x=>x.u?`<div class="nt"><span class="d">${jd(x.u.date)}</span><div class="it-b"><div class="lg">${x.u.progress===null||x.u.progress===''?'':`<b>${fa(x.u.progress)}٪</b>`}${hpill(x.u.health)}</div>${x.u.note?`<div class="lgn">${esc(x.u.note)}</div>`:''}</div></div>`:nrow(x.t,{noProj:true})).join('')}</div>`:`<div class="list"><div class="empty">ارزیابی یا یادداشتی ثبت نشده. از کادر بالا، حالت «یادداشت» را انتخاب کن.</div></div>`}</section>`;
}

/* ================= افراد ================= */
function vPeople(){
  const ps=people(),off=people(true).filter(p=>p.active===false),td=today();
  return `<div class="ph"><div class="grow"><h1>افراد</h1><span class="sub">${fa(ps.length)} نفر</span></div><button class="btn primary" type="button" data-act="newperson">${ic('plus')}فرد</button></div>
  <div class="list" data-empty="هنوز فردی اضافه نشده.">${ps.map(u=>{
    const pj=TP().filter(p=>p.owner===u.id).length,op=uOpen(u.id),late=op.filter(t=>t.due&&t.due<td).length,lt=lastTalk(u.id),n=lt?diff(lt,td):null;
    return `<div class="ur">${av(u.id)}<div class="at-t"><button type="button" class="lnk" data-act="openperson" data-v="${u.id}">${esc(u.name)}</button><small>${esc(u.role||'')}</small></div>
      <div class="ur-m"><span>${fa(pj)} پروژه</span><span>${fa(op.length)} باز${late?` · <b class="late">${fa(late)} عقب‌افتاده</b>`:''}</span><span class="${n===null||n>=LP.talkDays?'warn':''}">${ic('chat')}${n===null?'بدون گفت‌وگو':ago(lt)}</span></div>
      <button class="iconbtn sm ob" type="button" data-act="openperson" data-v="${u.id}" aria-label="باز کردن ${esc(u.name)}" title="باز کردن">${ic('open')}</button></div>`;}).join('')}</div>
  ${off.length?`<section><h2>غیرفعال <span class="n">${fa(off.length)}</span></h2><div class="list">${off.map(u=>`<div class="ur">${av(u.id)}<div class="at-t"><button type="button" class="lnk" data-act="openperson" data-v="${u.id}">${esc(u.name)}</button><small>${esc(u.role||'')}</small></div><button class="iconbtn sm ob" type="button" data-act="openperson" data-v="${u.id}" aria-label="باز کردن ${esc(u.name)}">${ic('open')}</button></div>`).join('')}</div></section>`:''}`;
}
function vPerson(){
  const u=S.people[S.uid];
  if(!u)return `<div class="empty">این فرد پیدا نشد.</div><p style="text-align:center"><button class="btn" type="button" data-act="go" data-v="people">بازگشت به افراد</button></p>`;
  const td=today(),op=uOpen(u.id),pj=PR().filter(p=>p.owner===u.id&&st(p)==='active').sort(byPorder),lt=lastTalk(u.id),n=lt?diff(lt,td):null;
  const notes=T().filter(t=>isNote(t)&&t.assignee===u.id).sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
  return `<div class="ph"><button class="iconbtn" type="button" data-act="go" data-v="people" aria-label="بازگشت به افراد">${ic('back')}</button>${av(u.id,'lg')}<div class="grow"><h1>${esc(u.name)}</h1><span class="sub">${esc(u.role||'')}${u.active===false?' · غیرفعال':''}</span></div><button class="btn" type="button" data-act="editperson" data-v="${u.id}">${ic('edit')}ویرایش</button></div>
  <div class="talkbar ${n===null||n>=LP.talkDays?'due':''}">${ic('chat')}<span class="grow">${n===null?'هنوز گفت‌وگوی فردی ثبت نشده.':'آخرین گفت‌وگوی فردی: '+ago(lt)}</span>${lt===td?'':`<button class="btn sm primary" type="button" data-act="talk" data-v="${u.id}">${ic('check')}گفت‌وگو انجام شد</button>`}</div>
  <section><h2>موارد باز با او <span class="n">${fa(op.length)}</span></h2><div class="list" data-drop="u:${u.id}" data-empty="مورد بازی نیست. از کادر بالا کاری به او بسپار یا موضوعی برای گفت‌وگوی بعدی بنویس.">${op.map(t=>irow(t,{noWho:true})).join('')}</div></section>
  ${pj.length?`<section><h2>پروژه‌ها <span class="n">${fa(pj.length)}</span></h2><div class="list tree">${pj.map(p=>{const pg=pprog(p);return `<div class="pr"><span></span>${hdot(p.health)}<button type="button" class="pr-t" data-act="openproj" data-v="${p.id}"><b>${esc(p.title)}</b></button><span class="pr-g">${bar(pg,expected(p))}<span class="pv">${pg===null?'—':fa(pg)+'٪'}</span></span><span class="pd">${ddl(p)}</span><button class="iconbtn sm ob" type="button" data-act="openproj" data-v="${p.id}" aria-label="باز کردن ${esc(p.title)}">${ic('open')}</button></div>`;}).join('')}</div></section>`:''}
  <section><h2>یادداشت‌ها <span class="n">${fa(notes.length)}</span></h2><div class="list" data-empty="یادداشتی نیست. در کادر بالا حالت «یادداشت» را انتخاب کن و مشاهده‌ات را با تاریخ ثبت کن.">${notes.slice(0,60).map(t=>nrow(t,{noWho:true})).join('')}</div>
    <p class="hint">${ic('info')}مشاهدهٔ رفتاری و تاریخ‌دار بنویس («در جلسهٔ سه‌شنبه ارائه را واگذار کرد»)، نه برچسب («خجالتی است»).</p></section>
  ${u.skills||u.note?`<section><h2>مشخصات</h2><div class="about">${u.skills?`<p><b>مهارت‌ها:</b> ${esc(u.skills)}</p>`:''}${u.note?`<p>${esc(u.note)}</p>`:''}</div></section>`:''}`;
}

/* ================= اتصال ================= */
function vConnect(){
  return `<div class="connect card"><h2 style="font-size:19px">${badToken?'کلید دسترسی دیگر معتبر نیست':'اتصال به Google Sheet'}</h2>
  <p class="muted" style="font-size:13.5px;margin:6px 0 16px">آدرس Web app (با <span dir="ltr">/exec</span> تمام می‌شود) و کلید دسترسی را از Apps Script وارد کن؛ یا «کد اتصال» را از تنظیمات دستگاه دیگر بچسبان.</p>
  <div class="field"><label for="c-url">آدرس Web app</label><input id="c-url" type="url" dir="ltr" data-draft="c-url" placeholder="https://script.google.com/macros/s/…/exec" value="${esc((CONN&&CONN.u)||S.drafts['c-url']||'')}"></div>
  <div class="field"><label for="c-token">کلید دسترسی</label><input id="c-token" type="password" dir="ltr" autocomplete="off" placeholder="۶۴ کاراکتر"></div>
  <button class="btn primary" type="button" data-act="cconnect" style="width:100%">اتصال</button>
  <div class="or">یا</div>
  <div class="field"><label for="c-code">کد اتصال</label><input id="c-code" type="text" dir="ltr" autocomplete="off" placeholder="gam1.…"></div>
  <button class="btn" type="button" data-act="ccode" style="width:100%">اتصال با کد</button></div>`;
}

/* ================= کادر ثبت ================= */
const narrow=matchMedia('(max-width:560px)');
function capCtx(){
  if(S.view==='project'&&S.projects[S.pid])return {project:S.projects[S.pid]};
  if(S.view==='person'&&S.people[S.uid])return {person:S.people[S.uid]};
  return {};
}
function capTok(){
  const i=$('#cap-q');if(!i||document.activeElement!==i)return null;
  const pos=i.selectionStart===null||i.selectionStart===undefined?i.value.length:i.selectionStart;
  const m=i.value.slice(0,pos).match(/(^|\s)([#@])([^\s#@!]*)$/);
  return m?{type:m[2],q:m[3],start:pos-m[3].length-1,end:pos}:null;
}
function capUpdate(){
  const i=$('#cap-q');if(!i)return;const c=capCtx(),x=parseCap(i.value),ch=[];
  const pj=(S.cap.project&&S.projects[S.cap.project])||x.project||c.project,pe=(S.cap.person&&S.people[S.cap.person])||x.person||c.person;
  const xb=k=>S.cap[k]?`<button type="button" data-act="capx" data-v="${k}" aria-label="حذف">${ic('x')}</button>`:'';
  if(pj)ch.push(`<span class="cchip">${ic('proj')}${esc(pj.title)}${xb('project')}</span>`);
  if(pe)ch.push(`<span class="cchip">${ic('user')}${S.kind==='note'?'دربارهٔ ':'سپرده به '}${esc(pe.name)}${xb('person')}</span>`);
  if(x.when&&S.kind!=='note')ch.push(`<span class="cchip">${ic('flag')}${x.when==='هفته'?'هفتهٔ بعد':x.when}</span>`);
  if(x.bad)ch.push(`<span class="cchip bad">«${esc(x.bad)}» پیدا نشد</span>`);
  $('#cap-chips').innerHTML=ch.join('');
  document.querySelectorAll('#cap [data-act="capkind"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===S.kind)));
  i.placeholder=S.kind==='note'?(c.person?'یادداشت دربارهٔ '+c.person.name+'…':c.project?'یادداشت یا تصمیم دربارهٔ این پروژه…':'یادداشت… (با @نام یا #پروژه وصلش کن)')
    :(c.person?'کار یا موضوع گفت‌وگو برای '+c.person.name+'…':c.project?'مورد جدید در این پروژه… (@نام = سپردن)':narrow.matches?'بنویس…  @نام  #پروژه':'بنویس و Enter بزن…   @نام = سپردن   #پروژه');
  const tk=capTok(),sg=$('#cap-sug');
  if(tk){
    const q=norm(tk.q).trim();
    const list=(tk.type==='#'?PR().filter(p=>st(p)!=='done').sort((a,b)=>(isTeam(b.domain)-isTeam(a.domain))||byPorder(a,b)):people()).filter(o=>!q||norm(o.title||o.name).includes(q)).slice(0,6);
    const sel=S.sug&&S.sug.sel<list.length?S.sug.sel:0;S.sug={tk,list,sel};
    sg.innerHTML=list.length?list.map((o,n)=>`<button type="button" role="option" data-act="cappick" data-v="${n}" aria-selected="${n===sel}">${ic(tk.type==='#'?'proj':'user')}${esc(o.title||o.name)}</button>`).join(''):`<span class="muted">${tk.type==='#'?'پروژه‌ای':'فردی'} با این نام نیست.</span>`;
    sg.hidden=false;
  }else{S.sug=null;sg.hidden=true;}
}
function capPick(n){
  const s=S.sug;if(!s||!s.list[n])return;const i=$('#cap-q'),o=s.list[n],atEnd=s.tk.end>=i.value.length;
  i.value=(i.value.slice(0,s.tk.start)+' '+i.value.slice(s.tk.end)).replace(/\s{2,}/g,' ').replace(/^\s+/,'');
  if(s.tk.type==='#')S.cap.project=o.id;else S.cap.person=o.id;
  S.sug=null;i.focus();const pos=atEnd?i.value.length:Math.min(s.tk.start,i.value.length);try{i.setSelectionRange(pos,pos);}catch(e){}
  capUpdate();
}
function capIns(ch){
  const i=$('#cap-q');i.focus();const pos=i.selectionStart===null?i.value.length:i.selectionStart;const pre=i.value.slice(0,pos);
  const ins=(pre&&!/\s$/.test(pre)?' ':'')+ch;i.value=pre+ins+i.value.slice(pos);const np=pos+ins.length;try{i.setSelectionRange(np,np);}catch(e){}
  capUpdate();
}
function capSave(){
  const i=$('#cap-q');const raw=i.value.trim();if(!raw)return;
  const x=parseCap(raw),c=capCtx(),td=today();
  const pj=(S.cap.project&&S.projects[S.cap.project])||x.project||c.project||null,pe=(S.cap.person&&S.people[S.cap.person])||x.person||c.person||null;
  if(!x.title){toast('متن خالی است.');return;}
  const base={title:x.title,projectId:pj?pj.id:'',assignee:pe?pe.id:'',domain:pj?pj.domain:firstTeamDom()};
  if(S.kind==='note'){
    if(!pj&&!pe){toast('یادداشت باید به یک پروژه (#) یا فرد (@) وصل باشد.');return;}
    put('tasks',newItem(Object.assign(base,{status:'note'})));
    toast('یادداشت ثبت شد'+(pe?' · دربارهٔ '+pe.name:pj?' · '+pj.title:''));
  }else{
    const when=x.when==='امروز'?td:x.when==='فردا'?addDays(td,1):x.when==='هفته'?addDays(td,7):'';
    if(when){if(pe)base.due=when;else base.plan=when;}
    put('tasks',newItem(base));
    toast(x.bad?'ثبت شد؛ «'+x.bad+'» پیدا نشد و در متن ماند.':pe?'به '+pe.name+' سپرده شد':pj?'در «'+pj.title+'» ثبت شد':'ثبت شد');
  }
  i.value='';S.cap={};S.sug=null;capUpdate();i.focus();
}
function capBlurCheck(){setTimeout(()=>{const c=$('#cap'),i=$('#cap-q');if(!c||c.contains(document.activeElement))return;if(i.value.trim()||S.cap.project||S.cap.person||S.kind==='note')return;c.classList.remove('on');$('#cap-sug').hidden=true;},220);}

/* ================= پنجره‌ها ================= */
function projOptions(sel){
  const ps=PR().filter(p=>st(p)!=='done'||p.id===sel).sort(byPorder);const g=(l,list)=>list.length?`<optgroup label="${l}">${list.map(p=>`<option value="${p.id}" ${p.id===sel?'selected':''}>${esc(p.title)}</option>`).join('')}</optgroup>`:'';
  return `<option value="">— بدون پروژه —</option>`+g('تیم',ps.filter(p=>isTeam(p.domain)))+g('شخصی',ps.filter(p=>!isTeam(p.domain)));
}
function dateChips(target){
  return `<div class="qchips"><button type="button" data-act="dchip" data-t="${target}" data-v="0">امروز</button><button type="button" data-act="dchip" data-t="${target}" data-v="1">فردا</button><button type="button" data-act="dchip" data-t="${target}" data-v="7">هفتهٔ بعد</button><button type="button" data-act="dchip" data-t="${target}" data-v="">پاک</button></div>`;
}
function jlUpdate(id){const i=document.getElementById(id),o=document.getElementById(id+'-jl');if(i&&o)o.textContent=i.value?fullDate(i.value):'';}
const SHEETS={
  item(id){
    const t=S.tasks[id];if(!t)return '<p>پیدا نشد.</p>';const n=isNote(t),td=today();
    return `<h3>${n?'یادداشت':t.assignee?'کار سپرده‌شده':'کار'}</h3>${n?`<p class="lead">ثبت‌شده در ${fullDate(day(t.createdAt)||td)}</p>`:''}
    <div class="field"><label for="f-title">${n?'متن':'عنوان'}</label><textarea id="f-title" rows="${n?4:2}" autofocus>${esc(t.title)}</textarea></div>
    <div class="row2"><div class="field"><label for="f-project">پروژه</label><select id="f-project">${projOptions(t.projectId)}</select></div>
    <div class="field"><label for="f-who">${n?'دربارهٔ':'انجام‌دهنده'}</label><select id="f-who">${whoOptions(t.assignee,n?'— هیچ‌کس —':'خودم')}</select></div></div>
    ${n?'':`<div class="field"><label for="f-due">موعد (برای کار سپرده‌شده: روز پیگیری)</label><input id="f-due" type="date" dir="ltr" value="${t.due||''}">${dateChips('f-due')}<span class="jl" id="f-due-jl"></span></div>
    <label class="switch" for="f-today"><span class="sx">در فهرست «امروز» من باشد</span><input type="checkbox" id="f-today" ${t.plan&&t.plan<=td?'checked':''}></label>
    <div class="field"><label for="f-note">جزئیات</label><textarea id="f-note" rows="2">${esc(t.note||'')}</textarea></div>`}
    <div class="mfoot"><button class="btn primary" type="button" data-save data-act="isave" data-v="${id}">ذخیره</button><button class="btn ghost" type="button" data-act="close">انصراف</button><span class="sp"></span><button class="btn sm danger" type="button" data-act="idel" data-v="${id}">حذف</button></div>`;
  },
  project(id){
    const dom=S.newDom||firstTeamDom();
    const p=id?S.projects[id]:{title:'',domain:dom,owner:'',deadline:'',start:today(),status:'active',goal:'',desc:'',parent:''};
    const hasKids=!!(id&&PR().some(x=>x.parent===id));
    const parOps=PR().filter(x=>x.id!==id&&!x.parent&&st(x)!=='done'&&isTeam(x.domain)===isTeam(p.domain)).sort(byPorder);
    return `<h3>${id?'ویرایش پروژه':'پروژهٔ جدید'}</h3><p class="lead">فقط نام لازم است.</p>
    <div class="field"><label for="p-title">نام پروژه</label><input id="p-title" type="text" value="${esc(p.title)}" autofocus></div>
    <div class="row2"><div class="field"><label for="p-owner">مسئول</label><select id="p-owner">${whoOptions(p.owner)}</select></div>
    <div class="field"><label for="p-deadline">ددلاین</label><input id="p-deadline" type="date" dir="ltr" value="${p.deadline||''}"><span class="jl" id="p-deadline-jl"></span></div></div>
    <details class="more" ${id?'open':''}><summary>بیشتر</summary>
      <div class="row2"><div class="field"><label for="p-parent">ابرپروژه</label><select id="p-parent" ${hasKids?'disabled':''}>${hasKids?'<option value="">— خودش ابرپروژه است —</option>':`<option value="">— ندارد —</option>${parOps.map(x=>`<option value="${x.id}" ${p.parent===x.id?'selected':''}>${esc(x.title)}</option>`).join('')}`}</select></div>
      <div class="field"><label for="p-domain">گروه</label><select id="p-domain">${doms().concat(S.domains[p.domain]&&S.domains[p.domain].archived?[S.domains[p.domain]]:[]).map(d=>`<option value="${d.id}" ${d.id===p.domain?'selected':''}>${esc(d.name)}${domKind(d)==='team'?' (تیم)':' (شخصی)'}</option>`).join('')}</select></div></div>
      <div class="row2"><div class="field"><label for="p-start">شروع</label><input id="p-start" type="date" dir="ltr" value="${p.start||''}"><span class="jl" id="p-start-jl"></span></div>
      <div class="field"><label for="p-status">وضعیت</label><select id="p-status"><option value="active" ${st(p)==='active'?'selected':''}>فعال</option><option value="paused" ${p.status==='paused'?'selected':''}>متوقف</option><option value="done" ${p.status==='done'?'selected':''}>تمام‌شده (آرشیو)</option></select></div></div>
      <div class="field"><label for="p-goal">«انجام‌شده» یعنی چه؟</label><input id="p-goal" type="text" value="${esc(p.goal||'')}" placeholder="مثلاً: گزارش نهایی برای مدیرعامل ارسال شد"></div>
      <div class="field"><label for="p-desc">توضیح</label><textarea id="p-desc" rows="3">${esc(p.desc||'')}</textarea></div>
    </details>
    <div class="mfoot"><button class="btn primary" type="button" data-save data-act="psave" data-v="${id||''}">ذخیره</button><button class="btn ghost" type="button" data-act="close">انصراف</button>${id?`<span class="sp"></span><button class="btn sm danger" type="button" data-act="pdel" data-v="${id}">حذف پروژه</button>`:''}</div>`;
  },
  person(id){
    const x=id?S.people[id]:{name:'',role:'',active:true};
    return `<h3>${id?'ویرایش فرد':'فرد جدید'}</h3><p class="lead">فقط در Google Sheet خودت ذخیره می‌شود.</p>
    <div class="field"><label for="x-name">نام</label><input id="x-name" type="text" value="${esc(x.name)}" autofocus></div>
    <div class="field"><label for="x-role">نقش</label><input id="x-role" type="text" value="${esc(x.role||'')}" placeholder="مثلاً: پژوهشگر داده"></div>
    ${id?`<label class="switch" for="x-active"><span class="sx">فعال در تیم<small>فرد غیرفعال از یادآورها و فهرست انتخاب حذف می‌شود؛ سابقه‌اش می‌ماند</small></span><input type="checkbox" id="x-active" ${x.active!==false?'checked':''}></label>`:''}
    <div class="mfoot"><button class="btn primary" type="button" data-save data-act="usave" data-v="${id||''}">ذخیره</button><button class="btn ghost" type="button" data-act="close">انصراف</button>${id?`<span class="sp"></span><button class="btn sm danger" type="button" data-act="udel" data-v="${id}">حذف</button>`:''}</div>`;
  },
  review(){
    const r=S.rv;while(r.i<r.steps.length&&!(r.steps[r.i].t==='p'?S.projects[r.steps[r.i].id]:S.people[r.steps[r.i].id]))r.i++;
    const n=r.steps.length;
    if(r.i>=n)return `<h3>مرور تمام شد</h3><p class="lead">${fa(r.np)} پروژه ارزیابی شد و ${fa(r.nu)} گفت‌وگوی فردی ثبت شد.</p><div class="mfoot"><button class="btn primary" type="button" data-act="close" autofocus>بستن</button></div>`;
    const s=r.steps[r.i],td=today();
    const head=`<div class="rv-h"><span>مرور هفتگی · ${fa(r.i+1)} از ${fa(n)}</span><div class="prog"><span style="width:${Math.round(r.i/n*100)}%"></span></div></div>`;
    if(s.t==='p'){
      const p=S.projects[s.id],op=pOpen(p.id),late=op.filter(t=>t.due&&t.due<td).length,pg=prog(p),ex=expected(p),last=pUpdates(p.id).filter(u=>u.note).slice(-1)[0];
      const h=S.ah[p.id]!==undefined?S.ah[p.id]:(p.health||''),v=S.ar[p.id]!==undefined?S.ar[p.id]:(pg===null?0:pg);
      return `${head}<h3>${esc(p.title)}</h3><p class="lead">${esc(who(p.owner))}${p.deadline?' · '+ddl(p):''} · ${p.progressAt?'آخرین ارزیابی '+ago(p.progressAt)+': '+(pg===null?'—':fa(pg)+'٪')+' · '+(HEALTH[p.health]||'بدون وضعیت'):'هنوز ارزیابی نشده'}${ex!==null?' · انتظار زمانی '+fa(ex)+'٪':''}</p>
      ${last?`<p class="quote">${esc(last.note)} <small>(${ago(last.date)})</small></p>`:''}
      ${op.length?`<ul class="plain">${op.slice(0,4).map(t=>`<li>${esc(t.title)}${t.assignee?' <small>— '+esc(who(t.assignee))+'</small>':''}${t.due&&t.due<td?' <small class="late">عقب‌افتاده</small>':''}</li>`).join('')}${op.length>4?`<li><small>و ${fa(op.length-4)} مورد دیگر</small></li>`:''}</ul>`:'<p class="lead">مورد بازی ندارد.</p>'}
      <div class="assess"><div class="at-r"><label for="ar-${p.id}">پیشرفت</label><input type="range" class="arange" id="ar-${p.id}" data-pid="${p.id}" min="0" max="100" step="5" value="${v}"><output id="ao-${p.id}">${fa(v)}٪</output></div>
      <div class="at-q">${hbtns(p.id,h,'hsel')}</div>
      <input type="text" id="rv-note" data-enter="rvsave" placeholder="یک خط یادداشت (اختیاری)" aria-label="یادداشت ارزیابی" autofocus></div>
      <div class="mfoot"><button class="btn primary" type="button" data-act="rvsave">ثبت و بعدی</button><button class="btn" type="button" data-act="rvsame" ${p.health?'':'disabled'}>بدون تغییر</button><span class="sp"></span><button class="btn ghost" type="button" data-act="rvskip">رد کردن</button></div>`;
    }
    const u=S.people[s.id],op=uOpen(u.id),lt=lastTalk(u.id);
    return `${head}<h3>${esc(u.name)}</h3><p class="lead">${esc(u.role||'')}${u.role?' · ':''}${lt?'آخرین گفت‌وگوی فردی '+ago(lt):'هنوز گفت‌وگوی فردی ثبت نشده'}</p>
    ${op.length?`<ul class="plain">${op.slice(0,5).map(t=>`<li>${esc(t.title)}${t.due&&t.due<td?' <small class="late">عقب‌افتاده</small>':''}</li>`).join('')}${op.length>5?`<li><small>و ${fa(op.length-5)} مورد دیگر</small></li>`:''}</ul>`:'<p class="lead">مورد بازی با او نیست.</p>'}
    <div class="field"><label for="rv-note">این هفته چه دیدی؟ (مشاهده، بازخورد، نگرانی — اختیاری)</label><input type="text" id="rv-note" data-enter="rvnext" autofocus></div>
    <div class="mfoot"><button class="btn primary" type="button" data-act="rvtalk">${ic('chat')}این هفته گفت‌وگو کردیم</button><button class="btn" type="button" data-act="rvnext">بعدی</button></div>`;
  },
  settings(){
    const s=S.settings,th=lsGet('x-theme-v')||'auto';
    return `<h3>تنظیمات</h3>
    <div class="row2" style="margin-top:12px"><div class="field"><label for="s-stale">یادآوری ارزیابی پروژه، هر چند روز؟</label><input id="s-stale" type="number" min="1" max="60" value="${s.staleDays}"></div>
    <div class="field"><label for="s-talk">یادآوری گفت‌وگوی فردی، هر چند روز؟</label><input id="s-talk" type="number" min="1" max="90" value="${LP.talkDays}"></div></div>
    <div class="field"><span class="lbl">پوسته (همین دستگاه)</span><div class="qchips">${[['auto','خودکار'],['light','روشن'],['dark','تیره']].map(([k,l])=>`<button type="button" data-act="theme" data-v="${k}" aria-pressed="${th===k}">${l}</button>`).join('')}</div></div>
    <div class="mfoot"><button class="btn primary" type="button" data-save data-act="ssave">ذخیره</button><button class="btn ghost" type="button" data-act="close">بستن</button></div>
    <h3 style="font-size:15px;margin-top:20px">میان‌برها</h3><div class="keys"><span><kbd>/</kbd> یا شروع به نوشتن: کادر ثبت</span><span><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> صفحه‌ها</span><span><kbd>@</kbd> سپردن به فرد</span><span><kbd>#</kbd> وصل به پروژه</span><span><kbd dir="rtl">!امروز</kbd><kbd dir="rtl">!فردا</kbd><kbd dir="rtl">!هفته</kbd> موعد</span></div>
    ${hasConn()?`<hr><h3 style="font-size:15px">اتصال دستگاه دیگر</h3><p class="lead">این کد QR را با دوربین گوشی اسکن کن. کد حکم رمز عبور دارد.</p>
    <div class="qr" id="qrbox"></div><div class="code" id="codebox">${esc(encodeConn(CONN))}</div>
    <div class="mfoot" style="margin-top:12px"><button class="btn sm" type="button" data-act="copycode" data-v="code">کپی کد</button><button class="btn sm" type="button" data-act="copycode" data-v="link">کپی لینک</button><span class="sp"></span><button class="btn sm danger" type="button" data-act="disconnect">قطع اتصال این دستگاه</button></div>`:''}
    <p class="hint" style="margin-top:16px">Xerxes نسخهٔ ۶ · بک‌اند نسخهٔ ${fa(S.bver||0)}</p>`;
  }
};
function openSheet(kind,arg){
  const root=$('#sheet');
  root.innerHTML=`<div class="backdrop" data-act="bg"><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${SHEETS[kind](arg)}</div></div>`;
  root.hidden=false;root.dataset.kind=kind;document.body.style.overflow='hidden';
  ['f-due','p-deadline','p-start'].forEach(jlUpdate);
  if(kind==='settings')drawQR();
  setTimeout(()=>{const a=root.querySelector('[autofocus]');if(a&&(kind==='review'||matchMedia('(min-width:640px)').matches))a.focus();},30);
}
function closeSheet(){const r=$('#sheet');if(!r||r.hidden)return;r.hidden=true;r.innerHTML='';document.body.style.overflow='';S.newDom='';if(S.rv){S.rv=null;}}
function drawQR(){
  const box=document.getElementById('qrbox');if(!box||!hasConn())return;
  if(typeof QRCode==='undefined'){box.textContent='کد QR بارگذاری نشد؛ از «کپی لینک» استفاده کن.';return;}
  box.innerHTML='';try{new QRCode(box,{text:appLink(),width:220,height:220,colorDark:'#12342A',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.L});}catch(e){box.textContent='از «کپی لینک» استفاده کن.';}
}
function selectCode(){const el=document.getElementById('codebox');if(!el)return;const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);toast('کد انتخاب شد؛ کپی کن.');}
function rvStart(){
  const ps=TP().sort((a,b)=>{const x=assessAge(a),y=assessAge(b);return (y===null?1e6:y)-(x===null?1e6:x)||byPorder(a,b);});
  const steps=ps.map(p=>({t:'p',id:p.id})).concat(people().map(u=>({t:'u',id:u.id})));
  if(!steps.length){toast('پروژه یا فردی برای مرور نیست.');return;}
  S.ah={};S.ar={};S.rv={i:0,steps,np:0,nu:0};openSheet('review');
}
function rvNext(){const r=S.rv;if(!r)return;r.i++;const keep=r;openSheet('review');S.rv=keep;}

/* ================= ذخیره‌ها ================= */
function saveItem(id){
  const t=S.tasks[id];if(!t)return;const title=val('f-title').trim();if(!title){toast('متن خالی است.');return;}
  const pj=S.projects[val('f-project')],o={title,projectId:pj?pj.id:'',assignee:val('f-who')};if(pj)o.domain=pj.domain;
  if(isNote(t)){if(!o.projectId&&!o.assignee){toast('یادداشت باید به یک پروژه یا فرد وصل باشد.');return;}}
  else{const td=today();o.due=val('f-due');o.note=val('f-note').trim();o.plan=o.assignee?'':checked('f-today')?(t.plan&&t.plan<=td?t.plan:td):(t.plan&&t.plan<=td?'':t.plan||'');}
  o.triaged=true;closeSheet();put('tasks',Object.assign({},t,o));
}
function saveProject(id){
  const title=val('p-title').trim();if(!title){toast('نام پروژه خالی است.');return;}
  const old=id?S.projects[id]:null;
  const p=Object.assign({},old||{id:uid(),createdAt:new Date().toISOString(),progress:null,progressAt:'',health:'',type:'',priority:2,stakeholder:'',stopRule:'',links:'',stage:'run',porder:null,parent:''},
    {title,owner:val('p-owner'),deadline:val('p-deadline'),start:val('p-start'),status:val('p-status')||'active',domain:val('p-domain')||firstTeamDom(),goal:val('p-goal').trim(),desc:val('p-desc').trim()});
  const pe=document.getElementById('p-parent');if(pe&&!pe.disabled)p.parent=pe.value;
  const par=p.parent&&S.projects[p.parent];if(!par||par.id===p.id)p.parent='';else p.domain=par.domain;
  closeSheet();
  batch(()=>{
    if(old&&old.domain!==p.domain)Object.values(S.tasks).filter(t=>t.projectId===p.id).forEach(t=>put('tasks',Object.assign({},t,{domain:p.domain})));
    put('projects',p);
  });
  if(!old){openProj(p.id);toast('پروژه ساخته شد');}
}
function savePerson(id){
  const name=val('x-name').trim();if(!name){toast('نام خالی است.');return;}
  const old=id?S.people[id]:null;
  const u=Object.assign({},old||{id:uid(),skills:'',note:'',order:Date.now(),createdAt:new Date().toISOString()},{name,role:val('x-role').trim(),active:old?checked('x-active'):true});
  closeSheet();put('people',u);if(!old)toast('فرد اضافه شد');
}
function addInProject(pid,input){
  const p=S.projects[pid],raw=(input.value||'').trim();if(!p||!raw)return;const x=parseCap(raw),td=today();
  const o={title:x.title||raw,projectId:pid,domain:p.domain,assignee:x.person?x.person.id:'',order:Date.now()};
  const when=x.when==='امروز'?td:x.when==='فردا'?addDays(td,1):x.when==='هفته'?addDays(td,7):'';
  if(when){if(o.assignee)o.due=when;else o.plan=when;}
  delete S.drafts[input.id];input.value='';put('tasks',newItem(o));
}

/* ================= کشیدن و رها کردن (موس و لمس) ================= */
const DD={on:false,pend:null,tp:null,justDragged:0,dirty:false};
const zsel=t=>t==='proj'?'[data-pzone]':'[data-drop]';
function ddStart(el,x,y){
  const type=el.dataset.drag,zs=zsel(type),home=el.parentElement&&el.parentElement.closest(zs);if(!home)return;
  const r=el.getBoundingClientRect(),h=type==='proj'?Math.min(r.height,58):r.height;
  const ghost=el.cloneNode(true);ghost.classList.add('dd-ghost');ghost.removeAttribute('id');ghost.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));ghost.style.width=r.width+'px';ghost.style.height=h+'px';
  document.body.appendChild(ghost);
  const ph=document.createElement('div');ph.className='dd-ph';ph.style.height=h+'px';el.after(ph);el.classList.add('dd-src');
  Object.assign(DD,{on:true,el,type,ghost,ph,zs,home,dx:x-r.left,dy:Math.min(y-r.top,h-8),x,y,zone:home,dirty:false});
  document.body.classList.add('dd-active');tipEl.hidden=true;
  ddMove(x,y);requestAnimationFrame(ddLoop);
  try{if(navigator.vibrate)navigator.vibrate(12);}catch(e){}
}
function ddMove(x,y){
  if(!DD.on)return;DD.x=x;DD.y=y;
  DD.ghost.style.transform=`translate(${x-DD.dx}px,${y-DD.dy}px)`;
  const hit=document.elementFromPoint(x,y);let zone=hit&&hit.closest&&hit.closest(DD.zs);
  if(DD.type==='proj'){while(zone&&zone!==DD.home)zone=zone.parentElement&&zone.parentElement.closest(DD.zs);}
  if(!zone)return;
  document.querySelectorAll('.dd-over').forEach(z=>{if(z!==zone)z.classList.remove('dd-over');});zone.classList.add('dd-over');
  const ks=[...zone.children].filter(k=>k.dataset&&k.dataset.drag===DD.type&&k!==DD.el);
  let before=null;for(const k of ks){const b=k.getBoundingClientRect();if(y<b.top+b.height/2){before=k;break;}}
  if(before){if(DD.ph.nextSibling!==before)zone.insertBefore(DD.ph,before);}
  else if(DD.ph.parentNode!==zone||DD.ph.nextSibling)zone.appendChild(DD.ph);
  DD.zone=zone;
}
function ddLoop(){
  if(!DD.on)return;const m=70,y=DD.y,H=window.innerHeight;let dy=0;
  if(y<m+90)dy=-Math.ceil((m+90-y)/6);else if(y>H-m)dy=Math.ceil((y-(H-m))/6);
  if(dy){const b=window.scrollY;window.scrollBy(0,dy);if(window.scrollY!==b)ddMove(DD.x,DD.y);}
  requestAnimationFrame(ddLoop);
}
function ddEnd(cancel){
  if(!DD.on)return;DD.on=false;document.body.classList.remove('dd-active');
  document.querySelectorAll('.dd-over').forEach(z=>z.classList.remove('dd-over'));
  const {el,ph,ghost,type,zone}=DD;ghost.remove();el.classList.remove('dd-src');DD.justDragged=Date.now();
  if(cancel||!zone||ph.parentNode!==zone){ph.remove();render();return;}
  const order=[...zone.children].filter(k=>k===ph||(k.dataset&&k.dataset.drag===type&&k!==el)).map(k=>k===ph?el.dataset.id:k.dataset.id);
  ph.remove();ddDrop(type,el.dataset.id,zone.dataset.drop||zone.dataset.pzone||'',order);
}
function ddDrop(type,id,z,order){
  if(type==='proj'){batch(()=>order.forEach((pid,k)=>{const p=S.projects[pid];if(p&&Number(p.porder)!==k*10)put('projects',Object.assign({},p,{porder:k*10}));}));return;}
  const t=S.tasks[id];if(!t){render();return;}const patch={},td=today();
  if(z.indexOf('items:')===0){const p=S.projects[z.slice(6)];if(p&&t.projectId!==p.id){patch.projectId=p.id;patch.domain=p.domain;}}
  else if(z==='mine:today'){if(t.assignee){render();return;}if(!((t.plan&&t.plan<=td)||(t.due&&t.due<=td)))patch.plan=td;}
  else if(z==='mine:later'){if(t.assignee){render();return;}if(t.plan&&t.plan<=td)patch.plan='';}
  else if(z.indexOf('u:')===0){if(t.assignee!==z.slice(2)){render();return;}}
  let vals=order.map(i=>Number((S.tasks[i]||{}).order)||0).sort((a,b)=>a-b);
  if(vals.some((v,i)=>i&&v<=vals[i-1]))vals=order.map((_,k)=>(vals[0]||0)+k*10);
  batch(()=>order.forEach((i,k)=>{const x=S.tasks[i];if(!x)return;
    if(i===id)put('tasks',Object.assign({},x,patch,{order:vals[k]}));else if(Number(x.order)!==vals[k])put('tasks',Object.assign({},x,{order:vals[k]}));}));
}
document.addEventListener('click',e=>{if(Date.now()-DD.justDragged<350){e.stopPropagation();e.preventDefault();}},true);
document.addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch'||e.button!==0)return;
  const el=e.target.closest&&e.target.closest('[data-drag]');if(!el||e.target.closest('input,textarea,select,a,.pn-x .add'))return;
  DD.pend={el,x:e.clientX,y:e.clientY};
});
document.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch')return;
  if(DD.on){ddMove(e.clientX,e.clientY);return;}
  if(DD.pend&&Math.hypot(e.clientX-DD.pend.x,e.clientY-DD.pend.y)>6){const p=DD.pend;DD.pend=null;ddStart(p.el,p.x,p.y);ddMove(e.clientX,e.clientY);}
});
document.addEventListener('pointerup',e=>{if(e.pointerType==='touch')return;DD.pend=null;if(DD.on)ddEnd(false);});
document.addEventListener('touchstart',e=>{
  if(e.touches.length!==1||DD.on)return;
  const el=e.target.closest&&e.target.closest('[data-drag]');if(!el||e.target.closest('input,textarea,select,a'))return;
  const t=e.touches[0];
  DD.tp={el,x:t.clientX,y:t.clientY,timer:setTimeout(()=>{if(DD.tp){const p=DD.tp;DD.tp=null;ddStart(p.el,p.x,p.y);}},330)};
},{passive:true});
document.addEventListener('touchmove',e=>{
  const t=e.touches[0];if(!t)return;
  if(DD.on){if(e.cancelable)e.preventDefault();ddMove(t.clientX,t.clientY);return;}
  if(DD.tp&&Math.hypot(t.clientX-DD.tp.x,t.clientY-DD.tp.y)>10){clearTimeout(DD.tp.timer);DD.tp=null;}
},{passive:false});
document.addEventListener('touchend',e=>{if(DD.tp){clearTimeout(DD.tp.timer);DD.tp=null;}if(DD.on){if(e.cancelable)e.preventDefault();ddEnd(false);}},{passive:false});
document.addEventListener('touchcancel',()=>{if(DD.tp){clearTimeout(DD.tp.timer);DD.tp=null;}if(DD.on)ddEnd(true);});
document.addEventListener('contextmenu',e=>{if(DD.on||DD.tp)e.preventDefault();});

/* ================= رویدادها ================= */
function arm(b,label){if(b.classList.contains('armed'))return true;b.classList.add('armed');const o=b.innerHTML;b.textContent=label||'مطمئنی؟ دوباره بزن';setTimeout(()=>{b.classList.remove('armed');b.innerHTML=o;},3500);return false;}
document.addEventListener('mousedown',e=>{if(e.target.closest&&e.target.closest('#cap button'))e.preventDefault();});
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act]');if(!b)return;
  const act=b.dataset.act,v=b.dataset.v;
  if(act==='bg'){if(e.target===b)closeSheet();return;}
  const idEl=b.closest('[data-id]');const id=idEl?idEl.dataset.id:'';
  switch(act){
    case 'go':go(v);break;
    case 'openproj':openProj(v);break;
    case 'openperson':openPerson(v);break;
    case 'sync':pull(true);flush();toast('همگام‌سازی…');break;
    case 'settings':openSheet('settings');break;
    case 'close':closeSheet();break;
    case 'undo':if(undoFn){const f=undoFn;undoFn=null;$('#toast').hidden=true;f();}break;
    case 'toggle':toggle(id);break;
    case 'edit':if(S.tasks[id])openSheet('item',id);break;
    case 'sun':{const t=S.tasks[id];if(!t)break;const td=today();
      if(t.plan&&t.plan<=td){put('tasks',Object.assign({},t,{plan:''}));if(t.due&&t.due<=td)toast('موعدش رسیده؛ در «امروز» می‌ماند.');}
      else if(t.due&&t.due<=td)toast('موعدش رسیده؛ برای برداشتن، موعد را عوض کن.');
      else put('tasks',Object.assign({},t,{plan:td}));break;}
    case 'snooze':{const t=S.tasks[id];if(!t)break;put('tasks',Object.assign({},t,{due:addDays(today(),3)}));toast('سه روز دیگر یادآوری می‌شود');break;}
    case 'px':{const k='px-'+v;if(S.open.has(k))S.open.delete(k);else S.open.add(k);render();break;}
    case 'dn':{const k='dn-'+v;if(S.open.has(k))S.open.delete(k);else S.open.add(k);render();break;}
    case 'arch':S.showArch=!S.showArch;render();break;
    case 'hset':{const pid=b.dataset.pid;if(!S.fresh[pid]){const cur=attention().find(x=>x.k==='p'&&x.p.id===pid);S.fresh[pid]=(cur&&cur.sev)||1;}delete S.ar[pid];assess(pid,{health:v});break;}
    case 'hsel':{const pid=b.dataset.pid;S.ah[pid]=v;b.parentNode.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));break;}
    case 'asave':{const pid=b.dataset.pid,p=S.projects[pid];if(!p)break;const h=S.ah[pid]!==undefined?S.ah[pid]:(p.health||'');
      if(!h){toast('سلامت پروژه را انتخاب کن.');break;}
      const r=document.getElementById('ar-'+pid),nk='pn-'+pid,note=val(nk).trim();delete S.ah[pid];delete S.ar[pid];delete S.drafts[nk];
      assess(pid,{health:h,progress:r?Number(r.value):undefined,note});toast('ارزیابی ثبت شد');break;}
    case 'talk':{const u=S.people[v];if(!u)break;logTalk(v,'');
      if(S.view==='person'){S.kind='note';capUpdate();$('#cap').classList.add('on');$('#cap-q').focus();toast('ثبت شد. اگر نکته‌ای داشت، همین‌جا بنویس.');}
      else toast('گفت‌وگو با '+u.name+' ثبت شد');break;}
    case 'newproj':S.newDom='';openSheet('project',null);break;
    case 'newprojd':S.newDom=v||'';openSheet('project',null);break;
    case 'editproj':openSheet('project',v);break;
    case 'psave':saveProject(v);break;
    case 'pdel':{if(!arm(b))break;const p=S.projects[v];closeSheet();
      batch(()=>{Object.values(S.tasks).filter(t=>t.projectId===v).forEach(t=>put('tasks',Object.assign({},t,{projectId:''})));
        Object.values(S.projects).filter(x=>x.parent===v).forEach(x=>put('projects',Object.assign({},x,{parent:''})));
        pUpdates(v).forEach(u=>del('updates',u.id));del('projects',v);});
      if(S.view==='project'&&S.pid===v)go('projects');toast('پروژه حذف شد؛ موارد آن بدون پروژه ماندند.');void p;break;}
    case 'newperson':openSheet('person',null);break;
    case 'editperson':openSheet('person',v);break;
    case 'usave':savePerson(v);break;
    case 'udel':{if(!arm(b))break;closeSheet();
      batch(()=>{Object.values(S.projects).filter(x=>x.owner===v).forEach(x=>put('projects',Object.assign({},x,{owner:''})));
        Object.values(S.tasks).filter(t=>t.assignee===v).forEach(t=>{if(isNote(t))del('tasks',t.id);else put('tasks',Object.assign({},t,{assignee:''}));});
        del('people',v);});
      if(S.view==='person'&&S.uid===v)go('people');toast('حذف شد؛ پروژه‌ها و کارهایش به «خودم» برگشت.');break;}
    case 'isave':saveItem(v);break;
    case 'idel':if(!arm(b))break;closeSheet();del('tasks',v);toast('حذف شد');break;
    case 'dchip':{const el=document.getElementById(b.dataset.t);if(el){el.value=v===''?'':addDays(today(),Number(v));jlUpdate(b.dataset.t);}break;}
    case 'ssave':{const sd=Math.max(1,Math.min(60,Number(toEn(val('s-stale')))||7));LP.talkDays=Math.max(1,Math.min(90,Number(toEn(val('s-talk')))||14));lsSet(LKEY,LP);closeSheet();
      if(sd!==S.settings.staleDays)saveSettings({staleDays:sd});else render();toast('ذخیره شد');break;}
    case 'theme':{lsSet('x-theme-v',v);try{if(v==='auto'){document.documentElement.removeAttribute('data-theme');localStorage.removeItem('x-theme');}else{document.documentElement.setAttribute('data-theme',v);localStorage.setItem('x-theme',v);}}catch(x){}
      b.parentNode.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));break;}
    case 'copycode':{const txt=v==='link'?appLink():encodeConn(CONN);
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(()=>toast('کپی شد'),selectCode);else selectCode();break;}
    case 'disconnect':if(!arm(b))break;
      try{localStorage.removeItem(CONNKEY);localStorage.removeItem(CKEY);localStorage.removeItem(PKEY);}catch(x){}
      CONN=null;pending=[];S.tasks={};S.projects={};S.reviews={};S.domains={};S.events={};S.people={};S.updates={};S.loaded=false;closeSheet();render();break;
    case 'cconnect':{const u=val('c-url').trim(),t=val('c-token').trim();
      if(!/^https:\/\/script\.google(usercontent)?\.com\/.+/.test(u)){toast('آدرس Web app معتبر نیست.');break;}
      if(t.length<32){toast('کلید دسترسی کوتاه است.');break;}connect({u,t});break;}
    case 'ccode':{const c=decodeConn(val('c-code'));if(!c){toast('کد اتصال معتبر نیست.');break;}connect(c);break;}
    case 'capsave':capSave();break;
    case 'capkind':S.kind=v;capUpdate();$('#cap-q').focus();break;
    case 'capins':capIns(v);break;
    case 'cappick':capPick(Number(v));break;
    case 'capx':delete S.cap[v];capUpdate();$('#cap-q').focus();break;
    case 'rvstart':rvStart();break;
    case 'rvsave':case 'rvsame':{const r=S.rv;if(!r)break;const s=r.steps[r.i],p=S.projects[s.id];if(!p)break;
      const h=act==='rvsame'?p.health:(S.ah[p.id]!==undefined?S.ah[p.id]:(p.health||''));if(!h){toast('سلامت پروژه را انتخاب کن.');break;}
      const rg=document.getElementById('ar-'+p.id),note=val('rv-note').trim();
      assess(p.id,act==='rvsame'?{note}:{health:h,progress:rg?Number(rg.value):undefined,note});delete S.ah[p.id];delete S.ar[p.id];r.np++;rvNext();break;}
    case 'rvskip':rvNext();break;
    case 'rvtalk':case 'rvnext':{const r=S.rv;if(!r)break;const s=r.steps[r.i],note=val('rv-note').trim();
      if(act==='rvtalk'){logTalk(s.id,note);r.nu++;}else if(note)put('tasks',newItem({title:note,status:'note',assignee:s.id}));
      rvNext();break;}
  }
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset&&t.dataset.draft)S.drafts[t.dataset.draft]=t.value;
  if(t.id==='cap-q')capUpdate();
  if(t.classList&&t.classList.contains('arange')){const pid=t.dataset.pid;S.ar[pid]=Number(t.value);const o=document.getElementById('ao-'+pid);if(o)o.textContent=fa(t.value)+'٪';}
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.classList&&t.classList.contains('arange')&&t.classList.contains('live')){const pid=t.dataset.pid;delete S.ar[pid];assess(pid,{progress:Number(t.value)});}
  if(['f-due','p-deadline','p-start'].includes(t.id))jlUpdate(t.id);
});
document.addEventListener('focusin',e=>{if(e.target.closest&&e.target.closest('#cap')){$('#cap').classList.add('on');if(e.target.id==='cap-q')capUpdate();}});
document.addEventListener('focusout',e=>{if(e.target.closest&&e.target.closest('#cap'))capBlurCheck();});
document.addEventListener('keyup',e=>{if(e.target.id==='cap-q'&&/^Arrow(Left|Right)|Home|End$/.test(e.key))capUpdate();});
document.addEventListener('keydown',e=>{
  const t=e.target,sheetOpen=!$('#sheet').hidden;
  if(e.key==='Escape'){
    if(DD.on){ddEnd(true);return;}
    if(sheetOpen){closeSheet();return;}
    if(t.id==='cap-q'){if(S.sug){S.sug=null;$('#cap-sug').hidden=true;}else{t.value='';S.cap={};S.kind='task';capUpdate();t.blur();}return;}
    if(/INPUT|TEXTAREA/.test(t.tagName))t.blur();return;
  }
  if(t.id==='cap-q'){
    const s=S.sug;
    if(s&&s.list.length&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();s.sel=(s.sel+(e.key==='ArrowDown'?1:-1)+s.list.length)%s.list.length;document.querySelectorAll('#cap-sug button').forEach((b,n)=>b.setAttribute('aria-selected',String(n===s.sel)));return;}
    if(s&&s.list.length&&(e.key==='Enter'||e.key==='Tab')){e.preventDefault();capPick(s.sel);return;}
    if(e.key==='Enter'){e.preventDefault();capSave();}
    return;
  }
  const inField=/INPUT|TEXTAREA|SELECT/.test(t.tagName);
  if(e.key==='Enter'&&inField){
    const en=t.dataset&&t.dataset.enter;
    if(en==='padd'){e.preventDefault();addInProject(t.dataset.pid,t);return;}
    if(en==='anote'){e.preventDefault();const pid=t.dataset.pid,note=t.value.trim();delete S.drafts[t.id];delete S.fresh[pid];if(note)assess(pid,{note});else render();toast('ثبت شد');return;}
    if(en==='asave'||en==='rvsave'||en==='rvnext'){e.preventDefault();const b=document.querySelector(`[data-act="${en}"]`);if(b)b.click();return;}
    if(sheetOpen&&(t.tagName==='INPUT'||(t.tagName==='TEXTAREA'&&(e.ctrlKey||e.metaKey)))&&t.type!=='range'){const b=$('#sheet [data-save]');if(b){e.preventDefault();b.click();}}
    return;
  }
  if(inField||sheetOpen||!hasConn()||!S.loaded||DD.on)return;
  if((e.ctrlKey||e.metaKey)&&e.code==='KeyK'){e.preventDefault();$('#cap-q').focus();return;}
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  const nav={Digit1:'today',Digit2:'projects',Digit3:'people',Numpad1:'today',Numpad2:'projects',Numpad3:'people'}[e.code];
  if(nav){e.preventDefault();go(nav);return;}
  if(e.key==='/'){e.preventDefault();$('#cap-q').focus();return;}
  if(e.key.length===1&&!/[\s\d]/.test(e.key))$('#cap-q').focus();
});

const tipEl=$('#tip');let tipT=null;
function showTip(el,x,y){const s=el.getAttribute('data-tip');if(!s)return;tipEl.textContent=s;tipEl.hidden=false;const r=tipEl.getBoundingClientRect();
  let left=x-r.width/2,top=y-r.height-14;left=Math.max(8,Math.min(window.innerWidth-r.width-8,left));if(top<8)top=y+18;tipEl.style.left=left+'px';tipEl.style.top=top+'px';}
document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||DD.on)return;const el=e.target.closest&&e.target.closest('[data-tip]');if(el)showTip(el,e.clientX,e.clientY);else tipEl.hidden=true;});
document.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;const el=e.target.closest&&e.target.closest('[data-tip]');if(el){showTip(el,e.clientX,e.clientY);clearTimeout(tipT);tipT=setTimeout(()=>tipEl.hidden=true,2600);}else tipEl.hidden=true;});
window.addEventListener('scroll',()=>{tipEl.hidden=true;$('#head').classList.toggle('scrolled',window.scrollY>4);},{passive:true});

let tt=null,undoFn=null;
function toast(msg,undo){const el=$('#toast');undoFn=undo?undo.fn:null;el.innerHTML=`<span>${esc(msg)}</span>${undo?`<button type="button" data-act="undo">${esc(undo.label)}</button>`:''}`;el.hidden=false;clearTimeout(tt);tt=setTimeout(()=>{el.hidden=true;undoFn=null;},undo?5000:2600);}

/* ================= شروع ================= */
(function(){
  const hm2=(location.hash||'').match(/[#&]c=(gam1\.[A-Za-z0-9_-]+)/);
  if(hm2){const c=decodeConn(hm2[1]);if(c){CONN=c;lsSet(CONNKEY,c);}try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}}
  const c=lsGet(CKEY);
  if(c&&hasConn()){S.tasks=c.tasks||{};S.projects=c.projects||{};S.reviews=c.reviews||{};S.domains=c.domains||{};S.events=c.events||{};S.people=c.people||{};S.updates=c.updates||{};S.settings=mergeSettings(c.settings);S.bver=c.bver||5;rev=c.rev||0;pending.forEach(applyOp);S.loaded=true;}
  $('#gear').innerHTML=ic('gear');
  $('#cap').innerHTML=`<div class="cap-in">${ic('plus')}<input id="cap-q" type="text" autocomplete="off" enterkeyhint="done" aria-label="ثبت سریع" aria-controls="cap-sug"><button type="button" class="cap-go" data-act="capsave" aria-label="ثبت">${ic('enter')}</button></div>
    <div class="cap-row"><div class="seg" role="group" aria-label="نوع"><button type="button" data-act="capkind" data-v="task" aria-pressed="true">کار</button><button type="button" data-act="capkind" data-v="note" aria-pressed="false">یادداشت</button></div><button type="button" class="tk" data-act="capins" data-v="@">@ فرد</button><button type="button" class="tk" data-act="capins" data-v="#"># پروژه</button><span id="cap-chips"></span></div>
    <div class="cap-sug" id="cap-sug" role="listbox" hidden></div>`;
  applyRoute();setHash(true);
  render();
  if(hasConn())pull(true);
  setInterval(()=>{if(hasConn()&&!badToken&&document.visibilityState==='visible')pull(false);},20000);
  document.addEventListener('visibilitychange',()=>{if(hasConn()&&document.visibilityState==='visible')pull(false);});
  window.addEventListener('online',()=>{online=true;flush();pull(false);});
})();
})();
