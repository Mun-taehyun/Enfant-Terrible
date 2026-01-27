package com.enfantTerrible.enfantTerrible.dto.admin.banner;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminBannerSaveRequest {

  @NotBlank
  private String title;

  private String linkUrl;
  private Integer sortOrder;

  private Boolean isActive;
  private LocalDateTime startAt;
  private LocalDateTime endAt;

  private String imageUrl;
}
