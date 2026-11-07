/* Xerxes — مدیریت و برنامه‌ریزی */
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
  back:'<path d="m9.5 6 6 6-6 6"/>'
};
function ic(n,extra){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra||''} aria-hidden="true">${P[n]||''}</svg>`;}

/* ================= constants ================= */
const PAL=['c1','c2','c3','c4','c5','c6','c7','c8'];
const PAL_NAME={c1:'آبی',c2:'نارنجی',c3:'فیروزه‌ای',c4:'طلایی',c5:'صورتی',c6:'سبز',c7:'بنفش',c8:'قرمز'};
const EVT={meeting:{n:'جلسه',i:'users'},task:{n:'کار',i:'today'},birthday:{n:'تولد',i:'cake'},event:{n:'مناسبت',i:'flag'},reminder:{n:'یادآور',i:'bell'}};
const REMIND=[[-1,'بدون یادآوری'],[0,'هنگام شروع'],[10,'۱۰ دقیقه قبل'],[30,'۳۰ دقیقه قبل'],[60,'۱ ساعت قبل'],[1440,'۱ روز قبل'],[10080,'۱ هفته قبل']];
const REPEAT=[['none','بدون تکرار'],['weekly','هر هفته'],['monthly','هر ماه (شمسی)'],['yearly','هر سال (شمسی)']];
const VAGUE=['کار روی','بررسی','تحقیق','پیگیری','فکر کردن','فکر','مطالعه','آماده سازی','تکمیل','انجام','ادامه','رسیدگی','مدیریت','تحلیل','نهایی سازی','بهبود','تمام کردن','شروع'];
const DEFAULT_DOMAINS=[{id:'rnd',name:'R&D هلدینگ',color:'c4',budget:20,order:10,kind:'team'},{id:'design',name:'طراحی فریلنس',color:'c5',budget:10,order:20,kind:'personal'},{id:'phd',name:'پژوهش دکتری',color:'c7',budget:15,order:30,kind:'personal'}];
const NAV=[['home','سبد','grid'],['projects','پروژه‌ها','proj'],['today','امروزِ من','today'],['people','افراد','users'],['personal','شخصی','layers']];
const NAV2=[['review','بازبینی هفتگی','review'],['plan','تقویم و برنامه','cal'],['inbox','صندوق','inbox'],['domains','حوزه‌ها','stack']];
const VIEWS=['home','projects','project','today','people','personal','review','plan','inbox','domains'];
const HEALTH={g:{n:'روی روال',i:'check'},y:{n:'نیازمند توجه',i:'info'},r:{n:'در خطر',i:'alert'}};
const PTYPE=[['','—'],['system','سامانه'],['report','گزارش'],['auto','اتوماسیون'],['doc','سند'],['research','پژوهش'],['other','سایر']];
const PTYPE_N=Object.fromEntries(PTYPE);
const PRIO_N={1:'بالا',2:'معمول',3:'کم'};
const HOMES=[['home','سبد پروژه‌ها'],['today','امروزِ من'],['projects','پروژه‌های تیم']];

/* ================= state ================= */
const S={tasks:{},projects:{},reviews:{},domains:{},events:{},people:{},updates:{},settings:{atom:25,focus:3,gcalDefault:true,home:'home',staleDays:7,appUrl:''},loaded:false,backendOld:false,noDomains:false,
  view:'home',period:'week',filter:'all',capDom:'',planMode:'week',weekOffset:0,monthOffset:0,selDay:today(),reviewOffset:0,
  pid:'',pf:{owner:'all',status:'active'},psearch:'',pdom:'all',ah:{},ar:{},newProjDom:'',
  open:new Set(),drafts:{},multi:null,evDraft:null,qa:{when:'inbox'}};
const CONNKEY='gam-conn-v1',PKEY='gam-pending-v1',CKEY='x-cache-v3';
let CONN=lsGet(CONNKEY),pending=lsGet(PKEY)||[],rev=0,syncing=false,pulling=false,online=true,lastSync=null,badToken=false;

/* ================= domains ================= */
function doms(all){return Object.values(S.domains).filter(d=>all||!d.archived).sort((a,b)=>(a.order||0)-(b.order||0));}
function D(id){return S.domains[id]||{id:id||'',name:'بدون حوزه',color:'',archived:false,_missing:true};}
function col(id){const d=S.domains[id];return d&&d.color?`var(--${d.color})`:'var(--faint)';}
function live(x){const d=S.domains[x.domain];return !d||!d.archived;}
function inF(x){return S.filter==='all'||x.domain===S.filter;}
function dm(id){const d=D(id);return `<span class="dm"><i class="dot" style="background:${col(id)}"></i>${esc(d.name)}</span>`;}
function firstDom(){const a=doms();return a.length?a[0].id:'';}
function nextColor(){const used=new Set(doms(true).map(d=>d.color));return PAL.find(c=>!used.has(c))||PAL[doms(true).length%PAL.length];}
function domKind(d){return d&&d.kind?d.kind:(d&&d.id==='rnd'?'team':'personal');}
function isTeam(id){const d=S.domains[id];return !!d&&domKind(d)==='team';}
function teamDoms(){return doms().filter(d=>domKind(d)==='team');}
function persDoms(){return doms().filter(d=>domKind(d)!=='team');}
function firstTeamDom(){const a=teamDoms();return a.length?a[0].id:firstDom();}
function firstPersDom(){const a=persDoms();return a.length?a[0].id:firstDom();}

/* ================= people ================= */
function people(all){return Object.values(S.people).filter(p=>all||p.active!==false).sort((a,b)=>(a.order||0)-(b.order||0)||String(a.name).localeCompare(String(b.name),'fa'));}
function who(id){if(!id)return 'خودم';const p=S.people[id];return p?p.name:'نامشخص';}
function whoOptions(sel){const list=people();const cur=S.people[sel];if(cur&&cur.active===false)list.push(cur);
  return `<option value="" ${!sel?'selected':''}>خودم</option>`+list.map(p=>`<option value="${p.id}" ${p.id===sel?'selected':''}>${esc(p.name)}${p.active===false?' (غیرفعال)':''}</option>`).join('');}

/* ================= derived ================= */
const T=()=>Object.values(S.tasks).filter(live);
const PR=()=>Object.values(S.projects).filter(live);
const EV=()=>Object.values(S.events).filter(e=>!e.archived&&live(e));
function byOrder(a,b){return (a.order||0)-(b.order||0)||String(a.createdAt||'').localeCompare(String(b.createdAt||''));}
function byPrio(a,b){return (a.priority||2)-(b.priority||2)||byOrder(a,b);}
function pTasks(pid){return Object.values(S.tasks).filter(t=>t.projectId===pid).sort(byOrder);}
function nextOf(pid){return pTasks(pid).find(t=>t.status!=='done');}
function isOpen(t){return t.status!=='done';}
function isInbox(t){return isOpen(t)&&t.triaged===false;}
function w(t){return t.minutes||15;}
function norm(s){return ' '+String(s||'').replace(/‌/g,' ').replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/\s+/g,' ').trim()+' ';}
const MT=()=>T().filter(t=>!t.assignee); // کارهای خودم
function nextMine(pid){return pTasks(pid).find(t=>isOpen(t)&&!t.assignee);}
function atom(t){
  if(isTeam(t.domain))return {lvl:'ok',txt:'',team:true}; // قاعدهٔ اتم فقط برای حوزه‌های شخصی
  const a=S.settings.atom||25;
  if(!t.minutes)return {lvl:'none',txt:'بدون زمان'};
  if(t.minutes>a)return {lvl:'bad',txt:'درشت؛ خردش کن'};
  const n=norm(t.title);const v=VAGUE.find(x=>n.includes(' '+x+' '));
  if(v)return {lvl:'warn',txt:'فعل مبهم: «'+v+'»'};
  return {lvl:'ok',txt:'اتمی'};
}
function health(p){
  const ts=pTasks(p.id),open=ts.filter(isOpen),done=ts.filter(t=>!isOpen(t));
  const big=open.filter(t=>atom(t).lvl!=='ok').length;
  const last=done.map(t=>t.doneDay||'').filter(Boolean).sort().pop();
  const base=last||(p.createdAt?key(new Date(p.createdAt)):today());
  const idle=diff(base,today());
  return {total:ts.length,done:done.length,open:open.length,big,noNext:p.status==='active'&&open.length===0,
    stale:p.status==='active'&&idle>=7?idle:0,minsOpen:open.reduce((s,t)=>s+(t.minutes||0),0)};
}
function maxOrder(pid){return pTasks(pid).reduce((m,t)=>Math.max(m,t.order||0),0);}

/* team portfolio */
const TPall=()=>PR().filter(p=>isTeam(p.domain));
const TP=()=>TPall().filter(p=>(p.status||'active')==='active');
function pStart(p){return p.start||(p.createdAt?key(new Date(p.createdAt)):today());}
function hasProg(p){return p.progress!==null&&p.progress!==undefined&&p.progress!==''&&!isNaN(Number(p.progress));}
function prog(p){return hasProg(p)?Math.max(0,Math.min(100,Number(p.progress))):null;}
function expected(p){
  if(!p.deadline)return null;const st=pStart(p),tot=diff(st,p.deadline);
  if(tot<=0)return today()>=p.deadline?100:0;
  return Math.max(0,Math.min(100,Math.round(diff(st,today())/tot*100)));
}
function assessAge(p){return p.progressAt?diff(p.progressAt,today()):null;}
function flagsOf(p){
  const f=[],td=today(),lim=S.settings.staleDays||7;
  if(p.health==='r')f.push({k:'risk',t:'در خطر',lvl:'crit'});
  const ag=assessAge(p);
  if(ag===null)f.push({k:'never',t:'ارزیابی نشده',lvl:'warn'});else if(ag>=lim)f.push({k:'stale',t:'ارزیابی '+fa(ag)+' روز پیش',lvl:'warn'});
  if(p.deadline&&(p.status||'active')==='active'){const n=diff(td,p.deadline);if(n<0)f.push({k:'late',t:fa(-n)+' روز از ددلاین گذشته',lvl:'crit'});else if(n<=14)f.push({k:'soon',t:fa(n)+' روز تا ددلاین',lvl:''});}
  const ex=expected(p),pg=prog(p);if(ex!==null&&pg!==null&&pg<ex-20)f.push({k:'behind',t:'عقب از زمان',lvl:'warn'});
  return f;
}
function pUpdates(pid){return Object.values(S.updates).filter(u=>u.projectId===pid).sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.createdAt||'').localeCompare(String(b.createdAt||'')));}
function hpill(h){const x=HEALTH[h];return x?`<span class="hp hp-${h}">${ic(x.i)}${x.n}</span>`:`<span class="hp hp-n">ارزیابی نشده</span>`;}
function flagTags(f){return f.map(x=>`<span class="tag ${x.lvl}">${x.t}</span>`).join('');}
function findProj(w){
  const q=norm(String(w).replace(/_/g,' ')).trim();if(!q)return null;
  const ps=Object.values(S.projects).filter(p=>live(p)&&p.status!=='done');
  const hit=ps.filter(p=>norm(p.title).includes(' '+q))
    .concat(ps.filter(p=>norm(p.title).includes(q)));
  return hit.length?hit.sort((a,b)=>(norm(a.title).includes(' '+q)?0:1)-(norm(b.title).includes(' '+q)?0:1)||a.title.length-b.title.length)[0]:null;
}
function findPerson(w){
  const q=norm(String(w).replace(/_/g,' ')).trim();if(!q)return null;
  const ps=people(true).filter(p=>norm(p.name).includes(' '+q));
  return ps.length?ps.sort((a,b)=>(a.active===false)-(b.active===false)||a.name.length-b.name.length)[0]:null;
}
/** میان‌برها: #پروژه @نفر !امروز !فردا !صندوق */
function parseTokens(raw){
  const o={};let s=' '+String(raw||'')+' ';
  s=s.replace(/(\s)!(امروز|فردا|صندوق)(?=\s)/g,(m,a,w)=>{o.when=w==='امروز'?'today':w==='فردا'?'tomorrow':'inbox';return a;});
  s=s.replace(/(\s)#([^\s#@!]+)/g,(m,a,w)=>{const p=findProj(w);if(p)o.project=p;else o.badProj=w;return a;});
  s=s.replace(/(\s)@([^\s#@!]+)/g,(m,a,w)=>{if(/^(من|خودم)$/.test(w)){o.me=true;return a;}const x=findPerson(w);if(x)o.person=x;else o.badPerson=w;return a;});
  const x=parseLine(s.replace(/\s+/g,' ').trim());o.title=x.title;o.minutes=x.minutes;
  return o;
}

/* events */
function occurs(ev,k){
  if(!ev.date||k<ev.date)return false;
  switch(ev.repeat){
    case 'weekly':return wdi(k)===wdi(ev.date);
    case 'monthly':return jp(k).d===jp(ev.date).d;
    case 'yearly':{const a=jp(k),b=jp(ev.date);return a.m===b.m&&a.d===b.d;}
    default:return k===ev.date;
  }
}
function eventsOn(k,all){return EV().filter(e=>(all||inF(e))&&occurs(e,k)).sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));}
function occList(ev,n){
  const out=[];let k=ev.date>today()?ev.date:today();
  for(let i=0;i<3700&&out.length<n;i++,k=addDays(k,1))if(occurs(ev,k))out.push(k);
  return out;
}
function evLabel(e,k){
  let s=e.time?faTime(e.time):'تمام روز';
  if(e.type==='birthday'&&e.repeat==='yearly'&&k){const age=jp(k).y-jp(e.date).y;if(age>0&&age<130)s+=' · '+fa(age)+' سالگی';}
  return s;
}

/* ================= persistence ================= */
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
  if(op.t==='put'){const o=Object.assign({},op.obj);delete o.occ;S[op.kind][o.id]=o;}
  else if(op.t==='del')delete S[op.kind][op.id];
  else if(op.t==='settings')S.settings=mergeSettings(Object.assign({},S.settings,op.obj));
}
function cacheSave(){lsSet(CKEY,{tasks:S.tasks,projects:S.projects,reviews:S.reviews,domains:S.domains,events:S.events,people:S.people,updates:S.updates,settings:S.settings,rev});}
function enqueue(op){applyOp(op);cacheSave();render();if(!hasConn())return;pending.push(op);lsSet(PKEY,pending);flushSoon();}
function put(kind,obj){enqueue({t:'put',kind,obj:body(obj)});}
function del(kind,id){enqueue({t:'del',kind,id});}
function saveSettings(s){enqueue({t:'settings',obj:body(s)});}
let flushT=null;function flushSoon(){clearTimeout(flushT);flushT=setTimeout(flush,400);}
async function flush(){
  if(!hasConn()||syncing||!pending.length)return;syncing=true;renderSync();
  const batch=pending.slice(0,40);
  try{await api('ops',{ops:batch});pending=pending.slice(batch.length);lsSet(PKEY,pending);online=true;lastSync=new Date();}
  catch(e){online=false;}
  syncing=false;renderSync();
  if(online&&pending.length)flush();
  else if(online)setTimeout(()=>pull(false),800);
}
async function pull(force){
  if(!hasConn()||pulling)return;pulling=true;
  try{
    const r=(await api('rev')).rev;online=true;
    if(force||r!==rev||!S.loaded){const st=(await api('state')).state;loadState(st);}
    lastSync=new Date();
  }catch(e){online=false;}
  pulling=false;renderSync();
  if(online&&pending.length)flush();
}
function toMap(arr){const m={};(arr||[]).forEach(o=>{if(o&&o.id)m[o.id]=o;});return m;}
function loadState(st){
  S.tasks=toMap(st.tasks);S.projects=toMap(st.projects);S.reviews=toMap(st.reviews);S.events=toMap(st.events);
  S.people=toMap(st.people);S.updates=toMap(st.updates);
  S.noDomains=!('domains' in st);S.backendOld=!('people' in st);
  S.domains=S.noDomains?toMap(DEFAULT_DOMAINS):toMap(st.domains);
  S.settings=mergeSettings(st.settings);
  pending.forEach(applyOp);rev=st.rev;const first=!S.loaded;S.loaded=true;fixFilter();cacheSave();
  if(first&&!location.hash&&VIEWS.includes(S.settings.home)&&S.view==='home'&&S.settings.home!=='home')S.view=S.settings.home;
  render();
  // آدرس برنامه برای لینک ایمیل و تقویم
  if(!S.backendOld&&/^https:/.test(location.protocol)&&S.settings.appUrl!==appBase())saveSettings({appUrl:appBase()});
}
function appBase(){return location.origin+location.pathname;}
function mergeSettings(d){
  const s={atom:25,focus:3,gcalDefault:true,home:'home',staleDays:7,appUrl:''};if(!d)return s;
  if(Number(d.atom)>0)s.atom=Number(d.atom);if(Number(d.focus)>0)s.focus=Number(d.focus);
  if(d.gcalDefault===false)s.gcalDefault=false;
  if(HOMES.some(h=>h[0]===d.home))s.home=d.home;
  if(Number(d.staleDays)>0)s.staleDays=Number(d.staleDays);
  if(typeof d.appUrl==='string')s.appUrl=d.appUrl;
  return s;
}
function fixFilter(){if(S.filter!=='all'&&(!S.domains[S.filter]||S.domains[S.filter].archived))S.filter='all';if(!S.domains[S.capDom]||S.domains[S.capDom].archived)S.capDom=firstDom();}
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

/* ================= task ops ================= */
function newTask(o){
  return Object.assign({id:uid(),title:'',domain:S.capDom||firstDom(),projectId:'',minutes:null,priority:2,plan:'',due:'',note:'',
    status:'todo',doneDay:'',doneAt:'',triaged:true,createdAt:new Date().toISOString(),order:Date.now(),assignee:''},o);
}
function toggle(id){
  const t=S.tasks[id];if(!t)return;const d=isOpen(t);
  put('tasks',Object.assign({},t,{status:d?'done':'todo',doneDay:d?today():'',doneAt:d?new Date().toISOString():''}));
  if(d&&t.projectId){const n=pTasks(t.projectId).find(x=>x.id!==id&&isOpen(x));const p=S.projects[t.projectId];
    if(n)toast('گام بعدی: '+n.title);else if(p&&p.status==='active')toast('پروژه گام بعدی ندارد؛ یکی تعریف کن.');}
}
function plan(id,k){const t=S.tasks[id];if(t)put('tasks',Object.assign({},t,{plan:k,triaged:true}));}
function move(id,dir){
  const t=S.tasks[id];if(!t)return;const list=pTasks(t.projectId);const i=list.findIndex(x=>x.id===id),j=i+dir;
  if(i<0||j<0||j>=list.length)return;
  const ord=list.map((x,k)=>k*10);const tmp=ord[i];ord[i]=ord[j];ord[j]=tmp;
  list.forEach((x,k)=>{if((x.order||0)!==ord[k])put('tasks',Object.assign({},S.tasks[x.id],{order:ord[k]}));});
}

/* ================= shell render ================= */
function counts(){
  const td=today();
  return {today:MT().filter(t=>isOpen(t)&&t.plan===td).length,inbox:T().filter(isInbox).length,review:wdi(td)===0?TP().filter(p=>!(p.progressAt>=weekStart(td))).length:0};
}
function renderNav(){
  const c=counts();
  const badge=k=>k==='inbox'&&c.inbox?`<span class="bdg">${fa(c.inbox)}</span>`:k==='review'&&c.review?`<span class="bdg">${fa(c.review)}</span>`:'';
  const cur=S.view==='project'?'projects':S.view;
  $('#bnav').innerHTML=NAV.map(([k,l,i])=>`<button type="button" data-act="go" data-v="${k}" ${cur===k?'aria-current="page"':''}>${ic(i)}<span>${l}</span>${badge(k)}</button>`).join('');
  $('#side').innerHTML=`<div class="brand"><img src="icons/icon.svg" alt=""><div class="nm"><b>Xerxes</b><span>مدیریت و برنامه‌ریزی</span></div></div>
    <button class="btn primary addbtn" type="button" data-act="quick">${ic('plus')}افزودن</button>
    ${NAV.map(([k,l,i])=>`<button class="navbtn" type="button" data-act="go" data-v="${k}" ${cur===k?'aria-current="page"':''}>${ic(i)}${l}${badge(k)}</button>`).join('')}
    <div class="sep"></div>
    ${NAV2.map(([k,l,i])=>`<button class="navbtn" type="button" data-act="go" data-v="${k}" ${S.view===k?'aria-current="page"':''}>${ic(i)}${l}${badge(k)}</button>`).join('')}
    <button class="navbtn" type="button" data-act="settings">${ic('gear')}تنظیمات</button>
    <div class="foot"><span class="lbl">${hasConn()?'Google Sheet':'وصل نیست'}</span></div>`;
  $('#fab').innerHTML=ic('plus');
  $('#menubtn').innerHTML=ic('menu');
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
function filterChips(){
  const ds=doms();if(ds.length<2)return '';
  return `<div class="chips">${[['all','همه',null]].concat(ds.map(d=>[d.id,d.name,d.id])).map(([k,l,id])=>`<button type="button" class="chip" data-act="filter" data-v="${k}" aria-pressed="${S.filter===k}">${id?`<i class="dot" style="background:${col(id)}"></i>`:''}${esc(l)}</button>`).join('')}</div>`;
}
function render(){
  const ae=document.activeElement;const f=ae&&ae.id&&!ae.closest('#sheet')?{id:ae.id,s:ae.selectionStart,e:ae.selectionEnd}:null;
  renderNav();renderSync();
  const v=$('#view');
  if(!hasConn()||badToken){v.innerHTML=vConnect();return;}
  if(!S.loaded){v.innerHTML='<div class="empty">در حال بارگذاری…</div>';return;}
  const fn={home:vHome,today:vToday,plan:vPlan,projects:vProjects,project:vProject,people:vPeople,personal:vPersonal,inbox:vInbox,review:vReview,domains:vDomains}[S.view]||vHome;
  v.innerHTML=(S.backendOld?`<div class="warnbar">${ic('alert')}<span>بک‌اند Apps Script نسخهٔ ۴ نیست؛ افراد، ارزیابی‌ها و فیلدهای تازهٔ پروژه ذخیره نمی‌شوند. Code.gs تازه را جایگزین کن، setupToken را اجرا کن و نسخهٔ جدید Deploy کن.</span></div>`:'')+fn();
  if(f){const el=document.getElementById(f.id);if(el&&el!==document.activeElement){el.focus();try{if(f.s!=null)el.setSelectionRange(f.s,f.e);}catch(e){}}}
}

/* ================= task row ================= */
function row(t,o){
  o=o||{};const td=today();const a=atom(t);const p=t.projectId&&S.projects[t.projectId];const open=isOpen(t);
  const m=[];
  if(!o.noDom)m.push(dm(t.domain));
  if(p&&!o.noProject)m.push(`<span>${esc(p.title)}</span>`);
  if(t.assignee)m.push(`<span class="ic who">${ic('user')}${esc(who(t.assignee))}</span>`);
  if(t.minutes)m.push(`<span class="ic">${ic('clock')}${mins(t.minutes)}</span>`);
  if(open&&a.lvl==='bad')m.push(`<button type="button" class="tag crit" data-act="split">${ic('split')}${a.txt}</button>`);
  else if(open&&a.lvl==='warn')m.push(`<button type="button" class="tag warn" data-act="split">${ic('alert')}${a.txt}</button>`);
  else if(open&&a.lvl==='none')m.push(`<span class="tag">${a.txt}</span>`);
  if(t.priority===1&&open)m.push(`<span class="tag crit">${ic('alert')}فوری</span>`);
  if(t.due)m.push(`<span class="${open&&t.due<td?'late':''}">سررسید ${rel(t.due)}</span>`);
  if(t.plan&&o.showPlan)m.push(`<span class="${open&&t.plan<td?'late':''}">روز: ${rel(t.plan)}</span>`);
  const acts=[];
  if(o.move)acts.push(`<button class="iconbtn" type="button" data-act="up" aria-label="بالا">${ic('up')}</button><button class="iconbtn" type="button" data-act="down" aria-label="پایین">${ic('down')}</button>`);
  if(open){
    if(t.plan!==td)acts.push(`<button class="iconbtn acc" type="button" data-act="today" aria-label="به امروز" title="به امروز">${ic('sun')}</button>`);
    else acts.push(`<button class="iconbtn" type="button" data-act="tomorrow" aria-label="به فردا" title="به فردا">${ic('next')}</button>`);
  }
  return `<div class="task ${open?'':'done'}" data-id="${t.id}">
    <button class="chk" type="button" data-act="toggle" aria-label="${open?'علامت انجام‌شده':'برگرداندن'}">${ic('check','stroke-width="3"')}</button>
    <div class="t-main" data-act="edit"><div class="t-title">${esc(t.title)}</div><div class="t-meta">${m.join('')}</div></div>
    <div class="t-acts">${acts.join('')}</div></div>`;
}
function list(items,o,emptyTxt){return `<div class="list">${items.length?items.map(t=>row(t,o)).join(''):`<div class="empty">${emptyTxt||'چیزی نیست.'}</div>`}</div>`;}
function mini(t){
  const p=t.projectId&&S.projects[t.projectId];
  return `<div class="mini ${isOpen(t)?'':'done'}" data-id="${t.id}" draggable="true">
    <button class="chk" type="button" data-act="toggle" aria-label="انجام شد">${ic('check','stroke-width="3"')}</button>
    <i class="dot" style="background:${col(t.domain)}"></i>
    <span class="tt" data-act="edit" title="${esc(p?p.title:'')}">${esc(t.title)}</span>
    ${t.minutes?`<span class="m">${fa(t.minutes)}د</span>`:''}</div>`;
}
function miniEv(e,k){
  return `<button type="button" class="mini ev" data-act="evedit" data-eid="${e.id}">${ic(EVT[e.type]?EVT[e.type].i:'flag')}<span class="tt">${esc(e.title)}<br><span class="m">${evLabel(e,k)}</span></span>${e.domain?`<i class="dot" style="background:${col(e.domain)}"></i>`:''}</button>`;
}

/* ================= shared charts ================= */
function periodRange(p){
  const td=today();
  if(p==='today')return {from:td,to:td,label:'امروز',days:1};
  if(p==='month'){const m=jMonth(0);return {from:m.first,to:m.last,label:fMY.format(parse(td)),days:m.days,month:m};}
  const ws=weekStart(td);return {from:ws,to:addDays(ws,6),label:'این هفته',days:7};
}
function inR(k,R){return k&&k>=R.from&&k<=R.to;}
function bulletsHtml(R,mode,dlist){
  const all=T().filter(t=>t.triaged!==false);
  const rows=(dlist||doms()).map(d=>{
    const pl=all.filter(t=>t.domain===d.id&&inR(t.plan,R)).reduce((s,t)=>s+w(t),0);
    const dn=all.filter(t=>t.domain===d.id&&!isOpen(t)&&inR(t.doneDay,R)).reduce((s,t)=>s+w(t),0);
    const bud=mode==='today'?0:Math.round((d.budget||0)*60*R.days/7);
    return {d,pl,dn,bud};
  });
  if(!rows.length)return '<div class="empty">حوزه‌ای تعریف نشده.</div>';
  const max=Math.max(60,...rows.map(r=>Math.max(r.pl,r.dn,r.bud)));
  return `<div class="bul">${rows.map(r=>{const c=col(r.d.id);const tip=`${r.d.name}\nانجام: ${hm(r.dn)}\nبرنامه: ${hm(r.pl)}${r.bud?`\nبودجه: ${hm(r.bud)}`:''}`;
    return `<div class="row" data-tip="${esc(tip)}"><span class="nm"><i class="dot" style="background:${c}"></i><span>${esc(r.d.name)}</span></span>
    <div class="bar"><span class="pl" style="width:${r.pl/max*100}%;background:${c}"></span><span class="dn" style="width:${r.dn/max*100}%;background:${c}"></span>${r.bud?`<span class="bg" style="right:calc(${r.bud/max*100}% - 1px)"></span>`:''}</div>
    <span class="v ${r.bud&&r.pl>r.bud?'late':''}">${hm(r.dn)} / ${hm(r.bud||r.pl)}</span></div>`;}).join('')}</div>
    <div class="chartkey"><span><i class="sw" style="background:var(--ink2);opacity:.28"></i>برنامه</span><span><i class="sw" style="background:var(--ink2)"></i>انجام‌شده</span>${mode==='today'?'':'<span><i style="width:2px;height:12px;background:var(--ink2);display:inline-block"></i>بودجهٔ ساعت</span>'}</div>`;
}
function soonBanner(){
  const td=today();const now=new Date();const nm=now.getHours()*60+now.getMinutes();
  const soon=eventsOn(td,true).filter(e=>{if(!e.time)return false;const a=e.time.split(':').map(Number);const s=a[0]*60+(a[1]||0);const win=Math.max(60,(e.remind>0&&e.remind<1440)?e.remind:60);return s>=nm&&s-nm<=win;});
  return soon.map(e=>`<button type="button" class="warnbar" style="width:100%;border:0;background:var(--accent-soft);text-align:start" data-act="evedit" data-eid="${e.id}">${ic('bell','style="color:var(--accent)"')}<span><b>${esc(e.title)}</b> · ساعت ${faTime(e.time)}</span></button>`).join('');
}
/* ================= PORTFOLIO (سبد پروژه‌ها) ================= */
function ownerChips(){
  const ps=people();if(!ps.length)return '';
  const items=[['all','همه'],['me','خودم']].concat(ps.map(p=>[p.id,p.name]));
  return `<div class="chips" role="group" aria-label="فیلتر مسئول">${items.map(([k,l])=>`<button type="button" class="chip" data-act="pfown" data-v="${k}" aria-pressed="${S.pf.owner===k}">${k!=='all'?ic('user','style="width:14px;height:14px"'):''}${esc(l)}</button>`).join('')}</div>`;
}
function byOwner(p){const o=S.pf.owner;return o==='all'||(o==='me'?!p.owner:p.owner===o);}
function kpi(n,label,icon,go,tone){return `<button type="button" class="tile ${n?'':'zero'}" data-act="go" data-v="${go}"><div class="ti"><b>${fa(n)}</b>${ic(icon,`style="color:${tone}"`)}</div><span>${label}</span></button>`;}
const HKEYS=['g','y','r','n'];
function hname(k){return HEALTH[k]?HEALTH[k].n:'ارزیابی نشده';}
function healthBar(ps){
  const c={g:0,y:0,r:0,n:0};ps.forEach(p=>{c[HEALTH[p.health]?p.health:'n']++;});
  if(!ps.length)return '<div class="empty">پروژهٔ فعالی نیست.</div>';
  const seg=HKEYS.filter(k=>c[k]).map(k=>`<i class="hs hs-${k}" style="flex:${c[k]}" data-tip="${esc(hname(k)+': '+fa(c[k])+' پروژه')}"></i>`).join('');
  const leg=HKEYS.map(k=>`<div class="row ${c[k]?'':'zero'}"><span class="hp hp-${k}">${HEALTH[k]?ic(HEALTH[k].i):''}${hname(k)}</span><span class="v">${fa(c[k])}</span></div>`).join('');
  return `<div class="hbar" role="img" aria-label="${esc(HKEYS.map(k=>hname(k)+' '+c[k]).join('، '))}">${seg}</div><div class="hleg">${leg}</div>`;
}
function bulletRows(ps){
  if(!ps.length)return '<div class="empty">پروژهٔ فعالی نیست.</div>';
  const rows=ps.map(p=>({p,pg:prog(p),ex:expected(p)})).sort((a,b)=>{
    if((a.pg===null)!==(b.pg===null))return a.pg===null?1:-1;
    const ga=a.pg===null||a.ex===null?0:a.pg-a.ex,gb=b.pg===null||b.ex===null?0:b.pg-b.ex;return ga-gb;});
  return `<div class="pbul"><div class="brow axis" aria-hidden="true"><span class="nm"></span><span class="ticks"><span style="right:0">۰٪</span><span style="right:50%">۵۰٪</span><span style="right:100%">۱۰۰٪</span></span><span class="v"></span></div>
  ${rows.map(({p,pg,ex})=>{
    const tip=`${p.title}\nمسئول: ${who(p.owner)}\nپیشرفت: ${pg===null?'ارزیابی نشده':fa(pg)+'٪'}${ex!==null?'\nانتظار بر اساس زمان: '+fa(ex)+'٪':'\nددلاین ندارد'}${p.progressAt?'\nارزیابی: '+rel(p.progressAt):''}`;
    const behind=pg!==null&&ex!==null&&pg<ex-20;
    return `<button type="button" class="brow" data-act="openproj" data-v="${p.id}" data-tip="${esc(tip)}">
      <span class="nm"><b>${esc(p.title)}</b><small>${esc(who(p.owner))}</small></span>
      <span class="tr">${pg!==null&&pg>0?`<i class="fl" style="width:${pg}%"></i>`:''}${ex!==null?`<i class="ex" style="right:calc(${ex}% - 1px)"></i>`:''}</span>
      <span class="v">${pg===null?'<span class="muted">ارزیابی نشده</span>':`<b class="${behind?'late':''}">${fa(pg)}٪</b>`}${ex!==null?`<small>انتظار ${fa(ex)}٪</small>`:''}</span></button>`;}).join('')}</div>
  <div class="chartkey"><span><i class="sw" style="background:var(--accent)"></i>پیشرفت ارزیابی‌شده</span><span><i class="tk"></i>پیشرفت مورد انتظار بر اساس زمان سپری‌شده</span></div>`;
}
const fMon=(()=>{try{return new Intl.DateTimeFormat('fa-IR-u-ca-persian',{month:'long'});}catch(e){return {format:d=>key(d).slice(5,7)};}})();
function gantt(ps){
  if(!ps.length)return '<div class="empty">پروژهٔ فعالی نیست.</div>';
  const td=today();
  let from=addDays(td,-21),to=addDays(td,75);
  ps.forEach(p=>{const st=pStart(p);if(st<from)from=st;if(p.deadline&&p.deadline>to)to=p.deadline;});
  if(diff(from,td)>240)from=addDays(td,-240);
  if(diff(td,to)>420)to=addDays(td,420);
  from=addDays(from,-3);to=addDays(to,7);
  const span=diff(from,to);const pos=k=>Math.max(0,Math.min(100,diff(from,k)/span*100));
  const ticks=[];for(let k=from;k<=to;k=addDays(k,1))if(jp(k).d===1)ticks.push(k);
  const step=ticks.length>7?Math.ceil(ticks.length/7):1;
  const now=pos(td);
  const lines=ticks.map(k=>`<i class="gl" style="right:${pos(k)}%"></i>`).join('')+`<i class="gn" style="right:${now}%"></i>`;
  const head=ticks.map((k,i)=>i%step===0?`<span class="gm" style="right:${pos(k)}%">${fMon.format(parse(k))}</span>`:'').join('');
  const rows=ps.slice().sort((a,b)=>String(a.deadline||'9999').localeCompare(String(b.deadline||'9999'))).map(p=>{
    const st=pStart(p),en=p.deadline||to,a=pos(st),b=pos(en),w=Math.max(1.5,b-a),pg=prog(p);
    const late=p.deadline&&p.deadline<td;
    const tip=`${p.title}\n${jd(st)} تا ${p.deadline?jd(p.deadline):'بدون ددلاین'}${late?'\nددلاین گذشته':''}\nپیشرفت: ${pg===null?'ارزیابی نشده':fa(pg)+'٪'}`;
    return `<button type="button" class="grow" data-act="openproj" data-v="${p.id}" data-tip="${esc(tip)}"><span class="nm">${esc(p.title)}${p.deadline?'':' <small>بدون ددلاین</small>'}</span>
      <span class="gt">${lines}<i class="gb ${p.deadline?'':'open'} ${late?'late':''}" style="right:${a}%;width:${w}%">${pg?`<i class="gp" style="width:${pg}%"></i>`:''}</i></span></button>`;}).join('');
  return `<div class="gantt"><div class="grow ghead" aria-hidden="true"><span class="nm"></span><span class="gt">${head}<span class="gnl" style="right:${now}%">امروز</span></span></div>${rows}</div>
    <div class="chartkey"><span><i class="sw"></i>شروع تا ددلاین</span><span><i class="sw" style="background:var(--accent)"></i>بخش انجام‌شده</span><span><i class="tk"></i>امروز</span><span><i class="sw late"></i>ددلاین گذشته</span></div>`;
}
function vHome(){
  const td=today();const all=TP();const ps=all.filter(byOwner);
  const att=ps.map(p=>({p,f:flagsOf(p)})).filter(x=>x.f.length)
    .sort((a,b)=>b.f.filter(x=>x.lvl==='crit').length-a.f.filter(x=>x.lvl==='crit').length||b.f.length-a.f.length);
  const lim=S.settings.staleDays||7;
  const stale=ps.filter(p=>{const a=assessAge(p);return a===null||a>=lim;}).length;
  const soon=ps.filter(p=>p.deadline&&diff(td,p.deadline)<=14).length;
  const ws=weekStart(td);const pendingRv=all.filter(p=>!(p.progressAt>=ws)).length;
  const banner=wdi(td)===0&&pendingRv?`<button type="button" class="warnbar rvbar" data-act="go" data-v="review">${ic('review')}<span><b>امروز روز بازبینی هفتگی است.</b> ${fa(pendingRv)} پروژه منتظر ارزیابی است.</span></button>`:'';
  const empty=!TPall().length?`<div class="card" style="margin-bottom:14px"><h2>شروع</h2><p class="muted" style="margin:0 0 12px;font-size:13.5px">هنوز پروژهٔ تیمی ثبت نشده. اول اعضای تیم را در «افراد» اضافه کن، بعد پروژه‌ها را با مسئولشان بساز.</p><div class="pacts"><button class="btn primary" type="button" data-act="newproj">${ic('plus')}پروژهٔ تیمی</button><button class="btn" type="button" data-act="newperson">${ic('user')}افزودن فرد</button></div></div>`:'';
  return `<div class="pagehead"><div class="grow"><h1>سبد پروژه‌ها</h1><span class="sub">${fullDate(td)}</span></div><button class="btn primary" type="button" data-act="newproj">${ic('plus')}پروژه</button></div>
  ${soonBanner()}${banner}${empty}${ownerChips()}
  <div class="dash">
    <section class="span12"><div class="tiles k4">${kpi(ps.length,'پروژهٔ فعال','proj','projects','var(--accent)')}${kpi(att.length,'نیازمند توجه','alert','projects','var(--critical)')}${kpi(stale,'ارزیابی کهنه یا نشده','clock','review','#b77e00')}${kpi(soon,'ددلاین تا ۱۴ روز','flag','projects','var(--ink2)')}</div></section>
    <section class="card span5"><h2>سلامت سبد <span class="n">${fa(ps.length)} پروژه</span></h2>${healthBar(ps)}</section>
    <section class="card span7"><h2>نیازمند توجه <span class="n">${fa(att.length)}</span></h2>${att.length?`<div class="agenda">${att.slice(0,7).map(x=>{const crit=x.f.some(f=>f.lvl==='crit');return `<button type="button" class="ag" data-act="openproj" data-v="${x.p.id}"><span class="ei ${crit?'crit':''}">${ic(crit?'alert':'info')}</span><span class="ex"><b>${esc(x.p.title)} <small class="who2">· ${esc(who(x.p.owner))}</small></b><span class="flags in">${flagTags(x.f)}</span></span></button>`;}).join('')}${att.length>7?`<button type="button" class="more2" data-act="go" data-v="projects">${fa(att.length-7)} مورد دیگر</button>`:''}</div>`:'<div class="empty">هشداری نیست؛ همهٔ پروژه‌ها ارزیابی تازه دارند.</div>'}</section>
    <section class="card span12"><h2>پیشرفت در برابر زمان <span class="n">عقب‌مانده‌ترین در بالا</span></h2>${bulletRows(ps)}</section>
    <section class="card span12"><h2>خط زمانی</h2>${gantt(ps)}</section>
  </div>`;
}

/* ================= TEAM PROJECTS ================= */
function vProjects(){
  const st=S.pf.status;const q=norm(S.psearch).trim();
  const all=TPall().filter(byOwner);
  const ps=all.filter(p=>(p.status||'active')===st).filter(p=>!q||norm([p.title,p.desc,p.goal,p.stakeholder,who(p.owner)].join(' ')).includes(q))
    .sort((a,b)=>(a.priority||2)-(b.priority||2)||String(a.deadline||'9').localeCompare(String(b.deadline||'9')));
  const cnt=k=>all.filter(p=>(p.status||'active')===k).length;
  const seg=`<div class="seg" role="group" aria-label="وضعیت">${[['active','فعال'],['paused','متوقف'],['done','آرشیو']].map(([k,l])=>`<button type="button" data-act="pfst" data-v="${k}" aria-pressed="${st===k}">${l} <span class="muted">${fa(cnt(k))}</span></button>`).join('')}</div>`;
  return `<div class="pagehead"><div class="grow"><h1>پروژه‌های تیم</h1><span class="sub">پروژه‌های حوزه‌های شخصی در تب «شخصی» هستند.</span></div><button class="btn primary" type="button" data-act="newproj">${ic('plus')}پروژه</button></div>
  <div class="toolbar">${seg}<label class="search">${ic('search')}<input type="search" id="psearch" placeholder="جستجو در نام، توضیح، ذینفع، مسئول…" value="${esc(S.psearch)}" aria-label="جستجوی پروژه"></label></div>
  ${ownerChips()}
  <div class="list">${ps.length?ps.map(prow).join(''):`<div class="empty">${q?'نتیجه‌ای پیدا نشد.':st==='done'?'پروژهٔ آرشیوشده‌ای نیست. پروژهٔ تمام‌شده را با وضعیت «تمام‌شده» آرشیو کن.':'پروژه‌ای در این وضعیت نیست.'}</div>`}</div>`;
}
function mbar(pg,ex){return `<span class="mbar">${pg?`<i style="width:${pg}%"></i>`:''}${ex!==null&&ex!==undefined?`<b style="right:calc(${ex}% - 1px)"></b>`:''}</span>`;}
function prow(p){
  const pg=prog(p),ex=(p.status||'active')==='active'?expected(p):null,f=(p.status||'active')==='active'?flagsOf(p).filter(x=>x.k!=='never'):[];
  const meta=[`<span class="ic">${ic('user')}${esc(who(p.owner))}</span>`];
  if(p.type)meta.push(`<span>${PTYPE_N[p.type]||''}</span>`);
  if(p.deadline)meta.push(`<span>ددلاین ${jd(p.deadline)}</span>`);
  const open=pTasks(p.id).filter(isOpen).length;if(open)meta.push(`<span>${fa(open)} گام باز</span>`);
  return `<button type="button" class="prow" data-act="openproj" data-v="${p.id}">
    <span class="pm"><b>${p.priority===1?'<span class="tag crit">اولویت بالا</span> ':''}${esc(p.title)}</b><span class="t-meta">${meta.join('')}</span>${f.length?`<span class="flags in">${flagTags(f)}</span>`:''}</span>
    <span class="pr">${mbar(pg,ex)}<span class="pv">${pg===null?'—':fa(pg)+'٪'}</span>${hpill(p.health)}</span></button>`;
}

/* ================= PROJECT DETAIL ================= */
function assessForm(p){
  const pg=prog(p);const h=S.ah[p.id]!==undefined?S.ah[p.id]:(p.health||'');
  const v=S.ar[p.id]!==undefined?S.ar[p.id]:(pg===null?0:pg);const nk='an-'+p.id;
  return `<div class="assess" data-pid="${p.id}">
    <div class="arow"><label for="ar-${p.id}">پیشرفت</label><input type="range" class="arange" id="ar-${p.id}" data-pid="${p.id}" min="0" max="100" step="5" value="${v}"><output id="ao-${p.id}">${fa(v)}٪</output></div>
    <div class="hbtns" role="group" aria-label="سلامت پروژه">${['g','y','r'].map(k=>`<button type="button" class="hp hp-${k}" data-act="ah" data-v="${k}" aria-pressed="${h===k}">${ic(HEALTH[k].i)}${HEALTH[k].n}</button>`).join('')}</div>
    <div class="arow2"><input type="text" id="${nk}" data-draft="${nk}" value="${esc(S.drafts[nk]||'')}" placeholder="یک خط یادداشت (اختیاری): چه شد، چه مانعی هست؟" aria-label="یادداشت ارزیابی"><button class="btn primary" type="button" data-act="asave">ثبت ارزیابی</button></div></div>`;
}
function spark(p){
  const us=pUpdates(p.id).filter(u=>u.progress!==null&&u.progress!==''&&!isNaN(Number(u.progress)));
  if(us.length<2)return `<div class="empty">${us.length?'با ارزیابی بعدی، روند اینجا رسم می‌شود.':'هنوز ارزیابی‌ای ثبت نشده.'}</div>`;
  const W=600,H=170,pl=10,pr=40,pt=12,pb=28;
  let a=us[0].date,b=us[us.length-1].date;if(today()>b)b=today();const st=pStart(p);
  const span=Math.max(1,diff(a,b));
  const X=k=>W-pr-(W-pl-pr)*diff(a,k)/span; // راست‌به‌چپ: قدیمی در راست
  const Y=v=>pt+(H-pt-pb)*(1-v/100);
  const grid=[0,50,100].map(v=>`<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}" class="sg"/><text x="${W-pr+8}" y="${Y(v)+4}" class="st">${fa(v)}٪</text>`).join('');
  let exl='';
  if(p.deadline){const tot=diff(st,p.deadline);if(tot>0){const ev=k=>Math.max(0,Math.min(100,diff(st,k)/tot*100));exl=`<line x1="${X(a)}" y1="${Y(ev(a))}" x2="${X(b)}" y2="${Y(ev(b))}" class="sx"/>`;}}
  const d=us.map((u,i)=>`${i?'L':'M'}${X(u.date).toFixed(1)} ${Y(Number(u.progress)).toFixed(1)}`).join(' ');
  const dots=us.map(u=>`<circle cx="${X(u.date).toFixed(1)}" cy="${Y(Number(u.progress)).toFixed(1)}" r="4.5" class="sd" data-tip="${esc(jd(u.date)+'\n'+fa(u.progress)+'٪ · '+hname(u.health||'n')+(u.note?'\n'+u.note:''))}"/>`).join('');
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="روند پیشرفت در ${fa(us.length)} ارزیابی">${grid}${exl}<path d="${d}" class="sl"/>${dots}
    <text x="${W-pr}" y="${H-6}" class="st" text-anchor="end">${jd(a)}</text><text x="${pl}" y="${H-6}" class="st" text-anchor="start">${jd(b)}</text></svg>
    <div class="chartkey"><span><i class="sw" style="background:var(--accent);height:3px"></i>پیشرفت ارزیابی‌شده</span>${exl?'<span><i class="sw" style="background:var(--faint);height:2px"></i>مسیر مورد انتظار تا ددلاین</span>':''}</div>`;
}
function vProject(){
  const p=S.projects[S.pid];
  if(!p)return `<div class="empty">پروژه پیدا نشد.</div><div style="text-align:center"><button class="btn" type="button" data-act="go" data-v="projects">بازگشت به پروژه‌ها</button></div>`;
  const pg=prog(p),ex=expected(p),f=(p.status||'active')==='active'?flagsOf(p):[],ts=pTasks(p.id),us=pUpdates(p.id).slice().reverse();
  const dk='add-'+p.id;
  const links=String(p.links||'').split('\n').map(x=>x.trim()).filter(Boolean);
  const kvb=(l,v)=>v?`<div class="kv col"><span>${l}</span><b>${v}</b></div>`:'';
  const kv=(l,v)=>v?`<div class="kv"><span>${l}</span><b>${v}</b></div>`:'';
  const status={active:'فعال',paused:'متوقف',done:'تمام‌شده'}[p.status||'active'];
  return `<div class="pagehead"><button class="iconbtn" type="button" data-act="go" data-v="${isTeam(p.domain)?'projects':'personal'}" aria-label="بازگشت">${ic('back')}</button><div class="grow"><h1>${esc(p.title)}</h1><span class="sub">${dm(p.domain)} · ${status}${p.type?' · '+PTYPE_N[p.type]:''} · مسئول: ${esc(who(p.owner))}</span></div><button class="btn" type="button" data-act="peditid" data-v="${p.id}">${ic('edit')}ویرایش</button></div>
  ${f.length?`<div class="flags" style="margin:-4px 0 14px">${flagTags(f)}</div>`:''}
  <div class="grid2"><div>
    <section class="card"><h2>وضعیت فعلی ${hpill(p.health)}<span class="n" style="margin-inline-start:auto">${p.progressAt?'ارزیابی '+rel(p.progressAt):''}</span></h2>
      <div class="bignum"><b>${pg===null?'—':fa(pg)+'٪'}</b><span>${ex!==null?'انتظار بر اساس زمان سپری‌شده: '+fa(ex)+'٪':'برای محاسبهٔ پیشرفت مورد انتظار، ددلاین تعیین کن.'}</span></div>
      <div class="pbul solo">${mbar(pg,ex)}</div>
      <h2 style="margin-top:18px">ارزیابی تازه</h2>${assessForm(p)}</section>
    <section class="card" style="margin-top:14px"><h2>روند پیشرفت</h2>${spark(p)}</section>
    <div class="section" data-pid="${p.id}"><h2>گام‌ها <span class="n">${fa(ts.filter(isOpen).length)} باز از ${fa(ts.length)}</span></h2>
      <div class="list">${ts.length?ts.map(t=>row(t,{noProject:true,noDom:true,move:true,showPlan:true})).join(''):'<div class="empty">گامی ثبت نشده؛ برای پروژه‌های تیم اختیاری است.</div>'}
      <div class="addrow"><input type="text" id="${dk}" data-draft="${dk}" data-enter="padd" placeholder="گام جدید… (@نام = انجام‌دهنده)" value="${esc(S.drafts[dk]||'')}" aria-label="عنوان گام جدید"><button class="btn primary" type="button" data-act="padd">افزودن</button></div></div></div>
  </div><div>
    <section class="card"><h2>شناسنامه</h2>
      ${kvb('انجام‌شده یعنی',esc(p.goal||''))}${kvb('توضیح و هدف',esc(p.desc||''))}${kv('ذینفع',esc(p.stakeholder||''))}${kvb('معیار توقف',esc(p.stopRule||''))}
      ${kv('شروع',jd(pStart(p)))}${kv('ددلاین',p.deadline?jd(p.deadline)+' · '+(diff(today(),p.deadline)<0?fa(-diff(today(),p.deadline))+' روز گذشته':fa(diff(today(),p.deadline))+' روز مانده'):'تعیین نشده')}${kv('اولویت',PRIO_N[p.priority]||'معمول')}
      ${links.length?`<div class="kv col"><span>لینک‌ها</span><span class="links">${links.map(l=>/^https?:\/\//.test(l)?`<a href="${esc(l)}" target="_blank" rel="noopener" dir="ltr">${ic('link')}${esc(l.replace(/^https?:\/\//,'').slice(0,48))}</a>`:`<span>${esc(l)}</span>`).join('')}</span></div>`:''}
      ${!p.goal&&!p.desc&&!p.stakeholder?`<p class="muted" style="font-size:13px;margin:10px 0 0">هدف و ذینفع ثبت نشده. <button class="btn sm ghost" type="button" data-act="peditid" data-v="${p.id}">تکمیل شناسنامه</button></p>`:''}</section>
    <section class="card" style="margin-top:14px"><h2>تاریخچهٔ ارزیابی <span class="n">${fa(us.length)}</span></h2>${us.length?`<div class="hist">${us.slice(0,12).map(u=>`<div class="hrow"><span class="d">${jd(u.date)}</span><b>${u.progress===null||u.progress===''?'—':fa(u.progress)+'٪'}</b>${hpill(u.health)}${u.note?`<span class="nt">${esc(u.note)}</span>`:''}</div>`).join('')}</div>`:'<div class="empty">هنوز ارزیابی‌ای ثبت نشده.</div>'}</section>
  </div></div>`;
}
function saveAssess(pid,wrap){
  const p=S.projects[pid];if(!p)return;
  const r=wrap.querySelector('.arange');const n=wrap.querySelector('input[type=text]');
  const progress=Number(r.value);const health=S.ah[pid]!==undefined?S.ah[pid]:(p.health||'');
  if(!health){toast('سلامت پروژه را انتخاب کن.');return;}
  const td=today();const ex=Object.values(S.updates).find(u=>u.projectId===pid&&u.date===td);
  const note=(n&&n.value.trim())||'';
  delete S.ah[pid];delete S.ar[pid];delete S.drafts['an-'+pid];S.open.delete('rv-'+pid);
  put('updates',{id:ex?ex.id:uid(),projectId:pid,date:td,progress,health,note:note||(ex?ex.note:''),createdAt:ex?ex.createdAt:new Date().toISOString()});
  put('projects',Object.assign({},p,{progress,progressAt:td,health}));
  toast('ارزیابی ثبت شد');
}

/* ================= PEOPLE ================= */
function vPeople(){
  const ps=people(),inact=people(true).filter(p=>p.active===false);const td=today();
  const pc=(id,name,role,isMe)=>{
    const projs=TP().filter(p=>(p.owner||'')===id);
    const tasks=T().filter(t=>isOpen(t)&&t.triaged!==false&&(t.assignee||'')===id&&(!isMe||isTeam(t.domain)));
    const late=tasks.filter(t=>(t.due&&t.due<td)||(t.plan&&t.plan<td)).length;
    const x=isMe?null:S.people[id];const open=S.open.has('pp-'+id);
    return `<article class="pcard">
      <header><span class="av">${esc(String(name).trim().charAt(0)||'؟')}</span><div class="px"><b>${esc(name)}</b><span>${esc(role||'')}</span></div>${isMe?'':`<button class="iconbtn" type="button" data-act="editperson" data-v="${id}" aria-label="ویرایش ${esc(name)}">${ic('edit')}</button>`}</header>
      <div class="pstats"><span><b>${fa(projs.length)}</b> پروژهٔ فعال</span><span><b>${fa(tasks.length)}</b> گام باز${isMe?' (تیمی)':''}</span>${late?`<span class="late"><b>${fa(late)}</b> عقب‌افتاده</span>`:''}</div>
      ${projs.length?`<div class="pplist">${projs.map(p=>{const pg=prog(p);return `<button type="button" class="ppi" data-act="openproj" data-v="${p.id}"><span class="t">${esc(p.title)}</span>${mbar(pg,null)}<span class="pv">${pg===null?'—':fa(pg)+'٪'}</span>${hpill(p.health)}</button>`;}).join('')}</div>`:'<div class="muted" style="font-size:13px">مسئول پروژهٔ فعالی نیست.</div>'}
      ${tasks.length&&!isMe?`<div class="ptasks">${tasks.slice(0,4).map(t=>`<div class="mini" data-id="${t.id}" style="cursor:default"><button class="chk" type="button" data-act="toggle" aria-label="انجام شد">${ic('check','stroke-width="3"')}</button><span class="tt" data-act="edit">${esc(t.title)}</span>${t.due?`<span class="m ${t.due<td?'late':''}">${rel(t.due)}</span>`:''}</div>`).join('')}${tasks.length>4?`<span class="muted" style="font-size:12px">و ${fa(tasks.length-4)} گام دیگر</span>`:''}</div>`:''}
      ${x&&(x.skills||x.note)?`<button class="btn sm ghost" type="button" data-act="ppexpand" data-v="${id}">${open?'بستن':'مهارت‌ها و یادداشت'}</button>${open?`<div class="pnote">${x.skills?`<div class="kv col"><span>مهارت‌ها</span><b>${esc(x.skills)}</b></div>`:''}${x.note?`<div class="kv col"><span>یادداشت خصوصی</span><b>${esc(x.note)}</b></div>`:''}</div>`:''}`:''}
    </article>`;
  };
  return `<div class="pagehead"><div class="grow"><h1>افراد</h1><span class="sub">چه کسی مسئول چه پروژه‌ای است و چه گام‌هایی روی میزش دارد.</span></div><button class="btn primary" type="button" data-act="newperson">${ic('plus')}فرد</button></div>
  ${!ps.length?'<div class="warnbar">'+ic('info')+'<span>هنوز فردی اضافه نشده. اعضای تیم را اضافه کن تا بتوانی مسئول پروژه و انجام‌دهندهٔ گام تعیین کنی.</span></div>':''}
  <div class="pgrid">${pc('','خودم','مدیر تیم',true)}${ps.map(p=>pc(p.id,p.name,p.role)).join('')}</div>
  ${inact.length?`<div class="section"><h2>غیرفعال <span class="n">${fa(inact.length)}</span></h2><div class="list">${inact.map(p=>`<div class="drow"><span class="av">${esc(String(p.name).charAt(0))}</span><div class="dx"><b>${esc(p.name)}</b><span>${esc(p.role||'')}</span></div><button class="iconbtn" type="button" data-act="editperson" data-v="${p.id}" aria-label="ویرایش">${ic('edit')}</button></div>`).join('')}</div></div>`:''}`;
}
function savePerson(id){
  const name=val('x-name').trim();if(!name){toast('نام خالی است.');return;}
  const old=id?S.people[id]:null;
  put('people',Object.assign({},old||{id:uid(),order:Date.now(),createdAt:new Date().toISOString()},{name,role:val('x-role').trim(),skills:val('x-skills').trim(),note:val('x-note').trim(),active:old?checked('x-active'):true}));
  closeSheet();toast(old?'ذخیره شد':'فرد اضافه شد');
}

/* ================= PERSONAL ================= */
function vPersonal(){
  const ds=persDoms();const sel=S.pdom!=='all'&&ds.some(d=>d.id===S.pdom)?S.pdom:'all';
  const dl=sel==='all'?ds:ds.filter(d=>d.id===sel);
  const chips=ds.length>1?`<div class="chips">${[['all','همه',null]].concat(ds.map(d=>[d.id,d.name,d.id])).map(([k,l,id])=>`<button type="button" class="chip" data-act="pdom" data-v="${k}" aria-pressed="${sel===k}">${id?`<i class="dot" style="background:${col(id)}"></i>`:''}${esc(l)}</button>`).join('')}</div>`:'';
  const R=periodRange('week');
  const body=dl.map(d=>{
    const ts=MT().filter(t=>t.domain===d.id&&isOpen(t)&&t.triaged!==false&&!t.projectId).sort(byPrio);
    const ps=PR().filter(p=>p.domain===d.id&&(p.status||'active')!=='done');
    return `<div class="section"><h2><i class="dot" style="background:${col(d.id)}"></i>${esc(d.name)} <span class="n">${fa(ts.length)} کار · ${fa(ps.length)} پروژه</span><span style="margin-inline-start:auto"></span><button class="btn sm ghost" type="button" data-act="newtaskd" data-v="${d.id}">${ic('plus')}کار</button><button class="btn sm ghost" type="button" data-act="newprojd" data-v="${d.id}">${ic('plus')}پروژه</button></h2>
      ${ts.length?list(ts,{noDom:true,showPlan:true}):''}
      ${ps.length?`<div class="pgrid">${ps.map(card).join('')}</div>`:''}
      ${!ts.length&&!ps.length?'<div class="list"><div class="empty">چیزی ثبت نشده.</div></div>':''}</div>`;
  }).join('');
  return `<div class="pagehead"><div class="grow"><h1>شخصی</h1><span class="sub">حوزه‌های غیرتیمی؛ قاعدهٔ گام اتمی فقط اینجا فعال است.</span></div></div>
  ${chips}${ds.length?`<div class="card"><h2>تعادل این هفته <span class="n">انجام‌شده در برابر بودجهٔ ساعت</span></h2>${bulletsHtml(R,'week',dl)}</div>`:'<div class="empty">حوزهٔ شخصی‌ای تعریف نشده. از «حوزه‌ها» اضافه کن.</div>'}${body}`;
}

/* ================= TEAM REVIEW ================= */
function teamReview(){
  const td=today(),ws=weekStart(td);const ps=TP();
  if(!ps.length)return '';
  const done=ps.filter(p=>p.progressAt>=ws);
  const rows=ps.sort((a,b)=>(a.progressAt>=ws?1:0)-(b.progressAt>=ws?1:0)).map(p=>{
    const ok=p.progressAt>=ws;const pg=prog(p),ex=expected(p);
    if(ok&&!S.open.has('rv-'+p.id))return `<div class="rvrow ok"><span class="rvc">${ic('check','stroke-width="3"')}</span><button type="button" class="rvt" data-act="openproj" data-v="${p.id}"><b>${esc(p.title)}</b><span>${esc(who(p.owner))} · ${pg===null?'—':fa(pg)+'٪'}</span></button>${hpill(p.health)}<button class="btn sm ghost" type="button" data-act="rvopen" data-v="${p.id}">ویرایش</button></div>`;
    return `<div class="rvrow"><button type="button" class="rvt" data-act="openproj" data-v="${p.id}"><b>${esc(p.title)}</b><span>${esc(who(p.owner))} · آخرین: ${pg===null?'ارزیابی نشده':fa(pg)+'٪ · '+rel(p.progressAt)}${ex!==null?' · انتظار '+fa(ex)+'٪':''}</span></button>${assessForm(p)}</div>`;
  }).join('');
  return `<div class="card" style="grid-column:1/-1"><h2>ارزیابی پروژه‌های تیم <span class="n">${fa(done.length)} از ${fa(ps.length)} در این هفته</span></h2>
    <div class="prog" style="margin:0 0 12px" role="img" aria-label="${fa(done.length)} از ${fa(ps.length)}"><span style="width:${Math.round(done.length/ps.length*100)}%;background:var(--accent)"></span></div>
    <div class="rvlist">${rows}</div></div>`;
}

/* ================= TODAY ================= */
function vToday(){
  const td=today();const open=MT().filter(t=>isOpen(t)&&t.triaged!==false&&inF(t));
  const focus=open.filter(t=>t.plan===td).sort(byPrio);const fI=new Set(focus.map(t=>t.id));
  const late=open.filter(t=>!fI.has(t.id)&&((t.plan&&t.plan<td)||(t.due&&t.due<td))).sort(byPrio);const lI=new Set(late.map(t=>t.id));
  const soon=open.filter(t=>!fI.has(t.id)&&!lI.has(t.id)&&t.due&&diff(td,t.due)>=0&&diff(td,t.due)<=7).sort((a,b)=>a.due.localeCompare(b.due));const sI=new Set(soon.map(t=>t.id));
  const nexts=PR().filter(p=>p.status==='active'&&inF(p)).map(p=>nextMine(p.id)).filter(t=>t&&!fI.has(t.id)&&!lI.has(t.id)&&!sI.has(t.id)&&!(t.plan&&t.plan>td));
  const doneToday=MT().filter(t=>!isOpen(t)&&t.doneDay===td&&inF(t));
  const evs=eventsOn(td);
  const planned=focus.reduce((s,t)=>s+(t.minutes||0),0);const lim=S.settings.focus;
  const all=focus.concat(doneToday.filter(t=>t.plan===td&&!fI.has(t.id)));const dn=doneToday.filter(t=>t.plan===td).length;
  const pct=all.length?Math.round(dn/all.length*100):0;
  let warn='';
  if(focus.length>lim)warn=`<div class="warnbar">${ic('alert')}<span>${fa(focus.length)} کار برای امروز؛ سقف تمرکز ${fa(lim)} است. بقیه را به فردا بفرست.</span></div>`;
  else if(planned>360)warn=`<div class="warnbar">${ic('alert')}<span>${mins(planned)} کار برای امروز؛ بیش از ۶ ساعت کار عمیق واقع‌بینانه نیست.</span></div>`;
  return `<div class="pagehead"><div class="grow"><h1>امروزِ من</h1><span class="sub">${fullDate(today())}${planned?' · '+mins(planned)+' برنامه':''}</span></div></div>
  ${filterChips()}
  <div class="prog" style="margin:0 0 14px" role="img" aria-label="${fa(pct)} درصد"><span style="width:${pct}%;background:var(--accent)"></span></div>
  ${warn}
  <div class="grid2"><div>
    ${evs.length?`<div class="section" style="margin-top:0"><h2>رویدادها <span class="n">${fa(evs.length)}</span></h2><div class="card" style="padding:8px"><div class="agenda">${evs.map(e=>`<button type="button" class="ag" data-act="evedit" data-eid="${e.id}"><span class="ei" ${e.domain?`style="color:${col(e.domain)}"`:''}>${ic(EVT[e.type]?EVT[e.type].i:'flag')}</span><span class="ex"><b>${esc(e.title)}</b><span>${EVT[e.type]?EVT[e.type].n:''} · ${evLabel(e,td)}</span></span></button>`).join('')}</div></div></div>`:''}
    <div class="section" ${evs.length?'':'style="margin-top:0"'}><h2>تمرکز امروز <span class="n">${fa(focus.length)}</span></h2>${list(focus,{},'هنوز چیزی برای امروز انتخاب نشده. از «گام‌های بعدی» با دکمهٔ خورشید اضافه کن.')}</div>
    ${late.length?`<div class="section"><h2 style="color:var(--critical)">${ic('alert','style="width:16px;height:16px"')}عقب‌افتاده <span class="n">${fa(late.length)}</span></h2>${list(late,{showPlan:true})}</div>`:''}
    ${doneToday.length?`<div class="section"><h2>انجام‌شدهٔ امروز <span class="n">${fa(doneToday.length)}</span></h2>${list(doneToday,{})}</div>`:''}
  </div><div>
    <div class="section" style="margin-top:0"><h2>گام بعدیِ پروژه‌ها <span class="n">${fa(nexts.length)}</span></h2>${list(nexts,{},'هر پروژهٔ فعال اینجا گام بعدی‌اش را نشان می‌دهد.')}</div>
    <div class="section"><h2>سررسید ۷ روز آینده <span class="n">${fa(soon.length)}</span></h2>${list(soon,{showPlan:true},'ددلاین نزدیکی نیست.')}</div>
  </div></div>`;
}

/* ================= PLAN (week / month calendar) ================= */
function dayAgenda(k){
  const evs=eventsOn(k);const ts=T().filter(t=>t.plan===k&&t.triaged!==false&&inF(t)).sort((a,b)=>(isOpen(b)-isOpen(a))||byPrio(a,b));
  const m=ts.filter(isOpen).reduce((s,t)=>s+(t.minutes||0),0);
  return `<div class="card" style="margin-top:4px"><h2>${fullDate(k)}<span class="n">${m?mins(m):''}</span></h2>
    <div class="agenda">${evs.map(e=>`<button type="button" class="ag" data-act="evedit" data-eid="${e.id}"><span class="ei" ${e.domain?`style="color:${col(e.domain)}"`:''}>${ic(EVT[e.type]?EVT[e.type].i:'flag')}</span><span class="ex"><b>${esc(e.title)}</b><span>${EVT[e.type]?EVT[e.type].n:''} · ${evLabel(e,k)}${e.repeat&&e.repeat!=='none'?' · تکرارشونده':''}</span></span>${e.sync&&e.gcal&&e.gcal.length?`<span class="gs">${ic('gcal')}</span>`:''}</button>`).join('')}</div>
    ${ts.length?`<div class="list" style="margin-top:${evs.length?10:0}px">${ts.map(t=>row(t,{})).join('')}</div>`:''}
    ${!evs.length&&!ts.length?'<div class="empty">برای این روز چیزی ثبت نشده.</div>':''}
    <div class="mfoot" style="margin-top:12px"><button class="btn sm" type="button" data-act="newev" data-v="${k}">${ic('plus')}رویداد / یادآور</button><button class="btn sm ghost" type="button" data-act="newtask" data-v="${k}">${ic('plus')}کار برای این روز</button></div></div>`;
}
function vPlan(){
  const td=today();
  const seg=`<div class="seg" role="group">${[['week','هفته'],['month','ماه']].map(([k,l])=>`<button type="button" data-act="planmode" data-v="${k}" aria-pressed="${S.planMode===k}">${l}</button>`).join('')}</div>`;
  let head,body;
  if(S.planMode==='month'){
    const m=jMonth(S.monthOffset);if(!(S.selDay>=m.first&&S.selDay<=m.last))S.selDay=S.monthOffset===0?td:m.first;
    head=`${fMY.format(parse(m.first))}`;
    const lead=wdi(m.first);const all=T().filter(t=>t.triaged!==false&&inF(t));
    let cells=WD1.map(x=>`<div class="h">${x}</div>`).join('')+Array(lead).fill('<div class="mc blank"></div>').join('');
    for(let i=0;i<m.days;i++){const k=addDays(m.first,i);const evs=eventsOn(k);const ts=all.filter(t=>t.plan===k);
      cells+=`<button type="button" class="mc ${k===td?'today':''} ${wdi(k)===6?'off':''}" data-act="selday" data-v="${k}" aria-pressed="${S.selDay===k}" data-day="${k}">
        <span class="n"><span>${fa(jp(k).d)}</span>${ts.length?`<small>${fa(ts.filter(isOpen).length)}/${fa(ts.length)}</small>`:''}</span>
        <span class="evs">${evs.slice(0,3).map(e=>`<i style="${e.domain?`box-shadow:inset 3px 0 0 ${col(e.domain)}`:''}">${esc(e.title)}</i>`).join('')}</span>
        <span class="tk">${ts.slice(0,6).map(t=>`<b style="background:${col(t.domain)};opacity:${isOpen(t)?1:.35}"></b>`).join('')}</span></button>`;}
    body=`<div class="month">${cells}</div>${dayAgenda(S.selDay)}`;
    return planShell(seg,head,body);
  }
  const ws=addDays(weekStart(td),7*S.weekOffset);const days=[0,1,2,3,4,5,6].map(i=>addDays(ws,i));
  if(!days.includes(S.selDay))S.selDay=days.includes(td)?td:ws;
  head=`${jd(ws)} تا ${jd(days[6])}`;
  const all=T().filter(t=>t.triaged!==false&&inF(t));
  const strip=`<div class="daystrip m-only">${days.map(k=>{const n=eventsOn(k).length,tn=all.filter(t=>t.plan===k&&isOpen(t)).length;
    return `<button type="button" class="dpill ${k===td?'today':''}" data-act="selday" data-v="${k}" data-day="${k}" aria-pressed="${S.selDay===k}"><span>${WD1[wdi(k)]}</span><b>${fa(jp(k).d)}</b><span class="dots">${Array(Math.min(n,3)).fill('<i style="background:var(--c1)"></i>').join('')}${Array(Math.min(tn,3)).fill('<i></i>').join('')}</span></button>`;}).join('')}</div>`;
  const week=`<div class="week7">${days.map((k,i)=>{const evs=eventsOn(k);const ts=all.filter(t=>t.plan===k).sort((a,b)=>(isOpen(b)-isOpen(a))||byPrio(a,b));const m=ts.filter(isOpen).reduce((s,t)=>s+(t.minutes||0),0);
    return `<div class="wday ${k===td?'today':''} ${i===6?'off':''}" data-day="${k}"><header><b>${wd(k)}</b><span>${jd(k)}</span></header>
      <div class="items">${evs.map(e=>miniEv(e,k)).join('')}${ts.map(mini).join('')}</div>
      <footer><span>${m?mins(m):''}</span><button class="iconbtn" style="width:30px;height:30px" type="button" data-act="newev" data-v="${k}" aria-label="رویداد">${ic('plus')}</button></footer></div>`;}).join('')}</div>`;
  const standalone=all.filter(t=>isOpen(t)&&!t.plan&&!t.projectId).sort(byPrio);
  const nx=PR().filter(p=>p.status==='active'&&inF(p)).map(p=>nextOf(p.id)).filter(t=>t&&!t.plan);
  const pool=standalone.concat(nx);
  body=`${strip}${week}<div class="dayagenda m-only">${dayAgenda(S.selDay)}</div>
    <div class="section pool" data-day=""><h2>آمادهٔ برنامه‌ریزی <span class="n">${fa(pool.length)}</span></h2>
    <div class="items">${pool.length?pool.map(t=>`<div class="mini" data-id="${t.id}" draggable="true"><i class="dot" style="background:${col(t.domain)}"></i><span class="tt" data-act="edit">${esc(t.title)}</span><button class="btn sm ghost" type="button" data-act="toSel" title="به روز انتخاب‌شده">${ic('cal')}<span class="m">${rel(S.selDay)}</span></button></div>`).join(''):'<div class="empty">همه‌چیز روز دارد.</div>'}</div></div>`;
  return planShell(seg,head,body);
}
function planShell(seg,head,body){
  return `<div class="pagehead"><div class="grow"><h1>برنامه</h1><span class="sub">${head}</span></div>${seg}</div>
  <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px">
    <button class="btn sm" type="button" data-act="pnav" data-v="-1" aria-label="قبلی">${ic('prev')}</button>
    <button class="btn sm" type="button" data-act="pnav" data-v="0">امروز</button>
    <button class="btn sm" type="button" data-act="pnav" data-v="1" aria-label="بعدی">${ic('next')}</button>
    <span style="margin-inline-start:auto"></span>
    <button class="btn sm primary" type="button" data-act="newev" data-v="${S.selDay}">${ic('plus')}رویداد</button></div>
  ${filterChips()}${body}`;
}

/* ================= PROJECTS ================= */
function card(p){
  const h=health(p);const open=S.open.has(p.id);const n=nextOf(p.id);const td=today();const pct=h.total?Math.round(h.done/h.total*100):0;
  const flags=[];
  if(h.noNext)flags.push(`<span class="tag crit">${ic('alert')}بدون گام بعدی</span>`);
  if(h.big)flags.push(`<span class="tag warn">${ic('split')}${fa(h.big)} گام درشت/مبهم</span>`);
  if(h.stale)flags.push(`<span class="tag">${ic('pause')}راکد ${fa(h.stale)} روز</span>`);
  let dl='';if(p.deadline){const d=diff(td,p.deadline);dl=`<span class="${d<0&&p.status!=='done'?'late':''}">ددلاین ${jd(p.deadline)}${p.status!=='done'?(d<0?' · '+fa(-d)+' روز گذشته':' · '+fa(d)+' روز مانده'):''}</span>`;}
  const ts=pTasks(p.id);const dk='add-'+p.id,dmk='addm-'+p.id;
  return `<article class="proj ${open?'open':''}" data-pid="${p.id}" id="proj-${p.id}">
    <div class="ph">${dm(p.domain)}${dl}</div>
    <h3>${esc(p.title)}</h3>
    ${p.goal?`<p class="goal">انجام‌شده یعنی: ${esc(p.goal)}</p>`:`<p class="goal">تعریف «انجام‌شده» ندارد. <button class="btn sm ghost" type="button" data-act="pedit">تعریف کن</button></p>`}
    <div class="prog"><span style="width:${pct}%;background:${col(p.domain)}"></span></div>
    <div class="pmeta">${fa(h.done)} از ${fa(h.total)} گام · ${fa(pct)}٪${h.minsOpen?' · '+mins(h.minsOpen)+' باقی':''}</div>
    ${flags.length?`<div class="flags">${flags.join('')}</div>`:''}
    ${n?`<div class="next" data-id="${n.id}"><span class="nt"><span class="nl">گام بعدی</span>${esc(n.title)}${n.minutes?' · '+fa(n.minutes)+' دقیقه':''}</span>${n.plan===td?'<span class="tag">امروز</span>':`<button class="iconbtn" style="color:var(--accent)" type="button" data-act="today" aria-label="به امروز">${ic('sun')}</button>`}</div>`:''}
    <div class="pacts">
      <button class="btn sm" type="button" data-act="pexpand">${open?'بستن گام‌ها':'گام‌ها ('+fa(h.total)+')'}</button>
      <button class="btn sm" type="button" data-act="pmulti">${ic('split')}چند گام یک‌جا</button>
      <button class="btn sm ghost" type="button" data-act="pedit">${ic('edit')}ویرایش</button>
    </div>
    ${open?`<div class="subs"><div class="list">${ts.length?ts.map(t=>row(t,{noProject:true,noDom:true,move:true,showPlan:true})).join(''):'<div class="empty">هنوز گامی ندارد.</div>'}
      <div class="addrow"><input type="text" id="${dk}" data-draft="${dk}" data-enter="padd" placeholder="گام جدید: با فعل شروع کن…" value="${esc(S.drafts[dk]||'')}" aria-label="عنوان گام جدید">
      <input type="number" id="${dmk}" data-draft="${dmk}" data-enter="padd" min="1" max="600" inputmode="numeric" placeholder="دقیقه" value="${esc(S.drafts[dmk]||'')}" aria-label="دقیقه">
      <button class="btn primary" type="button" data-act="padd">افزودن</button></div></div></div>`:''}
  </article>`;
}

/* ================= INBOX ================= */
function vInbox(){
  const items=T().filter(t=>isInbox(t)&&inF(t)).sort(byOrder);
  const rows=items.map(t=>`<div class="task" data-id="${t.id}">
    <div class="t-main" data-act="edit"><div class="t-title">${esc(t.title)}</div>
      <div class="t-meta">${dm(t.domain)}${t.minutes?`<span class="ic">${ic('clock')}${mins(t.minutes)}</span>`:''}<span>ثبت ${rel(key(new Date(t.createdAt||Date.now())))}</span></div>
      <div class="qchips" style="margin-top:8px"><button type="button" data-act="edit">${ic('edit')}دسته‌بندی</button><button type="button" data-act="today">${ic('sun')}امروز</button><button type="button" data-act="toproj">${ic('proj')}پروژه</button><button type="button" data-act="tdelq">${ic('trash')}حذف</button></div></div></div>`).join('');
  return `<div class="pagehead"><div class="grow"><h1>صندوق</h1><span class="sub">ثبت بی‌فکر؛ بعداً تعیین تکلیف</span></div></div>${filterChips()}
  <div class="list">${rows||`<div class="empty">${ic('check','style="width:28px;height:28px;color:var(--accent)"')}<br>صندوق خالی است.</div>`}</div>`;
}

/* ================= REVIEW ================= */
function weekStats(ws){
  const we=addDays(ws,6),td=today();const inW=k=>k&&k>=ws&&k<=we;
  const done=T().filter(t=>!isOpen(t)&&inW(t.doneDay));
  const per={};doms().forEach(d=>per[d.id]={n:0,m:0});
  done.forEach(t=>{if(per[t.domain]){per[t.domain].n++;per[t.domain].m+=t.minutes||0;}});
  const overdue=T().filter(t=>isOpen(t)&&t.triaged!==false&&((t.due&&t.due<td)||(t.plan&&t.plan<td)));
  const hs=PR().filter(p=>p.status==='active'&&!isTeam(p.domain)).map(p=>({p,h:health(p)}));
  const big=T().filter(t=>isOpen(t)&&t.triaged!==false&&atom(t).lvl!=='ok');
  return {ws,we,done,per,overdue,hs,big,inbox:T().filter(isInbox)};
}
const CHECKS=[
  ['inbox','صندوق صفر شد',st=>st.inbox.length],
  ['next','هر پروژهٔ فعال گام بعدیِ اتمی دارد',st=>st.hs.filter(x=>x.h.noNext).length],
  ['big','گام‌های درشت/مبهم خرد شدند',st=>st.big.length],
  ['late','عقب‌افتاده‌ها تعیین تکلیف شدند',st=>st.overdue.length],
  ['dl','ددلاین‌ها و رویدادهای دو هفتهٔ آینده مرور شد',null],
  ['plan','سهم ساعت هر حوزه و سه تمرکز هفتهٔ بعد تعیین شد',null]
];
function vReview(){
  const ws=addDays(weekStart(today()),7*S.reviewOffset);const st=weekStats(ws);
  const rv=S.reviews[ws]||{};const ch=rv.checks||{};
  const d=k=>S.drafts['rv-'+ws+'-'+k]!=null?S.drafts['rv-'+ws+'-'+k]:(rv[k]||'');
  const R={from:ws,to:st.we,days:7};
  const stale=st.hs.filter(x=>x.h.stale||x.h.noNext);
  const chk=CHECKS.map(([k,l,f])=>{const c=f?f(st):null;return `<label><input type="checkbox" data-act="rcheck" data-k="${k}" ${ch[k]?'checked':''}><span>${l}</span>${c!=null?`<span class="c ${c?'late':'muted'}">${c?fa(c)+' مورد':'پاک'}</span>`:''}</label>`;}).join('');
  return `<div class="pagehead"><div class="grow"><h1>بازبینی هفتگی</h1><span class="sub">${jd(st.ws)} تا ${jd(st.we)}</span></div>
    <button class="btn sm" type="button" data-act="rw" data-v="-1">${ic('prev')}قبلی</button><button class="btn sm" type="button" data-act="rw" data-v="0" ${S.reviewOffset===0?'disabled':''}>این هفته</button></div>
  <div class="rgrid">
    ${teamReview()}
    <div class="card"><h2>تعادل حوزه‌های شخصی</h2>${bulletsHtml(R,'week',persDoms())}</div>
    <div class="card"><h2>واقعیت هفته</h2>
      <div class="kv"><span>انجام‌شده</span><b>${fa(st.done.length)} کار · ${hm(st.done.reduce((s,t)=>s+(t.minutes||0),0))}</b></div>
      <div class="kv"><span>عقب‌افتادهٔ باز</span><b class="${st.overdue.length?'late':''}">${fa(st.overdue.length)}</b></div>
      <div class="kv"><span>صندوق</span><b>${fa(st.inbox.length)}</b></div>
      <div class="kv"><span>گام درشت/مبهم باز</span><b>${fa(st.big.length)}</b></div></div>
    <div class="card"><h2>چک‌لیست بازبینی</h2><div class="checks">${chk}</div></div>
    <div class="card"><h2>پروژه‌های شخصی نیازمند توجه</h2>${stale.length?`<div class="agenda">${stale.map(x=>`<button type="button" class="ag" data-act="openproj" data-v="${x.p.id}"><span class="ei" style="color:${col(x.p.domain)}">${ic('proj')}</span><span class="ex"><b>${esc(x.p.title)}</b><span>${[x.h.noNext?'بدون گام بعدی':'',x.h.stale?'راکد '+fa(x.h.stale)+' روز':''].filter(Boolean).join('، ')}</span></span></button>`).join('')}</div>`:'<div class="empty">همهٔ پروژه‌ها گام بعدی دارند و حرکت کرده‌اند.</div>'}</div>
    <div class="card"><h2>یادداشت هفته</h2>
      <span class="lbl">چه جلو رفت؟</span><textarea class="note" id="rv-wins" data-draft="rv-${ws}-wins">${esc(d('wins'))}</textarea>
      <span class="lbl">کجا گیر کردم و چرا؟</span><textarea class="note" id="rv-stuck" data-draft="rv-${ws}-stuck">${esc(d('stuck'))}</textarea>
      <span class="lbl">سه تمرکز هفتهٔ بعد</span><textarea class="note" id="rv-next" data-draft="rv-${ws}-next">${esc(d('next'))}</textarea>
      <button class="btn primary" type="button" data-act="rsave" data-v="${ws}">ذخیرهٔ یادداشت</button></div>
    ${rv.autoText?`<div class="card"><h2>خلاصهٔ خودکار شنبه</h2><div class="ai">${esc(rv.autoText)}</div></div>`:''}
  </div>`;
}

/* ================= DOMAINS ================= */
function refCount(id){return {t:Object.values(S.tasks).filter(t=>t.domain===id).length,p:Object.values(S.projects).filter(p=>p.domain===id).length,e:Object.values(S.events).filter(e=>e.domain===id).length};}
function vDomains(){
  const act=doms(),arc=doms(true).filter(d=>d.archived);
  const rowD=(d,i,n)=>{const c=refCount(d.id);const open=Object.values(S.tasks).filter(t=>t.domain===d.id&&isOpen(t)).length;
    return `<div class="drow" data-did="${d.id}"><span class="sw" style="background:${col(d.id)}"></span><div class="dx"><b>${esc(d.name)}</b><span>${fa(d.budget||0)} ساعت در هفته · ${fa(open)} کار باز · ${fa(c.p)} پروژه</span></div>
    ${d.archived?`<button class="iconbtn" type="button" data-act="drestore" title="بازگردانی" aria-label="بازگردانی">${ic('restore')}</button><button class="iconbtn" type="button" data-act="ddel" title="حذف" aria-label="حذف" style="color:var(--critical)">${ic('trash')}</button>`
    :`<button class="iconbtn" type="button" data-act="dup" aria-label="بالا" ${i===0?'disabled':''}>${ic('up')}</button><button class="iconbtn" type="button" data-act="ddown" aria-label="پایین" ${i===n-1?'disabled':''}>${ic('down')}</button><button class="iconbtn" type="button" data-act="dedit" aria-label="ویرایش">${ic('edit')}</button><button class="iconbtn" type="button" data-act="darch" aria-label="آرشیو" title="آرشیو">${ic('archive')}</button>`}</div>`;};
  return `<div class="pagehead"><div class="grow"><h1>حوزه‌ها</h1><span class="sub">حوزهٔ آرشیوشده با همهٔ کارها و پروژه‌هایش از نماها پنهان می‌شود ولی داده‌اش می‌ماند.</span></div><button class="btn primary" type="button" data-act="dnew">${ic('plus')}حوزهٔ جدید</button></div>
  <div class="list">${act.length?act.map((d,i)=>rowD(d,i,act.length)).join(''):'<div class="empty">حوزهٔ فعالی نیست.</div>'}</div>
  <div class="section"><h2>${ic('archive','style="width:16px;height:16px"')}آرشیو <span class="n">${fa(arc.length)}</span></h2><div class="list">${arc.length?arc.map((d,i)=>rowD(d,i,arc.length)).join(''):'<div class="empty">حوزهٔ آرشیوشده‌ای نیست.</div>'}</div></div>`;
}
function reorderDom(id,dir){
  const a=doms();const i=a.findIndex(d=>d.id===id),j=i+dir;if(i<0||j<0||j>=a.length)return;
  const ord=a.map((d,k)=>(k+1)*10);const t=ord[i];ord[i]=ord[j];ord[j]=t;
  a.forEach((d,k)=>{if(d.order!==ord[k])put('domains',Object.assign({},d,{order:ord[k]}));});
}

/* ================= CONNECT ================= */
function vConnect(){
  return `<div class="connect card"><h2 style="font-size:19px">${badToken?'کلید دسترسی دیگر معتبر نیست':'اتصال به Google Sheet'}</h2>
  <p class="muted" style="font-size:13.5px;margin:0 0 16px">آدرس Web app (با <span dir="ltr">/exec</span> تمام می‌شود) و کلید دسترسی را از Apps Script وارد کن؛ یا «کد اتصال» را از تنظیمات دستگاه دیگر بچسبان.</p>
  <div class="field"><label for="c-url">آدرس Web app</label><input id="c-url" type="url" dir="ltr" data-draft="c-url" placeholder="https://script.google.com/macros/s/…/exec" value="${esc((CONN&&CONN.u)||S.drafts['c-url']||'')}"></div>
  <div class="field"><label for="c-token">کلید دسترسی</label><input id="c-token" type="password" dir="ltr" autocomplete="off" placeholder="۶۴ کاراکتر"></div>
  <button class="btn primary" type="button" data-act="cconnect" style="width:100%">اتصال</button>
  <div class="or">یا</div>
  <div class="field"><label for="c-code">کد اتصال</label><input id="c-code" type="text" dir="ltr" autocomplete="off" placeholder="gam1.…"></div>
  <button class="btn" type="button" data-act="ccode" style="width:100%">اتصال با کد</button></div>`;
}

/* ================= sheets (modals) ================= */
function domOptions(sel,allowNone){
  const list=doms();const cur=S.domains[sel];if(cur&&cur.archived)list.push(cur);
  return (allowNone?`<option value="">— بدون حوزه —</option>`:'')+list.map(d=>`<option value="${d.id}" ${d.id===sel?'selected':''}>${esc(d.name)}${d.archived?' (آرشیو)':''}</option>`).join('');
}
function projOptions(dom,sel){
  const ps=Object.values(S.projects).filter(p=>(p.domain===dom&&p.status!=='done')||p.id===sel);
  return `<option value="">— بدون پروژه —</option>`+ps.map(p=>`<option value="${p.id}" ${p.id===sel?'selected':''}>${esc(p.title)}</option>`).join('');
}
function dateChips(target){
  return `<div class="qchips"><button type="button" data-act="dchip" data-t="${target}" data-v="0">امروز</button><button type="button" data-act="dchip" data-t="${target}" data-v="1">فردا</button><button type="button" data-act="dchip" data-t="${target}" data-v="sat">شنبهٔ بعد</button><button type="button" data-act="dchip" data-t="${target}" data-v="">پاک</button></div>`;
}
const SHEETS={
  menu(){
    const c=counts();
    return `<h3>منو</h3><div class="menu" style="margin-top:10px">
      ${NAV2.map(([k,l,i])=>`<button type="button" data-act="go" data-v="${k}">${ic(i)}${l}</button>`).join('')}
      <button type="button" data-act="go" data-v="inbox">${ic('inbox')}صندوق${c.inbox?`<span class="bdg">${fa(c.inbox)}</span>`:''}</button>
      <button type="button" data-act="settings">${ic('gear')}تنظیمات و اتصال</button>
      <button type="button" data-act="sync">${ic('sync')}همگام‌سازی اکنون</button></div>`;
  },
  quick(){
    const ds=doms();const when=S.qa.when;
    return `<div class="qadd"><h3>افزودن</h3><p class="lead">بنویس و Enter بزن. میان‌برها: <b>#پروژه</b> · <b>@نفر</b> · <b>!امروز</b> · <b>!فردا</b> · عدد + «د» در انتها = دقیقه</p>
      <div class="field"><input type="text" id="q-title" autofocus placeholder="مثلاً: ارسال نسخهٔ اول گزارش #میلی @علی !فردا" autocomplete="off"><div class="qprev" id="q-prev"></div></div>
      <div class="field"><span class="lbl">حوزه (اگر پروژه‌ای انتخاب نشود)</span><div class="qchips">${ds.map(d=>`<button type="button" data-act="qdom" data-v="${d.id}" aria-pressed="${S.capDom===d.id}"><i class="dot" style="background:${col(d.id)}"></i>${esc(d.name)}</button>`).join('')}</div></div>
      <div class="field"><span class="lbl">کی؟</span><div class="qchips">${[['inbox','صندوق'],['today','امروز'],['tomorrow','فردا']].map(([k,l])=>`<button type="button" data-act="qwhen" data-v="${k}" aria-pressed="${when===k}">${l}</button>`).join('')}</div></div>
      <div class="mfoot"><button class="btn primary" type="button" data-act="qsave">ثبت کار</button><span class="sp"></span>
      <button class="btn ghost" type="button" data-act="newev" data-v="${today()}">${ic('cal')}رویداد</button><button class="btn ghost" type="button" data-act="newproj">${ic('proj')}پروژه</button></div></div>`;
  },
  task(id){
    const t=id?S.tasks[id]:newTask(Object.assign({domain:S.filter!=='all'?S.filter:S.capDom},S.newTaskDefaults||{}));
    return `<h3>${id?(t.triaged===false?'دسته‌بندی کار':'ویرایش کار'):'کار جدید'}</h3><p class="lead">${isTeam(t.domain)?'گام پروژه‌های تیم؛ انجام‌دهنده را مشخص کن.':'عنوان را با فعل فیزیکی شروع کن.'}</p>
    <div class="field"><label for="f-title">عنوان</label><input id="f-title" type="text" value="${esc(t.title)}" ${id?'':'autofocus'}></div>
    <div class="row2"><div class="field"><label for="f-domain">حوزه</label><select id="f-domain">${domOptions(t.domain)}</select></div>
    <div class="field"><label for="f-project">پروژه</label><select id="f-project">${projOptions(t.domain,t.projectId)}</select></div></div>
    <div class="row2"><div class="field"><label for="f-who">انجام‌دهنده</label><select id="f-who">${whoOptions(t.assignee)}</select></div>
    <div class="field"><label for="f-priority">اولویت</label><select id="f-priority"><option value="1" ${t.priority===1?'selected':''}>فوری</option><option value="2" ${t.priority!==1&&t.priority!==3?'selected':''}>معمول</option><option value="3" ${t.priority===3?'selected':''}>کم</option></select></div></div>
    <div class="field"><label for="f-minutes">زمان (دقیقه، اختیاری)</label><input id="f-minutes" type="number" min="1" max="600" inputmode="numeric" value="${t.minutes||''}"><span class="jl" id="f-atom"></span></div>
    <div class="row2"><div class="field"><label for="f-plan">روز انجام</label><input id="f-plan" type="date" dir="ltr" value="${t.plan||''}">${dateChips('f-plan')}<span class="jl" id="f-plan-jl"></span></div>
    <div class="field"><label for="f-due">سررسید</label><input id="f-due" type="date" dir="ltr" value="${t.due||''}">${dateChips('f-due')}<span class="jl" id="f-due-jl"></span></div></div>
    <div class="field"><label for="f-note">یادداشت</label><textarea id="f-note" rows="2">${esc(t.note||'')}</textarea></div>
    <div class="mfoot"><button class="btn primary" type="button" data-act="tsave" data-v="${id||''}">ذخیره</button><button class="btn ghost" type="button" data-act="close">انصراف</button>
    ${id?`<span class="sp"></span>${isOpen(t)&&atom(t).lvl!=='ok'?`<button class="btn sm" type="button" data-act="splitid" data-v="${id}">${ic('split')}خرد کن</button>`:''}<button class="btn sm danger" type="button" data-act="tdel" data-v="${id}">حذف</button>`:''}</div>`;
  },
  project(id){
    const ctx=S.newProjDom||(S.view==='personal'?firstPersDom():firstTeamDom());
    const p=id?S.projects[id]:{title:'',domain:ctx,goal:'',deadline:'',status:'active',owner:'',type:'',priority:2,start:today(),desc:'',stakeholder:'',stopRule:'',links:''};
    const full=!!(p.goal||p.desc||p.stakeholder||p.stopRule||p.links||p.type);
    return `<h3>${id?'ویرایش پروژه':'پروژهٔ جدید'}</h3><p class="lead">فقط نام لازم است؛ شناسنامه را هر وقت خواستی کامل کن.</p>
    <div class="field"><label for="p-title">نام پروژه</label><input id="p-title" type="text" value="${esc(p.title)}" autofocus></div>
    <div class="row2"><div class="field"><label for="p-owner">مسئول</label><select id="p-owner">${whoOptions(p.owner)}</select></div>
    <div class="field"><label for="p-status">وضعیت</label><select id="p-status"><option value="active" ${(p.status||'active')==='active'?'selected':''}>فعال</option><option value="paused" ${p.status==='paused'?'selected':''}>متوقف</option><option value="done" ${p.status==='done'?'selected':''}>تمام‌شده (آرشیو)</option></select></div></div>
    <div class="row2"><div class="field"><label for="p-start">شروع</label><input id="p-start" type="date" dir="ltr" value="${p.start||''}"><span class="jl" id="p-start-jl"></span></div>
    <div class="field"><label for="p-deadline">ددلاین</label><input id="p-deadline" type="date" dir="ltr" value="${p.deadline||''}"><span class="jl" id="p-deadline-jl"></span></div></div>
    <details class="more" ${full?'open':''}><summary>شناسنامهٔ کامل (اختیاری)</summary>
      <div class="row2"><div class="field"><label for="p-domain">حوزه</label><select id="p-domain">${domOptions(p.domain)}</select></div>
      <div class="field"><label for="p-type">نوع محصول</label><select id="p-type">${PTYPE.map(([k,l])=>`<option value="${k}" ${(p.type||'')===k?'selected':''}>${l}</option>`).join('')}</select></div></div>
      <div class="field"><label for="p-priority">اولویت</label><select id="p-priority">${[1,2,3].map(k=>`<option value="${k}" ${(p.priority||2)===k?'selected':''}>${PRIO_N[k]}</option>`).join('')}</select></div>
      <div class="field"><label for="p-goal">«انجام‌شده» یعنی چه؟</label><input id="p-goal" type="text" value="${esc(p.goal||'')}" placeholder="مثلاً: گزارش نهایی برای مدیرعامل ارسال شد"></div>
      <div class="field"><label for="p-desc">توضیح و هدف</label><textarea id="p-desc" rows="3">${esc(p.desc||'')}</textarea></div>
      <div class="field"><label for="p-stake">ذینفع</label><input id="p-stake" type="text" value="${esc(p.stakeholder||'')}" placeholder="چه کسی خروجی را تحویل می‌گیرد؟"></div>
      <div class="field"><label for="p-stop">معیار توقف</label><input id="p-stop" type="text" value="${esc(p.stopRule||'')}" placeholder="در چه شرایطی پروژه متوقف یا لغو می‌شود؟"></div>
      <div class="field"><label for="p-links">لینک‌ها (هر خط یکی)</label><textarea id="p-links" rows="2" dir="ltr">${esc(p.links||'')}</textarea></div>
    </details>
    <div class="mfoot"><button class="btn primary" type="button" data-act="psave" data-v="${id||''}">ذخیره</button><button class="btn ghost" type="button" data-act="close">انصراف</button>
    ${id?`<span class="sp"></span><button class="btn sm danger" type="button" data-act="pdel" data-v="${id}">حذف پروژه</button>`:''}</div>`;
  },
  person(id){
    const x=id?S.people[id]:{name:'',role:'',skills:'',note:'',active:true};
    return `<h3>${id?'ویرایش فرد':'فرد جدید'}</h3><p class="lead">فقط در Sheet خودت ذخیره می‌شود و فقط خودت می‌بینی.</p>
    <div class="field"><label for="x-name">نام</label><input id="x-name" type="text" value="${esc(x.name)}" autofocus></div>
    <div class="field"><label for="x-role">نقش</label><input id="x-role" type="text" value="${esc(x.role||'')}" placeholder="مثلاً: پژوهشگر داده"></div>
    <div class="field"><label for="x-skills">مهارت‌ها</label><input id="x-skills" type="text" value="${esc(x.skills||'')}" placeholder="مثلاً: پایتون، تحلیل رگولاتوری، نگارش گزارش"></div>
    <div class="field"><label for="x-note">یادداشت خصوصی</label><textarea id="x-note" rows="3" placeholder="جلسه‌های فردی، نقاط قوت، زمینه‌های رشد…">${esc(x.note||'')}</textarea></div>
    ${id?`<label class="switch" for="x-active"><span class="sx">فعال در تیم<small>فرد غیرفعال از فهرست انتخاب مسئول حذف می‌شود؛ سابقه‌اش می‌ماند</small></span><input type="checkbox" id="x-active" ${x.active!==false?'checked':''}></label>`:''}
    <div class="mfoot"><button class="btn primary" type="button" data-act="persave" data-v="${id||''}">ذخیره</button><button class="btn ghost" type="button" data-act="close">انصراف</button>
    ${id?`<span class="sp"></span><button class="btn sm danger" type="button" data-act="perdel" data-v="${id}">حذف</button>`:''}</div>`;
  },
  event(){
    const e=S.evDraft;const isNew=!S.events[e.id];
    const typeChips=Object.keys(EVT).map(k=>`<button type="button" data-act="evtype" data-v="${k}" aria-pressed="${e.type===k}">${ic(EVT[k].i)}${EVT[k].n}</button>`).join('');
    let gs='';
    if(!isNew&&e.sync){gs=e.gcalErr?`<span class="late">خطای تقویم: ${esc(e.gcalErr)}</span>`:(e.gcal&&e.gcal.length?`<span style="color:var(--accent)">در تقویم گوگل ثبت شده</span>`:'<span class="muted">در انتظار همگام‌سازی</span>');}
    return `<h3>${isNew?'رویداد / یادآور جدید':'ویرایش رویداد'}</h3><p class="lead">جلسه، تولد، مناسبت یا هر یادآوری؛ با تقویم گوگل همگام می‌شود.</p>
    <div class="field"><label for="e-title">عنوان</label><input id="e-title" type="text" value="${esc(e.title)}" ${isNew?'autofocus':''} placeholder="مثلاً: جلسه با استاد راهنما"></div>
    <div class="field"><span class="lbl">نوع</span><div class="qchips" id="e-types">${typeChips}</div></div>
    <div class="field"><span class="lbl">روز هفته</span><div id="e-week">${evWeekHtml()}</div></div>
    <div class="field"><label for="e-date">یا تاریخ دقیق</label><input id="e-date" type="date" dir="ltr" value="${e.date}"><span class="jl" id="e-date-jl"></span></div>
    <label class="switch" for="e-allday"><span class="sx">تمام روز<small>بدون ساعت مشخص</small></span><input type="checkbox" id="e-allday" ${e.time?'':'checked'}></label>
    <div class="row2" id="e-timebox" ${e.time?'':'hidden'}><div class="field"><label for="e-time">ساعت</label><input id="e-time" type="time" dir="ltr" value="${e.time||'09:00'}"></div>
      <div class="field"><label for="e-dur">مدت (دقیقه)</label><input id="e-dur" type="number" min="5" max="1440" step="5" inputmode="numeric" value="${e.duration||60}"></div></div>
    <div class="row2"><div class="field"><label for="e-repeat">تکرار</label><select id="e-repeat">${REPEAT.map(([k,l])=>`<option value="${k}" ${e.repeat===k?'selected':''}>${l}</option>`).join('')}</select></div>
      <div class="field"><label for="e-remind">یادآوری</label><select id="e-remind">${REMIND.map(([k,l])=>`<option value="${k}" ${Number(e.remind)===k?'selected':''}>${l}</option>`).join('')}</select></div></div>
    <div class="field"><label for="e-domain">حوزه (اختیاری)</label><select id="e-domain">${domOptions(e.domain,true)}</select></div>
    <div class="field"><label for="e-note">یادداشت</label><textarea id="e-note" rows="2">${esc(e.note||'')}</textarea></div>
    <label class="switch" for="e-sync"><span class="sx">همگام با تقویم گوگل<small>یادآوری روی گوشی از طریق اپ Google Calendar · ${gs||'تقویم جداگانهٔ «Xerxes»'}</small></span><input type="checkbox" id="e-sync" ${e.sync?'checked':''}></label>
    ${isNew?`<label class="switch" for="e-astask" id="e-astask-row" ${e.type==='task'?'':'hidden'}><span class="sx">به فهرست کارهای آن روز هم اضافه شود</span><input type="checkbox" id="e-astask" checked></label>`:''}
    <div class="mfoot"><button class="btn primary" type="button" data-act="esave">ذخیره</button><button class="btn ghost" type="button" data-act="close">انصراف</button>
    ${isNew?'':`<span class="sp"></span><button class="btn sm danger" type="button" data-act="edel">حذف</button>`}</div>`;
  },
  multi(){
    const m=S.multi;let title='',lead='';
    if(m.kind==='project'){const p=S.projects[m.id];title=p?p.title:'';lead='گام‌ها به انتهای پروژه اضافه می‌شوند.';}
    else{const t=S.tasks[m.id];title=t?t.title:'';lead='این کار با گام‌های زیر جایگزین می‌شود.';}
    return `<h3>خرد کردن: ${esc(title)}</h3><p class="lead">${lead} هر خط یک گام؛ عدد + «د» در انتها = دقیقه. هر گام حداکثر ${fa(S.settings.atom)} دقیقه، با فعل فیزیکی؛ گام اول زیر ۵ دقیقه.</p>
    <div class="field"><label for="m-lines">گام‌ها</label><textarea id="m-lines" rows="7" autofocus placeholder="باز کردن فایل پروپوزال و ساخت سرفصل‌ها ۵د&#10;نوشتن پاراگراف مسئله در ۵ جمله ۲۰د&#10;فرستادن پیش‌نویس به استاد ۵د"></textarea></div>
    <div id="m-prev"></div>
    ${m.kind==='task'?'<label class="switch" for="m-del"><span class="sx">کار اصلی حذف شود</span><input type="checkbox" id="m-del" checked></label>':''}
    <div class="mfoot"><button class="btn primary" type="button" data-act="madd">افزودن گام‌ها</button><button class="btn ghost" type="button" data-act="close">انصراف</button></div>`;
  },
  domain(id){
    const d=id?S.domains[id]:{name:'',color:nextColor(),budget:5,kind:'personal'};
    return `<h3>${id?'ویرایش حوزه':'حوزهٔ جدید'}</h3><p class="lead">رنگ حوزه در همهٔ نمودارها ثابت می‌ماند.</p>
    <div class="field"><label for="d-name">نام</label><input id="d-name" type="text" value="${esc(d.name)}" autofocus placeholder="مثلاً: تدریس"></div>
    <label class="switch" for="d-team"><span class="sx">حوزهٔ تیمی (مدیریتی)<small>پروژه‌هایش در سبد می‌آیند؛ قاعدهٔ گام اتمی برایش خاموش است</small></span><input type="checkbox" id="d-team" ${domKind(d)==='team'?'checked':''}></label>
    <div class="field"><span class="lbl">رنگ</span><div class="swatches" id="d-colors">${PAL.map(c=>`<button type="button" data-act="dcolor" data-v="${c}" aria-pressed="${d.color===c}" aria-label="${PAL_NAME[c]}" style="background:var(--${c})"></button>`).join('')}</div><input type="hidden" id="d-color" value="${d.color}"></div>
    <div class="field"><label for="d-budget">بودجهٔ ساعت در هفته</label><input id="d-budget" type="number" min="0" max="100" inputmode="numeric" value="${d.budget||0}"></div>
    <div class="mfoot"><button class="btn primary" type="button" data-act="dsave" data-v="${id||''}">ذخیره</button><button class="btn ghost" type="button" data-act="close">انصراف</button></div>`;
  },
  ddelete(id){
    const d=S.domains[id];const c=refCount(id);const others=doms(true).filter(x=>x.id!==id);
    return `<h3>حذف حوزهٔ «${esc(d.name)}»</h3><p class="lead">${fa(c.t)} کار، ${fa(c.p)} پروژه و ${fa(c.e)} رویداد به این حوزه وصل‌اند. پیش از حذف، آن‌ها به حوزهٔ دیگری منتقل می‌شوند.</p>
    <div class="field"><label for="dd-target">انتقال به</label><select id="dd-target">${others.map(x=>`<option value="${x.id}">${esc(x.name)}${x.archived?' (آرشیو)':''}</option>`).join('')}</select></div>
    <div class="mfoot"><button class="btn danger" type="button" data-act="ddelgo" data-v="${id}" ${others.length?'':'disabled'}>انتقال و حذف</button><button class="btn ghost" type="button" data-act="close">انصراف</button></div>`;
  },
  settings(){
    const s=S.settings;const th=lsGet('x-theme-v')||'auto';
    return `<h3>تنظیمات</h3>
    <div class="field" style="margin-top:12px"><span class="lbl">صفحهٔ اول برنامه</span><div class="qchips">${HOMES.map(([k,l])=>`<button type="button" data-act="shome" data-v="${k}" aria-pressed="${s.home===k}">${l}</button>`).join('')}</div><input type="hidden" id="s-home" value="${s.home}"></div>
    <div class="field"><label for="s-stale">ارزیابی پروژه بعد از چند روز «کهنه» حساب شود؟</label><input id="s-stale" type="number" min="1" max="60" value="${s.staleDays}"></div>
    <div class="row2"><div class="field"><label for="s-atom">سقف گام اتمی، فقط شخصی (دقیقه)</label><input id="s-atom" type="number" min="5" max="90" value="${s.atom}"></div>
    <div class="field"><label for="s-focus">سقف کار تمرکزی روزانه</label><input id="s-focus" type="number" min="1" max="12" value="${s.focus}"></div></div>
    <label class="switch" for="s-gcal"><span class="sx">رویدادهای جدید با تقویم گوگل همگام شوند<small>پیش‌فرض برای رویداد تازه؛ در هر رویداد قابل تغییر است</small></span><input type="checkbox" id="s-gcal" ${s.gcalDefault?'checked':''}></label>
    <div class="field"><span class="lbl">پوسته (همین دستگاه)</span><div class="qchips">${[['auto','خودکار'],['light','روشن'],['dark','تیره']].map(([k,l])=>`<button type="button" data-act="theme" data-v="${k}" aria-pressed="${th===k}">${l}</button>`).join('')}</div></div>
    <div class="mfoot"><button class="btn primary" type="button" data-act="ssave">ذخیره</button><button class="btn ghost" type="button" data-act="go" data-v="domains">${ic('layers')}مدیریت حوزه‌ها</button></div>
    ${hasConn()?`<hr style="border:0;border-top:1px solid var(--line);margin:20px 0 14px">
    <h3 style="font-size:16px">اتصال دستگاه دیگر</h3><p class="lead">این کد QR را با دوربین گوشی اسکن کن تا برنامه روی گوشی خودکار وصل شود. کد حکم رمز عبور دارد.</p>
    <div class="qr" id="qrbox"></div><div class="code" id="codebox">${esc(encodeConn(CONN))}</div>
    <div class="mfoot" style="margin-top:12px"><button class="btn sm" type="button" data-act="copycode" data-v="code">کپی کد</button><button class="btn sm" type="button" data-act="copycode" data-v="link">کپی لینک</button><span class="sp"></span><button class="btn sm danger" type="button" data-act="disconnect">قطع اتصال این دستگاه</button></div>`:''}`;
  }
};
function evWeekHtml(){
  const e=S.evDraft;const ws=weekStart(e.date);const days=[0,1,2,3,4,5,6].map(i=>addDays(ws,i));
  return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px"><button class="btn sm ghost" type="button" data-act="evwk" data-v="-7" aria-label="هفتهٔ قبل">${ic('prev')}</button><span class="lbl" style="flex:1;text-align:center">${jd(ws)} تا ${jd(days[6])}</span><button class="btn sm ghost" type="button" data-act="evwk" data-v="7" aria-label="هفتهٔ بعد">${ic('next')}</button></div>
  <div class="wdchips">${days.map(k=>`<button type="button" data-act="evday" data-v="${k}" aria-pressed="${e.date===k}"><span>${WD1[wdi(k)]}</span><b>${fa(jp(k).d)}</b></button>`).join('')}</div>`;
}
function openSheet(kind,arg){
  const root=$('#sheet');
  root.innerHTML=`<div class="backdrop" data-act="bg"><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${SHEETS[kind](arg)}</div></div>`;
  root.hidden=false;root.dataset.kind=kind;document.body.style.overflow='hidden';
  ['f-plan','f-due','p-deadline','p-start','e-date'].forEach(jlUpdate);atomPreview();
  if(kind==='settings')drawQR();
  setTimeout(()=>{const a=root.querySelector('[autofocus]');if(a&&matchMedia('(min-width:640px)').matches)a.focus();},30);
}
function closeSheet(){const r=$('#sheet');r.hidden=true;r.innerHTML='';document.body.style.overflow='';S.multi=null;S.evDraft=null;S.newTaskDefaults=null;S.newProjDom='';}
function jlUpdate(id){const i=document.getElementById(id),o=document.getElementById(id+'-jl');if(i&&o)o.textContent=i.value?fullDate(i.value):'';}
function atomPreview(){
  const m=document.getElementById('f-minutes'),o=document.getElementById('f-atom'),ti=document.getElementById('f-title');if(!m||!o)return;
  const dsel=document.getElementById('f-domain');const a=atom({title:ti?ti.value:'',minutes:Number(toEn(m.value))||null,domain:dsel?dsel.value:''});
  if(a.team){o.textContent='';return;}
  o.textContent=a.lvl==='ok'?'اتمی':a.txt;o.style.color=a.lvl==='ok'?'var(--accent)':a.lvl==='bad'?'var(--critical)':'#b77e00';
}
function drawQR(){
  const box=document.getElementById('qrbox');if(!box||!hasConn())return;
  if(typeof QRCode==='undefined'){box.textContent='کد QR بارگذاری نشد؛ از «کپی لینک» استفاده کن.';return;}
  box.innerHTML='';try{new QRCode(box,{text:appLink(),width:220,height:220,colorDark:'#12342A',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.L});}catch(e){box.textContent='از «کپی لینک» استفاده کن.';}
}

/* ================= save handlers ================= */
function saveTask(id){
  const title=val('f-title').trim();if(!title){toast('عنوان خالی است.');return;}
  const old=id?S.tasks[id]:null;const pid=val('f-project');
  const t=Object.assign({},old||newTask({}),{title,domain:val('f-domain'),projectId:pid,minutes:Number(toEn(val('f-minutes')))||null,
    priority:Number(val('f-priority'))||2,plan:val('f-plan'),due:val('f-due'),note:val('f-note').trim(),assignee:val('f-who'),triaged:true});
  if(pid&&(!old||old.projectId!==pid))t.order=maxOrder(pid)+10;
  put('tasks',t);closeSheet();toast(old?'ذخیره شد':'کار اضافه شد');
}
function saveProject(id){
  const title=val('p-title').trim();if(!title){toast('نام پروژه خالی است.');return;}
  const old=id?S.projects[id]:null;
  const p=Object.assign({},old||{id:uid(),createdAt:new Date().toISOString(),progress:null,progressAt:'',health:''},{title,goal:val('p-goal').trim(),domain:val('p-domain'),deadline:val('p-deadline'),start:val('p-start'),status:val('p-status')||'active',
    owner:val('p-owner'),type:val('p-type'),priority:Number(val('p-priority'))||2,desc:val('p-desc').trim(),stakeholder:val('p-stake').trim(),stopRule:val('p-stop').trim(),links:val('p-links').trim()});
  if(old&&old.domain!==p.domain)pTasks(p.id).forEach(t=>put('tasks',Object.assign({},t,{domain:p.domain})));
  S.open.add(p.id);put('projects',p);closeSheet();
  if(!old){
    if(isTeam(p.domain)){S.view='project';S.pid=p.id;prefs();render();window.scrollTo({top:0});toast('پروژه ساخته شد');}
    else{S.view='personal';prefs();render();toast('پروژه ساخته شد؛ گام اولش را بنویس.');setTimeout(()=>{const i=document.getElementById('add-'+p.id);if(i){i.scrollIntoView({block:'center'});i.focus();}},80);}
  }else toast('ذخیره شد');
}
function newEvent(k){
  return {id:uid(),title:'',type:'meeting',date:k||S.selDay||today(),time:'09:00',duration:60,repeat:'none',remind:30,note:'',domain:'',sync:!!S.settings.gcalDefault,gcal:[],gcalErr:'',createdAt:new Date().toISOString(),archived:false};
}
function readEvForm(){
  const e=S.evDraft;if(!e)return;
  e.title=val('e-title');e.date=val('e-date')||e.date;e.time=checked('e-allday')?'':(val('e-time')||'09:00');
  e.duration=Number(toEn(val('e-dur')))||60;e.repeat=val('e-repeat')||'none';e.remind=Number(val('e-remind'));e.domain=val('e-domain');e.note=val('e-note');e.sync=checked('e-sync');
}
function saveEvent(){
  readEvForm();const e=S.evDraft;const title=e.title.trim();if(!title){toast('عنوان خالی است.');return;}if(!e.date){toast('روز را انتخاب کن.');return;}
  const isNew=!S.events[e.id];const addTask=isNew&&e.type==='task'&&checked('e-astask');
  const obj=Object.assign({},e,{title});
  const send=Object.assign({},obj);if(obj.sync&&(obj.repeat==='monthly'||obj.repeat==='yearly'))send.occ=occList(obj,obj.repeat==='monthly'?12:10);
  if(!obj.sync){send.gcal=obj.gcal||[];}
  enqueue({t:'put',kind:'events',obj:body(send)});
  if(addTask)put('tasks',newTask({title,domain:obj.domain||S.capDom||firstDom(),plan:obj.date,triaged:true}));
  closeSheet();toast(obj.sync&&hasConn()?'ذخیره شد؛ در حال ثبت در تقویم گوگل':'ذخیره شد');
}

/* manual breakdown */
function parseLine(raw){
  const en=toEn(raw);const r=en.match(/\s+(\d{1,3})\s*(?:د|دق|دقیقه|m|min)\s*$/i);
  let title=raw.trim(),m=null;if(r){m=Number(r[1]);title=raw.slice(0,r.index).trim();}
  return {title:title.replace(/^[-•*\d.)\s]+(?=\S)/,'').trim()||title,minutes:m};
}
function multiLines(){return val('m-lines').split('\n').map(s=>s.trim()).filter(Boolean).map(parseLine).filter(x=>x.title);}
function multiPreview(){
  const o=document.getElementById('m-prev');if(!o)return;const ls=multiLines();
  o.innerHTML=ls.map(x=>{const a=atom(x);return `<div class="brk-item"><span style="flex:1;min-width:0">${esc(x.title)}</span><span class="muted">${x.minutes?fa(x.minutes)+'د':''}</span><span class="tag ${a.lvl==='bad'?'crit':a.lvl==='ok'?'':'warn'}">${a.lvl==='ok'?'اتمی':a.txt}</span></div>`;}).join('');
}
function addMulti(){
  const m=S.multi;if(!m)return;const ls=multiLines();if(!ls.length){toast('حداقل یک خط بنویس.');return;}
  let pid,dom,base,gap,firstPlan='',removeId=null;
  if(m.kind==='project'){const p=S.projects[m.id];if(!p)return;pid=p.id;dom=p.domain;base=maxOrder(pid)+10;gap=10;}
  else{const t=S.tasks[m.id];if(!t)return;pid=t.projectId||'';dom=t.domain;base=t.order||0;gap=pid?1/(ls.length+1):1;firstPlan=t.plan||'';if(checked('m-del'))removeId=t.id;}
  ls.forEach((x,i)=>put('tasks',newTask({title:x.title,minutes:x.minutes,domain:dom,projectId:pid,order:base+(i+(m.kind==='task'?1:0))*gap,plan:i===0?firstPlan:'',triaged:true})));
  if(removeId)del('tasks',removeId);
  if(pid)S.open.add(pid);
  closeSheet();toast(fa(ls.length)+' گام اضافه شد');
}
function addSub(pid){
  const p=S.projects[pid];if(!p)return;const k='add-'+pid,km='addm-'+pid;
  const raw=val(k).trim();if(!raw){toast('عنوان گام خالی است.');return;}
  const x=parseTokens(raw);const title=x.title||raw;
  const w2=x.when;const plan=w2==='today'?today():w2==='tomorrow'?addDays(today(),1):'';
  put('tasks',newTask({title,minutes:Number(toEn(val(km)))||x.minutes||null,domain:p.domain,projectId:pid,order:maxOrder(pid)+10,assignee:x.person?x.person.id:'',plan}));
  delete S.drafts[k];delete S.drafts[km];render();
  const i=document.getElementById(k);if(i){i.value='';i.focus();}const im=document.getElementById(km);if(im)im.value='';
}
function quickSave(){
  const raw=val('q-title');if(!raw.trim())return;const x=parseTokens(raw);
  if(!x.title){toast('عنوان خالی است.');return;}
  const pj=x.project;const w2=x.when||S.qa.when;const k=w2==='today'?today():w2==='tomorrow'?addDays(today(),1):'';
  const triaged=w2!=='inbox'||!!pj||!!x.person;
  put('tasks',newTask({title:x.title,minutes:x.minutes,domain:pj?pj.domain:(S.capDom||firstDom()),projectId:pj?pj.id:'',assignee:x.person?x.person.id:'',plan:k,triaged,order:pj?maxOrder(pj.id)+10:Date.now()}));
  const i=document.getElementById('q-title');if(i){i.value='';i.focus();}qPreview();
  toast((pj?'در «'+pj.title+'» ':'')+(!triaged?'به صندوق رفت':w2==='today'?'به امروز اضافه شد':w2==='tomorrow'?'برای فردا ثبت شد':'ثبت شد'));
}
function qPreview(){
  const o=document.getElementById('q-prev');if(!o)return;const raw=val('q-title');if(!raw.trim()){o.innerHTML='';return;}
  const x=parseTokens(raw);const c=[];
  if(x.project)c.push(`<span class="tag">${ic('proj')}${esc(x.project.title)}</span>`);
  if(x.person)c.push(`<span class="tag">${ic('user')}${esc(x.person.name)}</span>`);
  if(x.when)c.push(`<span class="tag">${x.when==='today'?'امروز':x.when==='tomorrow'?'فردا':'صندوق'}</span>`);
  if(x.minutes)c.push(`<span class="tag">${ic('clock')}${fa(x.minutes)} دقیقه</span>`);
  if(x.badProj)c.push(`<span class="tag warn">پروژه‌ای با «${esc(x.badProj)}» پیدا نشد</span>`);
  if(x.badPerson)c.push(`<span class="tag warn">فردی با «${esc(x.badPerson)}» پیدا نشد</span>`);
  o.innerHTML=c.join('');
}

/* ================= events ================= */
function prefs(){lsSet('x-prefs',{view:S.view,filter:S.filter,capDom:S.capDom,period:S.period,planMode:S.planMode});}
function go(v){S.view=v;prefs();closeSheet();render();window.scrollTo({top:0});}
function arm(b,label){if(b.classList.contains('armed'))return true;b.classList.add('armed');const o=b.innerHTML;b.textContent=label||'مطمئنی؟ دوباره بزن';setTimeout(()=>{b.classList.remove('armed');b.innerHTML=o;},3500);return false;}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;
  const act=b.dataset.act;const host=b.closest('[data-id]');const tid=host&&host.dataset.id;const pc=b.closest('[data-pid]');const pid=pc&&pc.dataset.pid;const dr=b.closest('[data-did]');const did=dr&&dr.dataset.did;const v=b.dataset.v;
  switch(act){
    case 'go':go(v);break;
    case 'menu':openSheet('menu');break;
    case 'quick':if(!hasConn()){toast('اول به Google Sheet وصل شو.');break;}openSheet('quick');break;
    case 'bg':if(e.target===b)closeSheet();break;
    case 'close':closeSheet();break;
    case 'filter':S.filter=v;prefs();render();break;
    case 'period':S.period=v;prefs();render();break;
    case 'toggle':toggle(tid);break;
    case 'today':plan(tid,today());toast('به امروز اضافه شد');break;
    case 'tomorrow':plan(tid,addDays(today(),1));toast('به فردا رفت');break;
    case 'toSel':plan(tid,S.selDay);toast('برای '+rel(S.selDay)+' برنامه‌ریزی شد');break;
    case 'edit':if(tid)openSheet('task',tid);break;
    case 'up':move(tid,-1);break;
    case 'down':move(tid,1);break;
    case 'split':S.multi={kind:'task',id:tid};openSheet('multi');break;
    case 'splitid':S.multi={kind:'task',id:v};openSheet('multi');break;
    case 'pmulti':S.multi={kind:'project',id:pid};openSheet('multi');break;
    case 'madd':addMulti();break;
    case 'pexpand':if(S.open.has(pid))S.open.delete(pid);else S.open.add(pid);render();break;
    case 'pedit':openSheet('project',pid);break;
    case 'newproj':if(!hasConn()){toast('اول وصل شو.');break;}openSheet('project',null);break;
    case 'openproj':{const pj=S.projects[v];if(!pj)break;closeSheet();
      if(isTeam(pj.domain)){S.view='project';S.pid=v;prefs();render();window.scrollTo({top:0});}
      else{S.view='personal';S.open.add(v);prefs();render();setTimeout(()=>{const el=document.getElementById('proj-'+v);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});},60);}break;}
    case 'peditid':openSheet('project',v);break;
    case 'pfown':S.pf.owner=v;render();break;
    case 'pfst':S.pf.status=v;render();break;
    case 'pdom':S.pdom=v;render();break;
    case 'ah':{const wr=b.closest('.assess');if(!wr)break;S.ah[wr.dataset.pid]=v;wr.querySelectorAll('[data-act="ah"]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));break;}
    case 'asave':{const wr=b.closest('.assess');if(wr)saveAssess(wr.dataset.pid,wr);break;}
    case 'rvopen':S.open.add('rv-'+v);render();break;
    case 'newperson':if(!hasConn()){toast('اول وصل شو.');break;}openSheet('person',null);break;
    case 'editperson':openSheet('person',v);break;
    case 'persave':savePerson(v);break;
    case 'perdel':{if(!arm(b))break;
      Object.values(S.projects).filter(x=>x.owner===v).forEach(x=>put('projects',Object.assign({},x,{owner:''})));
      Object.values(S.tasks).filter(x=>x.assignee===v).forEach(x=>put('tasks',Object.assign({},x,{assignee:''})));
      del('people',v);closeSheet();toast('حذف شد؛ پروژه‌ها و گام‌هایش به «خودم» برگشتند.');break;}
    case 'ppexpand':{const k='pp-'+v;if(S.open.has(k))S.open.delete(k);else S.open.add(k);render();break;}
    case 'newtaskd':S.newTaskDefaults={domain:v};openSheet('task',null);break;
    case 'newprojd':S.newProjDom=v;openSheet('project',null);break;
    case 'shome':document.getElementById('s-home').value=v;b.parentNode.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));break;
    case 'padd':addSub(pid);break;
    case 'newtask':S.newTaskDefaults={plan:v};openSheet('task',null);break;
    case 'settings':openSheet('settings');break;
    case 'sync':pull(true);flush();toast('همگام‌سازی…');break;
    case 'dchip':{const i=document.getElementById(b.dataset.t);const td=today();i.value=v===''?'':v==='sat'?addDays(weekStart(td),7):addDays(td,Number(v));jlUpdate(b.dataset.t);break;}
    case 'tsave':saveTask(v);break;
    case 'psave':saveProject(v);break;
    case 'tdel':if(!arm(b))break;del('tasks',v);closeSheet();toast('حذف شد');break;
    case 'tdelq':if(!arm(b,'مطمئنی؟'))break;del('tasks',tid);break;
    case 'pdel':if(!arm(b))break;pTasks(v).forEach(t=>put('tasks',Object.assign({},t,{projectId:''})));pUpdates(v).forEach(u=>del('updates',u.id));del('projects',v);closeSheet();if(S.view==='project')S.view='projects';render();toast('پروژه حذف شد؛ گام‌هایش مستقل شدند.');break;
    case 'toproj':{const t=S.tasks[tid];if(!t)break;const p={id:uid(),title:t.title,domain:t.domain,goal:'',deadline:t.due||'',status:'active',createdAt:new Date().toISOString()};put('projects',p);del('tasks',tid);S.open.add(p.id);openSheet('project',p.id);break;}
    case 'ssave':{const s={atom:Number(toEn(val('s-atom')))||25,focus:Number(toEn(val('s-focus')))||3,gcalDefault:checked('s-gcal'),home:val('s-home')||'home',staleDays:Number(toEn(val('s-stale')))||7};saveSettings(s);closeSheet();toast('تنظیمات ذخیره شد');break;}
    case 'theme':{lsSet('x-theme-v',v);try{if(v==='auto'){document.documentElement.removeAttribute('data-theme');localStorage.removeItem('x-theme');}else{document.documentElement.setAttribute('data-theme',v);localStorage.setItem('x-theme',v);}}catch(x){}
      b.parentNode.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));break;}
    /* quick add */
    case 'qdom':S.capDom=v;prefs();b.parentNode.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));break;
    case 'qwhen':S.qa.when=v;b.parentNode.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));break;
    case 'qsave':quickSave();break;
    /* plan */
    case 'planmode':S.planMode=v;prefs();render();break;
    case 'pnav':{const n=Number(v);if(S.planMode==='month'){S.monthOffset=n===0?0:S.monthOffset+n;S.selDay=S.monthOffset===0?today():jMonth(S.monthOffset).first;}else{S.weekOffset=n===0?0:S.weekOffset+n;S.selDay=n===0?today():addDays(weekStart(today()),7*S.weekOffset);}render();break;}
    case 'selday':S.selDay=v;render();break;
    case 'gotoday':S.view='plan';S.planMode='month';S.monthOffset=0;S.selDay=v;prefs();render();break;
    /* events */
    case 'newev':if(!hasConn()){toast('اول وصل شو.');break;}S.evDraft=newEvent(v);openSheet('event');break;
    case 'evedit':{const ev=S.events[b.dataset.eid];if(!ev)break;S.evDraft=clone(ev);if(!S.evDraft.gcal)S.evDraft.gcal=[];openSheet('event');break;}
    case 'evtype':{readEvForm();const e2=S.evDraft;e2.type=v;
      if(v==='birthday'){e2.repeat='yearly';e2.time='';e2.remind=1440;}
      else if(v==='meeting'&&!e2.time){e2.time='09:00';}
      openSheet('event');break;}
    case 'evday':readEvForm();S.evDraft.date=v;$('#e-week').innerHTML=evWeekHtml();document.getElementById('e-date').value=v;jlUpdate('e-date');break;
    case 'evwk':readEvForm();S.evDraft.date=addDays(S.evDraft.date,Number(v));$('#e-week').innerHTML=evWeekHtml();document.getElementById('e-date').value=S.evDraft.date;jlUpdate('e-date');break;
    case 'esave':saveEvent();break;
    case 'edel':if(!arm(b))break;del('events',S.evDraft.id);closeSheet();toast('رویداد حذف شد');break;
    /* domains */
    case 'dnew':openSheet('domain',null);break;
    case 'dedit':openSheet('domain',did);break;
    case 'dcolor':document.getElementById('d-color').value=v;b.parentNode.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));break;
    case 'dsave':{const name=val('d-name').trim();if(!name){toast('نام خالی است.');break;}
      const old=v?S.domains[v]:null;const d=Object.assign({},old||{id:uid(),order:(doms(true).reduce((m,x)=>Math.max(m,x.order||0),0))+10,archived:false,createdAt:new Date().toISOString()},{name,color:val('d-color')||nextColor(),budget:Number(toEn(val('d-budget')))||0,kind:checked('d-team')?'team':'personal'});
      put('domains',d);closeSheet();toast(old?'حوزه ذخیره شد':'حوزه اضافه شد');break;}
    case 'dup':reorderDom(did,-1);break;
    case 'ddown':reorderDom(did,1);break;
    case 'darch':{if(doms().length<=1){toast('حداقل یک حوزهٔ فعال لازم است.');break;}if(!arm(b,'آرشیو؟'))break;put('domains',Object.assign({},S.domains[did],{archived:true}));fixFilter();toast('آرشیو شد');break;}
    case 'drestore':put('domains',Object.assign({},S.domains[did],{archived:false}));toast('بازگردانده شد');break;
    case 'ddel':{const c=refCount(did);if(c.t+c.p+c.e===0){if(!arm(b,'حذف؟'))break;del('domains',did);toast('حذف شد');}else openSheet('ddelete',did);break;}
    case 'ddelgo':{const to=val('dd-target');if(!to)break;
      Object.values(S.tasks).filter(t=>t.domain===v).forEach(t=>put('tasks',Object.assign({},t,{domain:to})));
      Object.values(S.projects).filter(p=>p.domain===v).forEach(p=>put('projects',Object.assign({},p,{domain:to})));
      Object.values(S.events).filter(x=>x.domain===v).forEach(x=>put('events',Object.assign({},x,{domain:to})));
      del('domains',v);closeSheet();toast('منتقل و حذف شد');break;}
    /* review */
    case 'rw':S.reviewOffset=Number(v)===0?0:S.reviewOffset-1;render();break;
    case 'rcheck':{const ws=addDays(weekStart(today()),7*S.reviewOffset);const rv=Object.assign({id:ws},S.reviews[ws]||{});rv.checks=Object.assign({},rv.checks||{});rv.checks[b.dataset.k]=b.checked;put('reviews',rv);break;}
    case 'rsave':{const ws=v;const rv=Object.assign({id:ws},S.reviews[ws]||{},{wins:val('rv-wins'),stuck:val('rv-stuck'),next:val('rv-next')});['wins','stuck','next'].forEach(k=>delete S.drafts['rv-'+ws+'-'+k]);put('reviews',rv);toast('یادداشت ذخیره شد');break;}
    /* connection */
    case 'cconnect':{const u=val('c-url').trim(),t=val('c-token').trim();
      if(!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(u)){toast('آدرس باید با https://script.google.com/macros/s/ شروع و با /exec تمام شود.');break;}
      if(t.length<32){toast('کلید دسترسی کوتاه است.');break;}connect({u,t});break;}
    case 'ccode':{const c=decodeConn(val('c-code'));if(!c){toast('کد اتصال معتبر نیست.');break;}connect(c);break;}
    case 'copycode':{const txt=v==='link'?appLink():encodeConn(CONN);
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(()=>toast('کپی شد'),selectCode);else selectCode();break;}
    case 'disconnect':if(!arm(b))break;
      try{localStorage.removeItem(CONNKEY);localStorage.removeItem(CKEY);localStorage.removeItem(PKEY);}catch(x){}
      CONN=null;pending=[];S.tasks={};S.projects={};S.reviews={};S.domains={};S.events={};S.people={};S.updates={};S.loaded=false;closeSheet();render();break;
  }
});
function selectCode(){const c=document.getElementById('codebox');if(!c)return;const r=document.createRange();r.selectNodeContents(c);const s=window.getSelection();s.removeAllRanges();s.addRange(r);toast('متن انتخاب شد؛ کپی کن.');}
document.addEventListener('input',e=>{
  const t=e.target;if(t.dataset&&t.dataset.draft)S.drafts[t.dataset.draft]=t.value;
  if(['f-plan','f-due','p-deadline','e-date'].includes(t.id))jlUpdate(t.id);
  if(t.id==='f-minutes'||t.id==='f-title')atomPreview();
  if(t.id==='m-lines')multiPreview();
  if(t.id==='q-title')qPreview();
  if(t.classList&&t.classList.contains('arange')){const pid=t.dataset.pid;S.ar[pid]=Number(t.value);const o=document.getElementById('ao-'+pid);if(o)o.textContent=fa(t.value)+'٪';}
  if(t.id==='psearch'){S.psearch=t.value;render();}
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.id==='f-domain'){const s=document.getElementById('f-project');if(s)s.innerHTML=projOptions(t.value,'');}
  if(t.id==='e-allday'){const tb=document.getElementById('e-timebox');if(tb)tb.hidden=t.checked;}
  if(t.id==='e-date'&&t.value&&S.evDraft){S.evDraft.date=t.value;$('#e-week').innerHTML=evWeekHtml();}
  if(['f-plan','f-due','p-deadline','p-start','e-date'].includes(t.id))jlUpdate(t.id);
});
document.addEventListener('keydown',e=>{
  const sh=!$('#sheet').hidden;
  if(e.key==='Escape'&&sh){closeSheet();return;}
  const t=e.target;
  if(e.key==='Enter'&&t.id&&t.id.indexOf('an-')===0){e.preventDefault();const wr=t.closest('.assess');if(wr)saveAssess(wr.dataset.pid,wr);return;}
  if(e.key==='Enter'&&t.dataset&&t.dataset.enter==='padd'){e.preventDefault();const c=t.closest('[data-pid]');if(c)addSub(c.dataset.pid);return;}
  if(e.key==='Enter'&&t.id==='q-title'){e.preventDefault();quickSave();return;}
  if(e.key==='Enter'&&sh&&t.tagName==='INPUT'&&t.type!=='checkbox'){
    const s=$('#sheet [data-act="tsave"],#sheet [data-act="psave"],#sheet [data-act="ssave"],#sheet [data-act="esave"],#sheet [data-act="dsave"],#sheet [data-act="persave"]');if(s){e.preventDefault();s.click();}
  }
  if(!sh&&e.key==='n'&&!/INPUT|TEXTAREA|SELECT/.test(t.tagName)&&hasConn()){e.preventDefault();openSheet('quick');}
});
/* drag & drop (desktop) */
document.addEventListener('dragstart',e=>{const m=e.target.closest&&e.target.closest('.mini[data-id]');if(!m)return;e.dataTransfer.setData('text/plain',m.dataset.id);e.dataTransfer.effectAllowed='move';});
document.addEventListener('dragover',e=>{const d=e.target.closest&&e.target.closest('[data-day]');if(!d)return;e.preventDefault();d.classList.add('dragover');});
document.addEventListener('dragleave',e=>{const d=e.target.closest&&e.target.closest('[data-day]');if(d&&!d.contains(e.relatedTarget))d.classList.remove('dragover');});
document.addEventListener('drop',e=>{const d=e.target.closest&&e.target.closest('[data-day]');if(!d)return;e.preventDefault();d.classList.remove('dragover');
  const id=e.dataTransfer.getData('text/plain');const t=S.tasks[id];if(t&&t.plan!==d.dataset.day)put('tasks',Object.assign({},t,{plan:d.dataset.day,triaged:true}));});
/* tooltip */
const tipEl=$('#tip');let tipT=null;
function showTip(el,x,y){const s=el.getAttribute('data-tip');if(!s)return;tipEl.textContent=s;tipEl.hidden=false;const r=tipEl.getBoundingClientRect();
  let left=x-r.width/2,top=y-r.height-14;left=Math.max(8,Math.min(window.innerWidth-r.width-8,left));if(top<8)top=y+18;tipEl.style.left=left+'px';tipEl.style.top=top+'px';}
document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const el=e.target.closest&&e.target.closest('[data-tip]');if(el)showTip(el,e.clientX,e.clientY);else tipEl.hidden=true;});
document.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;const el=e.target.closest&&e.target.closest('[data-tip]');if(el){showTip(el,e.clientX,e.clientY);clearTimeout(tipT);tipT=setTimeout(()=>tipEl.hidden=true,2600);}else tipEl.hidden=true;});
window.addEventListener('scroll',()=>{tipEl.hidden=true;$('#topbar').classList.toggle('scrolled',window.scrollY>4);},{passive:true});

let tt=null;
function toast(msg){const el=$('#toast');el.textContent=msg;el.hidden=false;clearTimeout(tt);tt=setTimeout(()=>{el.hidden=true;},2600);}

/* ================= boot ================= */
(function(){
  const hm2=(location.hash||'').match(/[#&]c=(gam1\.[A-Za-z0-9_-]+)/);
  if(hm2){const c=decodeConn(hm2[1]);if(c){CONN=c;lsSet(CONNKEY,c);}try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}}
  const p=lsGet('x-prefs');if(p){['filter','capDom','period','planMode'].forEach(k=>{if(p[k])S[k]=p[k];});}
  if(new Date().getDay()===6)S.reviewOffset=-1;
  const c=lsGet(CKEY);
  if(c&&hasConn()){S.tasks=c.tasks||{};S.projects=c.projects||{};S.reviews=c.reviews||{};S.domains=c.domains||{};S.events=c.events||{};S.people=c.people||{};S.updates=c.updates||{};S.settings=mergeSettings(c.settings);rev=c.rev||0;pending.forEach(applyOp);S.loaded=true;fixFilter();}
  const vh=(location.hash||'').slice(1);
  S.view=VIEWS.includes(vh)&&vh!=='project'?vh:(S.settings.home||'home');
  render();
  if(hasConn())pull(true);
  setInterval(()=>{if(hasConn()&&!badToken&&document.visibilityState==='visible')pull(false);},20000);
  setInterval(()=>{if(S.view==='home'&&$('#sheet').hidden)render();},60000);
  document.addEventListener('visibilitychange',()=>{if(hasConn()&&document.visibilityState==='visible')pull(false);});
  window.addEventListener('online',()=>{online=true;flush();pull(false);});
})();
})();
