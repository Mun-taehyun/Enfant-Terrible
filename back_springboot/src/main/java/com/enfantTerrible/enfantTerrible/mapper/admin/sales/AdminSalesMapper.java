package com.enfantTerrible.enfantTerrible.mapper.admin.sales;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.admin.sales.AdminSalesSummaryRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.sales.AdminSalesSummaryRow;

@Mapper
public interface AdminSalesMapper {

  List<AdminSalesSummaryRow> findSalesByPeriod(@Param("req") AdminSalesSummaryRequest req);

  AdminSalesSummaryRow findSalesTotal(@Param("req") AdminSalesSummaryRequest req);
}
