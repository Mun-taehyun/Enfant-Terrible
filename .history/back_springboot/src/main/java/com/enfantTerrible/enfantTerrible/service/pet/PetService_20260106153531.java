package com.enfantTerrible.enfantTerrible.service.pet;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.dto.pet.PetResponse;
import com.enfantTerrible.enfantTerrible.dto.pet.PetRow;
import com.enfantTerrible.enfantTerrible.dto.pet.PetSaveRequest;
import com.enfantTerrible.enfantTerrible.mapper.pet.PetMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PetService {

  private final PetMapper petMapper;

  /**
   * 펫 등록
   */
  public Long createPet(Long userId, PetSaveRequest req) {
    PetRow row = new PetRow();
    row.setUserId(userId);
    applyRequestToRow(row, req);

    petMapper.insert(row);   // useGeneratedKeys → petId 세팅
    return row.getPetId();
  }

  /**
   * 내 펫 목록 조회
   */
  @Transactional(readOnly = true)
  public List<PetResponse> getMyPets(Long userId) {
    List<PetRow> rows = petMapper.findByUserId(userId);
    return rows.stream()
               .map(this::toResponse)
               .collect(Collectors.toList());
  }

  /**
   * 펫 수정
   */
  public void updatePet(Long userId, Long petId, PetSaveRequest req) {
    PetRow row = petMapper.findById(petId);
    if (row == null) {
      throw new IllegalArgumentException("펫이 존재하지 않습니다.");
    }
    if (!row.getUserId().equals(userId)) {
      throw new IllegalStateException("수정 권한이 없습니다.");
    }

    applyRequestToRow(row, req);
    petMapper.update(row);
  }

  /**
   * 펫 삭제 (소프트 삭제)
   */
  public void deletePet(Long userId, Long petId) {
    PetRow row = petMapper.findById(petId);
    if (row == null) {
      throw new IllegalArgumentException("펫이 존재하지 않습니다.");
    }
    if (!row.getUserId().equals(userId)) {
      throw new IllegalStateException("삭제 권한이 없습니다.");
    }

    petMapper.softDelete(petId);
  }

  // ==================================================
  // 내부 변환 메서드
  // ==================================================

  /**
   * Request → Row 매핑
   * - 시간 컬럼 관여 ❌
   */
  private void applyRequestToRow(PetRow row, PetSaveRequest req) {
    row.setName(req.getName());
    row.setSpecies(req.getSpecies());
    row.setBreed(req.getBreed());
    row.setAge(req.getAge());
    row.setGender(req.getGender());
    row.setIsNeutered(req.getIsNeutered() == null ? null : (req.getIsNeutered() ? 1 : 0));
    row.setActivityLevel(req.getActivityLevel());
    row.setWeight(req.getWeight());
  }

  /**
   * Row → Response 변환
   */
  private PetResponse toResponse(PetRow row) {
    PetResponse res = new PetResponse();
    res.setPetId(row.getPetId());
    res.setName(row.getName());
    res.setSpecies(row.getSpecies());
    res.setBreed(row.getBreed());
    res.setAge(row.getAge());
    res.setGender(row.getGender());
    res.setIsNeutered(row.getIsNeutered() == null ? null : row.getIsNeutered() == 1);
    res.setActivityLevel(row.getActivityLevel());
    res.setWeight(row.getWeight());
    return res;
  }
}
