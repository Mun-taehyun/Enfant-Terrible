package com.enfantTerrible.enfantTerrible.dto.file;

import java.time.LocalDateTime;

import com.enfantTerrible.enfantTerrible.common.enums.FileRefType;
import com.enfantTerrible.enfantTerrible.common.enums.FileRole;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FileRow {

  private Long fileId;

  private FileRefType refType;
  private Long refId;

  private FileRole fileRole;

  private String fileUrl;
  private String originalName;
  private String storedName;
  private String fileType;
  private Long fileSize;  // 파일 크기 (bytes)
  private String filePath;

  private LocalDateTime createdAt;
}
