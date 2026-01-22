// mock/sales.routes.cjs
module.exports = function registerSalesRoutes(server, router, common) {
  const { ok, fail, parseYmd, inRange, eachYmd } = common;

  function getSalesDailyRows(db, fromStr, toStr) {
    const rows = db.get("salesDaily").value() || db.get("amountDaily").value() || [];
    return rows
      .filter((r) => r?.date && inRange(String(r.date), fromStr, toStr))
      .map((r) => ({
        date: String(r.date),
        orderCount: Number(r.orderCount ?? 0),
        refundCount: Number(r.refundCount ?? 0),
        totalAmount: Number(r.totalAmount ?? 0),
        completedDeliveryCount: Number(r.completedDeliveryCount ?? 0),
      }));
  }

  function handleSalesDaily(req, res) {
    const from = parseYmd(req.query.from);
    const to = parseYmd(req.query.to);

    if (!from || !to) {
      return res.status(400).json(fail("from/to는 YYYY-MM-DD 형식으로 필수입니다."));
    }
    if (from.str > to.str) {
      return res.status(400).json(fail("from은 to보다 클 수 없습니다."));
    }

    const db = router.db;
    const raw = getSalesDailyRows(db, from.str, to.str);

    const map = new Map(raw.map((r) => [r.date, r]));
    const allDates = eachYmd(from.str, to.str);

    const filled = allDates.map((date) => {
      const r = map.get(date);
      return (
        r ?? {
          date,
          orderCount: 0,
          refundCount: 0,
          totalAmount: 0,
          completedDeliveryCount: 0,
        }
      );
    });

    // 주문 0건은 화면에서 제외
    const visible = filled.filter((r) => Number(r.orderCount ?? 0) !== 0);

    const pageData = {
      from: from.str,
      to: to.str,
      content: visible,
      rows: visible,
      totalElements: visible.length,
      totalPages: 1,
      page: 1,
      size: visible.length,
      number: 1,
      pageSize: visible.length,
    };

    return res.json({
      ...ok(pageData, "일별 매출 조회 성공"),
      content: visible,
      rows: visible,
      page: 1,
      size: visible.length,
      totalElements: visible.length,
      totalPages: 1,
      from: from.str,
      to: to.str,
    });
  }

  function handleSalesSummary(req, res) {
    const from = parseYmd(req.query.from);
    const to = parseYmd(req.query.to);

    if (!from || !to) {
      return res.status(400).json(fail("from/to는 YYYY-MM-DD 형식으로 필수입니다."));
    }
    if (from.str > to.str) {
      return res.status(400).json(fail("from은 to보다 클 수 없습니다."));
    }

    const db = router.db;
    const rows = getSalesDailyRows(db, from.str, to.str);

    const summary = rows.reduce(
      (acc, r) => {
        acc.orderCount += r.orderCount;
        acc.refundCount += r.refundCount;
        acc.totalAmount += r.totalAmount;
        acc.completedDeliveryCount += r.completedDeliveryCount;
        return acc;
      },
      {
        from: from.str,
        to: to.str,
        orderCount: 0,
        refundCount: 0,
        totalAmount: 0,
        completedDeliveryCount: 0,
      }
    );

    return res.json({
      ...ok(summary, "기간 매출 요약 조회 성공"),
      ...summary,
    });
  }

  /**
   * ✅ Spring 스펙 맞춤: GET /api/admin/sales
   * Query: paidFrom=YYYY-MM-DDTHH:mm:ss, paidTo=..., groupBy=DAY|MONTH
   * Response(data):
   * { totalAmount, totalCount, items:[{period,totalAmount,paymentCount}] }
   */
  function handleApiAdminSales(req, res) {
    const paidFromRaw = String(req.query.paidFrom ?? "");
    const paidToRaw = String(req.query.paidTo ?? "");
    const groupByRaw = String(req.query.groupBy ?? "DAY").toUpperCase();
    const groupBy = groupByRaw === "MONTH" ? "MONTH" : "DAY";

    // paidFrom/paidTo가 LocalDateTime이므로 date 부분(YYYY-MM-DD)만 뽑아서 기존 유틸(parseYmd/inRange) 재사용
    const paidFromDate = paidFromRaw.slice(0, 10);
    const paidToDate = paidToRaw.slice(0, 10);

    const from = parseYmd(paidFromDate);
    const to = parseYmd(paidToDate);

    if (!from || !to) {
      return res.status(400).json(fail("paidFrom/paidTo는 LocalDateTime 형식으로 필수입니다. 예: 2026-01-16T00:00:00"));
    }
    if (from.str > to.str) {
      return res.status(400).json(fail("paidFrom은 paidTo보다 클 수 없습니다."));
    }

    const db = router.db;
    const rows = getSalesDailyRows(db, from.str, to.str);

    // 여기서 totalCount는 백엔드 DTO상 "결제 건수(totalCount)"인데,
    // mock 원천 데이터가 일 단위 집계(salesDaily)라서 paymentCount를 orderCount로 매핑합니다.
    // (실제 백엔드는 결제 테이블 기반으로 paymentCount를 산출)
    if (groupBy === "DAY") {
      const items = rows
        .filter((r) => Number(r.orderCount ?? 0) !== 0)
        .map((r) => ({
          period: r.date,                 // YYYY-MM-DD
          totalAmount: Number(r.totalAmount ?? 0),
          paymentCount: Number(r.orderCount ?? 0), // mock에서는 orderCount를 결제건수로 사용
        }));

      const totalAmount = items.reduce((a, b) => a + b.totalAmount, 0);
      const totalCount = items.reduce((a, b) => a + b.paymentCount, 0);

      return res.json(
        ok(
          { totalAmount, totalCount, items },
          "관리자 기간별 매출 조회 성공"
        )
      );
    }

    // MONTH: YYYY-MM로 그룹핑
    const bucket = new Map(); // key: YYYY-MM -> { totalAmount, paymentCount }
    for (const r of rows) {
      if (Number(r.orderCount ?? 0) === 0) continue;
      const ym = String(r.date).slice(0, 7); // YYYY-MM
      const prev = bucket.get(ym) || { totalAmount: 0, paymentCount: 0 };
      prev.totalAmount += Number(r.totalAmount ?? 0);
      prev.paymentCount += Number(r.orderCount ?? 0);
      bucket.set(ym, prev);
    }

    const items = Array.from(bucket.entries())
      .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
      .map(([period, v]) => ({
        period, // YYYY-MM
        totalAmount: v.totalAmount,
        paymentCount: v.paymentCount,
      }));

    const totalAmount = items.reduce((a, b) => a + b.totalAmount, 0);
    const totalCount = items.reduce((a, b) => a + b.paymentCount, 0);

    return res.json(
      ok(
        { totalAmount, totalCount, items },
        "관리자 기간별 매출 조회 성공"
      )
    );
  }

  // 기존(레거시) 엔드포인트
  server.get("/admin/amount/daily", handleSalesDaily);
  server.get("/admin/amount", handleSalesSummary);

  server.get("/admin/sales/daily", handleSalesDaily);
  server.get("/admin/sales", handleSalesSummary);

  // ✅ Spring 스펙 엔드포인트 추가(404 해결)
  server.get("/api/admin/sales", handleApiAdminSales);
};
