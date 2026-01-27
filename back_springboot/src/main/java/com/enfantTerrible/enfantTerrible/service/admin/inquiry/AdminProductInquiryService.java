package com.enfantTerrible.enfantTerrible.service.admin.inquiry;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.response.AdminPageResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.inquiry.AdminProductInquiryAnswerRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.inquiry.AdminProductInquiryListRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.inquiry.AdminProductInquiryListResponse;
import com.enfantTerrible.enfantTerrible.dto.inquiry.ProductInquiryRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.admin.inquiry.AdminProductInquiryMapper;
import com.enfantTerrible.enfantTerrible.mapper.inquiry.ProductInquiryMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminProductInquiryService {

  private final AdminProductInquiryMapper adminProductInquiryMapper;
  private final ProductInquiryMapper productInquiryMapper;

  @Transactional(readOnly = true)
  public AdminPageResponse<AdminProductInquiryListResponse> getInquiries(AdminProductInquiryListRequest req) {
    normalizePaging(req);

    int total = adminProductInquiryMapper.countInquiries(req);
    List<AdminProductInquiryListResponse> list = adminProductInquiryMapper.findInquiries(req);

    return new AdminPageResponse<>(req.getPage(), req.getSize(), total, list);
  }

  public void answer(Long adminUserId, Long inquiryId, AdminProductInquiryAnswerRequest req) {
    if (req == null || req.getAnswerContent() == null || req.getAnswerContent().isBlank()) {
      throw new BusinessException("답변 내용을 입력해주세요.");
    }

    ProductInquiryRow row = productInquiryMapper.findById(inquiryId);
    if (row == null || row.getDeletedAt() != null) {
      throw new BusinessException("문의를 찾을 수 없습니다.");
    }

    int updated = productInquiryMapper.answer(inquiryId, req.getAnswerContent(), adminUserId, "ANSWERED");
    if (updated != 1) {
      throw new BusinessException("답변 등록에 실패했습니다.");
    }
  }

  public void clearAnswer(Long inquiryId) {
    ProductInquiryRow row = productInquiryMapper.findById(inquiryId);
    if (row == null || row.getDeletedAt() != null) {
      throw new BusinessException("문의를 찾을 수 없습니다.");
    }

    int updated = productInquiryMapper.clearAnswer(inquiryId, "OPEN");
    if (updated != 1) {
      throw new BusinessException("답변 삭제에 실패했습니다.");
    }
  }

  public void delete(Long inquiryId) {
    ProductInquiryRow row = productInquiryMapper.findById(inquiryId);
    if (row == null || row.getDeletedAt() != null) {
      throw new BusinessException("문의를 찾을 수 없습니다.");
    }

    int deleted = productInquiryMapper.softDeleteByAdmin(inquiryId);
    if (deleted != 1) {
      throw new BusinessException("문의 삭제에 실패했습니다.");
    }
  }

  private void normalizePaging(AdminProductInquiryListRequest req) {
    if (req == null) {
      throw new BusinessException("요청 값이 비어있습니다.");
    }

    if (req.getPage() == null || req.getPage() < 1) {
      req.setPage(1);
    }

    if (req.getSize() == null || req.getSize() < 1) {
      req.setSize(20);
    } else if (req.getSize() > 200) {
      req.setSize(200);
    }
  }
}
