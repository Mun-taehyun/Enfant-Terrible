package com.enfantTerrible.enfantTerrible.dto.pet;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PetRow {

  private Long petId;
  private Long userId;

  private String name;
  private String species;
  private String breed;

  private Integer age;
  private String gender;
  private Integer isNeutered; 

  private Integer activityLevel;
  private Float weight;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private LocalDateTime deletedAt;
}
