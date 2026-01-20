package com.enfantTerrible.enfantTerrible.dto.admin.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUserStatusUpdateRequest {

  @NotBlank
  private String status; // ACTIVE / SUSPENDED / DELETED 등
}
