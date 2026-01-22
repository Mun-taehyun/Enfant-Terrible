// mock/productInquiries.routes.cjs
module.exports = function registerProductInquiriesRoutes(server, router, common) {
  const { ok, fail } = common;

  function requireAuth(req, res) {
    const auth = req.headers.authorization;
    if (!auth || !String(auth).startsWith("Bearer ")) {
      res.status(401).json(fail("로그인이 필요합니다."));
      return false;
    }
    return true;
  }

  function toInt(v, fallback) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function matchStatus(row, status) {
    if (!status) return true;
    return String(row.status || "") === String(status);
  }

  function matchId(rowValue, queryValue) {
    if (queryValue == null || queryValue === "") return true;
    const q = Number(queryValue);
    if (!Number.isFinite(q)) return false;
    return Number(rowValue) === q;
  }

  function sortDesc(a, b) {
    return Number(b.inquiryId) - Number(a.inquiryId);
  }

  // GET /api/admin/product-inquiries
  server.get("/api/admin/product-inquiries", (req, res) => {
    const db = router.db;

    const productId = req.query.productId;
    const userId = req.query.userId;
    const status = req.query.status ? String(req.query.status) : "";

    const page = Math.max(1, toInt(req.query.page, 1));
    let size = Math.max(1, toInt(req.query.size, 20));
    if (size > 200) size = 200;

    const offset = (page - 1) * size;

    const inquiries = db.get("productInquiries").value() || [];
    const users = db.get("users").value() || [];

    const filtered = inquiries
      .filter((i) => !i.deletedAt)
      .filter((i) => matchId(i.productId, productId))
      .filter((i) => matchId(i.userId, userId))
      .filter((i) => matchStatus(i, status))
      .map((i) => {
        const u = users.find((x) => Number(x.userId) === Number(i.userId));
        return {
          inquiryId: i.inquiryId,
          productId: i.productId,
          userId: i.userId,
          userEmail: u?.email || "",

          content: i.content,
          isPrivate: Boolean(i.isPrivate),
          status: i.status || "WAITING",

          answerContent: i.answerContent ?? null,
          answeredByUserId: i.answeredByUserId ?? null,
          answeredAt: i.answeredAt ?? null,

          createdAt: i.createdAt,
        };
      })
      .sort(sortDesc);

    const totalCount = filtered.length;
    const list = filtered.slice(offset, offset + size);

    return res.json(
      ok(
        {
          page,
          size,
          totalCount,
          list,
        },
        "관리자 상품 문의 목록 조회 성공"
      )
    );
  });

  // PUT /api/admin/product-inquiries/:inquiryId/answer
  server.put("/api/admin/product-inquiries/:inquiryId/answer", (req, res) => {
    if (!requireAuth(req, res)) return;

    const inquiryId = Number(req.params.inquiryId);
    if (!Number.isFinite(inquiryId)) {
      return res.status(400).json(fail("inquiryId가 올바르지 않습니다."));
    }

    const answerContent = req.body?.answerContent;
    if (typeof answerContent !== "string" || !answerContent.trim()) {
      return res.status(400).json(fail("answerContent는 비어 있을 수 없습니다."));
    }

    const db = router.db;
    const inquiry = db
      .get("productInquiries")
      .find({ inquiryId })
      .value();

    if (!inquiry || inquiry.deletedAt) {
      return res.status(404).json(fail("해당 문의가 없습니다."));
    }

    const now = new Date().toISOString();

    db.get("productInquiries")
      .find({ inquiryId })
      .assign({
        answerContent: answerContent.trim(),
        answeredByUserId: 1, // mock: 관리자 userId=1로 고정
        answeredAt: now,
        status: "ANSWERED",
        updatedAt: now,
      })
      .write();

    return res.json(ok(null, "문의 답변 등록 성공"));
  });

  // DELETE /api/admin/product-inquiries/:inquiryId/answer
  server.delete("/api/admin/product-inquiries/:inquiryId/answer", (req, res) => {
    const inquiryId = Number(req.params.inquiryId);
    if (!Number.isFinite(inquiryId)) {
      return res.status(400).json(fail("inquiryId가 올바르지 않습니다."));
    }

    const db = router.db;
    const inquiry = db
      .get("productInquiries")
      .find({ inquiryId })
      .value();

    if (!inquiry || inquiry.deletedAt) {
      return res.status(404).json(fail("해당 문의가 없습니다."));
    }

    const now = new Date().toISOString();

    db.get("productInquiries")
      .find({ inquiryId })
      .assign({
        answerContent: null,
        answeredByUserId: null,
        answeredAt: null,
        status: "WAITING",
        updatedAt: now,
      })
      .write();

    return res.json(ok(null, "문의 답변 삭제 성공"));
  });

  // DELETE /api/admin/product-inquiries/:inquiryId
  server.delete("/api/admin/product-inquiries/:inquiryId", (req, res) => {
    const inquiryId = Number(req.params.inquiryId);
    if (!Number.isFinite(inquiryId)) {
      return res.status(400).json(fail("inquiryId가 올바르지 않습니다."));
    }

    const db = router.db;
    const inquiry = db
      .get("productInquiries")
      .find({ inquiryId })
      .value();

    if (!inquiry || inquiry.deletedAt) {
      return res.status(404).json(fail("해당 문의가 없습니다."));
    }

    const now = new Date().toISOString();

    db.get("productInquiries")
      .find({ inquiryId })
      .assign({
        deletedAt: now,
        updatedAt: now,
      })
      .write();

    return res.json(ok(null, "문의 삭제 성공"));
  });
};
