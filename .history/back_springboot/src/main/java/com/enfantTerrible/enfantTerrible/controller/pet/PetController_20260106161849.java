package com.enfantTerrible.enfantTerrible.controller.pet;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.enfantTerrible.enfantTerrible.dto.pet.PetResponse;
import com.enfantTerrible.enfantTerrible.dto.pet.PetSaveRequest;
import com.enfantTerrible.enfantTerrible.service.pet.PetService;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;

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
  public ResponseEntity<Void> createPet(
    @AuthenticationPrincipal CustomUserPrincipal principal,
    @RequestBody @Valid PetSaveRequest request
  ) {
    petService.createPet(principal.getUserId(), request);
    return ResponseEntity.ok().build();
  }

  /**
   * 내 펫 목록 조회
   */
  @GetMapping
  public ResponseEntity<List<PetResponse>> getMyPets(
    @AuthenticationPrincipal CustomUserPrincipal principal
  ) {
    return ResponseEntity.ok(
      petService.getMyPets(principal.getUserId())
    );
  }

  /**
   * 펫 수정
   */
  @PutMapping("/{petId}")
  public ResponseEntity<Void> updatePet(
    @AuthenticationPrincipal CustomUserPrincipal principal,
    @PathVariable Long petId,
    @RequestBody @Valid PetSaveRequest request
  ) {
    petService.updatePet(principal.getUserId(), petId, request);
    return ResponseEntity.ok().build();
  }

  /**
   * 펫 삭제 (소프트 삭제)
   */
  @DeleteMapping("/{petId}")
  public ResponseEntity<Void> deletePet(
    @AuthenticationPrincipal CustomUserPrincipal principal,
    @PathVariable Long petId
  ) {
    petService.deletePet(principal.getUserId(), petId);
    return ResponseEntity.ok().build();
  }
}
