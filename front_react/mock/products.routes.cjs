// mock/products.routes.cjs
module.exports = function registerProductsRoutes(server, router, common) {
  const ok = common?.ok ?? ((data, message) => ({ success: true, data, message }));
  const fail = common?.fail ?? ((message) => ({ success: false, data: null, message }));
  const successMessage = common?.successMessage ?? ((message) => ({ success: true, data: null, message }));

  const db = router.db;

  function nowIso() {
    return new Date().toISOString();
  }

  function toInt(v, fallback) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function normalizePage(pageRaw) {
    const p = toInt(pageRaw, 0);
    if (p >= 1) return p - 1;
    return 0;
  }

  function makeAdminPage({ content, totalElements, page, size }) {
    const totalPages = size > 0 ? Math.ceil(totalElements / size) : 1;
    return { content, totalElements, totalPages, page, number: page, size, pageSize: size };
  }

  function getList(key) {
    const v = db.get(key).value();
    return Array.isArray(v) ? v : [];
  }

  function saveList(key, list) {
    db.set(key, list).write();
  }

  function ensureArray(key) {
    const v = db.get(key).value();
    if (!Array.isArray(v)) db.set(key, []).write();
  }

  function nextId(list, key) {
    let max = 0;
    for (const item of list) {
      const v = Number(item?.[key]);
      if (Number.isFinite(v) && v > max) max = v;
    }
    return max + 1;
  }

  function isDeleted(row) {
    return row?.deleted_at != null || row?.deletedAt != null;
  }

  function findCategoryNameById(categoryId) {
    const categories = getList("categories");
    const cid = Number(categoryId);

    if (Number.isFinite(cid)) {
      const c = categories.find((x) => Number(x.category_id) === cid && x.deleted_at == null);
      if (c) return c.name ?? "";
    }

    if (typeof categoryId === "string") {
      const m = categoryId.match(/\d+/);
      if (m) {
        const n = Number(m[0]);
        const c2 = categories.find((x) => Number(x.category_id) === n && x.deleted_at == null);
        if (c2) return c2.name ?? "";
      }
    }
    return "";
  }

  function productToAdminResponse(p) {
    const productId = Number(p.productId ?? p.id);
    const categoryId = p.category_id ?? p.categoryId ?? null;

    const productCode =
      p.productCode ??
      p.product_code ??
      (Number.isFinite(productId) ? `P-${String(productId).padStart(4, "0")}` : "");

    const basePrice = Number(p.basePrice ?? p.base_price ?? p.price ?? 0);
    const status = p.status ?? "ACTIVE";
    const createdAt = p.createdAt ?? p.created_at ?? nowIso();

    return {
      productId,
      productCode,
      name: p.name ?? "",
      basePrice,
      status,
      categoryId,
      categoryName: findCategoryNameById(categoryId),
      createdAt,
    };
  }

  function skuToAdminResponse(s) {
    return {
      skuId: Number(s.skuId ?? s.sku_id ?? s.id),
      productId: Number(s.productId ?? s.product_id),
      skuCode: s.skuCode ?? s.sku_code ?? "",
      price: Number(s.price ?? 0),
      stock: Number(s.stock ?? 0),
      status: s.status ?? "ON_SALE",
      createdAt: s.createdAt ?? s.created_at ?? nowIso(),
    };
  }

  function normalizeSkuStatus(input) {
    if (input == null) return null;
    const v = String(input).trim();
    if (!v) return null;
    if (v.toUpperCase() === "OFF_SALE") return "STOPPED";
    if (v === "ON_SALE" || v === "SOLD_OUT" || v === "STOPPED") return v;
    return "__INVALID__";
  }

  function refreshProductBasePrice(productId) {
    const pid = Number(productId);
    if (!Number.isFinite(pid)) return;

    ensureArray("productSkus");

    const products = getList("products");
    const skus = getList("productSkus").filter((s) => !isDeleted(s));

    const prices = skus
      .filter((s) => Number(s.productId ?? s.product_id) === pid)
      .map((s) => Number(s.price))
      .filter((n) => Number.isFinite(n));

    const minPrice = prices.length ? Math.min(...prices) : 0;

    const idx = products.findIndex((p) => !isDeleted(p) && Number(p.id) === pid);
    if (idx >= 0) {
      products[idx] = { ...products[idx], price: minPrice, basePrice: minPrice };
      saveList("products", products);
    }
  }

  /* =======================
     (중요) SKUS / OPTIONS 같은 "고정 경로"를 먼저 등록
     ======================= */

  ensureArray("productSkus");
  ensureArray("productOptionGroups");
  ensureArray("productOptionValues");

  // GET /api/admin/products/skus?productId=&status=&page=&size=
  server.get("/api/admin/products/skus", (req, res) => {
    const page = normalizePage(req.query.page);
    const size = toInt(req.query.size, 10);

    const productIdRaw = req.query.productId;
    const statusRaw = req.query.status ? String(req.query.status).trim() : "";

    let rows = getList("productSkus").filter((s) => !isDeleted(s));

    if (productIdRaw != null && String(productIdRaw).trim() !== "") {
      const pid = Number(productIdRaw);
      if (Number.isFinite(pid)) rows = rows.filter((s) => Number(s.productId ?? s.product_id) === pid);
    }

    if (statusRaw) rows = rows.filter((s) => String(s.status ?? "") === statusRaw);

    rows.sort((a, b) => Number((b.skuId ?? b.id)) - Number((a.skuId ?? a.id)));

    const totalElements = rows.length;
    const start = page * size;
    const content = rows.slice(start, start + size).map(skuToAdminResponse);

    return res.json(ok(makeAdminPage({ content, totalElements, page, size }), "관리자 SKU 목록 조회 성공"));
  });

  // GET /api/admin/products/skus/{skuId}
  server.get("/api/admin/products/skus/:skuId(\\d+)", (req, res) => {
    const skuId = Number(req.params.skuId);

    const s = getList("productSkus").find((x) => !isDeleted(x) && Number(x.skuId ?? x.id) === skuId);
    if (!s) return res.status(404).json(fail("SKU를 찾을 수 없습니다."));

    return res.json(ok(skuToAdminResponse(s), "관리자 SKU 상세 조회 성공"));
  });

  // PUT /api/admin/products/skus/{skuId}
  server.put("/api/admin/products/skus/:skuId(\\d+)", (req, res) => {
    const skuId = Number(req.params.skuId);
    const body = req.body || {};

    const skus = getList("productSkus");
    const idx = skus.findIndex((s) => !isDeleted(s) && Number(s.skuId ?? s.id) === skuId);
    if (idx < 0) return res.status(404).json(fail("SKU를 찾을 수 없습니다."));

    const price = Number(body.price);
    const stock = Number(body.stock);
    const normalizedStatus = normalizeSkuStatus(body.status);

    if (!Number.isFinite(price) || !Number.isFinite(stock) || !normalizedStatus || normalizedStatus === "__INVALID__") {
      return res.status(400).json(fail("SKU 수정 요청 값이 올바르지 않습니다."));
    }

    skus[idx] = {
      ...skus[idx],
      skuId: skus[idx].skuId ?? skus[idx].id ?? skuId,
      price,
      stock,
      status: normalizedStatus,
      updated_at: nowIso(),
    };

    saveList("productSkus", skus);

    const pid = Number(skus[idx].productId ?? skus[idx].product_id);
    refreshProductBasePrice(pid);

    return res.json(successMessage("SKU 수정 성공"));
  });

  // GET /api/admin/products/options/groups?productId=
  server.get("/api/admin/products/options/groups", (req, res) => {
    const productId = Number(req.query.productId);
    if (!Number.isFinite(productId)) return res.status(400).json(fail("productId가 필요합니다."));

    const rows = getList("productOptionGroups")
      .filter((g) => !isDeleted(g) && Number(g.productId) === productId)
      .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0));

    return res.json(ok(rows, "옵션 그룹 조회 성공"));
  });

  // GET /api/admin/products/options/values?groupId=
  server.get("/api/admin/products/options/values", (req, res) => {
    const groupId = Number(req.query.groupId);
    if (!Number.isFinite(groupId)) return res.status(400).json(fail("groupId가 필요합니다."));

    const rows = getList("productOptionValues")
      .filter((v) => !isDeleted(v) && Number(v.groupId ?? v.optionGroupId) === groupId)
      .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0));

    return res.json(ok(rows, "옵션 값 조회 성공"));
  });

  /* =======================
     PRODUCTS (숫자 productId만 매칭되게!)
     ======================= */

  // GET /api/admin/products?status=&keyword=&productCode=&page=&size=
  server.get("/api/admin/products", (req, res) => {
    const page = normalizePage(req.query.page);
    const size = toInt(req.query.size, 10);

    const status = req.query.status ? String(req.query.status).trim() : "";
    const keyword = req.query.keyword ? String(req.query.keyword).trim() : "";
    const productCode = req.query.productCode ? String(req.query.productCode).trim() : "";

    let rows = getList("products").filter((p) => !isDeleted(p));

    if (status) rows = rows.filter((p) => String(p.status ?? "ACTIVE") === status);
    if (keyword) rows = rows.filter((p) => String(p.name ?? "").includes(keyword));

    if (productCode) {
      rows = rows.filter((p) => {
        const id = Number(p.id);
        const code = String(
          p.productCode ??
            p.product_code ??
            (Number.isFinite(id) ? `P-${String(id).padStart(4, "0")}` : "")
        );
        return code.includes(productCode);
      });
    }

    rows.sort((a, b) => Number(b.id) - Number(a.id));

    const totalElements = rows.length;
    const start = page * size;
    const content = rows.slice(start, start + size).map(productToAdminResponse);

    return res.json(ok(makeAdminPage({ content, totalElements, page, size }), "관리자 상품 목록 조회 성공"));
  });

  // GET /api/admin/products/{productId}  (숫자만!)
  server.get("/api/admin/products/:productId(\\d+)", (req, res) => {
    const productId = Number(req.params.productId);
    const p = getList("products").find((x) => !isDeleted(x) && Number(x.id) === productId);

    if (!p) return res.status(404).json(fail("상품을 찾을 수 없습니다."));
    return res.json(ok(productToAdminResponse(p), "관리자 상품 상세 조회 성공"));
  });

  // POST /api/admin/products
  server.post("/api/admin/products", (req, res) => {
    const body = req.body || {};

    const productCode = body.productCode != null ? String(body.productCode).trim() : "";
    const name = body.name != null ? String(body.name).trim() : "";
    const categoryIdRaw = body.categoryId;
    const basePrice = Number(body.basePrice);
    const status = body.status != null ? String(body.status).trim() : "";

    if (!productCode || !name || !Number.isFinite(basePrice) || !status) {
      return res.status(400).json(fail("상품 등록 요청 값이 올바르지 않습니다."));
    }

    const products = getList("products");
    const id = nextId(products, "id");

    products.push({
      id,
      categoryId: categoryIdRaw ?? null,
      name,
      price: basePrice,
      stock: 0,
      img: "",
      description: "",
      productCode,
      basePrice,
      status,
      createdAt: nowIso(),
      deleted_at: null,
    });

    saveList("products", products);
    return res.json(successMessage("상품 등록 성공"));
  });

  // PUT /api/admin/products/{productId}
  server.put("/api/admin/products/:productId(\\d+)", (req, res) => {
    const productId = Number(req.params.productId);
    const body = req.body || {};

    const products = getList("products");
    const idx = products.findIndex((p) => !isDeleted(p) && Number(p.id) === productId);
    if (idx < 0) return res.status(404).json(fail("상품을 찾을 수 없습니다."));

    const productCode = body.productCode != null ? String(body.productCode).trim() : "";
    const name = body.name != null ? String(body.name).trim() : "";
    const categoryIdRaw = body.categoryId;
    const basePrice = Number(body.basePrice);
    const status = body.status != null ? String(body.status).trim() : "";

    if (!productCode || !name || !Number.isFinite(basePrice) || !status) {
      return res.status(400).json(fail("상품 수정 요청 값이 올바르지 않습니다."));
    }

    products[idx] = {
      ...products[idx],
      categoryId: categoryIdRaw ?? products[idx].categoryId ?? null,
      name,
      price: basePrice,
      productCode,
      basePrice,
      status,
      updated_at: nowIso(),
    };

    saveList("products", products);
    return res.json(successMessage("상품 수정 성공"));
  });

  // DELETE /api/admin/products/{productId}
  server.delete("/api/admin/products/:productId(\\d+)", (req, res) => {
    const productId = Number(req.params.productId);

    const products = getList("products");
    const idx = products.findIndex((p) => !isDeleted(p) && Number(p.id) === productId);
    if (idx < 0) return res.status(404).json(fail("상품을 찾을 수 없습니다."));

    products[idx] = { ...products[idx], deleted_at: nowIso() };
    saveList("products", products);

    return res.json(successMessage("상품 삭제 성공"));
  });
};
