// mock/posts.routes.cjs
// Spring 스펙 기준:
//  - GET    /api/admin/posts               (AdminPostListRequest: page,size,postType,userId)
//  - GET    /api/admin/posts/{postId}      (AdminPostDetailResponse)
//  - POST   /api/admin/posts               (AdminPostSaveRequest) -> returns Long(postId)
//  - PUT    /api/admin/posts/{postId}      (AdminPostSaveRequest) -> returns Void
//  - DELETE /api/admin/posts/{postId}      -> returns Void
//
// 주의: SaveRequest에는 userId가 없고, 실제 백엔드는 principal로 userId를 받습니다.
//      mock에서는 userId를 1로 고정합니다(모의 로그인 사용자).

module.exports = function registerPostsRoutes(server, router, common) {
  const { ok, fail } = common;

  function nowIso() {
    return new Date().toISOString();
  }

  function toInt(v, def) {
    const n = parseInt(String(v ?? ""), 10);
    return Number.isFinite(n) ? n : def;
  }

  function getPostsCol() {
    // db.json에 "posts": [] 필요
    return router.db.get("posts");
  }

  function normalizeString(v) {
    const s = String(v ?? "").trim();
    return s.length ? s : null;
  }

  function validateSaveBody(body) {
    const postType = normalizeString(body?.postType);
    const title = normalizeString(body?.title);
    const content = normalizeString(body?.content);

    if (!postType) return "postType은 필수입니다.";
    if (!title) return "title은 필수입니다.";
    if (!content) return "content는 필수입니다.";
    return null;
  }

  function nextPostId(items) {
    let max = 0;
    for (const it of items) {
      const id = toInt(it?.postId, 0);
      if (id > max) max = id;
    }
    return max + 1;
  }

  function toListResponse(p) {
    return {
      postId: p.postId,
      userId: p.userId,
      postType: p.postType,
      title: p.title,
      createdAt: p.createdAt ?? null,
      updatedAt: p.updatedAt ?? null,
    };
  }

  // 목록
  server.get("/api/admin/posts", (req, res) => {
    try {
      const page = toInt(req.query.page, 1);
      const size = toInt(req.query.size, 20);

      const qPostType = normalizeString(req.query.postType);
      const qUserId = req.query.userId != null ? toInt(req.query.userId, NaN) : null;

      const items = getPostsCol().value() || [];

      // soft delete 제외
      let filtered = items.filter((p) => !p?.deletedAt);

      if (qPostType) {
        filtered = filtered.filter((p) => String(p?.postType ?? "") === qPostType);
      }

      if (qUserId != null && Number.isFinite(qUserId)) {
        filtered = filtered.filter((p) => toInt(p?.userId, -1) === qUserId);
      }

      const totalCount = filtered.length;
      const start = Math.max(0, (page - 1) * size);
      const end = start + size;

      const list = filtered.slice(start, end).map(toListResponse);

      return res.status(200).json(
        ok(
          {
            page,
            size,
            totalCount,
            list,
          },
          "관리자 게시글 목록 조회 성공"
        )
      );
    } catch (e) {
      return res.status(500).json(fail("관리자 게시글 목록 조회 실패"));
    }
  });

  // 상세
  server.get("/api/admin/posts/:postId", (req, res) => {
    try {
      const postId = toInt(req.params.postId, -1);
      if (postId <= 0) return res.status(400).json(fail("postId가 올바르지 않습니다."));

      const items = getPostsCol().value() || [];
      const found = items.find((p) => toInt(p?.postId, -1) === postId && !p?.deletedAt);
      if (!found) return res.status(404).json(fail("게시글을 찾을 수 없습니다."));

      // DetailResponse 그대로
      const detail = {
        postId: found.postId,
        userId: found.userId,
        postType: found.postType,
        refType: found.refType ?? null,
        refId: found.refId ?? null,
        title: found.title,
        content: found.content,
        createdAt: found.createdAt ?? null,
        updatedAt: found.updatedAt ?? null,
        deletedAt: found.deletedAt ?? null,
      };

      return res.status(200).json(ok(detail, "관리자 게시글 상세 조회 성공"));
    } catch (e) {
      return res.status(500).json(fail("관리자 게시글 상세 조회 실패"));
    }
  });

  // 생성
  server.post("/api/admin/posts", (req, res) => {
    try {
      const body = req.body ?? {};
      const err = validateSaveBody(body);
      if (err) return res.status(400).json(fail(err));

      const col = getPostsCol();
      const items = col.value() || [];
      const postId = nextPostId(items);

      const created = {
        postId,
        userId: 1, // mock 고정
        postType: String(body.postType),
        refType: normalizeString(body.refType),
        refId: body.refId == null ? null : toInt(body.refId, null),
        title: String(body.title),
        content: String(body.content),
        createdAt: nowIso(),
        updatedAt: nowIso(),
        deletedAt: null,
      };

      col.push(created).write();

      return res.status(200).json(ok(postId, "게시글 생성 성공"));
    } catch (e) {
      return res.status(500).json(fail("게시글 생성 실패"));
    }
  });

  // 수정
  server.put("/api/admin/posts/:postId", (req, res) => {
    try {
      const postId = toInt(req.params.postId, -1);
      if (postId <= 0) return res.status(400).json(fail("postId가 올바르지 않습니다."));

      const body = req.body ?? {};
      const err = validateSaveBody(body);
      if (err) return res.status(400).json(fail(err));

      const col = getPostsCol();
      const items = col.value() || [];
      const idx = items.findIndex((p) => toInt(p?.postId, -1) === postId && !p?.deletedAt);
      if (idx < 0) return res.status(404).json(fail("게시글을 찾을 수 없습니다."));

      const prev = items[idx] || {};
      const updated = {
        ...prev,
        postId,
        postType: String(body.postType),
        refType: normalizeString(body.refType),
        refId: body.refId == null ? null : toInt(body.refId, null),
        title: String(body.title),
        content: String(body.content),
        updatedAt: nowIso(),
      };

      col.splice(idx, 1, updated).write();
      return res.status(200).json(ok(null, "게시글 수정 성공"));
    } catch (e) {
      return res.status(500).json(fail("게시글 수정 실패"));
    }
  });

  // 삭제(soft delete)
  server.delete("/api/admin/posts/:postId", (req, res) => {
    try {
      const postId = toInt(req.params.postId, -1);
      if (postId <= 0) return res.status(400).json(fail("postId가 올바르지 않습니다."));

      const col = getPostsCol();
      const items = col.value() || [];
      const idx = items.findIndex((p) => toInt(p?.postId, -1) === postId && !p?.deletedAt);
      if (idx < 0) return res.status(404).json(fail("게시글을 찾을 수 없습니다."));

      const prev = items[idx] || {};
      const deleted = {
        ...prev,
        deletedAt: nowIso(),
        updatedAt: nowIso(),
      };

      col.splice(idx, 1, deleted).write();
      return res.status(200).json(ok(null, "게시글 삭제 성공"));
    } catch (e) {
      return res.status(500).json(fail("게시글 삭제 실패"));
    }
  });
};
