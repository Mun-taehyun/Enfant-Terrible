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

  AdminSkuRow findBySkuCode(@Param("skuCode") String skuCode);
  
  int insertInternal(AdminSkuSaveInternalRequest req);

  int update(
      @Param("skuId") Long skuId,
      @Param("req") AdminSkuSaveRequest req
  );

  


  int softDelete(@Param("skuId") Long skuId);
}
