package com.enfantTerrible.enfantTerrible.mapper.inquiry;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.inquiry.ProductInquiryRow;

@Mapper
public interface ProductInquiryMapper {

  int insert(
      @Param("productId") Long productId,
      @Param("userId") Long userId,
      @Param("content") String content,
      @Param("isPrivate") boolean isPrivate
  );

  Long findLastInsertId();

  ProductInquiryRow findById(@Param("inquiryId") Long inquiryId);

  List<ProductInquiryRow> findByProductId(
      @Param("productId") Long productId,
      @Param("size") int size,
      @Param("offset") int offset
  );

  int softDeleteByUser(
      @Param("inquiryId") Long inquiryId,
      @Param("userId") Long userId
  );

  int softDeleteByAdmin(
      @Param("inquiryId") Long inquiryId
  );

  int answer(
      @Param("inquiryId") Long inquiryId,
      @Param("answerContent") String answerContent,
      @Param("answeredByUserId") Long answeredByUserId,
      @Param("status") String status
  );

  int clearAnswer(
      @Param("inquiryId") Long inquiryId,
      @Param("status") String status
  );
}
