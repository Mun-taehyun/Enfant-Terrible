package com.enfantTerrible.enfantTerrible.exception;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  /**
   * OAuth2 / Security / Static Resource 요청인지 판단
   */
  private boolean isSecurityOrStaticRequest(HttpServletRequest request) {
    String uri = request.getRequestURI();

    return uri.startsWith("/oauth2/")
        || uri.startsWith("/login/oauth2/")
        || uri.startsWith("/login/oauth2/code/")
        || uri.startsWith("/favicon.ico")
        || uri.startsWith("/static/")
        || uri.startsWith("/css/")
        || uri.startsWith("/js/")
        || uri.startsWith("/images/")
        || uri.startsWith("/webjars/")
        || uri.startsWith("/.well-known/");
  }

  /**
   * 비즈니스 예외 처리
   */
  @ExceptionHandler(BusinessException.class)
  public ResponseEntity<ApiResponse<Void>> handleBusinessException(
      BusinessException e,
      HttpServletRequest request
  ) throws Exception {

    // OAuth2 / 정적 요청이면 Security에게 다시 던짐
    if (isSecurityOrStaticRequest(request)) {
      throw e;
    }

    return ResponseEntity
        .status(HttpStatus.BAD_REQUEST)
        .body(ApiResponse.error(e.getMessage()));
  }

  /**
   * Validation 예외 (@Valid)
   */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiResponse<Void>> handleValidationException(
      MethodArgumentNotValidException e,
      HttpServletRequest request
  ) throws Exception {

    if (isSecurityOrStaticRequest(request)) {
      throw e;
    }

    String message = e.getBindingResult()
        .getFieldErrors()
        .stream()
        .map(err -> err.getField() + ": " + err.getDefaultMessage())
        .findFirst()
        .orElse("유효성 검사 오류");

    return ResponseEntity
        .status(HttpStatus.BAD_REQUEST)
        .body(ApiResponse.error(message));
  }

  /**
   * 그 외 모든 예외
   */
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<Void>> handleException(
      Exception e,
      HttpServletRequest request
  ) throws Exception {

    // OAuth2 / 정적 리소스 요청은 Spring Security 흐름 유지
    if (isSecurityOrStaticRequest(request)) {
      throw e;
    }

    // TODO: log.error("Unhandled exception", e);

    return ResponseEntity
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ApiResponse.error("서버 오류가 발생했습니다."));
  }
}
