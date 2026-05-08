package com.sysintegg7.abatayo.wildcatslounge.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusNotification {
    private Long orderId;
    private String orderNumber;
    private String status;
    private String message;
    private Long userId;
    private String timestamp;
}
