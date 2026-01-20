package com.enfantTerrible.enfantTerrible.service.file;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.mapper.file.FileMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FileQueryService {

  private final FileMapper fileMapper;

  /**
   * role 기준 대표 파일 1개 조회
   */
  public String findFirstFileUrl(
      String refType,
      Long refId,
      String role
  ) {
    return fileMapper.findFirstFileUrl(refType, refId, role);
  }

  /**
   * role 기준 파일 목록 조회
   */
  public List<String> findFileUrls(
      String refType,
      Long refId,
      String role
  ) {
    return fileMapper.findFileUrls(refType, refId, role);
  }
}
