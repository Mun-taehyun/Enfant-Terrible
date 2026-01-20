package com.enfantTerrible.enfantTerrible.dto.qna;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QnaSendRequest {

  private Long roomId;

  @NotBlank
  private String message;
}
