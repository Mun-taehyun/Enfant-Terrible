package com.enfantTerrible.enfantTerrible.dto.user;

import com.enfantTerrible.enfantTerrible.common.validation.Password;
import com.enfantTerrible.enfantTerrible.common.validation.PhoneNumber;
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
  @Password
  private String password;
  
  @NotBlank
  @Size(min = 2, max = 50)
  private String name;
  
  @NotBlank
  @PhoneNumber
  private String tel;
  
  @NotBlank
  private String zipCode;
  
  @NotBlank
  private String addressBase;
  
  private String addressDetail;
}
