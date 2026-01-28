package com.enfantTerrible.enfantTerrible.dto.qna;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QnaNotifyPayload {

  private Long roomId;
  private String sender;
  private String preview;
}
