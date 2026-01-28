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

  void insert(FileRow row);

  void softDeleteByRef(
      @Param("refType") String refType,
      @Param("refId") Long refId
  );
}
