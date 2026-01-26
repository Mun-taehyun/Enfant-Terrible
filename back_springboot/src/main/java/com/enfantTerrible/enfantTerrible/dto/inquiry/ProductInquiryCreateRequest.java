package com.enfantTerrible.enfantTerrible.dto.inquiry;

 import java.util.List;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductInquiryCreateRequest {

  @NotBlank
  private String content;

  private Boolean isPrivate;

  private List<String> imageUrls;
}
