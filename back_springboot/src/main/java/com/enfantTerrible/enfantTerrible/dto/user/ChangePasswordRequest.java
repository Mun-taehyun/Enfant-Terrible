package com.enfantTerrible.enfantTerrible.dto.user;

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
public class ChangePasswordRequest {
  private String currentPassword;
  @NotBlank
  @Size(min = 8, max = 20)
  private String newPassword;
}
