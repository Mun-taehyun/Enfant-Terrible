package com.enfantTerrible.enfantTerrible.dto.point;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PointChangeRequest {

  @NotNull
  @Min(1)
  private Integer amount;

  private String reason;
  private String refType;
  private Long refId;
}
