package com.enfantTerrible.enfantTerrible.dto.admin.product;

import com.enfantTerrible.enfantTerrible.common.validation.PositivePrice;
import com.enfantTerrible.enfantTerrible.common.validation.ProductName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductSaveRequest {

  private Long productId;

  @NotBlank
  private String productCode;

  @NotNull
  private Long categoryId;

  @ProductName
  private String name;

  private String description;

  @PositivePrice
  private Long basePrice;

  @NotBlank
  private String status;

  // 파일 ID 목록 (이미 업로드된 파일 기준)
  private Long thumbnailFileId;
}
