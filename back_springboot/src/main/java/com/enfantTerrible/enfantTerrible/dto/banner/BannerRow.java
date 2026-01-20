package com.enfantTerrible.enfantTerrible.dto.banner;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BannerRow {

  private Long bannerId;
  private String title;
  private String linkUrl;
  private Integer sortOrder;

  private Boolean isActive;
  private LocalDateTime startAt;
  private LocalDateTime endAt;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private LocalDateTime deletedAt;
}
