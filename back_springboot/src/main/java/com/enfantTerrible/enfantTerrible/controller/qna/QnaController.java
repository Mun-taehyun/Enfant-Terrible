package com.enfantTerrible.enfantTerrible.controller.qna;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.qna.QnaMessageResponse;
import com.enfantTerrible.enfantTerrible.dto.qna.QnaRoomResponse;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;
import com.enfantTerrible.enfantTerrible.service.qna.QnaQueryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/qna")
public class QnaController {

  private final QnaQueryService qnaQueryService;

  @GetMapping("/room")
  public ApiResponse<QnaRoomResponse> myRoom(
      @AuthenticationPrincipal CustomUserPrincipal principal
  ) {
    return ApiResponse.success(
        qnaQueryService.getOrCreateMyRoom(principal.getUserId()),
        "QnA 방 조회 성공"
    );
  }

  @GetMapping("/messages")
  public ApiResponse<List<QnaMessageResponse>> messages(
      @AuthenticationPrincipal CustomUserPrincipal principal,
      @RequestParam Long roomId,
      @RequestParam(required = false, defaultValue = "30") int limit
  ) {
    return ApiResponse.success(
        qnaQueryService.getRecentMessagesForUser(principal.getUserId(), roomId, limit),
        "QnA 메시지 조회 성공"
    );
  }
}
