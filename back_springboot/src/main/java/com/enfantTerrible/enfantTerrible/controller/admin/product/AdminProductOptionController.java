package com.enfantTerrible.enfantTerrible.controller.admin.product;

import org.springframework.web.bind.annotation.*;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.product.*;
import com.enfantTerrible.enfantTerrible.service.admin.product.AdminProductOptionService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/products/options")
public class AdminProductOptionController {

  private final AdminProductOptionService optionService;

  /* =======================
     Option Group
     ======================= */

  @GetMapping("/groups")
  public ApiResponse<?> groups(@RequestParam Long productId) {
    return ApiResponse.success(
        optionService.getGroups(productId),
        "옵션 그룹 조회 성공"
    );
  }

  @PostMapping("/groups")
  public ApiResponse<Void> createGroup(
      @RequestBody AdminProductOptionGroupSaveRequest req
  ) {
    optionService.createGroup(req);
    return ApiResponse.successMessage("옵션 그룹 생성 성공");
  }

  @PutMapping("/groups/{groupId}")
  public ApiResponse<Void> updateGroup(
      @PathVariable Long groupId,
      @RequestBody AdminProductOptionGroupSaveRequest req
  ) {
    optionService.updateGroup(groupId, req);
    return ApiResponse.successMessage("옵션 그룹 수정 성공");
  }

  @PutMapping("/groups/reorder")
  public ApiResponse<Void> reorderGroups(
      @RequestBody AdminProductOptionGroupReorderRequest req
  ) {
    optionService.reorderGroups(req);
    return ApiResponse.successMessage("옵션 그룹 정렬 변경 성공");
  }

  @DeleteMapping("/groups/{groupId}")
  public ApiResponse<Void> deleteGroup(
      @PathVariable Long groupId
  ) {
    optionService.deleteGroup(groupId);
    return ApiResponse.successMessage("옵션 그룹 삭제 성공");
  }

  /* =======================
     Option Value
     ======================= */

  @GetMapping("/values")
  public ApiResponse<?> values(@RequestParam Long groupId) {
    return ApiResponse.success(
        optionService.getValues(groupId),
        "옵션 값 조회 성공"
    );
  }

  @GetMapping("/values/by-product")
  public ApiResponse<?> valuesByProduct(@RequestParam Long productId) {
    return ApiResponse.success(
        optionService.getValuesByProductId(productId),
        "옵션 값 조회 성공"
    );
  }

  @PostMapping("/values")
  public ApiResponse<Void> createValue(
      @RequestBody AdminProductOptionValueSaveRequest req
  ) {
    optionService.createValue(req);
    return ApiResponse.successMessage("옵션 값 생성 성공");
  }

  @PutMapping("/values/{valueId}")
  public ApiResponse<Void> updateValue(
      @PathVariable Long valueId,
      @RequestBody AdminProductOptionValueSaveRequest req
  ) {
    optionService.updateValue(valueId, req);
    return ApiResponse.successMessage("옵션 값 수정 성공");
  }

  @PutMapping("/values/reorder")
  public ApiResponse<Void> reorderValues(
      @RequestBody AdminProductOptionValueReorderRequest req
  ) {
    optionService.reorderValues(req);
    return ApiResponse.successMessage("옵션 값 정렬 변경 성공");
  }

  @DeleteMapping("/values/{valueId}")
  public ApiResponse<Void> deleteValue(
      @PathVariable Long valueId
  ) {
    optionService.deleteValue(valueId);
    return ApiResponse.successMessage("옵션 값 삭제 성공");
  }
}
