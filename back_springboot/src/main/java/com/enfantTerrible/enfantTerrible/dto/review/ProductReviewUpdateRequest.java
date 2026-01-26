package com.enfantTerrible.enfantTerrible.dto.review;

 import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductReviewUpdateRequest {

  @NotNull
  @Min(1)
  @Max(5)
  private Integer rating;

  private String content;

  private List<String> imageUrls;
}
