package com.enfantTerrible.enfantTerrible.dto.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
  private Long userId;
  private String email;
  private String name;
  private String tel;
  private String zipCode;
  private String addressBase;
  private String addressDetail;
  private String role;
  private String status;
}

