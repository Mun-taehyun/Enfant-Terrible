package com.enfantTerrible.enfantTerrible.dto.admin.inquiry;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductInquiryListResponse {

  private Long inquiryId;
  private Long productId;
  private String productName;
  private Long userId;
  private String userEmail;

  private String content;
  private Boolean isPrivate;
  private String status;

  private String answerContent;
  private Long answeredByUserId;
  private LocalDateTime answeredAt;

  private LocalDateTime createdAt;
}
