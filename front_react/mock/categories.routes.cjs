// mock/categories.routes.cjs
module.exports = function registerCategoriesRoutes(server, router, common) {
  const { ok, fail } = common;

  function dbCategories() {
    const list = router.db.get("categories").value();
    return Array.isArray(list) ? list : null;
  }

  function toNumberId(raw, fallbackIndex) {
    if (raw == null) return fallbackIndex + 1;
    const s = String(raw);
    const m = s.match(/\d+/);
    if (m) return Number(m[0]);
    return fallbackIndex + 1;
  }

  function toCategoryDto(row, idx) {
    const rawId = row.category_id ?? row.categoryId ?? row.id;
    const categoryId = toNumberId(rawId, idx);

    const parentRaw = row.parent_id ?? row.parentId ?? null;
    const parentId =
      parentRaw === null || parentRaw === undefined || parentRaw === ""
        ? null
        : toNumberId(parentRaw, 0);

    const name = String(row.name ?? "");
    const sortOrder = Number(row.sort_order ?? row.sortOrder ?? idx + 1);
    const depth = Number(row.depth ?? (parentId == null ? 1 : 2));

    const activeNum = Number(row.is_active ?? row.isActive ?? 1);
    const isActive = activeNum === 1 ? "Y" : "N";

    return { categoryId, parentId, name, depth, sortOrder, isActive, children: [] };
  }

  function buildTree(dtos) {
    const map = new Map();
    for (const d of dtos) {
      const key = d.parentId;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(d);
    }
    for (const [, arr] of map) arr.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    const roots = map.get(null) || [];
    function attach(node) {
      const children = map.get(node.categoryId) || [];
      node.children = children;
      for (const c of children) attach(c);
    }
    for (const r of roots) attach(r);
    return roots;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function isDeletedRow(row) {
    return row.deleted_at != null || row.deletedAt != null;
  }

  function parseNullableNumber(v) {
    if (v === null || v === undefined || String(v).trim() === "" || String(v) === "null") return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }

  function nextCategoryId(list) {
    let max = 0;
    for (let i = 0; i < list.length; i++) {
      const rawId = list[i].category_id ?? list[i].categoryId ?? list[i].id;
      const n = toNumberId(rawId, i);
      if (n > max) max = n;
    }
    return max + 1;
  }

  function findIndexByDtoId(list, idNum) {
    for (let i = 0; i < list.length; i++) {
      const dto = toCategoryDto(list[i], i);
      if (dto.categoryId === idNum) return i;
    }
    return -1;
  }

  /* ---------- 관리자용 ---------- */

  // ✅ exists는 :id 보다 먼저
  server.get("/api/admin/categories/exists", (req, res) => {
    const list = dbCategories();
    if (!list) return res.status(500).json(fail("db.json에 categories 배열이 없습니다."));

    const name = String(req.query.name ?? "").trim();
    if (!name) return res.status(400).json(fail("name은 필수입니다."));

    const parentId = parseNullableNumber(req.query.parentId);

    const exists = list
      .filter((r) => !isDeletedRow(r))
      .some((r, idx) => {
        const dto = toCategoryDto(r, idx);
        return dto.parentId === parentId && String(dto.name).trim() === name;
      });

    return res.json(ok({ exists }, "중복 체크 성공"));
  });

  // 관리자 트리
  server.get("/api/admin/categories/tree", (req, res) => {
    const list = dbCategories();
    if (!list) return res.status(500).json(fail("db.json에 categories 배열이 없습니다."));
    const dtos = list
      .filter((r) => !isDeletedRow(r))
      .map((r, idx) => toCategoryDto(r, idx));
    return res.json(ok(buildTree(dtos), "관리자 카테고리 트리 조회 성공"));
  });

  // 관리자 목록
  server.get("/api/admin/categories", (req, res) => {
    const list = dbCategories();
    if (!list) return res.status(500).json(fail("db.json에 categories 배열이 없습니다."));

    const out = list
      .filter((r) => !isDeletedRow(r))
      .map((r, idx) => {
        const dto = toCategoryDto(r, idx);
        const { children, ...row } = dto;
        return row;
      });

    return res.json(ok(out, "관리자 카테고리 목록 조회 성공"));
  });

  // 관리자 상세
  server.get("/api/admin/categories/:categoryId", (req, res) => {
    const list = dbCategories();
    if (!list) return res.status(500).json(fail("db.json에 categories 배열이 없습니다."));

    const idNum = Number(req.params.categoryId);
    if (Number.isNaN(idNum)) return res.status(400).json(fail("categoryId는 숫자여야 합니다."));

    const idx = findIndexByDtoId(list, idNum);
    if (idx < 0 || isDeletedRow(list[idx])) return res.status(404).json(fail("카테고리를 찾을 수 없습니다."));

    const dto = toCategoryDto(list[idx], idx);
    const { children, ...row } = dto;
    return res.json(ok(row, "관리자 카테고리 상세 조회 성공"));
  });

  // ✅ 생성
  server.post("/api/admin/categories", (req, res) => {
    const list = dbCategories();
    if (!list) return res.status(500).json(fail("db.json에 categories 배열이 없습니다."));

    const name = String(req.body?.name ?? "").trim();
    const parentId = parseNullableNumber(req.body?.parentId);

    if (!name) return res.status(400).json(fail("name은 필수입니다."));

    const dup = list
      .filter((r) => !isDeletedRow(r))
      .some((r, idx) => {
        const dto = toCategoryDto(r, idx);
        return dto.parentId === parentId && String(dto.name).trim() === name;
      });
    if (dup) return res.status(409).json(fail("동일 부모 아래 동일 이름 카테고리가 이미 존재합니다."));

    const newId = nextCategoryId(list);

    let depth = 1;
    if (parentId !== null) {
      const pIdx = findIndexByDtoId(list, parentId);
      if (pIdx >= 0 && !isDeletedRow(list[pIdx])) {
        const pDto = toCategoryDto(list[pIdx], pIdx);
        depth = Number(pDto.depth) + 1;
      } else {
        depth = 2;
      }
    }

    let sortOrder = Number(req.body?.sortOrder);
    if (Number.isNaN(sortOrder) || sortOrder <= 0) {
      const siblings = list
        .filter((r) => !isDeletedRow(r))
        .map((r, idx) => toCategoryDto(r, idx))
        .filter((c) => c.parentId === parentId);
      const maxOrder = siblings.reduce((m, c) => (c.sortOrder > m ? c.sortOrder : m), 0);
      sortOrder = maxOrder + 1;
    }

    const row = {
      category_id: newId,
      parent_id: parentId,
      name,
      depth,
      sort_order: sortOrder,
      is_active: 1,
      created_at: nowIso(),
      updated_at: nowIso(),
      deleted_at: null,
    };

    router.db.get("categories").push(row).write();

    const dto = toCategoryDto(row, list.length);
    const { children, ...out } = dto;
    return res.status(201).json(ok(out, "카테고리 생성 성공"));
  });

  // ✅ 수정(PATCH /:id)
  server.patch("/api/admin/categories/:categoryId", (req, res) => {
    const list = dbCategories();
    if (!list) return res.status(500).json(fail("db.json에 categories 배열이 없습니다."));

    const idNum = Number(req.params.categoryId);
    if (Number.isNaN(idNum)) return res.status(400).json(fail("categoryId는 숫자여야 합니다."));

    const idx = findIndexByDtoId(list, idNum);
    if (idx < 0 || isDeletedRow(list[idx])) return res.status(404).json(fail("카테고리를 찾을 수 없습니다."));

    const nextNameRaw = req.body?.name;
    const nextParentRaw = req.body?.parentId;
    const nextSortRaw = req.body?.sortOrder;
    const nextActiveRaw = req.body?.isActive;

    if (nextNameRaw !== undefined) {
      const nextName = String(nextNameRaw).trim();
      if (!nextName) return res.status(400).json(fail("name은 빈 값일 수 없습니다."));

      // 같은 parentId 아래 중복 체크
      const curDto = toCategoryDto(list[idx], idx);
      const parentId = curDto.parentId;
      const dup = list
        .filter((r) => !isDeletedRow(r))
        .some((r, i) => {
          if (i === idx) return false;
          const dto = toCategoryDto(r, i);
          return dto.parentId === parentId && String(dto.name).trim() === nextName;
        });
      if (dup) return res.status(409).json(fail("동일 부모 아래 동일 이름 카테고리가 이미 존재합니다."));

      list[idx].name = nextName;
    }

    if (nextParentRaw !== undefined) {
      const nextParentId = parseNullableNumber(nextParentRaw);

      // 자기 자신을 부모로 지정 금지
      if (nextParentId !== null && nextParentId === idNum) {
        return res.status(400).json(fail("자기 자신을 부모로 지정할 수 없습니다."));
      }

      list[idx].parent_id = nextParentId;

      let depth = 1;
      if (nextParentId !== null) {
        const pIdx = findIndexByDtoId(list, nextParentId);
        depth = pIdx >= 0 && !isDeletedRow(list[pIdx]) ? Number(toCategoryDto(list[pIdx], pIdx).depth) + 1 : 2;
      }
      list[idx].depth = depth;
    }

    if (nextSortRaw !== undefined) {
      const n = Number(nextSortRaw);
      if (Number.isNaN(n) || n <= 0) return res.status(400).json(fail("sortOrder는 1 이상의 숫자여야 합니다."));
      list[idx].sort_order = n;
    }

    if (nextActiveRaw !== undefined) {
      const v = String(nextActiveRaw);
      if (v !== "Y" && v !== "N") return res.status(400).json(fail("isActive는 'Y' 또는 'N'이어야 합니다."));
      list[idx].is_active = v === "Y" ? 1 : 0;
    }

    list[idx].updated_at = nowIso();
    router.db.set("categories", list).write();

    const dto = toCategoryDto(list[idx], idx);
    const { children, ...out } = dto;
    return res.json(ok(out, "카테고리 수정 성공"));
  });

  // ✅ active 전용
  server.patch("/api/admin/categories/:categoryId/active", (req, res) => {
    const v = String(req.body?.isActive ?? "");
    if (v !== "Y" && v !== "N") return res.status(400).json(fail("isActive는 'Y' 또는 'N'이어야 합니다."));
    req.body = { isActive: v };

    const list = dbCategories();
    if (!list) return res.status(500).json(fail("db.json에 categories 배열이 없습니다."));

    const idNum = Number(req.params.categoryId);
    if (Number.isNaN(idNum)) return res.status(400).json(fail("categoryId는 숫자여야 합니다."));

    const idx = findIndexByDtoId(list, idNum);
    if (idx < 0 || isDeletedRow(list[idx])) return res.status(404).json(fail("카테고리를 찾을 수 없습니다."));

    list[idx].is_active = v === "Y" ? 1 : 0;
    list[idx].updated_at = nowIso();
    router.db.set("categories", list).write();

    const dto = toCategoryDto(list[idx], idx);
    const { children, ...out } = dto;
    return res.json(ok(out, "활성 상태 변경 성공"));
  });

  // ✅ sort-order 전용
  server.patch("/api/admin/categories/:categoryId/sort-order", (req, res) => {
    const n = Number(req.body?.sortOrder);
    if (Number.isNaN(n) || n <= 0) return res.status(400).json(fail("sortOrder는 1 이상의 숫자여야 합니다."));

    const list = dbCategories();
    if (!list) return res.status(500).json(fail("db.json에 categories 배열이 없습니다."));

    const idNum = Number(req.params.categoryId);
    if (Number.isNaN(idNum)) return res.status(400).json(fail("categoryId는 숫자여야 합니다."));

    const idx = findIndexByDtoId(list, idNum);
    if (idx < 0 || isDeletedRow(list[idx])) return res.status(404).json(fail("카테고리를 찾을 수 없습니다."));

    list[idx].sort_order = n;
    list[idx].updated_at = nowIso();
    router.db.set("categories", list).write();

    const dto = toCategoryDto(list[idx], idx);
    const { children, ...out } = dto;
    return res.json(ok(out, "정렬 순서 변경 성공"));
  });

  // ✅ parent 전용
  server.patch("/api/admin/categories/:categoryId/parent", (req, res) => {
    const nextParentId = parseNullableNumber(req.body?.parentId);

    const list = dbCategories();
    if (!list) return res.status(500).json(fail("db.json에 categories 배열이 없습니다."));

    const idNum = Number(req.params.categoryId);
    if (Number.isNaN(idNum)) return res.status(400).json(fail("categoryId는 숫자여야 합니다."));

    if (nextParentId !== null && nextParentId === idNum) {
      return res.status(400).json(fail("자기 자신을 부모로 지정할 수 없습니다."));
    }

    const idx = findIndexByDtoId(list, idNum);
    if (idx < 0 || isDeletedRow(list[idx])) return res.status(404).json(fail("카테고리를 찾을 수 없습니다."));

    list[idx].parent_id = nextParentId;

    let depth = 1;
    if (nextParentId !== null) {
      const pIdx = findIndexByDtoId(list, nextParentId);
      depth = pIdx >= 0 && !isDeletedRow(list[pIdx]) ? Number(toCategoryDto(list[pIdx], pIdx).depth) + 1 : 2;
    }
    list[idx].depth = depth;

    list[idx].updated_at = nowIso();
    router.db.set("categories", list).write();

    const dto = toCategoryDto(list[idx], idx);
    const { children, ...out } = dto;
    return res.json(ok(out, "부모 변경 성공"));
  });

  // ✅ soft delete
  server.delete("/api/admin/categories/:categoryId", (req, res) => {
    const list = dbCategories();
    if (!list) return res.status(500).json(fail("db.json에 categories 배열이 없습니다."));

    const idNum = Number(req.params.categoryId);
    if (Number.isNaN(idNum)) return res.status(400).json(fail("categoryId는 숫자여야 합니다."));

    const idx = findIndexByDtoId(list, idNum);
    if (idx < 0) return res.status(404).json(fail("카테고리를 찾을 수 없습니다."));

    list[idx].deleted_at = nowIso();
    list[idx].updated_at = nowIso();
    router.db.set("categories", list).write();

    return res.json(ok(null, "카테고리 삭제(soft) 성공"));
  });

  /* ---------- 사용자용 ---------- */

  server.get("/api/categories/tree", (req, res) => {
    const list = dbCategories();
    if (!list) return res.status(500).json(fail("db.json에 categories 배열이 없습니다."));
    const dtos = list
      .filter((r) => !isDeletedRow(r))
      .map((r, idx) => toCategoryDto(r, idx))
      .filter((c) => c.isActive === "Y");
    return res.json(ok(buildTree(dtos), "카테고리 트리 조회 성공"));
  });

  server.get("/api/categories/children", (req, res) => {
    const parentIdRaw = req.query.parentId;
    if (parentIdRaw === undefined || parentIdRaw === null || String(parentIdRaw).trim() === "") {
      return res.status(400).json(fail("parentId는 필수입니다."));
    }
    const pid = Number(parentIdRaw);
    if (Number.isNaN(pid)) return res.status(400).json(fail("parentId는 숫자여야 합니다."));

    const list = dbCategories();
    if (!list) return res.status(500).json(fail("db.json에 categories 배열이 없습니다."));

    const dtos = list
      .filter((r) => !isDeletedRow(r))
      .map((r, idx) => toCategoryDto(r, idx))
      .filter((c) => c.isActive === "Y");

    const children = dtos
      .filter((c) => c.parentId === pid)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    return res.json(ok(children, "하위 카테고리 조회 성공"));
  });
};
