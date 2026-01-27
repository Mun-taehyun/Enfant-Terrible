package com.enfantTerrible.enfantTerrible.dto.qna;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QnaRoomRow {

  private Long roomId;
  private Long userId;
  private String status;

  private Long userLastReadMessageId;
  private Long adminLastReadMessageId;

  private LocalDateTime lastMessageAt;
  private LocalDateTime createdAt;
}
