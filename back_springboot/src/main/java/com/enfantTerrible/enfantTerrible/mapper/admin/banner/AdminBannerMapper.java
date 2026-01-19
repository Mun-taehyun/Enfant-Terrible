package com.enfantTerrible.enfantTerrible.mapper.admin.banner;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.admin.banner.AdminBannerDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.banner.AdminBannerListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.banner.AdminBannerListResponse;

@Mapper
public interface AdminBannerMapper {

  List<AdminBannerListResponse> findBanners(
      @Param("req") AdminBannerListRequest req
  );

  int countBanners(
      @Param("req") AdminBannerListRequest req
  );

  AdminBannerDetailResponse findById(
      @Param("bannerId") Long bannerId
  );

  int insert(
      @Param("title") String title,
      @Param("linkUrl") String linkUrl,
      @Param("sortOrder") Integer sortOrder,
      @Param("isActive") Boolean isActive,
      @Param("startAt") java.time.LocalDateTime startAt,
      @Param("endAt") java.time.LocalDateTime endAt
  );

  Long findLastInsertId();

  int update(
      @Param("bannerId") Long bannerId,
      @Param("title") String title,
      @Param("linkUrl") String linkUrl,
      @Param("sortOrder") Integer sortOrder,
      @Param("isActive") Boolean isActive,
      @Param("startAt") java.time.LocalDateTime startAt,
      @Param("endAt") java.time.LocalDateTime endAt
  );

  int softDelete(
      @Param("bannerId") Long bannerId
  );
}
