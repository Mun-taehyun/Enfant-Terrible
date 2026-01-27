package com.enfantTerrible.enfantTerrible.mapper.popup;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.enfantTerrible.enfantTerrible.dto.popup.PopupRow;

@Mapper
public interface PopupMapper {

  List<PopupRow> findActivePopups();
}
