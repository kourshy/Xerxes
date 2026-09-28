# گام بعدی — وب‌اپ نصب‌شدنی

برنامهٔ مدیریت تسک سه‌حوزه‌ای (R&D هلدینگ، طراحی فریلنس، پژوهش دکتری) با قاعدهٔ «گام اتمی».
داده در Google Sheet شخصی ذخیره می‌شود و بین همهٔ دستگاه‌ها همگام است.

## ساختار

| مسیر | نقش |
|---|---|
| `index.html` | خود برنامه |
| `manifest.webmanifest` | نام، رنگ و آیکون برنامه برای نصب |
| `sw.js` | کش آفلاین پوستهٔ برنامه |
| `icons/` | آیکون‌ها (SVG منبع + PNG در اندازه‌های لازم) |
| `fonts/` | فونت وزیرمتن (مجوز OFL) — بدون وابستگی به Google Fonts |
| `vendor/qrcode.min.js` | ساخت QR برای اتصال گوشی (مجوز MIT) |
| `apps-script/Code.gs` | بک‌اند؛ در Apps Script کپی می‌شود، **نه** در میزبان وب |

## نصب

### ۱. بک‌اند (Google Sheet + Apps Script)
1. `sheets.new` ← نام «گام بعدی» ← File › Settings ← منطقهٔ زمانی Tehran.
2. Extensions › Apps Script ← محتوای `apps-script/Code.gs` را جایگزین کن. اگر از نسخهٔ قبل فایل `Index` داری، حذفش کن.
3. تابع `setupToken` را انتخاب و Run کن ← مجوزها را تأیید کن ← از Execution log «کلید دسترسی» را کپی کن.
4. Deploy › New deployment ← Web app ← Execute as: **Me** ← Who has access: **Anyone** ← Deploy ← آدرس `/exec` را کپی کن.
   - «Anyone» لازم است چون برنامه بیرون از گوگل میزبانی می‌شود؛ بدون کلید دسترسی هیچ داده‌ای برنمی‌گردد.
5. (اختیاری) تابع `installWeeklyDigest` را یک بار Run کن ← خلاصهٔ هفتگی شنبه‌ها ۷ صبح.

### ۲. میزبانی برنامه (GitHub Pages، رایگان)
1. در GitHub یک مخزن تازه بساز، مثلاً `gam` (Public).
2. Add file › Upload files ← همهٔ محتوای این پوشه (به‌جز `apps-script/` که اختیاری است) را بکش و Commit کن.
3. Settings › Pages ← Source: Deploy from a branch ← Branch: `main` / `(root)` ← Save.
4. پس از یکی‌دو دقیقه برنامه در `https://<نام‌کاربری>.github.io/gam/` در دسترس است.

### ۳. نصب روی دستگاه‌ها
- **کامپیوتر (Chrome/Edge):** آدرس را باز کن ← آدرس `/exec` و کلید را وارد کن ← آیکون «نصب» در نوار آدرس (یا منو › Install گام بعدی).
- **گوشی:** در برنامهٔ کامپیوتر: تنظیمات ← کد QR را با دوربین گوشی اسکن کن ← برنامه وصل می‌شود.
  - اندروید (Chrome): منو ⋮ › Install app / Add to Home screen.
  - آیفون (Safari): Share › Add to Home Screen ← برنامه را از صفحهٔ اصلی باز کن؛ اگر صفحهٔ اتصال آمد، «کد اتصال» را (از تنظیمات کامپیوتر، از طریق پیام‌رسان به خودت) بچسبان. iOS حافظهٔ برنامهٔ نصب‌شده را از Safari جدا نگه می‌دارد.

## به‌روزرسانی
- **برنامه:** فایل‌ها را در GitHub جایگزین کن و در `sw.js` مقدار `VERSION` را یکی بالا ببر (مثلاً `gam-v2`).
- **بک‌اند:** کد را عوض کن ← Deploy › Manage deployments ← ویرایش ← Version: New version (آدرس ثابت می‌ماند).

## تغییر نام
`name` و `short_name` در `manifest.webmanifest`، `<title>` و `apple-mobile-web-app-title` و `<h1>` در `index.html`.

## امنیت
- کد اتصال و کلید دسترسی حکم رمز عبور دارند. اگر لو رفت: تابع `rotateToken` را Run کن و دستگاه‌ها را دوباره وصل کن.
- مخزن GitHub عمومی است ولی هیچ داده یا کلیدی در آن نیست؛ کلید فقط در حافظهٔ مرورگر دستگاه‌های خودت می‌ماند.
