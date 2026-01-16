package com.enfantTerrible.enfantTerrible.mapper.admin.product;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminProductOptionGroupRow;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminProductOptionGroupSaveRequest;

@Mapper
public interface AdminProductOptionGroupMapper {

  List<AdminProductOptionGroupRow> findByProductId(@Param("productId") Long productId);

  AdminProductOptionGroupRow findById(@Param("optionGroupId") Long optionGroupId);

  int insert(AdminProductOptionGroupSaveRequest req);

  int update(
      @Param("optionGroupId") Long optionGroupId,
      @Param("req") AdminProductOptionGroupSaveRequest req
  );

  int softDelete(@Param("optionGroupId") Long optionGroupId);
}
