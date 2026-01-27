package com.enfantTerrible.enfantTerrible.dto.qna;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QnaMessageRow {

  private Long messageId;
  private Long roomId;
  private QnaSender sender;
  private String message;
  private LocalDateTime createdAt;
}
