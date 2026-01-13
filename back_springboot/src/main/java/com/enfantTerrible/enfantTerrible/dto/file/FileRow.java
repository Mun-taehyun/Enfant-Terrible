package com.enfantTerrible.enfantTerrible.dto.file;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FileRow {

  private Long fileId;

  private String refType;
  private Long refId;

  private String fileRole;

  private String fileUrl;
  private String originalName;
  private String storedName;
  private String fileType;
  private String filePath;

  private LocalDateTime createdAt;
}
