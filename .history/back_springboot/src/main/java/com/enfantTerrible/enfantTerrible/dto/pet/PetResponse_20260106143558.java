package com.enfantTerrible.enfantTerrible.dto.pet;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PetResponse {

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
