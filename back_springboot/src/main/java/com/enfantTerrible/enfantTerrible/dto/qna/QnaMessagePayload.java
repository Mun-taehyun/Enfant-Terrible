package com.enfantTerrible.enfantTerrible.dto.qna;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QnaMessagePayload {

  private Long roomId;
  private Long messageId;
  private String sender;
  private String message;
  private LocalDateTime createdAt;
}
