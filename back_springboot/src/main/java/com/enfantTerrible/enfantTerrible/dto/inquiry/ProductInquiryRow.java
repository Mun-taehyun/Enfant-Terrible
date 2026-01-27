package com.enfantTerrible.enfantTerrible.dto.inquiry;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductInquiryRow {

  private Long inquiryId;
  private Long productId;
  private Long userId;
  private String userEmail;

  private String content;
  private Boolean isPrivate;
  private String status;

  private String answerContent;
  private Long answeredByUserId;
  private LocalDateTime answeredAt;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private LocalDateTime deletedAt;
}
