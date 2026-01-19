package com.enfantTerrible.enfantTerrible.dto.admin.product;

import java.util.List;

import com.enfantTerrible.enfantTerrible.common.validation.NonNegativeStock;
import com.enfantTerrible.enfantTerrible.common.validation.PositivePrice;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminSkuSaveRequest {

  @NotNull
  private Long productId;

  @PositivePrice
  private Long price;

  @NonNegativeStock
  private Long stock;

  @NotBlank
  private String status;
  
  // ⭐ 옵션 매핑용 (없어도 OK)
  private List<Long> optionValueIds;
}
