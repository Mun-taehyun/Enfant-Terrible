package com.enfantTerrible.enfantTerrible.service.file;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.dto.file.FileRow;
import com.enfantTerrible.enfantTerrible.mapper.file.FileMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class FileCommandService {

  private final FileMapper fileMapper;

  /**
   * 파일 메타데이터 저장
   * (실제 파일 저장은 별도 처리)
   */
  public void save(FileRow row) {
    fileMapper.insert(row);
  }

  /**
   * 참조 대상 기준 논리 삭제
   */
  public void deleteByRef(String refType, Long refId) {
    fileMapper.softDeleteByRef(refType, refId);
  }

  public void deleteByRefAndRole(String refType, Long refId, String fileRole) {
    fileMapper.softDeleteByRefAndRole(refType, refId, fileRole);
  }

  public void deleteById(Long fileId) {
    fileMapper.softDeleteById(fileId);
  }
}
