package com.enfantTerrible.enfantTerrible.event.listener;

import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.enfantTerrible.enfantTerrible.event.ProductViewedEvent;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ProductViewLogListener {

  private static final String LOG_PATH = "logs/product_view_log.csv";
  private static final DateTimeFormatter FORMATTER =
      DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

  private final HttpServletRequest request;

  @Async
  @EventListener
  public void handle(ProductViewedEvent event) {

    String line = String.join(",",
        FORMATTER.format(LocalDateTime.now()),
        String.valueOf(event.getProductId()),
        event.getUserId() != null ? event.getUserId().toString() : "",
        request.getSession().getId(),
        request.getRemoteAddr(),
        sanitize(request.getHeader("User-Agent"))
    ) + "\n";

    append(line);
  }

  private void append(String line) {
    try (FileWriter fw = new FileWriter(LOG_PATH, true)) {
      fw.write(line);
    } catch (IOException e) {
      // ❗ 로그 실패는 절대 서비스에 영향 주면 안 됨
      // TODO: log.error("Product view CSV log write failed", e);
    }
  }

  private String sanitize(String value) {
    if (value == null) {
      return "";
    }
    // CSV 깨짐 방지
    return value.replace(",", " ").replace("\n", " ");
  }
}
