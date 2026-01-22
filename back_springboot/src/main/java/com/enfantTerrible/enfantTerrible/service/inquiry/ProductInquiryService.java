package com.enfantTerrible.enfantTerrible.service.inquiry;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.FileRefType;
import com.enfantTerrible.enfantTerrible.common.enums.FileRole;
import com.enfantTerrible.enfantTerrible.common.enums.UserRole;
import com.enfantTerrible.enfantTerrible.dto.file.FileRow;
import com.enfantTerrible.enfantTerrible.dto.inquiry.ProductInquiryCreateRequest;
import com.enfantTerrible.enfantTerrible.dto.inquiry.ProductInquiryResponse;
import com.enfantTerrible.enfantTerrible.dto.inquiry.ProductInquiryRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.inquiry.ProductInquiryMapper;
import com.enfantTerrible.enfantTerrible.mapper.product.ProductMapper;
import com.enfantTerrible.enfantTerrible.service.file.FileCommandService;
import com.enfantTerrible.enfantTerrible.service.file.FileQueryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductInquiryService {

  private static final String MASKED_CONTENT = "비공개 문의입니다.";

  private static final String REF_TYPE_INQUIRY = "inquiry";
  private static final String FILE_ROLE_ATTACHMENT = "ATTACHMENT";

  private final ProductInquiryMapper productInquiryMapper;
  private final ProductMapper productMapper;

  private final FileCommandService fileCommandService;
  private final FileQueryService fileQueryService;

  @Transactional(readOnly = true)
  public List<ProductInquiryResponse> getProductInquiries(Long productId, Long viewerUserId, UserRole viewerRole, Integer pageParam,
      Integer sizeParam) {

    ensureProductExistsForUser(productId);

    int page = (pageParam == null || pageParam < 1) ? 1 : pageParam;
    int size = (sizeParam == null || sizeParam < 1) ? 20 : sizeParam;
    if (size > 100) size = 100;
    int offset = (page - 1) * size;

    return productInquiryMapper.findByProductId(productId, size, offset)
        .stream()
        .filter(r -> r != null && r.getDeletedAt() == null)
        .map(r -> toResponse(r, viewerUserId, viewerRole))
        .toList();
  }

  public ProductInquiryResponse create(Long userId, Long productId, ProductInquiryCreateRequest req) {
    if (userId == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    ensureProductExistsForUser(productId);

    if (req == null || req.getContent() == null || req.getContent().isBlank()) {
      throw new BusinessException("문의 내용을 입력해주세요.");
    }

    boolean isPrivate = req.getIsPrivate() != null && req.getIsPrivate();

    int inserted = productInquiryMapper.insert(productId, userId, req.getContent(), isPrivate);
    if (inserted != 1) {
      throw new BusinessException("문의 등록에 실패했습니다.");
    }

    Long inquiryId = productInquiryMapper.findLastInsertId();

    if (inquiryId != null && req.getImageUrls() != null && !req.getImageUrls().isEmpty()) {
      replaceInquiryAttachments(inquiryId, req.getImageUrls());
    }
    ProductInquiryRow row = productInquiryMapper.findById(inquiryId);
    if (row == null || row.getDeletedAt() != null) {
      throw new BusinessException("문의 등록에 실패했습니다.");
    }

    return toResponse(row, userId, UserRole.USER);
  }

  public void deleteByUser(Long userId, Long inquiryId) {
    if (userId == null) {
      throw new BusinessException("로그인이 필요합니다.");
    }

    ProductInquiryRow row = productInquiryMapper.findById(inquiryId);
    if (row == null || row.getDeletedAt() != null) {
      throw new BusinessException("문의를 찾을 수 없습니다.");
    }

    if (row.getUserId() == null || !row.getUserId().equals(userId)) {
      throw new BusinessException("삭제 권한이 없습니다.");
    }

    int deleted = productInquiryMapper.softDeleteByUser(inquiryId, userId);
    if (deleted != 1) {
      throw new BusinessException("문의 삭제에 실패했습니다.");
    }

    fileCommandService.deleteByRef(REF_TYPE_INQUIRY, inquiryId);
  }

  private void ensureProductExistsForUser(Long productId) {
    if (productId == null) {
      throw new BusinessException("productId가 필요합니다.");
    }

    if (productMapper.findByIdForUser(productId) == null) {
      throw new BusinessException("상품을 찾을 수 없습니다.");
    }
  }

  private ProductInquiryResponse toResponse(ProductInquiryRow row, Long viewerUserId, UserRole viewerRole) {
    if (row == null) {
      return null;
    }

    boolean isAdmin = viewerRole == UserRole.ADMIN;
    boolean isOwner = viewerUserId != null && row.getUserId() != null && row.getUserId().equals(viewerUserId);

    ProductInquiryResponse res = new ProductInquiryResponse();
    res.setInquiryId(row.getInquiryId());
    res.setProductId(row.getProductId());
    res.setUserId(row.getUserId());
    res.setUserEmail(row.getUserEmail());
    res.setIsPrivate(row.getIsPrivate());
    res.setStatus(row.getStatus());
    res.setAnsweredByUserId(row.getAnsweredByUserId());
    res.setAnsweredAt(row.getAnsweredAt());
    res.setCreatedAt(row.getCreatedAt());
    res.setUpdatedAt(row.getUpdatedAt());

    boolean canViewContent = Boolean.FALSE.equals(row.getIsPrivate()) || isOwner || isAdmin;

    if (canViewContent) {
      res.setContent(row.getContent());
      res.setAnswerContent(row.getAnswerContent());
      res.setImageUrls(fileQueryService.findFileUrls(REF_TYPE_INQUIRY, row.getInquiryId(), FILE_ROLE_ATTACHMENT));
    } else {
      res.setContent(MASKED_CONTENT);
      res.setAnswerContent(null);
      res.setAnsweredByUserId(null);
      res.setAnsweredAt(null);
      res.setImageUrls(null);
    }

    return res;
  }

  private void replaceInquiryAttachments(Long inquiryId, List<String> imageUrls) {
    fileCommandService.deleteByRef(REF_TYPE_INQUIRY, inquiryId);

    if (imageUrls == null || imageUrls.isEmpty()) {
      return;
    }

    for (String imageUrl : imageUrls) {
      if (imageUrl == null || imageUrl.isBlank()) {
        continue;
      }

      FileRow file = new FileRow();
      file.setRefType(FileRefType.INQUIRY);
      file.setRefId(inquiryId);
      file.setFileRole(FileRole.ATTACHMENT);

      file.setFileUrl(imageUrl);
      file.setOriginalName(imageUrl);
      file.setStoredName(imageUrl);
      file.setFileType("URL");
      file.setFilePath("");

      fileCommandService.save(file);
    }
  }
}
