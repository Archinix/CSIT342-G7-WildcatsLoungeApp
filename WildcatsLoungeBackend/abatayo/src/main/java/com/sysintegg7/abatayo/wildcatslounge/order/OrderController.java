package com.sysintegg7.abatayo.wildcatslounge.order;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<?> placeOrder(Authentication authentication, @RequestBody(required = false) PlaceOrderRequest request) {
        String customerName = request != null ? request.getCustomerName() : null;
        OrderDTO order = orderService.placeOrder(authentication.getName(), customerName);
        if (order == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Unable to place order. Ensure cart has items.");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getUserOrders(authentication.getName()));
    }

    @GetMapping("/active")
    public ResponseEntity<List<OrderDTO>> getActiveOrders() {
        return ResponseEntity.ok(orderService.getActiveOrders());
    }

    @GetMapping("/staff/queue")
    public ResponseEntity<List<OrderDTO>> getStaffQueue() {
        List<OrderDTO> pendingAndInProgress = orderService.getActiveOrders();
        return ResponseEntity.ok(pendingAndInProgress);
    }

    @PatchMapping("/staff/orders/{id}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody UpdateOrderStatusRequest request) {
        OrderDTO updatedOrder = orderService.updateOrderStatus(id, request.getStatus());
        if (updatedOrder == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Unable to update order status. Invalid order or transition.");
        }
        return ResponseEntity.ok(updatedOrder);
    }
}
