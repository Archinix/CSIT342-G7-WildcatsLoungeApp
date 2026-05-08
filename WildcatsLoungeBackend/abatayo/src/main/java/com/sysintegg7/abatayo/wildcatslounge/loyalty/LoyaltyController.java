package com.sysintegg7.abatayo.wildcatslounge.loyalty;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/loyalty")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "https://csit-342-g7-wildcats-lounge-app.vercel.app"})
public class LoyaltyController {

    private final LoyaltyService loyaltyService;

    public LoyaltyController(LoyaltyService loyaltyService) {
        this.loyaltyService = loyaltyService;
    }

    @GetMapping("/status")
    public ResponseEntity<?> status(Authentication authentication) {
        LoyaltyStatusDTO status = loyaltyService.getStatus(authentication.getName());
        if (status == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        return ResponseEntity.ok(status);
    }

    @PostMapping("/redeem")
    public ResponseEntity<?> redeem(Authentication authentication, @Valid @RequestBody RedeemRequest request) {
        LoyaltyStatusDTO status = loyaltyService.redeem(authentication.getName(), request.getPoints());
        if (status == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Unable to redeem points");
        }
        return ResponseEntity.ok(status);
    }

    @PostMapping("/coupons")
    public ResponseEntity<?> generateCoupon(Authentication authentication, @Valid @RequestBody GenerateCouponRequest request) {
        CouponDTO coupon = loyaltyService.generateCoupon(authentication.getName(), request.getPointsToSpend());
        if (coupon == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Insufficient points to generate coupon");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(coupon);
    }

    @GetMapping("/vouchers/my-vouchers")
    public ResponseEntity<?> getAvailableVouchers(Authentication authentication) {
        return ResponseEntity.ok(loyaltyService.getAvailableCoupons(authentication.getName()));
    }

    @PutMapping("/coupons/{code}/apply")
    public ResponseEntity<?> applyCoupon(@PathVariable String code) {
        boolean applied = loyaltyService.applyCoupon(code);
        if (!applied) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Unable to apply coupon. It may be expired or already used.");
        }
        return ResponseEntity.ok(new java.util.HashMap<String, String>() {{
            put("message", "Coupon applied successfully");
            put("code", code);
        }});
    }
}
