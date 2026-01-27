package com.enfantTerrible.enfantTerrible.dto.admin.discount;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductDiscountSaveRequest {

  @NotNull
  private Long productId;

  @NotNull
  private Integer discountValue;

  @NotBlank
  private String discountType;

  private LocalDateTime startAt;
  private LocalDateTime endAt;
}
