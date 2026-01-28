package com.enfantTerrible.enfantTerrible.dto.post;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostListRequest {

  private Integer page;
  private Integer size;

  private String postType;
}
