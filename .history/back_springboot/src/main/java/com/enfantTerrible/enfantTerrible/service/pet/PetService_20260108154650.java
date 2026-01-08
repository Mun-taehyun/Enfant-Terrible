package com.enfantTerrible.enfantTerrible.service.pet;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.dto.pet.PetResponse;
import com.enfantTerrible.enfantTerrible.dto.pet.PetRow;
import com.enfantTerrible.enfantTerrible.dto.pet.PetSaveRequest;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.pet.PetMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PetService {

  private final PetMapper petMapper;

  public Long createPet(Long userId, PetSaveRequest req) {
    PetRow row = new PetRow();
    row.setUserId(userId);
    applyRequestToRow(row, req);

    petMapper.insert(row);
    return row.getPetId();
  }

  @Transactional(readOnly = true)
  public List<PetResponse> getMyPets(Long userId) {
    return petMapper.findByUserId(userId)
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
  }

  public void updatePet(Long userId, Long petId, PetSaveRequest req) {

    PetRow row = getPetOrThrow(petId);

    if (!row.getUserId().equals(userId)) {
      throw new BusinessException("수정 권한이 없습니다.");
    }

    applyRequestToRow(row, req);
    petMapper.update(row);
  }

  public void deletePet(Long userId, Long petId) {

    PetRow row = getPetOrThrow(petId);

    if (!row.getUserId().equals(userId)) {
      throw new BusinessException("삭제 권한이 없습니다.");
    }

    petMapper.softDelete(petId);
  }

  // =====================
  // private helpers
  // =====================

  private PetRow getPetOrThrow(Long petId) {
    PetRow row = petMapper.findById(petId);
    if (row == null) {
      throw new BusinessException("펫이 존재하지 않습니다.");
    }
    return row;
  }

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
