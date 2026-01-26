package com.enfantTerrible.enfantTerrible.service.admin.post;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.FileRefType;
import com.enfantTerrible.enfantTerrible.common.enums.FileRole;
import com.enfantTerrible.enfantTerrible.common.enums.PostType;
import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.post.AdminPostDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.post.AdminPostListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.post.AdminPostListResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.post.AdminPostSaveRequest;
import com.enfantTerrible.enfantTerrible.dto.file.FileRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.admin.post.AdminPostMapper;
import com.enfantTerrible.enfantTerrible.service.file.FileCommandService;
import com.enfantTerrible.enfantTerrible.service.file.FileQueryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminPostService {

  private static final String REF_TYPE_POST = "post";
  private static final String FILE_ROLE_ATTACHMENT = "ATTACHMENT";

  private final AdminPostMapper adminPostMapper;
  private final FileCommandService fileCommandService;
  private final FileQueryService fileQueryService;

  @Transactional(readOnly = true)
  public AdminPageResponse<AdminPostListResponse> getPosts(AdminPostListRequest req) {
    normalizePaging(req);

    int total = adminPostMapper.countPosts(req);
    List<AdminPostListResponse> list = adminPostMapper.findPosts(req);

    return new AdminPageResponse<>(
        req.getPage(),
        req.getSize(),
        total,
        list
    );
  }

  @Transactional(readOnly = true)
  public AdminPostDetailResponse getPost(Long postId) {
    AdminPostDetailResponse row = adminPostMapper.findById(postId);
    if (row == null || row.getDeletedAt() != null) {
      throw new BusinessException("게시글을 찾을 수 없습니다.");
    }

    row.setFileUrls(fileQueryService.findFileUrls(REF_TYPE_POST, row.getPostId(), FILE_ROLE_ATTACHMENT));
    return row;
  }

  @Transactional
  public Long create(Long userId, AdminPostSaveRequest req) {
    if (userId == null) {
      throw new BusinessException("작성자 정보가 필요합니다.");
    }

    PostType postType = PostType.from(req.getPostType());
    if (postType == null) {
      throw new BusinessException("게시글 타입이 올바르지 않습니다.");
    }

    adminPostMapper.insert(
        userId,
        postType.name(),
        req.getRefType(),
        req.getRefId(),
        req.getTitle(),
        req.getContent()
    );

    Long postId = adminPostMapper.findLastInsertId();

    if (postId != null && req.getFileUrls() != null && !req.getFileUrls().isEmpty()) {
      replaceAttachments(postId, req.getFileUrls());
    }

    return postId;
  }

  @Transactional
  public void update(Long postId, AdminPostSaveRequest req) {

    AdminPostDetailResponse old = adminPostMapper.findById(postId);
    if (old == null || old.getDeletedAt() != null) {
      throw new BusinessException("게시글을 찾을 수 없습니다.");
    }

    PostType postType = PostType.from(req.getPostType());
    if (postType == null) {
      throw new BusinessException("게시글 타입이 올바르지 않습니다.");
    }

    int updated = adminPostMapper.update(
        postId,
        postType.name(),
        req.getRefType(),
        req.getRefId(),
        req.getTitle(),
        req.getContent()
    );

    if (updated != 1) {
      throw new BusinessException("게시글 수정에 실패했습니다.");
    }

    if (req.getFileUrls() != null) {
      replaceAttachments(postId, req.getFileUrls());
    }
  }

  @Transactional
  public void delete(Long postId) {

    AdminPostDetailResponse old = adminPostMapper.findById(postId);
    if (old == null || old.getDeletedAt() != null) {
      throw new BusinessException("게시글을 찾을 수 없습니다.");
    }

    int deleted = adminPostMapper.softDelete(postId);
    if (deleted != 1) {
      throw new BusinessException("게시글 삭제에 실패했습니다.");
    }

    fileCommandService.deleteByRef(REF_TYPE_POST, postId);
  }

  private void replaceAttachments(Long postId, List<String> fileUrls) {
    fileCommandService.deleteByRef(REF_TYPE_POST, postId);

    if (fileUrls == null || fileUrls.isEmpty()) {
      return;
    }

    for (String fileUrl : fileUrls) {
      if (fileUrl == null || fileUrl.isBlank()) {
        continue;
      }

      FileRow file = new FileRow();
      file.setRefType(FileRefType.POST);
      file.setRefId(postId);
      file.setFileRole(FileRole.ATTACHMENT);

      file.setFileUrl(fileUrl);
      file.setOriginalName(fileUrl);
      file.setStoredName(fileUrl);
      file.setFileType("URL");
      file.setFilePath("");

      fileCommandService.save(file);
    }
  }

  private void normalizePaging(AdminPostListRequest req) {
    if (req == null) {
      throw new BusinessException("요청 값이 비어있습니다.");
    }

    if (req.getPage() < 1) {
      req.setPage(1);
    }

    if (req.getSize() < 1) {
      req.setSize(20);
    } else if (req.getSize() > 200) {
      req.setSize(200);
    }
  }
}
