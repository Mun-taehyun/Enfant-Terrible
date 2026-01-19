package com.enfantTerrible.enfantTerrible.dto.order;

import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DirectOrderRequest {

  @NotNull
  private Long productId;

  // 옵션 없는 SKU면 null/empty 허용 (서비스에서 판단)
  private List<Long> optionValueIds;

  @NotNull
  @Min(1)
  private Integer quantity;

  @NotNull
  private String receiverName;

  @NotNull
  private String receiverPhone;

  @NotNull
  private String zipCode;

  @NotNull
  private String addressBase;

  private String addressDetail;
}
