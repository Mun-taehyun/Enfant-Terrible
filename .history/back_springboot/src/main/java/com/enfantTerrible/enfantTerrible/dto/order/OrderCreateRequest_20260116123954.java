package com.enfantTerrible.enfantTerrible.dto.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderCreateRequest {

  @NotBlank
  private String receiverName;

  @NotBlank
  private String receiverPhone;

  @NotBlank
  private String zipCode;

  @NotBlank
  private String addressBase;

  private String addressDetail;
}
