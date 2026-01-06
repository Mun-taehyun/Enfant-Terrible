package com.enfantTerrible.enfantTerrible.dto.admin.user;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUserPetResponse {

  private Long petId;

  private String name;
  private String species;
  private String breed;

  private Integer age;
  private String gender;
  private Boolean isNeutered;

  private Integer activityLevel;
  private Float weight;
}
