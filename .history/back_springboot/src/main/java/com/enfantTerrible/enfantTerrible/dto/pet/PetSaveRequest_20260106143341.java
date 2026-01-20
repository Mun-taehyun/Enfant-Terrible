package com.enfantTerrible.enfantTerrible.dto.pet;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PetSaveRequest {

  // 반려동물 이름
  private String name;

  // 반려동물 종류 (개, 고양이, 햄스터 등)
  private String species;

  // 품종 (선택)
  private String breed;

  // 나이 (년 단위)
  @Min(0)
  private Integer age;

  // 성별 (M / F / 기타)
  private String gender;

  // 중성화 여부 (0/1 → false/true)
  private Boolean isNeutered;

  // 활동성 레벨 (1:실내, 2:중간, 3:야외)
  @Min(1)
  private Integer activityLevel;

  // 체중 (kg, 소수점 가능)
  @Min(0)
  private Float weight;
}
