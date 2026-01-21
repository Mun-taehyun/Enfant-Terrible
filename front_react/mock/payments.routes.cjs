// mock/payments.routes.cjs
// Spring AdminPaymentController 스펙 일치:
//  - GET    /api/admin/payments
//  - GET    /api/admin/payments/{paymentId}
//  - POST   /api/admin/payments/{paymentId}/cancel   (body: { amount, reason? })

module.exports = function registerPaymentsRoutes(server, router, common) {
  const { ok, fail } = common;

  const PAYMENTS_KEY = "payments";

  function getPaymentsDb() {
    const db = router.db;
    if (!db.has(PAYMENTS_KEY).value()) {
      db.set(PAYMENTS_KEY, []).write();
    }
    return db.get(PAYMENTS_KEY);
  }

  function toInt(v, def) {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  }

  function matchStr(val, cond) {
    if (cond == null || String(cond).trim() === "") return true;
    return String(val ?? "").includes(String(cond));
  }

  function matchEq(val, cond) {
    if (cond == null || String(cond).trim() === "") return true;
    return String(val ?? "") === String(cond);
  }

  // 목록
  server.get("/api/admin/payments", (req, res) => {
    const page = Math.max(1, toInt(req.query.page, 1));
    const size = Math.max(1, toInt(req.query.size, 20));

    const userId = req.query.userId;
    const orderId = req.query.orderId;
    const orderCode = req.query.orderCode;
    const paymentStatus = req.query.paymentStatus;

    const all = getPaymentsDb().value();

    const filtered = all.filter(p => {
      const okUser = userId ? String(p.userId) === String(userId) : true;
      const okOrder = orderId ? String(p.orderId) === String(orderId) : true;
      const okCode = matchStr(p.orderCode, orderCode);
      const okStatus = matchEq(p.paymentStatus, paymentStatus);
      return okUser && okOrder && okCode && okStatus;
    });

    // 최신순(createdAt desc)
    filtered.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")));

    const totalCount = filtered.length;
    const start = (page - 1) * size;
    const list = filtered.slice(start, start + size);

    return res.json(
      ok(
        { page, size, totalCount, list },
        "관리자 결제 목록 조회 성공"
      )
    );
  });

  // 상세
  server.get("/api/admin/payments/:paymentId", (req, res) => {
    const paymentId = String(req.params.paymentId);
    const p = getPaymentsDb().find(x => String(x.paymentId) === paymentId).value();
    if (!p) return res.status(404).json(fail("결제 정보를 찾을 수 없습니다."));
    return res.json(ok(p, "관리자 결제 상세 조회 성공"));
  });

  // 환불(취소)
  server.post("/api/admin/payments/:paymentId/cancel", (req, res) => {
    const paymentId = String(req.params.paymentId);
    const body = req.body || {};

    const amount = body.amount;
    const reason = body.reason;

    if (amount == null || Number.isFinite(Number(amount)) === false) {
      return res.status(400).json(fail("amount는 필수이며 숫자여야 합니다."));
    }

    const payments = getPaymentsDb();
    const found = payments.find(x => String(x.paymentId) === paymentId).value();
    if (!found) return res.status(404).json(fail("결제 정보를 찾을 수 없습니다."));

    // 금액 검증(단순)
    if (Number(found.paymentAmount) !== Number(amount)) {
      return res.status(400).json(fail("환불 금액이 결제 금액과 일치하지 않습니다."));
    }

    payments
      .find(x => String(x.paymentId) === paymentId)
      .assign({
        paymentStatus: "CANCELED",
        updatedAt: new Date().toISOString(),
        cancelReason: reason ?? null,
      })
      .write();

    // Spring은 ApiResponse.successMessage("관리자 환불 처리 완료") 형태
    // => data: null 로 통일
    return res.json({ success: true, message: "관리자 환불 처리 완료", data: null });
  });
};
