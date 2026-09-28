/**
 * Xerxes — بک‌اند Google Apps Script (نسخهٔ ۳)
 * داده در همین Google Sheet: tasks / projects / reviews / domains / events / settings
 * رویدادها در صورت فعال بودن، با تقویم جداگانهٔ «Xerxes» در Google Calendar همگام می‌شوند.
 */

const SCHEMA = {
  tasks: ['id','title','domain','projectId','minutes','priority','plan','due','note','status','doneDay','doneAt','triaged','createdAt','order','sample'],
  projects: ['id','title','domain','goal','deadline','status','createdAt','sample'],
  reviews: ['id','wins','stuck','next','checks','autoText','autoAt'],
  domains: ['id','name','color','budget','order','archived','createdAt'],
  events: ['id','title','type','date','time','duration','repeat','remind','note','domain','sync','gcal','gcalErr','createdAt','archived']
};
const NUM = {minutes:1, priority:1, order:1, budget:1, duration:1, remind:1};
const BOOL = {triaged:1, sample:1, archived:1, sync:1};
const JSONF = {checks:1, gcal:1};
const ISO = {createdAt:1, doneAt:1, autoAt:1};
const TZ = 'Asia/Tehran';
const SETUP_VERSION = '2';
const VAGUE = ['کار روی','بررسی','تحقیق','پیگیری','فکر کردن','فکر','مطالعه','آماده سازی','تکمیل','انجام','ادامه','رسیدگی','مدیریت','تحلیل','نهایی سازی','بهبود','تمام کردن','شروع'];
const TYPE_LABEL = {meeting:'جلسه', task:'کار', birthday:'تولد', event:'مناسبت', reminder:'یادآور'};

/* ---------- JSON API ---------- */
function doGet() { return json_({ok: true, app: 'xerxes', hint: 'POST only'}); }

function doPost(e) {
  let out;
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!checkToken_(req.token)) out = {ok: false, error: 'bad_token'};
    else if (req.action === 'rev') out = {ok: true, rev: rev_()};
    else if (req.action === 'state') out = {ok: true, state: getState_()};
    else if (req.action === 'ops') out = {ok: true, rev: applyOps_(req.ops)};
    else out = {ok: false, error: 'bad_action'};
  } catch (err) {
    out = {ok: false, error: 'server', message: String(err && err.message || err)};
  }
  return json_(out);
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function checkToken_(t) {
  const k = PropertiesService.getScriptProperties().getProperty('TOKEN');
  return !!k && typeof t === 'string' && t.length >= 32 && t === k;
}

/** یک بار اجرا کنید: شیت‌ها را می‌سازد/مهاجرت می‌دهد و کلید دسترسی را در Execution log نشان می‌دهد */
function setupToken() {
  const p = PropertiesService.getScriptProperties();
  let k = p.getProperty('TOKEN');
  if (!k) { k = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, ''); p.setProperty('TOKEN', k); }
  setup_();
  Logger.log('کلید دسترسی (TOKEN): ' + k);
  return k;
}
/** اگر کلید لو رفت: کلید تازه می‌سازد و کلید قبلی را باطل می‌کند */
function rotateToken() { PropertiesService.getScriptProperties().deleteProperty('TOKEN'); return setupToken(); }

/** یک بار اجرا کنید تا مجوز تقویم داده شود و تقویم «Xerxes» ساخته شود */
function setupCalendar() {
  const cal = cal_();
  Logger.log('تقویم آماده است: ' + cal.getName() + ' — ' + cal.getId());
  return cal.getId();
}

function getState_() {
  setup_();
  return {tasks: read_('tasks'), projects: read_('projects'), reviews: read_('reviews'),
    domains: read_('domains'), events: read_('events'), settings: readSettings_(), rev: rev_()};
}

/** ops: [{t:'put',kind,obj} | {t:'del',kind,id} | {t:'settings',obj}] */
function applyOps_(ops) {
  if (!Array.isArray(ops)) throw new Error('bad ops');
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    setup_();
    const idx = {};
    ops.slice(0, 100).forEach(function (op) {
      if (!op) return;
      if (op.t === 'put' && SCHEMA[op.kind] && op.obj && op.obj.id) {
        if (op.kind === 'events') syncEvent_(op.obj, idx);
        upsert_(op.kind, op.obj, idx);
      } else if (op.t === 'del' && SCHEMA[op.kind] && op.id) {
        if (op.kind === 'events') { const old = findRow_('events', String(op.id), idx); if (old) removeGcal_(old.gcal); }
        remove_(op.kind, String(op.id), idx);
      } else if (op.t === 'settings' && op.obj) writeSettings_(op.obj);
    });
    SpreadsheetApp.flush();
    bump_();
    return rev_();
  } finally {
    lock.releaseLock();
  }
}

/** ویرایش مستقیم شیت هم نسخه را بالا می‌برد تا دستگاه‌ها تازه شوند */
function onEdit() { try { bump_(); } catch (e) {} }

/* ---------- sheet helpers ---------- */
function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function sheet_(name) { const ss = ss_(); return ss.getSheetByName(name) || ss.insertSheet(name); }

function setup_() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('setup') === SETUP_VERSION) return;
  Object.keys(SCHEMA).forEach(function (n) {
    const sh = sheet_(n), cols = SCHEMA[n];
    sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.setRightToLeft(true);
    const rows = Math.max(sh.getMaxRows() - 1, 1);
    cols.forEach(function (c, i) { if (!NUM[c] && !BOOL[c]) sh.getRange(2, i + 1, rows, 1).setNumberFormat('@'); });
  });
  const st = sheet_('settings');
  if (st.getLastRow() < 2) {
    st.getRange(1, 1, 7, 2).setValues([['key','value'],['budget_rnd',20],['budget_design',10],['budget_phd',15],['atom',25],['focus',3],['gcal_default',1]]);
    st.getRange(1, 1, 1, 2).setFontWeight('bold');
  }
  st.setRightToLeft(true);
  // مهاجرت: سه حوزهٔ اولیه با بودجه‌های قبلی
  if (sheet_('domains').getLastRow() < 2) {
    const m = settingsMap_(), now = new Date().toISOString(), idx = {};
    [['rnd', 'R&D هلدینگ', 'c4', m.budget_rnd || 20], ['design', 'طراحی فریلنس', 'c5', m.budget_design || 10], ['phd', 'پژوهش دکتری', 'c7', m.budget_phd || 15]]
      .forEach(function (d, i) { upsert_('domains', {id: d[0], name: d[1], color: d[2], budget: d[3], order: (i + 1) * 10, archived: false, createdAt: now}, idx); });
  }
  const def = ss_().getSheetByName('Sheet1') || ss_().getSheetByName('Sheet 1') || ss_().getSheetByName('برگه1');
  if (def && def.getLastRow() === 0 && ss_().getSheets().length > 1) { try { ss_().deleteSheet(def); } catch (e) {} }
  if (!props.getProperty('rev')) props.setProperty('rev', '1');
  props.setProperty('setup', SETUP_VERSION);
}

function rev_() { return Number(PropertiesService.getScriptProperties().getProperty('rev') || '1'); }
function bump_() { PropertiesService.getScriptProperties().setProperty('rev', String(rev_() + 1)); }

function norm_(c, v) {
  if (v instanceof Date) return ISO[c] ? v.toISOString() : Utilities.formatDate(v, ss_().getSpreadsheetTimeZone(), c === 'time' ? 'HH:mm' : 'yyyy-MM-dd');
  if (NUM[c]) return (v === '' || v === null) ? null : Number(v);
  if (BOOL[c]) return v === true || String(v).toUpperCase() === 'TRUE';
  if (JSONF[c]) { try { return v ? JSON.parse(v) : (c === 'gcal' ? [] : {}); } catch (e) { return c === 'gcal' ? [] : {}; } }
  return (v === null || v === undefined) ? '' : String(v);
}
function cell_(c, v) {
  if (JSONF[c]) return JSON.stringify(v || (c === 'gcal' ? [] : {}));
  if (NUM[c]) return (v === null || v === undefined || v === '' || isNaN(Number(v))) ? '' : Number(v);
  if (BOOL[c]) return !!v;
  let s = (v === null || v === undefined) ? '' : String(v);
  if (s.charAt(0) === '=') s = "'" + s; // جلوگیری از تفسیر به‌عنوان فرمول
  return s.slice(0, 5000);
}
function read_(name) {
  const sh = sheet_(name), n = sh.getLastRow(), cols = SCHEMA[name];
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, cols.length).getValues()
    .filter(function (r) { return r[0] !== ''; })
    .map(function (r) { const o = {}; cols.forEach(function (c, i) { o[c] = norm_(c, r[i]); }); return o; });
}
function ids_(kind, idx) {
  if (!idx[kind]) {
    const sh = sheet_(kind), n = sh.getLastRow();
    idx[kind] = n < 2 ? [] : sh.getRange(2, 1, n - 1, 1).getValues().map(function (r) { return String(r[0]); });
  }
  return idx[kind];
}
function findRow_(kind, id, idx) {
  const i = ids_(kind, idx).indexOf(id);
  if (i < 0) return null;
  const cols = SCHEMA[kind], r = sheet_(kind).getRange(i + 2, 1, 1, cols.length).getValues()[0], o = {};
  cols.forEach(function (c, k) { o[c] = norm_(c, r[k]); });
  return o;
}
function upsert_(kind, obj, idx) {
  const sh = sheet_(kind), cols = SCHEMA[kind], list = ids_(kind, idx), id = String(obj.id);
  const row = [cols.map(function (c) { return cell_(c, obj[c]); })];
  const i = list.indexOf(id);
  if (i >= 0) { sh.getRange(i + 2, 1, 1, cols.length).setValues(row); }
  else {
    const r = list.length + 2;
    cols.forEach(function (c, k) { if (!NUM[c] && !BOOL[c]) sh.getRange(r, k + 1).setNumberFormat('@'); });
    sh.getRange(r, 1, 1, cols.length).setValues(row);
    list.push(id);
  }
}
function remove_(kind, id, idx) {
  const list = ids_(kind, idx), i = list.indexOf(id);
  if (i < 0) return;
  sheet_(kind).deleteRow(i + 2);
  list.splice(i, 1);
}
function settingsMap_() {
  const sh = sheet_('settings'), n = sh.getLastRow(), m = {};
  if (n >= 2) sh.getRange(2, 1, n - 1, 2).getValues().forEach(function (r) { m[String(r[0])] = Number(r[1]); });
  return m;
}
function readSettings_() {
  const m = settingsMap_();
  return {atom: m.atom, focus: m.focus, gcalDefault: m.gcal_default !== 0};
}
function writeSettings_(s) {
  const m = settingsMap_();
  sheet_('settings').getRange(1, 1, 7, 2).setValues([['key','value'],
    ['budget_rnd', m.budget_rnd || 0], ['budget_design', m.budget_design || 0], ['budget_phd', m.budget_phd || 0],
    ['atom', Number(s.atom) || 25], ['focus', Number(s.focus) || 3], ['gcal_default', s.gcalDefault === false ? 0 : 1]]);
}

/* ---------- Google Calendar ---------- */
function cal_() {
  const p = PropertiesService.getScriptProperties();
  const id = p.getProperty('CAL_ID');
  let cal = id ? CalendarApp.getCalendarById(id) : null;
  if (!cal) {
    cal = CalendarApp.createCalendar('Xerxes', {summary: 'رویدادهای برنامهٔ Xerxes', timeZone: TZ});
    try { cal.setColor(CalendarApp.Color.TEAL); } catch (e) {}
    p.setProperty('CAL_ID', cal.getId());
  }
  return cal;
}
function removeGcal_(ids) {
  if (!ids || !ids.length) return;
  let cal; try { cal = cal_(); } catch (e) { return; }
  ids.forEach(function (x) {
    try {
      if (String(x).indexOf('s:') === 0) { const s = cal.getEventSeriesById(String(x).slice(2)); if (s) s.deleteEventSeries(); }
      else { const ev = cal.getEventById(String(x)); if (ev) ev.deleteEvent(); }
    } catch (e) {}
  });
}
/** رویداد را در تقویم بازسازی می‌کند و شناسه‌ها را روی obj می‌نویسد */
function syncEvent_(obj, idx) {
  const old = findRow_('events', String(obj.id), idx);
  const oldIds = old && old.gcal ? old.gcal : [];
  const occ = Array.isArray(obj.occ) ? obj.occ.slice(0, 15) : null;
  delete obj.occ;
  obj.gcalErr = '';
  if (!obj.sync || obj.archived) {
    removeGcal_(oldIds);
    obj.gcal = [];
    return;
  }
  try {
    const cal = cal_();
    removeGcal_(oldIds);
    const ids = [];
    const title = (TYPE_LABEL[obj.type] && obj.type !== 'event' ? TYPE_LABEL[obj.type] + ': ' : '') + obj.title;
    const desc = (obj.note || '') + '\n— Xerxes';
    const dur = Math.max(5, Number(obj.duration) || 60);
    const remind = (obj.remind === null || obj.remind === undefined || obj.remind === '') ? -1 : Number(obj.remind);
    const mk = function (dateKey, series) {
      let ev;
      if (obj.time) {
        const start = Utilities.parseDate(dateKey + ' ' + obj.time, TZ, 'yyyy-MM-dd HH:mm');
        const end = new Date(start.getTime() + dur * 60000);
        ev = series ? cal.createEventSeries(title, start, end, CalendarApp.newRecurrence().addWeeklyRule(), {description: desc})
                    : cal.createEvent(title, start, end, {description: desc});
      } else {
        const day = Utilities.parseDate(dateKey + ' 12:00', TZ, 'yyyy-MM-dd HH:mm');
        ev = series ? cal.createAllDayEventSeries(title, day, CalendarApp.newRecurrence().addWeeklyRule(), {description: desc})
                    : cal.createAllDayEvent(title, day, {description: desc});
      }
      try {
        ev.removeAllReminders();
        if (remind >= 0) ev.addPopupReminder(remind);
      } catch (e) {}
      try { if (obj.type === 'birthday') ev.setColor(CalendarApp.EventColor.MAUVE); else if (obj.type === 'meeting') ev.setColor(CalendarApp.EventColor.BLUE); } catch (e) {}
      ids.push((series ? 's:' : '') + ev.getId());
    };
    if (obj.repeat === 'weekly') mk(obj.date, true);
    else if ((obj.repeat === 'monthly' || obj.repeat === 'yearly') && occ && occ.length) occ.forEach(function (d) { mk(d, false); });
    else mk(obj.date, false);
    obj.gcal = ids;
  } catch (e) {
    obj.gcal = [];
    obj.gcalErr = String(e && e.message || e).slice(0, 300);
  }
}

/* ---------- weekly digest (بدون AI، قاعده‌محور) ---------- */
/** یک بار دستی اجرا کنید تا هر شنبه ساعت ۷ صبح به وقت تهران خلاصه ایمیل شود */
function installWeeklyDigest() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'weeklyDigest') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('weeklyDigest').timeBased().onWeekDay(ScriptApp.WeekDay.SATURDAY).atHour(7).inTimezone(TZ).create();
}

function weeklyDigest() {
  setup_();
  const today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
  const ws = addDays_(weekStart_(today), -7), we = addDays_(ws, 6);
  const doms = read_('domains').filter(function (d) { return !d.archived; });
  const live = {}; doms.forEach(function (d) { live[d.id] = d; });
  const tasks = read_('tasks').filter(function (t) { return live[t.domain]; });
  const projects = read_('projects').filter(function (p) { return live[p.domain]; });
  const s = readSettings_();
  const inW = function (k) { return k && k >= ws && k <= we; };
  const open = function (t) { return t.status !== 'done'; };
  const L = [];
  L.push('بازبینی هفتهٔ ' + ws + ' تا ' + we, '', '۱. انجام‌شده نسبت به بودجهٔ ساعت');
  doms.forEach(function (d) {
    const dn = tasks.filter(function (t) { return t.domain === d.id && !open(t) && inW(t.doneDay); });
    const m = dn.reduce(function (a, t) { return a + (t.minutes || 0); }, 0);
    L.push('- ' + d.name + ': ' + dn.length + ' کار، ' + (Math.round(m / 6) / 10) + ' از ' + (d.budget || 0) + ' ساعت');
  });
  const overdue = tasks.filter(function (t) { return open(t) && t.triaged !== false && ((t.due && t.due < today) || (t.plan && t.plan < today)); });
  const inbox = tasks.filter(function (t) { return open(t) && t.triaged === false; });
  L.push('- عقب‌افتادهٔ باز: ' + overdue.length + ' · صندوق دسته‌بندی‌نشده: ' + inbox.length, '', '۲. پروژه‌های نیازمند توجه');
  let any = false;
  projects.filter(function (p) { return p.status === 'active'; }).forEach(function (p) {
    const ts = tasks.filter(function (t) { return t.projectId === p.id; });
    const op = ts.filter(open);
    const last = ts.filter(function (t) { return !open(t) && t.doneDay; }).map(function (t) { return t.doneDay; }).sort().pop();
    const base = last || (p.createdAt ? String(p.createdAt).slice(0, 10) : today);
    const idle = daysBetween_(base, today), f = [];
    if (!op.length) f.push('بدون گام بعدی');
    if (idle >= 7) f.push('راکد ' + idle + ' روز');
    if (f.length) { any = true; L.push('- ' + p.title + ': ' + f.join('، ')); }
  });
  if (!any) L.push('- موردی نیست');
  L.push('', '۳. گام‌های درشت یا مبهم (باید خرد شوند)');
  const big = tasks.filter(function (t) { return open(t) && t.triaged !== false && !isAtomic_(t, s.atom || 25); });
  if (big.length) big.slice(0, 15).forEach(function (t) { L.push('- ' + t.title + (t.minutes ? ' (' + t.minutes + ' دقیقه)' : ' (بدون زمان)')); });
  else L.push('- موردی نیست');
  L.push('', '۴. ددلاین‌های ۱۴ روز آینده');
  const limit = addDays_(today, 14), dls = [];
  tasks.filter(function (t) { return open(t) && t.due && t.due >= today && t.due <= limit; }).forEach(function (t) { dls.push(t.due + ' — ' + t.title); });
  projects.filter(function (p) { return p.status !== 'done' && p.deadline && p.deadline >= today && p.deadline <= limit; }).forEach(function (p) { dls.push(p.deadline + ' — پروژه: ' + p.title); });
  dls.sort();
  if (dls.length) dls.forEach(function (x) { L.push('- ' + x); }); else L.push('- موردی نیست');
  const text = L.join('\n');

  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const idx = {};
    const prev = findRow_('reviews', ws, idx) || {id: ws};
    prev.autoText = text; prev.autoAt = new Date().toISOString();
    upsert_('reviews', prev, idx);
    SpreadsheetApp.flush(); bump_();
  } finally { lock.releaseLock(); }

  const to = Session.getEffectiveUser().getEmail();
  const appUrl = PropertiesService.getScriptProperties().getProperty('APP_URL');
  if (to) MailApp.sendEmail(to, 'Xerxes — بازبینی هفتهٔ ' + ws, text + (appUrl ? '\n\n' + appUrl : ''));
}

function isAtomic_(t, atom) {
  if (!t.minutes || t.minutes > atom) return false;
  const n = ' ' + String(t.title || '').replace(/‌/g, ' ').replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\s+/g, ' ').trim() + ' ';
  return !VAGUE.some(function (w) { return n.indexOf(' ' + w + ' ') >= 0; });
}
function addDays_(k, n) { const d = new Date(k + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function weekStart_(k) { const d = new Date(k + 'T00:00:00Z'); return addDays_(k, -((d.getUTCDay() + 1) % 7)); }
function daysBetween_(a, b) { return Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 864e5); }
