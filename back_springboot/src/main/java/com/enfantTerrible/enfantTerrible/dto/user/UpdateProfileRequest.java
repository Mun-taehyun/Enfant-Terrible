package com.enfantTerrible.enfantTerrible.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
  @NotBlank
  private String name;
  @NotBlank
  private String tel;
  @NotBlank
  private String zipCode;
  @NotBlank
  private String addressBase;
  private String addressDetail;
}