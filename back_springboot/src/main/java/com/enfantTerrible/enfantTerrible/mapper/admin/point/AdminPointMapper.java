package com.enfantTerrible.enfantTerrible.mapper.admin.point;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.admin.point.AdminPointHistoryRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.point.AdminPointHistoryResponse;

@Mapper
public interface AdminPointMapper {

  List<AdminPointHistoryResponse> findHistory(
      @Param("userId") Long userId,
      @Param("req") AdminPointHistoryRequest req
  );

  int countHistory(
      @Param("userId") Long userId
  );
}
