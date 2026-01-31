package com.enfantTerrible.enfantTerrible.mapper.cart;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.enfantTerrible.enfantTerrible.dto.cart.CartItemExistRow;
import com.enfantTerrible.enfantTerrible.dto.cart.CartItemRow;
import com.enfantTerrible.enfantTerrible.dto.cart.CartSkuRow;

@Mapper
public interface CartMapper {

  Long findCartIdByUserId(@Param("userId") Long userId);

  int insertCart(@Param("userId") Long userId);

  CartSkuRow findSkuForCart(@Param("skuId") Long skuId);

  CartItemExistRow findCartItemByCartIdAndSkuId(
      @Param("cartId") Long cartId,
      @Param("skuId") Long skuId
  );

  int insertCartItem(
      @Param("cartId") Long cartId,
      @Param("skuId") Long skuId,
      @Param("quantity") int quantity
  );

  int updateCartItemQuantity(
      @Param("cartItemId") Long cartItemId,
      @Param("quantity") int quantity
  );

  CartItemRow findCartItemByCartIdAndCartItemId(
      @Param("cartId") Long cartId,
      @Param("cartItemId") Long cartItemId
  );

  int updateCartItemQuantityByCartIdAndCartItemId(
      @Param("cartId") Long cartId,
      @Param("cartItemId") Long cartItemId,
      @Param("quantity") int quantity
  );

  int increaseCartItemQuantity(
      @Param("cartItemId") Long cartItemId,
      @Param("delta") int delta
  );

  int deleteCartItem(@Param("cartId") Long cartId, @Param("cartItemId") Long cartItemId);

  int deleteAllCartItems(@Param("cartId") Long cartId);

  List<CartItemRow> findCartItems(@Param("cartId") Long cartId);
}
