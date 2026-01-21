// mock/popups.routes.cjs
// Spring 스펙:
//  - GET    /api/admin/popups                : page/size/title/isActive
//  - GET    /api/admin/popups/{popupId}
//  - POST   /api/admin/popups
//  - PUT    /api/admin/popups/{popupId}
//  - DELETE /api/admin/popups/{popupId}

module.exports = function registerPopupsRoutes(server, router, common) {
  const { ok, fail } = common;

  function nowIso() {
    return new Date().toISOString();
  }

  function toBool(v) {
    if (v === true || v === false) return v;
    if (v == null) return undefined;
    const s = String(v).trim().toLowerCase();
    if (s === "true" || s === "1" || s === "y") return true;
    if (s === "false" || s === "0" || s === "n") return false;
    return undefined;
  }

  function clampInt(v, def, min, max) {
    const n = Number(v);
    if (!Number.isFinite(n)) return def;
    const i = Math.trunc(n);
    return Math.max(min, Math.min(max, i));
  }

  function nextId(items, key) {
    let m = 0;
    for (const it of items) {
      const n = Number(it[key]);
      if (Number.isFinite(n)) m = Math.max(m, n);
    }
    return m + 1;
  }

  // GET /api/admin/popups
  server.get("/api/admin/popups", (req, res) => {
    try {
      const page = clampInt(req.query.page, 1, 1, 100000);
      const size = clampInt(req.query.size, 20, 1, 200);
      const title = (req.query.title ?? "").toString().trim();
      const isActive = toBool(req.query.isActive);

      const popups = router.db.get("popups").value() || [];

      // soft delete 제외
      let filtered = popups.filter(p => !p.deletedAt);

      if (title) {
        const low = title.toLowerCase();
        filtered = filtered.filter(p => String(p.title || "").toLowerCase().includes(low));
      }
      if (isActive !== undefined) {
        filtered = filtered.filter(p => Boolean(p.isActive) === isActive);
      }

      // 최신 생성일 우선(없으면 id desc)
      filtered.sort((a, b) => {
        const at = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bt = b.createdAt ? Date.parse(b.createdAt) : 0;
        if (bt !== at) return bt - at;
        return Number(b.popupId || 0) - Number(a.popupId || 0);
      });

      const totalCount = filtered.length;
      const start = (page - 1) * size;
      const list = filtered.slice(start, start + size).map(p => ({
        popupId: p.popupId,
        title: p.title,
        linkUrl: p.linkUrl ?? null,
        position: p.position ?? null,
        isActive: p.isActive ?? false,
        startAt: p.startAt ?? null,
        endAt: p.endAt ?? null,
        createdAt: p.createdAt ?? null,
      }));

      return res.status(200).json(
        ok(
          { page, size, totalCount, list },
          "관리자 팝업 목록 조회 성공"
        )
      );
    } catch (e) {
      return res.status(500).json(fail("목 서버 팝업 목록 처리 중 오류"));
    }
  });

  // GET /api/admin/popups/:popupId
  server.get("/api/admin/popups/:popupId", (req, res) => {
    try {
      const popupId = Number(req.params.popupId);
      const popups = router.db.get("popups").value() || [];
      const found = popups.find(p => Number(p.popupId) === popupId && !p.deletedAt);
      if (!found) return res.status(404).json(fail("팝업을 찾을 수 없습니다."));

      return res.status(200).json(
        ok(
          {
            popupId: found.popupId,
            title: found.title,
            content: found.content ?? null,
            linkUrl: found.linkUrl ?? null,
            position: found.position ?? null,
            width: found.width ?? null,
            height: found.height ?? null,
            isActive: found.isActive ?? false,
            startAt: found.startAt ?? null,
            endAt: found.endAt ?? null,
            createdAt: found.createdAt ?? null,
            updatedAt: found.updatedAt ?? null,
            deletedAt: found.deletedAt ?? null,
          },
          "관리자 팝업 상세 조회 성공"
        )
      );
    } catch (e) {
      return res.status(500).json(fail("목 서버 팝업 상세 처리 중 오류"));
    }
  });

  // POST /api/admin/popups
  server.post("/api/admin/popups", (req, res) => {
    try {
      const body = req.body || {};
      const title = String(body.title ?? "").trim();

      if (!title) return res.status(400).json(fail("title은 필수입니다."));

      const popups = router.db.get("popups").value() || [];
      const popupId = nextId(popups, "popupId");
      const createdAt = nowIso();

      const item = {
        popupId,
        title,
        content: body.content ?? null,
        linkUrl: body.linkUrl ?? null,
        position: body.position ?? null,
        width: body.width ?? null,
        height: body.height ?? null,
        isActive: body.isActive ?? false,
        startAt: body.startAt ?? null,
        endAt: body.endAt ?? null,
        imageUrl: body.imageUrl ?? null,
        createdAt,
        updatedAt: createdAt,
        deletedAt: null,
      };

      router.db.get("popups").push(item).write();

      return res.status(200).json(
        ok(popupId, "팝업 생성 성공")
      );
    } catch (e) {
      return res.status(500).json(fail("목 서버 팝업 생성 처리 중 오류"));
    }
  });

  // PUT /api/admin/popups/:popupId
  server.put("/api/admin/popups/:popupId", (req, res) => {
    try {
      const popupId = Number(req.params.popupId);
      const body = req.body || {};
      const title = String(body.title ?? "").trim();

      if (!title) return res.status(400).json(fail("title은 필수입니다."));

      const popups = router.db.get("popups").value() || [];
      const idx = popups.findIndex(p => Number(p.popupId) === popupId && !p.deletedAt);
      if (idx < 0) return res.status(404).json(fail("팝업을 찾을 수 없습니다."));

      const updatedAt = nowIso();
      const prev = popups[idx];

      const next = {
        ...prev,
        title,
        content: body.content ?? null,
        linkUrl: body.linkUrl ?? null,
        position: body.position ?? null,
        width: body.width ?? null,
        height: body.height ?? null,
        isActive: body.isActive ?? false,
        startAt: body.startAt ?? null,
        endAt: body.endAt ?? null,
        imageUrl: body.imageUrl ?? null,
        updatedAt,
      };

      popups[idx] = next;
      router.db.set("popups", popups).write();

      return res.status(200).json(
        ok(null, "팝업 수정 성공")
      );
    } catch (e) {
      return res.status(500).json(fail("목 서버 팝업 수정 처리 중 오류"));
    }
  });

  // DELETE /api/admin/popups/:popupId
  server.delete("/api/admin/popups/:popupId", (req, res) => {
    try {
      const popupId = Number(req.params.popupId);
      const popups = router.db.get("popups").value() || [];
      const idx = popups.findIndex(p => Number(p.popupId) === popupId && !p.deletedAt);
      if (idx < 0) return res.status(404).json(fail("팝업을 찾을 수 없습니다."));

      popups[idx] = { ...popups[idx], deletedAt: nowIso(), updatedAt: nowIso() };
      router.db.set("popups", popups).write();

      return res.status(200).json(
        ok(null, "팝업 삭제 성공")
      );
    } catch (e) {
      return res.status(500).json(fail("목 서버 팝업 삭제 처리 중 오류"));
    }
  });
};
