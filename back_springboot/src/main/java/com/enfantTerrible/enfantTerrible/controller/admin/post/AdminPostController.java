package com.enfantTerrible.enfantTerrible.controller.admin.post;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.post.AdminPostDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.post.AdminPostListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.post.AdminPostListResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.post.AdminPostSaveRequest;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;
import com.enfantTerrible.enfantTerrible.service.admin.post.AdminPostService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/posts")
public class AdminPostController {

  private final AdminPostService adminPostService;

  @GetMapping
  public ApiResponse<AdminPageResponse<AdminPostListResponse>> list(
      AdminPostListRequest req
  ) {
    return ApiResponse.success(
        adminPostService.getPosts(req),
        "관리자 게시글 목록 조회 성공"
    );
  }

  @GetMapping("/{postId}")
  public ApiResponse<AdminPostDetailResponse> detail(
      @PathVariable Long postId
  ) {
    return ApiResponse.success(
        adminPostService.getPost(postId),
        "관리자 게시글 상세 조회 성공"
    );
  }

  @PostMapping
  public ApiResponse<Long> create(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @Valid @RequestBody AdminPostSaveRequest req
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    return ApiResponse.success(
        adminPostService.create(principal.getUserId(), req),
        "게시글 생성 성공"
    );
  }

  @PutMapping("/{postId}")
  public ApiResponse<Void> update(
      @PathVariable Long postId,
      @Valid @RequestBody AdminPostSaveRequest req
  ) {
    adminPostService.update(postId, req);
    return ApiResponse.successMessage("게시글 수정 성공");
  }

  @DeleteMapping("/{postId}")
  public ApiResponse<Void> delete(
      @PathVariable Long postId
  ) {
    adminPostService.delete(postId);
    return ApiResponse.successMessage("게시글 삭제 성공");
  }
}
