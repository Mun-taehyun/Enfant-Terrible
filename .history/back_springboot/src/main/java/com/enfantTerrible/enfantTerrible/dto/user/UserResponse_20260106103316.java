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

  public static UserResponse from(UserRow row) {
    UserResponse res = new UserResponse();
    res.userId = row.getUserId();
    res.email = row.getEmail();
    res.name = row.getName();
    res.tel = row.getTel();
    res.zipCode = row.getZipCode();
    res.addressBase = row.getAddressBase();
    res.addressDetail = row.getAddressDetail();
    res.role = row.getRole();
    res.status = row.getStatus();
    return res;
  }
}

