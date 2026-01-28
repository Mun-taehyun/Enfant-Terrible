package com.enfantTerrible.enfantTerrible.service.banner;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    return bannerMapper.findActiveBanners().stream()
        .map(this::toResponse)
        .toList();
  }

  private BannerResponse toResponse(BannerRow row) {
    BannerResponse res = new BannerResponse();
    res.setBannerId(row.getBannerId());
    res.setTitle(row.getTitle());
    res.setLinkUrl(row.getLinkUrl());
    res.setSortOrder(row.getSortOrder());
    res.setImageUrl(
        fileQueryService.findFirstFileUrl(
            REF_TYPE_BANNER,
            row.getBannerId(),
            FILE_ROLE_THUMBNAIL
        )
    );
    return res;
  }
}
