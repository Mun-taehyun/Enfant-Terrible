package com.enfantTerrible.enfantTerrible.mapper.admin.product;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminSkuListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminSkuRow;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminSkuSaveInternalRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminSkuSaveRequest;

@Mapper
public interface AdminProductSkuMapper {

  List<AdminSkuRow> findSkus(
      @Param("req") AdminSkuListRequest req,
      @Param("size") int size,
      @Param("offset") int offset
  );

  int countSkus(@Param("req") AdminSkuListRequest req);

  AdminSkuRow findById(@Param("skuId") Long skuId);

  List<Long> findSkuIdsByProductId(@Param("productId") Long productId);

  // SKU insert: skuId를 generatedKeys로 받는다
  int insertInternal(AdminSkuSaveInternalRequest req);

  int update(
      @Param("skuId") Long skuId,
      @Param("req") AdminSkuSaveRequest req
  );

  int softDelete(@Param("skuId") Long skuId);

  // ⭐ 1안 핵심: 해당 product의 base_price를 최저 SKU 가격으로 갱신
  int refreshProductBasePrice(@Param("productId") Long productId);
}
