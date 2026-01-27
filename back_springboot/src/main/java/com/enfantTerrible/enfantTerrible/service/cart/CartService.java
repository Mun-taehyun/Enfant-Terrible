package com.enfantTerrible.enfantTerrible.service.cart;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.common.enums.FileRefType;
import com.enfantTerrible.enfantTerrible.common.enums.FileRole;
import com.enfantTerrible.enfantTerrible.common.enums.SkuStatus;
import com.enfantTerrible.enfantTerrible.dto.cart.CartItemAddRequest;
import com.enfantTerrible.enfantTerrible.dto.cart.CartItemExistRow;
import com.enfantTerrible.enfantTerrible.dto.cart.CartItemResponse;
import com.enfantTerrible.enfantTerrible.dto.cart.CartItemRow;
import com.enfantTerrible.enfantTerrible.dto.cart.CartItemUpdateRequest;
import com.enfantTerrible.enfantTerrible.dto.cart.CartSkuRow;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.cart.CartMapper;
import com.enfantTerrible.enfantTerrible.mapper.product.ProductSkuOptionValueQueryMapper;
import com.enfantTerrible.enfantTerrible.service.file.FileQueryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

  private final CartMapper cartMapper;
  private final ProductSkuOptionValueQueryMapper skuOptionValueQueryMapper;
  private final FileQueryService fileQueryService;

  public void addItem(Long userId, CartItemAddRequest req) {

    int quantity = req.getQuantity() == null ? 0 : req.getQuantity();
    if (quantity < 1) {
      throw new BusinessException("수량은 1 이상이어야 합니다.");
    }

    // 1) SKU 존재/상태/재고 검증
    CartSkuRow sku = cartMapper.findSkuForCart(req.getSkuId());
    if (sku == null) {
      throw new BusinessException("SKU가 존재하지 않습니다.");
    }

    SkuStatus skuStatus = sku.getSkuStatus();
    if (skuStatus == null) {
      throw new BusinessException("SKU 상태값이 올바르지 않습니다.");
    }

    if (skuStatus != SkuStatus.ON_SALE) {
      throw new BusinessException("판매 중인 SKU만 담을 수 있습니다.");
    }

    if (sku.getStock() == null || sku.getStock() < quantity) {
      throw new BusinessException("재고가 부족합니다.");
    }

    // 2) 장바구니 확보
    Long cartId = ensureCartId(userId);

    // 3) 기존 담긴 SKU면 수량 증가, 아니면 insert
    CartItemExistRow exist =
        cartMapper.findCartItemByCartIdAndSkuId(cartId, req.getSkuId());

    if (exist == null) {
      if (cartMapper.insertCartItem(cartId, req.getSkuId(), quantity) == 0) {
        throw new BusinessException("장바구니 담기에 실패했습니다.");
      }
    } else {
      int newQty = exist.getQuantity() + quantity;
      if (sku.getStock() < newQty) {
        throw new BusinessException("재고가 부족합니다.");
      }
      if (cartMapper.increaseCartItemQuantity(exist.getCartItemId(), quantity) == 0) {
        throw new BusinessException("장바구니 담기에 실패했습니다.");
      }
    }
  }

  @Transactional(readOnly = true)
  public List<CartItemResponse> getItems(Long userId) {

    Long cartId = cartMapper.findCartIdByUserId(userId);
    if (cartId == null) {
      return java.util.List.of();
    }

    List<CartItemRow> rows = cartMapper.findCartItems(cartId);

    return rows.stream().map(row -> {

      CartItemResponse res = new CartItemResponse();
      res.setCartItemId(row.getCartItemId());
      res.setSkuId(row.getSkuId());
      res.setProductId(row.getProductId());
      res.setProductName(row.getProductName());

      res.setPrice(row.getPrice());
      res.setStock(row.getStock());
      res.setSkuStatus(row.getSkuStatus());
      res.setQuantity(row.getQuantity());

      res.setThumbnailUrl(
          fileQueryService.findFirstFileUrl(
              FileRefType.PRODUCT.getCode(),
              row.getProductId(),
              FileRole.THUMBNAIL.getCode()
          )
      );

      res.setOptionValueIds(
          skuOptionValueQueryMapper.findOptionValueIdsBySkuId(row.getSkuId())
      );

      // 구매 가능 여부 판단
      applyBuyableState(res);

      return res;
    }).toList();
  }


  public void updateItem(Long userId, Long cartItemId, CartItemUpdateRequest req) {

    int quantity = req.getQuantity() == null ? 0 : req.getQuantity();
    if (quantity < 1) {
      throw new BusinessException("수량은 1 이상이어야 합니다.");
    }

    Long cartId = cartMapper.findCartIdByUserId(userId);
    if (cartId == null) {
      throw new BusinessException("장바구니가 비어 있습니다.");
    }

    // 소유자 검증을 cartId + cartItemId로 처리
    List<CartItemRow> items = cartMapper.findCartItems(cartId);
    CartItemRow target = items.stream()
        .filter(i -> i.getCartItemId().equals(cartItemId))
        .findFirst()
        .orElse(null);

    if (target == null) {
      throw new BusinessException("수정할 장바구니 항목이 없습니다.");
    }

    // 재고 검증 (현재 SKU 기준)
    CartSkuRow sku = cartMapper.findSkuForCart(target.getSkuId());
    if (sku == null) {
      throw new BusinessException("SKU가 존재하지 않습니다.");
    }
    if (sku.getStock() == null || sku.getStock() < quantity) {
      throw new BusinessException("재고가 부족합니다.");
    }

    if (cartMapper.updateCartItemQuantity(cartItemId, quantity) == 0) {
      throw new BusinessException("수량 변경에 실패했습니다.");
    }
  }

  public void deleteItem(Long userId, Long cartItemId) {

    Long cartId = cartMapper.findCartIdByUserId(userId);
    if (cartId == null) {
      throw new BusinessException("장바구니가 비어 있습니다.");
    }

    if (cartMapper.deleteCartItem(cartId, cartItemId) == 0) {
      throw new BusinessException("삭제할 장바구니 항목이 없습니다.");
    }
  }

  public void clear(Long userId) {

    Long cartId = cartMapper.findCartIdByUserId(userId);
    if (cartId == null) {
      return;
    }

    cartMapper.deleteAllCartItems(cartId);
  }

  private Long ensureCartId(Long userId) {

    Long cartId = cartMapper.findCartIdByUserId(userId);
    if (cartId != null) {
      return cartId;
    }

    // 단순 구현: 없으면 생성
    // (user_id UNIQUE면 레이스 발생 시 예외 처리 필요하지만, 현재 단계에서는 이 정도로 OK)
    if (cartMapper.insertCart(userId) == 0) {
      throw new BusinessException("장바구니 생성에 실패했습니다.");
    }

    cartId = cartMapper.findCartIdByUserId(userId);
    if (cartId == null) {
      throw new BusinessException("장바구니 생성 후 조회 실패");
    }

    return cartId;
  }

  private void applyBuyableState(CartItemResponse res) {

    // 상태 불가
    if (res.getSkuStatus() != SkuStatus.ON_SALE) {
      res.setIsBuyable(false);
      res.setBuyableReason("SKU_STATUS_NOT_ON_SALE");
      return;
    }

    // 재고 없음
    if (res.getStock() == null || res.getStock() <= 0) {
      res.setIsBuyable(false);
      res.setBuyableReason("OUT_OF_STOCK");
      return;
    }

    // 수량 부족
    if (res.getStock() < res.getQuantity()) {
      res.setIsBuyable(false);
      res.setBuyableReason("STOCK_NOT_ENOUGH");
      return;
    }

    // 구매 가능
    res.setIsBuyable(true);
    res.setBuyableReason(null);
  }
}
