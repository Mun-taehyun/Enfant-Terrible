package com.enfantTerrible.enfantTerrible.dto.popup;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PopupResponse {

  private Long popupId;
  private String title;
  private String content;
  private String linkUrl;

  private String position;
  private Integer width;
  private Integer height;

  private String imageUrl;
}
