package com.enfantTerrible.enfantTerrible.dto.pet;

import com.enfantTerrible.enfantTerrible.common.enums.PetGender;
import com.enfantTerrible.enfantTerrible.common.enums.PetSpecies;

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
  private PetSpecies species;
  private String breed;

  private Integer age;
  private PetGender gender;
  private Boolean isNeutered;

  private Integer activityLevel;
  private Float weight;
}
