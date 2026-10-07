# رحلة الذكاء الاصطناعي — أكاديمية نمو (Streamlit + Google Sheets عبر Apps Script)

لا يحتاج Google Cloud ولا حساب خدمة ولا مفتاح JSON. يكفي حساب Google عادي.

## الملفات
- `app.py` — التطبيق (يرسل البيانات إلى Apps Script؛ وإن لم يُضبط الرابط يحفظ في `players.xlsx` محليًا)
- `apps_script/Code.gs` — السكربت الذي يوضع في Google Sheets
- `logo.jpg`, `requirements.txt`, `secrets.toml.example`
- `app_gspread.py` (بديل عبر Google Cloud) و`app_excel_only.py` (Excel فقط)

## الخطوة 1: الجدول والسكربت
1. أنشئي Google Sheet جديدًا (فارغًا) بالاسم الذي تريدينه.
2. من الجدول: **الإضافات ← Apps Script** (أو *Extensions ← Apps Script*).
3. احذفي الكود الموجود، والصقي محتوى `apps_script/Code.gs`.
4. غيّري قيمة `SECRET` إلى كلمة سر طويلة عشوائية (احتفظي بها للخطوة 3). ثم **حفظ**.
5. **نشر ← نشر جديد** ← النوع: **تطبيق ويب**:
   - تنفيذ باسم: **أنا (Me)**
   - من لديه حق الوصول: **أي شخص (Anyone)**
   ثم **نشر**، ووافقي على الأذونات (قد تظهر «Google hasn't verified this app»: اختاري *Advanced ← Go to … (unsafe)* فهو سكربتك أنت).
6. انسخي **عنوان URL لتطبيق الويب** (ينتهي بـ `/exec`).

> عند تعديل `Code.gs` لاحقًا: *نشر ← إدارة عمليات النشر ← تعديل ← إصدار جديد*، وإلا يبقى الإصدار القديم يعمل.

## الخطوة 2: النشر على Streamlit
1. ارفعي المجلد إلى GitHub (`.gitignore` يمنع رفع الأسرار).
2. في https://share.streamlit.io اختاري *New app* ثم `app.py`.

## الخطوة 3: الأسرار
في *Manage app ← Settings ← Secrets* الصقي محتوى `secrets.toml.example` بعد تعبئته:
`APPS_SCRIPT_URL` و`APPS_SCRIPT_SECRET` (مطابقة لـ `SECRET` في Code.gs) و`ADMIN_PASSWORD`.

## الخطوة 4: التحقق
افتحي التطبيق ← الشريط الجانبي ← **لوحة المشرفة** ← كلمة المرور ← **اختبار الاتصال**.
تنشأ ورقة «اللاعبات» بعناوينها تلقائيًا عند أول اتصال.

## أشهر الأخطاء
| الرسالة | السبب والحل |
|---|---|
| `Apps Script: unauthorized` | `APPS_SCRIPT_SECRET` لا يطابق `SECRET` في Code.gs |
| `ردّ غير متوقع من Apps Script` | النشر ليس «Anyone»، أو الرابط ليس `/exec`، أو لم تُنشر نسخة جديدة بعد التعديل |
| `HTTPError 401/403/404` | الرابط خاطئ أو ناقص، أو صلاحية الوصول ليست Anyone |
| `Apps Script: Exception ...` | السكربت غير مرتبط بالجدول (أنشئيه من داخل الجدول: الإضافات ← Apps Script) |

## الأعمدة
المعرّف، تاريخ التسجيل، الاسم، رقم الجوال، درجة المستوى 1، نقاط المستوى 2، درجة المستوى 3، مجموع النقاط، آخر تحديث.
