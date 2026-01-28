package com.enfantTerrible.enfantTerrible.service.admin.popup;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.FileRefType;
import com.enfantTerrible.enfantTerrible.common.enums.FileRole;
import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.popup.AdminPopupDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.popup.AdminPopupListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.popup.AdminPopupListResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.popup.AdminPopupSaveRequest;
import com.enfantTerrible.enfantTerrible.dto.file.FileRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.admin.popup.AdminPopupMapper;
import com.enfantTerrible.enfantTerrible.service.file.FileCommandService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminPopupService {

  private static final String REF_TYPE_POPUP = "popup";

  private final AdminPopupMapper adminPopupMapper;
  private final FileCommandService fileCommandService;

  @Transactional(readOnly = true)
  public AdminPageResponse<AdminPopupListResponse> getPopups(AdminPopupListRequest req) {
    normalizePaging(req);

    int total = adminPopupMapper.countPopups(req);
    List<AdminPopupListResponse> list = adminPopupMapper.findPopups(req);

    return new AdminPageResponse<>(req.getPage(), req.getSize(), total, list);
  }

  @Transactional(readOnly = true)
  public AdminPopupDetailResponse getPopup(Long popupId) {
    AdminPopupDetailResponse row = adminPopupMapper.findById(popupId);
    if (row == null || row.getDeletedAt() != null) {
      throw new BusinessException("팝업을 찾을 수 없습니다.");
    }
    return row;
  }

  @Transactional
  public Long create(AdminPopupSaveRequest req) {

    int inserted = adminPopupMapper.insert(
        req.getTitle(),
        req.getContent(),
        req.getLinkUrl(),
        req.getPosition(),
        req.getWidth(),
        req.getHeight(),
        req.getIsActive(),
        req.getStartAt(),
        req.getEndAt()
    );

    if (inserted != 1) {
      throw new BusinessException("팝업 생성에 실패했습니다.");
    }

    Long popupId = adminPopupMapper.findLastInsertId();

    if (popupId != null && req.getImageUrl() != null && !req.getImageUrl().isBlank()) {
      replaceThumbnail(popupId, req.getImageUrl());
    }

    return popupId;
  }

  @Transactional
  public void update(Long popupId, AdminPopupSaveRequest req) {

    AdminPopupDetailResponse old = adminPopupMapper.findById(popupId);
    if (old == null || old.getDeletedAt() != null) {
      throw new BusinessException("팝업을 찾을 수 없습니다.");
    }

    int updated = adminPopupMapper.update(
        popupId,
        req.getTitle(),
        req.getContent(),
        req.getLinkUrl(),
        req.getPosition(),
        req.getWidth(),
        req.getHeight(),
        req.getIsActive(),
        req.getStartAt(),
        req.getEndAt()
    );

    if (updated != 1) {
      throw new BusinessException("팝업 수정에 실패했습니다.");
    }

    if (req.getImageUrl() != null && !req.getImageUrl().isBlank()) {
      replaceThumbnail(popupId, req.getImageUrl());
    }
  }

  @Transactional
  public void delete(Long popupId) {

    AdminPopupDetailResponse old = adminPopupMapper.findById(popupId);
    if (old == null || old.getDeletedAt() != null) {
      throw new BusinessException("팝업을 찾을 수 없습니다.");
    }

    int deleted = adminPopupMapper.softDelete(popupId);
    if (deleted != 1) {
      throw new BusinessException("팝업 삭제에 실패했습니다.");
    }

    fileCommandService.deleteByRef(REF_TYPE_POPUP, popupId);
  }

  private void replaceThumbnail(Long popupId, String imageUrl) {
    fileCommandService.deleteByRef(REF_TYPE_POPUP, popupId);

    FileRow file = new FileRow();
    file.setRefType(FileRefType.POPUP);
    file.setRefId(popupId);
    file.setFileRole(FileRole.THUMBNAIL);

    file.setFileUrl(imageUrl);
    file.setOriginalName(imageUrl);
    file.setStoredName(imageUrl);
    file.setFileType("URL");
    file.setFilePath("");

    fileCommandService.save(file);
  }

  private void normalizePaging(AdminPopupListRequest req) {
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
