package com.enfantTerrible.enfantTerrible.dto.order;

import com.enfantTerrible.enfantTerrible.common.validation.PhoneNumber;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderFromCartRequest {

  @NotBlank
  @Size(min = 2, max = 50)
  private String receiverName;

  @NotBlank
  @PhoneNumber
  private String receiverPhone;

  @NotBlank
  @Size(min = 5, max = 10)
  private String zipCode;

  @NotBlank
  @Size(min = 10, max = 200)
  private String addressBase;

  @Size(max = 200)
  private String addressDetail;
}
