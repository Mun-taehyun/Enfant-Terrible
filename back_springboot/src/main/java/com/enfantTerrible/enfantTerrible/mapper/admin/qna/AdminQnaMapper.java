package com.enfantTerrible.enfantTerrible.mapper.admin.qna;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.admin.qna.AdminQnaRoomListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.qna.AdminQnaRoomListResponse;

@Mapper
public interface AdminQnaMapper {

  List<AdminQnaRoomListResponse> findRooms(
      @Param("req") AdminQnaRoomListRequest req
  );

  int countRooms(
      @Param("req") AdminQnaRoomListRequest req
  );
}
