package com.enfantTerrible.enfantTerrible.dto.order;

import java.util.List;

import com.enfantTerrible.enfantTerrible.common.validation.PhoneNumber;
import com.enfantTerrible.enfantTerrible.common.validation.PositiveQuantity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DirectOrderRequest {

  // 결제에서 사용한 merchant_uid(주문코드)를 주문 생성 시 그대로 사용하고 싶을 때 전달
  private String orderCode;

  @NotNull
  private Long productId;

  // 옵션 없는 SKU면 null/empty 허용 (서비스에서 판단)
  private List<Long> optionValueIds;

  @PositiveQuantity
  private Integer quantity;

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

  private Integer usedPoint;
}
