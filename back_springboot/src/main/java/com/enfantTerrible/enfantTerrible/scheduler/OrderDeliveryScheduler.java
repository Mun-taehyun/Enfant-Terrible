package com.enfantTerrible.enfantTerrible.scheduler;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.OrderStatus;
import com.enfantTerrible.enfantTerrible.mapper.order.OrderMapper;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OrderDeliveryScheduler {

  private final OrderMapper orderMapper;

  @Scheduled(cron = "0 0 3 * * *")
  @Transactional
  public void autoDeliverAfterThreeDays() {
    LocalDateTime cutoff = LocalDateTime.now().minusDays(3);
    orderMapper.markDeliveredIfShippedBefore(
        cutoff,
        OrderStatus.DELIVERED.name(),
        LocalDateTime.now()
    );
  }
}
