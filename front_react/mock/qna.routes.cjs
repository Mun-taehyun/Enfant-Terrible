// mock/qna.routes.cjs
// 목적: Spring AdminQnaController 스펙과 동일하게 mock 응답 제공
//  - GET /api/admin/qna/rooms?page=1&size=20&userId=...
//    => ApiResponse.success(AdminPageResponse<AdminQnaRoomListResponse>)
//    => data: { page, size, totalCount, list: [...] }
//  - GET /api/admin/qna/messages?roomId=1&limit=50
//    => ApiResponse.success(List<QnaMessageResponse>)

module.exports = function registerQnaRoutes(server, router, common) {
  const { ok, fail } = common;

  // -----------------------
  // 더미 데이터 (db.json 미사용)
  // -----------------------
  const ROOMS = [
    {
      roomId: 101,
      userId: 1,
      status: "OPEN",
      lastMessageAt: "2026-01-18T10:12:00+09:00",
      unread: 2,
    },
    {
      roomId: 102,
      userId: 2,
      status: "OPEN",
      lastMessageAt: "2026-01-17T19:40:00+09:00",
      unread: 0,
    },
    {
      roomId: 103,
      userId: 2,
      status: "CLOSED",
      lastMessageAt: "2026-01-16T09:05:00+09:00",
      unread: 5,
    },
  ];

  const MESSAGES = [
    {
      messageId: 1001,
      roomId: 101,
      sender: "USER",
      message: "배송이 너무 늦어요.",
      createdAt: "2026-01-18T09:50:00+09:00",
    },
    {
      messageId: 1002,
      roomId: 101,
      sender: "ADMIN",
      message: "확인 후 안내드리겠습니다. 주문번호 알려주세요.",
      createdAt: "2026-01-18T10:00:00+09:00",
    },
    {
      messageId: 1003,
      roomId: 101,
      sender: "USER",
      message: "주문번호는 ET-20260118-0001 입니다.",
      createdAt: "2026-01-18T10:12:00+09:00",
    },

    {
      messageId: 2001,
      roomId: 102,
      sender: "USER",
      message: "사이즈 교환 가능한가요?",
      createdAt: "2026-01-17T19:10:00+09:00",
    },
    {
      messageId: 2002,
      roomId: 102,
      sender: "ADMIN",
      message: "가능합니다. 수령일 기준 7일 이내 접수 부탁드립니다.",
      createdAt: "2026-01-17T19:40:00+09:00",
    },

    {
      messageId: 3001,
      roomId: 103,
      sender: "USER",
      message: "환불 문의드립니다.",
      createdAt: "2026-01-16T08:30:00+09:00",
    },
    {
      messageId: 3002,
      roomId: 103,
      sender: "ADMIN",
      message: "환불 처리 완료되었습니다.",
      createdAt: "2026-01-16T09:05:00+09:00",
    },
  ];

  function toInt(v, def) {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  }

  // -----------------------
  // GET /api/admin/qna/rooms
  // -----------------------
  server.get("/api/admin/qna/rooms", (req, res) => {
    const page = Math.max(1, toInt(req.query.page, 1));
    const size = Math.max(1, toInt(req.query.size, 20));

    const userIdRaw = req.query.userId;
    const userId = userIdRaw === undefined || userIdRaw === null || String(userIdRaw).trim() === ""
      ? null
      : toInt(userIdRaw, NaN);

    if (userId !== null && !Number.isFinite(userId)) {
      return res.status(400).json(fail("userId는 숫자여야 합니다."));
    }

    let filtered = ROOMS.slice();

    if (userId !== null) {
      filtered = filtered.filter((r) => r.userId === userId);
    }

    // 최신 메시지 기준 정렬(문자열 ISO는 사전식 정렬로 시간 정렬 가능)
    filtered.sort((a, b) => String(b.lastMessageAt).localeCompare(String(a.lastMessageAt)));

    const totalCount = filtered.length;
    const start = (page - 1) * size;
    const end = start + size;
    const list = filtered.slice(start, end);

    const data = { page, size, totalCount, list };
    return res.json(ok(data, "관리자 QnA 방 목록 조회 성공"));
  });

  // -----------------------
  // GET /api/admin/qna/messages
  // -----------------------
  server.get("/api/admin/qna/messages", (req, res) => {
    const roomId = toInt(req.query.roomId, NaN);
    const limit = Math.max(1, toInt(req.query.limit, 50));

    if (!Number.isFinite(roomId)) {
      return res.status(400).json(fail("roomId는 필수이며 숫자여야 합니다."));
    }

    const msgs = MESSAGES
      .filter((m) => m.roomId === roomId)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, limit)
      .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt))); // 화면은 오래된 -> 최신

    return res.json(ok(msgs, "관리자 QnA 메시지 조회 성공"));
  });
};
