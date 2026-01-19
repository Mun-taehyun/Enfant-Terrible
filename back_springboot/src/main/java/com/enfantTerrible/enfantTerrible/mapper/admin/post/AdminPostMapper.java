package com.enfantTerrible.enfantTerrible.mapper.admin.post;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.admin.post.AdminPostDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.post.AdminPostListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.post.AdminPostListResponse;

@Mapper
public interface AdminPostMapper {

  List<AdminPostListResponse> findPosts(
      @Param("req") AdminPostListRequest req
  );

  int countPosts(
      @Param("req") AdminPostListRequest req
  );

  AdminPostDetailResponse findById(
      @Param("postId") Long postId
  );

  int insert(
      @Param("userId") Long userId,
      @Param("postType") String postType,
      @Param("refType") String refType,
      @Param("refId") Long refId,
      @Param("title") String title,
      @Param("content") String content
  );

  Long findLastInsertId();

  int update(
      @Param("postId") Long postId,
      @Param("postType") String postType,
      @Param("refType") String refType,
      @Param("refId") Long refId,
      @Param("title") String title,
      @Param("content") String content
  );

  int softDelete(
      @Param("postId") Long postId
  );
}
