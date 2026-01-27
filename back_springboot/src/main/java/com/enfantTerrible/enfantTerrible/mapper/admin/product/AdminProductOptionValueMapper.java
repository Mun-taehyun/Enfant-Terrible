package com.enfantTerrible.enfantTerrible.mapper.admin.product;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminProductOptionValueRow;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminProductOptionValueSaveRequest;

@Mapper
public interface AdminProductOptionValueMapper {

  List<AdminProductOptionValueRow> findByGroupId(@Param("optionGroupId") Long optionGroupId);

  AdminProductOptionValueRow findById(@Param("optionValueId") Long optionValueId);

  int insert(AdminProductOptionValueSaveRequest req);

  int update(
      @Param("optionValueId") Long optionValueId,
      @Param("req") AdminProductOptionValueSaveRequest req
  );

  int softDelete(@Param("optionValueId") Long optionValueId);
}
