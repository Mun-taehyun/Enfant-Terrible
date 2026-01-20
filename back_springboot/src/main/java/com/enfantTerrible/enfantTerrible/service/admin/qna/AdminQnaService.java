package com.enfantTerrible.enfantTerrible.service.admin.qna;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.qna.AdminQnaRoomListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.qna.AdminQnaRoomListResponse;
import com.enfantTerrible.enfantTerrible.dto.qna.QnaMessageResponse;
import com.enfantTerrible.enfantTerrible.dto.qna.QnaMessageRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.admin.qna.AdminQnaMapper;
import com.enfantTerrible.enfantTerrible.mapper.qna.QnaMessageMapper;
import com.enfantTerrible.enfantTerrible.mapper.qna.QnaRoomMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminQnaService {

  private final AdminQnaMapper adminQnaMapper;
  private final QnaRoomMapper qnaRoomMapper;
  private final QnaMessageMapper qnaMessageMapper;

  @Transactional(readOnly = true)
  public AdminPageResponse<AdminQnaRoomListResponse> getRooms(AdminQnaRoomListRequest req) {
    normalizePaging(req);

    int total = adminQnaMapper.countRooms(req);
    List<AdminQnaRoomListResponse> list = adminQnaMapper.findRooms(req);

    return new AdminPageResponse<>(req.getPage(), req.getSize(), total, list);
  }

  @Transactional(readOnly = true)
  public List<QnaMessageResponse> getRecentMessages(Long roomId, int limit) {
    if (qnaRoomMapper.findById(roomId) == null) {
      throw new BusinessException("방을 찾을 수 없습니다.");
    }

    if (limit < 1) limit = 30;
    if (limit > 200) limit = 200;

    List<QnaMessageRow> rows = qnaMessageMapper.findRecentByRoomId(roomId, limit);
    List<QnaMessageResponse> list = new ArrayList<>();

    for (QnaMessageRow r : rows) {
      QnaMessageResponse m = new QnaMessageResponse();
      m.setMessageId(r.getMessageId());
      m.setRoomId(r.getRoomId());
      m.setSender(r.getSender() == null ? null : r.getSender().name());
      m.setMessage(r.getMessage());
      m.setCreatedAt(r.getCreatedAt());
      list.add(m);
    }

    Collections.reverse(list);
    return list;
  }

  private void normalizePaging(AdminQnaRoomListRequest req) {
    if (req == null) {
      throw new BusinessException("요청 값이 비어있습니다.");
    }

    if (req.getPage() < 1) {
      req.setPage(1);
    }

    if (req.getSize() < 1) {
      req.setSize(20);
    } else if (req.getSize() > 200) {
      req.setSize(200);
    }
  }
}
