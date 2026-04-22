package com.sysintegg7.abatayo.wildcatslounge.order;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long orderId;
    private String orderNumber;
    private String userEmail;
    private String customerName;
    private String status;
    private BigDecimal total;
    private String shippingAddress;
    private String createdAt;
    private List<OrderItemDTO> items;
}
