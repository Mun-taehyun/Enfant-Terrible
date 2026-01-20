package com.enfantTerrible.enfantTerrible.common.response;

import lombok.Getter;

@Getter
public class ApiResponse<T> {

  private final boolean success;
  private final T data;
  private final String message;

  public ApiResponse(boolean success, T data, String message) {
    this.success = success;
    this.data = data;
    this.message = message;
  }

  public static <T> ApiResponse<T> success(T data) {
    return new ApiResponse<>(true, data, null);
  }

  public static ApiResponse<Void> error(String message) {
    return new ApiResponse<>(false, null, message);
  }
}
