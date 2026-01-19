package com.enfantTerrible.enfantTerrible.mapper.order;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface OrderMapper {

  int insertOrder(
      @Param("userId") Long userId,
      @Param("orderCode") String orderCode,
      @Param("orderStatus") String orderStatus,
      @Param("totalAmount") Long totalAmount,
      @Param("receiverName") String receiverName,
      @Param("receiverPhone") String receiverPhone,
      @Param("zipCode") String zipCode,
      @Param("addressBase") String addressBase,
      @Param("addressDetail") String addressDetail
  );

  Long findLastInsertId();
}
