package com.enfantTerrible.enfantTerrible.dto.admin.popup;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPopupDetailResponse {

  private Long popupId;
  private String title;
  private String content;
  private String linkUrl;

  private String position;
  private Integer width;
  private Integer height;

  private Boolean isActive;
  private LocalDateTime startAt;
  private LocalDateTime endAt;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private LocalDateTime deletedAt;
}
