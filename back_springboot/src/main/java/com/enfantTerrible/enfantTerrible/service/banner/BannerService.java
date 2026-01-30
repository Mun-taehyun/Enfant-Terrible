package com.enfantTerrible.enfantTerrible.service.banner;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Collections;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.dto.file.FileRow;
import com.enfantTerrible.enfantTerrible.dto.banner.BannerResponse;
import com.enfantTerrible.enfantTerrible.dto.banner.BannerRow;
import com.enfantTerrible.enfantTerrible.mapper.banner.BannerMapper;
import com.enfantTerrible.enfantTerrible.service.file.FileQueryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BannerService {

  private static final String REF_TYPE_BANNER = "banner";
  private static final String FILE_ROLE_THUMBNAIL = "THUMBNAIL";

  private final BannerMapper bannerMapper;
  private final FileQueryService fileQueryService;

  public List<BannerResponse> getActiveBanners() {
    List<BannerRow> rows = bannerMapper.findActiveBanners();

    if (rows == null || rows.isEmpty()) {
      return Collections.emptyList();
    }

    Map<Long, String> imageUrlMap = new HashMap<>();
    List<Long> bannerIds = rows.stream().map(BannerRow::getBannerId).toList();
    List<FileRow> thumbnails = fileQueryService.findFirstFilesByRefIds(
        REF_TYPE_BANNER,
        FILE_ROLE_THUMBNAIL,
        bannerIds
    );
    for (FileRow f : thumbnails) {
      if (f != null && f.getRefId() != null) {
        imageUrlMap.put(f.getRefId(), f.getFileUrl());
      }
    }

    return rows.stream()
        .map(r -> toResponse(r, imageUrlMap.get(r.getBannerId())))
        .toList();
  }

  private BannerResponse toResponse(BannerRow row, String imageUrl) {
    BannerResponse res = new BannerResponse();
    res.setBannerId(row.getBannerId());
    res.setTitle(row.getTitle());
    res.setLinkUrl(row.getLinkUrl());
    res.setSortOrder(row.getSortOrder());
    res.setImageUrl(imageUrl);
    return res;
  }
}
