package com.enfantTerrible.enfantTerrible.controller.admin.inquiry;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.inquiry.AdminProductInquiryAnswerRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.inquiry.AdminProductInquiryListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.inquiry.AdminProductInquiryListResponse;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;
import com.enfantTerrible.enfantTerrible.service.admin.inquiry.AdminProductInquiryService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/product-inquiries")
public class AdminProductInquiryController {

  private final AdminProductInquiryService adminProductInquiryService;

  @GetMapping
  public ApiResponse<AdminPageResponse<AdminProductInquiryListResponse>> list(
      AdminProductInquiryListRequest req
  ) {
    return ApiResponse.success(
        adminProductInquiryService.getInquiries(req),
        "관리자 상품 문의 목록 조회 성공"
    );
  }

  @PutMapping("/{inquiryId}/answer")
  public ApiResponse<Void> answer(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @PathVariable Long inquiryId,
      @RequestBody AdminProductInquiryAnswerRequest req
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    adminProductInquiryService.answer(principal.getUserId(), inquiryId, req);
    return ApiResponse.success(null, "문의 답변 등록 성공");
  }

  @DeleteMapping("/{inquiryId}/answer")
  public ApiResponse<Void> clearAnswer(
      @PathVariable Long inquiryId
  ) {
    adminProductInquiryService.clearAnswer(inquiryId);
    return ApiResponse.success(null, "문의 답변 삭제 성공");
  }

  @DeleteMapping("/{inquiryId}")
  public ApiResponse<Void> delete(
      @PathVariable Long inquiryId
  ) {
    adminProductInquiryService.delete(inquiryId);
    return ApiResponse.success(null, "문의 삭제 성공");
  }
}
