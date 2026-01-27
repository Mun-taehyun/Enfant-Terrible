package com.enfantTerrible.enfantTerrible.common.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PageResponse<T> {

  private int page;
  private int size;
  private int totalCount;
  private List<T> items;
}
