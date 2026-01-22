package com.enfantTerrible.enfantTerrible.websocket.qna;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.FileRefType;
import com.enfantTerrible.enfantTerrible.common.enums.FileRole;
import com.enfantTerrible.enfantTerrible.common.enums.UserRole;
import com.enfantTerrible.enfantTerrible.dto.file.FileRow;
import com.enfantTerrible.enfantTerrible.dto.qna.QnaMessagePayload;
import com.enfantTerrible.enfantTerrible.dto.qna.QnaNotifyPayload;
import com.enfantTerrible.enfantTerrible.dto.qna.QnaReadRequest;
import com.enfantTerrible.enfantTerrible.dto.qna.QnaRoomRow;
import com.enfantTerrible.enfantTerrible.dto.qna.QnaSendRequest;
import com.enfantTerrible.enfantTerrible.dto.qna.QnaUnreadPayload;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.qna.QnaMessageMapper;
import com.enfantTerrible.enfantTerrible.mapper.qna.QnaRoomMapper;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;
import com.enfantTerrible.enfantTerrible.service.file.FileCommandService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class QnaWebSocketController {

  private final QnaRoomMapper qnaRoomMapper;
  private final QnaMessageMapper qnaMessageMapper;
  private final SimpMessagingTemplate messagingTemplate;

  private final FileCommandService fileCommandService;

  @MessageMapping("/qna.send")
  @Transactional
  public void send(
      @Valid @Payload QnaSendRequest req,
      org.springframework.messaging.Message<?> message
  ) {
    CustomUserPrincipal principal = extractPrincipal(message);

    boolean isAdmin = principal.getRole() == UserRole.ADMIN;
    Long roomId = resolveRoomId(principal, isAdmin, req.getRoomId());

    boolean hasText = req.getMessage() != null && !req.getMessage().isBlank();
    boolean hasImages = req.getImageUrls() != null && !req.getImageUrls().isEmpty();
    if (!hasText && !hasImages) {
      throw new BusinessException("메시지 또는 이미지가 필요합니다.");
    }

    String sender = isAdmin ? "ADMIN" : "USER";

    int inserted = qnaMessageMapper.insert(roomId, sender, req.getMessage());
    if (inserted != 1) {
      throw new BusinessException("메시지 저장에 실패했습니다.");
    }

    Long messageId = qnaMessageMapper.findLastInsertId();

    if (messageId != null && hasImages) {
      saveMessageImages(messageId, req.getImageUrls());
    }

    qnaRoomMapper.touchLastMessage(roomId);

    QnaMessagePayload payload = new QnaMessagePayload();
    payload.setRoomId(roomId);
    payload.setMessageId(messageId);
    payload.setSender(sender);
    payload.setMessage(req.getMessage());
    payload.setImageUrls(hasImages ? req.getImageUrls() : List.of());
    payload.setCreatedAt(LocalDateTime.now());

    // 보낸 사람에게 에코
    sendToSelf(principal, payload);

    // 상대방에게 전달 + unread/notify
    if (isAdmin) {
      QnaRoomRow room = qnaRoomMapper.findById(roomId);
      if (room == null) {
        throw new BusinessException("방을 찾을 수 없습니다.");
      }
      String userDest = "/user/" + room.getUserId() + "/queue/qna/messages";
      messagingTemplate.convertAndSend(userDest, payload);

      pushUserUnread(roomId, room.getUserId());
      pushUserNotify(roomId, sender, req.getMessage(), room.getUserId());

      // 관리자 화면에도 브로드캐스트
      messagingTemplate.convertAndSend("/topic/qna/admin/messages", payload);
      pushAdminUnread(roomId);
      pushAdminNotify(roomId, sender, req.getMessage());

    } else {
      // 관리자에게 브로드캐스트
      messagingTemplate.convertAndSend("/topic/qna/admin/messages", payload);
      pushAdminUnread(roomId);
      pushAdminNotify(roomId, sender, req.getMessage());

      // 유저 본인 unread도 갱신
      pushUserUnread(roomId, principal.getUserId());
    }
  }

  @MessageMapping("/qna.read")
  @Transactional
  public void read(
      @Valid @Payload QnaReadRequest req,
      org.springframework.messaging.Message<?> message
  ) {
    CustomUserPrincipal principal = extractPrincipal(message);

    boolean isAdmin = principal.getRole() == UserRole.ADMIN;

    if (isAdmin) {
      qnaRoomMapper.updateAdminLastRead(req.getRoomId(), req.getLastReadMessageId());
      pushAdminUnread(req.getRoomId());
    } else {
      QnaRoomRow room = qnaRoomMapper.findById(req.getRoomId());
      if (room == null || !room.getUserId().equals(principal.getUserId())) {
        throw new BusinessException("권한이 없습니다.");
      }
      qnaRoomMapper.updateUserLastRead(req.getRoomId(), req.getLastReadMessageId());
      pushUserUnread(req.getRoomId(), principal.getUserId());
    }
  }

  private Long resolveRoomId(CustomUserPrincipal principal, boolean isAdmin, Long reqRoomId) {
    if (isAdmin) {
      if (reqRoomId == null) {
        throw new BusinessException("관리자 메시지는 roomId가 필요합니다.");
      }
      return reqRoomId;
    }

    // 유저는 자신의 방을 사용(없으면 생성)
    QnaRoomRow room = qnaRoomMapper.findByUserId(principal.getUserId());
    if (room != null) {
      return room.getRoomId();
    }

    qnaRoomMapper.insert(principal.getUserId());
    return qnaRoomMapper.findLastInsertId();
  }

  private void sendToSelf(CustomUserPrincipal principal, QnaMessagePayload payload) {
    String dest = "/user/" + principal.getUserId() + "/queue/qna/messages";
    messagingTemplate.convertAndSend(dest, payload);

    if (principal.getRole() == UserRole.ADMIN) {
      messagingTemplate.convertAndSend("/topic/qna/admin/messages", payload);
    }
  }

  private void pushUserUnread(Long roomId, Long userId) {
    int unread = qnaRoomMapper.countUnreadForUser(roomId);
    QnaUnreadPayload u = new QnaUnreadPayload();
    u.setRoomId(roomId);
    u.setUnread(unread);
    messagingTemplate.convertAndSend("/user/" + userId + "/queue/qna/unread", u);
  }

  private void pushAdminUnread(Long roomId) {
    int unread = qnaRoomMapper.countUnreadForAdmin(roomId);
    QnaUnreadPayload u = new QnaUnreadPayload();
    u.setRoomId(roomId);
    u.setUnread(unread);
    messagingTemplate.convertAndSend("/topic/qna/admin/unread", u);
  }

  private void pushUserNotify(Long roomId, String sender, String msg, Long userId) {
    QnaNotifyPayload n = new QnaNotifyPayload();
    n.setRoomId(roomId);
    n.setSender(sender);
    n.setPreview(toPreview(msg));
    messagingTemplate.convertAndSend("/user/" + userId + "/queue/qna/notify", n);
  }

  private void pushAdminNotify(Long roomId, String sender, String msg) {
    QnaNotifyPayload n = new QnaNotifyPayload();
    n.setRoomId(roomId);
    n.setSender(sender);
    n.setPreview(toPreview(msg));
    messagingTemplate.convertAndSend("/topic/qna/admin/notify", n);
  }

  private String toPreview(String msg) {
    if (msg == null) {
      return "";
    }
    String s = msg.strip();
    return s.length() <= 40 ? s : s.substring(0, 40);
  }

  private CustomUserPrincipal extractPrincipal(org.springframework.messaging.Message<?> message) {
    Object p = message.getHeaders().get("simpUser");
    if (p instanceof org.springframework.security.core.Authentication a
        && a.getPrincipal() instanceof CustomUserPrincipal cup) {
      return cup;
    }
    throw new BusinessException("인증 정보가 없습니다.");
  }

  private void saveMessageImages(Long messageId, List<String> imageUrls) {
    if (messageId == null || imageUrls == null || imageUrls.isEmpty()) {
      return;
    }

    for (String imageUrl : imageUrls) {
      if (imageUrl == null || imageUrl.isBlank()) {
        continue;
      }

      FileRow file = new FileRow();
      file.setRefType(FileRefType.QNA_MESSAGE);
      file.setRefId(messageId);
      file.setFileRole(FileRole.CONTENT);

      file.setFileUrl(imageUrl);
      file.setOriginalName(imageUrl);
      file.setStoredName(imageUrl);
      file.setFileType("URL");
      file.setFilePath("");

      fileCommandService.save(file);
    }
  }
}
