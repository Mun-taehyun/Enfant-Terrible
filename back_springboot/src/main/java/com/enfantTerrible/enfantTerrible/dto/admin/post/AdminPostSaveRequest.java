package com.enfantTerrible.enfantTerrible.dto.admin.post;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPostSaveRequest {

  @NotBlank
  private String postType;

  private String refType;
  private Long refId;

  @NotBlank
  private String title;

  @NotBlank
  private String content;
}
