package com.enfantTerrible.enfantTerrible.dto.qna;

 import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QnaSendRequest {

  private Long roomId;

  private String message;

  private List<String> imageUrls;
}
