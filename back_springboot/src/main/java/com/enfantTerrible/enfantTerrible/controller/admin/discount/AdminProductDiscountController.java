package com.enfantTerrible.enfantTerrible.controller.admin.discount;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.discount.AdminProductDiscountResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.discount.AdminProductDiscountSaveRequest;
import com.enfantTerrible.enfantTerrible.service.admin.discount.AdminProductDiscountService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/product-discounts")
public class AdminProductDiscountController {

  private final AdminProductDiscountService adminProductDiscountService;

  @GetMapping
  public ApiResponse<List<AdminProductDiscountResponse>> list(
      @RequestParam Long productId
  ) {
    return ApiResponse.success(
        adminProductDiscountService.listByProductId(productId),
        "상품 할인 목록 조회 성공"
    );
  }

  @PostMapping
  public ApiResponse<Long> create(
      @RequestBody AdminProductDiscountSaveRequest req
  ) {
    return ApiResponse.success(
        adminProductDiscountService.create(req),
        "상품 할인 등록 성공"
    );
  }

  @PutMapping("/{discountId}")
  public ApiResponse<Void> update(
      @PathVariable Long discountId,
      @RequestBody AdminProductDiscountSaveRequest req
  ) {
    adminProductDiscountService.update(discountId, req);
    return ApiResponse.successMessage("상품 할인 수정 성공");
  }

  @DeleteMapping("/{discountId}")
  public ApiResponse<Void> delete(
      @PathVariable Long discountId
  ) {
    adminProductDiscountService.delete(discountId);
    return ApiResponse.successMessage("상품 할인 삭제 성공");
  }
}
