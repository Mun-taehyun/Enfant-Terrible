// mock/points.routes.cjs
// Spring 스펙 그대로:
// - GET  /api/admin/points/users/:userId/balance
// - GET  /api/admin/points/users/:userId/history?page=&size=&sortBy=&direction=
// - POST /api/admin/points/users/:userId/adjust

module.exports = function registerPointsRoutes(server, router, common) {
  const { ok, fail } = common;

  function toInt(v, fallback) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function normalizePaging(q) {
    let page = toInt(q.page, 1);
    let size = toInt(q.size, 20);

    if (page < 1) page = 1;
    if (size < 1) size = 20;
    if (size > 200) size = 200;

    return { page, size, offset: (page - 1) * size };
  }

  function normalizeSort(q) {
    const sortBy = String(q.sortBy || "").trim().toUpperCase();
    const direction = String(q.direction || "").trim().toUpperCase();

    const sb = sortBy === "CREATED_AT" ? "CREATED_AT" : "POINT_HISTORY_ID";
    const dir = direction === "ASC" ? "ASC" : "DESC";

    return { sortBy: sb, direction: dir };
  }

  function getPointHistoryAll() {
    // db.json 컬렉션 이름: pointHistory
    // (아래 db.json 섹션 추가 참고)
    const db = router.db; // lowdb
    const arr = db.get("pointHistory").value();
    return Array.isArray(arr) ? arr : [];
  }

  function setPointHistoryAll(next) {
    const db = router.db;
    db.set("pointHistory", next).write();
  }

  function nowIso() {
    return new Date().toISOString();
  }

  // 잔액 조회
  server.get("/api/admin/points/users/:userId/balance", (req, res) => {
    const userId = Number(req.params.userId);
    if (!Number.isFinite(userId)) return res.status(400).json(fail("userId가 올바르지 않습니다."));

    const all = getPointHistoryAll();
    const balance = all
      .filter((r) => Number(r.userId) === userId)
      .reduce((sum, r) => sum + (Number(r.pointAmount) || 0), 0);

    return res.json(ok({ userId, balance }, "관리자 포인트 잔액 조회 성공"));
  });

  // 히스토리 조회(페이징)
  server.get("/api/admin/points/users/:userId/history", (req, res) => {
    const userId = Number(req.params.userId);
    if (!Number.isFinite(userId)) return res.status(400).json(fail("userId가 올바르지 않습니다."));

    const { page, size, offset } = normalizePaging(req.query);
    const { sortBy, direction } = normalizeSort(req.query);

    const all = getPointHistoryAll().filter((r) => Number(r.userId) === userId);

    const sorted = all.slice().sort((a, b) => {
      if (sortBy === "CREATED_AT") {
        const at = String(a.createdAt || "");
        const bt = String(b.createdAt || "");
        if (at === bt) return (Number(a.pointHistoryId) || 0) - (Number(b.pointHistoryId) || 0);
        return at < bt ? -1 : 1;
      }
      return (Number(a.pointHistoryId) || 0) - (Number(b.pointHistoryId) || 0);
    });

    if (direction === "DESC") sorted.reverse();

    const totalCount = sorted.length;
    const list = sorted.slice(offset, offset + size);

    return res.json(
      ok(
        { page, size, totalCount, list },
        "관리자 포인트 히스토리 조회 성공"
      )
    );
  });

  // 포인트 조정
  server.post("/api/admin/points/users/:userId/adjust", (req, res) => {
    const userId = Number(req.params.userId);
    if (!Number.isFinite(userId)) return res.status(400).json(fail("userId가 올바르지 않습니다."));

    const body = req.body || {};
    const amount = body.amount;

    if (amount === null || amount === undefined || !Number.isFinite(Number(amount))) {
      return res.status(400).json(fail("요청 값이 비어있습니다."));
    }

    const reason = body.reason ?? null;
    const refType = body.refType ?? null;
    const refId = body.refId ?? null;

    const all = getPointHistoryAll();
    const maxId = all.reduce((m, r) => Math.max(m, Number(r.pointHistoryId) || 0), 0);
    const nextId = maxId + 1;

    const row = {
      pointHistoryId: nextId,
      userId,
      pointAmount: Number(amount),
      pointType: "ADMIN_ADJUST",
      reason,
      refType,
      refId: refId === null || refId === undefined ? null : Number(refId),
      createdAt: nowIso(),
    };

    all.push(row);
    setPointHistoryAll(all);

    return res.json(ok(null, "관리자 포인트 조정 완료"));
  });
};
