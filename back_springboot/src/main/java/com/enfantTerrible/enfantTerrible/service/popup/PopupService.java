package com.enfantTerrible.enfantTerrible.service.popup;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Collections;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.dto.file.FileRow;
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
    List<PopupRow> rows = popupMapper.findActivePopups();

    if (rows == null || rows.isEmpty()) {
      return Collections.emptyList();
    }

    Map<Long, String> imageUrlMap = new HashMap<>();
    List<Long> popupIds = rows.stream().map(PopupRow::getPopupId).toList();
    List<FileRow> thumbnails = fileQueryService.findFirstFilesByRefIds(
        REF_TYPE_POPUP,
        FILE_ROLE_THUMBNAIL,
        popupIds
    );
    for (FileRow f : thumbnails) {
      if (f != null && f.getRefId() != null) {
        imageUrlMap.put(f.getRefId(), f.getFileUrl());
      }
    }

    return rows.stream()
        .map(r -> toResponse(r, imageUrlMap.get(r.getPopupId())))
        .toList();
  }

  private PopupResponse toResponse(PopupRow row, String imageUrl) {
    PopupResponse res = new PopupResponse();
    res.setPopupId(row.getPopupId());
    res.setTitle(row.getTitle());
    res.setContent(row.getContent());
    res.setLinkUrl(row.getLinkUrl());
    res.setPosition(row.getPosition());
    res.setWidth(row.getWidth());
    res.setHeight(row.getHeight());
    res.setImageUrl(imageUrl);
    return res;
  }
}
