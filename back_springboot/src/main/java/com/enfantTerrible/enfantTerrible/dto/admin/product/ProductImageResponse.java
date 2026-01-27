package com.enfantTerrible.enfantTerrible.dto.admin.product;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductImageResponse {

  private Long fileId;
  private String fileUrl;
  private String originalName;
  private Integer sortOrder;
}
