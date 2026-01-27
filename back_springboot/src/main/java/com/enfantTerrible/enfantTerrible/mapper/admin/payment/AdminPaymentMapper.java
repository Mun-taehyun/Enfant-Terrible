package com.enfantTerrible.enfantTerrible.mapper.admin.payment;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.admin.payment.AdminPaymentDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.payment.AdminPaymentListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.payment.AdminPaymentListResponse;

@Mapper
public interface AdminPaymentMapper {

  List<AdminPaymentListResponse> findPayments(
      @Param("req") AdminPaymentListRequest req
  );

  int countPayments(
      @Param("req") AdminPaymentListRequest req
  );

  AdminPaymentDetailResponse findPaymentDetail(
      @Param("paymentId") Long paymentId
  );
}
