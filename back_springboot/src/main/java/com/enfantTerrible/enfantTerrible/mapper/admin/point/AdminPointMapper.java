package com.enfantTerrible.enfantTerrible.mapper.admin.point;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.admin.point.AdminPointHistoryResponse;

@Mapper
public interface AdminPointMapper {

  List<AdminPointHistoryResponse> findHistory(
      @Param("userId") Long userId,
      @Param("size") int size,
      @Param("offset") int offset
  );

  int countHistory(
      @Param("userId") Long userId
  );
}
