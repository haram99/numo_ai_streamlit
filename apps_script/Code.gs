/**
 * أكاديمية نمو — استقبال بيانات لعبة «رحلة الذكاء الاصطناعي» وكتابتها في Google Sheets
 *
 * الاستخدام: الصقي هذا الملف في Apps Script (من داخل الجدول: الإضافات ← Apps Script)،
 * غيّري SECRET، ثم انشري: نشر ← نشر جديد ← تطبيق ويب
 *   تنفيذ باسم: أنا (Me)   |   من لديه حق الوصول: أي شخص (Anyone)
 */

const SHEET_NAME = 'اللاعبات';
// كلمة سر طويلة من اختيارك، ويجب أن تطابق APPS_SCRIPT_SECRET في Secrets الخاصة بـ Streamlit
const SECRET = 'Haram';
const HEADERS = ['المعرّف', 'تاريخ التسجيل', 'الاسم', 'رقم الجوال',
                 'درجة المستوى 1', 'نقاط المستوى 2', 'درجة المستوى 3',
                 'مجموع النقاط', 'آخر تحديث'];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    // أعمدة نصية: المعرّف، التاريخ، الجوال، آخر تحديث (يحفظ الصفر ولا يحوّل التاريخ)
    ['A:A', 'B:B', 'D:D', 'I:I'].forEach(function (r) { sheet.getRange(r).setNumberFormat('@'); });
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
      .setFontWeight('bold').setBackground('#1b6f86').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.setRightToLeft(true);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  let locked = false;
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.secret !== SECRET) return json_({ ok: false, error: 'unauthorized' });

    lock.waitLock(20000);  // يمنع تعارض الكتابة المتزامنة
    locked = true;
    const sheet = getSheet_();

    if (data.action === 'ping') {
      return json_({ ok: true, spreadsheet: sheet.getParent().getName(), sheet: sheet.getName(),
                     rows: Math.max(0, sheet.getLastRow() - 1), url: sheet.getParent().getUrl() });
    }

    if (data.action === 'list') {
      return json_({ ok: true, rows: sheet.getDataRange().getDisplayValues() });
    }

    if (data.action === 'upsert') {
      const row = data.row;
      if (!Array.isArray(row) || row.length !== HEADERS.length) {
        return json_({ ok: false, error: 'bad row' });
      }
      const last = sheet.getLastRow();
      let target = -1;
      if (last > 1) {
        const ids = sheet.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return String(r[0]); });
        const i = ids.indexOf(String(row[0]));
        if (i >= 0) target = i + 2;
      }
      if (target === -1) target = last + 1;
      sheet.getRange(target, 1, 1, HEADERS.length).setValues([row]);
      return json_({ ok: true, row: target });
    }

    return json_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    if (locked) lock.releaseLock();
  }
}

// يسمح بفتح الرابط في المتصفح للتأكد أن النشر يعمل (لا يعرض أي بيانات)
function doGet() {
  return json_({ ok: true, service: 'numo-ai-game' });
}
