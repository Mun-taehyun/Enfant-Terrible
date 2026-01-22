package com.enfantTerrible.enfantTerrible.dto.admin.qna;

import java.util.List;

import com.enfantTerrible.enfantTerrible.dto.qna.QnaMessageResponse;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminQnaMessagesResponse {

  private Long roomId;
  private Long userId;
  private String userEmail;
  private List<QnaMessageResponse> messages;
}
