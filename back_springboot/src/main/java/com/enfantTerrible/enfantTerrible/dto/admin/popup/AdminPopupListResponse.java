package com.enfantTerrible.enfantTerrible.dto.admin.popup;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPopupListResponse {

  private Long popupId;
  private String title;
  private String linkUrl;
  private String position;

  private Boolean isActive;
  private LocalDateTime startAt;
  private LocalDateTime endAt;

  private LocalDateTime createdAt;
}
