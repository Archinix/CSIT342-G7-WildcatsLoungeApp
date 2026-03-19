package com.sysintegg7.abatayo.wildcatslounge.cart;

import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterEntity;
import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterRepository;
import com.sysintegg7.abatayo.wildcatslounge.product.ProductEntity;
import com.sysintegg7.abatayo.wildcatslounge.product.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final RegisterRepository registerRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       RegisterRepository registerRepository,
                       ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.registerRepository = registerRepository;
        this.productRepository = productRepository;
    }

    public CartDTO getCartByEmail(String email) {
        RegisterEntity user = registerRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return null;
        }

        CartEntity cart = getOrCreateCart(user);
        return toCartDTO(cart, user.getEmail());
    }

    public CartDTO addItem(String email, AddCartItemRequest request) {
        RegisterEntity user = registerRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return null;
        }

        ProductEntity product = productRepository.findById(request.getProductId()).orElse(null);
        if (product == null) {
            return null;
        }

        CartEntity cart = getOrCreateCart(user);
        List<CartItemEntity> items = cartItemRepository.findByCart(cart);
        Optional<CartItemEntity> existing = items.stream()
                .filter(i -> i.getProduct().getId().equals(product.getId()))
                .findFirst();

        if (existing.isPresent()) {
            CartItemEntity cartItem = existing.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
            cartItemRepository.save(cartItem);
        } else {
            CartItemEntity cartItem = new CartItemEntity(null, cart, product, request.getQuantity());
            cartItemRepository.save(cartItem);
        }

        return toCartDTO(cart, user.getEmail());
    }

    public boolean removeItem(String email, Long cartItemId) {
        RegisterEntity user = registerRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return false;
        }

        CartEntity cart = getOrCreateCart(user);
        CartItemEntity item = cartItemRepository.findById(cartItemId).orElse(null);

        if (item == null || !item.getCart().getId().equals(cart.getId())) {
            return false;
        }

        cartItemRepository.delete(item);
        return true;
    }

    public void clearCart(CartEntity cart) {
        cartItemRepository.deleteByCart(cart);
    }

    public CartEntity getOrCreateCart(RegisterEntity user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> cartRepository.save(new CartEntity(null, user, String.valueOf(System.currentTimeMillis()))));
    }

    public List<CartItemEntity> getCartItems(CartEntity cart) {
        return cartItemRepository.findByCart(cart);
    }

    private CartDTO toCartDTO(CartEntity cart, String email) {
        List<CartItemDTO> itemDTOs = cartItemRepository.findByCart(cart).stream()
                .map(this::toCartItemDTO)
                .toList();

        BigDecimal total = itemDTOs.stream()
                .map(CartItemDTO::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartDTO(cart.getId(), email, itemDTOs, total);
    }

    private CartItemDTO toCartItemDTO(CartItemEntity item) {
        BigDecimal lineTotal = item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return new CartItemDTO(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getPrice(),
                item.getQuantity(),
                lineTotal
        );
    }
}
