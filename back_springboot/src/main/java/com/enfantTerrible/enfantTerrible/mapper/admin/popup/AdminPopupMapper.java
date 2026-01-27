package com.enfantTerrible.enfantTerrible.mapper.admin.popup;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.admin.popup.AdminPopupDetailResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.popup.AdminPopupListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.popup.AdminPopupListResponse;

@Mapper
public interface AdminPopupMapper {

  List<AdminPopupListResponse> findPopups(
      @Param("req") AdminPopupListRequest req
  );

  int countPopups(
      @Param("req") AdminPopupListRequest req
  );

  AdminPopupDetailResponse findById(
      @Param("popupId") Long popupId
  );

  int insert(
      @Param("title") String title,
      @Param("content") String content,
      @Param("linkUrl") String linkUrl,
      @Param("position") String position,
      @Param("width") Integer width,
      @Param("height") Integer height,
      @Param("isActive") Boolean isActive,
      @Param("startAt") LocalDateTime startAt,
      @Param("endAt") LocalDateTime endAt
  );

  Long findLastInsertId();

  int update(
      @Param("popupId") Long popupId,
      @Param("title") String title,
      @Param("content") String content,
      @Param("linkUrl") String linkUrl,
      @Param("position") String position,
      @Param("width") Integer width,
      @Param("height") Integer height,
      @Param("isActive") Boolean isActive,
      @Param("startAt") LocalDateTime startAt,
      @Param("endAt") LocalDateTime endAt
  );

  int softDelete(
      @Param("popupId") Long popupId
  );
}
