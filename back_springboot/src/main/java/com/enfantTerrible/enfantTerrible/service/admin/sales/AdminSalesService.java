package com.enfantTerrible.enfantTerrible.service.admin.sales;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.dto.admin.sales.AdminSalesSummaryRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.sales.AdminSalesSummaryResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.sales.AdminSalesSummaryRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.admin.sales.AdminSalesMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminSalesService {

  private final AdminSalesMapper adminSalesMapper;

  @Transactional(readOnly = true)
  public AdminSalesSummaryResponse getSalesSummary(AdminSalesSummaryRequest req) {
    validate(req);

    AdminSalesSummaryRow total = adminSalesMapper.findSalesTotal(req);
    List<AdminSalesSummaryRow> items = adminSalesMapper.findSalesByPeriod(req);

    AdminSalesSummaryResponse res = new AdminSalesSummaryResponse();
    res.setTotalAmount(total == null || total.getTotalAmount() == null ? 0L : total.getTotalAmount());
    res.setTotalCount(total == null || total.getPaymentCount() == null ? 0 : total.getPaymentCount());
    res.setItems(items);
    return res;
  }

  private void validate(AdminSalesSummaryRequest req) {
    if (req == null) {
      throw new BusinessException("요청 값이 비어있습니다.");
    }

    if (req.getPaidFrom() == null || req.getPaidTo() == null) {
      throw new BusinessException("조회 기간(paidFrom, paidTo)이 필요합니다.");
    }

    if (req.getPaidFrom().isAfter(req.getPaidTo())) {
      throw new BusinessException("조회 기간이 올바르지 않습니다.");
    }

    String groupBy = req.getGroupBy();
    if (groupBy == null || groupBy.isBlank()) {
      req.setGroupBy("DAY");
      return;
    }

    if (!groupBy.equals("DAY") && !groupBy.equals("MONTH")) {
      throw new BusinessException("groupBy는 DAY 또는 MONTH만 허용됩니다.");
    }
  }
}
