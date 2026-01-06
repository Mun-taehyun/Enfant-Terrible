package com.enfantTerrible.enfantTerrible.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {
  @NotBlank
  @Email
  private String email;
  @NotBlank
  @Size(min = 8, max = 20)
  private String password;
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
