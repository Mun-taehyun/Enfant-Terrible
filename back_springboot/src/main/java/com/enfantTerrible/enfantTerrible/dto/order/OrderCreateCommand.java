package com.enfantTerrible.enfantTerrible.dto.order;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderCreateCommand {

  private Long userId;
  private List<OrderItemCommand> items;

  private String receiverName;
  private String receiverPhone;
  private String zipCode;
  private String addressBase;
  private String addressDetail;
}
