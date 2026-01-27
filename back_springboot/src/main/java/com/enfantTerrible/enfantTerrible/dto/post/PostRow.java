package com.enfantTerrible.enfantTerrible.dto.post;

import java.time.LocalDateTime;

import com.enfantTerrible.enfantTerrible.common.enums.PostType;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostRow {

  private Long postId;
  private Long userId;

  private PostType postType;
  private String refType;
  private Long refId;

  private String title;
  private String content;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private LocalDateTime deletedAt;
}
