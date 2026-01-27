package com.enfantTerrible.enfantTerrible.mapper.banner;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.enfantTerrible.enfantTerrible.dto.banner.BannerRow;

@Mapper
public interface BannerMapper {

  List<BannerRow> findActiveBanners();
}
