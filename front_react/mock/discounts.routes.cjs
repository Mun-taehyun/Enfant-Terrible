// mock/discounts.routes.cjs
module.exports = function registerDiscountRoutes(server, router, common) {
  const ok = common?.ok ?? ((data, message) => ({ success: true, data, message }));
  const fail = common?.fail ?? ((message) => ({ success: false, data: null, message }));
  const successMessage =
    common?.successMessage ?? ((message) => ({ success: true, data: null, message }));

  const db = router.db;

  function nowIso() {
    return new Date().toISOString();
  }

  function ensureArray(key) {
    const v = db.get(key).value();
    if (!Array.isArray(v)) db.set(key, []).write();
  }

  function getList(key) {
    const v = db.get(key).value();
    return Array.isArray(v) ? v : [];
  }

  function saveList(key, list) {
    db.set(key, list).write();
  }

  function nextId(list, key) {
    let max = 0;
    for (const item of list) {
      const n = Number(item?.[key]);
      if (Number.isFinite(n) && n > max) max = n;
    }
    return max + 1;
  }

  ensureArray("productDiscounts");

  // GET /api/admin/product-discounts?productId=1
  server.get("/api/admin/product-discounts", (req, res) => {
    const productId = Number(req.query.productId);
    if (!Number.isFinite(productId)) return res.status(400).json(fail("productId가 필요합니다."));

    const rows = getList("productDiscounts")
      .filter((d) => Number(d.productId) === productId)
      .sort((a, b) => Number(b.discountId) - Number(a.discountId));

    return res.json(ok(rows, "상품 할인 목록 조회 성공"));
  });

  // POST /api/admin/product-discounts
  server.post("/api/admin/product-discounts", (req, res) => {
    const body = req.body || {};

    const productId = Number(body.productId);
    const discountValue = Number(body.discountValue);
    const discountType = body.discountType != null ? String(body.discountType).trim() : "";

    const startAt = body.startAt != null && String(body.startAt).trim() ? String(body.startAt).trim() : null;
    const endAt = body.endAt != null && String(body.endAt).trim() ? String(body.endAt).trim() : null;

    if (!Number.isFinite(productId)) return res.status(400).json(fail("productId가 올바르지 않습니다."));
    if (!Number.isFinite(discountValue)) return res.status(400).json(fail("discountValue가 올바르지 않습니다."));
    if (!discountType) return res.status(400).json(fail("discountType은 필수입니다."));

    const list = getList("productDiscounts");
    const discountId = nextId(list, "discountId");

    list.push({
      discountId,
      productId,
      discountValue,
      discountType,
      startAt,
      endAt,
      createdAt: nowIso(),
    });

    saveList("productDiscounts", list);

    // Spring 스펙: ApiResponse<Long>
    return res.json(ok(discountId, "상품 할인 등록 성공"));
  });

  // PUT /api/admin/product-discounts/{discountId}
  server.put("/api/admin/product-discounts/:discountId(\\d+)", (req, res) => {
    const discountId = Number(req.params.discountId);
    const body = req.body || {};

    const productId = Number(body.productId);
    const discountValue = Number(body.discountValue);
    const discountType = body.discountType != null ? String(body.discountType).trim() : "";

    const startAt = body.startAt != null && String(body.startAt).trim() ? String(body.startAt).trim() : null;
    const endAt = body.endAt != null && String(body.endAt).trim() ? String(body.endAt).trim() : null;

    if (!Number.isFinite(productId)) return res.status(400).json(fail("productId가 올바르지 않습니다."));
    if (!Number.isFinite(discountValue)) return res.status(400).json(fail("discountValue가 올바르지 않습니다."));
    if (!discountType) return res.status(400).json(fail("discountType은 필수입니다."));

    const list = getList("productDiscounts");
    const idx = list.findIndex((d) => Number(d.discountId) === discountId);
    if (idx < 0) return res.status(404).json(fail("할인을 찾을 수 없습니다."));

    list[idx] = {
      ...list[idx],
      discountId,
      productId,
      discountValue,
      discountType,
      startAt,
      endAt,
    };

    saveList("productDiscounts", list);
    return res.json(successMessage("상품 할인 수정 성공"));
  });

  // DELETE /api/admin/product-discounts/{discountId}
  server.delete("/api/admin/product-discounts/:discountId(\\d+)", (req, res) => {
    const discountId = Number(req.params.discountId);

    const list = getList("productDiscounts");
    const idx = list.findIndex((d) => Number(d.discountId) === discountId);
    if (idx < 0) return res.status(404).json(fail("할인을 찾을 수 없습니다."));

    list.splice(idx, 1);
    saveList("productDiscounts", list);

    return res.json(successMessage("상품 할인 삭제 성공"));
  });
};
