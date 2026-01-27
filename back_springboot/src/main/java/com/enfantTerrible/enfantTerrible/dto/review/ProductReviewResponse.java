package com.enfantTerrible.enfantTerrible.dto.review;

import java.time.LocalDateTime;
 import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductReviewResponse {

  private Long reviewId;
  private Long userId;
  private Long productId;
  private Long orderId;

  private Integer rating;
  private String content;

  private List<String> imageUrls;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
