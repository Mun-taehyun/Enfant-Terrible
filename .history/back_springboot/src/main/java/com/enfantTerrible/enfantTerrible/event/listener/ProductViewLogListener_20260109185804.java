package com.enfantTerrible.enfantTerrible.event.listener;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
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

  private static final String LOG_DIR = "logs";
  private static final DateTimeFormatter TIME_FORMAT =
      DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
  private static final DateTimeFormatter DATE_FORMAT =
      DateTimeFormatter.ofPattern("yyyy-MM-dd");

  private final HttpServletRequest request;

  @Async
  @EventListener
  public void handle(ProductViewedEvent event) {

    String today = LocalDate.now().format(DATE_FORMAT);
    String fileName = String.format("product_view_%s.csv", today);
    Path logPath = Path.of(LOG_DIR, fileName);

    ensureDirectory();

    String line = String.join(",",
        TIME_FORMAT.format(LocalDateTime.now()),
        String.valueOf(event.getProductId()),
        event.getUserId() != null ? event.getUserId().toString() : "",
        request.getSession().getId(),
        getClientIp(request),
        sanitize(request.getHeader("User-Agent"))
    ) + "\n";

    append(logPath, line);
  }

  private void ensureDirectory() {
    try {
      Files.createDirectories(Path.of(LOG_DIR));
    } catch (IOException e) {
      // TODO: 운영 로그로 남길 수 있음
    }
  }

  private void append(Path path, String line) {
    try (FileWriter fw = new FileWriter(path.toFile(), true)) {
      fw.write(line);
    } catch (IOException e) {
      // TODO: log.error("CSV log write failed", e);
    }
  }

  private String sanitize(String value) {
    if (value == null) {
      return "";
    }
    return value.replace(",", " ").replace("\n", " ");
  }

  private String getClientIp(HttpServletRequest request) {
    String forwarded = request.getHeader("X-Forwarded-For");
    if (forwarded != null && !forwarded.isBlank()) {
      return forwarded.split(",")[0];
    }
    return request.getRemoteAddr();
  }
}
