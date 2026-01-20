package com.enfantTerrible.enfantTerrible.service.admin.banner;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.FileRefType;
import com.enfantTerrible.enfantTerrible.common.enums.FileRole;
import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.banner.AdminBannerDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.banner.AdminBannerListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.banner.AdminBannerListResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.banner.AdminBannerSaveRequest;
import com.enfantTerrible.enfantTerrible.dto.file.FileRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.admin.banner.AdminBannerMapper;
import com.enfantTerrible.enfantTerrible.service.file.FileCommandService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminBannerService {

  private static final String REF_TYPE_BANNER = "banner";

  private final AdminBannerMapper adminBannerMapper;
  private final FileCommandService fileCommandService;

  @Transactional(readOnly = true)
  public AdminPageResponse<AdminBannerListResponse> getBanners(AdminBannerListRequest req) {
    normalizePaging(req);

    int total = adminBannerMapper.countBanners(req);
    List<AdminBannerListResponse> list = adminBannerMapper.findBanners(req);

    return new AdminPageResponse<>(req.getPage(), req.getSize(), total, list);
  }

  @Transactional(readOnly = true)
  public AdminBannerDetailResponse getBanner(Long bannerId) {
    AdminBannerDetailResponse row = adminBannerMapper.findById(bannerId);
    if (row == null || row.getDeletedAt() != null) {
      throw new BusinessException("배너를 찾을 수 없습니다.");
    }
    return row;
  }

  @Transactional
  public Long create(AdminBannerSaveRequest req) {

    int inserted = adminBannerMapper.insert(
        req.getTitle(),
        req.getLinkUrl(),
        req.getSortOrder(),
        req.getIsActive(),
        req.getStartAt(),
        req.getEndAt()
    );

    if (inserted != 1) {
      throw new BusinessException("배너 생성에 실패했습니다.");
    }

    Long bannerId = adminBannerMapper.findLastInsertId();

    if (bannerId != null && req.getImageUrl() != null && !req.getImageUrl().isBlank()) {
      replaceThumbnail(bannerId, req.getImageUrl());
    }

    return bannerId;
  }

  @Transactional
  public void update(Long bannerId, AdminBannerSaveRequest req) {

    AdminBannerDetailResponse old = adminBannerMapper.findById(bannerId);
    if (old == null || old.getDeletedAt() != null) {
      throw new BusinessException("배너를 찾을 수 없습니다.");
    }

    int updated = adminBannerMapper.update(
        bannerId,
        req.getTitle(),
        req.getLinkUrl(),
        req.getSortOrder(),
        req.getIsActive(),
        req.getStartAt(),
        req.getEndAt()
    );

    if (updated != 1) {
      throw new BusinessException("배너 수정에 실패했습니다.");
    }

    if (req.getImageUrl() != null && !req.getImageUrl().isBlank()) {
      replaceThumbnail(bannerId, req.getImageUrl());
    }
  }

  @Transactional
  public void delete(Long bannerId) {

    AdminBannerDetailResponse old = adminBannerMapper.findById(bannerId);
    if (old == null || old.getDeletedAt() != null) {
      throw new BusinessException("배너를 찾을 수 없습니다.");
    }

    int deleted = adminBannerMapper.softDelete(bannerId);
    if (deleted != 1) {
      throw new BusinessException("배너 삭제에 실패했습니다.");
    }

    fileCommandService.deleteByRef(REF_TYPE_BANNER, bannerId);
  }

  private void replaceThumbnail(Long bannerId, String imageUrl) {
    fileCommandService.deleteByRef(REF_TYPE_BANNER, bannerId);

    FileRow file = new FileRow();
    file.setRefType(FileRefType.BANNER);
    file.setRefId(bannerId);
    file.setFileRole(FileRole.THUMBNAIL);

    file.setFileUrl(imageUrl);
    file.setOriginalName(imageUrl);
    file.setStoredName(imageUrl);
    file.setFileType("URL");
    file.setFilePath("");

    fileCommandService.save(file);
  }

  private void normalizePaging(AdminBannerListRequest req) {
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
