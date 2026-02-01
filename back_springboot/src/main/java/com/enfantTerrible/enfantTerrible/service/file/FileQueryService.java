package com.enfantTerrible.enfantTerrible.service.file;

import java.util.List;
import java.util.Collections;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.mapper.file.FileMapper;
import com.enfantTerrible.enfantTerrible.dto.file.FileRow;

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

  public List<FileRow> findFirstFilesByRefIds(
      String refType,
      String role,
      List<Long> refIds
  ) {
    if (refIds == null || refIds.isEmpty()) return Collections.emptyList();
    return fileMapper.findFirstFilesByRefIds(refType, role, refIds);
  }

  public List<FileRow> findFileUrlsByRefIds(
      String refType,
      String role,
      List<Long> refIds
  ) {
    if (refIds == null || refIds.isEmpty()) return Collections.emptyList();
    return fileMapper.findFileUrlsByRefIds(refType, role, refIds);
  }

  public List<FileRow> findFilesByRefAndRole(
      String refType,
      Long refId,
      String role
  ) {
    if (refId == null) return Collections.emptyList();
    return fileMapper.findFilesByRefAndRole(refType, refId, role);
  }

  public FileRow findById(Long fileId) {
    if (fileId == null) return null;
    return fileMapper.findById(fileId);
  }
}
