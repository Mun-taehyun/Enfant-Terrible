// mock/users.routes.cjs
module.exports = function registerUsersRoutes(server, router, common) {
  const { ok, fail } = common;

  const ALLOWED_STATUSES = new Set(["ACTIVE", "SUSPENDED", "WITHDRAWN"]);
  function normalizeStatus(v) {
    return ALLOWED_STATUSES.has(v) ? v : "ACTIVE";
  }

  function toDetail(u) {
    const zip = u.zipCode ?? u.zip_code ?? "";
    const base = u.addressBase ?? u.address_base ?? "";
    const detail = u.addressDetail ?? u.address_detail ?? "";
    const address = [zip, base, detail].filter(Boolean).join(" ");

    return {
      userId: Number(u.userId ?? u.id),
      email: String(u.email ?? ""),
      name: String(u.name ?? ""),
      tel: String(u.tel ?? ""),
      address,
      role: String(u.role ?? "USER"),
      status: normalizeStatus(u.status),
      lastLoginAt: u.lastLoginAt ?? u.last_login_at ?? null,
    };
  }

  server.get("/api/admin/users", (req, res) => {
    const page = Number(req.query.page ?? 1);
    const size = Number(req.query.size ?? 10);

    const email = (req.query.email ?? "").toString().trim();
    const name = (req.query.name ?? "").toString().trim();
    const status = (req.query.status ?? "").toString().trim();

    const db = router.db;
    const usersArr = db.get("users").value();

    if (!Array.isArray(usersArr)) {
      return res.status(500).json(fail("db.json에 users 배열이 없습니다."));
    }

    let users = usersArr;
    if (email) users = users.filter((u) => String(u.email ?? "").includes(email));
    if (name) users = users.filter((u) => String(u.name ?? "").includes(name));
    if (status) users = users.filter((u) => String(u.status ?? "") === status);

    const totalElements = users.length;
    const totalPages = Math.ceil(totalElements / size);

    const start = (page - 1) * size;
    const pageUsers = users.slice(start, start + size);

    const content = pageUsers.map((u) => ({
      userId: Number(u.userId ?? u.id),
      email: String(u.email ?? ""),
      name: String(u.name ?? ""),
      status: normalizeStatus(u.status),
      role: String(u.role ?? "USER"),
    }));

    const pageData = { content, totalElements, totalPages, page, size, number: page, pageSize: size };
    return res.json(ok(pageData, "사용자 목록 조회 성공"));
  });

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

  server.patch("/api/admin/users/:userId/status", (req, res) => {
    const userId = Number(req.params.userId);
    if (Number.isNaN(userId)) return res.status(400).json(fail("userId는 숫자여야 합니다."));

    const next = req.body?.status;
    if (!ALLOWED_STATUSES.has(next)) {
      return res.status(400).json(fail("status는 ACTIVE / SUSPENDED / WITHDRAWN 만 가능합니다."));
    }

    const db = router.db;
    const usersArr = db.get("users").value();
    if (!Array.isArray(usersArr)) {
      return res.status(500).json(fail("db.json에 users 배열이 없습니다."));
    }

    const found =
      db.get("users").find({ userId }).value() ||
      db.get("users").find({ id: userId }).value();

    if (!found) return res.status(404).json(fail("사용자를 찾을 수 없습니다."));

    const byUserId = db.get("users").find({ userId }).value();
    if (byUserId) db.get("users").find({ userId }).assign({ status: next }).write();
    else db.get("users").find({ id: userId }).assign({ status: next }).write();

    return res.json(ok(null, "사용자 상태 변경 완료"));
  });
};
