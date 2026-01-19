package com.enfantTerrible.enfantTerrible.controller.banner;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.enfantTerrible.enfantTerrible.common.response.ApiResponse;
import com.enfantTerrible.enfantTerrible.dto.banner.BannerResponse;
import com.enfantTerrible.enfantTerrible.service.banner.BannerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/banners")
public class BannerController {

  private final BannerService bannerService;

  @GetMapping
  public ApiResponse<List<BannerResponse>> list() {
    return ApiResponse.success(
        bannerService.getActiveBanners(),
        "배너 목록 조회 성공"
    );
  }
}
