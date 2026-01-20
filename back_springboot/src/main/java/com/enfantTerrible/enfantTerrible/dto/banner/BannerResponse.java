package com.enfantTerrible.enfantTerrible.dto.banner;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BannerResponse {

  private Long bannerId;
  private String title;
  private String linkUrl;
  private Integer sortOrder;

  private String imageUrl;
}
