package com.enfantTerrible.enfantTerrible.service.qna;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.dto.qna.QnaMessageResponse;
import com.enfantTerrible.enfantTerrible.dto.qna.QnaMessageRow;
import com.enfantTerrible.enfantTerrible.dto.qna.QnaRoomResponse;
import com.enfantTerrible.enfantTerrible.dto.qna.QnaRoomRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.qna.QnaMessageMapper;
import com.enfantTerrible.enfantTerrible.mapper.qna.QnaRoomMapper;
import com.enfantTerrible.enfantTerrible.service.file.FileQueryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QnaQueryService {

  private static final String REF_TYPE_QNA_MESSAGE = "qna_message";
  private static final String FILE_ROLE_CONTENT = "CONTENT";

  private final QnaRoomMapper qnaRoomMapper;
  private final QnaMessageMapper qnaMessageMapper;
  private final FileQueryService fileQueryService;

  @Transactional
  public QnaRoomResponse getOrCreateMyRoom(Long userId) {
    QnaRoomRow room = qnaRoomMapper.findByUserId(userId);

    if (room == null) {
      qnaRoomMapper.insert(userId);
      room = qnaRoomMapper.findByUserId(userId);
    }

    if (room == null) {
      throw new BusinessException("QnA 방 생성에 실패했습니다.");
    }

    QnaRoomResponse res = new QnaRoomResponse();
    res.setRoomId(room.getRoomId());
    res.setUserId(room.getUserId());
    res.setStatus(room.getStatus());
    res.setLastMessageAt(room.getLastMessageAt());
    res.setCreatedAt(room.getCreatedAt());
    res.setUnread(qnaRoomMapper.countUnreadForUser(room.getRoomId()));
    return res;
  }

  public List<QnaMessageResponse> getRecentMessages(Long roomId, int limit) {
    return getRecentMessagesForUser(null, roomId, limit);
  }

  public List<QnaMessageResponse> getRecentMessagesForUser(Long userId, Long roomId, int limit) {
    if (limit < 1) limit = 30;
    if (limit > 200) limit = 200;

    if (userId != null) {
      QnaRoomRow room = qnaRoomMapper.findById(roomId);
      if (room == null || !room.getUserId().equals(userId)) {
        throw new BusinessException("권한이 없습니다.");
      }
    }

    List<QnaMessageRow> rows = qnaMessageMapper.findRecentByRoomId(roomId, limit);
    List<QnaMessageResponse> list = new ArrayList<>();

    for (QnaMessageRow r : rows) {
      QnaMessageResponse m = new QnaMessageResponse();
      m.setMessageId(r.getMessageId());
      m.setRoomId(r.getRoomId());
      m.setSender(r.getSender() == null ? null : r.getSender().name());
      m.setMessage(r.getMessage());
      m.setImageUrls(fileQueryService.findFileUrls(REF_TYPE_QNA_MESSAGE, r.getMessageId(), FILE_ROLE_CONTENT));
      m.setCreatedAt(r.getCreatedAt());
      list.add(m);
    }

    Collections.reverse(list);
    return list;
  }
}
