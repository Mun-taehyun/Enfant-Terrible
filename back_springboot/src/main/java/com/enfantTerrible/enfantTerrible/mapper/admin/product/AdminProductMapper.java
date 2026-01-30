package com.enfantTerrible.enfantTerrible.mapper.admin.product;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminProductRow;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminProductDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminProductSaveRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminProductListRequest;

@Mapper
public interface AdminProductMapper {

  List<AdminProductRow> findProducts(
      @Param("req") AdminProductListRequest req,
      @Param("size") int size,
      @Param("offset") int offset
  );

  int countProducts(@Param("req") AdminProductListRequest req);

  AdminProductRow findById(@Param("productId") Long productId);

  AdminProductDetailResponse findDetailById(@Param("productId") Long productId);

  int insert(AdminProductSaveRequest req);

  int update(@Param("productId") Long productId,
              @Param("req") AdminProductSaveRequest req);

  int softDelete(@Param("productId") Long productId);
}
