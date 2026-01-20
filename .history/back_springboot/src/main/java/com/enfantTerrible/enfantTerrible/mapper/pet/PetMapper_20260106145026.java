package com.enfantTerrible.enfantTerrible.mapper.pet;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.pet.PetResponse;
import com.enfantTerrible.enfantTerrible.dto.pet.PetSaveRequest;

@Mapper
public interface PetMapper {

  void insertPet(
    @Param("userId") Long userId,
    @Param("req") PetSaveRequest req
  );

  List<PetResponse> findByUserId(@Param("userId") Long userId);

  PetResponse findById(@Param("petId") Long petId);

  int updatePet(
    @Param("petId") Long petId,
    @Param("req") PetSaveRequest req
  );

  int softDelete(@Param("petId") Long petId);
}
