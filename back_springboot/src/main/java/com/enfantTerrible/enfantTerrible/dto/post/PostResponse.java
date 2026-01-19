package com.enfantTerrible.enfantTerrible.dto.post;

import java.time.LocalDateTime;

import com.enfantTerrible.enfantTerrible.common.enums.PostType;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostResponse {

  private Long postId;
  private PostType postType;

  private String title;
  private String content;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
