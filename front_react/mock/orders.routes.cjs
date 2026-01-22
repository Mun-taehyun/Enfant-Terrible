// mock/orders.routes.cjs
// Spring AdminOrderController 스펙(프론트 코드 기준):
//  - GET    /api/admin/orders
//  - GET    /api/admin/orders/{orderId}
//  - PATCH  /api/admin/orders/{orderId}/status       body: { status }
//  - PATCH  /api/admin/orders/{orderId}/shipping     body: { trackingNumber }
//  - POST   /api/admin/orders/{orderId}/items/cancel body: { items:[{skuId,quantity}], reason? }

module.exports = function registerOrdersRoutes(server, router, common) {
  const { ok, fail } = common;

  const ORDERS_KEY = "orders";

  function nowIso() {
    return new Date().toISOString();
  }

  function toInt(v, def) {
    const n = parseInt(String(v ?? ""), 10);
    return Number.isFinite(n) ? n : def;
  }

  function normStr(v) {
    const s = String(v ?? "").trim();
    return s.length ? s : null;
  }

  function getOrdersDb() {
    const db = router.db;
    if (!db.has(ORDERS_KEY).value()) {
      db.set(ORDERS_KEY, []).write();
    }
    return db.get(ORDERS_KEY);
  }

  /**
   * ✅ 중요:
   * - orderId/userId가 없는 구형 mock 데이터 보정만 수행합니다.
   * - skuId는 절대 승격/대체/발급하지 않습니다. (skuId는 skuId여야 함)
   */
  function ensureOrderIdentityPersisted() {
    const col = getOrdersDb();
    const items = col.value() || [];

    // 현재 최대 orderId 계산
    let maxOrderId = 0;
    for (const o of items) {
      const oid = toInt(o.orderId ?? o.id, 0);
      if (oid > maxOrderId) maxOrderId = oid;
    }

    let dirty = false;

    const normalized = items.map((o) => {
      const next = { ...o };

      // orderId 보정
      let orderId = toInt(next.orderId, 0);
      if (orderId <= 0) {
        const fromId = toInt(next.id, 0);
        if (fromId > 0) {
          orderId = fromId;
        } else {
          maxOrderId += 1;
          orderId = maxOrderId;
          next.id = orderId; // json-server 기본키도 같이 맞춤
        }
        next.orderId = orderId;
        dirty = true;
      }

      // userId 보정 (백 스펙상 필수인데 mock 데이터에 없을 수 있음)
      const userId = toInt(next.userId, 0);
      if (userId <= 0) {
        next.userId = 1;
        dirty = true;
      }

      // 안전 기본값들(없으면 null/빈값)
      if (next.receiverName == null) next.receiverName = "";
      if (next.receiverPhone == null) next.receiverPhone = "";
      if (next.trackingNumber === undefined) next.trackingNumber = null;
      if (next.shippedAt === undefined) next.shippedAt = null;
      if (next.deliveredAt === undefined) next.deliveredAt = null;

      if (next.createdAt == null) next.createdAt = nowIso();
      if (next.updatedAt == null) next.updatedAt = nowIso();

      // items가 없으면 빈 배열(구조만 보정; skuId에는 손대지 않음)
      if (!Array.isArray(next.items)) {
        next.items = [];
        dirty = true;
      }

      return next;
    });

    if (dirty) {
      router.db.set(ORDERS_KEY, normalized).write();
    }
  }

  function filterOrders(all, q) {
    const userId = q.userId != null ? toInt(q.userId, NaN) : null;
    const orderCode = normStr(q.orderCode);
    const status = normStr(q.status);

    return all.filter((o) => {
      const okUser =
        userId != null && Number.isFinite(userId)
          ? toInt(o.userId, -1) === userId
          : true;
      const okCode = orderCode ? String(o.orderCode ?? "").includes(orderCode) : true;
      const okStatus = status ? String(o.status ?? "") === status : true;
      return okUser && okCode && okStatus;
    });
  }

  function toListItem(o) {
    return {
      orderId: toInt(o.orderId, 0),
      userId: toInt(o.userId, 0),
      orderCode: String(o.orderCode ?? ""),
      status: String(o.status ?? "PAID"),
      totalAmount: toInt(o.totalAmount, 0),

      receiverName: String(o.receiverName ?? ""),
      receiverPhone: String(o.receiverPhone ?? ""),

      trackingNumber: o.trackingNumber == null ? null : String(o.trackingNumber),
      shippedAt: o.shippedAt == null ? null : String(o.shippedAt),
      deliveredAt: o.deliveredAt == null ? null : String(o.deliveredAt),
    };
  }

  function toDetail(o) {
    return {
      ...toListItem(o),
      zipCode: String(o.zipCode ?? ""),
      addressBase: String(o.addressBase ?? ""),
      addressDetail: String(o.addressDetail ?? ""),

      createdAt: o.createdAt == null ? null : String(o.createdAt),
      updatedAt: o.updatedAt == null ? null : String(o.updatedAt),

      // skuId는 있는 그대로 사용(없으면 0으로 보일 수 있음)
      // ※ 취소 처리 시에는 skuId 누락을 "서버 데이터 오류"로 판단해 에러 메시지 반환함
      items: Array.isArray(o.items)
        ? o.items.map((it) => ({
            skuId: toInt(it.skuId, 0),
            productName: String(it.productName ?? ""),
            price: toInt(it.price, 0),
            quantity: toInt(it.quantity, 0),
            cancelledQuantity:
              it.cancelledQuantity == null ? null : toInt(it.cancelledQuantity, 0),
            remainingQuantity:
              it.remainingQuantity == null ? null : toInt(it.remainingQuantity, 0),
          }))
        : [],
    };
  }

  function hasInvalidSkuIdItems(order) {
    const arr = Array.isArray(order?.items) ? order.items : [];
    // skuId가 없거나 0 이하이면 "데이터 자체가 스펙 위반"
    return arr.some((it) => toInt(it?.skuId, 0) <= 0);
  }

  // 목록
  server.get("/api/admin/orders", (req, res) => {
    try {
      ensureOrderIdentityPersisted();

      const page = Math.max(1, toInt(req.query.page, 1));
      const size = Math.max(1, toInt(req.query.size, 20));

      const all = getOrdersDb().value() || [];
      const filtered = filterOrders(all, req.query);

      // 최신순(생성/업데이트 기준)
      filtered.sort((a, b) =>
        String(b.updatedAt ?? b.createdAt ?? "").localeCompare(
          String(a.updatedAt ?? a.createdAt ?? "")
        )
      );

      const totalCount = filtered.length;
      const start = (page - 1) * size;
      const list = filtered.slice(start, start + size).map(toListItem);

      return res
        .status(200)
        .json(ok({ page, size, totalCount, list }, "관리자 주문 목록 조회 성공"));
    } catch (e) {
      return res.status(500).json(fail("관리자 주문 목록 조회 실패"));
    }
  });

  // 상세
  server.get("/api/admin/orders/:orderId", (req, res) => {
    try {
      ensureOrderIdentityPersisted();

      const orderId = toInt(req.params.orderId, -1);
      if (orderId <= 0)
        return res.status(400).json(fail("orderId가 올바르지 않습니다."));

      const found = getOrdersDb()
        .find((o) => toInt(o.orderId, 0) === orderId)
        .value();
      if (!found) return res.status(404).json(fail("주문 정보를 찾을 수 없습니다."));

      return res.status(200).json(ok(toDetail(found), "관리자 주문 상세 조회 성공"));
    } catch (e) {
      return res.status(500).json(fail("관리자 주문 상세 조회 실패"));
    }
  });

  // 상태 변경
  server.patch("/api/admin/orders/:orderId/status", (req, res) => {
    try {
      ensureOrderIdentityPersisted();

      const orderId = toInt(req.params.orderId, -1);
      if (orderId <= 0)
        return res.status(400).json(fail("orderId가 올바르지 않습니다."));

      const status = normStr(req.body?.status);
      if (!status) return res.status(400).json(fail("status는 필수입니다."));

      const col = getOrdersDb();
      const found = col.find((o) => toInt(o.orderId, 0) === orderId).value();
      if (!found) return res.status(404).json(fail("주문 정보를 찾을 수 없습니다."));

      col.find((o) => toInt(o.orderId, 0) === orderId)
        .assign({ status, updatedAt: nowIso() })
        .write();

      return res.status(200).json(ok(null, "주문 상태 변경 완료"));
    } catch (e) {
      return res.status(500).json(fail("주문 상태 변경 실패"));
    }
  });

  // 배송 시작(운송장 등록)
  server.patch("/api/admin/orders/:orderId/shipping", (req, res) => {
    try {
      ensureOrderIdentityPersisted();

      const orderId = toInt(req.params.orderId, -1);
      if (orderId <= 0)
        return res.status(400).json(fail("orderId가 올바르지 않습니다."));

      const trackingNumber = normStr(req.body?.trackingNumber);
      if (!trackingNumber)
        return res.status(400).json(fail("trackingNumber는 필수입니다."));

      const col = getOrdersDb();
      const found = col.find((o) => toInt(o.orderId, 0) === orderId).value();
      if (!found) return res.status(404).json(fail("주문 정보를 찾을 수 없습니다."));

      col.find((o) => toInt(o.orderId, 0) === orderId)
        .assign({
          trackingNumber,
          shippedAt: found.shippedAt ?? nowIso(),
          updatedAt: nowIso(),
        })
        .write();

      return res.status(200).json(ok(null, "배송 시작 처리 완료"));
    } catch (e) {
      return res.status(500).json(fail("배송 시작 처리 실패"));
    }
  });

  // 부분취소
  server.post("/api/admin/orders/:orderId/items/cancel", (req, res) => {
    try {
      ensureOrderIdentityPersisted();

      const orderId = toInt(req.params.orderId, -1);
      if (orderId <= 0)
        return res.status(400).json(fail("orderId가 올바르지 않습니다."));

      const items = req.body?.items;
      const reason = normStr(req.body?.reason);

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json(fail("items 데이터 형식이 올바르지 않습니다."));
      }

      // items 유효성 최소 검증(요청 바디 검증)
      for (const it of items) {
        const skuId = toInt(it?.skuId, 0);
        const qty = toInt(it?.quantity, 0);
        if (skuId <= 0 || qty <= 0) {
          return res
            .status(400)
            .json(fail("items의 skuId/quantity는 1 이상 숫자여야 합니다."));
        }
      }

      const col = getOrdersDb();
      const found = col.find((o) => toInt(o.orderId, 0) === orderId).value();
      if (!found) return res.status(404).json(fail("주문 정보를 찾을 수 없습니다."));

      // ✅ 서버(데이터) 검증: 주문 데이터에 skuId 누락이 있으면 "요청이 아니라 서버 데이터 오류"
      if (hasInvalidSkuIdItems(found)) {
        // 운영 백엔드라면 이런 상태 자체가 DB 제약으로 방지되는 게 정상.
        // mock/db.json이 스펙을 깨고 있으니 명확히 알려줍니다.
        return res
          .status(500)
          .json(fail("주문 데이터에 skuId가 누락되어 부분취소를 처리할 수 없습니다."));
      }

      // 단순 mock 처리: 해당 sku의 cancelledQuantity 증가 + remainingQuantity 감소
      const nextItems = Array.isArray(found.items)
        ? found.items.map((orig) => ({ ...orig }))
        : [];

      for (const reqItem of items) {
        const skuId = toInt(reqItem.skuId, 0);
        const qty = toInt(reqItem.quantity, 0);

        const idx = nextItems.findIndex((x) => toInt(x.skuId, -1) === skuId);
        if (idx < 0) {
          // ✅ 요청 skuId가 주문에 실제로 없는 경우(정상적인 400)
          return res.status(400).json(fail(`주문에 skuId=${skuId} 항목이 없습니다.`));
        }

        const row = nextItems[idx];
        const orderedQty = toInt(row.quantity, 0);
        const cancelled = toInt(row.cancelledQuantity, 0);
        const remaining =
          row.remainingQuantity == null
            ? Math.max(0, orderedQty - cancelled)
            : toInt(row.remainingQuantity, 0);

        if (qty > remaining) {
          return res
            .status(400)
            .json(fail(`skuId=${skuId} 취소 수량이 잔여 수량을 초과합니다.`));
        }

        const newCancelled = cancelled + qty;
        const newRemaining = remaining - qty;

        nextItems[idx] = {
          ...row,
          cancelledQuantity: newCancelled,
          remainingQuantity: newRemaining,
        };
      }

      col.find((o) => toInt(o.orderId, 0) === orderId)
        .assign({
          items: nextItems,
          updatedAt: nowIso(),
          cancelReason: reason ?? null,
          status: "CANCELLED", // 정책에 맞게 조정 가능
        })
        .write();

      return res.status(200).json(ok(null, "부분취소 처리 완료"));
    } catch (e) {
      return res.status(500).json(fail("부분취소 처리 실패"));
    }
  });
};
