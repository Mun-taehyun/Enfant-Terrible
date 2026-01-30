package com.enfantTerrible.enfantTerrible.dto.admin.inquiry;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductInquiryListRequest {

  private String productName;
  private String userEmail;
  private String status;

  private Integer page = 1;
  private Integer size = 20;

  public int getOffset() {
    int p = page == null || page < 1 ? 1 : page;
    int s = size == null || size < 1 ? 20 : size;
    if (s > 200) s = 200;
    return (p - 1) * s;
  }
}
