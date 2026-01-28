package com.enfantTerrible.enfantTerrible.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompleteProfileRequest {

  @NotBlank
  private String tel;

  @NotBlank
  private String zipCode;

  @NotBlank
  private String addressBase;

  private String addressDetail;
}
