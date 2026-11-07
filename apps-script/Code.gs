/**
 * Xerxes — بک‌اند Google Apps Script (نسخهٔ ۴: مدیریت سبد پروژه)
 * داده در همین Google Sheet: tasks / projects / reviews / domains / events / people / updates / settings
 * رویدادها و یادآورها در تقویم جداگانهٔ «Xerxes» در Google Calendar.
 *
 * ستون‌های تازه همیشه به انتهای هر شیت اضافه می‌شوند تا دادهٔ نسخه‌های قبل جابه‌جا نشود.
 */

const SCHEMA = {
  tasks: ['id','title','domain','projectId','minutes','priority','plan','due','note','status','doneDay','doneAt','triaged','createdAt','order','sample',
          'assignee'],
  projects: ['id','title','domain','goal','deadline','status','createdAt','sample',
             'owner','type','priority','start','progress','progressAt','health','desc','stakeholder','stopRule','links'],
  reviews: ['id','wins','stuck','next','checks','autoText','autoAt'],
  domains: ['id','name','color','budget','order','archived','createdAt',
            'kind'],
  events: ['id','title','type','date','time','duration','repeat','remind','note','domain','sync','gcal','gcalErr','createdAt','archived'],
  people: ['id','name','role','skills','note','active','order','createdAt'],
  updates: ['id','projectId','date','progress','health','note','createdAt']
};
const NUM = {minutes:1, priority:1, order:1, budget:1, duration:1, remind:1, progress:1};
const BOOL = {triaged:1, sample:1, archived:1, sync:1, active:1};
const JSONF = {checks:1, gcal:1};
const ISO = {createdAt:1, doneAt:1, autoAt:1};
const TZ = 'Asia/Tehran';
const SETUP_VERSION = '3';

/* ساعت یادآور روزانه (ایمیل + تقویم). پس از تغییر، installReminders را دوباره اجرا کنید. */
const REMIND_HOUR = 9;
const REMIND_MIN = 30;

const SETTINGS_DEF = [['budget_rnd',20],['budget_design',10],['budget_phd',15],['atom',25],['focus',3],['gcal_default',1],
                      ['home','home'],['stale_days',7],['app_url','']];
const VAGUE = ['کار روی','بررسی','تحقیق','پیگیری','فکر کردن','فکر','مطالعه','آماده سازی','تکمیل','انجام','ادامه','رسیدگی','مدیریت','تحلیل','نهایی سازی','بهبود','تمام کردن','شروع'];
const TYPE_LABEL = {meeting:'جلسه', task:'کار', birthday:'تولد', event:'مناسبت', reminder:'یادآور'};
const HEALTH_LABEL = {g:'روی روال', y:'نیازمند توجه', r:'در خطر'};
const WD_FA = ['', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه', 'یکشنبه']; // اندیس = خروجی 'u'

/* ---------- JSON API ---------- */
function doGet() { return json_({ok: true, app: 'xerxes', version: 4, hint: 'POST only'}); }

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
    domains: read_('domains'), events: read_('events'), people: read_('people'), updates: read_('updates'),
    settings: readSettings_(), rev: rev_(), version: 4};
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
    if (sh.getMaxColumns() < cols.length) sh.insertColumnsAfter(sh.getMaxColumns(), cols.length - sh.getMaxColumns());
    sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.setRightToLeft(true);
    const rows = Math.max(sh.getMaxRows() - 1, 1);
    cols.forEach(function (c, i) { if (!NUM[c] && !BOOL[c]) sh.getRange(2, i + 1, rows, 1).setNumberFormat('@'); });
  });
  // تنظیمات: کلیدهای غایب اضافه می‌شوند، مقدارهای موجود دست نمی‌خورند
  const st = sheet_('settings');
  if (st.getLastRow() < 1) st.getRange(1, 1, 1, 2).setValues([['key', 'value']]);
  st.getRange(1, 1, 1, 2).setFontWeight('bold');
  const have = settingsMap_();
  SETTINGS_DEF.forEach(function (kv) { if (!(kv[0] in have)) st.appendRow([kv[0], kv[1]]); });
  st.setRightToLeft(true);
  // مهاجرت: سه حوزهٔ اولیه با بودجه‌های قبلی
  if (sheet_('domains').getLastRow() < 2) {
    const m = settingsMap_(), now = new Date().toISOString(), idx = {};
    [['rnd', 'R&D هلدینگ', 'c4', Number(m.budget_rnd) || 20, 'team'], ['design', 'طراحی فریلنس', 'c5', Number(m.budget_design) || 10, 'personal'], ['phd', 'پژوهش دکتری', 'c7', Number(m.budget_phd) || 15, 'personal']]
      .forEach(function (d, i) { upsert_('domains', {id: d[0], name: d[1], color: d[2], budget: d[3], order: (i + 1) * 10, archived: false, createdAt: now, kind: d[4]}, idx); });
  } else {
    // مهاجرت نسخهٔ ۴: حوزهٔ R&D تیمی، بقیه شخصی
    const idx = {};
    read_('domains').forEach(function (d) {
      if (!d.kind) { d.kind = d.id === 'rnd' ? 'team' : 'personal'; upsert_('domains', d, idx); }
    });
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

/* ---------- settings (کلید/مقدار) ---------- */
function settingsMap_() {
  const sh = sheet_('settings'), n = sh.getLastRow(), m = {};
  if (n >= 2) sh.getRange(2, 1, n - 1, 2).getValues().forEach(function (r) { if (r[0] !== '') m[String(r[0])] = r[1]; });
  return m;
}
function readSettings_() {
  const m = settingsMap_();
  return {atom: Number(m.atom) || 25, focus: Number(m.focus) || 3, gcalDefault: Number(m.gcal_default) !== 0,
    home: String(m.home || 'home'), staleDays: Number(m.stale_days) || 7, appUrl: String(m.app_url || '')};
}
function writeSettings_(s) {
  const sh = sheet_('settings'), n = sh.getLastRow();
  const keys = n >= 2 ? sh.getRange(2, 1, n - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];
  const set = function (k, v) {
    const i = keys.indexOf(k);
    if (i >= 0) sh.getRange(i + 2, 2).setValue(v); else { sh.appendRow([k, v]); keys.push(k); }
  };
  if ('atom' in s) set('atom', Number(s.atom) || 25);
  if ('focus' in s) set('focus', Number(s.focus) || 3);
  if ('gcalDefault' in s) set('gcal_default', s.gcalDefault === false ? 0 : 1);
  if ('home' in s && ['home', 'today', 'projects'].indexOf(String(s.home)) >= 0) set('home', String(s.home));
  if ('staleDays' in s) set('stale_days', Math.max(1, Math.min(60, Number(s.staleDays) || 7)));
  if ('appUrl' in s && /^https:\/\//.test(String(s.appUrl))) set('app_url', String(s.appUrl).slice(0, 500));
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

/* ---------- یادآورها (نسخهٔ ۴) ---------- */
/**
 * یک بار دستی اجرا کنید (و هر بار که REMIND_HOUR یا REMIND_MIN را عوض کردید):
 * - ایمیل روزانه حدود ساعت ۹:۳۰ (شنبه تا پنجشنبه؛ شنبه‌ها همراه با بخش بازبینی هفتگی)
 * - در تقویم «Xerxes»: رویداد تکرارشوندهٔ «مرور روزانه» (یکشنبه تا پنجشنبه) و «بازبینی هفتگی» (شنبه) با نوتیفیکیشن
 */
function installReminders() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    const h = t.getHandlerFunction();
    if (h === 'weeklyDigest' || h === 'dailyDigest') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('dailyDigest').timeBased().everyDays(1).atHour(REMIND_HOUR).nearMinute(REMIND_MIN).inTimezone(TZ).create();

  const p = PropertiesService.getScriptProperties();
  let old = []; try { old = JSON.parse(p.getProperty('REMIND_SERIES') || '[]'); } catch (e) {}
  removeGcal_(old);
  const cal = cal_();
  const url = readSettings_().appUrl;
  const today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
  const at = function (mins) {
    const s = Utilities.parseDate(today + ' ' + pad_(REMIND_HOUR) + ':' + pad_(REMIND_MIN), TZ, 'yyyy-MM-dd HH:mm');
    return [s, new Date(s.getTime() + mins * 60000)];
  };
  const W = CalendarApp.Weekday;
  const mk = function (title, mins, days, note) {
    const t = at(mins);
    const s = cal.createEventSeries(title, t[0], t[1], CalendarApp.newRecurrence().addWeeklyRule().onlyOnWeekdays(days),
      {description: note + (url ? '\n\n' + url : '') + '\n— Xerxes'});
    try { s.removeAllReminders(); s.addPopupReminder(0); } catch (e) {}
    try { s.setColor(CalendarApp.EventColor.GREEN); } catch (e) {}
    return 's:' + s.getId();
  };
  const ids = [
    mk('Xerxes — مرور روزانه', 10, [W.SUNDAY, W.MONDAY, W.TUESDAY, W.WEDNESDAY, W.THURSDAY], 'کارهای امروز و پروژه‌های نیازمند توجه را در Xerxes ببین.'),
    mk('Xerxes — بازبینی هفتگی', 30, [W.SATURDAY], 'ارزیابی پروژه‌به‌پروژه: پیشرفت، سلامت، یک خط یادداشت.')
  ];
  p.setProperty('REMIND_SERIES', JSON.stringify(ids));
  Logger.log('یادآورها نصب شد: ایمیل روزانه و دو رویداد تکرارشونده در تقویم Xerxes' + (url ? '' : ' (آدرس برنامه هنوز ثبت نشده؛ یک بار برنامه را باز کن و دوباره اجرا کن تا لینک در رویدادها بیاید)'));
}
/** سازگاری با نسخهٔ قبل */
function installWeeklyDigest() { installReminders(); }

function dailyDigest() {
  setup_();
  const u = Number(Utilities.formatDate(new Date(), TZ, 'u')); // 1=دوشنبه … 5=جمعه، 6=شنبه، 7=یکشنبه
  if (u === 5) return; // جمعه
  const today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
  const s = readSettings_();
  const L = [];
  const team = teamText_(today, s);
  L.push('Xerxes — ' + WD_FA[u] + ' ' + today, '');
  if (u === 6) L.push('امروز روز بازبینی هفتگی است: ' + team.active + ' پروژهٔ فعال منتظر ارزیابی.', '');
  L.push.apply(L, meText_(today));
  L.push('');
  L.push.apply(L, team.lines);
  if (u === 6) { L.push('', '— بخش شخصی هفتهٔ گذشته —', ''); L.push(weeklyText_(today)); }
  const text = L.join('\n');
  const to = Session.getEffectiveUser().getEmail();
  if (to) MailApp.sendEmail(to, (u === 6 ? 'Xerxes — بازبینی هفتگی ' : 'Xerxes — مرور روزانه ') + today, text + (s.appUrl ? '\n\n' + s.appUrl : ''));
}

function isTeamDom_(d) { return (d.kind || (d.id === 'rnd' ? 'team' : 'personal')) === 'team'; }
function liveDomains_() { const m = {}; read_('domains').filter(function (d) { return !d.archived; }).forEach(function (d) { m[d.id] = d; }); return m; }

function meText_(today) {
  const doms = liveDomains_();
  const tasks = read_('tasks').filter(function (t) { return doms[t.domain] && t.status !== 'done' && t.triaged !== false && !t.assignee; });
  const L = ['۱. کارهای امروز من'];
  const td = tasks.filter(function (t) { return t.plan === today || t.due === today; });
  if (td.length) td.slice(0, 15).forEach(function (t) { L.push('- ' + t.title + (t.due === today ? ' (سررسید امروز)' : '')); });
  else L.push('- چیزی برای امروز برنامه‌ریزی نشده');
  const late = tasks.filter(function (t) { return (t.plan && t.plan < today) || (t.due && t.due < today); });
  if (late.length) L.push('- عقب‌افتاده: ' + late.length + ' کار');
  return L;
}

function expected_(p, today) {
  if (!p.deadline) return null;
  const st = p.start || (p.createdAt ? String(p.createdAt).slice(0, 10) : today);
  const tot = daysBetween_(st, p.deadline);
  if (tot <= 0) return today >= p.deadline ? 100 : 0;
  return Math.max(0, Math.min(100, Math.round(daysBetween_(st, today) / tot * 100)));
}

function teamText_(today, s) {
  const doms = liveDomains_();
  const ppl = {}; read_('people').forEach(function (x) { ppl[x.id] = x.name; });
  const ps = read_('projects').filter(function (p) { return doms[p.domain] && isTeamDom_(doms[p.domain]) && (p.status || 'active') === 'active'; });
  const L = ['۲. پروژه‌های تیم نیازمند توجه'];
  let any = false;
  ps.forEach(function (p) {
    const f = [];
    if (p.health === 'r') f.push('در خطر');
    if (!p.progressAt) f.push('هرگز ارزیابی نشده');
    else { const n = daysBetween_(p.progressAt, today); if (n >= s.staleDays) f.push('ارزیابی ' + n + ' روز پیش'); }
    if (p.deadline) { const n = daysBetween_(today, p.deadline); if (n < 0) f.push('ددلاین ' + (-n) + ' روز گذشته'); else if (n <= 14) f.push(n + ' روز تا ددلاین'); }
    const ex = expected_(p, today);
    if (ex !== null && p.progress !== null && p.progress !== '' && Number(p.progress) < ex - 20) f.push('عقب از زمان (' + p.progress + '٪ در برابر ' + ex + '٪)');
    if (f.length) { any = true; L.push('- ' + p.title + ' [' + (p.owner ? (ppl[p.owner] || 'نامشخص') : 'خودم') + ']: ' + f.join('، ')); }
  });
  if (!any) L.push('- موردی نیست');
  return {lines: L, active: ps.length};
}

/* ---------- خلاصهٔ هفتگی حوزه‌های شخصی (قاعده‌محور) ---------- */
function weeklyText_(today) {
  const ws = addDays_(weekStart_(today), -7), we = addDays_(ws, 6);
  const all = read_('domains').filter(function (d) { return !d.archived; });
  const doms = all.filter(function (d) { return !isTeamDom_(d); });
  const live = {}; doms.forEach(function (d) { live[d.id] = d; });
  const tasks = read_('tasks').filter(function (t) { return live[t.domain]; });
  const projects = read_('projects').filter(function (p) { return live[p.domain]; });
  const s = readSettings_();
  const inW = function (k) { return k && k >= ws && k <= we; };
  const open = function (t) { return t.status !== 'done'; };
  const L = [];
  L.push('هفتهٔ ' + ws + ' تا ' + we, '', 'انجام‌شده نسبت به بودجهٔ ساعت');
  doms.forEach(function (d) {
    const dn = tasks.filter(function (t) { return t.domain === d.id && !open(t) && inW(t.doneDay); });
    const m = dn.reduce(function (a, t) { return a + (t.minutes || 0); }, 0);
    L.push('- ' + d.name + ': ' + dn.length + ' کار، ' + (Math.round(m / 6) / 10) + ' از ' + (d.budget || 0) + ' ساعت');
  });
  const inbox = tasks.filter(function (t) { return open(t) && t.triaged === false; });
  L.push('- صندوق دسته‌بندی‌نشده: ' + inbox.length, '', 'پروژه‌های شخصی راکد');
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
  L.push('', 'گام‌های درشت یا مبهم');
  const big = tasks.filter(function (t) { return open(t) && t.triaged !== false && !isAtomic_(t, s.atom || 25); });
  if (big.length) big.slice(0, 10).forEach(function (t) { L.push('- ' + t.title); }); else L.push('- موردی نیست');
  const text = L.join('\n');

  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const idx = {};
    const prev = findRow_('reviews', ws, idx) || {id: ws};
    prev.autoText = text; prev.autoAt = new Date().toISOString();
    upsert_('reviews', prev, idx);
    SpreadsheetApp.flush(); bump_();
  } finally { lock.releaseLock(); }
  return text;
}
/** سازگاری: اگر تریگر قدیمی هنوز فعال است، به ایمیل روزانه هدایت می‌شود */
function weeklyDigest() { dailyDigest(); }

function isAtomic_(t, atom) {
  if (!t.minutes || t.minutes > atom) return false;
  const n = ' ' + String(t.title || '').replace(/‌/g, ' ').replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\s+/g, ' ').trim() + ' ';
  return !VAGUE.some(function (w) { return n.indexOf(' ' + w + ' ') >= 0; });
}
function pad_(n) { return (n < 10 ? '0' : '') + n; }
function addDays_(k, n) { const d = new Date(k + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function weekStart_(k) { const d = new Date(k + 'T00:00:00Z'); return addDays_(k, -((d.getUTCDay() + 1) % 7)); }
function daysBetween_(a, b) { return Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 864e5); }
