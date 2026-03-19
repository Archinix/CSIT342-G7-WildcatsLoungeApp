package com.sysintegg7.abatayo.wildcatslounge.order;

import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterEntity;
import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterRepository;
import com.sysintegg7.abatayo.wildcatslounge.cart.CartEntity;
import com.sysintegg7.abatayo.wildcatslounge.cart.CartItemEntity;
import com.sysintegg7.abatayo.wildcatslounge.cart.CartService;
import com.sysintegg7.abatayo.wildcatslounge.loyalty.LoyaltyService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final RegisterRepository registerRepository;
    private final CartService cartService;
    private final LoyaltyService loyaltyService;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        RegisterRepository registerRepository,
                        CartService cartService,
                        LoyaltyService loyaltyService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.registerRepository = registerRepository;
        this.cartService = cartService;
        this.loyaltyService = loyaltyService;
    }

    public OrderDTO placeOrder(String email) {
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
                order.getStatus(),
                order.getTotal(),
            order.getShippingAddress(),
                order.getCreatedAt(),
                items
        );
    }
}
