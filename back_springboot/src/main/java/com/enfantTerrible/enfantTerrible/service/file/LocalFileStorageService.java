package com.enfantTerrible.enfantTerrible.service.file;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.enfantTerrible.enfantTerrible.exception.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LocalFileStorageService {

  @Value("${file.upload-dir}")
  private String uploadDir;

  public String save(MultipartFile file, String subDir) {
    if (file == null || file.isEmpty()) {
      throw new BusinessException("파일이 비어있습니다.");
    }

    String originalName = file.getOriginalFilename();
    String ext = "";
    if (originalName != null) {
      int dot = originalName.lastIndexOf('.');
      if (dot >= 0 && dot < originalName.length() - 1) {
        ext = originalName.substring(dot);
      }
    }

    String day = LocalDate.now().toString();
    String uuid = UUID.randomUUID().toString().replace("-", "");
    String storedName = uuid + ext;

    String folder = (subDir == null || subDir.isBlank()) ? "misc" : subDir;

    Path dirPath = Paths.get(uploadDir, folder, day);

    try {
      Files.createDirectories(dirPath);
    } catch (IOException e) {
      throw new BusinessException("업로드 디렉토리 생성에 실패했습니다.");
    }

    Path target = dirPath.resolve(storedName);

    try {
      Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
    } catch (IOException e) {
      throw new BusinessException("파일 저장에 실패했습니다.");
    }

    return "/uploads/" + folder + "/" + day + "/" + storedName;
  }
}
