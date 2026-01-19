// mock/common.cjs
function ok(data, message) {
  return { success: true, message, data };
}

function fail(message) {
  return { success: false, message, data: null };
}

/* =========================
 * 날짜 유틸 (sales)
 * ========================= */
function parseYmd(s) {
  if (!s) return null;
  const str = String(s).trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (!m) return null;
  return { str };
}

function inRange(dateStr, fromStr, toStr) {
  // YYYY-MM-DD 문자열은 사전식 비교가 날짜 비교와 동일
  return dateStr >= fromStr && dateStr <= toStr;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toYmdLocal(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function ymdToDate(str) {
  const [y, m, d] = String(str).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function eachYmd(fromStr, toStr) {
  const from = ymdToDate(fromStr);
  const to = ymdToDate(toStr);
  const out = [];
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    out.push(toYmdLocal(d));
  }
  return out;
}

module.exports = { ok, fail, parseYmd, inRange, eachYmd };
