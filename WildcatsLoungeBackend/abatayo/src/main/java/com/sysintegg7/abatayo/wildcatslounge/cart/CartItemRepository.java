package com.sysintegg7.abatayo.wildcatslounge.cart;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItemEntity, Long> {
    List<CartItemEntity> findByCart(CartEntity cart);
    void deleteByCart(CartEntity cart);
}
