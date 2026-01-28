package com.enfantTerrible.enfantTerrible.dto.admin.point;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPointHistoryResponse {

  private Long pointHistoryId;
  private Long userId;

  private Integer pointAmount;
  private String pointType;

  private String reason;
  private String refType;
  private Long refId;

  private LocalDateTime createdAt;
}
