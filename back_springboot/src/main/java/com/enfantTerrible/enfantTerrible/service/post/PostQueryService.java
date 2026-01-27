package com.enfantTerrible.enfantTerrible.service.post;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.PostType;
import com.enfantTerrible.enfantTerrible.dto.post.PostResponse;
import com.enfantTerrible.enfantTerrible.dto.post.PostRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.post.PostMapper;
import com.enfantTerrible.enfantTerrible.service.file.FileQueryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostQueryService {

  private static final String REF_TYPE_POST = "post";
  private static final String FILE_ROLE_ATTACHMENT = "ATTACHMENT";

  private final PostMapper postMapper;
  private final FileQueryService fileQueryService;

  public List<PostResponse> getPosts(Integer pageParam, Integer sizeParam, String postTypeParam) {

    int page = (pageParam == null || pageParam < 1) ? 1 : pageParam;
    int size = (sizeParam == null || sizeParam < 1) ? 20 : sizeParam;
    if (size > 100) size = 100;
    int offset = (page - 1) * size;

    PostType postType = PostType.from(postTypeParam);
    String type = postType == null ? PostType.NOTICE.name() : postType.name();

    return postMapper.findPosts(type, size, offset)
        .stream()
        .map(this::toResponse)
        .toList();
  }

  public PostResponse getPost(Long postId) {
    PostRow row = postMapper.findById(postId);
    if (row == null || row.getDeletedAt() != null) {
      throw new BusinessException("게시글을 찾을 수 없습니다.");
    }
    return toResponse(row);
  }

  private PostResponse toResponse(PostRow row) {
    if (row == null) {
      return null;
    }

    PostResponse res = new PostResponse();
    res.setPostId(row.getPostId());
    res.setPostType(row.getPostType());
    res.setTitle(row.getTitle());
    res.setContent(row.getContent());
    res.setFileUrls(fileQueryService.findFileUrls(REF_TYPE_POST, row.getPostId(), FILE_ROLE_ATTACHMENT));
    res.setCreatedAt(row.getCreatedAt());
    res.setUpdatedAt(row.getUpdatedAt());
    return res;
  }
}
