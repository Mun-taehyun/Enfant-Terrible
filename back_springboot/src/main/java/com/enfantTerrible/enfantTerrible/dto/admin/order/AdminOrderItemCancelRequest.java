package com.enfantTerrible.enfantTerrible.dto.admin.order;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminOrderItemCancelRequest {

  @NotEmpty
  private List<@Valid AdminOrderItemCancelSkuRequest> items;

  private String reason;
}
