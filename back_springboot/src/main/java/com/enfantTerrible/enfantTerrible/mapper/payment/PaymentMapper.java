package com.enfantTerrible.enfantTerrible.mapper.payment;

import java.time.LocalDateTime;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.payment.PaymentRow;

@Mapper
public interface PaymentMapper {

  int insert(PaymentRow row);

  PaymentRow findLatestByOrderId(@Param("orderId") Long orderId);

  PaymentRow findLatestSuccessByOrderId(@Param("orderId") Long orderId);

  int updateStatus(
      @Param("paymentId") Long paymentId,
      @Param("paymentStatus") String paymentStatus,
      @Param("pgTid") String pgTid,
      @Param("paidAt") LocalDateTime paidAt
  );
}
