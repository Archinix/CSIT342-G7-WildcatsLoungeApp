package com.sysintegg7.abatayo.wildcatslounge.order;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class OrderWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public OrderWebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void notifyOrderStatusChange(OrderEntity order, String newStatus) {
        if (order == null || order.getUser() == null) {
            return;
        }

        String message = getMessageForStatus(newStatus);
        
        OrderStatusNotification notification = new OrderStatusNotification();
        notification.setOrderId(order.getId());
        notification.setOrderNumber(order.getOrderNumber());
        notification.setStatus(newStatus);
        notification.setMessage(message);
        notification.setUserId(order.getUser().getId());
        notification.setTimestamp(String.valueOf(System.currentTimeMillis()));

        // Send to user's personal topic
        String destination = "/topic/orders/" + order.getUser().getId();
        messagingTemplate.convertAndSend(destination, notification);
    }

    private String getMessageForStatus(String status) {
        return switch (status) {
            case "PENDING" -> "Your order has been received!";
            case "IN_PROGRESS" -> "Your order is being prepared...";
            case "READY" -> "Your coffee is ready for pickup!";
            case "COMPLETED" -> "Thank you for your order!";
            case "CANCELLED" -> "Your order has been cancelled.";
            default -> "Your order status has been updated.";
        };
    }
}
