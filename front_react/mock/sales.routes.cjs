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

// sales.routes.cjs 하단 수정
server.get("/admin/amount/daily", handleSalesDaily);
server.get("/admin/amount", handleSalesSummary);

server.get("/admin/sales/daily", handleSalesDaily);
server.get("/admin/sales", handleSalesSummary);
};
