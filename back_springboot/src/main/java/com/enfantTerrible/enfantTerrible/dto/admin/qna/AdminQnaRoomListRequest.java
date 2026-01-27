package com.enfantTerrible.enfantTerrible.dto.admin.qna;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminQnaRoomListRequest {

  private int page = 1;
  private int size = 20;

  private Long userId;

  // 정렬 기준 (LAST_MESSAGE_AT / CREATED_AT / ROOM_ID)
  private String sortBy;

  // 정렬 방향 (ASC / DESC)
  private String direction;

  public int getOffset() {
    return (page - 1) * size;
  }
}
