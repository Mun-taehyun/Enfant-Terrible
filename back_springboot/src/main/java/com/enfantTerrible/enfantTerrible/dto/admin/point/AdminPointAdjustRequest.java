package com.enfantTerrible.enfantTerrible.dto.admin.point;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPointAdjustRequest {

  @NotNull
  private Integer amount;

  private String reason;
  private String refType;
  private Long refId;
}
