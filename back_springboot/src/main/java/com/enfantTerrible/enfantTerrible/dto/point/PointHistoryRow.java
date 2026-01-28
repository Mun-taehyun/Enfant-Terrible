package com.enfantTerrible.enfantTerrible.dto.point;

import java.time.LocalDateTime;

import com.enfantTerrible.enfantTerrible.common.enums.PointType;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PointHistoryRow {

  private Long pointHistoryId;
  private Long userId;

  private Integer pointAmount;
  private PointType pointType;

  private String reason;
  private String refType;
  private Long refId;

  private LocalDateTime createdAt;
}
