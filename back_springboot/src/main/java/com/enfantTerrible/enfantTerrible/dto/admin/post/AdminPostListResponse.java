package com.enfantTerrible.enfantTerrible.dto.admin.post;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPostListResponse {

  private Long postId;
  private Long userId;
  private String userEmail;
  private String postType;

  private String title;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
