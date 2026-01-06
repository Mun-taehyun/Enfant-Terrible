package com.enfantTerrible.enfantTerrible.dto.admin.common;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminPageResponse<T> {

  private int page;
  private int size;
  private int totalCount;
  private List<T> list;
}
