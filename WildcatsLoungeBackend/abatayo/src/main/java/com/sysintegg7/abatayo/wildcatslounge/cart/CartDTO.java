package com.sysintegg7.abatayo.wildcatslounge.cart;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartDTO {
    private Long cartId;
    private String userEmail;
    private List<CartItemDTO> items;
    private BigDecimal total;
}
