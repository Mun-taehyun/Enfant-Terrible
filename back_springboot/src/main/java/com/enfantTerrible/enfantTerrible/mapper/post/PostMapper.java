package com.enfantTerrible.enfantTerrible.mapper.post;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.post.PostRow;

@Mapper
public interface PostMapper {

  List<PostRow> findPosts(
      @Param("postType") String postType,
      @Param("size") int size,
      @Param("offset") int offset
  );

  PostRow findById(@Param("postId") Long postId);
}
