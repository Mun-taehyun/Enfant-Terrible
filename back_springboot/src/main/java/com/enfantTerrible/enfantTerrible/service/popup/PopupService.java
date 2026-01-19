package com.enfantTerrible.enfantTerrible.service.popup;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.dto.popup.PopupResponse;
import com.enfantTerrible.enfantTerrible.dto.popup.PopupRow;
import com.enfantTerrible.enfantTerrible.mapper.popup.PopupMapper;
import com.enfantTerrible.enfantTerrible.service.file.FileQueryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PopupService {

  private static final String REF_TYPE_POPUP = "popup";
  private static final String FILE_ROLE_THUMBNAIL = "THUMBNAIL";

  private final PopupMapper popupMapper;
  private final FileQueryService fileQueryService;

  public List<PopupResponse> getActivePopups() {
    return popupMapper.findActivePopups().stream()
        .map(this::toResponse)
        .toList();
  }

  private PopupResponse toResponse(PopupRow row) {
    PopupResponse res = new PopupResponse();
    res.setPopupId(row.getPopupId());
    res.setTitle(row.getTitle());
    res.setContent(row.getContent());
    res.setLinkUrl(row.getLinkUrl());
    res.setPosition(row.getPosition());
    res.setWidth(row.getWidth());
    res.setHeight(row.getHeight());
    res.setImageUrl(
        fileQueryService.findFirstFileUrl(
            REF_TYPE_POPUP,
            row.getPopupId(),
            FILE_ROLE_THUMBNAIL
        )
    );
    return res;
  }
}
