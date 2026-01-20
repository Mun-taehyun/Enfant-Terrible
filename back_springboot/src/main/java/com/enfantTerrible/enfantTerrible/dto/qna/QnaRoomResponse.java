package com.enfantTerrible.enfantTerrible.dto.qna;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QnaRoomResponse {

  private Long roomId;
  private Long userId;
  private String status;

  private Integer unread;

  private LocalDateTime lastMessageAt;
  private LocalDateTime createdAt;
}
