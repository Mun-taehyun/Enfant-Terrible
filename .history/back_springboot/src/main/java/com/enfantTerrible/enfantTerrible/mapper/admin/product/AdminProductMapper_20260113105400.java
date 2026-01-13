package com.enfantTerrible.enfantTerrible.mapper.admin.product;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminProductListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.product.AdminProductRow;

@Mapper
public interface AdminProductMapper {

  /**
   * 관리자 상품 목록 조회
   * - 삭제 상품 제외
   * - 상태/검색/페이징
   */
  List<AdminProductRow> findProducts(
      @Param("req") AdminProductListRequest req,
      @Param("size") int size,
      @Param("offset") int offset
  );

  /**
   * 관리자 상품 목록 전체 개수
   * - 페이징용
   */
  int countProducts(
      @Param("req") AdminProductListRequest req
  );
}
