package com.enfantTerrible.enfantTerrible.mapper.admin.inquiry;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.admin.inquiry.AdminProductInquiryListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.inquiry.AdminProductInquiryListResponse;

@Mapper
public interface AdminProductInquiryMapper {

  List<AdminProductInquiryListResponse> findInquiries(
      @Param("req") AdminProductInquiryListRequest req
  );

  int countInquiries(
      @Param("req") AdminProductInquiryListRequest req
  );
}
