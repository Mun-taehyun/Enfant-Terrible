package com.enfantTerrible.enfantTerrible.mapper.qna;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.qna.QnaMessageRow;

@Mapper
public interface QnaMessageMapper {

  int insert(
      @Param("roomId") Long roomId,
      @Param("sender") String sender,
      @Param("message") String message
  );

  Long findLastInsertId();

  List<QnaMessageRow> findRecentByRoomId(
      @Param("roomId") Long roomId,
      @Param("limit") int limit
  );
}
