package com.enfantTerrible.enfantTerrible.mapper.pet;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.pet.PetRow;

@Mapper
public interface PetMapper {

  /**
   * 펫 등록
   */
  int insert(PetRow row);

  /**
   * 내 펫 목록 조회
   */
  List<PetRow> findByUserId(@Param("userId") Long userId);

  /**
   * 펫 단건 조회
   */
  PetRow findById(@Param("petId") Long petId);

  /**
   * 펫 정보 수정
   */
  int update(PetRow row);

  /**
   * 펫 소프트 삭제
   */
  int softDelete(@Param("petId") Long petId);
}
