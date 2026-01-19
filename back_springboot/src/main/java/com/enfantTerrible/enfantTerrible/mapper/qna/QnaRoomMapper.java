package com.enfantTerrible.enfantTerrible.mapper.qna;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.qna.QnaRoomRow;

@Mapper
public interface QnaRoomMapper {

  QnaRoomRow findById(@Param("roomId") Long roomId);

  QnaRoomRow findByUserId(@Param("userId") Long userId);

  int insert(@Param("userId") Long userId);

  Long findLastInsertId();

  int touchLastMessage(@Param("roomId") Long roomId);

  int updateUserLastRead(
      @Param("roomId") Long roomId,
      @Param("messageId") Long messageId
  );

  int updateAdminLastRead(
      @Param("roomId") Long roomId,
      @Param("messageId") Long messageId
  );

  int countUnreadForUser(@Param("roomId") Long roomId);

  int countUnreadForAdmin(@Param("roomId") Long roomId);
}
