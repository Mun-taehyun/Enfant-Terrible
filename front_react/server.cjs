// 파일: C:\Enfant-Terrible\front_react\server.cjs
// 목적: 프론트 고정 API를 목 서버에서 그대로 받기
// 실행: node .\server.cjs
// 서버: http://localhost:8080
// 데이터: C:\Enfant-Terrible\front_react\db.json

const jsonServer = require('json-server');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// ---------------------------
// 0) 관리자 로그인
// POST /admin/auth/sign-in
// body: { adminId, password }
// db.json: users[].username / users[].password
// ---------------------------
server.post('/admin/auth/sign-in', (req, res) => {
  let { adminId, password } = req.body || {};
  adminId = String(adminId ?? '').trim();
  password = String(password ?? '').trim();

  const db = router.db;
  const user = db.get('users').find({ username: adminId, password }).value();

  if (!user) {
    return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
  }

  return res.json({
    adminId: user.username,
    accessToken: `mock-token-${user.id}`,
  });
});

// ---------------------------
// 1) 매출 대시보드 (프론트 고정)
// Dashboard.tsx 기준:
// - summaryUrl = '/admin/amount/daily'  => 요약 객체(SalesSummary)
// - rowsUrl    = '/admin/amount'        => 일별 배열(SalesRow[])
// ---------------------------

function getRange(req) {
  const from = String(req.query?.from ?? '').trim();
  const to = String(req.query?.to ?? '').trim();
  return { from, to };
}

function inRange(dateStr, from, to) {
  // YYYY-MM-DD 문자열은 사전식 비교로 범위 비교가 안전합니다.
  if (from && dateStr < from) return false;
  if (to && dateStr > to) return false;
  return true;
}

function pickDailyRows(from, to, db) {
  const daily = db.get('amountDaily').value() || [];
  return daily
    .filter(r => inRange(String(r.date ?? ''), from, to))
    .map(r => ({
      date: String(r.date ?? ''),
      orderCount: Number(r.orderCount ?? 0),
      refundCount: Number(r.refundCount ?? 0),
      totalAmount: Number(r.totalAmount ?? 0),
      completedDeliveryCount: Number(r.completedDeliveryCount ?? 0),
    }));
}

// (A) 요약: GET /admin/amount/daily  -> SalesSummary 객체 반환
server.get('/admin/amount/daily', (req, res) => {
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

  return res.json(summary);
});

// (B) 일별 리스트: GET /admin/amount -> SalesRow[] 배열 반환
server.get('/admin/amount', (req, res) => {
  const { from, to } = getRange(req);
  const db = router.db;

  const rows = pickDailyRows(from, to, db).map(r => ({
    date: r.date,
    orderCount: r.orderCount,
    refundCount: r.refundCount,
    totalAmount: r.totalAmount,
  }));

  return res.json(rows);
});

// ---------------------------
// 2) 그 외 CRUD는 /admin/{resource}로도 접근 가능하게 mount
// 예: /admin/categories, /admin/products, /admin/notices ...
// ---------------------------
server.use('/admin', router);

// 필요하면 루트(/categories 같은 것도)도 그대로 열어둠
server.use(router);

server.listen(8080, () => {
  console.log('Mock server running: http://localhost:8080');
});
