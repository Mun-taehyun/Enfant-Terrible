// mock/banners.routes.cjs
// Spring 스펙:
//  - GET    /api/admin/banners                : page/size/title/isActive
//  - GET    /api/admin/banners/{bannerId}
//  - POST   /api/admin/banners
//  - PUT    /api/admin/banners/{bannerId}
//  - DELETE /api/admin/banners/{bannerId}

module.exports = function registerBannersRoutes(server, router, common) {
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

  // GET /api/admin/banners
  server.get("/api/admin/banners", (req, res) => {
    try {
      const page = clampInt(req.query.page, 1, 1, 100000);
      const size = clampInt(req.query.size, 20, 1, 200);
      const title = (req.query.title ?? "").toString().trim();
      const isActive = toBool(req.query.isActive);

      const banners = router.db.get("banners").value() || [];

      // soft delete 제외
      let filtered = banners.filter(b => !b.deletedAt);

      if (title) {
        const low = title.toLowerCase();
        filtered = filtered.filter(b => String(b.title || "").toLowerCase().includes(low));
      }
      if (isActive !== undefined) {
        filtered = filtered.filter(b => Boolean(b.isActive) === isActive);
      }

      // 정렬: sortOrder asc(없으면 큰값), 그 다음 createdAt desc, 그 다음 id desc
      filtered.sort((a, b) => {
        const as = Number.isFinite(Number(a.sortOrder)) ? Number(a.sortOrder) : 999999;
        const bs = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : 999999;
        if (as !== bs) return as - bs;

        const at = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bt = b.createdAt ? Date.parse(b.createdAt) : 0;
        if (bt !== at) return bt - at;

        return Number(b.bannerId || 0) - Number(a.bannerId || 0);
      });

      const totalCount = filtered.length;
      const start = (page - 1) * size;

      // ✅ ListResponse에 맞춰 imageUrl은 응답에서 제외
      const list = filtered.slice(start, start + size).map(b => ({
        bannerId: b.bannerId,
        title: b.title,
        linkUrl: b.linkUrl ?? null,
        sortOrder: b.sortOrder ?? null,
        isActive: b.isActive ?? false,
        startAt: b.startAt ?? null,
        endAt: b.endAt ?? null,
        createdAt: b.createdAt ?? null,
      }));

      return res.status(200).json(
        ok(
          { page, size, totalCount, list },
          "관리자 배너 목록 조회 성공"
        )
      );
    } catch (e) {
      return res.status(500).json(fail("목 서버 배너 목록 처리 중 오류"));
    }
  });

  // GET /api/admin/banners/:bannerId
  server.get("/api/admin/banners/:bannerId", (req, res) => {
    try {
      const bannerId = Number(req.params.bannerId);
      const banners = router.db.get("banners").value() || [];
      const found = banners.find(b => Number(b.bannerId) === bannerId && !b.deletedAt);
      if (!found) return res.status(404).json(fail("배너를 찾을 수 없습니다."));

      // ✅ DetailResponse에 맞춰 imageUrl은 응답에서 제외
      return res.status(200).json(
        ok(
          {
            bannerId: found.bannerId,
            title: found.title,
            linkUrl: found.linkUrl ?? null,
            sortOrder: found.sortOrder ?? null,
            isActive: found.isActive ?? false,
            startAt: found.startAt ?? null,
            endAt: found.endAt ?? null,
            createdAt: found.createdAt ?? null,
            updatedAt: found.updatedAt ?? null,
            deletedAt: found.deletedAt ?? null,
          },
          "관리자 배너 상세 조회 성공"
        )
      );
    } catch (e) {
      return res.status(500).json(fail("목 서버 배너 상세 처리 중 오류"));
    }
  });

  // POST /api/admin/banners
  server.post("/api/admin/banners", (req, res) => {
    try {
      const body = req.body || {};
      const title = String(body.title ?? "").trim();
      if (!title) return res.status(400).json(fail("title은 필수입니다."));

      const banners = router.db.get("banners").value() || [];
      const bannerId = nextId(banners, "bannerId");
      const createdAt = nowIso();

      const item = {
        bannerId,
        title,
        linkUrl: body.linkUrl ?? null,
        sortOrder: body.sortOrder ?? null,
        isActive: body.isActive ?? false,
        startAt: body.startAt ?? null,
        endAt: body.endAt ?? null,

        // SaveRequest에 있으니 저장은 함 (단, 응답 DTO에는 없음)
        imageUrl: body.imageUrl ?? null,

        createdAt,
        updatedAt: createdAt,
        deletedAt: null,
      };

      router.db.get("banners").push(item).write();

      return res.status(200).json(
        ok(bannerId, "배너 생성 성공")
      );
    } catch (e) {
      return res.status(500).json(fail("목 서버 배너 생성 처리 중 오류"));
    }
  });

  // PUT /api/admin/banners/:bannerId
  server.put("/api/admin/banners/:bannerId", (req, res) => {
    try {
      const bannerId = Number(req.params.bannerId);
      const body = req.body || {};
      const title = String(body.title ?? "").trim();
      if (!title) return res.status(400).json(fail("title은 필수입니다."));

      const banners = router.db.get("banners").value() || [];
      const idx = banners.findIndex(b => Number(b.bannerId) === bannerId && !b.deletedAt);
      if (idx < 0) return res.status(404).json(fail("배너를 찾을 수 없습니다."));

      const updatedAt = nowIso();
      const prev = banners[idx];

      banners[idx] = {
        ...prev,
        title,
        linkUrl: body.linkUrl ?? null,
        sortOrder: body.sortOrder ?? null,
        isActive: body.isActive ?? false,
        startAt: body.startAt ?? null,
        endAt: body.endAt ?? null,
        imageUrl: body.imageUrl ?? null, // 저장만
        updatedAt,
      };

      router.db.set("banners", banners).write();

      return res.status(200).json(
        ok(null, "배너 수정 성공")
      );
    } catch (e) {
      return res.status(500).json(fail("목 서버 배너 수정 처리 중 오류"));
    }
  });

  // DELETE /api/admin/banners/:bannerId
  server.delete("/api/admin/banners/:bannerId", (req, res) => {
    try {
      const bannerId = Number(req.params.bannerId);
      const banners = router.db.get("banners").value() || [];
      const idx = banners.findIndex(b => Number(b.bannerId) === bannerId && !b.deletedAt);
      if (idx < 0) return res.status(404).json(fail("배너를 찾을 수 없습니다."));

      banners[idx] = { ...banners[idx], deletedAt: nowIso(), updatedAt: nowIso() };
      router.db.set("banners", banners).write();

      return res.status(200).json(
        ok(null, "배너 삭제 성공")
      );
    } catch (e) {
      return res.status(500).json(fail("목 서버 배너 삭제 처리 중 오류"));
    }
  });
};
