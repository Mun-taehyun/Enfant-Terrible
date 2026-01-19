package com.enfantTerrible.enfantTerrible.dto.admin.post;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPostDetailResponse {

  private Long postId;
  private Long userId;

  private String postType;
  private String refType;
  private Long refId;

  private String title;
  private String content;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private LocalDateTime deletedAt;
}
