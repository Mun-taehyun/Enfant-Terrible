package com.enfantTerrible.enfantTerrible.dto.admin.qna;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminQnaRoomListResponse {

  private Long roomId;
  private Long userId;
  private String status;
  private LocalDateTime lastMessageAt;
  private Integer unread;
}
