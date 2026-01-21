// mock/users.routes.cjs
module.exports = function registerUsersRoutes(server, router, common) {
  const { ok, fail } = common;

  // ✅ 백엔드 enum(UserStatus): ACTIVE / SUSPENDED / DELETED
  const ALLOWED_STATUSES = new Set(["ACTIVE", "SUSPENDED", "DELETED"]);
  function normalizeStatus(v) {
    return ALLOWED_STATUSES.has(v) ? v : "ACTIVE";
  }

  // ✅ AdminUserPetResponse (DTO 필드 그대로)
  function toPet(p) {
    if (!p) return null;
    return {
      petId: Number(p.petId ?? p.id),
      name: p.name ?? null,
      species: p.species ?? null,
      breed: p.breed ?? null,
      age: typeof p.age === "number" ? p.age : (p.age == null ? null : Number(p.age)),
      gender: p.gender ?? null,
      isNeutered: typeof p.isNeutered === "boolean" ? p.isNeutered : (p.isNeutered == null ? null : Boolean(p.isNeutered)),
      activityLevel:
        typeof p.activityLevel === "number"
          ? p.activityLevel
          : (p.activityLevel == null ? null : Number(p.activityLevel)),
      weight: typeof p.weight === "number" ? p.weight : (p.weight == null ? null : Number(p.weight)),
    };
  }

  // ✅ AdminUserDetailResponse (DTO 필드 그대로)
  function toDetail(u) {
    const petsSrc = Array.isArray(u.pets) ? u.pets : [];
    const pets = petsSrc.map(toPet).filter(Boolean);

    return {
      userId: Number(u.userId ?? u.id),
      email: String(u.email ?? ""),
      name: u.name ?? null,
      tel: u.tel ?? null,

      role: u.role ?? null,
      status: normalizeStatus(u.status),
      provider: u.provider ?? null,

      emailVerified:
        typeof u.emailVerified === "boolean"
          ? u.emailVerified
          : (u.emailVerified == null ? null : Boolean(u.emailVerified)),

      createdAt: u.createdAt ?? u.created_at ?? null,
      lastLoginAt: u.lastLoginAt ?? u.last_login_at ?? null,

      pets,
    };
  }

  // ✅ AdminUserListResponse (DTO 필드 그대로)
  function toListItem(u) {
    return {
      userId: Number(u.userId ?? u.id),
      email: String(u.email ?? ""),
      name: u.name ?? null,

      role: u.role ?? null,
      status: normalizeStatus(u.status),
      provider: u.provider ?? null,

      createdAt: u.createdAt ?? u.created_at ?? null,
      lastLoginAt: u.lastLoginAt ?? u.last_login_at ?? null,
    };
  }

  // 사용자 목록 조회: GET /api/admin/users
  // 백엔드: ApiResponse<AdminPageResponse<AdminUserListResponse>>
  server.get("/api/admin/users", (req, res) => {
    const page = Number(req.query.page ?? 1);
    const size = Number(req.query.size ?? 20);

    const email = (req.query.email ?? "").toString().trim();
    const name = (req.query.name ?? "").toString().trim();
    const status = (req.query.status ?? "").toString().trim();
    const provider = (req.query.provider ?? "").toString().trim();

    const createdFrom = (req.query.createdFrom ?? "").toString().trim();
    const createdTo = (req.query.createdTo ?? "").toString().trim();

    const db = router.db;
    const usersArr = db.get("users").value();

    if (!Array.isArray(usersArr)) {
      return res.status(500).json(fail("db.json에 users 배열이 없습니다."));
    }

    let users = usersArr;

    if (email) users = users.filter((u) => String(u.email ?? "").includes(email));
    if (name) users = users.filter((u) => String(u.name ?? "").includes(name));
    if (provider) users = users.filter((u) => String(u.provider ?? "") === provider);

    if (status) {
      // status는 enum 문자열로 정확히 필터링
      users = users.filter((u) => String(normalizeStatus(String(u.status ?? ""))) === status);
    }

    // createdFrom/createdTo는 createdAt 기준(문자열 ISO 가정 없이 Date 변환 성공할 때만 적용)
    const fromTs = createdFrom ? Date.parse(createdFrom) : NaN;
    const toTs = createdTo ? Date.parse(createdTo) : NaN;

    if (!Number.isNaN(fromTs)) {
      users = users.filter((u) => {
        const t = Date.parse(u.createdAt ?? u.created_at ?? "");
        return Number.isNaN(t) ? true : t >= fromTs;
      });
    }
    if (!Number.isNaN(toTs)) {
      users = users.filter((u) => {
        const t = Date.parse(u.createdAt ?? u.created_at ?? "");
        return Number.isNaN(t) ? true : t <= toTs;
      });
    }

    const totalCount = users.length;

    const safePage = Number.isFinite(page) && page >= 1 ? page : 1;
    const safeSize = Number.isFinite(size) && size >= 1 ? size : 20;

    const start = (safePage - 1) * safeSize;
    const sliced = users.slice(start, start + safeSize);

    const list = sliced.map(toListItem);

    const pageData = {
      page: safePage,
      size: safeSize,
      totalCount,
      list,
    };

    return res.json(ok(pageData, "사용자 목록 조회 성공"));
  });

  // 사용자 상세 조회: GET /api/admin/users/{userId}
  // 백엔드: ApiResponse<AdminUserDetailResponse>
  server.get("/api/admin/users/:userId", (req, res) => {
    const userId = Number(req.params.userId);
    if (Number.isNaN(userId)) return res.status(400).json(fail("userId는 숫자여야 합니다."));

    const db = router.db;
    const usersArr = db.get("users").value();
    if (!Array.isArray(usersArr)) {
      return res.status(500).json(fail("db.json에 users 배열이 없습니다."));
    }

    const user =
      db.get("users").find({ userId }).value() ||
      db.get("users").find({ id: userId }).value();

    if (!user) return res.status(404).json(fail("사용자를 찾을 수 없습니다."));

    return res.json(ok(toDetail(user), "사용자 상세 조회 성공"));
  });

  // 사용자 상태 변경: PATCH /api/admin/users/{userId}/status
  // 백엔드: ApiResponse<Void> (successMessage -> data: null)
  server.patch("/api/admin/users/:userId/status", (req, res) => {
    const userId = Number(req.params.userId);
    if (Number.isNaN(userId)) return res.status(400).json(fail("userId는 숫자여야 합니다."));

    const next = req.body?.status;
    if (!ALLOWED_STATUSES.has(next)) {
      return res
        .status(400)
        .json(fail("status는 ACTIVE / SUSPENDED / DELETED 만 가능합니다."));
    }

    const db = router.db;
    const found =
      db.get("users").find({ userId }).value() ||
      db.get("users").find({ id: userId }).value();

    if (!found) return res.status(404).json(fail("사용자를 찾을 수 없습니다."));

    const byUserId = db.get("users").find({ userId }).value();
    if (byUserId) db.get("users").find({ userId }).assign({ status: next }).write();
    else db.get("users").find({ id: userId }).assign({ status: next }).write();

    // ApiResponse.successMessage(...) => data: null
    return res.json(ok(null, "사용자 상태 변경 완료"));
  });

  // (기존 로그인 mock 유지)
  server.post("/api/admin/auth/sign-in", (req, res) => {
    const { adminId, password } = req.body;

    if (adminId === "admin" && password === "1234") {
      return res.json(
        ok(
          {
            accessToken: "mock-access-token-12345",
            adminId: "admin",
            name: "관리자",
          },
          "로그인 성공"
        )
      );
    }
    return res.status(401).json(fail("아이디 또는 비밀번호가 올바르지 않습니다."));
  });
};
