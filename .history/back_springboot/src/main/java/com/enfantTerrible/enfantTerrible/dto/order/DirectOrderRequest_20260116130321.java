package com.enfantTerrible.enfantTerrible.dto.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DirectOrderRequest {

  @NotNull
  private Long skuId;

  @Min(1)
  private Integer quantity;

  private String receiverName;
  private String receiverPhone;
  private String zipCode;
  private String addressBase;
  private String addressDetail;
}
