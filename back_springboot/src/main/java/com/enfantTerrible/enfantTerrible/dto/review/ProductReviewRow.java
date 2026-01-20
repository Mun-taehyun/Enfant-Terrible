package com.enfantTerrible.enfantTerrible.dto.review;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductReviewRow {

  private Long reviewId;
  private Long userId;
  private Long productId;
  private Long orderId;

  private Integer rating;
  private String content;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private LocalDateTime deletedAt;
}
