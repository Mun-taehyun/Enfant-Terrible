package com.enfantTerrible.enfantTerrible.controller.admin.post;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.post.AdminPostDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.post.AdminPostListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.post.AdminPostListResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.post.AdminPostSaveRequest;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;
import com.enfantTerrible.enfantTerrible.service.admin.post.AdminPostService;
import com.enfantTerrible.enfantTerrible.service.file.LocalFileStorageService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/posts")
public class AdminPostController {

  private final AdminPostService adminPostService;
  private final LocalFileStorageService localFileStorageService;

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

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<Long> create(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @Valid @RequestPart("req") AdminPostSaveRequest req,
      @RequestPart(value = "files", required = false) List<MultipartFile> files
  ) {
    if (principal == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    if (files != null && !files.isEmpty()) {
      List<String> fileUrls = files.stream()
          .filter(f -> f != null && !f.isEmpty())
          .map(f -> localFileStorageService.save(f, "posts"))
          .toList();
      req.setFileUrls(fileUrls);
    }

    return ApiResponse.success(
        adminPostService.create(principal.getUserId(), req),
        "게시글 생성 성공"
    );
  }

  @PutMapping(value = "/{postId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<Void> update(
      @PathVariable Long postId,
      @Valid @RequestPart("req") AdminPostSaveRequest req,
      @RequestPart(value = "files", required = false) List<MultipartFile> files
  ) {
    if (files != null) {
      List<String> fileUrls = files.stream()
          .filter(f -> f != null && !f.isEmpty())
          .map(f -> localFileStorageService.save(f, "posts"))
          .toList();
      req.setFileUrls(fileUrls);
    }

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
