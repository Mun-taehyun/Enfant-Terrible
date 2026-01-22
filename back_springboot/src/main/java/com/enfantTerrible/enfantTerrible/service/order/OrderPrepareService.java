package com.enfantTerrible.enfantTerrible.service.order;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.SkuStatus;
import com.enfantTerrible.enfantTerrible.dto.cart.CartItemResponse;
import com.enfantTerrible.enfantTerrible.dto.order.OrderPrepareItemResponse;
import com.enfantTerrible.enfantTerrible.dto.order.OrderPrepareResponse;
import com.enfantTerrible.enfantTerrible.dto.product.ProductRow;
import com.enfantTerrible.enfantTerrible.dto.product.ProductSkuRow;
import com.enfantTerrible.enfantTerrible.dto.user.UserResponse;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.product.ProductMapper;
import com.enfantTerrible.enfantTerrible.mapper.product.ProductSkuOptionValueQueryMapper;
import com.enfantTerrible.enfantTerrible.mapper.product.ProductSkuQueryMapper;
import com.enfantTerrible.enfantTerrible.service.cart.CartService;
import com.enfantTerrible.enfantTerrible.service.file.FileQueryService;
import com.enfantTerrible.enfantTerrible.service.user.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderPrepareService {

  private static final String REF_TYPE_PRODUCT = "product";
  private static final String FILE_ROLE_THUMBNAIL = "THUMBNAIL";

  private final CartService cartService;
  private final UserService userService;

  private final ProductSkuQueryMapper skuQueryMapper;
  private final ProductSkuOptionValueQueryMapper skuOptionValueQueryMapper;
  private final ProductMapper productMapper;
  private final FileQueryService fileQueryService;

  public OrderPrepareResponse prepareFromCart(Long userId) {

    UserResponse user = userService.getMyInfo(userId);
    List<CartItemResponse> cartItems = cartService.getItems(userId);

    List<OrderPrepareItemResponse> items = cartItems.stream().map(c -> {
      OrderPrepareItemResponse r = new OrderPrepareItemResponse();
      r.setSkuId(c.getSkuId());
      r.setProductId(c.getProductId());
      r.setProductName(c.getProductName());
      r.setPrice(c.getPrice());
      r.setQuantity(c.getQuantity());
      r.setThumbnailUrl(c.getThumbnailUrl());
      r.setOptionValueIds(c.getOptionValueIds());
      r.setIsBuyable(c.getIsBuyable());
      r.setBuyableReason(c.getBuyableReason());
      return r;
    }).toList();

    long totalAmount = 0L;
    for (OrderPrepareItemResponse it : items) {
      if (Boolean.TRUE.equals(it.getIsBuyable())) {
        long price = it.getPrice() == null ? 0L : it.getPrice();
        int qty = it.getQuantity() == null ? 0 : it.getQuantity();
        totalAmount += price * qty;
      }
    }

    OrderPrepareResponse res = new OrderPrepareResponse();
    res.setUserId(userId);
    res.setReceiverName(user.getName());
    res.setReceiverPhone(user.getTel());
    res.setZipCode(user.getZipCode());
    res.setAddressBase(user.getAddressBase());
    res.setAddressDetail(user.getAddressDetail());
    res.setTotalAmount(totalAmount);
    res.setItems(items);

    return res;
  }

  public OrderPrepareResponse prepareDirect(
      Long userId,
      Long productId,
      List<Long> optionValueIds,
      Integer quantity
  ) {

    if (productId == null) {
      throw new BusinessException("productId가 필요합니다.");
    }

    int qty = quantity == null ? 0 : quantity;
    if (qty < 1) {
      throw new BusinessException("수량은 1 이상이어야 합니다.");
    }

    if (optionValueIds == null || optionValueIds.isEmpty()) {
      throw new BusinessException("옵션 선택이 필요합니다.");
    }

    ProductRow product = productMapper.findByIdForUser(productId);
    if (product == null) {
      throw new BusinessException("상품을 찾을 수 없습니다.");
    }

    ProductSkuRow sku = skuQueryMapper.findSkuByExactOptionMatch(productId, optionValueIds, optionValueIds.size());
    if (sku == null) {
      throw new BusinessException("해당 옵션 조합의 SKU를 찾을 수 없습니다.");
    }

    boolean isBuyable = true;
    String buyableReason = null;

    if (sku.getStatus() != SkuStatus.ON_SALE) {
      isBuyable = false;
      buyableReason = "SKU_STATUS_NOT_ON_SALE";
    } else if (sku.getStock() == null || sku.getStock() < qty) {
      isBuyable = false;
      buyableReason = "STOCK_NOT_ENOUGH";
    }

    String thumbnailUrl = fileQueryService.findFirstFileUrl(
        REF_TYPE_PRODUCT,
        productId,
        FILE_ROLE_THUMBNAIL
    );

    UserResponse user = userService.getMyInfo(userId);

    OrderPrepareItemResponse item = new OrderPrepareItemResponse();
    item.setSkuId(sku.getSkuId());
    item.setProductId(productId);
    item.setProductName(product.getName());
    item.setPrice(sku.getPrice());
    item.setQuantity(qty);
    item.setThumbnailUrl(thumbnailUrl);
    item.setOptionValueIds(skuOptionValueQueryMapper.findOptionValueIdsBySkuId(sku.getSkuId()));
    item.setIsBuyable(isBuyable);
    item.setBuyableReason(buyableReason);

    long totalAmount = 0L;
    if (Boolean.TRUE.equals(item.getIsBuyable())) {
      totalAmount = (item.getPrice() == null ? 0L : item.getPrice()) * (item.getQuantity() == null ? 0 : item.getQuantity());
    }

    OrderPrepareResponse res = new OrderPrepareResponse();
    res.setUserId(userId);
    res.setReceiverName(user.getName());
    res.setReceiverPhone(user.getTel());
    res.setZipCode(user.getZipCode());
    res.setAddressBase(user.getAddressBase());
    res.setAddressDetail(user.getAddressDetail());
    res.setTotalAmount(totalAmount);
    res.setItems(java.util.List.of(item));

    return res;
  }
}
