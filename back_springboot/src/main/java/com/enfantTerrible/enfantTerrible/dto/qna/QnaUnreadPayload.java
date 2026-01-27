package com.enfantTerrible.enfantTerrible.dto.qna;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QnaUnreadPayload {

  private Long roomId;
  private Integer unread;
}
