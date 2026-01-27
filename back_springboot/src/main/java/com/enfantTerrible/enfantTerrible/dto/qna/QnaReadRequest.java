package com.enfantTerrible.enfantTerrible.dto.qna;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QnaReadRequest {

  @NotNull
  private Long roomId;

  @NotNull
  private Long lastReadMessageId;
}
