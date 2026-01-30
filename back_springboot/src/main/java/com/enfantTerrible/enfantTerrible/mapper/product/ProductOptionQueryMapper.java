package com.enfantTerrible.enfantTerrible.mapper.product;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.product.ProductOptionGroupRow;
import com.enfantTerrible.enfantTerrible.dto.product.ProductOptionValueRow;

@Mapper
public interface ProductOptionQueryMapper {

  List<ProductOptionGroupRow> findOptionGroupsByProductId(@Param("productId") Long productId);

  List<ProductOptionValueRow> findOptionValuesByGroupId(@Param("optionGroupId") Long optionGroupId);

  List<ProductOptionValueRow> findOptionValuesByGroupIds(
      @Param("optionGroupIds") List<Long> optionGroupIds
  );
}
