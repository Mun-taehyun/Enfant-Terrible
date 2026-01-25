// mock/sales.routes.cjs
module.exports = function registerSalesRoutes(server, router, common) {
  const { ok, fail, inRange, eachYmd } = common;

  function ymdFromLocalDateTime(v) {
    if (!v) return null;
    const s = String(v);
    const idx = s.indexOf("T");
    if (idx === -1) return null;
    const ymd = s.slice(0, idx);
    // YYYY-MM-DD 최소 검증
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
    return ymd;
  }

  function monthKey(ymd) {
    // YYYY-MM-DD -> YYYY-MM
    return String(ymd).slice(0, 7);
  }

  // db.json에서 일별 매출 후보 키를 최대한 넓게 허용
  function getSalesDailyRows(db) {
    return (
      db.get("salesDaily").value() ||
      db.get("amountDaily").value() ||
      db.get("sales").value() ||
      []
    );
  }

  function normalizeDailyRow(r) {
    const date = String(r?.date ?? r?.period ?? "");
    const totalAmount = Number(r?.totalAmount ?? r?.amount ?? 0);
    const orderCount = Number(r?.orderCount ?? r?.paymentCount ?? r?.count ?? 0);
    return { date, totalAmount, orderCount };
  }

  function handleAdminSalesSummary(req, res) {
    const paidFromYmd = ymdFromLocalDateTime(req.query.paidFrom);
    const paidToYmd = ymdFromLocalDateTime(req.query.paidTo);
    const groupBy = String(req.query.groupBy || "DAY").toUpperCase();

    if (!paidFromYmd || !paidToYmd) {
      return res.status(400).json(fail("paidFrom/paidTo는 LocalDateTime(YYYY-MM-DDTHH:mm:ss) 형식으로 필수입니다."));
    }
    if (paidFromYmd > paidToYmd) {
      return res.status(400).json(fail("paidFrom은 paidTo보다 클 수 없습니다."));
    }
    if (groupBy !== "DAY" && groupBy !== "MONTH") {
      return res.status(400).json(fail("groupBy는 DAY 또는 MONTH 여야 합니다."));
    }

    const db = router.db;
    const raw = getSalesDailyRows(db)
      .map(normalizeDailyRow)
      .filter((r) => r.date && /^\d{4}-\d{2}-\d{2}$/.test(r.date))
      .filter((r) => inRange(r.date, paidFromYmd, paidToYmd));

    // 날짜가 빠진 구간도 채우고 싶으면 eachYmd 사용
    // (백이 빈 날짜를 내려주는지 불명확하니, 여기서는 "있는 데이터만" items로 구성)
    // 단, total은 있는 데이터 기준

    let items = [];
    if (groupBy === "DAY") {
      // 날짜별 합산 (같은 date가 여러 줄일 수 있어서 group)
      const map = new Map();
      for (const r of raw) {
        const prev = map.get(r.date) || { period: r.date, totalAmount: 0, paymentCount: 0 };
        prev.totalAmount += r.totalAmount;
        prev.paymentCount += r.orderCount;
        map.set(r.date, prev);
      }
      items = Array.from(map.values()).sort((a, b) => (a.period > b.period ? 1 : -1));
    } else {
      // 월별 합산
      const map = new Map();
      for (const r of raw) {
        const key = monthKey(r.date);
        const prev = map.get(key) || { period: key, totalAmount: 0, paymentCount: 0 };
        prev.totalAmount += r.totalAmount;
        prev.paymentCount += r.orderCount;
        map.set(key, prev);
      }
      items = Array.from(map.values()).sort((a, b) => (a.period > b.period ? 1 : -1));
    }

    const totalAmount = items.reduce((acc, it) => acc + Number(it.totalAmount || 0), 0);
    const totalCount = items.reduce((acc, it) => acc + Number(it.paymentCount || 0), 0);

    const data = {
      totalAmount,
      totalCount,
      items,
    };

    return res.json(ok(data, "관리자 기간별 매출 조회 성공"));
  }

  // ✅ Spring 스펙과 동일한 경로
  server.get("/api/admin/sales", handleAdminSalesSummary);

  // (기존에 /admin/amount, /admin/sales 같은 레거시가 필요하면 유지 가능)
  // 여기서는 "sales 404 해결"이 목적이라 /api/admin/sales만 확실히 보장합니다.
};
