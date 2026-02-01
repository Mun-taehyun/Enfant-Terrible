package com.enfantTerrible.enfantTerrible.mapper.file;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.file.FileRow;

@Mapper
public interface FileMapper {

  String findFirstFileUrl(
      @Param("refType") String refType,
      @Param("refId") Long refId,
      @Param("fileRole") String fileRole 
  );

  List<String> findFileUrls(
      @Param("refType") String refType,
      @Param("refId") Long refId,
      @Param("fileRole") String fileRole
  );

  List<FileRow> findFirstFilesByRefIds(
      @Param("refType") String refType,
      @Param("fileRole") String fileRole,
      @Param("refIds") List<Long> refIds
  );

  List<FileRow> findFileUrlsByRefIds(
      @Param("refType") String refType,
      @Param("fileRole") String fileRole,
      @Param("refIds") List<Long> refIds
  );

  List<FileRow> findFilesByRefAndRole(
      @Param("refType") String refType,
      @Param("refId") Long refId,
      @Param("fileRole") String fileRole
  );

  FileRow findById(@Param("fileId") Long fileId);

  void insert(FileRow row);

  void softDeleteByRef(
      @Param("refType") String refType,
      @Param("refId") Long refId
  );

  void softDeleteByRefAndRole(
      @Param("refType") String refType,
      @Param("refId") Long refId,
      @Param("fileRole") String fileRole
  );

  void softDeleteById(@Param("fileId") Long fileId);
}
