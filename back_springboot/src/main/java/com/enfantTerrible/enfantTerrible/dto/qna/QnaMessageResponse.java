package com.enfantTerrible.enfantTerrible.dto.qna;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QnaMessageResponse {

  private Long messageId;
  private Long roomId;
  private String sender;
  private String message;
  private LocalDateTime createdAt;
}
