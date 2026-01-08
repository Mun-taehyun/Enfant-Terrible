package com.enfantTerrible.enfantTerrible.controller.pet;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.pet.PetResponse;
import com.enfantTerrible.enfantTerrible.dto.pet.PetSaveRequest;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;
import com.enfantTerrible.enfantTerrible.service.pet.PetService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/me/pets")
public class PetController {

  private final PetService petService;

  /**
   * 펫 등록
   */
  @PostMapping
  public ApiResponse<Long> createPet(
    @AuthenticationPrincipal CustomUserPrincipal principal,
    @Valid @RequestBody PetSaveRequest request
  ) {
    Long petId = petService.createPet(principal.getUserId(), request);
    return ApiResponse.success(petId, "펫 등록 완료");
  }

  /**
   * 내 펫 목록 조회
   */
  @GetMapping
  public ApiResponse<List<PetResponse>> getMyPets(
    @AuthenticationPrincipal CustomUserPrincipal principal
  ) {
    return ApiResponse.success(
      petService.getMyPets(principal.getUserId()),
      "내 펫 목록 조회 성공"
    );
  }

  /**
   * 펫 수정
   */
  @PutMapping("/{petId}")
  public ApiResponse<Void> updatePet(
    @AuthenticationPrincipal CustomUserPrincipal principal,
    @PathVariable Long petId,
    @Valid @RequestBody PetSaveRequest request
  ) {
    petService.updatePet(principal.getUserId(), petId, request);
    return ApiResponse.successMessage("펫 정보 수정 완료");
  }

  /**
   * 펫 삭제
   */
  @DeleteMapping("/{petId}")
  public ApiResponse<Void> deletePet(
    @AuthenticationPrincipal CustomUserPrincipal principal,
    @PathVariable Long petId
  ) {
    petService.deletePet(principal.getUserId(), petId);
    return ApiResponse.successMessage("펫 삭제 완료");
  }
}
