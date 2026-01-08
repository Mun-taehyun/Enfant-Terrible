package com.enfantTerrible.enfantTerrible.common.response;

import lombok.Getter;

@Getter
public class ApiResponse<T> {

  private final boolean success;
  private final T data;
  private final String message;

  private ApiResponse(boolean success, T data, String message) {
    this.success = success;
    this.data = data;
    this.message = message;
  }

  // 성공 (데이터 있음)
  public static <T> ApiResponse<T> success(T data, String message) {
    return new ApiResponse<>(true, data, null);
  }

  // 성공 (메시지만)
  public static ApiResponse<Void> successMessage(String message) {
    return new ApiResponse<>(true, null, message);
  }

  // 실패
  public static ApiResponse<Void> error(String message) {
    return new ApiResponse<>(false, null, message);
  }
}
