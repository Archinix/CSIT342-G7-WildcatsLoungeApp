package com.sysintegg7.abatayo.wildcatslounge.order;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterEntity;
import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterRepository;
import com.sysintegg7.abatayo.wildcatslounge.cart.CartEntity;
import com.sysintegg7.abatayo.wildcatslounge.cart.CartItemEntity;
import com.sysintegg7.abatayo.wildcatslounge.cart.CartService;
import com.sysintegg7.abatayo.wildcatslounge.loyalty.LoyaltyService;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final RegisterRepository registerRepository;
    private final CartService cartService;
    private final LoyaltyService loyaltyService;
    private final OrderWebSocketService webSocketService;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        RegisterRepository registerRepository,
                        CartService cartService,
                        LoyaltyService loyaltyService,
                        OrderWebSocketService webSocketService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.registerRepository = registerRepository;
        this.cartService = cartService;
        this.loyaltyService = loyaltyService;
        this.webSocketService = webSocketService;
    }

    public OrderDTO placeOrder(String email, String customerName) {
        RegisterEntity user = registerRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return null;
        }

        CartEntity cart = cartService.getOrCreateCart(user);
        List<CartItemEntity> cartItems = cartService.getCartItems(cart);
        if (cartItems.isEmpty()) {
            return null;
        }

        BigDecimal total = cartItems.stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String createdAt = String.valueOf(System.currentTimeMillis());
        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setOrderNumber("ORD-" + createdAt);
        order.setStatus("PENDING");
        order.setTotal(total);
        order.setShippingAddress("Pickup");
        order.setCustomerName(resolveCustomerName(user, customerName));
        order.setCreatedAt(createdAt);

        OrderEntity savedOrder = orderRepository.save(order);

        for (CartItemEntity cartItem : cartItems) {
            OrderItemEntity orderItem = new OrderItemEntity();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setProductName(cartItem.getProduct().getName());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(cartItem.getProduct().getPrice());
            orderItemRepository.save(orderItem);
        }

        int earnedPoints = total.intValue();
        loyaltyService.addPoints(user, earnedPoints, "POINTS_EARNED", "Order #" + savedOrder.getId());

        cartService.clearCart(cart);

        return toOrderDTO(savedOrder);
    }

    public List<OrderDTO> getUserOrders(String email) {
        RegisterEntity user = registerRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return List.of();
        }

        return orderRepository.findByUserOrderByIdDesc(user)
                .stream()
                .map(this::toOrderDTO)
                .toList();
    }

    public List<OrderDTO> getActiveOrders() {
        return orderRepository.findByStatus("PENDING")
                .stream()
                .map(this::toOrderDTO)
                .toList();
    }

    private OrderDTO toOrderDTO(OrderEntity order) {
        List<OrderItemDTO> items = orderItemRepository.findByOrder(order)
                .stream()
                .map(item -> new OrderItemDTO(
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
                ))
                .toList();

        return new OrderDTO(
                order.getId(),
            order.getOrderNumber(),
                order.getUser().getEmail(),
                order.getCustomerName(),
                order.getStatus(),
                order.getTotal(),
            order.getShippingAddress(),
                order.getCreatedAt(),
                items
        );
    }

    private String resolveCustomerName(RegisterEntity user, String requestedName) {
        if (requestedName != null && !requestedName.isBlank()) {
            return requestedName.trim();
        }

        String fullName = user.getFullName();
        if (fullName != null && !fullName.isBlank()) {
            return fullName.trim();
        }

        String email = user.getEmail();
        if (email == null || email.isBlank()) {
            return "Customer";
        }

        int atIndex = email.indexOf('@');
        return atIndex > 0 ? email.substring(0, atIndex) : email;
    }

    public OrderDTO updateOrderStatus(Long orderId, String newStatus) {
        java.util.Optional<OrderEntity> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return null;
        }

        OrderEntity order = orderOpt.get();
        
        // Validate status transition
        String currentStatus = order.getStatus();
        if (!isValidStatusTransition(currentStatus, newStatus)) {
            return null;
        }

        order.setStatus(newStatus);
        OrderEntity updatedOrder = orderRepository.save(order);
        
        // Send WebSocket notification to customer
        webSocketService.notifyOrderStatusChange(updatedOrder, newStatus);
        
        return toOrderDTO(updatedOrder);
    }

    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        java.util.Map<String, java.util.List<String>> validTransitions = new java.util.HashMap<>();
        validTransitions.put("PENDING", java.util.Arrays.asList("IN_PROGRESS", "CANCELLED"));
        validTransitions.put("IN_PROGRESS", java.util.Arrays.asList("READY", "PENDING"));
        validTransitions.put("READY", java.util.Arrays.asList("COMPLETED", "IN_PROGRESS"));
        validTransitions.put("COMPLETED", java.util.Arrays.asList());
        validTransitions.put("CANCELLED", java.util.Arrays.asList());

        return validTransitions.getOrDefault(currentStatus, java.util.List.of()).contains(newStatus);
    }

    public OrderEntity getOrderById(Long orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }
}
