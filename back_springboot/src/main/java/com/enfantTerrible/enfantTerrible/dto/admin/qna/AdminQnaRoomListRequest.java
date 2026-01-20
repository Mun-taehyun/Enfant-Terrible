package com.enfantTerrible.enfantTerrible.dto.admin.qna;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminQnaRoomListRequest {

  private int page = 1;
  private int size = 20;

  private Long userId;

  public int getOffset() {
    return (page - 1) * size;
  }
}
