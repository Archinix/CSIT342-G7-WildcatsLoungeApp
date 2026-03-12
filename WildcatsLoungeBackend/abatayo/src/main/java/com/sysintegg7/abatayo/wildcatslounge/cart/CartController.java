package com.sysintegg7.abatayo.wildcatslounge.cart;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "http://localhost:5173")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<?> getCart(Authentication authentication) {
        CartDTO cart = cartService.getCartByEmail(authentication.getName());
        if (cart == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<?> addItem(Authentication authentication, @Valid @RequestBody AddCartItemRequest request) {
        CartDTO cart = cartService.addItem(authentication.getName(), request);
        if (cart == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid user or product");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(cart);
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<?> removeItem(Authentication authentication, @PathVariable Long id) {
        boolean removed = cartService.removeItem(authentication.getName(), id);
        if (!removed) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cart item not found");
        }
        return ResponseEntity.ok("Cart item removed");
    }
}
