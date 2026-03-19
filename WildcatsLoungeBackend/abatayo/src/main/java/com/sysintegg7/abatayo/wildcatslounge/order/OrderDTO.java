package com.sysintegg7.abatayo.wildcatslounge.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long orderId;
    private String orderNumber;
    private String userEmail;
    private String status;
    private BigDecimal total;
    private String shippingAddress;
    private String createdAt;
    private List<OrderItemDTO> items;
}
