package com.enfantTerrible.enfantTerrible.mapper.point;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.point.PointHistoryRow;

@Mapper
public interface PointHistoryMapper {

  int insert(
      @Param("userId") Long userId,
      @Param("pointAmount") Integer pointAmount,
      @Param("pointType") String pointType,
      @Param("reason") String reason,
      @Param("refType") String refType,
      @Param("refId") Long refId
  );

  Integer sumBalance(@Param("userId") Long userId);

  Integer sumBalanceForUpdate(@Param("userId") Long userId);

  int existsEarnForOrder(
      @Param("userId") Long userId,
      @Param("orderId") Long orderId
  );

  int existsRevokeForOrder(
      @Param("userId") Long userId,
      @Param("orderId") Long orderId
  );

  Integer sumEarnForOrder(
      @Param("userId") Long userId,
      @Param("orderId") Long orderId
  );

  Integer sumRevokedForOrder(
      @Param("userId") Long userId,
      @Param("orderId") Long orderId
  );

  List<PointHistoryRow> findByUserId(
      @Param("userId") Long userId,
      @Param("size") int size,
      @Param("offset") int offset
  );
}
