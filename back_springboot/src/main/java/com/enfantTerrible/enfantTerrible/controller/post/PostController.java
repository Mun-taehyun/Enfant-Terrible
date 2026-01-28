package com.enfantTerrible.enfantTerrible.controller.post;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.post.PostResponse;
import com.enfantTerrible.enfantTerrible.service.post.PostQueryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts")
public class PostController {

  private final PostQueryService postQueryService;

  @GetMapping
  public ApiResponse<List<PostResponse>> list(
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size,
      @RequestParam(required = false) String postType
  ) {
    return ApiResponse.success(
        postQueryService.getPosts(page, size, postType),
        "게시글 목록 조회 성공"
    );
  }

  @GetMapping("/{postId}")
  public ApiResponse<PostResponse> detail(
      @PathVariable Long postId
  ) {
    return ApiResponse.success(
        postQueryService.getPost(postId),
        "게시글 상세 조회 성공"
    );
  }
}
