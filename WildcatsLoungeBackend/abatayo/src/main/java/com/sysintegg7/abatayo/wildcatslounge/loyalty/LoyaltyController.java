package com.sysintegg7.abatayo.wildcatslounge.loyalty;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/loyalty")
@CrossOrigin(origins = "http://localhost:5173")
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
}
