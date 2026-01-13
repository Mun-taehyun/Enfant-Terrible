package com.enfantTerrible.enfantTerrible.dto.admin.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductSaveRequest {

  @NotBlank
  private String productCode;

  @NotNull
  private Long categoryId;

  @NotBlank
  private String name;

  @NotNull
  private Long basePrice;

  @NotBlank
  private String status;

  // 파일 ID 목록 (이미 업로드된 파일 기준)
  private Long thumbnailFileId;
}
