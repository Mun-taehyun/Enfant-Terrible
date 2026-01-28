package com.enfantTerrible.enfantTerrible.event.listener;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.enfantTerrible.enfantTerrible.event.ProductViewedEvent;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ProductViewLogListener {

  private static final String LOG_DIR_NAME = "logs";
  private static final String CSV_HEADER = "timestamp,productId,userId,sessionId,clientIp,userAgent\n";
  private static final DateTimeFormatter TIME_FORMAT =
      DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
  private static final DateTimeFormatter DATE_FORMAT =
      DateTimeFormatter.ofPattern("yyyy-MM-dd");

  @Async
  @EventListener
  public void handle(ProductViewedEvent event) {

    String today = LocalDate.now().format(DATE_FORMAT);
    String fileName = String.format("product_view_%s.csv", today);
    Path logDir = getLogDirPath();
    Path logPath = logDir.resolve(fileName);

    ensureDirectory();

    String line = String.join(",",
        TIME_FORMAT.format(LocalDateTime.now()),
        String.valueOf(event.getProductId()),
        event.getUserId() != null ? event.getUserId().toString() : "",
        sanitize(event.getSessionId()),
        sanitize(event.getClientIp()),
        sanitize(event.getUserAgent())
    ) + "\n";

    append(logPath, line);
  }

  private void ensureDirectory() {
    try {
      Files.createDirectories(getLogDirPath());
    } catch (IOException e) {
      // TODO: 운영 로그로 남길 수 있음
    }
  }

  private Path getLogDirPath() {
    Path userDir = Path.of(System.getProperty("user.dir")).toAbsolutePath();
    Path parent = userDir.getParent();
    if (parent == null) {
      return userDir.resolve(LOG_DIR_NAME);
    }
    return parent.resolve(LOG_DIR_NAME);
  }

  private void append(Path path, String line) {
    try (FileWriter fw = new FileWriter(path.toFile(), true)) {
      if (needsHeader(path)) {
        fw.write(CSV_HEADER);
      }
      fw.write(line);
    } catch (IOException e) {
      // TODO: log.error("CSV log write failed", e);
    }
  }

  private boolean needsHeader(Path path) {
    try {
      if (!Files.exists(path)) {
        return true;
      }
      return Files.size(path) == 0;
    } catch (IOException e) {
      return false;
    }
  }

  private String sanitize(String value) {
    if (value == null) {
      return "";
    }
    return value.replace(",", " ").replace("\n", " ");
  }
}
