package com.enfantTerrible.enfantTerrible.dto.admin.inquiry;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductInquiryAnswerRequest {

  @NotBlank
  private String answerContent;
}
