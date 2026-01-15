// 파일: C:\Enfant-Terrible\front_react\server.cjs
// 실행: node .\server.cjs
// 서버: http://localhost:8080
// 데이터: C:\Enfant-Terrible\front_react\db.json

const jsonServer = require("json-server");
const path = require("path");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));

server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);

// ✅ 지금 실행 중인 server.cjs가 맞는지 확인용
server.get("/ping", (req, res) => res.status(200).send("pong"));

// ✅ 요청 로그(라우트 매칭 여부 확인용)
server.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

// ---------------------------
// 공통 응답 래퍼
// ---------------------------
function ok(res, data, message = "OK") {
  return res.status(res.statusCode || 200).json({ success: true, message, data });
}
function fail(res, status, message) {
  return res.status(status).json({ success: false, message, data: null });
}

// ---------------------------
// json-server 라우터 응답도 래퍼로 통일
// ---------------------------
router.render = (req, res) => {
  return ok(res, res.locals.data, "OK");
};

// ---------------------------
// 유틸
// ---------------------------
function toInt(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeUserId(u) {
  if (u && typeof u === "object") {
    if (typeof u.userId === "number") return u.userId;
    if (typeof u.id === "number") return u.id;
  }
  return NaN;
}

// ---------------------------
// 0) 관리자 로그인 (커스텀)
// POST /admin/auth/sign-in
// POST /api/admin/auth/sign-in  ✅ alias
// ---------------------------
function handleAdminSignIn(req, res) {
  const body = req.body || {};
  const adminId = String(body.adminId ?? "").trim();
  const password = String(body.password ?? "").trim();

  if (!adminId || !password) {
    return fail(res, 400, "adminId/password가 필요합니다.");
  }

  const db = router.db;
  const user = db.get("users").find({ username: adminId, password }).value();

  if (!user) {
    return fail(res, 401, "아이디 또는 비밀번호가 올바르지 않습니다.");
  }

  return ok(
    res,
    {
      adminId: user.username,
      accessToken: `mock-token-${user.id}`,
    },
    "로그인 성공"
  );
}

server.post("/admin/auth/sign-in", handleAdminSignIn);
server.post("/api/admin/auth/sign-in", handleAdminSignIn);

// ---------------------------
// 1) 매출 대시보드 (커스텀)
// GET /admin/amount/daily
// GET /admin/amount
// + /api/admin alias
// ---------------------------
function getRange(req) {
  const from = String(req.query?.from ?? "").trim();
  const to = String(req.query?.to ?? "").trim();
  return { from, to };
}
function inRange(dateStr, from, to) {
  if (from && dateStr < from) return false;
  if (to && dateStr > to) return false;
  return true;
}
function pickDailyRows(from, to, db) {
  const daily = db.get("amountDaily").value() || [];
  return daily
    .filter((r) => inRange(String(r.date ?? ""), from, to))
    .map((r) => ({
      date: String(r.date ?? ""),
      orderCount: Number(r.orderCount ?? 0),
      refundCount: Number(r.refundCount ?? 0),
      totalAmount: Number(r.totalAmount ?? 0),
      completedDeliveryCount: Number(r.completedDeliveryCount ?? 0),
    }));
}

function handleAmountDaily(req, res) {
  const { from, to } = getRange(req);
  const db = router.db;

  const rows = pickDailyRows(from, to, db);
  const summary = rows.reduce(
    (acc, r) => {
      acc.totalAmount += r.totalAmount;
      acc.orderCount += r.orderCount;
      acc.refundCount += r.refundCount;
      acc.completedDeliveryCount += r.completedDeliveryCount;
      return acc;
    },
    { totalAmount: 0, orderCount: 0, refundCount: 0, completedDeliveryCount: 0 }
  );

  return ok(res, summary, "OK");
}

function handleAmount(req, res) {
  const { from, to } = getRange(req);
  const db = router.db;

  const rows = pickDailyRows(from, to, db).map((r) => ({
    date: r.date,
    orderCount: r.orderCount,
    refundCount: r.refundCount,
    totalAmount: r.totalAmount,
  }));

  return ok(res, rows, "OK");
}

server.get("/admin/amount/daily", handleAmountDaily);
server.get("/admin/amount", handleAmount);

server.get("/api/admin/amount/daily", handleAmountDaily);
server.get("/api/admin/amount", handleAmount);

// ---------------------------
// 2) 사용자 관리 (커스텀)  ✅ 핵심
// 프론트 호출: GET http://localhost:8080/api/admin/users?page=0&size=20
// ---------------------------

// 목록: data = { rows, page, message }
server.get("/api/admin/users", (req, res) => {
  const page = toInt(req.query?.page, 0);
  const size = toInt(req.query?.size, 20);

  const db = router.db;
  const all = db.get("users").value() || [];

  const start = page * size;
  const sliced = all.slice(start, start + size);

  const rows = sliced.map((u) => ({ ...u, userId: normalizeUserId(u) }));

  return ok(res, { rows, page, message: "" }, "OK");
});

// 상세: data = { user, message }
server.get("/api/admin/users/:userId", (req, res) => {
  const userId = toInt(req.params.userId, NaN);
  if (!Number.isFinite(userId)) return fail(res, 400, "invalid userId");

  const db = router.db;
  const all = db.get("users").value() || [];
  const found = all.find((u) => normalizeUserId(u) === userId);

  if (!found) return fail(res, 404, "not found");

  return ok(res, { user: { ...found, userId: normalizeUserId(found) }, message: "" }, "OK");
});

// 상태 변경: PATCH /api/admin/users/:userId/status  body: { status }
server.patch("/api/admin/users/:userId/status", (req, res) => {
  const userId = toInt(req.params.userId, NaN);
  if (!Number.isFinite(userId)) return fail(res, 400, "invalid userId");

  const nextStatus = String(req.body?.status ?? "").trim();
  if (!nextStatus) return fail(res, 400, "status required");

  const db = router.db;
  const all = db.get("users").value() || [];
  const found = all.find((u) => normalizeUserId(u) === userId);
  if (!found) return fail(res, 404, "not found");

  db.get("users").find({ id: found.id }).assign({ status: nextStatus, userId }).write();

  return ok(res, { message: "" }, "OK");
});

// ---------------------------
// 3) 나머지 리소스는 /admin 및 /api/admin 하위로 라우터 연결
// ⚠️ 커스텀 라우트는 반드시 이 줄들보다 "위"에 있어야 합니다.
// ---------------------------
server.use("/admin", router);
server.use("/api/admin", router);

server.listen(8080, () => {
  console.log("Mock server running: http://localhost:8080");
});
